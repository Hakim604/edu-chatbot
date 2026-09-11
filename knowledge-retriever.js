// ============================================================
//  KNOWLEDGE RETRIEVER & UNIFIED CONTEXT BUILDER — knowledge-retriever.js
//  Retrieval-Before-Generation Engine with 4-Tier Hierarchy:
//  1. OFFICIAL (البرنامج الرسمي) -> 2. TEXTBOOK (الكتاب المدرسي CNP) ->
//  3. TEACHER (وثائق الأستاذ) -> 4. GENERATED (المحتوى المقترح)
// ============================================================

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./knowledge_base', './pdf-reader'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const KB = require('./knowledge_base');
    const PDF = require('./pdf-reader');
    module.exports = factory(KB, PDF);
  } else {
    root.KnowledgeRetriever = factory(root.KnowledgeBase, root.PDFManager);
  }
}(typeof self !== 'undefined' ? self : this, function (KB, PDF) {

  const SOURCE_PRIORITIES = {
    OFFICIAL: 1,
    TEXTBOOK: 2,
    TEACHER: 3,
    GENERATED: 4
  };

  /**
   * Fine-grained search in indexed textbooks with 7-level ranking hierarchy:
   * 1. Lesson match
   * 2. Level match
   * 3. Subject match
   * 4. Chapter match
   * 5. Type match (activity, exercise, rule, chapter)
   * 6. Activity / Exercise number match (scoped to lesson + number)
   * 7. Keyword / normalized text match
   */
  async function searchTextbook({ level, subject, lesson, chapter, type, pageNumber, activityNumber, query, limit = 10, textbookId }) {
    let items = [];
    if (PDF && PDF.getTextbookActivitiesDB) {
      try {
        items = await PDF.getTextbookActivitiesDB(level, subject);
      } catch (e) {
        items = [];
      }
    }

    const norm = (s) => {
      if (!s) return '';
      let str = String(s).toLowerCase();
      str = str.replace(/[\u064B-\u0652]/g, '').replace(/[أإآ]/g, 'ا').replace(/ـ/g, '').replace(/ة\b/g, 'ه');
      return str.trim();
    };

    const targetLesson = norm(lesson);
    const targetChapter = norm(chapter);
    const targetLevel = norm(level);
    const targetSubject = norm(subject);
    const targetQuery = norm(query);

    // 1. Strict Page Filter if specified
    if (pageNumber !== undefined && pageNumber !== null && pageNumber !== '') {
      const pNum = Number(pageNumber);
      items = items.filter(it => it.pageNumber === pNum || (it.pages && it.pages.includes(pNum)));
    }

    // 2. Strict Activity/Exercise Number Filter if specified
    if (activityNumber !== undefined && activityNumber !== null && activityNumber !== '') {
      const actNum = Number(activityNumber);
      items = items.filter(it => it.number === actNum);
    }

    // 3. Filter by textbookId if provided
    if (textbookId) {
      items = items.filter(it => String(it.textbookId) === String(textbookId));
    }

    // 4. Calculate 7-level ranking score for each item
    const scored = items.map(item => {
      let score = 0;
      const itemTitleNorm = norm(item.title);
      const itemContentNorm = norm(item.content);
      const itemLessonNorm = norm(item.lesson);
      const itemChapterNorm = norm(item.chapter);
      const itemLevelNorm = norm(item.level);
      const itemSubjectNorm = norm(item.subject);

      // Level 1: Lesson match (+1000)
      if (targetLesson && (
        (itemLessonNorm && (itemLessonNorm.includes(targetLesson) || targetLesson.includes(itemLessonNorm))) ||
        (itemTitleNorm && itemTitleNorm.includes(targetLesson))
      )) {
        score += 1000;
      }

      // Level 2: Level match (+500)
      if (targetLevel && itemLevelNorm && (itemLevelNorm.includes(targetLevel) || targetLevel.includes(itemLevelNorm))) {
        score += 500;
      }

      // Level 3: Subject match (+300)
      if (targetSubject && itemSubjectNorm && (itemSubjectNorm.includes(targetSubject) || targetSubject.includes(itemSubjectNorm))) {
        score += 300;
      }

      // Level 4: Chapter match (+200)
      if (targetChapter && (
        (itemChapterNorm && (itemChapterNorm.includes(targetChapter) || targetChapter.includes(itemChapterNorm))) ||
        (itemTitleNorm && itemTitleNorm.includes(targetChapter))
      )) {
        score += 200;
      }

      // Level 5: Type match (+100)
      if (type && item.type === type) {
        score += 100;
      }

      // Level 6: Activity / Exercise Number match (+150 if lesson matches)
      if (activityNumber && item.number === Number(activityNumber)) {
        if (targetLesson && itemLessonNorm.includes(targetLesson)) {
          score += 150; // Lesson-scoped match
        } else {
          score += 50;
        }
      }

      // Level 7: Keyword / Normalized text match (+50 per term)
      if (targetQuery) {
        const terms = targetQuery.split(/\s+/).filter(t => t.length > 1);
        terms.forEach(term => {
          if (itemTitleNorm.includes(term)) score += 80;
          if (itemContentNorm.includes(term)) score += 30;
        });
      }

      return { item, score };
    });

    // Sort descending by score and filter out non-matching items if targetLesson specified
    let filteredScored = scored;
    if (targetLesson) {
      filteredScored = scored.filter(s => {
        const item = s.item;
        const itemLessonNorm = norm(item.lesson);
        const itemTitleNorm  = norm(item.title);
        const itemContentNorm= norm(item.content);
        return (itemLessonNorm && itemLessonNorm.includes(targetLesson)) ||
               (itemTitleNorm && itemTitleNorm.includes(targetLesson)) ||
               (itemContentNorm && itemContentNorm.includes(targetLesson));
      });
    }

    filteredScored.sort((a, b) => b.score - a.score);

    const results = filteredScored.map(s => s.item).slice(0, limit);
    return results;
  }

  /**
   * Context window optimizer for Gemini Prompting.
   * Pulls top-K relevant chunks, avoiding full PDF dumps.
   */
  async function getTopRelevantChunks({ textbookId, level, subject, lesson, query, maxTokens = 2000, maxChunks = 5 }) {
    const results = await searchTextbook({
      textbookId,
      level,
      subject,
      lesson,
      query: query || lesson,
      limit: maxChunks
    });

    let currentTokens = 0;
    const topChunks = [];

    for (const item of results) {
      const textLen = (item.content || '').length;
      const estimatedTokens = Math.ceil(textLen / 3);

      if (currentTokens + estimatedTokens > maxTokens && topChunks.length > 0) {
        break;
      }

      topChunks.push({
        id: item.id,
        textbookId: item.textbookId,
        pageNumber: item.pageNumber,
        pages: item.pages || [item.pageNumber],
        sectionType: item.type,
        title: item.title,
        content: item.content,
        confidence: item.classificationConfidence || (item.verified ? 1.0 : 0.0),
        verified: item.verified !== false
      });

      currentTokens += estimatedTokens;
    }

    return {
      chunks: topChunks,
      totalChunks: topChunks.length,
      estimatedTokens: currentTokens
    };
  }

  /**
   * Search across all 4 knowledge tiers for relevant pedagogical content
   */
  async function searchKnowledge({ level, subject, lesson, axis, query }) {
    const results = {
      official: null,
      textbookActivities: [],
      textbookExercises: [],
      teacherResources: [],
      generatedItems: []
    };

    const norm = (s) => (s || '').toLowerCase().trim();
    const qNorm = norm(query || lesson);

    // 1. OFFICIAL PROGRAMME LOOKUP
    if (KB && KB.findLesson) {
      const prog = KB.findLesson(level, subject, axis, lesson);
      if (prog) {
        results.official = prog;
      } else {
        const fullProg = KB.getProgrammes(level, subject);
        if (fullProg && fullProg.lessons) {
          const match = fullProg.lessons.find(l => {
            const lTitle = norm(l.title);
            const lAxis = norm(l.axis);
            return lTitle.includes(qNorm) || qNorm.includes(lTitle) || lAxis.includes(qNorm);
          });
          if (match) {
            results.official = {
              ...match,
              domain: fullProg.domain,
              sourceType: 'OFFICIAL',
              verified: true
            };
          }
        }
      }
    }

    // 2. TEXTBOOK ACTIVITIES, APPLICATIONS & EXERCISES (CNP Catalog + IndexedDB)
    results.textbookApplications = [];

    if (KB && KB.getTextbookActivities) {
      const catalogActs = KB.getTextbookActivities(level, subject, lesson || query);
      results.textbookActivities.push(...catalogActs);
    }
    if (KB && KB.getTextbookExercises) {
      const catalogExs = KB.getTextbookExercises(level, subject, lesson || query);
      results.textbookExercises.push(...catalogExs);
    }
    if (PDF && PDF.getTextbookActivitiesDB) {
      try {
        const dbActs = await PDF.getTextbookActivitiesDB(level, subject);

        // Tokenize query for flexible matching
        const stopWords = ['على', 'في', 'من', 'عن', 'إلى', 'مع', 'هذا', 'هذه', 'ذات', 'مجموعة', 'دراسة'];
        const tokens = qNorm.split(/\s+/).filter(t => t.length > 1 && !stopWords.includes(t));

        const filteredDBActs = dbActs.filter(a => {
          const titleNorm = norm(a.title);
          const chNorm    = norm(a.chapter);
          const lNorm     = norm(a.lesson);

          // Direct match
          if (titleNorm.includes(qNorm) || chNorm.includes(qNorm) || qNorm.includes(titleNorm) || (lNorm && lNorm.includes(qNorm))) {
            return true;
          }

          // Token overlap match (requires at least 1 significant word match)
          if (tokens.length > 0) {
            const hasTokenMatch = tokens.some(t => titleNorm.includes(t) || chNorm.includes(t) || (lNorm && lNorm.includes(t)));
            if (hasTokenMatch) return true;
          }

          return false;
        });

        filteredDBActs.forEach(act => {
          if (act.type === 'application') {
            results.textbookApplications.push(act);
          } else if (act.type === 'exercise') {
            results.textbookExercises.push(act);
          } else {
            results.textbookActivities.push(act);
          }
        });
      } catch (e) {
        // Fallback gracefully
      }
    }

    // 3. TEACHER RESOURCES
    if (PDF && PDF.getTeacherResourcesDB) {
      try {
        const teacherDocs = await PDF.getTeacherResourcesDB(level, subject, lesson);
        results.teacherResources.push(...teacherDocs);
      } catch (e) {}
    }
    if (KB && KB.getTeacherResources) {
      const kbTeacher = KB.getTeacherResources(level, subject);
      results.teacherResources.push(...kbTeacher);
    }

    // 4. GENERATED REPOSITORIES
    if (PDF && PDF.getGeneratedContentDB) {
      try {
        const genDocs = await PDF.getGeneratedContentDB(level, subject, lesson);
        results.generatedItems.push(...genDocs);
      } catch (e) {}
    }
    if (KB && KB.getGeneratedItems) {
      const kbGen = KB.getGeneratedItems(level, subject);
      results.generatedItems.push(...kbGen);
    }

    return results;
  }

  /**
   * Builds an enriched, structured pedagogical context block for Gemini Prompt
   */
  async function buildKnowledgeContext({ level, subject, lesson, axis, manualInput }) {
    const searchData = await searchKnowledge({ level, subject, lesson, axis, query: lesson });
    
    let contextText = '';
    const metadata = {
      level,
      subject,
      lesson,
      axis,
      hasOfficialProgramme: false,
      hasVerifiedTextbook: false,
      textbookPages: [],
      sources: []
    };

    contextText += `\n═══════════════════════════════════════════════════════════════\n`;
    contextText += `🏛️ السياق البيداغوجي المعتمد من بنك المعرفة التونسي\n`;
    contextText += `═══════════════════════════════════════════════════════════════\n`;

    // 1. OFFICIAL PROGRAMME BLOCK
    if (searchData.official) {
      metadata.hasOfficialProgramme = true;
      metadata.sources.push({ type: 'OFFICIAL', title: 'البرنامج الرسمي لوزارة التربية التونسية' });

      contextText += `\n[المصدر 1: 🟢 البرنامج الرسمي لوزارة التربية التونسية]\n`;
      contextText += `- المحور الرسمي: ${searchData.official.axis || axis}\n`;
      contextText += `- عنوان الوحدة/الدرس: ${searchData.official.title || lesson}\n`;
      if (searchData.official.domain) {
        contextText += `- المجال العام: ${searchData.official.domain}\n`;
      }
      if (searchData.official.competencies && searchData.official.competencies.length > 0) {
        contextText += `- الكفايات المستهدفة:\n  * ` + searchData.official.competencies.join('\n  * ') + `\n`;
      }
      if (searchData.official.objectives && searchData.official.objectives.length > 0) {
        contextText += `- الأهداف الإجرائية المميزة:\n  * ` + searchData.official.objectives.join('\n  * ') + `\n`;
      }
      if (searchData.official.prerequisites && searchData.official.prerequisites.length > 0) {
        contextText += `- المكتسبات القبلية الضرورية:\n  * ` + searchData.official.prerequisites.join('\n  * ') + `\n`;
      }
      if (searchData.official.notions && searchData.official.notions.length > 0) {
        contextText += `- المفاهيم والمصطلحات الأساسية: ` + searchData.official.notions.join(' ، ') + `\n`;
      }
    } else {
      contextText += `\n[المصدر 1: ⚪ البرنامج الرسمي: جاري التوليد وفق المنهاج التونسي المعياري]\n`;
    }

    // 2. TEXTBOOK ACTIVITIES & EXERCISES (CNP)
    if (searchData.textbookActivities.length > 0 || searchData.textbookExercises.length > 0) {
      metadata.hasVerifiedTextbook = true;
      contextText += `\n[المصدر 2: 🟢 نصوص وأنشطة وتمارين الكتاب المدرسي المعتمد (CNP)]\n`;
      contextText += `⚠️ تعليمات ملزمة: اعتمد هذه الأنشطة بنصها التونسي الدقيق دون تحريف:\n\n`;

      searchData.textbookActivities.forEach((act, idx) => {
        if (act.page || act.pageNumber) metadata.textbookPages.push(act.page || act.pageNumber);
        metadata.sources.push({ type: 'TEXTBOOK', title: act.title, page: act.page || act.pageNumber });
        contextText += `📍 ${act.title} (الصفحة ${act.page || act.pageNumber || 'غير محددة'}):\n${act.content}\n\n`;
      });

      searchData.textbookExercises.forEach((ex, idx) => {
        if (ex.page || ex.pageNumber) metadata.textbookPages.push(ex.page || ex.pageNumber);
        contextText += `📝 ${ex.title} (الصفحة ${ex.page || ex.pageNumber || 'غير محددة'}):\n${ex.content}\n\n`;
      });
    } else {
      contextText += `\n[المصدر 2: ⚠️ لا توجد أنشطة موثقة لهذا الدرس في كتالوج الكتاب المدرسي الحالي]\n`;
      contextText += `⚠️ قاعدة منع الهلوسة الصارمة: لا تختلق أرقام صفحات أو نصوص كتب مدرسية غير مؤكدة.\n`;
      contextText += `يجب عليك اقتراح نشاط استكشافي مبتكر وتسميته بوضوح: [نشاط مقترح - مولد بيداغوجياً].\n`;
    }

    // 3. TEACHER RESOURCES
    if (searchData.teacherResources.length > 0) {
      contextText += `\n[المصدر 3: 🔵 موارد وبطاقات بيداغوجية مضافة من قِبل الأستاذ]\n`;
      searchData.teacherResources.forEach(tr => {
        metadata.sources.push({ type: 'TEACHER', title: tr.title });
        contextText += `📌 ${tr.title}:\n${tr.content}\n\n`;
      });
    }

    // 4. MANUAL INPUT / TEACHER NOTES
    if (manualInput && manualInput.trim().length > 0) {
      contextText += `\n[المصدر 3+ : 🔵 توجيهات وملاحظات إضافية من الأستاذ مباشرة]:\n${manualInput.trim()}\n`;
    }

    contextText += `═══════════════════════════════════════════════════════════════\n`;

    return {
      contextText,
      metadata,
      searchData
    };
  }

  return {
    SOURCE_PRIORITIES,
    searchKnowledge,
    buildKnowledgeContext,
    searchTextbook,
    getTopRelevantChunks
  };
}));
