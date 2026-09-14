// ============================================================
//  STORAGE & PDF READER MANAGER — pdf-reader.js
//  IndexedDB for Textbooks (PDFs) + Archive of Generated Fiches/Summaries
//  Knowledge Base Multi-Store Schema (v3) + In-Memory Fallback
//  Advanced Mathematical Symbol Extraction & Bidi Parentheses Normalization
//  Pedagogical Structure Chunking: Activities, Exercises, Rules, Theorems
// ============================================================

const DB_NAME = "EduChatbotDB";
const DB_VERSION = 3;

// Store Identifiers
const STORE_BOOKS = "textbooks";
const STORE_DOCS  = "archive_documents";
const STORE_PROGRAMMES = "programmes";
const STORE_KNOWLEDGE_ITEMS = "knowledge_items";
const STORE_TEXTBOOK_PAGES = "textbook_pages";
const STORE_TEXTBOOK_ACTIVITIES = "textbook_activities";
const STORE_TEACHER_RESOURCES = "teacher_resources";
const STORE_GENERATED_CONTENT = "generated_content";
const STORE_SOURCE_METADATA = "source_metadata";

// In-memory fallback for environments without IndexedDB (e.g. Node tests / CLI)
const memoryStores = {
  [STORE_BOOKS]: new Map(),
  [STORE_DOCS]: new Map(),
  [STORE_PROGRAMMES]: new Map(),
  [STORE_KNOWLEDGE_ITEMS]: new Map(),
  [STORE_TEXTBOOK_PAGES]: new Map(),
  [STORE_TEXTBOOK_ACTIVITIES]: new Map(),
  [STORE_TEACHER_RESOURCES]: new Map(),
  [STORE_GENERATED_CONTENT]: new Map(),
  [STORE_SOURCE_METADATA]: new Map()
};

// ── INDEXEDDB SETUP (v3) ────────────────────────────────────
function openDB() {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // 1. Existing Legacy Stores
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        const docStore = db.createObjectStore(STORE_DOCS, { keyPath: "id" });
        docStore.createIndex("createdAt", "createdAt", { unique: false });
        docStore.createIndex("mode", "mode", { unique: false });
      }

      // 2. Official Programmes Store
      if (!db.objectStoreNames.contains(STORE_PROGRAMMES)) {
        const progStore = db.createObjectStore(STORE_PROGRAMMES, { keyPath: "id" });
        progStore.createIndex("level", "level", { unique: false });
        progStore.createIndex("subject", "subject", { unique: false });
      }

      // 3. Knowledge Items Unified Store
      if (!db.objectStoreNames.contains(STORE_KNOWLEDGE_ITEMS)) {
        const kStore = db.createObjectStore(STORE_KNOWLEDGE_ITEMS, { keyPath: "id" });
        kStore.createIndex("sourceType", "sourceType", { unique: false });
        kStore.createIndex("level_subject", ["level", "subject"], { unique: false });
      }

      // 4. Textbook Pages Store
      if (!db.objectStoreNames.contains(STORE_TEXTBOOK_PAGES)) {
        const tpStore = db.createObjectStore(STORE_TEXTBOOK_PAGES, { keyPath: "id" });
        tpStore.createIndex("book_page", ["bookId", "pageNum"], { unique: false });
      }

      // 5. Textbook Activities Store
      if (!db.objectStoreNames.contains(STORE_TEXTBOOK_ACTIVITIES)) {
        const actStore = db.createObjectStore(STORE_TEXTBOOK_ACTIVITIES, { keyPath: "id" });
        actStore.createIndex("level_subject", ["level", "subject"], { unique: false });
        actStore.createIndex("page", "page", { unique: false });
      }

      // 6. Teacher Resources Store
      if (!db.objectStoreNames.contains(STORE_TEACHER_RESOURCES)) {
        const trStore = db.createObjectStore(STORE_TEACHER_RESOURCES, { keyPath: "id" });
        trStore.createIndex("level_subject", ["level", "subject"], { unique: false });
        trStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // 7. Generated Content Store
      if (!db.objectStoreNames.contains(STORE_GENERATED_CONTENT)) {
        const genStore = db.createObjectStore(STORE_GENERATED_CONTENT, { keyPath: "id" });
        genStore.createIndex("level_subject", ["level", "subject"], { unique: false });
        genStore.createIndex("confidence", "confidence", { unique: false });
        genStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // 8. Source Metadata Store
      if (!db.objectStoreNames.contains(STORE_SOURCE_METADATA)) {
        db.createObjectStore(STORE_SOURCE_METADATA, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── GENERIC DB HELPERS WITH IN-MEMORY FALLBACK ──────────────
async function putItem(storeName, item) {
  if (!item || !item.id) {
    if (item && !item.id) item.id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  const db = await openDB();
  if (!db) {
    memoryStores[storeName].set(item.id, item);
    return item;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(item);
    tx.oncomplete = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllItems(storeName) {
  const db = await openDB();
  if (!db) {
    return Array.from(memoryStores[storeName].values());
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function getItemById(storeName, id) {
  const db = await openDB();
  if (!db) {
    return memoryStores[storeName].get(id) || null;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function deleteItemById(storeName, id) {
  const db = await openDB();
  if (!db) {
    memoryStores[storeName].delete(id);
    return true;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ── BOOK STORAGE OPERATIONS (Backwards Compatible) ──────────
async function saveBookToDB(book) { return putItem(STORE_BOOKS, book); }
async function getAllBooksFromDB() { return getAllItems(STORE_BOOKS); }
async function getBookFromDB(id) { return getItemById(STORE_BOOKS, id); }
async function deleteBookFromDB(id) { return deleteItemById(STORE_BOOKS, id); }

// ── ARCHIVE OF GENERATED DOCUMENTS (Backwards Compatible) ──
async function saveDocToArchive(doc) { return putItem(STORE_DOCS, doc); }
async function getAllDocsFromArchive() {
  const items = await getAllItems(STORE_DOCS);
  items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return items;
}
async function getDocFromArchive(id) { return getItemById(STORE_DOCS, id); }
async function deleteDocFromArchive(id) { return deleteItemById(STORE_DOCS, id); }

// ── TEACHER RESOURCES OPERATIONS ────────────────────────────
async function saveTeacherResourceDB(resource) {
  const item = {
    id: resource.id || `tr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    sourceType: 'TEACHER',
    level: resource.level || '',
    subject: resource.subject || '',
    lesson: resource.lesson || '',
    type: resource.type || 'fiche',
    title: resource.title || 'مورد بيداغوجي مضاف من قبل الأستاذ',
    content: resource.content || '',
    verified: true,
    createdAt: resource.createdAt || new Date().toISOString()
  };
  return putItem(STORE_TEACHER_RESOURCES, item);
}

async function getTeacherResourcesDB(level, subject, lesson) {
  const all = await getAllItems(STORE_TEACHER_RESOURCES);
  return all.filter(r => {
    if (level && r.level && r.level !== level) return false;
    if (subject && r.subject && r.subject !== subject) return false;
    if (lesson && r.lesson && !r.lesson.includes(lesson) && !lesson.includes(r.lesson)) return false;
    return true;
  });
}

async function deleteTeacherResourceDB(id) {
  return deleteItemById(STORE_TEACHER_RESOURCES, id);
}

// ── GENERATED CONTENT OPERATIONS ────────────────────────────
async function saveGeneratedContentDB(contentItem) {
  const item = {
    id: contentItem.id || `gen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    sourceType: 'GENERATED',
    level: contentItem.level || '',
    subject: contentItem.subject || '',
    lesson: contentItem.lesson || '',
    type: contentItem.type || 'activity_variant',
    title: contentItem.title || 'محتوى مولد بالذكاء الاصطناعي',
    content: contentItem.content || '',
    confidence: contentItem.confidence || 'AI_SUGGESTION',
    verified: false,
    createdAt: contentItem.createdAt || new Date().toISOString()
  };
  return putItem(STORE_GENERATED_CONTENT, item);
}

async function getGeneratedContentDB(level, subject, lesson) {
  const all = await getAllItems(STORE_GENERATED_CONTENT);
  return all.filter(g => {
    if (level && g.level && g.level !== level) return false;
    if (subject && g.subject && g.subject !== subject) return false;
    if (lesson && g.lesson && !g.lesson.includes(lesson) && !lesson.includes(g.lesson)) return false;
    return true;
  });
}

// ── TEXTBOOK ACTIVITIES & KNOWLEDGE ITEMS OPERATIONS ────────
// Helper level normalizer for store level filtering
function _normLvl(l) {
  if (!l) return '';
  const s = String(l).toLowerCase().trim();
  if (s === '7' || s === 'c7' || s.includes('7')) return 'c7';
  if (s === '8' || s === 'c8' || s.includes('8')) return 'c8';
  if (s === '9' || s === 'c9' || s.includes('9') || s.includes('3')) return 'c9';
  if (s === '1' || s === 'l1' || s.includes('1')) return 'l1';
  return s;
}

// ── TEXTBOOK ACTIVITIES & KNOWLEDGE ITEMS OPERATIONS ────────
async function saveTextbookActivitiesDB(activities) {
  if (!Array.isArray(activities) || activities.length === 0) return [];
  const items = activities.map(act => {
    const hasTbId = !!(act.textbookId || act.bookId);
    const hasPage = !!(act.page || act.pageNumber || act.pageStart);
    const isVerified = (act.verified !== false) && hasTbId && hasPage;

    return {
      id: act.id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sourceType: 'TEXTBOOK',
      textbookId: String(act.textbookId || act.bookId || ''),
      textbookTitle: act.textbookTitle || act.title || '',
      level: act.level || '',
      subject: act.subject || '',
      chapter: act.chapter || '',
      lesson: act.lesson || '',
      title: act.title || '',
      page: act.page || act.pageNumber || null,
      pageNumber: act.pageNumber || act.page || null,
      pageStart: act.pageStart || act.pageNumber || act.page || null,
      pageEnd: act.pageEnd || act.pageNumber || act.page || null,
      pages: act.pages || (act.page ? [act.page] : []),
      type: act.type || 'activity',
      number: act.number || null,
      content: act.content || '',
      verified: isVerified,
      classificationConfidence: act.classificationConfidence !== undefined ? act.classificationConfidence : (isVerified ? 1.0 : 0.0),
      createdAt: act.createdAt || new Date().toISOString()
    };
  });
  return await putItemsBatch(STORE_TEXTBOOK_ACTIVITIES, items);
}

async function putItemsBatch(storeName, items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const db = await openDB();
  if (!db) {
    items.forEach(item => {
      if (!item.id) item.id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      memoryStores[storeName].set(item.id, item);
    });
    return items;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    items.forEach(item => {
      if (!item.id) item.id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      store.put(item);
    });
    tx.oncomplete = () => {
      console.log(`[INDEXEDDB] Batch transaction on '${storeName}' completed successfully (${items.length} records).`);
      resolve(items);
    };
    tx.onerror = (e) => {
      console.error(`[INDEXEDDB ERROR] Batch transaction on '${storeName}' failed:`, tx.error || e);
      reject(tx.error || e);
    };
    tx.onabort = (e) => {
      console.error(`[INDEXEDDB ABORT] Batch transaction on '${storeName}' aborted:`, tx.error || e);
      reject(tx.error || new Error("Transaction aborted"));
    };
  });
}

async function saveTextbookPagesDB(pages) {
  if (!Array.isArray(pages) || pages.length === 0) return [];
  console.log(`[INDEX] saveTextbookPagesDB called with ${pages.length} page items.`);
  const items = pages.map(p => ({
    id: p.id || `page_${p.textbookId || p.bookId || 'tb'}_p${p.pageNum || p.pageNumber}`,
    bookId: String(p.bookId || p.textbookId || ''),
    textbookId: String(p.textbookId || p.bookId || ''),
    pageNum: Number(p.pageNum || p.pageNumber),
    pageNumber: Number(p.pageNumber || p.pageNum),
    level: p.level || '',
    subject: p.subject || '',
    title: p.title || '',
    text: p.text || p.content || p.rawText || '',
    content: p.content || p.text || p.rawText || '',
    sections: p.sections || [],
    activities: p.activities || [],
    rules: p.rules || [],
    examples: p.examples || [],
    exercises: p.exercises || [],
    concepts: p.concepts || [],
    keywords: p.keywords || [],
    createdAt: p.createdAt || new Date().toISOString()
  }));

  try {
    const saved = await putItemsBatch(STORE_TEXTBOOK_PAGES, items);
    console.log(`[INDEX] saveTextbookPagesDB completed! Saved ${saved.length} records to store 'textbook_pages'.`);
    return saved;
  } catch (err) {
    console.error(`[INDEX ERROR] saveTextbookPagesDB failed:`, err);
    throw err;
  }
}

async function getTextbookPagesDB(startPage, endPage, level, subject) {
  const all = await getAllItems(STORE_TEXTBOOK_PAGES);
  const start = Number(startPage) || 1;
  const end = Number(endPage) || start;
  
  return all.filter(p => {
    const pNum = Number(p.pageNum || p.pageNumber);
    if (isNaN(pNum)) return false;
    if (pNum < start || pNum > end) return false;
    if (level && p.level && _normLvl(p.level) !== _normLvl(level) && p.level !== level) return false;
    if (subject && p.subject && String(p.subject).toLowerCase() !== String(subject).toLowerCase() && !p.subject.includes(subject)) return false;
    return true;
  }).sort((a, b) => Number(a.pageNum || a.pageNumber) - Number(b.pageNum || b.pageNumber));
}

async function getTextbookActivitiesDB(level, subject) {
  const all = await getAllItems(STORE_TEXTBOOK_ACTIVITIES);
  return all.filter(a => {
    if (level && a.level && _normLvl(a.level) !== _normLvl(level) && a.level !== level) return false;
    if (subject && a.subject && String(a.subject).toLowerCase() !== String(subject).toLowerCase() && !a.subject.includes(subject)) return false;
    return true;
  });
}

async function deleteTextbookDataDB(textbookId) {
  if (!textbookId) return true;
  const targetId = String(textbookId);
  const db = await openDB();
  if (!db) {
    for (const [id, item] of memoryStores[STORE_TEXTBOOK_ACTIVITIES].entries()) {
      if (String(item.textbookId || item.bookId) === targetId) memoryStores[STORE_TEXTBOOK_ACTIVITIES].delete(id);
    }
    for (const [id, item] of memoryStores[STORE_TEXTBOOK_PAGES].entries()) {
      if (String(item.textbookId || item.bookId) === targetId) memoryStores[STORE_TEXTBOOK_PAGES].delete(id);
    }
    for (const [id, item] of memoryStores[STORE_BOOKS].entries()) {
      if (String(item.id || item.textbookId) === targetId) memoryStores[STORE_BOOKS].delete(id);
    }
    return true;
  }

  return new Promise((resolve, reject) => {
    const storesToClean = [STORE_BOOKS, STORE_TEXTBOOK_PAGES, STORE_TEXTBOOK_ACTIVITIES];
    if (db.objectStoreNames.contains(STORE_SOURCE_METADATA)) storesToClean.push(STORE_SOURCE_METADATA);

    const tx = db.transaction(storesToClean, "readwrite");

    // 1. Delete matching page records
    const pagesStore = tx.objectStore(STORE_TEXTBOOK_PAGES);
    const pagesReq = pagesStore.getAll();
    pagesReq.onsuccess = () => {
      (pagesReq.result || []).forEach(p => {
        if (String(p.textbookId || p.bookId || '') === targetId) {
          pagesStore.delete(p.id);
        }
      });
    };

    // 2. Delete matching activity records
    const actsStore = tx.objectStore(STORE_TEXTBOOK_ACTIVITIES);
    const actsReq = actsStore.getAll();
    actsReq.onsuccess = () => {
      (actsReq.result || []).forEach(a => {
        if (String(a.textbookId || a.bookId || '') === targetId) {
          actsStore.delete(a.id);
        }
      });
    };

    // 3. Delete matching book record
    const booksStore = tx.objectStore(STORE_BOOKS);
    const booksReq = booksStore.getAll();
    booksReq.onsuccess = () => {
      (booksReq.result || []).forEach(b => {
        if (String(b.id || b.textbookId || '') === targetId) {
          booksStore.delete(b.id);
        }
      });
    };

    // 4. Delete source metadata entry if present
    if (db.objectStoreNames.contains(STORE_SOURCE_METADATA)) {
      tx.objectStore(STORE_SOURCE_METADATA).delete(targetId);
    }

    tx.oncomplete = () => {
      console.log(`[INDEXEDDB] Atomically deleted textbook '${targetId}' and all associated pages & activities.`);
      resolve(true);
    };
    tx.onerror = (e) => {
      console.error(`[INDEXEDDB ERROR] Atomic delete for '${targetId}' failed:`, tx.error || e);
      reject(tx.error || e);
    };
    tx.onabort = (e) => {
      console.error(`[INDEXEDDB ABORT] Atomic delete for '${targetId}' aborted:`, tx.error || e);
      reject(tx.error || new Error("Transaction aborted"));
    };
  });
}

// ── MATHEMATICAL & BIDI TEXT NORMALIZER ─────────────────────
function normalizeExtractedMathText(rawText) {
  if (!rawText) return "";

  let text = rawText;

  // 1. Normalize spaces around mathematical punctuation
  text = text.replace(/([0-9a-zA-Z])\s*([,;])\s*([0-9a-zA-Z])/g, "$1 $2 $3");

  // 2. Fix inverted parentheses in Arabic context: e.g. ")3 , 2(" -> "(3 , 2)"
  text = text.replace(/\)\s*([0-9a-zA-Z+\-*\/\s,;.]+)\s*\(/g, "($1)");
  text = text.replace(/\]\s*([0-9a-zA-Z+\-*\/\s,;.]+)\s*\[/g, "[$1]");

  // 3. Normalize common mathematical Unicode symbols
  text = text.replace(/\u221A/g, " √ ")   // Square root
             .replace(/\u2264/g, " ≤ ")   // Less than or equal
             .replace(/\u2265/g, " ≥ ")   // Greater than or equal
             .replace(/\u2260/g, " ≠ ")   // Not equal
             .replace(/\u2208/g, " ∈ ")   // Element of
             .replace(/\u2209/g, " ∉ ")   // Not an element of
             .replace(/\u2282/g, " ⊂ ")   // Subset
             .replace(/\u2229/g, " ∩ ")   // Intersection
             .replace(/\u222A/g, " ∪ ")   // Union
             .replace(/\u22A5/g, " ⊥ ")   // Perpendicular
             .replace(/\u2225/g, " ∥ ")   // Parallel
             .replace(/\u2192/g, " → ")   // Right arrow
             .replace(/\u21D2/g, " ⇒ ")   // Implies
             .replace(/\u21D4/g, " ⇔ ")   // Equivalence
             .replace(/\u0394/g, " Δ ")   // Delta
             .replace(/\u03C0/g, " π ")   // Pi
             .replace(/\u03B1/g, " α ")   // Alpha
             .replace(/\u03B2/g, " β ")   // Beta
             .replace(/\u03B8/g, " θ ")   // Theta
             .replace(/\u221E/g, " ∞ ");  // Infinity

  // 4. Fix split exponents: e.g. "x 2" -> "x^2", "x 3" -> "x^3", "cm 2" -> "cm^2"
  text = text.replace(/\b([a-zA-Z])\s+([23456789])\b/g, "$1^$2");
  text = text.replace(/\b(cm|mm|m|dm|km)\s+([23])\b/gi, "$1^$2");

  // 5. Fix split negative numbers: e.g. "- 5" -> "-5"
  text = text.replace(/-\s+([0-9])/g, "-$1");

  // 6. Reduce multiple spaces
  text = text.replace(/[ \t]{2,}/g, " ");

  return text;
}

// ── PEDAGOGICAL STRUCTURE CHUNKER ───────────────────────────
function parsePedagogicalChunks(pageText, pageNum, docMeta = {}) {
  if (!pageText || typeof pageText !== 'string') return [];

  const chunks = [];
  const lines = pageText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  const patterns = {
    activity: /^(نشاط|النشاط|Activit[ée]|Situation\s*d'exploration)\s*(\d*|[\u0660-\u0669]*)/i,
    exercise: /^(تمرين|تطبيقات|تطبيق|مسألة|تمارين|Exercice|Application|Probl[èe]me)\s*(\d*|[\u0660-\u0669]*)/i,
    rule: /^(قاعدة|مبرهنة|خاصية|تعريف|حوصلة|تذكير|R[èe]gle|Th[ée]or[èe]me|Propri[ée]t[ée]|D[ée]finition|Retenons|Bilan)/i,
    chapter: /^(الباب|المحور|الفصل|الدرس|الوحدة|Chapitre|Unit[ée]|Le[çc]on)\s*(\d*|[\u0660-\u0669]*)/i
  };

  let currentChunk = null;

  function flushChunk() {
    if (currentChunk && currentChunk.content.trim().length > 0) {
      currentChunk.content = currentChunk.content.trim();
      chunks.push(currentChunk);
    }
    currentChunk = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let matchedType = null;
    if (patterns.activity.test(line)) {
      matchedType = 'activity';
    } else if (patterns.exercise.test(line)) {
      matchedType = 'exercise';
    } else if (patterns.rule.test(line)) {
      matchedType = 'rule';
    } else if (patterns.chapter.test(line)) {
      matchedType = 'chapter';
    }

    if (matchedType) {
      flushChunk();
      currentChunk = {
        id: `chunk_p${pageNum}_${chunks.length + 1}_${Math.random().toString(36).substr(2, 5)}`,
        type: matchedType,
        title: line,
        page: pageNum,
        level: docMeta.level || '',
        subject: docMeta.subject || '',
        textbookTitle: docMeta.title || '',
        sourceType: 'TEXTBOOK',
        verified: false,
        content: line + '\n',
        timestamp: new Date().toISOString()
      };
    } else {
      if (currentChunk) {
        currentChunk.content += line + '\n';
      } else {
        currentChunk = {
          id: `chunk_p${pageNum}_gen_${chunks.length + 1}`,
          type: 'general',
          title: `محتوى الصفحة ${pageNum}`,
          page: pageNum,
          level: docMeta.level || '',
          subject: docMeta.subject || '',
          textbookTitle: docMeta.title || '',
          sourceType: 'TEXTBOOK',
          verified: false,
          content: line + '\n',
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  flushChunk();
  return chunks;
}

function indexPDFDocument(pages, docMeta = {}) {
  if (!Array.isArray(pages)) return { indexedChunks: [], stats: {} };

  const allChunks = [];
  let totalActivities = 0;
  let totalExercises = 0;
  let totalRules = 0;

  pages.forEach(p => {
    const pageChunks = parsePedagogicalChunks(p.text, p.pageNum, docMeta);
    pageChunks.forEach(c => {
      if (c.type === 'activity') totalActivities++;
      if (c.type === 'exercise') totalExercises++;
      if (c.type === 'rule') totalRules++;
      allChunks.push(c);
    });
  });

  return {
    indexedChunks: allChunks,
    stats: {
      totalPages: pages.length,
      totalChunks: allChunks.length,
      totalActivities,
      totalExercises,
      totalRules
    }
  };
}

// ── PDF.JS TEXT EXTRACTION ──────────────────────────────────
async function extractTextFromPDF(arrayBuffer, onProgress, docMeta = {}) {
  const isBrowser = typeof window !== 'undefined';
  const pdfjs = isBrowser ? window.pdfjsLib : null;

  if (!pdfjs) {
    throw new Error("مكتبة PDF.js غير محملة. يرجى التأكد من الاتصال بالإنترنت.");
  }
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const pages = [];
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const rawPageText = textContent && textContent.items
      ? textContent.items.map((item) => item.str).join(" ").trim()
      : "";

    const normalizedText = normalizeExtractedMathText(rawPageText);

    pages.push({
      pageNum,
      pageNumber: pageNum,
      text: (normalizedText && normalizedText.length > 0) ? normalizedText : (rawPageText || `[صفحة ${pageNum}]`)
    });

    if (onProgress) {
      onProgress(pageNum, numPages);
    }
  }

  const indexResult = indexPDFDocument(pages, docMeta);

  return {
    numPages,
    pages,
    indexedChunks: indexResult.indexedChunks,
    indexStats: indexResult.stats,
    fullText: pages.map((p) => `[الصفحة ${p.pageNum}]:\n${p.text}`).join("\n\n"),
  };
}

// ── EXPORTS (Universal Module Pattern) ───────────────────────
const PDFManager = {
  DB_NAME,
  DB_VERSION,
  STORE_BOOKS,
  STORE_DOCS,
  STORE_PROGRAMMES,
  STORE_KNOWLEDGE_ITEMS,
  STORE_TEXTBOOK_PAGES,
  STORE_TEXTBOOK_ACTIVITIES,
  STORE_TEACHER_RESOURCES,
  STORE_GENERATED_CONTENT,
  STORE_SOURCE_METADATA,
  saveBookToDB,
  getAllBooksFromDB,
  getBookFromDB,
  deleteBookFromDB,
  saveDocToArchive,
  getAllDocsFromArchive,
  getDocFromArchive,
  deleteDocFromArchive,
  saveTeacherResourceDB,
  getTeacherResourcesDB,
  deleteTeacherResourceDB,
  saveGeneratedContentDB,
  getGeneratedContentDB,
  saveTextbookActivitiesDB,
  getTextbookActivitiesDB,
  saveTextbookPagesDB,
  getTextbookPagesDB,
  deleteTextbookDataDB,
  extractTextFromPDF,
  normalizeExtractedMathText,
  parsePedagogicalChunks,
  indexPDFDocument
};

if (typeof window !== 'undefined') {
  window.PDFManager = PDFManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFManager;
}
