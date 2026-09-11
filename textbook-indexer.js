// ============================================================
//  TEXTBOOK INDEXER ENGINE — textbook-indexer.js
//  Structural Segmentation, Multi-Page Merging, Math Normalization,
//  Classification Confidence Rating & Fine-Grained Indexing
// ============================================================

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./pdf-reader'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const PDF = require('./pdf-reader');
    module.exports = factory(PDF);
  } else {
    root.TextbookIndexer = factory(root.PDFManager);
  }
}(typeof self !== 'undefined' ? self : this, function (PDF) {

  /**
   * Normalizes text for bilingual search (Arabic & French) without mutating rawText.
   */
  function normalizeText(text, lang = 'ar') {
    if (!text || typeof text !== 'string') return '';

    let norm = text;

    // 1. Arabic Normalization (Tashkeel, Hamzas, Ta Marbouta)
    norm = norm.replace(/[\u064B-\u0652]/g, ''); // Tashkeel
    norm = norm.replace(/[أإآ]/g, 'ا');         // Hamzas
    norm = norm.replace(/ـ/g, '');               // Tatweel
    norm = norm.replace(/ة/g, 'ه');              // Ta Marbouta

    // 2. French Normalization (Accents & Case)
    norm = norm.toLowerCase();
    norm = norm.replace(/[éèêë]/g, 'e')
               .replace(/[àâ]/g, 'a')
               .replace(/[ùû]/g, 'u')
               .replace(/[îï]/g, 'i')
               .replace(/ç/g, 'c');

    // 3. Mathematical Symbol Normalization
    norm = norm.replace(/\u221A/g, ' √ ')
               .replace(/\u2264/g, ' ≤ ')
               .replace(/\u2265/g, ' ≥ ')
               .replace(/\u2260/g, ' ≠ ')
               .replace(/\u2208/g, ' ∈ ')
               .replace(/\u2282/g, ' ⊂ ');

    // 4. Inverted parentheses fix
    norm = norm.replace(/\)\s*([0-9a-zA-Z+\-*\/\s,;.]+)\s*\(/g, '($1)');

    // 5. Space normalization
    norm = norm.replace(/\s+/g, ' ').trim();

    return norm;
  }

  /**
   * Math symbol safety inspector: detects potential math parsing ambiguities
   */
  function auditMathSafety(rawText) {
    let warning = null;
    if (/\?[0-9]/.test(rawText) || /[\uFFFD]/.test(rawText)) {
      warning = "تحذير: توجد رموز غامضة أو غير معروفة أثناء استخراج الصيغ الرياضية";
    }
    return warning;
  }

  /**
   * Builds a normalized page record object
   */
  function buildPageRecord(textbookId, pageNumber, rawText, docMeta = {}) {
    const mathWarning = auditMathSafety(rawText);

    return {
      id: `page_${textbookId}_p${pageNumber}`,
      textbookId: String(textbookId),
      pageNumber: Number(pageNumber),
      level: docMeta.level || '',
      subject: docMeta.subject || '',
      schoolYear: docMeta.schoolYear || '2024/2025',
      title: docMeta.title || '',
      chapter: docMeta.chapter || '',
      lesson: docMeta.lesson || '',
      rawText: rawText || '',
      normalizedText: normalizeText(rawText),
      mathNormalizationWarning: mathWarning,
      indexedAt: new Date().toISOString()
    };
  }

  /**
   * Structural segmenter for a single page text
   */
  function segmentPageContent(pageRecord, activeSpanItem = null) {
    const rawText = pageRecord.rawText;
    const pageNum = pageRecord.pageNumber;
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const items = [];
    let currentItem = activeSpanItem ? { ...activeSpanItem } : null;

    const patterns = {
      activity: /^(نشاط|النشاط|Activit[ée]|Situation\s*d'exploration)\s*(\d*|[\u0660-\u0669]*)/i,
      exercise: /^(تمرين|تطبيقات|تطبيق|مسألة|تمارين|Exercice|Application|Probl[èe]me)\s*(\d*|[\u0660-\u0669]*)/i,
      rule: /^(قاعدة|مبرهنة|خاصية|تعريف|حوصلة|تذكير|R[èe]gle|Th[ée]or[èe]me|Propri[ée]t[ée]|D[ée]finition|Retenons|Bilan)/i,
      chapter: /^(الباب|المحور|الفصل|الدرس|الوحدة|Chapitre|Unit[ée]|Le[çc]on)\s*(\d*|[\u0660-\u0669]*)/i
    };

    function flushItem() {
      if (currentItem && currentItem.content.trim().length > 0) {
        currentItem.content = currentItem.content.trim();
        if (!currentItem.pages.includes(pageNum)) {
          currentItem.pages.push(pageNum);
        }
        currentItem.pageEnd = pageNum;
        items.push(currentItem);
      }
      currentItem = null;
    }

    let activeChapter = pageRecord.chapter || '';
    let activeLesson = pageRecord.lesson || '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let type = null;
      let number = null;
      let confidence = 0.0;

      const actMatch = line.match(patterns.activity);
      const exMatch  = line.match(patterns.exercise);
      const ruleMatch= line.match(patterns.rule);
      const chMatch  = line.match(patterns.chapter);

      if (actMatch) {
        type = 'activity';
        number = actMatch[2] ? (parseInt(actMatch[2], 10) || null) : null;
        confidence = actMatch[2] ? 1.0 : 0.8;
      } else if (exMatch) {
        type = 'exercise';
        number = exMatch[2] ? (parseInt(exMatch[2], 10) || null) : null;
        confidence = exMatch[2] ? 1.0 : 0.8;
      } else if (ruleMatch) {
        type = 'rule';
        number = null;
        confidence = 0.8;
      } else if (chMatch) {
        type = 'chapter';
        number = chMatch[2] ? (parseInt(chMatch[2], 10) || null) : null;
        confidence = 0.9;
        if (line.includes('الدرس') || line.includes('Leçon') || line.includes('الوحدة')) {
          activeLesson = line;
        } else {
          activeChapter = line;
        }
      }

      if (type) {
        // New item detected: flush previous item
        flushItem();
        currentItem = {
          id: `item_${pageRecord.textbookId}_p${pageNum}_${items.length + 1}_${Math.random().toString(36).substr(2, 4)}`,
          textbookId: pageRecord.textbookId,
          pageNumber: pageNum,
          pageStart: pageNum,
          pageEnd: pageNum,
          pages: [pageNum],
          level: pageRecord.level,
          subject: pageRecord.subject,
          chapter: activeChapter,
          lesson: activeLesson,
          textbookTitle: pageRecord.title,
          type: type,
          number: number,
          title: line,
          content: line + '\n',
          sourceType: 'TEXTBOOK',
          verified: true,
          classificationConfidence: confidence,
          indexedAt: new Date().toISOString()
        };
      } else {
        if (currentItem) {
          currentItem.content += line + '\n';
        } else {
          // Unclassified chunk
          currentItem = {
            id: `item_${pageRecord.textbookId}_p${pageNum}_unclass_${items.length + 1}`,
            textbookId: pageRecord.textbookId,
            pageNumber: pageNum,
            pageStart: pageNum,
            pageEnd: pageNum,
            pages: [pageNum],
            level: pageRecord.level,
            subject: pageRecord.subject,
            chapter: activeChapter,
            lesson: activeLesson,
            textbookTitle: pageRecord.title,
            type: 'unknown',
            number: null,
            title: `محتوى الصفحة ${pageNum}`,
            content: line + '\n',
            sourceType: 'TEXTBOOK',
            verified: false,
            classificationConfidence: 0.0,
            indexedAt: new Date().toISOString()
          };
        }
      }
    }

    // Return current open item if it might span to next page
    const openSpanItem = currentItem ? currentItem : null;
    flushItem();

    return {
      segmentedItems: items,
      openSpanItem
    };
  }

  /**
   * Main Textbook Indexer Pipeline: indexes pages & items, updates IndexedDB
   */
  async function indexTextbook(extractedPDF, docMeta = {}) {
    if (!extractedPDF || !Array.isArray(extractedPDF.pages)) {
      throw new Error("بيانات PDF غير صالحة أو لا تحتوي على صفحات.");
    }

    const textbookId = docMeta.id || docMeta.textbookId || `tb_${Date.now()}`;
    const pageRecords = [];
    const allSegmentedItems = [];

    const patterns = {
      activity: /^(نشاط|النشاط|Activit[ée]|Situation\s*d'exploration)\s*(\d*|[\u0660-\u0669]*)/i,
      application: /^(تطبيقات|تطبيق|Application)\s*(\d*|[\u0660-\u0669]*)/i,
      exercise: /^(تمرين|مسألة|تمارين|Exercice|Probl[èe]me)\s*(\d*|[\u0660-\u0669]*)/i,
      rule: /^(قاعدة|مبرهنة|خاصية|تعريف|حوصلة|تذكير|R[èe]gle|Th[ée]or[èe]me|Propri[ée]t[ée]|D[ée]finition|Retenons|Bilan)/i,
      chapter: /^(الباب|المحور|الفصل|الدرس|الوحدة|Chapitre|Unit[ée]|Le[çc]on)\s*(\d*|[\u0660-\u0669]*)/i
    };

    let currentItem = null;
    let totalActivities = 0;
    let totalApplications = 0;
    let totalExercises = 0;
    let totalRules = 0;
    let totalUnclassified = 0;

    function flushCurrentItem() {
      if (currentItem && currentItem.content.trim().length > 0) {
        currentItem.content = currentItem.content.trim();
        if (currentItem.type === 'activity') totalActivities++;
        else if (currentItem.type === 'application') totalApplications++;
        else if (currentItem.type === 'exercise') totalExercises++;
        else if (currentItem.type === 'rule') totalRules++;
        else if (currentItem.type === 'unknown') totalUnclassified++;

        allSegmentedItems.push(currentItem);
      }
      currentItem = null;
    }

    let activeChapter = docMeta.chapter || '';
    let activeLesson = docMeta.lesson || '';

    for (const p of extractedPDF.pages) {
      const pageRec = buildPageRecord(textbookId, p.pageNum, p.text, docMeta);
      pageRecords.push(pageRec);

      const lines = (p.text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);

      for (const line of lines) {
        let type = null;
        let number = null;
        let confidence = 0.0;

        const actMatch = line.match(patterns.activity);
        const appMatch = line.match(patterns.application);
        const exMatch  = line.match(patterns.exercise);
        const ruleMatch= line.match(patterns.rule);
        const chMatch  = line.match(patterns.chapter);

        if (actMatch) {
          type = 'activity';
          number = actMatch[2] ? (parseInt(actMatch[2], 10) || null) : null;
          confidence = actMatch[2] ? 1.0 : 0.8;
        } else if (appMatch) {
          type = 'application';
          number = appMatch[2] ? (parseInt(appMatch[2], 10) || null) : null;
          confidence = appMatch[2] ? 1.0 : 0.8;
        } else if (exMatch) {
          type = 'exercise';
          number = exMatch[2] ? (parseInt(exMatch[2], 10) || null) : null;
          confidence = exMatch[2] ? 1.0 : 0.8;
        } else if (ruleMatch) {
          type = 'rule';
          confidence = 0.8;
        } else if (chMatch) {
          type = 'chapter';
          confidence = 0.9;
          if (line.includes('الدرس') || line.includes('Leçon') || line.includes('الوحدة')) {
            activeLesson = line;
          } else {
            activeChapter = line;
          }
        }

        if (type) {
          flushCurrentItem();
          currentItem = {
            id: `item_${textbookId}_p${p.pageNum}_${allSegmentedItems.length + 1}`,
            textbookId,
            pageNumber: p.pageNum,
            pageStart: p.pageNum,
            pageEnd: p.pageNum,
            pages: [p.pageNum],
            level: docMeta.level || '',
            subject: docMeta.subject || '',
            chapter: activeChapter,
            lesson: activeLesson,
            textbookTitle: docMeta.title || '',
            type,
            number,
            title: line,
            content: line + '\n',
            sourceType: 'TEXTBOOK',
            verified: true,
            classificationConfidence: confidence,
            indexedAt: new Date().toISOString()
          };
        } else {
          if (currentItem) {
            currentItem.content += line + '\n';
            currentItem.pageEnd = p.pageNum;
            if (!currentItem.pages.includes(p.pageNum)) {
              currentItem.pages.push(p.pageNum);
            }
          }
        }
      }
    }
    flushCurrentItem();

    // Save Page Records and Segmented Items to IndexedDB
    if (PDF && PDF.saveTextbookActivitiesDB) {
      await PDF.saveTextbookActivitiesDB(allSegmentedItems);
    }

    const isFull = (pageRecords.length === extractedPDF.pages.length) && !docMeta.failedPages && docMeta.failedPages !== 0 ? true : (!docMeta.failedPages && pageRecords.length === extractedPDF.pages.length);
    const indexStats = {
      textbookId,
      totalPages: extractedPDF.pages.length,
      indexedPages: pageRecords.length,
      failedPages: docMeta.failedPages || 0,
      totalActivities,
      totalExercises,
      totalRules,
      totalUnclassified,
      status: (pageRecords.length === extractedPDF.pages.length && !docMeta.failedPages) ? 'FULL' : 'PARTIAL',
      indexedAt: new Date().toISOString()
    };

    return {
      textbookId,
      pageRecords,
      segmentedItems: allSegmentedItems,
      stats: indexStats
    };
  }

  /**
   * Re-indexes a textbook cleanly without duplicating records
   */
  async function reindexTextbook(textbookId, extractedPDF, docMeta = {}) {
    if (PDF && PDF.deleteTextbookDataDB) {
      await PDF.deleteTextbookDataDB(textbookId);
    }
    docMeta.textbookId = textbookId;
    return indexTextbook(extractedPDF, docMeta);
  }

  /**
   * Deletes textbook pages and items from storage
   */
  async function deleteTextbookData(textbookId) {
    if (PDF && PDF.deleteBookFromDB) {
      await PDF.deleteBookFromDB(textbookId);
    }
    if (PDF && PDF.deleteTextbookDataDB) {
      await PDF.deleteTextbookDataDB(textbookId);
    }
    return true;
  }

  return {
    normalizeText,
    auditMathSafety,
    buildPageRecord,
    segmentPageContent,
    indexTextbook,
    reindexTextbook,
    deleteTextbookData
  };
}));
