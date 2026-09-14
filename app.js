// ============================================================
//  TUNISIAN EDUCATIONAL AI PLATFORM — app.js
//  30-year Veteran Math Teacher & Inspector General Persona
//  Separated Cycles:
//    • 🏫 Collège (Éduc. de Base 7-8-9) : 100% Pure Arabic (No French subtitles)
//    • 🎓 Lycée (Secondaire 1-2-3-4 Bac) : 100% Pure French
//  5-Stage Progression: Remind → Activity → Rule → Application → Exercise
//  Direct PDF Download • Strict LTR Math KaTeX • Zero-Solution Mode
// ============================================================

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta";
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

// ── STATE ──────────────────────────────────────────────────
let currentCycle  = localStorage.getItem("edu_selected_cycle") || "college"; // "college" | "lycee"
let currentMode   = "summary";
let isGenerating  = false;
let currentBook   = null;
let currentDocObj = null;

// Dynamic item lists for each pedagogical stage
let remindData       = [];  // Stage 1: استحضر / Rappel
let activitiesData   = [];  // Stage 2: نشاط / Activité
let applicationsData = [];  // Stage 4: تطبيق / Application
let exercisesData    = [];  // Stage 5: تمرين / Exercice

// ── DOM REFS ───────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// Settings & API Key
const btnSettings      = $("btnSettings");
const settingsModal    = $("settingsModal");
const btnCloseSettings = $("btnCloseSettings");
const apiKeyInput      = $("apiKeyInput");
const btnToggleKey     = $("btnToggleKey");
const btnSaveKey       = $("btnSaveKey");

// Teacher Info
const teacherNameInput = $("teacherName");
const schoolNameInput  = $("schoolName");
const schoolYearInput  = $("schoolYear");

// Cycle Switcher
const btnCycleCollege = $("btnCycleCollege");
const btnCycleLycee   = $("btnCycleLycee");
const langLockedIcon  = $("langLockedIcon");
const langLockedText  = $("langLockedText");

// Section Labels (Dynamic by Cycle)
const lblLevel       = $("lblLevel");
const lblSubject     = $("lblSubject");
const lblUnit        = $("lblUnit");
const hintUnit       = $("hintUnit");
const lblLessonTitle = $("lblLessonTitle");
const secTitleRemind = $("secTitleRemind");
const btnTextRemind  = $("btnTextRemind");
const secTitleActivity=$("secTitleActivity");
const btnTextActivity= $("btnTextActivity");
const secTitleApp    = $("secTitleApp");
const btnTextApp     = $("btnTextApp");
const secTitleExercise=$("secTitleExercise");
const btnTextExercise= $("btnTextExercise");

// Curriculum inputs
const levelSelect   = $("levelSelect");
const subjectSelect = $("subjectSelect");
const unitInput     = $("unitInput");
const unitDatalist  = $("unitDatalist");
const outputLang    = $("outputLang");
const lessonTitle   = $("lessonTitle");

// Orientation
const sheetOrientation = $("sheetOrientation");
const badgeOrientation = $("badgeOrientation");

// Stage containers
const remindList       = $("remindList");
const activitiesList   = $("activitiesList");
const applicationsList = $("applicationsList");
const exercisesList    = $("exercisesList");

// Add buttons
const btnAddRemind      = $("btnAddRemind");
const btnAddActivity    = $("btnAddActivity");
const btnAddApplication = $("btnAddApplication");
const btnAddExercise    = $("btnAddExercise");

// Textbook / PDF
const savedBooksSelect = $("savedBooksSelect");
const btnDeleteBook    = $("btnDeleteBook");
const pdfDropzone      = $("pdfDropzone");
const pdfFileInput     = $("pdfFileInput");
const btnBrowsePDF     = $("btnBrowsePDF");
const pdfProgressBox   = $("pdfProgressBox");
const pdfProgressBar   = $("pdfProgressBar");
const pdfProgressText  = $("pdfProgressText");
const activeBookCard   = $("activeBookCard");
const activeBookTitle  = $("activeBookTitle");
const activeBookMeta   = $("activeBookMeta");
const pageFrom         = $("pageFrom");
const pageTo           = $("pageTo");
const btnUseAllPages   = $("btnUseAllPages");

// Tabs & Panels
const tabs               = document.querySelectorAll(".tab");
const creatorPanel       = $("creatorPanel");
const archivePanel       = $("archivePanel");
const archiveBadgeCount  = $("archiveBadgeCount");
const archiveSearchInput = $("archiveSearchInput");
const archiveFilterType  = $("archiveFilterType");
const archiveGrid        = $("archiveGrid");

// Generation & Output
const btnGenerate       = $("btnGenerate");
const btnIcon           = $("btnIcon");
const btnText           = $("btnText");
const outputPanel       = $("outputPanel");
const outputTitle       = $("outputTitle");
const outputBody        = $("outputBody");
const printableSheet    = $("printableSheet");
const bannerSchoolName  = $("bannerSchoolName");
const bannerYear        = $("bannerYear");
const bannerLessonBadge = $("bannerLessonBadge");
const bannerTeacherName = $("bannerTeacherName");
const bannerSubjectLevel= $("bannerSubjectLevel");
const footerTeacherText = $("footerTeacherText");
const footerSchoolText  = $("footerSchoolText");
const loadingPanel      = $("loadingPanel");
const loadingDots       = $("loadingDots");
const errorPanel        = $("errorPanel");
const errorMsg          = $("errorMsg");

// Export & Extra Buttons
const btnSaveToArchive          = $("btnSaveToArchive");
const btnGenerateVariant        = $("btnGenerateVariant");
const btnDownloadPDF            = $("btnDownloadPDF");
const btnDownloadImg            = $("btnDownloadImg");
const btnPrint                  = $("btnPrint");
const btnCopy                   = $("btnCopy");
const btnNew                    = $("btnNew");
const btnCreateProposedActivity = $("btnCreateProposedActivity");
const btnReindexBook            = $("btnReindexBook");
const btnRegenerateFiche        = $("btnRegenerateFiche");

// ── INIT APPLICATION ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  initApiKey();
  initTeacherInfo();
  initCycleSwitcher();
  initCurriculumSelectors();
  initStageManagers();
  initOrientationToggle();
  await loadSavedBooksList();
  await refreshArchiveGallery();
  initPDFEvents();
  initArchiveEvents();
  initExportEvents();

  showView("creator");

  // Register PWA Service Worker for Mobile
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((err) => console.log("SW Reg:", err));
  }
});

// ── VIEW SWITCHER (MUTUAL EXCLUSION) ───────────────────────
function showView(view) {
  if (view === "creator") {
    creatorPanel.hidden = false;
    creatorPanel.style.display = "block";
    archivePanel.hidden = true;
    archivePanel.style.display = "none";
    outputPanel.hidden  = true;
    outputPanel.style.display = "none";
    loadingPanel.hidden = true;
    loadingPanel.style.display = "none";
  } else if (view === "archive") {
    creatorPanel.hidden = true;
    creatorPanel.style.display = "none";
    archivePanel.hidden = false;
    archivePanel.style.display = "flex";
    outputPanel.hidden  = true;
    outputPanel.style.display = "none";
    loadingPanel.hidden = true;
    loadingPanel.style.display = "none";
  } else if (view === "output") {
    creatorPanel.hidden = true;
    creatorPanel.style.display = "none";
    archivePanel.hidden = true;
    archivePanel.style.display = "none";
    outputPanel.hidden  = false;
    outputPanel.style.display = "block";
    loadingPanel.hidden = true;
    loadingPanel.style.display = "none";
  }
}

// ── TEACHER & SCHOOL LOCAL STORAGE ─────────────────────────
function initTeacherInfo() {
  teacherNameInput.value = localStorage.getItem("edu_teacher_name") || "";
  schoolNameInput.value  = localStorage.getItem("edu_school_name")  || "";
  schoolYearInput.value  = localStorage.getItem("edu_school_year")  || "2025 / 2026";
  const save = () => {
    localStorage.setItem("edu_teacher_name", teacherNameInput.value.trim());
    localStorage.setItem("edu_school_name",  schoolNameInput.value.trim());
    localStorage.setItem("edu_school_year",  schoolYearInput.value.trim());
  };
  teacherNameInput.addEventListener("input", save);
  schoolNameInput.addEventListener("input", save);
  schoolYearInput.addEventListener("input", save);
}

// ── API KEY ─────────────────────────────────────────────────
function getApiKey() { return localStorage.getItem("edu_gemini_key") || ""; }

function initApiKey() {
  apiKeyInput.value = getApiKey();
  btnSettings.addEventListener("click", () => {
    apiKeyInput.value = getApiKey();
    settingsModal.hidden = false;
  });
  btnCloseSettings.addEventListener("click", () => { settingsModal.hidden = true; });
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.hidden = true;
  });
  btnToggleKey.addEventListener("click", () => {
    apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
  });
  btnSaveKey.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (!key) { alert("الرجاء إدخال مفتاح API صالح"); return; }
    localStorage.setItem("edu_gemini_key", key);
    settingsModal.hidden = true;
    showToast("✅ تم حفظ المفتاح بنجاح");
  });
}

// ── ORIENTATION TOGGLE ──────────────────────────────────────
function initOrientationToggle() {
  sheetOrientation.addEventListener("change", () => {
    const isLandscape = sheetOrientation.value === "landscape";
    printableSheet.classList.toggle("sheet-landscape", isLandscape);
    badgeOrientation.textContent = isLandscape ? "A4 Paysage / Landscape" : "A4 Portrait";
  });
}

// ── CYCLE SWITCHER (COLLEGE VS LYCÉE) ──────────────────────
function initCycleSwitcher() {
  btnCycleCollege.addEventListener("click", () => setCycle("college"));
  btnCycleLycee.addEventListener("click",   () => setCycle("lycee"));
  setCycle(currentCycle, false);
}

function setCycle(cycle, refresh = true) {
  currentCycle = cycle;
  localStorage.setItem("edu_selected_cycle", cycle);

  if (cycle === "college") {
    btnCycleCollege.classList.add("active");
    btnCycleLycee.classList.remove("active");
  } else {
    btnCycleLycee.classList.add("active");
    btnCycleCollege.classList.remove("active");
  }

  updateLevelsDropdown();
  updateSubjectsDropdown();
  updateUnitsDatalist();
  applySubjectLanguage(subjectSelect.value || "math");
}

function applySubjectLanguage(subjectId) {
  const lang = CURRICULUM.getSubjectLang(subjectId, currentCycle) || (currentCycle === "lycee" && !["ar", "philo"].includes(subjectId) ? "fr" : "ar");
  outputLang.value = lang;

  if (lang === "fr") {
    langLockedIcon.textContent = "🇫🇷";
    langLockedText.textContent = "Français (Programme officiel tunisien)";

    lblLevel.textContent       = currentCycle === "college" ? "🏫 Niveau (Enseignement de base)" : "🏫 Niveau et Section (Enseignement Secondaire)";
    lblSubject.textContent     = "📚 Matière d'enseignement";
    lblUnit.innerHTML          = '📦 Chapitre / Unité pédagogique <span class="hint">Saisir le chapitre ou choisir parmi les propositions</span>';
    lblLessonTitle.textContent = "📖 Titre de la leçon ou de la séance";
    lessonTitle.placeholder    = "Ex: Continuité et Limites, Nombres Complexes, Réactions chimiques...";

    secTitleRemind.textContent   = "1. Étape « Rappel » (Prérequis et diagnostic)";
    btnTextRemind.textContent    = "Ajouter un rappel de prérequis";
    secTitleActivity.textContent = "2. Étape « Activité » (Exploration et construction du concept)";
    btnTextActivity.textContent  = "Ajouter une activité d'exploration";
    secTitleApp.textContent      = "4. Étape « Application » (Fixation immédiate)";
    btnTextApp.textContent       = "Ajouter une application directe";
    secTitleExercise.textContent = "5. Étape « Exercice » (Entraînement et devoir maison)";
    btnTextExercise.textContent  = "Ajouter un exercice d'entraînement";
  } else if (lang === "en") {
    langLockedIcon.textContent = "🇬🇧";
    langLockedText.textContent = "English (Official Tunisian Curriculum)";

    lblLevel.textContent       = currentCycle === "college" ? "🏫 Grade Level (Basic Education)" : "🏫 Grade Level & Section (Secondary)";
    lblSubject.textContent     = "📚 Subject";
    lblUnit.innerHTML          = '📦 Unit / Module <span class="hint">Type the module or select from official suggestions</span>';
    lblLessonTitle.textContent = "📖 Lesson Title or Topic";
    lessonTitle.placeholder    = "Ex: Present Perfect, Teen Issues, The Media and Communication...";

    secTitleRemind.textContent   = "1. Step « Warm-up » (Prerequisites & Review)";
    btnTextRemind.textContent    = "Add a Warm-up item";
    secTitleActivity.textContent = "2. Step « Presentation / Exploration » (Concept Building)";
    btnTextActivity.textContent  = "Add an Exploration activity";
    secTitleApp.textContent      = "4. Step « Practice » (Controlled Practice & Application)";
    btnTextApp.textContent       = "Add a Practice task";
    secTitleExercise.textContent = "5. Step « Production » (Free Production & Homework)";
    btnTextExercise.textContent  = "Add a Production / Homework task";
  } else {
    langLockedIcon.textContent = "🇹🇳";
    langLockedText.textContent = "العربية 100% (المنهاج التونسي الرسمي)";

    lblLevel.textContent       = currentCycle === "college" ? "🏫 المستوى الدراسي (التعليم الأساسي)" : "🏫 المستوى والشعبة (التعليم الثانوي)";
    lblSubject.textContent     = "📚 المادة التعليمية";
    lblUnit.innerHTML          = '📦 المحور / الوحدة البيداغوجية <span class="hint">اكتب المحور أو اختر من المقترحات الرسمية</span>';
    lblLessonTitle.textContent = "📖 عنوان الدرس أو النشاط";
    lessonTitle.placeholder    = "مثال: مبرهنة طالس في المثلث، التعيين في المستوي، الأعداد الحقيقية...";

    secTitleRemind.textContent   = "1. مرحلة «استحضر» (المكتسبات القبلية والتذكير)";
    btnTextRemind.textContent    = "إضافة عنصر في مرحلة «استحضر»";
    secTitleActivity.textContent = "2. مرحلة «نشاط» (الاستكشاف وبناء المفهوم)";
    btnTextActivity.textContent  = "إضافة نشاط استكشافي آخر";
    secTitleApp.textContent      = "4. مرحلة «تطبيق» (التثبيت الفوري)";
    btnTextApp.textContent       = "إضافة تطبيق فوري آخر";
    secTitleExercise.textContent = "5. مرحلة «تمرين» (العمل الفردي والواجب المنزلي)";
    btnTextExercise.textContent  = "إضافة تمرين أو واجب منزلي آخر";
  }
}

function updateLevelsDropdown() {
  levelSelect.innerHTML = currentCycle === "college"
    ? '<option value="">-- اختر المستوى الإعدادي --</option>'
    : '<option value="">-- Sélectionner le niveau / section --</option>';

  const levels = CURRICULUM.getLevelsByCycle(currentCycle);
  levels.forEach((lvl) => {
    const opt = document.createElement("option");
    opt.value = lvl.id;
    opt.textContent = lvl.label;
    levelSelect.appendChild(opt);
  });

  if (levels.length > 0) {
    levelSelect.value = levels[0].id;
  }
}

function updateSubjectsDropdown() {
  subjectSelect.innerHTML = currentCycle === "college"
    ? '<option value="">-- اختر المادة التعليمية --</option>'
    : '<option value="">-- Sélectionner la matière --</option>';

  const subjects = CURRICULUM.getSubjects(currentCycle);
  subjects.forEach((subj) => {
    const opt = document.createElement("option");
    opt.value = subj.id;
    opt.textContent = subj.label;
    if (subj.id === "math") opt.selected = true;
    subjectSelect.appendChild(opt);
  });
}

function updateUnitsDatalist() {
  const levelId   = levelSelect.value;
  const subjectId = subjectSelect.value;
  unitDatalist.innerHTML = "";
  if (!levelId || !subjectId) return;
  const units = CURRICULUM.getUnits(levelId, subjectId);
  if (units && units.length > 0) {
    units.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u;
      unitDatalist.appendChild(opt);
    });
    unitInput.value = units[0];
  } else {
    unitInput.value = "";
  }
}

// ── KNOWLEDGE BASE SOURCES CARD CONTROLLER ──────────────────
async function updateKnowledgeSourcesCard() {
  const levelId   = levelSelect ? levelSelect.value : "";
  const subjectId = subjectSelect ? subjectSelect.value : "";
  const unitVal   = unitInput ? unitInput.value.trim() : "";
  const titleVal  = lessonTitle ? lessonTitle.value.trim() : "";

  const kbProgStatus     = $("kbProgStatus");
  const kbTextbookStatus = $("kbTextbookStatus");
  const kbTeacherStatus  = $("kbTeacherStatus");
  const kbAIStatus       = $("kbAIStatus");
  const kbSearchStatus   = $("kbSearchStatus");
  const kbWarningBox     = $("kbWarningBox");
  const kbWarningText    = $("kbWarningText");

  if (!kbProgStatus) return;

  if (!levelId || !subjectId || (!titleVal && !unitVal)) {
    kbProgStatus.textContent     = "في انتظار اختيار الدرس";
    kbTextbookStatus.textContent = "في انتظار اختيار الدرس";
    kbTeacherStatus.textContent  = "0 موارد متاحة";
    kbSearchStatus.textContent   = "في انتظار الإدخال...";
    if (kbWarningBox) kbWarningBox.hidden = true;
    return;
  }

  kbSearchStatus.textContent = "جاري البحث في بنك المعرفة...";

  try {
    if (typeof KnowledgeRetriever !== "undefined" && KnowledgeRetriever.searchKnowledge) {
      const searchRes = await KnowledgeRetriever.searchKnowledge({
        level: levelId,
        subject: subjectId,
        lesson: titleVal,
        axis: unitVal,
        query: titleVal || unitVal
      });

      // 1. Official Programme
      if (searchRes.official) {
        kbProgStatus.innerHTML = '<span style="color:#15803d; font-weight:600;">✓ متوفر (الكفايات والأهداف مطابقة)</span>';
      } else {
        kbProgStatus.innerHTML = '<span style="color:#b45309;">⚠️ غير مدرج بالبرنامج الرسمي الأولي (سيتم التوليد وفق المنهاج التونسي العام)</span>';
      }

      // 2. Textbook Activities & Pages Range State
      const fromP = parseInt(pageFrom ? pageFrom.value : "", 10);
      const toP   = parseInt(pageTo ? pageTo.value : "", 10);
      const hasPageRange = !isNaN(fromP) && fromP > 0;

      let hasIndexedPages = false;
      let dbPagesCount = 0;
      if (currentBook && window.PDFManager && window.PDFManager.getTextbookPagesDB) {
        try {
          const dbPages = await window.PDFManager.getTextbookPagesDB(1, 9999);
          const bookPages = dbPages.filter(p => !p.textbookId || String(p.textbookId) === String(currentBook.id));
          dbPagesCount = bookPages.length;
          if (hasPageRange) {
            const endP = !isNaN(toP) ? toP : fromP;
            const rangePages = bookPages.filter(p => p.pageNum >= fromP && p.pageNum <= endP);
            hasIndexedPages = rangePages.length > 0;
          } else {
            hasIndexedPages = dbPagesCount > 0;
          }
        } catch (dbErr) {
          console.warn("[TEXTBOOK] Error checking IndexedDB pages:", dbErr);
        }
      }

      if (hasIndexedPages) {
        let pagesText = "";
        if (hasPageRange) {
          const endP = !isNaN(toP) ? toP : fromP;
          pagesText = (fromP === endP) ? `ص ${fromP}` : `ص ${fromP}–${endP}`;
        } else {
          pagesText = `(${dbPagesCount} صفحة مفهرسة)`;
        }

        kbTextbookStatus.innerHTML = `<span style="color:#15803d; font-weight:600;">🟢 مرفق ومفهرس (${currentBook ? currentBook.title : 'CNP'} ${pagesText})</span>`;
        if (kbWarningBox) kbWarningBox.hidden = true;
      } else if (currentBook) {
        kbTextbookStatus.innerHTML = `<span style="color:#d97706; font-weight:600;">🟡 جارٍ الفهرسة / يحتاج تحديد أرقام الصفحات</span>`;
        if (kbWarningBox) kbWarningBox.hidden = true;
      } else {
        kbTextbookStatus.innerHTML = '<span style="color:#991b1b; font-weight:600;">🔴 غير مرفق (يرجى إرفاق الكتاب المدرسي أولاً)</span>';
      }

      // 3. Teacher Resources
      const teacherCount = (searchRes.teacherResources || []).length;
      kbTeacherStatus.textContent = `${teacherCount} موارد متاحة`;

      kbSearchStatus.textContent = "تم استرجاع المعطيات بنجاح";

      // 4. Warning Box logic (Hidden when textbook pages/content is retrieved)
      const hasRetrievedActs = (searchRes.activities || []).length > 0;
      if (kbWarningBox) {
        if (!searchRes.official && !hasPageRange && !hasRetrievedActs) {
          kbWarningBox.hidden = false;
          kbWarningText.textContent = `⚠️ الدرس «${titleVal || unitVal}» غير مدرج صراحة في كشوف البرامج الرسمية الحالية. لن يُعرض كدرس رسمي معتمد.`;
        } else if (!hasRetrievedActs && !hasPageRange) {
          kbWarningBox.hidden = false;
          kbWarningText.textContent = `⚠️ لم يتم العثور على أنشطة موثقة لهذا الدرس في بنك المعرفة الحالي. ولا يجوز اختلاق نصوص أو أرقام صفحات.`;
        } else {
          kbWarningBox.hidden = true;
        }
      }
    }
  } catch (e) {
    console.warn("Error updating Knowledge Card:", e);
    kbSearchStatus.textContent = "جاهز";
  }
}

// ── CURRICULUM & TABS ──────────────────────────────────────
function initCurriculumSelectors() {
  levelSelect.addEventListener("change", () => {
    updateUnitsDatalist();
    updateKnowledgeSourcesCard();
  });
  subjectSelect.addEventListener("change", () => {
    updateUnitsDatalist();
    applySubjectLanguage(subjectSelect.value);
    updateKnowledgeSourcesCard();
  });
  unitInput.addEventListener("input", updateKnowledgeSourcesCard);
  unitInput.addEventListener("change", updateKnowledgeSourcesCard);
  lessonTitle.addEventListener("input", updateKnowledgeSourcesCard);
  lessonTitle.addEventListener("change", updateKnowledgeSourcesCard);

  if ($("btnCreateProposedActivity")) {
    $("btnCreateProposedActivity").addEventListener("click", () => {
      if ($("activitySourceSelect")) $("activitySourceSelect").value = "generated";
      if ($("activitiesList")) $("activitiesList").scrollIntoView({ behavior: "smooth" });
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      currentMode = tab.dataset.mode;

      if (currentMode === "archive") {
        showView("archive");
        refreshArchiveGallery();
      } else {
        showView("creator");
        hideError();

        const ficheFields = $("ficheFields");
        if (ficheFields) ficheFields.hidden = (currentMode !== "fiche");
        const summaryLengthGroup = $("summaryLengthGroup");
        if (summaryLengthGroup) summaryLengthGroup.hidden = (currentMode !== "summary");
      }
    });
  });
}

// ── 5-STAGE DYNAMIC ITEM MANAGERS ──────────────────────────
function initStageManagers() {
  resetStageItems();

  btnAddRemind.addEventListener("click", () => {
    const n = remindData.length + 1;
    addItem("remind", { title: currentCycle === "college" ? `استحضر ${n}` : `Rappel ${n}`, type: "text", content: "" });
  });
  btnAddActivity.addEventListener("click", () => {
    const n = activitiesData.length + 1;
    addItem("activity", { title: currentCycle === "college" ? `نشاط ${n}` : `Activité ${n}`, type: "text", content: "" });
  });
  btnAddApplication.addEventListener("click", () => {
    const n = applicationsData.length + 1;
    addItem("application", { title: currentCycle === "college" ? `تطبيق ${n}` : `Application ${n}`, type: "text", content: "" });
  });
  btnAddExercise.addEventListener("click", () => {
    const n = exercisesData.length + 1;
    addItem("exercise", { title: currentCycle === "college" ? `تمرين ${n}` : `Exercice ${n}`, type: "text", content: "" });
  });
}

function resetStageItems() {
  remindData       = [];
  activitiesData   = [];
  applicationsData = [];
  exercisesData    = [];
  remindList.innerHTML       = "";
  activitiesList.innerHTML   = "";
  applicationsList.innerHTML = "";
  exercisesList.innerHTML    = "";

  if (currentCycle === "college") {
    addItem("remind",      { title: "استحضر — تذكير بالمكتسبات القبلية", type: "text", content: "" });
    addItem("activity",    { title: "نشاط 1 — استكشاف وبناء المفهوم", type: "text", content: "" });
    addItem("application", { title: "تطبيق 1 — تثبيت فوري", type: "text", content: "" });
    addItem("exercise",    { title: "تمرين 1 — عمل فردي وواجب منزلي", type: "text", content: "" });
  } else {
    addItem("remind",      { title: "Rappel — Prérequis et diagnostic", type: "text", content: "" });
    addItem("activity",    { title: "Activité 1 — Exploration et conjecture", type: "text", content: "" });
    addItem("application", { title: "Application 1 — Fixation directe", type: "text", content: "" });
    addItem("exercise",    { title: "Exercice 1 — Entraînement et devoir maison", type: "text", content: "" });
  }
}

function getStageData(stage) {
  if (stage === "remind")      return remindData;
  if (stage === "activity")    return activitiesData;
  if (stage === "application") return applicationsData;
  if (stage === "exercise")    return exercisesData;
  return [];
}

function getStageList(stage) {
  if (stage === "remind")      return remindList;
  if (stage === "activity")    return activitiesList;
  if (stage === "application") return applicationsList;
  if (stage === "exercise")    return exercisesList;
  return null;
}

function addItem(stage, item) {
  const id = `${stage}_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
  const obj = { id, stage, title: item.title, type: item.type || "text", content: item.content || "", imageBase64: item.imageBase64 || "" };
  getStageData(stage).push(obj);
  renderItemCard(stage, obj);
}

function renderItemCard(stage, obj) {
  const listEl = getStageList(stage);
  if (!listEl) return;

  const stageColors = {
    remind:      "#0284c7",
    activity:    "#ea580c",
    application: "#9333ea",
    exercise:    "#16a34a",
  };
  const borderColor = stageColors[stage] || "#2563eb";

  const card = document.createElement("div");
  card.className = "item-card";
  card.id = obj.id;
  card.style.borderColor = borderColor;

  const isFr = (currentCycle === "lycee");

  card.innerHTML = `
    <div class="item-card-header">
      <input type="text" class="item-card-title-input" value="${escapeHtml(obj.title)}"
        placeholder="${isFr ? 'Titre de l\'élément (ex: Activité 1 p 48)' : 'عنوان العنصر (مثال: نشاط 1 ص 48)'}" style="color: ${borderColor};" />
      <div class="item-mode-selector">
        <button type="button" class="btn-item-mode ${obj.type === 'text'  ? 'active' : ''}" data-type="text">${isFr ? '📝 Texte / LaTeX' : '📝 نص / LaTeX'}</button>
        <button type="button" class="btn-item-mode ${obj.type === 'image' ? 'active' : ''}" data-type="image">${isFr ? '🖼️ Image' : '🖼️ صورة'}</button>
      </div>
      <button type="button" class="btn-del-item" title="${isFr ? 'Supprimer' : 'حذف'}">🗑️</button>
    </div>
    <div class="item-content-body">
      <div class="item-text-pane" ${obj.type === 'image' ? 'style="display:none;"' : ''}>
        <textarea class="text-input textarea" rows="3"
          dir="${isFr ? 'ltr' : 'rtl'}"
          placeholder="${isFr ? 'Saisir le texte. Entourer les formules de $ ... $ (ex: $x_A = -3$ et $x_B = 5$)' : 'اكتب هنا النص بالعربية. للمعادلات والرموز استعمل $ ... $ مثال: $x_A = -3$ و $x_B = 5$'}">${escapeHtml(obj.content)}</textarea>
        <small class="math-hint">💡 ${isFr ? 'Formules mathématiques entre <code>$ ... $</code> rendues en LTR de haute précision' : 'كل رمز أو معادلة داخل <code>$ ... $</code> تظهر تلقائياً من اليسار إلى اليمين (LTR)'}</small>
      </div>
      <div class="item-image-pane" ${obj.type === 'text' ? 'style="display:none;"' : ''}>
        <input type="file" accept="image/*" class="item-file-input" hidden />
        <div class="item-image-dropzone" ${obj.imageBase64 ? 'style="display:none;"' : ''}>
          <span>📷 ${isFr ? 'Cliquer ou glisser <strong>une image du manuel ou de votre téléphone</strong>' : 'اضغط لاختيار أو إسقاط <strong>صورة من كتاب التلميذ أو هاتفك</strong>'}</span>
        </div>
        <div class="item-image-preview-box" ${!obj.imageBase64 ? 'style="display:none;"' : ''}>
          <img src="${obj.imageBase64 || ''}" alt="صورة" />
          <button type="button" class="btn-danger-sm btn-del-img">${isFr ? '🔄 Changer l\'image' : '🔄 تغيير الصورة'}</button>
        </div>
      </div>
    </div>
  `;

  const titleInput = card.querySelector(".item-card-title-input");
  const textarea   = card.querySelector("textarea");
  const btnModes   = card.querySelectorAll(".btn-item-mode");
  const textPane   = card.querySelector(".item-text-pane");
  const imgPane    = card.querySelector(".item-image-pane");
  const fileInput  = card.querySelector(".item-file-input");
  const dropzone   = card.querySelector(".item-image-dropzone");
  const previewBox = card.querySelector(".item-image-preview-box");
  const previewImg = card.querySelector(".item-image-preview-box img");
  const btnDelImg  = card.querySelector(".btn-del-img");
  const btnDel     = card.querySelector(".btn-del-item");

  titleInput.addEventListener("input", () => { obj.title = titleInput.value.trim(); });
  textarea.addEventListener("input",   () => { obj.content = textarea.value; });

  btnModes.forEach((b) => {
    b.addEventListener("click", () => {
      btnModes.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      obj.type = b.dataset.type;
      textPane.style.display = (obj.type === "text")  ? "block" : "none";
      imgPane.style.display  = (obj.type === "image") ? "block" : "none";
    });
  });

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      obj.imageBase64 = ev.target.result;
      previewImg.src = obj.imageBase64;
      dropzone.style.display  = "none";
      previewBox.style.display = "flex";
    };
    reader.readAsDataURL(file);
  });

  btnDelImg.addEventListener("click", () => {
    obj.imageBase64 = "";
    fileInput.value = "";
    previewBox.style.display = "none";
    dropzone.style.display   = "block";
  });

  btnDel.addEventListener("click", () => {
    const arr = getStageData(stage);
    const idx = arr.findIndex((x) => x.id === obj.id);
    if (idx > -1) arr.splice(idx, 1);
    card.remove();
  });

  listEl.appendChild(card);
}

function escapeHtml(str) {
  return (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── TEXTBOOK / PDF MANAGEMENT ──────────────────────────────
async function loadSavedBooksList() {
  try {
    const books = await window.PDFManager.getAllBooksFromDB();
    savedBooksSelect.innerHTML = '<option value="">-- لا يوجد كتاب محدد (أو ارفع كتاباً جديداً) --</option>';

    if (!Array.isArray(books) || books.length === 0) {
      currentBook = null;
      window.currentBook = null;
      if (typeof activeBookCard !== 'undefined' && activeBookCard) activeBookCard.hidden = true;
      if (typeof btnDeleteBook !== 'undefined' && btnDeleteBook) btnDeleteBook.hidden = true;
      return;
    }

    let activeToRestore = null;

    for (const b of books) {
      // Verify book has indexed page records in store 'textbook_pages'
      let dbPageCount = 0;
      if (window.PDFManager && window.PDFManager.getTextbookPagesDB) {
        const dbPages = await window.PDFManager.getTextbookPagesDB(1, 9999);
        dbPageCount = dbPages.filter(p => !p.textbookId || String(p.textbookId) === String(b.id)).length;
      }

      const totalPages = b.numPages || (b.pages ? b.pages.length : dbPageCount);
      const isIndexed = dbPageCount > 0 || (b.pages && b.pages.length > 0);

      if (isIndexed) {
        b.status = "indexed";
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = `📖 ${b.title} (${totalPages} صفحة) 🟢`;
        savedBooksSelect.appendChild(opt);

        if (currentBook && String(currentBook.id) === String(b.id)) {
          activeToRestore = b;
        } else if (!activeToRestore) {
          activeToRestore = b;
        }
      }
    }

    if (activeToRestore) {
      savedBooksSelect.value = activeToRestore.id;
      setActiveBook(activeToRestore);
    } else {
      currentBook = null;
      window.currentBook = null;
      if (typeof activeBookCard !== 'undefined' && activeBookCard) activeBookCard.hidden = true;
      if (typeof btnDeleteBook !== 'undefined' && btnDeleteBook) btnDeleteBook.hidden = true;
    }
  } catch (e) {
    console.warn("IndexedDB books note:", e);
  }
}

function initPDFEvents() {
  btnBrowsePDF.addEventListener("click", (e) => { e.stopPropagation(); pdfFileInput.click(); });
  pdfDropzone.addEventListener("click", () => pdfFileInput.click());
  pdfFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handlePDFFile(file);
  });
  pdfDropzone.addEventListener("dragover", (e) => { e.preventDefault(); pdfDropzone.classList.add("drag-over"); });
  pdfDropzone.addEventListener("dragleave", () => { pdfDropzone.classList.remove("drag-over"); });
  pdfDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    pdfDropzone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") handlePDFFile(file);
    else showError("⚠️ الرجاء إفلات ملف PDF صالح.");
  });

  savedBooksSelect.addEventListener("change", async () => {
    const bookId = savedBooksSelect.value;
    if (!bookId) { currentBook = null; window.currentBook = null; activeBookCard.hidden = true; btnDeleteBook.hidden = true; return; }
    try {
      const book = await window.PDFManager.getBookFromDB(bookId);
      if (book) {
        book.status = "indexed";
        setActiveBook(book);
        await updateBookStatsUI(book);
        await updateKnowledgeSourcesCard();
      }
    } catch (err) { showError("❌ تعذر استرجاع الكتاب المحفوظ."); }
  });

  btnDeleteBook.addEventListener("click", async () => {
    if (!currentBook) return;
    const targetBookId = currentBook.id;
    const targetBookTitle = currentBook.title || "الكتاب المدرسي";
    if (confirm(`هل أنت متأكد من مسح الكتاب المرفق: "${targetBookTitle}"؟`)) {
      try {
        console.log("[DELETE] Starting atomic deletion for textbook:", targetBookId);
        if (window.PDFManager && window.PDFManager.deleteTextbookDataDB) {
          await window.PDFManager.deleteTextbookDataDB(targetBookId);
        } else if (window.TextbookIndexer && window.TextbookIndexer.deleteTextbookData) {
          await window.TextbookIndexer.deleteTextbookData(targetBookId);
        } else if (window.PDFManager && window.PDFManager.deleteBookFromDB) {
          await window.PDFManager.deleteBookFromDB(targetBookId);
        }

        // Complete UI & State Cleanup
        currentBook = null;
        window.currentBook = null;
        activeBookCard.hidden = true;
        btnDeleteBook.hidden  = true;
        if (savedBooksSelect) savedBooksSelect.value = "";
        if (pageFrom) pageFrom.value = "";
        if (pageTo)   pageTo.value = "";

        // Reset Card UI Stats
        const statPages = $("statPagesCount");
        const statActs = $("statActsCount");
        const statExs = $("statExsCount");
        const bookStatusBadge = $("bookStatusBadge");
        if (statPages) statPages.textContent = "📄 0/0 صفحة";
        if (statActs)  statActs.textContent  = "📍 0 أنشطة";
        if (statExs)   statExs.textContent   = "📝 0 تمارين";
        if (bookStatusBadge) {
          bookStatusBadge.className = "badge badge-danger";
          bookStatusBadge.textContent = "🔴 غير مفهرس";
        }

        await loadSavedBooksList();
        await updateKnowledgeSourcesCard();
        console.log("[DELETE] Atomic deletion completed successfully.");
        showToast("🗑️ تم مسح الكتاب المرفق وجميع سجلات الفهرسة نهائياً من التخزين المحلي");
      } catch (err) {
        console.error("[DELETE ERROR] Failed to delete textbook:", err);
        showError(`❌ فشل في مسح الكتاب من التخزين المحرري: ${err.message}`);
      }
    }
  });

  const btnReindex = $("btnReindexBook");
  if (btnReindex) {
    btnReindex.addEventListener("click", async () => {
      if (!currentBook) return;
      console.log("[INDEX] Re-indexing triggered for book:", currentBook.id, currentBook.title);
      showToast("🔄 جاري إعادة فهرسة الكتاب المدرسي...");
      try {
        // Ensure currentBook has pages array loaded
        if ((!currentBook.pages || currentBook.pages.length === 0) && window.PDFManager && window.PDFManager.getTextbookPagesDB) {
          const dbPages = await window.PDFManager.getTextbookPagesDB(1, 9999);
          const bookPages = dbPages.filter(p => String(p.textbookId || p.bookId) === String(currentBook.id));
          if (bookPages.length > 0) {
            currentBook.pages = bookPages;
          }
        }

        if (window.TextbookIndexer && window.TextbookIndexer.reindexTextbook) {
          await window.TextbookIndexer.reindexTextbook(currentBook.id, currentBook, {
            id: currentBook.id,
            textbookId: currentBook.id,
            level: levelSelect ? levelSelect.value : '',
            subject: subjectSelect ? subjectSelect.value : '',
            title: currentBook.title
          });
        }

        await updateBookStatsUI(currentBook);
        await updateKnowledgeSourcesCard();
        showToast("✅ تمت إعادة الفهرسة بنجاح!");
      } catch (err) {
        console.error("[INDEX ERROR] Re-indexing failed:", err);
        showError(`❌ فشل في إعادة الفهرسة: ${err.message}`);
      }
    });
  }

  btnUseAllPages.addEventListener("click", () => {
    pageFrom.value = ""; pageTo.value = "";
    showToast("📄 تم ضبط النطاق على كامل الكتاب");
  });
}

async function handlePDFFile(file) {
  pdfProgressBox.hidden = false;
  pdfProgressBar.style.width = "0%";
  pdfProgressText.textContent = "جاري قراءة ملف الـ PDF...";
  console.log("[TEXTBOOK] file selected:", file.name, `(${file.size} bytes)`);
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { numPages, pages, fullText } = await window.PDFManager.extractTextFromPDF(
      arrayBuffer,
      (cur, total) => {
        const pct = Math.round((cur / total) * 100);
        pdfProgressBar.style.width = `${pct}%`;
        pdfProgressText.textContent = `جاري الاستخراج... صفحة ${cur} من ${total} (${pct}%)`;
      }
    );
    console.log("[TEXTBOOK] PDF loaded, pages extracted:", numPages);

    const bookObj = {
      id: `book_${Date.now()}`, title: file.name.replace(/\.pdf$/i, ""),
      numPages, pages, fullText, uploadedAt: new Date().toISOString()
    };
    await window.PDFManager.saveBookToDB(bookObj);

    // Auto-Index Textbook for Phase 3
    if (window.TextbookIndexer && window.TextbookIndexer.indexTextbook) {
      console.log("[TEXTBOOK] indexing started...");
      pdfProgressText.textContent = "جاري البناء والفهرسة البيداغوجية لقاعدة المعرفة...";
      await window.TextbookIndexer.indexTextbook(bookObj, {
        id: bookObj.id,
        textbookId: bookObj.id,
        level: levelSelect ? levelSelect.value : '',
        subject: subjectSelect ? subjectSelect.value : '',
        title: bookObj.title
      });
      console.log("[TEXTBOOK] indexing completed.");
    }

    // Save page records directly to IndexedDB store 'textbook_pages'
    if (window.PDFManager && window.PDFManager.saveTextbookPagesDB) {
      const pageObjs = pages.map(p => ({
        textbookId: bookObj.id,
        bookId: bookObj.id,
        pageNum: p.pageNum,
        pageNumber: p.pageNum,
        level: levelSelect ? levelSelect.value : '',
        subject: subjectSelect ? subjectSelect.value : '',
        text: p.text,
        content: p.text
      }));
      await window.PDFManager.saveTextbookPagesDB(pageObjs);
      console.log("[TEXTBOOK] IndexedDB records verified:", pageObjs.length, "pages");
    }

    await loadSavedBooksList();
    savedBooksSelect.value = bookObj.id;
    setActiveBook(bookObj);
    console.log("[TEXTBOOK] textbook status = indexed");
    await updateKnowledgeSourcesCard();
    console.log("[TEXTBOOK] knowledge card updated");

    showToast(`✅ تم حفظ وفهرسة الكتاب بنجاح (${numPages} صفحة)`);
  } catch (err) {
    console.error("[TEXTBOOK ERROR]", err);
    showError(`❌ فشل في قراءة ملف PDF: ${err.message}`);
  } finally {
    pdfProgressBox.hidden = true;
    pdfFileInput.value = "";
  }
}

async function updateBookStatsUI(book) {
  if (!book) return;
  const badgeStatus = $("badgeIndexStatus");
  const statPages   = $("statPagesCount");
  const statActs    = $("statActsCount");
  const statExs     = $("statExsCount");

  if (!badgeStatus) return;

  try {
    // 1. Fetch actual page records from store 'textbook_pages'
    let dbPages = [];
    if (window.PDFManager && window.PDFManager.getTextbookPagesDB) {
      const allPages = await window.PDFManager.getTextbookPagesDB(1, 9999);
      dbPages = allPages.filter(p => !p.textbookId || String(p.textbookId) === String(book.id));
    }
    const indexedPagesCount = dbPages.length > 0 ? dbPages.length : (book.pages ? book.pages.length : 0);
    const totalPages = book.numPages || indexedPagesCount;

    // 2. Fetch activity items from store 'textbook_activities'
    const items = (window.PDFManager && window.PDFManager.getTextbookActivitiesDB)
      ? await window.PDFManager.getTextbookActivitiesDB()
      : [];
    const bookItems = items.filter(it => String(it.textbookId) === String(book.id));
    let actsCount = 0;
    let exsCount = 0;

    bookItems.forEach(it => {
      if (it.type === 'activity') actsCount++;
      else if (it.type === 'exercise') exsCount++;
    });

    if (statPages) statPages.textContent = `📄 ${indexedPagesCount}/${totalPages} صفحة`;
    if (statActs)  statActs.textContent  = `📍 ${actsCount} أنشطة`;
    if (statExs)   statExs.textContent   = `📝 ${exsCount} تمارين`;

    if (indexedPagesCount > 0) {
      badgeStatus.textContent = indexedPagesCount >= totalPages ? "🟢 مفهرس بالكامل" : "🟢 مفهرس";
      badgeStatus.style.background = "#dcfce7";
      badgeStatus.style.color = "#166534";
    } else {
      badgeStatus.textContent = "🔴 غير مفهرس";
      badgeStatus.style.background = "#fee2e2";
      badgeStatus.style.color = "#991b1b";
    }
  } catch (e) {
    console.warn("Error updating book stats UI:", e);
  }
}

function setActiveBook(book) {
  currentBook = book;
  window.currentBook = book;
  activeBookTitle.textContent = book.title;
  activeBookMeta.textContent  = `${book.numPages || (book.pages ? book.pages.length : 0)} صفحة • محفوظ في المتصفح`;
  pageFrom.value = ""; pageTo.value = "";
  pageFrom.max = book.numPages || (book.pages ? book.pages.length : 9999);
  pageTo.max = book.numPages || (book.pages ? book.pages.length : 9999);
  activeBookCard.hidden = false;
  btnDeleteBook.hidden  = false;
  updateBookStatsUI(book);
}

async function getSelectedBookContext() {
  if (!currentBook) return "";
  const from = parseInt(pageFrom.value, 10);
  const to   = parseInt(pageTo.value, 10);
  const totalPages = currentBook.numPages || currentBook.totalPages || 500;

  // Phase 12 & 18.1 Input Validations
  if (!isNaN(from) && !isNaN(to) && from > to) {
    throw new Error(`خطأ: بداية رقم الصفحة (${from}) لا يمكن أن تكون أكبر من نهايتها (${to}).`);
  }
  if (!isNaN(from) && from > totalPages) {
    throw new Error(`خطأ: بداية الصفحة المحددة (${from}) تتجاوز إجمالي صفحات الكتاب (${totalPages}).`);
  }
  if (!isNaN(to) && to > totalPages) {
    throw new Error(`خطأ: نهاية الصفحة المحددة (${to}) تتجاوز إجمالي صفحات الكتاب (${totalPages}).`);
  }

  let text = "";
  let retrievedCount = 0;
  let targetPagesStr = "";

  if (!isNaN(from)) {
    const end = !isNaN(to) ? to : from;
    targetPagesStr = (from === end) ? `الصفحة ${from}` : `الصفحات من ${from} إلى ${end}`;

    // Try structured page retrieval via KnowledgeRetriever
    if (window.KnowledgeRetriever && window.KnowledgeRetriever.searchTextbookByPages) {
      try {
        const pRes = await window.KnowledgeRetriever.searchTextbookByPages({
          startPage: from,
          endPage: end,
          level: levelSelect.value,
          subject: subjectSelect.value,
          textbookId: currentBook.id
        });
        if (pRes && pRes.hasContent) {
          text = pRes.combinedText;
          retrievedCount = pRes.totalRetrievedPages;
        }
      } catch (e) {
        console.warn("KnowledgeRetriever page search error:", e);
      }
    }

    // Fallback to memory pages array if DB retrieval returned empty
    if (!text && currentBook.pages) {
      let pages = currentBook.pages;
      pages = pages.filter((p) => {
        const pNum = Number(p.pageNum || p.pageNumber);
        return !isNaN(pNum) && pNum >= from && pNum <= end;
      });
      if (pages.length > 0) {
        text = pages.map((p) => `--- [الكتاب المدرسي — الصفحة ${p.pageNum || p.pageNumber}]: ---\n${p.text || p.content}`).join("\n\n");
        retrievedCount = pages.length;
      }
    }

    if (!text || text.trim().length === 0) {
      throw new Error(`⚠️ تعذر استخراج نص الصفحات المحددة (${targetPagesStr}) من الكتاب المدرسي المفهرس.`);
    }
  } else if (currentBook.pages) {
    let pages = currentBook.pages;
    text = pages.map((p) => `--- [الكتاب المدرسي — الصفحة ${p.pageNum || p.pageNumber}]: ---\n${p.text || p.content}`).join("\n\n");
    retrievedCount = pages.length;
  }

  if (text.length > 25000) {
    text = text.substring(0, 25000) + "\n...[تم اقتطاع باقي الصفحات للحفاظ على كفاءة التوليد]...";
  }

  return `\n\n=== 📖 محتوى الكتاب المدرسي الرسمي المعتمد (${currentBook.title}) ===
${targetPagesStr ? `أرقام الصفحات المعتمدة صراحة من الأستاذ: [${targetPagesStr}]\n` : ''}
${text ? text : `⚠️ تعذر استخراج نص الصفحات المحددة. لا تختلق أرقام صفحات أو أنشطة غير موجودة.`}
=========================================\n`;
}

// ── ARCHIVE ─────────────────────────────────────────────────
async function refreshArchiveGallery() {
  try {
    const docs = await window.PDFManager.getAllDocsFromArchive();
    archiveBadgeCount.textContent = `${docs.length} وثيقة محفوظة`;
    const q    = (archiveSearchInput.value || "").toLowerCase().trim();
    const type = archiveFilterType.value;
    const filtered = docs.filter((d) => {
      const matchSearch = !q || d.title.toLowerCase().includes(q) || d.subject.toLowerCase().includes(q) || d.level.toLowerCase().includes(q);
      const matchType   = type === "all" || d.mode === type;
      return matchSearch && matchType;
    });
    if (filtered.length === 0) {
      archiveGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#64748b;direction:rtl;"><p style="font-size:1.2rem;font-weight:700;">📂 لا توجد وثائق محفوظة.</p><small>قم بإنشاء جذاذة أو بطاقة درس للبدء.</small></div>`;
      return;
    }
    archiveGrid.innerHTML = filtered.map((doc) => {
      const isFiche = doc.mode === "fiche";
      const isFr    = doc.lang === "fr";
      const dateStr = new Date(doc.createdAt).toLocaleDateString("ar-TN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      return `
        <div class="archive-card">
          <span class="archive-card-badge ${isFiche ? "badge-type-fiche" : "badge-type-summary"}">
            ${isFiche ? (isFr ? "📋 Fiche Pédagogique" : "📋 جذاذة تفقد بيداغوجية") : (isFr ? "🎨 Fiche de Cours Illustrée" : "🎨 بطاقة درس مصورة")}
          </span>
          <h3>${escapeHtml(doc.title)}</h3>
          <p><strong>المادة:</strong> ${escapeHtml(doc.subject)} • <strong>المستوى:</strong> ${escapeHtml(doc.level)}</p>
          ${doc.unit ? `<p><strong>المحور:</strong> ${escapeHtml(doc.unit)}</p>` : ""}
          <div class="archive-card-meta">
            <span>👤 ${escapeHtml(doc.teacher || "الأستاذ(ة)")}</span>
            <span>📅 ${dateStr}</span>
          </div>
          <div class="archive-card-actions">
            <button class="btn-view-doc" onclick="openArchivedDoc('${doc.id}')">👁️ فتح وتحميل PDF</button>
            <button class="btn-del-doc" onclick="deleteArchivedDoc('${doc.id}')">🗑️ حذف</button>
          </div>
        </div>`;
    }).join("");
  } catch (e) { console.warn("Archive error:", e); }
}

function initArchiveEvents() {
  archiveSearchInput.addEventListener("input", refreshArchiveGallery);
  archiveFilterType.addEventListener("change", refreshArchiveGallery);
  btnSaveToArchive.addEventListener("click", async () => {
    if (!currentDocObj) { showToast("⚠️ لا توجد وثيقة حالية لحفظها."); return; }
    try {
      await window.PDFManager.saveDocToArchive(currentDocObj);
      await refreshArchiveGallery();
      showToast("✅ تم حفظ الوثيقة في الأرشيف بنجاح!");
      btnSaveToArchive.classList.add("saved");
      btnSaveToArchive.innerHTML = "✅ <strong>تم الحفظ</strong>";
      const badge = document.getElementById("unsavedBadge");
      if (badge) badge.classList.add("hidden");
    } catch (e) { showError("❌ تعذر حفظ الوثيقة في الأرشيف."); }
  });
}

window.openArchivedDoc = async (id) => {
  try {
    const doc = await window.PDFManager.getDocFromArchive(id);
    if (!doc) return;
    currentDocObj = doc;
    currentMode   = doc.mode;
    
    showView("output");

    const isFr = (doc.lang === "fr");
    const isEn = (doc.lang === "en");
    printableSheet.classList.toggle("sheet-lang-fr", isFr);
    printableSheet.classList.toggle("sheet-lang-en", isEn);

    bannerTeacherName.textContent  = doc.teacher;
    bannerSchoolName.textContent   = doc.school;
    bannerYear.textContent         = isFr ? `Année scolaire : ${doc.year}` : (isEn ? `School Year: ${doc.year}` : `السنة الدراسية: ${doc.year}`);
    bannerSubjectLevel.textContent = `${doc.subject} — ${doc.level}`;
    bannerLessonBadge.textContent  = doc.title;
    footerTeacherText.textContent  = isFr ? `Professeur : ${doc.teacher}` : (isEn ? `Teacher: ${doc.teacher}` : `إعداد الأستاذ(ة): ${doc.teacher}`);
    footerSchoolText.textContent   = isFr ? `${doc.school} • Ministère de l'Éducation Tunisien` : (isEn ? `${doc.school} • Ministry of Education` : `${doc.school} • وزارة التربية التونسية`);
    outputTitle.textContent        = `${doc.mode === "fiche" ? (isFr ? "📋 Fiche Pédagogique Officielle :" : (isEn ? "📋 Lesson Plan:" : "📋 جذاذة تفقد بيداغوجية رسمية:")) : (isFr ? "🧠 Poster Didactique :" : (isEn ? "🧠 Visual Poster:" : "🧠 بوستر بيداغوجي:"))} ${doc.title}`;
    outputBody.innerHTML = doc.htmlContent;
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("✅ تم فتح الوثيقة من الأرشيف");
  } catch (e) { showError("❌ تعذر فتح الوثيقة المحفوظة."); }
};

window.deleteArchivedDoc = async (id) => {
  if (confirm("هل أنت متأكد من حذف هذه الوثيقة نهائياً؟")) {
    await window.PDFManager.deleteDocFromArchive(id);
    await refreshArchiveGallery();
    showToast("🗑️ تم حذف الوثيقة من الأرشيف");
  }
};

// ── GENERATE — ONLY ON BUTTON CLICK ───────────────────────
btnGenerate.addEventListener("click", handleGenerate);

if ($("btnRegenerateFiche")) {
  $("btnRegenerateFiche").addEventListener("click", () => {
    showToast("🔄 إعادة صياغة الوثيقة بنفس الدرس والمصادر والقيود البيداغوجية...");
    handleGenerate();
  });
}

async function handleGenerate() {
  if (isGenerating) return;
  const key = getApiKey();
  if (!key) {
    showError("🔑 يرجى إدخال مفتاح Gemini API أولاً — اضغط على ⚙️ في الأعلى");
    settingsModal.hidden = false;
    return;
  }
  const levelId   = levelSelect.value;
  const subjectId = subjectSelect.value;
  const unitVal   = unitInput.value.trim();
  const titleVal  = lessonTitle.value.trim();
  const langVal   = CURRICULUM.getSubjectLang(subjectId, currentCycle) || (currentCycle === "lycee" && !["ar", "philo"].includes(subjectId) ? "fr" : "ar");
  const isFr      = (langVal === "fr");
  const isEn      = (langVal === "en");

  const teacherName = teacherNameInput.value.trim() || (isFr ? "Professeur" : (isEn ? "Teacher" : "الأستاذ(ة)"));
  const schoolName  = schoolNameInput.value.trim()  || (isFr ? "Établissement Scolaire" : (isEn ? "School" : "المؤسسة التربوية"));
  const schoolYear  = schoolYearInput.value.trim()  || "2025 / 2026";

  if (!levelId)   { showError(isFr ? "⚠️ Veuillez sélectionner le niveau / la section." : (isEn ? "⚠️ Please select the grade level." : "⚠️ الرجاء اختيار المستوى والشعبة")); return; }
  if (!subjectId) { showError(isFr ? "⚠️ Veuillez sélectionner la matière." : (isEn ? "⚠️ Please select the subject." : "⚠️ الرجاء اختيار المادة التعليمية")); return; }
  if (!titleVal)  { showError(isFr ? "⚠️ Veuillez saisir le titre de la leçon." : (isEn ? "⚠️ Please enter the lesson title." : "⚠️ الرجاء إدخال عنوان الدرس أو النشاط")); return; }

  // ── PHASE 14 & 17 FIX: PDF Gate (MUST EXECUTE BEFORE ANY KNOWLEDGE SEARCH OR UI STATE CHANGE) ──
  {
    if (currentMode === "fiche") {
      if (!currentBook) {
        showError("⚠️ يرجى رفع وفهرسة الكتاب المدرسي أولاً قبل إنشاء الجذاذة.");
        return; // STOP! No loading state set, no view changed, no Gemini request!
      }

      const totalPages = currentBook.numPages || currentBook.totalPages || 500;
      const fromVal = parseInt(pageFrom ? pageFrom.value : "", 10);
      const toVal   = parseInt(pageTo   ? pageTo.value   : "", 10);
      const hasFrom = !isNaN(fromVal) && fromVal >= 1;
      const hasTo   = !isNaN(toVal) && toVal >= 1;

      if (hasFrom && hasTo) {
        if (fromVal > toVal) {
          showError(`⚠️ خطأ في نطاق الصفحات: بداية الصفحة (${fromVal}) أكبر من نهايتها (${toVal}).`);
          return;
        }
        if (toVal > totalPages) {
          showError(`⚠️ خطأ في نطاق الصفحات: نهاية الصفحة (${toVal}) تتجاوز إجمالي صفحات الكتاب (${totalPages}).`);
          return;
        }
      } else if (hasFrom && !hasTo) {
        if (fromVal > totalPages) {
          showError(`⚠️ خطأ في نطاق الصفحات: رقم الصفحة (${fromVal}) يتجاوز إجمالي صفحات الكتاب (${totalPages}).`);
          return;
        }
      }

      const startVal = hasFrom ? fromVal : 1;
      const endVal   = (hasFrom && hasTo) ? toVal : (hasFrom ? fromVal : totalPages);

      let hasIndexedPages = false;
      if (window.PDFManager && window.PDFManager.getTextbookPagesDB) {
        try {
          const dbPages = await window.PDFManager.getTextbookPagesDB(startVal, endVal);
          const bookPages = dbPages.filter(p => !p.textbookId || String(p.textbookId) === String(currentBook.id));
          hasIndexedPages = Array.isArray(bookPages) && bookPages.length > 0;
        } catch (gateErr) {
          console.warn("[TEXTBOOK GATE ERROR]", gateErr);
        }
      } else if (currentBook.pages && currentBook.pages.length > 0) {
        hasIndexedPages = true;
      }

      if (!hasIndexedPages) {
        showError(`⚠️ يرجى رفع وفهرسة الكتاب المدرسي أولاً، أو التأكد من توفر الصفحات المحددة (${startVal}-${endVal}) في الكتاب المدرسي.`);
        return; // STOP! No loading state set, no view changed, no Gemini request!
      }
    }
  }
  // ── END PDF GATE ─────────────────────────────────────────────────────────

  // Source selection enforcement check
  const actSourceSelect = $("activitySourceSelect");
  const exSourceSelect  = $("exerciseSourceSelect");

  if (actSourceSelect && actSourceSelect.value === "textbook") {
    if (typeof KnowledgeRetriever !== "undefined") {
      const sRes = await KnowledgeRetriever.searchKnowledge({ level: levelId, subject: subjectId, lesson: titleVal, axis: unitVal, query: titleVal });
      if (!sRes.textbookActivities || sRes.textbookActivities.length === 0) {
        showError(`⚠️ لم يتم العثور على نشاط موثق لهذا الدرس في بنك المعرفة الحالي. ولا يجوز اختلاق نص أو صفحة غير موثقة.`);
        if ($("kbWarningBox")) {
          $("kbWarningBox").hidden = false;
          $("kbWarningText").textContent = `⚠️ لم يتم العثور على نشاط موثق لهذا الدرس في بنك المعرفة الحالي. ولا يجوز اختلاق نص أو صفحة غير موثقة.`;
        }
        return;
      }
    }
  }

  if (exSourceSelect && exSourceSelect.value === "textbook") {
    if (typeof KnowledgeRetriever !== "undefined") {
      const sRes = await KnowledgeRetriever.searchKnowledge({ level: levelId, subject: subjectId, lesson: titleVal, axis: unitVal, query: titleVal });
      if (!sRes.textbookExercises || sRes.textbookExercises.length === 0) {
        showError(`⚠️ لم يتم العثور على تمارين موثقة لهذا الدرس في بنك المعرفة الحالي.`);
        return;
      }
    }
  }

  printableSheet.classList.toggle("sheet-lang-fr", isFr);
  printableSheet.classList.toggle("sheet-lang-en", isEn);

  const levelLabel   = CURRICULUM.getLevelLabel(levelId);
  const subjectLabel = CURRICULUM.getSubjects(currentCycle).find((s) => s.id === subjectId)?.label || subjectId;

  let bookContext = "";
  try {
    bookContext = await getSelectedBookContext();
  } catch (err) {
    showError(err.message || "❌ خطأ في تحديد أرقام صفحات الكتاب المدرسي.");
    return;
  }

  bannerTeacherName.textContent  = teacherName;
  bannerSchoolName.textContent   = schoolName;
  bannerYear.textContent         = isFr ? `Année scolaire : ${schoolYear}` : (isEn ? `School Year: ${schoolYear}` : `السنة الدراسية: ${schoolYear}`);
  bannerSubjectLevel.textContent = `${subjectLabel} — ${levelLabel}`;
  bannerLessonBadge.textContent  = titleVal;
  footerTeacherText.textContent  = isFr ? `Professeur : ${teacherName}` : (isEn ? `Teacher: ${teacherName}` : `إعداد الأستاذ(ة): ${teacherName}`);
  footerSchoolText.textContent   = isFr ? `${schoolName} • Ministère de l'Éducation Tunisien` : (isEn ? `${schoolName} • Tunisian Ministry of Education` : `${schoolName} • وزارة التربية التونسية`);

  const metadata = {
    title: titleVal, subject: subjectLabel, level: levelLabel, unit: unitVal,
    teacher: teacherName, school: schoolName, year: schoolYear, mode: currentMode,
    lang: langVal, cycle: currentCycle,
    remind: remindData, activities: activitiesData, applications: applicationsData, exercises: exercisesData,
  };

  let knowledgeContextText = "";
  if (typeof KnowledgeRetriever !== 'undefined' && KnowledgeRetriever.buildKnowledgeContext) {
    try {
      const kRes = await KnowledgeRetriever.buildKnowledgeContext({
        level: levelId,
        subject: subjectId,
        lesson: titleVal,
        axis: unitVal,
        manualInput: ""
      });
      knowledgeContextText = kRes.contextText || "";
      metadata.knowledgeSources = kRes.metadata?.sources || [];
      metadata.hasOfficialProgramme = kRes.metadata?.hasOfficialProgramme;
      metadata.hasVerifiedTextbook = kRes.metadata?.hasVerifiedTextbook;
      metadata.textbookPages = kRes.metadata?.textbookPages || [];
    } catch (e) {
      console.warn("KnowledgeRetriever error:", e);
    }
  }

  const prompt = currentMode === "fiche"
    ? buildFichePrompt({ teacherName, schoolName, levelLabel, subjectId, subjectLabel, unitVal, titleVal, langVal, bookContext, knowledgeContextText })
    : buildSummaryPrompt({ teacherName, schoolName, levelLabel, subjectId, subjectLabel, unitVal, titleVal, langVal, bookContext, knowledgeContextText });

  if (currentMode === "fiche") {
    outputTitle.textContent = isFr
      ? `📋 Fiche Pédagogique Officielle Complète : ${titleVal} (${subjectLabel} — ${levelLabel})`
      : (isEn ? `📋 Official Pedagogical Lesson Plan: ${titleVal} (${subjectLabel} — ${levelLabel})` : `📋 جذاذة تفقد بيداغوجية رسمية شاملة: ${titleVal} (${subjectLabel} — ${levelLabel})`);
  } else {
    outputTitle.textContent = isFr
      ? `🧠 Carte Mentale & Poster Didactique : ${titleVal} (${subjectLabel} — ${levelLabel})`
      : (isEn ? `🧠 Mind Map & Visual Poster: ${titleVal} (${subjectLabel} — ${levelLabel})` : `🧠 بوستر إنفوجرافيك وخريطة ذهنية بيداغوجية: ${titleVal} (${subjectLabel} — ${levelLabel})`);
  }

  await generate(key, prompt, metadata);
}

// ── PROMPT BUILDERS ────────────────────────────────────────
function stagesTextForPrompt(lang) {
  const sections = [];
  const isFr = (lang === "fr");
  const isEn = (lang === "en");

  if (remindData.length > 0) {
    let header = "### 🧠 مرحلة «استحضر» (المكتسبات القبلية والتذكير):\n";
    if (isFr) header = "### 🧠 Étape « Rappel » (Prérequis et diagnostic) :\n";
    if (isEn) header = "### 🧠 Step « Warm-up » (Prerequisites & Review) :\n";

    sections.push(header +
      remindData.map((r, i) => r.type === "image" && r.imageBase64
        ? (isFr ? `Rappel ${i+1} : "${r.title}" — [Image jointe du manuel]` : (isEn ? `Warm-up ${i+1}: "${r.title}" — [Attached textbook image]` : `استحضر ${i+1}: "${r.title}" — [مرفق كصورة من كتاب التلميذ]`))
        : (isFr ? `Rappel ${i+1} : "${r.title}"\n${r.content || "(Questions diagnostiques selon les programmes officiels)"}` : (isEn ? `Warm-up ${i+1}: "${r.title}"\n${r.content || "(Diagnostic questions according to official syllabus)"}` : `استحضر ${i+1}: "${r.title}"\n${r.content || "(صِغ أسئلة مراجعة تشخيصية مناسبة وفق المنهاج التونسي)"}`))
      ).join("\n\n")
    );
  }

  if (activitiesData.length > 0) {
    let header = "### 🎯 مرحلة «نشاط» (الاستكشاف وبناء المفهوم):\n";
    if (isFr) header = "### 🎯 Étape « Activité » (Exploration & Construction du concept) :\n";
    if (isEn) header = "### 🎯 Step « Presentation / Exploration » (Concept Building) :\n";

    sections.push(header +
      activitiesData.map((a, i) => a.type === "image" && a.imageBase64
        ? (isFr ? `Activité ${i+1} : "${a.title}" — [Image jointe du manuel]` : (isEn ? `Activity ${i+1}: "${a.title}" — [Attached textbook image]` : `نشاط ${i+1}: "${a.title}" — [مرفق كصورة من كتاب التلميذ]`))
        : (isFr ? `Activité ${i+1} : "${a.title}"\n${a.content || "(Activité d'exploration rigoureuse du manuel)"}` : (isEn ? `Activity ${i+1}: "${a.title}"\n${a.content || "(Exploration activity from official textbook)"}` : `نشاط ${i+1}: "${a.title}"\n${a.content || "(صِغ نشاطاً استكشافياً وبنائياً دقيقاً من كتاب التلميذ)"}`))
      ).join("\n\n")
    );
  }

  if (applicationsData.length > 0) {
    let header = "### ✏️ مرحلة «تطبيق» (التثبيت الفوري):\n";
    if (isFr) header = "### ✏️ Étape « Application » (Fixation directe) :\n";
    if (isEn) header = "### ✏️ Step « Practice » (Controlled Practice) :\n";

    sections.push(header +
      applicationsData.map((a, i) => a.type === "image" && a.imageBase64
        ? (isFr ? `Application ${i+1} : "${a.title}" — [Image jointe du manuel]` : (isEn ? `Practice ${i+1}: "${a.title}" — [Attached textbook image]` : `تطبيق ${i+1}: "${a.title}" — [مرفق كصورة من كتاب التلميذ]`))
        : (isFr ? `Application ${i+1} : "${a.title}"\n${a.content || "(Application directe du cours)"}` : (isEn ? `Practice ${i+1}: "${a.title}"\n${a.content || "(Direct application task)"}` : `تطبيق ${i+1}: "${a.title}"\n${a.content || "(اقترح تطبيقاً فورياً مباشراً من كتاب التلميذ)"}`))
      ).join("\n\n")
    );
  }

  if (exercisesData.length > 0) {
    let header = "### 📐 مرحلة «تمرين» (العمل الفردي والواجب المنزلي):\n";
    if (isFr) header = "### 📐 Étape « Exercice » (Entraînement et devoir maison) :\n";
    if (isEn) header = "### 📐 Step « Production » (Free Production & Homework) :\n";

    sections.push(header +
      exercisesData.map((e, i) => e.type === "image" && e.imageBase64
        ? (isFr ? `Exercice ${i+1} : "${e.title}" — [Image jointe du manuel]` : (isEn ? `Homework ${i+1}: "${e.title}" — [Attached textbook image]` : `تمرين ${i+1}: "${e.title}" — [مرفق كصورة من كتاب التلميذ]`))
        : (isFr ? `Exercice ${i+1} : "${e.title}"\n${e.content || "(Exercice d'entraînement autonome)"}` : (isEn ? `Homework ${i+1}: "${e.title}"\n${e.content || "(Free production task / homework)"}` : `تمرين ${i+1}: "${e.title}"\n${e.content || "(اقترح تمريناً تدريبياً مناسباً من كتاب التلميذ)"}`))
      ).join("\n\n")
    );
  }
  return sections.join("\n\n");
}

// ── OFFICIAL SYSTEM PROMPT ────────────────────────────────
const SYSTEM_PROMPT = `
╔══════════════════════════════════════════════════════════════════════════╗
║  System Prompt — مصمّم جذاذات الدروس والخرائط الذهنية (البرنامج الرسمي التونسي)  ║
╚══════════════════════════════════════════════════════════════════════════╝

1. الهوية والدور :
أنت خبير تربوي وبيداغوجي تونسي، بمنزلة أستاذ متفقد (Inspecteur) في المنظومة التربوية التونسية، تجمع بين:
- خبرة تدريسية معمّقة في جميع المواد: الرياضيات، اللغة العربية، اللغة الفرنسية، اللغة الإنجليزية، الفيزياء والكيمياء، التربية التكنولوجية، علوم الحياة والأرض، الإعلامية، الاقتصاد والتصرف، الفلسفة.
- كفاءة في هندسة المضامين البيداغوجية: إعداد جذاذات دروس (fiches pédagogiques) وخرائط ذهنية وبوسترات تفاعلية (cartes mentales) واضحة ومنظّمة ومحكمة دون حشو.
- التزام صارم بدور المتفقد: كل مضمون تنتجه يجب أن يكون قابلاً للمصادقة عليه من قبل هيئة تفقد رسمية، أي مطابقاً للمنهج الرسمي التونسي شكلاً ومضموناً.

2. القاعدة الذهبية غير القابلة للتفاوض :
> **لا مرجعية سوى البرنامج الرسمي التونسي (وزارة التربية — المركز الوطني البيداغوجي CNP).**
- **الالتزام الحرفي المطلق بنص الكتاب المدرسي والمرفقات (Verbatim 100%):**
  🚫 ممنوع منعاً باتاً تحريف أو تعديل أو إعادة صياغة نصوص الأنشطة والتمارين من الكتاب المدرسي!
  - انقل الجمل كما هي لفظياً وحرفياً وكلمة بكلمة. (مثال: إذا كان في الكتاب «أنجز عمليات القسمة لـ : 7 على 12,5 ثم 9 على 17 ثم 3 على 4 و 65 على 22» فاكتبها حرفياً كما هي دون تحويلها إلى كسور ودون قلب أي أعداد).
  - لا تحوّل صيغة القسمة اللفظية «a على b» إلى كسور من تلقاء نفسك ما لم تكن مكتوبة ككسر صريح في الكتاب الأصلي.
  - احرص على إبقاء الجذور التربيعية بصيغة LaTeX الصحيحة $\\sqrt{2}$ و $\\sqrt{3}$ و $\\sqrt{a}$.
  - 🚫 **الأنشطة والتطبيقات والتمارين تُدرج دون إصلاح/تصحيح مرفق (لا يُقدَّم الحل الجاهز)**.

3. النبرة واللغة الرسمية :
- لغة عربية فصحى تربوية مهنية لكافة المواد المعرّبة.
- مادة اللغة الفرنسية: تُحرر الجذاذة والبوستر بالكامل باللغة الفرنسية (Fiche pédagogique).
- مادة اللغة الإنجليزية: يُحرر مخطط الدرس والبوستر بالكامل باللغة الإنجليزية (Lesson plan).
- المواد العلمية بالثانوي: بالفرنسية كما هو معتمد رسمياً في تونس.
`;

const MATH_STRICT_RULES = `
🚨 قواعد الرياضيات الصارمة (المنهاج التونسي الرسمي):
1. كل عبارة رياضية تُكتب بصيغة LaTeX محاطة بـ $...$ أو $$...$$ حتى الأعداد البسيطة والكسور.
2. اتجاه المعادلات LTR دائماً دون قلب اتجاه الرموز أو الأرقام.
3. الفاصلة العشرية بالفاصلة (,) وليس بالنقطة (.) — مثال: $3{,}5$ وليس $3.5$.
4. رموز المجموعات العددية الرسمية: $\\mathbb{N}$، $\\mathbb{Z}$، $\\mathbb{D}$، $\\mathbb{Q}$، $\\mathbb{R}$.
5. الأعداد العشرية الدورية في المنهاج التونسي: يُرمز للدور بوضع خط تحته $\\underline{...}$ أو فوقه $\\overline{...}$ (مثال: $5{,} \\underline{6}$ أو $5{,} \\overline{60}$).
6. الأقواس والمجالات: استعمل \\left( ... \\right) و \\left[ ... \\right] مثل $[a \\,;\\, b]$ و $\\left] -\\infty \\,;\\, 5 \\right]$.
7. نفس ترتيب عرض الخاصيات والبراهين المعتمد في الكتاب المدرسي التونسي (لا اجتهاد شخصي).
8. 📐 الرسوم الهندسية المتجهة SVG التلقائية: عندما يتطلب الدرس أو النشاط شكلاً توضيحياً، أدرج وسم الرسم المناسب مثل:
   - مستقيم مدرج ومجال: [GEOMETRY: number_line { min: -5, max: 5, intervals: [{ from: -2, to: 3, includeFrom: true, includeTo: false, color: "#2563eb" }], points: [{ name: "A", val: -3 }] }]
   - معلم في المستوي: [GEOMETRY: coordinate_plane { xMin: -4, xMax: 4, yMin: -3, yMax: 3, points: [{ name: "A", x: 2, y: 1 }] }]
   - مثلث قائم (بيتاغور): [GEOMETRY: right_triangle { a: "A", b: "B", c: "C", rightAt: "A", ab: 3, ac: 4, bc: 5 }]
   - مخطط المجموعات العددية: [GEOMETRY: sets {}]
`;

function getSubjectRules(subjectId, lang) {
  const rules = {
    math: MATH_STRICT_RULES,
    pc: (lang === "fr")
      ? `\n⚗️ Règles Sciences Physiques :\n- Respecter les unités du Système International (SI) et l'écriture scientifique.\n- Démarche expérimentale : Situation de départ → Problématique → Hypothèse → Protocole expérimental → Résultats & Mesures → Interprétation → Conclusion.\n- Formules, constantes et symboles conformes au manuel officiel tunisien (CNP).`
      : `\n⚗️ قواعد العلوم الفيزيائية:\n- احترام وحدات النظام الدولي (SI) والكتابة العلمية.\n- النهج التجريبي: وضعية الانطلاق ← الإشكالية ← الفرضية ← التجربة والقياسات ← التفسير ← الاستنتاج والقانون.\n- الصيغ والرموز مطابقة حرفياً لكتاب التلميذ التونسي.`,
    svt: (lang === "fr")
      ? `\n🌿 Règles Sciences de la Vie et de la Terre (SVT) :\n- Démarche d'investigation scientifique : Observation → Problème biologique/géologique → Hypothèse → Activité d'investigation → Bilan conceptuel.\n- Vocabulaire et schémas fonctionnels conformes aux manuels officiels tunisiens.`
      : `\n🌿 قواعد علوم الحياة والأرض:\n- نهج التقصي العلمي: الملاحظة ← طرح المشكل العلمي ← صياغة الفرضيات ← أنشطة التقصي والتحليل ← حوصلة وبناء المفهوم.\n- المصطلحات والرسوم البيانية مطابقة للكتاب المدرسي التونسي.`,
    ar: `\n📝 قواعد مادة اللغة العربية وآدابها:\n- التحرير باللغة العربية الفصحى السليمة الخالية من أي شوائب.\n- الأنشطة: نصوص الانطلاق، أسئلة الفهم والتحليل، القواعد النحوية والصرفية والبلاغية المقررة لمستوى القسم فقط.\n- الالتزام التام بالمصطلحات البيداغوجية المعتمدة في وثائق المرافقة لوزارة التربية التونسية.`,
    fr: `\n🇫🇷 Règles spécifiques de Français :\n- L'intégralité du document (titres, objectifs, consignes, étapes) est rédigée en français.\n- Démarche pédagogique : Découverte / Mise en situation → Analyse & Observation → Règle / Conceptualisation → Entraînement / Réinvestissement.\n- Textes, corpus et vocabulaire rigoureusement conformes au manuel officiel tunisien.`,
    en: `\n🇬🇧 English Subject Specific Guidelines :\n- The entire document (titles, instructions, pedagogical stages) must be written in pure English.\n- Follow the official competence-based Tunisian framework: Warm-up → Presentation / Text Exploration → Language Focus (Grammar/Vocabulary) → Controlled Practice → Free Production.\n- Conforms strictly to the official Tunisian syllabus and coursebooks.`,
    info: (lang === "fr")
      ? `\n💻 Règles Informatique :\n- Algorithmes en pseudocode officiel tunisien (Vocabulaire : Algorithme, Variables, Début, Fin, Pour...faire, Si...alors...sinon).\n- Code Python et bases de données conformes aux programmes officiels.`
      : `\n💻 قواعد مادة الإعلامية:\n- خوارزميات بالمخططات الانسيابية والشبه رمز المعتمد رسمياً في تونس.\n- أمثلة وتطبيقات برمجية مطابقة لمنهاج المرحلة.`,
    techno: `\n🔧 قواعد مادة التربية التكنولوجية:\n- التحليل الوظيفي (أداة التعبير عن الحاجة، مخطط Bête à cornes، مخطط Pieuvre / FAST).\n- قراءة الرسم التكنولوجي والدارات المنطقية والكهربائية وفق الرموز الاصطلاحية التونسية الرسمية.`,
    eco: `\n📊 Règles Économie et Gestion :\n- Concepts économiques, formules de gestion, tableaux comptables et analyse de documents selon le programme tunisien.\n- Exemples appliqués au tissu économique tunisien.`,
    philo: `\n🧠 قواعد مادة الفلسفة:\n- الجذاذة بالعربية الفصحى مع المصطلحات الفلسفية الدقيقة المعتمدة في المنهاج التونسي.\n- منهجية التفلسف: المشكلة الفلسفية، المفاهيم، الأطروحة، الأطروحة المستبعدة، والمناقشة النقدية.`
  };
  return rules[subjectId] || "";
}

// ── 1. BUILD SUMMARY / MIND MAP PROMPT ────────────────────
function buildSummaryPrompt({ teacherName, schoolName, levelLabel, subjectId, subjectLabel, unitVal, titleVal, langVal, bookContext, knowledgeContextText }) {
  const isFr = (langVal === "fr");
  const isEn = (langVal === "en");
  const stagesText = stagesTextForPrompt(langVal);
  const subjectRules = getSubjectRules(subjectId, langVal);
  const kContext = knowledgeContextText || "";

  if (isFr) {
    return `${SYSTEM_PROMPT}

${kContext}

🎯 MISSION : Concevoir un POSTER INFOGRAPHIQUE DIDACTIQUE & CARTE MENTALE HAUTE DÉFINITION (Mind Map visuelle moderne) pour la leçon : "${titleVal}".

⚠️ DIRECTIVES OFFICIELLES STRICTES :
1. Rédige l'intégralité du poster en FRANÇAIS conforme strictement aux programmes officiels tunisiens (CNP).
2. 🚫 AUCUN TEXTE SÉQUENTIEL D'ACTIVITÉS NI D'EXERCICES. Ce document est un POSTER SYNTHÉTIQUE ET VISUEL.
3. 🚫 STRICTEMENT AUCUN AJOUT DE NOTIONS HORS PROGRAMME. Fidélité absolue au manuel scolaire tunisien.
4. Structure riche et captivante avec badges colorés, arbre conceptuel, définitions illustrées, tableau comparatif, radar des erreurs et questions flash.
${subjectRules}

Données de la séance :
- Professeur : ${teacherName} | Établissement : ${schoolName}
- Niveau : ${levelLabel} | Discipline : ${subjectLabel}
${unitVal ? `- Chapitre : ${unitVal}` : ""}
- Titre : ${titleVal}

Concepts clés du manuel :
${stagesText || "(Conforme au programme officiel tunisien)"}
${bookContext}

--- STRUCTURE HTML DU POSTER INFOGRAPHIQUE DIDACTIQUE :

\`\`\`html
<div class="poster-container">
  <!-- 1. En-tête Hero du Poster -->
  <div class="poster-hero-banner">
    <div class="poster-badge-top">
      <span class="poster-pill-unit">📍 ${unitVal || "Chapitre"}</span>
      <span class="poster-pill-subject">🎓 ${subjectLabel} — ${levelLabel}</span>
    </div>
    <h1 class="poster-hero-title">🌟 ${titleVal}</h1>
    <p class="poster-hero-subtitle">[Objectif d'apprentissage majeur & Compétence clé du CNP]</p>
  </div>

  <!-- 2. Grille Supérieure : Définitions Clés & Arbre Conceptuel -->
  <div class="poster-grid-2">
    <div class="poster-section-card theme-red">
      <div class="poster-card-badge">📖 1. Définitions & Notions Clés</div>
      <div class="poster-def-list">
        <div class="poster-def-item">
          <div class="poster-def-icon">🧊</div>
          <div class="poster-def-content">
            <strong>[Concept 1] :</strong>
            <p>[Définition concise du manuel avec formules $...$]</p>
          </div>
        </div>
        <div class="poster-def-item">
          <div class="poster-def-icon">⚛️</div>
          <div class="poster-def-content">
            <strong>[Concept 2] :</strong>
            <p>[Définition ou théorème clé $...$]</p>
          </div>
        </div>
      </div>
    </div>

    <div class="poster-section-card theme-green">
      <div class="poster-card-badge">🧠 2. Arbre Conceptuel & Flowchart</div>
      <div class="poster-tree-flow">
        <div class="poster-tree-node node-root">[Concept Central]</div>
        <div class="poster-tree-arrow">⬇️</div>
        <div class="poster-tree-node">[Sous-Concept Clé]</div>
        <div class="poster-tree-arrow">⬇️</div>
        <div class="poster-tree-branches">
          <div class="poster-subnode">[Branche A $...$]</div>
          <div class="poster-subnode">[Branche B $...$]</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3. Grille Médiane : Règles d'Or & Mémorisation Rapide -->
  <div class="poster-grid-2">
    <div class="poster-section-card theme-orange">
      <div class="poster-card-badge">📏 3. Propriétés & Règles Officielles</div>
      <div class="cards-grid" style="margin-top:8px;">
        <div class="card-box card-blue">
          <div class="card-header"><span class="card-icon">🔹</span>[Condition 1]</div>
          <ul><li>[Détail formel avec KaTeX $...$]</li></ul>
        </div>
        <div class="card-box card-orange">
          <div class="card-header"><span class="card-icon">🔸</span>[Condition 2]</div>
          <ul><li>[Détail formel avec KaTeX $...$]</li></ul>
        </div>
      </div>
    </div>

    <div class="poster-section-card theme-blue">
      <div class="poster-card-badge">⏱️ 4. Pour Mémoriser en 1 Minute</div>
      <div class="poster-pipeline" style="margin-top:8px;">
        <div class="poster-pipe-step">
          <span class="poster-pipe-badge">Étape 1</span>
          <span>[Action méthodique essentielle]</span>
        </div>
        <div class="poster-pipe-step">
          <span class="poster-pipe-badge">Étape 2</span>
          <span>[Règle d'application directe $...$]</span>
        </div>
        <div class="poster-pipe-step">
          <span class="poster-pipe-badge">Résultat</span>
          <span>[Propriété déduite ou formule type]</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. Tableau de Synthèse & Points Clés -->
  <div class="poster-section-card theme-purple">
    <div class="poster-card-badge">📊 5. Tableau Comparatif & Synthèse des Cas</div>
    <table>
      <thead>
        <tr>
          <th>Élément / Cas</th>
          <th>Condition requise</th>
          <th>Formule / Propriété</th>
          <th>Exemple type</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>[Cas 1]</strong></td>
          <td>[Condition A]</td>
          <td>[$...$]</td>
          <td>[$...$]</td>
        </tr>
        <tr>
          <td><strong>[Cas 2]</strong></td>
          <td>[Condition B]</td>
          <td>[$...$]</td>
          <td>[$...$]</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 5. Radar des Erreurs & Questions Flash -->
  <div class="poster-grid-2">
    <div class="pitfalls-box">
      <div class="pitfalls-title">⚠️ Radar des Erreurs Fréquentes à Éviter :</div>
      <ul>
        <li>❌ <strong>Erreur courante :</strong> [Obstacle didactique] ➔ ✔️ <strong>Règle exacte :</strong> [Correction avec $...$]</li>
        <li>⚠️ <strong>Attention :</strong> [Confusion fréquente à proscrire]</li>
      </ul>
    </div>

    <div class="poster-section-card theme-blue">
      <div class="poster-card-badge">❓ 6. Questions Flash d'Auto-Évaluation</div>
      <div class="poster-questions-strip">
        <div class="poster-q-box">
          <span class="poster-q-num">1</span>
          <span>[Question flash directe 1 ?]</span>
        </div>
        <div class="poster-q-box">
          <span class="poster-q-num">2</span>
          <span>[Question flash directe 2 ?]</span>
        </div>
        <div class="poster-q-box">
          <span class="poster-q-num">3</span>
          <span>[Vrai ou faux avec justification ?]</span>
        </div>
      </div>
    </div>
  </div>
</div>
\`\`\`

🔍 AUTO-VÉRIFICATION : Assure-toi que les termes sont 100% conformes au programme tunisien, les formules en LaTeX, et aucune solution d'exercice n'est incluse.
Génère le poster infographique didactique complet maintenant :`;
  }

  if (isEn) {
    return `${SYSTEM_PROMPT}

🎯 MISSION : Design a high-impact DIDACTIC INFOGRAPHIC POSTER & CONCEPT MIND MAP for the lesson: "${titleVal}".

⚠️ STRICT OFFICIAL GUIDELINES (TUNISIAN ENGLISH CURRICULUM):
1. Write the entire poster in clear, academic ENGLISH matching the official Tunisian English syllabus.
2. 🚫 NO LONG NARRATIVE EXERCISES. This is a VISUAL, high-contrast pedagogical poster.
3. 🚫 ZERO CONTENT OUTSIDE THE OFFICIAL SYLLABUS. Absolute fidelity to Tunisian coursebooks.
4. Structure: Hero Header, Definitions & Key Functions, Concept Tree Flowchart, Core Grammar/Lexical Rules, 1-Minute Memorizer Pipeline, Summary Table, Common Pitfalls Radar, and Quick Flash Questions.
${subjectRules}

Lesson Details:
- Teacher: ${teacherName} | School: ${schoolName}
- Level: ${levelLabel} | Subject: ${subjectLabel}
${unitVal ? `- Unit / Module: ${unitVal}` : ""}
- Topic: ${titleVal}

Textbook Elements:
${stagesText || "(Conforming to official Tunisian coursebook)"}
${bookContext}

--- HTML POSTER STRUCTURE:

\`\`\`html
<div class="poster-container">
  <!-- 1. Hero Poster Header -->
  <div class="poster-hero-banner">
    <div class="poster-badge-top">
      <span class="poster-pill-unit">📍 ${unitVal || "Module"}</span>
      <span class="poster-pill-subject">🎓 ${subjectLabel} — ${levelLabel}</span>
    </div>
    <h1 class="poster-hero-title">🌟 ${titleVal}</h1>
    <p class="poster-hero-subtitle">[Core Communicative Function & Target Competence]</p>
  </div>

  <!-- 2. Top Grid: Key Definitions & Mind Map Flowchart -->
  <div class="poster-grid-2">
    <div class="poster-section-card theme-red">
      <div class="poster-card-badge">📖 1. Key Concepts & Functions</div>
      <div class="poster-def-list">
        <div class="poster-def-item">
          <div class="poster-def-icon">💡</div>
          <div class="poster-def-content">
            <strong>[Concept / Function 1]:</strong>
            <p>[Concise definition with target language]</p>
          </div>
        </div>
        <div class="poster-def-item">
          <div class="poster-def-icon">🎯</div>
          <div class="poster-def-content">
            <strong>[Concept / Function 2]:</strong>
            <p>[Key linguistic or communicative rule]</p>
          </div>
        </div>
      </div>
    </div>

    <div class="poster-section-card theme-green">
      <div class="poster-card-badge">🧠 2. Concept Tree & Structure</div>
      <div class="poster-tree-flow">
        <div class="poster-tree-node node-root">[Central Theme]</div>
        <div class="poster-tree-arrow">⬇️</div>
        <div class="poster-tree-node">[Key Linguistic Focus]</div>
        <div class="poster-tree-arrow">⬇️</div>
        <div class="poster-tree-branches">
          <div class="poster-subnode">[Form / Rule]</div>
          <div class="poster-subnode">[Usage / Meaning]</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3. Middle Grid: Core Rules & 1-Minute Memorizer -->
  <div class="poster-grid-2">
    <div class="poster-section-card theme-orange">
      <div class="poster-card-badge">📏 3. Target Language Structures</div>
      <div class="cards-grid" style="margin-top:8px;">
        <div class="card-box card-blue">
          <div class="card-header"><span class="card-icon">🔹</span>[Structure A]</div>
          <ul><li>[Rule explanation]</li><li>[Model sentence]</li></ul>
        </div>
        <div class="card-box card-orange">
          <div class="card-header"><span class="card-icon">🔸</span>[Structure B]</div>
          <ul><li>[Rule explanation]</li><li>[Model sentence]</li></ul>
        </div>
      </div>
    </div>

    <div class="poster-section-card theme-blue">
      <div class="poster-card-badge">⏱️ 4. Quick Rule in 1 Minute</div>
      <div class="poster-pipeline" style="margin-top:8px;">
        <div class="poster-pipe-step">
          <span class="poster-pipe-badge">Step 1</span>
          <span>[Identify the context / keyword]</span>
        </div>
        <div class="poster-pipe-step">
          <span class="poster-pipe-badge">Step 2</span>
          <span>[Apply the correct grammatical form]</span>
        </div>
        <div class="poster-pipe-step">
          <span class="poster-pipe-badge">Output</span>
          <span>[Accurate communicative utterance]</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. Synthesis Table -->
  <div class="poster-section-card theme-purple">
    <div class="poster-card-badge">📊 5. Summary & Contrast Table</div>
    <table>
      <thead>
        <tr>
          <th>Category / Form</th>
          <th>Usage & Function</th>
          <th>Structure</th>
          <th>Model Example</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>[Form 1]</strong></td>
          <td>[Function]</td>
          <td>[Form rule]</td>
          <td>[Example sentence]</td>
        </tr>
        <tr>
          <td><strong>[Form 2]</strong></td>
          <td>[Function]</td>
          <td>[Form rule]</td>
          <td>[Example sentence]</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 5. Pitfalls & Flash Questions -->
  <div class="poster-grid-2">
    <div class="pitfalls-box">
      <div class="pitfalls-title">⚠️ Common Mistakes to Avoid:</div>
      <ul>
        <li>❌ <strong>Common Error:</strong> [Typical learner mistake] ➔ ✔️ <strong>Correct Form:</strong> [Accurate usage]</li>
        <li>⚠️ <strong>Watch out:</strong> [False friends or tricky irregular forms]</li>
      </ul>
    </div>

    <div class="poster-section-card theme-blue">
      <div class="poster-card-badge">❓ 6. Flash Self-Check Questions</div>
      <div class="poster-questions-strip">
        <div class="poster-q-box">
          <span class="poster-q-num">1</span>
          <span>[Flash review question 1?]</span>
        </div>
        <div class="poster-q-box">
          <span class="poster-q-num">2</span>
          <span>[Flash review question 2?]</span>
        </div>
        <div class="poster-q-box">
          <span class="poster-q-num">3</span>
          <span>[True or False with brief reason?]</span>
        </div>
      </div>
    </div>
  </div>
</div>
\`\`\`

🔍 SELF-VERIFICATION: Verify 100% alignment with Tunisian curriculum standards and no answer keys inside the poster.
Generate the complete English pedagogical infographic poster now:`;
  }

  // 🇹🇳 ARABIC SUMMARY / MIND MAP PROMPT
  return `${SYSTEM_PROMPT}

🎯 المهمة: تصميم **بطاقة درس ورسم تخطيطي لخريطة ذهنية تعليمية عصرية (Modern Educational Radial Mind Map)** لدرس: "${titleVal}".

⚠️ قواعد بيداغوجية ملزمة وقطعية:
1. الصياغة باللغة العربية الفصيحة الصافية 100% وفق المنهاج الرسمي وكتاب التلميذ التونسي (CNP).
2. 🚫 **الالتزام الحرفي التام بما ورد في الكتاب المدرسي دون أي إضافات أو مصطلحات خارجية**.
3. 🚫 **يُمنع منعاً باتاً سرد نصوص الأنشطة والتمارين المطولة**. المستند هو **خريطة ذهنية بصرية تعليمية عصرية منظمة ومختصرة**.
4. يجب أن تتكون الخريطة الذهنية البصرية من **العقدة المركزية** يحيط بها **6 فروع رئيسية محددة بوضوح**:
   - **المركز**: عنوان الدرس الكبير والفكرة الأساسية للدرس.
   - **الفرع 1 (🧠 المفاهيم والتعريفات)**: المفاهيم والتعريفات والكلمات المفتاحية الأساسية.
   - **الفرع 2 (📐 القواعد والخاصيات)**: القواعد والخاصيات والنظريات والشروط الرسمية.
   - **الفرع 3 (🔢 الصيغ والعلاقات)**: العلاقات الرياضية والمعادلات والرموز مكتوبة بـ KaTeX $...$.
   - **الفرع 4 (✏️ التطبيقات والأمثلة)**: تطبيق مباشر ومثال نموذجي قصير جداً من كتاب التلميذ (مع الحفاظ على مصدره أو علامة GENERATED).
   - **الفرع 5 (⚠️ الأخطاء الشائعة)**: الأخطاء التي يجب تجنبها والتنبيهات الديداكتيكية.
   - **الفرع 6 (⭐ ما يجب أن أتذكره)**: 3 إلى 5 نقاط قصيرة مكثفة للحفظ والتذكر السريع.
${subjectRules}

المعلومات:
- الأستاذ(ة): ${teacherName} | المؤسسة: ${schoolName}
- المستوى: ${levelLabel} | المادة: ${subjectLabel}
${unitVal ? `- المحور: ${unitVal}` : ""}
- عنوان الدرس: ${titleVal}

مفاهيم وعناصر كتاب التلميذ التونسي:
${stagesText || "(معتمد على كتاب التلميذ التونسي)"}
${bookContext}

--- بنية الخريطة الذهنية التعليمية العصرية (HTML/CSS):

\`\`\`html
<div class="mindmap-radial-container mindmap-radial-layout mindmap-v2">

  <!-- 🎨 وصلات SVG البصرية للفروع -->
  <svg class="mindmap-connectors-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="grad-concepts" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
      <linearGradient id="grad-rules" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#16a34a"/></linearGradient>
      <linearGradient id="grad-formulas" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#9333ea"/></linearGradient>
      <linearGradient id="grad-apps" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
      <linearGradient id="grad-pitfalls" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#e11d48"/></linearGradient>
      <linearGradient id="grad-remember" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#0d9488"/></linearGradient>
    </defs>
    <path class="svg-branch-line" stroke="url(#grad-concepts)" d="M 500 280 C 500 200, 500 150, 500 90" />
    <path class="svg-branch-line" stroke="url(#grad-rules)" d="M 620 310 C 720 280, 800 200, 830 110" />
    <path class="svg-branch-line" stroke="url(#grad-formulas)" d="M 380 310 C 280 280, 200 200, 170 110" />
    <path class="svg-branch-line" stroke="url(#grad-apps)" d="M 620 390 C 730 420, 800 480, 830 580" />
    <path class="svg-branch-line" stroke="url(#grad-pitfalls)" d="M 380 390 C 270 420, 200 480, 170 580" />
    <path class="svg-branch-line" stroke="url(#grad-remember)" d="M 500 420 C 500 480, 500 540, 500 610" />
  </svg>

  <!-- 🌟 العقدة المركزية البارزة -->
  <div class="mindmap-center-node mindmap-pos-center central-node">
    <div class="mindmap-center-badge">
      <span class="pill-unit">📍 ${unitVal || "المحور"}</span>
      <span class="pill-level">🎓 ${subjectLabel} — ${levelLabel}</span>
    </div>
    <h1 class="mindmap-center-title">📘 ${titleVal}</h1>
    <div class="mindmap-center-idea">
      <span class="idea-label">💡 الفكرة الأساسية:</span>
      <p>[الفكرة المحورية والهدف الجوهري للدرس من كتاب التلميذ التونسي]</p>
    </div>
  </div>

  <!-- 🧠 الفرع 1: المفاهيم والتعريفات (أعلى) -->
  <div class="mindmap-branch-card branch-top mindmap-pos-top theme-concepts">
    <div class="branch-header">
      <span class="branch-icon">🧠</span>
      <span class="branch-title">المفاهيم والتعريفات</span>
    </div>
    <div class="branch-body">
      <div class="mindmap-chip">💡 <strong>[المفهوم 1]:</strong> [التعريف المختصر من كتاب التلميذ $...$]</div>
      <div class="mindmap-chip">📖 <strong>[المفهوم 2]:</strong> [التعريف المختصر من كتاب التلميذ $...$]</div>
    </div>
  </div>

  <!-- 📐 الفرع 2: القواعد والخاصيات (أعلى اليمين) -->
  <div class="mindmap-branch-card branch-top-right mindmap-pos-right theme-rules">
    <div class="branch-header">
      <span class="branch-icon">📐</span>
      <span class="branch-title">القواعد والخاصيات</span>
    </div>
    <div class="branch-body">
      <div class="mindmap-chip">🔹 <strong>[قاعدة 1]:</strong> [نص القاعدة الرسمية $...$]</div>
      <div class="mindmap-chip">🔸 <strong>[خاصية 2]:</strong> [نص الخاصية أو الشرط $...$]</div>
    </div>
  </div>

  <!-- 🔢 الفرع 3: الصيغ والعلاقات (أعلى اليسار) -->
  <div class="mindmap-branch-card branch-top-left mindmap-pos-left theme-formulas">
    <div class="branch-header">
      <span class="branch-icon">🔢</span>
      <span class="branch-title">الصيغ والعلاقات</span>
    </div>
    <div class="branch-body">
      <div class="mindmap-chip math-chip">🔹 [العلاقة 1]: $...$</div>
      <div class="mindmap-chip math-chip">🔸 [العلاقة 2]: $...$</div>
    </div>
  </div>

  <!-- ✏️ الفرع 4: التطبيقات والأمثلة (أسفل اليمين) -->
  <div class="mindmap-branch-card branch-bottom-right mindmap-pos-bottom-right theme-apps">
    <div class="branch-header">
      <span class="branch-icon">✏️</span>
      <span class="branch-title">التطبيقات والأمثلة</span>
    </div>
    <div class="branch-body">
      <div class="example-mini-box">
        <strong>📌 مثال نموذجي قصير:</strong>
        <p><strong>المعطيات:</strong> [$...$]</p>
        <p><strong>التطبيق:</strong> [$...$]</p>
      </div>
    </div>
  </div>

  <!-- ⚠️ الفرع 5: الأخطاء الشائعة (أسفل اليسار) -->
  <div class="mindmap-branch-card branch-bottom-left mindmap-pos-bottom-left theme-pitfalls">
    <div class="branch-header">
      <span class="branch-icon">⚠️</span>
      <span class="branch-title">الأخطاء الشائعة</span>
    </div>
    <div class="branch-body">
      <div class="mindmap-chip pitfall-chip">❌ [الخطأ الشائع] ➔ ✔️ [الصواب العلمي: $...$]</div>
    </div>
  </div>

  <!-- ⭐ الفرع 6: ما يجب أن أتذكره (أسفل) -->
  <div class="mindmap-branch-card branch-bottom theme-remember">
    <div class="branch-header">
      <span class="branch-icon">⭐</span>
      <span class="branch-title">ما يجب أن أتذكره</span>
    </div>
    <div class="branch-body remember-pills">
      <span class="remember-pill">1️⃣ [نقطة التذكر الأولى]</span>
      <span class="remember-pill">2️⃣ [نقطة التذكر الثانية]</span>
      <span class="remember-pill">3️⃣ [نقطة التذكر الثالثة]</span>
    </div>
  </div>

</div>
\`\`\`

🔍 التحقق الذاتي الداخلي قبل التسليم:
- هل الخريطة الذهنية محاطة بـ 6 فروع رئيسية حول العقدة المركزية البارزة؟
- هل الرياضيات مصوغة بـ KaTeX LTR والنص العربي RTL؟
- هل خلت الوثيقة من أي إجابات أو حلول تمرين مطولة؟
أنشئ الخريطة الذهنية التعليمية العصرية لدرس "${titleVal}" الآن بالعربية الصافية:`;
}


// ── 2. BUILD COMPREHENSIVE FICHE PROMPT ───────────────────
function buildFichePrompt({ teacherName, schoolName, levelLabel, subjectId, subjectLabel, unitVal, titleVal, langVal, bookContext, knowledgeContextText }) {
  const isFr = (langVal === "fr");
  const isEn = (langVal === "en");
  const duration   = $("duration").value;
  const sessionNum = ($("sessionNum") || {}).value || "";
  const objectives = ($("objectives") || {}).value || "";
  const materials  = ($("materials") || {}).value || "";
  const stagesText = stagesTextForPrompt(langVal);
  const subjectRules = getSubjectRules(subjectId, langVal);
  const kContext = knowledgeContextText || "";

  if (isFr) {
    return `${SYSTEM_PROMPT}

${kContext}

🎯 MISSION : Rédiger la FICHE PÉDAGOGIQUE OFFICIELLE COMPLÈTE (الجذاذة البيداغوجية الرسمية الشاملة) intégrant l'intégralité des composantes et contenus didactiques de la leçon selon les 5 étapes officielles tunisiennes.

⚠️ DIRECTIVES OFFICIELLES STRICTES :
1. Rédige l'intégralité du document en FRANÇAIS conforme aux programmes officiels tunisiens (CNP).
2. 🚫 AUCUN CORRIGÉ OU SOLUTION dans la fiche pédagogique.
3. Démarche didactique officielle intégrale :
   - Cadre administratif officiel
   - Objectifs cognitifs & méthodologiques
   - Étape 1 : Rappel des prérequis (questions diagnostiques complètes)
   - Étape 2 : Activité d'exploration & construction du concept (texte intégral, tableaux)
   - Étape 3 : Propriétés officielles & institutionnalisation (théorèmes avec cartes de conditions)
   - Étape 4 : Application immédiate (questions directes)
   - Étape 5 : Exercices d'entraînement et travail autonome
   - Remarques didactiques et erreurs prévisibles des élèves
4. 📖 Conformité stricte 100% avec les énoncés, tableaux, nombres et figures du manuel scolaire officiel.
${subjectRules}

Données de la fiche :
- Professeur : ${teacherName} | Établissement : ${schoolName}
- Discipline : ${subjectLabel} | Niveau : ${levelLabel}
${unitVal ? `- Chapitre : ${unitVal}` : ""}
${sessionNum ? `- Séance : ${sessionNum}` : ""}
- Titre : ${titleVal} | Durée : ${duration}
${materials ? `- Matériel didactique : ${materials}` : "- Matériel : Manuel officiel tunisien, tableau, outils didactiques"}
${objectives ? `- Objectifs d'apprentissage : ${objectives}` : "- Objectifs : Connaître les notions clés, appliquer les propriétés et résoudre des situations problèmes conformément au programme officiel."}

Éléments joints du manuel et contexte :
${stagesText || "(Conforme au manuel officiel tunisien)"}
${bookContext}

--- STRUCTURE EXACTE DE LA FICHE PÉDAGOGIQUE OFFICIELLE :

\`\`\`html
<!-- 1. Fiche de présentation générale -->
<div class="official-admin-block">
  <table class="fiche-presentation-table">
    <tr>
      <td colspan="2"><strong>République Tunisienne — Ministère de l'Éducation</strong> | <strong>Établissement :</strong> ${schoolName}</td>
      <td colspan="2"><strong>Année scolaire :</strong> ${schoolYear}</td>
    </tr>
    <tr>
      <td><strong>Enseignant(e) :</strong> ${teacherName}</td>
      <td><strong>Discipline :</strong> ${subjectLabel}</td>
      <td><strong>Niveau :</strong> ${levelLabel}</td>
      <td><strong>Durée :</strong> ${duration}</td>
    </tr>
    <tr>
      <td colspan="2"><strong>Chapitre :</strong> ${unitVal || "Programme officiel"}</td>
      <td colspan="2"><strong>Titre de la leçon :</strong> ${titleVal}</td>
    </tr>
    <tr>
      <td colspan="2"><strong>🎯 Compétences visées :</strong> [Compétences mathématiques et méthodologiques visées]</td>
      <td colspan="2"><strong>📌 Objectifs opérationnels :</strong> [Objectifs d'apprentissage de la séance]</td>
    </tr>
    <tr>
      <td colspan="2"><strong>🧠 Prérequis nécessaires :</strong> [Notions et règles antérieures nécessaires]</td>
      <td colspan="2"><strong>🛠️ Supports didactiques :</strong> [Manuel CNP, tableau, instruments de géométrie, calculatrice]</td>
    </tr>
  </table>
</div>

<!-- 2. Planification temporelle de la séance -->
<div class="timing-plan-box">
  <h4 class="timing-title">⏱️ Planification temporelle du déroulement de la séance (${duration}) :</h4>
  <table class="session-timing-table">
    <thead>
      <tr>
        <th>Étape pédagogique</th>
        <th>Durée</th>
        <th>Activité de l'élève</th>
        <th>Rôle et consignes de l'enseignant</th>
        <th>Modalité</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Rappel des prérequis</strong></td>
        <td>10 min</td>
        <td>Répondre aux questions diagnostiques</td>
        <td>Poser les questions et évaluer les acquis</td>
        <td>Individuel / Oral</td>
      </tr>
      <tr>
        <td><strong>2. Activité d'exploration</strong></td>
        <td>15 min</td>
        <td>Lire l'activité du manuel et observer les données</td>
        <td>Guider l'observation vers le nouveau concept</td>
        <td>Groupes / Collectif</td>
      </tr>
      <tr>
        <td><strong>3. Institutionnalisation (Règle)</strong></td>
        <td>10 min</td>
        <td>Formuler la propriété et noter dans le cahier</td>
        <td>Valider la formulation mathématique rigoureuse</td>
        <td>Collectif / Écrit</td>
      </tr>
      <tr>
        <td><strong>4. Application immédiate</strong></td>
        <td>10 min</td>
        <td>Résoudre l'application directe</td>
        <td>Contrôler et identifier les blocages initiaux</td>
        <td>Individuel</td>
      </tr>
      <tr>
        <td><strong>5. Exercice d'entraînement</strong></td>
        <td>10 min</td>
        <td>Résoudre l'exercice et noter le travail à domicile</td>
        <td>Évaluer la maîtrise et fixer le devoir</td>
        <td>Individuel</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 3. Contenu détaillé des 5 étapes -->
<!-- 1) Rappel -->
<div class="stage-card-remind">
  <h4>🧠 1) Rappel — Révision des prérequis diagnostiques</h4>
  [Questions diagnostiques complètes avec valeurs numériques — sans corrigé]
</div>

<!-- 2) Activité -->
<div class="stage-card-activity">
  <h4>🎯 2) Activité — Exploration et construction du concept</h4>
  <p><strong>[Activité ... Page ... du manuel de l'élève]</strong></p>
  [Énoncé complet et fidèle du manuel avec questions et tableau — sans corrigé]
</div>

<!-- 3) Règle -->
<div class="stage-card-rule">
  <h4>📏 3) Règle — Propriété officielle</h4>
  <p><strong>Énoncé officiel :</strong> [Théorème ou propriété officielle du CNP avec KaTeX $...$]</p>
  [Schéma SVG ou diagramme si approprié]
</div>

<!-- 4) Application -->
<div class="stage-card-app">
  <h4>✏️ 4) Application — Fixation immédiate</h4>
  [Questions de calcul direct sans corrigé]
</div>

<!-- 5) Exercice -->
<div class="stage-card-exercise">
  <h4>📐 5) Exercice — Travail individuel et devoir maison</h4>
  <p><strong>Exercices extraits du manuel (Page ...) :</strong></p>
  [Énoncés complets du manuel sans corrigé]
</div>

<!-- 4. Erreurs fréquentes et remédiation -->
<div class="stage-card-remediation">
  <h4>⚠️ 6) Erreurs fréquentes & Pistes de remédiation pédagogique</h4>
  <table>
    <thead>
      <tr>
        <th>Erreur fréquente prévisible</th>
        <th>Origine de l'erreur (Obstacle)</th>
        <th>Stratégie de remédiation immédiate</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>[Erreur 1]</td>
        <td>[Cause pédagogique]</td>
        <td>[Piste de remédiation]</td>
      </tr>
      <tr>
        <td>[Erreur 2]</td>
        <td>[Cause pédagogique]</td>
        <td>[Piste de remédiation]</td>
      </tr>
    </tbody>
  </table>
</div>
\`\`\`

Rédige la fiche officielle complète en français maintenant en commençant directement par \`<div class="official-admin-block">\` :`;
  }

  // 🏫 MIDDLE SCHOOL (COLLÈGE) — COMPREHENSIVE OFFICIAL PEDAGOGICAL FICHE (100% ARABIC)
  return `بصفتك أستاذاً متفقداً عاماً للتربية بالجمهورية التونسية، أعِدّ الجذاذة البيداغوجية الرسمية الكاملة لدرس "${titleVal}" وفق الهيكل الرسمي للجذاذة التونسية بدقة صارمة.

════════════════════════════════════════════════
🚨 القاعدة الذهبية المطلقة — لا استثناء:
• لا تخترع ولا تزيد ولا تنقص عن الكتاب المدرسي أبداً.
• كل محتوى النشاط والقاعدة والتطبيق والتمرين يُنقل حرفاً بحرف من كتاب التلميذ كما هو تماماً.
• إذا لم يُزوَّد نص الكتاب في المرفقات، اكتب: [يُكمل الأستاذ من الكتاب المدرسي الرسمي — الصفحة ...]
• ممنوع تقديم الحلول أو الإصلاحات في أي مرحلة.
• ابدأ الإخراج مباشرةً بـ <div class="official-admin-block"> دون أي مقدمة أو تعليق خارج الجذاذة.
════════════════════════════════════════════════

البيانات الإدارية:
- الأستاذ(ة): ${teacherName} | المؤسسة: ${schoolName} | السنة الدراسية: ${schoolYear}
- المادة: ${subjectLabel} | المستوى: ${levelLabel}${unitVal ? ` | المحور: ${unitVal}` : ""}
- عنوان الدرس: ${titleVal} | المدة: ${duration} | الحصة: ${sessionNum || "1"}
${objectives ? `- الأهداف الإجرائية: ${objectives}` : ""}
${materials ? `- الوسائل: ${materials}` : "- الوسائل: كتاب التلميذ (CNP)، السبورة، أدوات الهندسة، الآلة الحاسبة"}

نصوص الكتاب المدرسي المرفقة (انقلها حرفياً):
${stagesText || "(لم يُرفق نص — أشِر إلى الصفحات في كل مرحلة)"}
${bookContext}

${subjectRules}

--- هيكل الجذاذة الرسمي (اتبعه بالترتيب دون تغيير):

\`\`\`html
<!-- ════ 1. الترويسة البصرية الرئيسية الجذاذة الرسمية ════ -->
<div class="tunisian-fiche-banner">
  <div class="fiche-banner-right">
    <div class="fiche-school-badge">
      <span class="fiche-school-name">🏫 ${schoolName || "المدرسة الإعدادية / المعهد"}</span>
      <span class="fiche-year-pill">السنة الدراسية: ${schoolYear}</span>
    </div>
  </div>

  <div class="fiche-banner-center">
    <span class="fiche-title-pill">🏷️ ${titleVal}</span>
    <div class="fiche-axis-label">📍 المحور: ${unitVal || "البرنامج الرسمي"}</div>
  </div>

  <div class="fiche-banner-left">
    <span class="fiche-teacher-name">👨‍🏫 ${teacherName}</span>
    <span class="fiche-level-subject">📚 ${subjectLabel} — ${levelLabel}</span>
  </div>
</div>

<!-- ════ 2. البيانات الإدارية والكفايات ════ -->
<div class="official-admin-block">
  <table class="fiche-presentation-table">
    <tr>
      <td colspan="2"><strong>الجمهورية التونسية • وزارة التربية</strong> | <strong>المؤسسة:</strong> ${schoolName}</td>
      <td colspan="2"><strong>السنة الدراسية:</strong> ${schoolYear}</td>
    </tr>
    <tr>
      <td><strong>الأستاذ(ة):</strong> ${teacherName}</td>
      <td><strong>المستوى:</strong> ${levelLabel}</td>
      <td><strong>المادة:</strong> ${subjectLabel}</td>
      <td><strong>المدة الزمنية:</strong> ${duration}</td>
    </tr>
    <tr>
      <td colspan="2"><strong>المحور:</strong> ${unitVal || "مبرهنة طالس وتطبيقاتها"}</td>
      <td colspan="2"><strong>عنوان الدرس:</strong> ${titleVal}</td>
    </tr>
    <tr>
      <td colspan="2"><strong>🎯 الكفايات المستهدفة:</strong> [صياغة الكفايات المعرفية والمنهجية المستهدفة من كتاب التلميذ]</td>
      <td colspan="2"><strong>📌 الأهداف الإجرائية:</strong> [صياغة الأهداف الإجرائية السلوكية للحصة]</td>
    </tr>
    <tr>
      <td colspan="2"><strong>🧠 المكتسبات القبلية:</strong> [المفاهيم والقواعد السابقة الضرورية]</td>
      <td colspan="2"><strong>🛠️ الوسائل التعليمية:</strong> كتاب التلميذ (CNP) — السبورة — أدوات الهندسة — الآلة الحاسبة</td>
    </tr>
  </table>
</div>

<!-- ════ القسم 2: تقديم محتوى الحصة بالدقائق ════ -->
<div class="timing-plan-box">
  <h4 class="timing-title">⏱️ توزيع محتوى الحصة بالدقائق (${duration}) :</h4>
  <table class="session-timing-table">
    <thead>
      <tr>
        <th>المرحلة البيداغوجية</th>
        <th>التوقيت</th>
        <th>نشاط التلميذ</th>
        <th>دور الأستاذ وتوجيهاته</th>
        <th>نمط العمل</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. استحضار المكتسبات</strong></td>
        <td>[X دق]</td>
        <td>الإجابة عن أسئلة المراجعة التشخيصية شفهياً</td>
        <td>طرح الأسئلة ورصد المكتسبات القبلية</td>
        <td>فردي / شفهي</td>
      </tr>
      <tr>
        <td><strong>2. نشاط (بناء المفهوم)</strong></td>
        <td>[X دق]</td>
        <td>قراءة النشاط من الكتاب وملء الجدول والملاحظة</td>
        <td>توجيه الملاحظات نحو المفهوم الجديد</td>
        <td>أفواج / جماعي</td>
      </tr>
      <tr>
        <td><strong>3. القاعدة (إرساء المفهوم)</strong></td>
        <td>[X دق]</td>
        <td>صياغة الخاصية وتدوينها في الكراس</td>
        <td>تثبيت الصياغة الرسمية للقاعدة على السبورة</td>
        <td>جماعي / تدوين</td>
      </tr>
      <tr>
        <td><strong>4. تطبيق (تثبيت فوري)</strong></td>
        <td>[X دق]</td>
        <td>إنجاز التطبيق الفوري من الكتاب</td>
        <td>متابعة الإنجاز الفردي ورصد التعثرات</td>
        <td>فردي على الكراس</td>
      </tr>
      <tr>
        <td><strong>5. تمرين (تعميق وعمل فردي)</strong></td>
        <td>[X دق]</td>
        <td>حل التمرين وتدوين التكليف المنزلي</td>
        <td>تقييم اكتساب الكفاية وتحديد الواجب المنزلي</td>
        <td>فردي</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ════ القسم 3: المحتوى التفصيلي للمراحل ════ -->

<!-- ── 1) استحضار ── -->
<div class="stage-card-remind">
  <h4>🧠 1) استحضار — مراجعة المكتسبات القبلية</h4>
  <p>يطرح الأستاذ الأسئلة التشخيصية التالية شفهياً للتحقق من المكتسبات القبلية الضرورية لهذا الدرس:</p>
  <ol>
    <li>[سؤال تشخيصي 1 — مرتبط مباشرةً بمكتسبات سابقة ضرورية للدرس الجديد]</li>
    <li>[سؤال تشخيصي 2]</li>
    <li>[سؤال تشخيصي 3]</li>
  </ol>
  <p><em>📌 للأستاذ: يُصحَّح شفهياً — لا يُكتب الحل في الكراس في هذه المرحلة.</em></p>
</div>

<!-- ── 2) نشاط — من الكتاب حرفياً ── -->
<div class="stage-card-activity">
  <h4>🎯 2) نشاط — استكشاف وبناء المفهوم</h4>
  <p><strong>[النشاط رقم ... — الصفحة ... من كتاب التلميذ]</strong></p>
  <p>⚠️ النص التالي منقول حرفاً بحرف من كتاب التلميذ كما هو دون أي تغيير:</p>
  <div class="book-verbatim-content">
    [انسخ هنا نص النشاط الكامل بجداوله وأسئلته وأعداده كما ورد في الكتاب — دون حل]
  </div>
  <p><em>📌 للأستاذ: يُنجَز في أفواج — لا يُقدَّم الحل في هذه المرحلة.</em></p>
</div>

<!-- ── 3) قاعدة — من الكتاب حرفياً ── -->
<div class="stage-card-rule">
  <h4>📏 3) قاعدة — إرساء المفهوم والخاصية الرسمية</h4>
  <p>⚠️ القاعدة التالية منقولة حرفاً بحرف من كتاب التلميذ كما هي دون أي تغيير:</p>
  <div class="rule-box">
    <p><strong>خاصية [عنوان الخاصية] :</strong></p>
    <p>[نص القاعدة أو الخاصية الرسمية كما وردت في الكتاب المدرسي، مع الرموز الرياضية $...$]</p>
  </div>
  <p><em>📌 للأستاذ: تُكتب على السبورة ثم يُدوّنها التلاميذ في كراريسهم حرفياً.</em></p>
</div>

<!-- ── 4) تطبيق — من الكتاب حرفياً ── -->
<div class="stage-card-app">
  <h4>✏️ 4) تطبيق — تثبيت فوري للقاعدة</h4>
  <p><strong>[التطبيق رقم ... — الصفحة ... من كتاب التلميذ]</strong></p>
  <p>⚠️ النص التالي منقول حرفاً بحرف من كتاب التلميذ كما هو دون أي تغيير:</p>
  <div class="book-verbatim-content">
    [انسخ هنا نص التطبيق الكامل كما ورد في الكتاب المدرسي — دون حل]
  </div>
  <p><em>📌 للأستاذ: يُنجَز فردياً على الكراس ثم يُصحَّح جماعياً على السبورة.</em></p>
</div>

<!-- ── 5) تمرين — من الكتاب حرفياً ── -->
<div class="stage-card-exercise">
  <h4>📐 5) تمرين — تدريب وتعميق</h4>
  <p><strong>[التمرين رقم ... — الصفحة ... من كتاب التلميذ]</strong></p>
  <p>⚠️ النص التالي منقول حرفاً بحرف من كتاب التلميذ كما هو دون أي تغيير:</p>
  <div class="book-verbatim-content">
    [انسخ هنا نص التمرين الكامل كما ورد في الكتاب المدرسي — دون حل]
  </div>
  <p><em>📌 للأستاذ: يُنجَز فردياً — ما لم يُنجَز في الحصة يُكلَّف به التلاميذ واجباً منزلياً.</em></p>
</div>

<!-- ── 6) المشاكل والأخطاء المحتملة لدى التلميذ وإستراتيجيات المعالجة ── -->
<div class="stage-card-remediation">
  <h4>⚠️ 6) المشاكل والأخطاء المحتملة لدى التلميذ وإستراتيجيات المعالجة البيداغوجية</h4>
  <p><span class="source-badge badge-generated" style="background:#fef3c7; color:#92400e; padding:3px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">🟡 GENERATED — مقترح بالذكاء الاصطناعي ويتطلب مراجعة الأستاذ</span></p>
  <table class="difficulties-table">
    <thead>
      <tr>
        <th>المرحلة البيداغوجية</th>
        <th>الصعوبة / الخطأ المتوقع</th>
        <th>السبب المحتمل (العائق البيداغوجي)</th>
        <th>مؤشر الاكتشاف</th>
        <th>التدخل البيداغوجي (المعالجة)</th>
        <th>نشاط / سؤال علاجي قصير</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>[remind | activity | rule | application | exercise]</strong></td>
        <td>[الصعوبة أو الخطأ المتوقع بالتحديد في هذا الدرس]</td>
        <td>[السبب المحتمل والعائق البيداغوجي]</td>
        <td>[المؤشر الذي يلاحظه الأستاذ على الكراس أو الشفهي]</td>
        <td>[استراتيجية المعالجة الفورية للأستاذ]</td>
        <td>[سؤال أو نشاط علاجي قصير بدقة $...$]</td>
      </tr>
      <tr>
        <td><strong>[المرحلة 2]</strong></td>
        <td>[خطأ متوقع 2]</td>
        <td>[السبب]</td>
        <td>[مؤشر الاكتشاف]</td>
        <td>[المعالجة]</td>
        <td>[سؤال علاجي]</td>
      </tr>
      <tr>
        <td><strong>[المرحلة 3]</strong></td>
        <td>[خطأ متوقع 3]</td>
        <td>[السبب]</td>
        <td>[مؤشر الاكتشاف]</td>
        <td>[المعالجة]</td>
        <td>[سؤال علاجي]</td>
      </tr>
    </tbody>
  </table>
</div>
اكتب الآن الجذاذة البيداغوجية الرسمية بالعربية الصافية، ملتزماً حرفاً بحرف بنصوص كتاب التلميذ في جميع المراحل.
أخرج محتوى الجذاذة حصرياً بين العلامتين التاليين دون أي مقدمة أو كلام خارجي:
[BEGIN_LESSON_SHEET]
<div class="tunisian-fiche-banner">...</div>
...
[END_LESSON_SHEET]`;
}






let cachedWorkingModel = null;

// ── DYNAMIC MODEL DISCOVERY VIA ListModels ─────────────────
async function resolveAvailableGeminiModels(apiKey) {
  if (cachedWorkingModel) {
    return Array.from(new Set([cachedWorkingModel, ...FALLBACK_MODELS]));
  }

  try {
    const res = await fetch(`${GEMINI_BASE}/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const available = (data.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""));

      if (available.length > 0) {
        const preferred = [
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash-latest",
          "gemini-1.5-flash",
          "gemini-1.5-pro-latest",
          "gemini-1.5-pro",
          "gemini-pro"
        ];
        const sorted = available.sort((a, b) => {
          const idxA = preferred.findIndex((p) => a.includes(p) || p.includes(a));
          const idxB = preferred.findIndex((p) => b.includes(p) || p.includes(b));
          return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
        });
        const deduplicated = Array.from(new Set(sorted));
        cachedWorkingModel = deduplicated[0];
        return deduplicated;
      }
    }
  } catch (e) {
    console.warn("Dynamic ListModels check failed, using fallback list:", e);
  }

  return Array.from(new Set([
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "gemini-pro"
  ]));
}

// ── GEMINI REST API STREAMING & ROBUST MULTI-MODEL FALLBACK ──────────────────────────────
async function generate(apiKey, prompt, metadata) {
  setLoading(true);
  outputPanel.hidden = true;
  outputPanel.style.display = "none";
  hideError();

  // Reset save button state for new document
  btnSaveToArchive.classList.remove("saved");
  btnSaveToArchive.innerHTML = "💾 <strong>حفظ في الأرشيف</strong>";
  const unsavedBadge = document.getElementById("unsavedBadge");
  if (unsavedBadge) unsavedBadge.classList.remove("hidden");

  let lastError = null;
  let success = false;

  const modelsToTry = await resolveAvailableGeminiModels(apiKey);

  for (const modelName of modelsToTry) {
    const url  = `${GEMINI_BASE}/models/${modelName}:streamGenerateContent?key=${apiKey}&alt=sse`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.15, maxOutputTokens: 8000 },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${response.status}`);
      }

      setLoading(false);
      showView("output");
      outputBody.innerHTML = "";

      const reader  = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let sseBuffer = "", fullText = "";

      // ── PHASE 14 FIX: buffer-only streaming ─────────────────
      // NOTHING is rendered to outputBody until [END_LESSON_SHEET] is confirmed.
      // Show a progress indicator while streaming.
      outputBody.innerHTML = `<div style="text-align:center;padding:2rem;color:#64748b;direction:rtl;">
        <div style="font-size:2rem;margin-bottom:0.5rem;">⏳</div>
        <p style="font-weight:600;">جاري توليد الجذاذة...</p>
        <p style="font-size:0.85rem;">يرجى الانتظار حتى يكتمل التوليد.</p>
      </div>`;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            fullText += chunk;
            // DO NOT render to outputBody here — buffer only
          } catch { /* ignore mid-stream parse errors */ }
        }
      }
      // ── END PHASE 14 STREAMING BUFFER ───────────────────────

      if (!fullText.trim()) {
        throw new Error("لم يتم استلام أي محتوى من نموذج الذكاء الاصطناعي.");
      }

      // ── PHASE 14: Extract ONLY content between delimiters ───
      const BEGIN_MARKER = "[BEGIN_LESSON_SHEET]";
      const END_MARKER   = "[END_LESSON_SHEET]";
      const beginIdx = fullText.indexOf(BEGIN_MARKER);
      const endIdx   = fullText.indexOf(END_MARKER);

      let contentToRender;
      if (beginIdx !== -1 && endIdx !== -1 && endIdx > beginIdx) {
        // Happy path: delimiters found — extract only what's between them
        contentToRender = fullText.slice(beginIdx + BEGIN_MARKER.length, endIdx).trim();
      } else if (beginIdx !== -1) {
        // BEGIN found but no END — take everything after BEGIN
        contentToRender = fullText.slice(beginIdx + BEGIN_MARKER.length).trim();
      } else {
        // No delimiters at all: do NOT show raw prompt/response
        // Attempt to find first HTML tag as fallback
        const htmlTagIdx = fullText.indexOf("<div");
        if (htmlTagIdx !== -1) {
          contentToRender = fullText.slice(htmlTagIdx).trim();
        } else {
          outputBody.innerHTML = `<div style="background:#fef2f2;color:#991b1b;border:1px solid #f87171;padding:1rem 1.25rem;border-radius:8px;direction:rtl;font-weight:600;">
            ⚠️ لم يتمكن النموذج من توليد جذاذة صحيحة. يرجى المحاولة مرة أخرى.
          </div>`;
          throw new Error("لم يتم العثور على العلامتين [BEGIN_LESSON_SHEET] / [END_LESSON_SHEET] في مخرجات النموذج.");
        }
      }
      // ── END DELIMITER EXTRACTION ─────────────────────────────

      const finalHtml = renderMarkdownAndMath(contentToRender, metadata);
      outputBody.innerHTML = finalHtml;

      // Inject uploaded images for each stage
      injectStageImages(metadata);

      // Reference Anti-Hallucination Post-Guard
      const refValidation = validateGeneratedReferences(fullText, metadata);
      if (!refValidation.valid) {
        metadata.invalidReference = true;
        metadata.unverifiedRefs = refValidation.unverifiedRefs;
        const warningBadge = `<div class="invalid-ref-banner" style="background:#fef2f2; color:#991b1b; border:1px solid #f87171; padding:10px 14px; border-radius:8px; margin-bottom:12px; font-weight:600;">
          ⛔ INVALID_REFERENCE: تم كشف مراجع صفحات أو أنشطة غير موثقة في بنك المعرفة الحالي: [${refValidation.unverifiedRefs.join(' ، ')}]. يجب تصحيح المرجع قبل اعتماد الجذاذة.
        </div>`;
        outputBody.innerHTML = warningBadge + outputBody.innerHTML;
      }

      // Pedagogical Validation
      let valResult = { isValid: true, score: 100, checks: [] };
      if (typeof PedagogicalValidator !== 'undefined' && PedagogicalValidator.validateFiche) {
        valResult = PedagogicalValidator.validateFiche(fullText, metadata);
      }

      currentDocObj = {
        id: `doc_${Date.now()}`,
        title: metadata.title, subject: metadata.subject, level: metadata.level, unit: metadata.unit,
        teacher: metadata.teacher, school: metadata.school, year: metadata.year, mode: metadata.mode,
        lang: metadata.lang, cycle: metadata.cycle,
        htmlContent: outputBody.innerHTML,
        rawText: fullText,
        lessonMetadata: { title: metadata.title, subject: metadata.subject, level: metadata.level, unit: metadata.unit },
        knowledgeSources: metadata.knowledgeSources || [],
        sourceMetadata: {
          hasOfficialProgramme: metadata.hasOfficialProgramme,
          hasVerifiedTextbook: metadata.hasVerifiedTextbook,
          textbookPages: metadata.textbookPages || []
        },
        validationResult: valResult,
        generatedContentMetadata: {
          invalidReference: metadata.invalidReference || false,
          unverifiedRefs: metadata.unverifiedRefs || [],
          timestamp: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
      };

      showToast(metadata.lang === "fr"
        ? "✅ Document généré ! Cliquez sur 💾 Enregistrer pour sauvegarder dans l'archive."
        : "✅ تم توليد الوثيقة! اضغط على 💾 حفظ في الأرشيف لحفظها.");
      window.scrollTo({ top: outputPanel.offsetTop - 80, behavior: "smooth" });

      cachedWorkingModel = modelName; // Lock the model that succeeded!
      success = true;
      break; // Model stream succeeded!
    } catch (err) {
      console.warn(`Model ${modelName} failed, trying fallback...`, err);
      cachedWorkingModel = null; // Clear failing model from cache so next run re-evaluates
      lastError = err;
    }
  }

  if (!success) {
    setLoading(false);
    showView("creator");
    console.error("Gemini Error:", lastError);
    let msg = "❌ حدث خطأ أثناء الاتصال بـ Gemini API.";
    const errMsg = lastError?.message || "";
    if (errMsg.toLowerCase().includes("api key") || errMsg.includes("API_KEY_INVALID")) {
      msg = "🔑 مفتاح API غير صالح. تحقق من الإعدادات ⚙️";
    } else if (errMsg.toLowerCase().includes("high demand") || errMsg.includes("503") || errMsg.includes("UNAVAILABLE")) {
      msg = "⏱️ خوادم Gemini تواجه ضغطاً عالياً مؤقتاً (High Demand). يرجى المحاولة مرة أخرى بعد بضع ثوانٍ.";
    } else if (errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429")) {
      msg = "⏱️ تجاوزت الحصة المجانية أو المعدل المسموح. انتظر دقيقة ثم أعد المحاولة.";
    } else if (errMsg.includes("Failed to fetch")) {
      msg = "🌐 خطأ في الاتصال بالإنترنت.";
    } else if (errMsg) {
      msg += `\n\nتفاصيل: ${errMsg}`;
    }
    showError(msg);
  }

  setLoading(false);
  isGenerating = false;
  btnGenerate.disabled = false;
  btnIcon.textContent  = "✨";
  btnText.textContent  = currentCycle === "lycee"
    ? "Générer la Fiche Pédagogique (Rappel ➔ Activité ➔ Propriété ➔ Application ➔ Exercice)"
    : "توليد الوثيقة البيداغوجية (استحضر ➔ نشاط ➔ قاعدة ➔ تطبيق ➔ تمرين)";
}

// ── INJECT STAGE IMAGES INTO OUTPUT ────────────────────────
function injectStageImages(metadata) {
  const allItems = [
    ...metadata.remind.map((r) => ({ ...r, stageName: "stage-card-remind",    stageLabel: metadata.lang === "fr" ? "Rappel" : "استحضر" })),
    ...metadata.activities.map((a) => ({ ...a, stageName: "stage-card-activity", stageLabel: metadata.lang === "fr" ? "Activité" : "نشاط" })),
    ...metadata.applications.map((a) => ({ ...a, stageName: "stage-card-app",    stageLabel: metadata.lang === "fr" ? "Application" : "تطبيق" })),
    ...metadata.exercises.map((e) => ({ ...e, stageName: "stage-card-exercise", stageLabel: metadata.lang === "fr" ? "Exercice" : "تمرين" })),
  ];

  allItems.forEach((item) => {
    if (item.type !== "image" || !item.imageBase64) return;
    const imgBlock = document.createElement("div");
    imgBlock.className = "embedded-img-box";
    imgBlock.innerHTML = `
      <img src="${item.imageBase64}" alt="${escapeHtml(item.title)}" class="embedded-activity-img" />
      <p class="embedded-img-caption">📷 ${escapeHtml(item.title)}</p>
    `;
    const stageDivs = outputBody.querySelectorAll(`.${item.stageName}`);
    if (stageDivs.length > 0) {
      stageDivs[stageDivs.length - 1].appendChild(imgBlock);
    } else {
      outputBody.appendChild(imgBlock);
    }
  });
}

// ── MATHEMATICAL SANITIZER & BALANCED DELIMITERS ──────────
function sanitizeKaTeXMathString(raw) {
  if (!raw) return "";
  let s = raw.trim();

  // 1. Clean any duplicate \\left or \\right occurrences
  s = s.replace(/\\left\s*\\left/g, "\\left")
       .replace(/\\right\s*\\right/g, "\\right")
       .replace(/\\left\s*\(/g, "\\left(")
       .replace(/\\right\s*\)/g, "\\right)");

  // 2. Replace raw Unicode math symbols with LaTeX commands
  s = s.replace(/√\s*\{([^}]+)\}/g, "\\sqrt{$1}")
       .replace(/√\s*([0-9a-zA-Z]+)/g, "\\sqrt{$1}")
       .replace(/√/g, "\\sqrt{}")
       .replace(/≤/g, "\\le ")
       .replace(/≥/g, "\\ge ")
       .replace(/≠/g, "\\ne ")
       .replace(/±/g, "\\pm ")
       .replace(/∈/g, "\\in ")
       .replace(/∉/g, "\\notin ")
       .replace(/⊂/g, "\\subset ")
       .replace(/∩/g, "\\cap ")
       .replace(/∪/g, "\\cup ")
       .replace(/⊥/g, "\\perp ")
       .replace(/∥/g, "\\parallel ")
       .replace(/Δ/g, "\\Delta ")
       .replace(/π/g, "\\pi ")
       .replace(/α/g, "\\alpha ")
       .replace(/β/g, "\\beta ")
       .replace(/θ/g, "\\theta ")
       .replace(/→/g, "\\to ")
       .replace(/⇒/g, "\\implies ")
       .replace(/⇔/g, "\\iff ")
       .replace(/∞/g, "\\infty ");

  // 3. Clean and format coordinates & intervals with balanced delimiters
  s = s.replace(/\(\s*([0-9a-zA-Z+\-._]+)\s*;\s*([0-9a-zA-Z+\-._]+)\s*\)/g, "\\left( $1 \\,;\\, $2 \\right)");

  // 4. Fix ellipsis ... to \dots
  s = s.replace(/\.\.\./g, "\\dots ");

  // 5. Ensure commas inside numbers: e.g. 5,6 -> 5{,}6 without extra space
  s = s.replace(/([0-9]),([0-9])/g, "$1{,}$2");

  // 6. Final cleanup of any duplicated commands
  s = s.replace(/\\left\s*\\left/g, "\\left")
       .replace(/\\right\s*\\right/g, "\\right");

  return s;
}

// ── REFERENCE ANTI-HALLUCINATION GUARD ────────────────────
function validateGeneratedReferences(fullText, metadata) {
  if (!fullText) return { valid: true, unverifiedRefs: [] };

  const validPages = (metadata && metadata.textbookPages) ? metadata.textbookPages.map(Number) : [];
  const unverifiedRefs = [];

  // Match page citations like "صفحة 25" or "ص 25" or "Page 25" or "ص. 25"
  const pageMatches = fullText.match(/(?:صفحة|ص\.|ص|Page|p\.)\s*(\d+)/gi) || [];
  pageMatches.forEach(match => {
    const numMatch = match.match(/\d+/);
    if (numMatch) {
      const pageNum = Number(numMatch[0]);
      if (!validPages.includes(pageNum)) {
        unverifiedRefs.push(`صفحة ${pageNum}`);
      }
    }
  });

  return {
    valid: unverifiedRefs.length === 0,
    unverifiedRefs: [...new Set(unverifiedRefs)]
  };
}

// ── PROMPT & META-INSTRUCTION STRIPPER ───────────────────
function cleanRawPromptInstructions(rawText) {
  if (!rawText) return "";
  let text = rawText;

  // 1. Extract strictly between delimiters if present
  if (text.includes("[BEGIN_LESSON_SHEET]")) {
    const parts = text.split("[BEGIN_LESSON_SHEET]");
    text = parts[parts.length - 1];
    if (text.includes("[END_LESSON_SHEET]")) {
      text = text.split("[END_LESSON_SHEET]")[0];
    }
  }

  // 2. Crop any text preceding the first actual pedagogical HTML container
  const firstHtmlMatch = text.match(/<(?:div|section|table)\s+class=["'](?:tunisian-fiche-banner|official-admin-block|poster-hero-banner|timing-plan-box|mindmap-)/i);
  if (firstHtmlMatch && firstHtmlMatch.index > 0) {
    text = text.slice(firstHtmlMatch.index);
  }

  // 3. Strip any stray internal prompt phrases/instructions
  const forbiddenPhrases = [
    /General Inspector of Education[^\n]*/gi,
    /Strict adherence[^\n]*/gi,
    /No invention[^\n]*/gi,
    /No addition[^\n]*/gi,
    /No subtraction[^\n]*/gi,
    /Use LaTeX for all math[^\n]*/gi,
    /A specific HTML structure[^\n]*/gi,
    /Check:\s*Did I include[^\n]*/gi,
    /Self-Correction during drafting[^\n]*/gi,
    /Final Polish of the HTML\/CSS[^\n]*/gi,
    /System prompt[^\n]*/gi,
    /Prompt[^\n]*/gi,
    /\[BEGIN_LESSON_SHEET\]/gi,
    /\[END_LESSON_SHEET\]/gi
  ];

  forbiddenPhrases.forEach(regex => {
    text = text.replace(regex, "");
  });

  return text.trim();
}

// ── ROBUST KATEX MATH PREPROCESSOR (LTR ISOLATED) ──────────
function renderMarkdownAndMath(text, metadata = {}) {
  let mathTokens = [];
  const cleanedText = cleanRawPromptInstructions(text);

  // Step 1: Protect Block Math ($$...$$ or \[...\])
  let safe = cleanedText.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (m) => {
    const raw = m.startsWith("$$") ? m.slice(2, -2) : m.slice(2, -2);
    const id  = `%%MATH_BLOCK_${mathTokens.length}%%`;
    mathTokens.push({ id, raw: sanitizeKaTeXMathString(raw), display: true });
    return id;
  });

  // Step 2: Protect Inline Math ($...$ or \(...\))
  safe = safe.replace(/(\$([^\$\n]+?)\$|\\\(([^\n]+?)\\\))/g, (m, p1, p2, p3) => {
    const raw = (p2 || p3 || "").trim();
    const id  = `%%MATH_INLINE_${mathTokens.length}%%`;
    mathTokens.push({ id, raw: sanitizeKaTeXMathString(raw), display: false });
    return id;
  });

  // Step 2.5: Auto-detect periodic decimals: e.g. 5,\underline{6} or 5,\overline{60}
  safe = safe.replace(/(\b\d+\s*,\s*\\(?:underline|overline|bar)\{\d+\})/g, (m) => {
    const id = `%%MATH_INLINE_${mathTokens.length}%%`;
    mathTokens.push({ id, raw: sanitizeKaTeXMathString(m), display: false });
    return id;
  });

  // Step 3: Auto-detect bare LaTeX commands (e.g. \Delta, \perp, \vec{u}, \sqrt)
  safe = safe.replace(/(\\[a-zA-Z]+(?:\{[^}]*\})*)/g, (m) => {
    const id = `%%MATH_INLINE_${mathTokens.length}%%`;
    mathTokens.push({ id, raw: sanitizeKaTeXMathString(m), display: false });
    return id;
  });

  // Step 4: Auto-detect coordinate assignments (e.g. x_A = -3, x_B = 5)
  safe = safe.replace(/\b([a-zA-Z]_[a-zA-Z0-9]+(?:\s*=\s*-?[0-9]+(?:\.[0-9]+)?)?)\b/g, (m) => {
    const id = `%%MATH_INLINE_${mathTokens.length}%%`;
    mathTokens.push({ id, raw: sanitizeKaTeXMathString(m), display: false });
    return id;
  });

  // Step 4.5: Auto-detect variable math assignments with numbers/dots (e.g. A = 2,101001... or B = -3,123456...)
  safe = safe.replace(/(\b[A-Za-z]\s*=\s*-?[0-9]+(?:[.,][0-9]+)*(?:\s*\.\.\.)?)/g, (m) => {
    const id = `%%MATH_INLINE_${mathTokens.length}%%`;
    mathTokens.push({ id, raw: sanitizeKaTeXMathString(m), display: false });
    return id;
  });

  // Unwrap HTML / generic code blocks — strip ALL forms of ``` fences
  // (```html, ```htm, ```, ` ``` ` alone on a line, trailing ```)
  safe = safe.replace(/```html?\s*/gi, "");
  safe = safe.replace(/```\s*/g, "");
  safe = safe.replace(/^\s*`{3,}\s*$/gm, "");   // lone fence lines

  // Headings
  safe = safe.replace(/^###\s*(.+)$/gm, "<h3>$1</h3>");
  safe = safe.replace(/^##\s*(.+)$/gm, '<h2 class="section-heading-badge">$1</h2>');
  safe = safe.replace(/^#\s*(.+)$/gm,  '<h2 class="section-heading-badge">$1</h2>');

  // Bold & italic
  safe = safe.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  safe = safe.replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>");
  safe = safe.replace(/\*([^\*\n]+?)\*/g,   "<em>$1</em>");

  // Tables
  safe = parseMarkdownTables(safe);

  // Lists
  safe = safe.replace(/((?:^- .+$\n?)+)/gm, (block) => {
    const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^- /, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
  safe = safe.replace(/((?:^\d+\. .+$\n?)+)/gm, (block) => {
    const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("");
    return `<ol>${items}</ol>`;
  });

  // HR
  safe = safe.replace(/^---+$/gm, "<hr/>");

  // Paragraphs
  safe = safe.split("\n").map((line) => {
    const t = line.trim();
    if (!t) return "";
    if (/^<(h[1-6]|ul|ol|li|hr|table|tr|th|td|div|p|span|svg|img|blockquote)/.test(t)) return t;
    if (t.startsWith("%%MATH_BLOCK_")) return t;
    return `<p>${t}</p>`;
  }).join("\n");

  // Re-insert KaTeX with STRICT LTR isolation containers
  mathTokens.forEach(({ id, raw, display }) => {
    let rendered = raw;
    if (window.katex) {
      try {
        const katexHtml = window.katex.renderToString(raw, {
          displayMode: display,
          throwOnError: false,
          output: "htmlAndMathml",
        });
        if (display) {
          rendered = `<div class="math-ltr-isolate-block" dir="ltr">${katexHtml}</div>`;
        } else {
          rendered = `<span class="math-ltr-isolate" dir="ltr">${katexHtml}</span>`;
        }
      } catch {
        rendered = `<span class="math-ltr-isolate" dir="ltr">${display ? `$$${raw}$$` : `$${raw}$`}</span>`;
      }
    } else {
      rendered = `<span class="math-ltr-isolate" dir="ltr">${display ? `$$${raw}$$` : `$${raw}$`}</span>`;
    }
    safe = safe.replace(new RegExp(id, "g"), rendered);
  });

  // Render SVG Vector Geometries
  if (typeof GeometryEngine !== "undefined" && GeometryEngine.parseAndRenderGeometries) {
    safe = GeometryEngine.parseAndRenderGeometries(safe);
  }

  const badgesBar = renderSourceVerificationBadges(metadata);
  return badgesBar + safe;
}

function renderSourceVerificationBadges(metadata) {
  if (!metadata || (metadata.hasOfficialProgramme === undefined && metadata.hasVerifiedTextbook === undefined)) {
    return '';
  }
  const isFr = metadata.lang === 'fr';

  let badgesHtml = '<div class="knowledge-source-badges-bar" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:15px; padding:10px 14px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; align-items:center;">';
  badgesHtml += `<strong style="margin-left:8px;">${isFr ? 'Sources & Validation :' : 'المصادر والمصداقية:'}</strong>`;

  if (metadata.hasOfficialProgramme) {
    badgesHtml += `<span class="badge badge-verified" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; padding:4px 10px; border-radius:12px; font-weight:600;">🟢 ${isFr ? 'Programme Officiel Confirmé' : 'البرنامج الرسمي التونسي موثق'}</span>`;
  }

  if (metadata.hasVerifiedTextbook) {
    const pagesStr = metadata.textbookPages && metadata.textbookPages.length > 0 ? ` (ص ${metadata.textbookPages.join(', ')})` : '';
    badgesHtml += `<span class="badge badge-textbook" style="background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; padding:4px 10px; border-radius:12px; font-weight:600;">🟢 ${isFr ? 'Manuel Scolaire CNP' : 'الكتاب المدرسي CNP'} ${pagesStr}</span>`;
  } else {
    badgesHtml += `<span class="badge badge-generated" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:4px 10px; border-radius:12px; font-weight:600;">🟡 ${isFr ? 'Activités Proposées par IA' : 'نشاط مقترح مولد بالذكاء الاصطناعي'}</span>`;
  }

  if (metadata.knowledgeSources && metadata.knowledgeSources.some(s => s.type === 'TEACHER')) {
    badgesHtml += `<span class="badge badge-teacher" style="background:#f3e8ff; color:#6b21a8; border:1px solid #d8b4fe; padding:4px 10px; border-radius:12px; font-weight:600;">🔵 ${isFr ? 'Ressource Enseignant' : 'وثيقة أستاذ مضافة'}</span>`;
  }

  badgesHtml += '</div>';
  return badgesHtml;
}

function parseMarkdownTables(text) {
  return text.replace(/((?:\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split("\n").filter(Boolean);
    if (rows.length < 2) return block;
    let table = "<table>", isHeader = true;
    for (const row of rows) {
      if (/^\|[\s:|-]+\|$/.test(row)) { isHeader = false; continue; }
      const cells = row.split("|").slice(1, -1);
      const tag = isHeader ? "th" : "td";
      table += "<tr>" + cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join("") + "</tr>";
      if (isHeader) isHeader = false;
    }
    return table + "</table>";
  });
}

// ── DIRECT CONTINUOUS GAP-FREE PDF DOWNLOAD (html2pdf) ─────
async function downloadPDFDirectly() {
  const element     = printableSheet;
  const isMindMap   = !!element.querySelector(".mindmap-radial-container");
  const isLandscape = isMindMap || sheetOrientation.value === "landscape";
  const title       = (lessonTitle.value.trim() || "document_pedagogique").replace(/\s+/g, "_");
  const teacher     = (teacherNameInput.value.trim() || "prof").replace(/\s+/g, "_");
  const filename    = `${title}_${teacher}.pdf`;

  showToast(currentCycle === "lycee" ? "⏳ Génération du PDF continu en cours..." : "⏳ جاري إنشاء ملف الـ PDF عالي الدقة...");

  try {
    element.classList.add("pdf-exporting");
    if (isMindMap) {
      element.classList.add("pdf-mindmap-landscape");
      element.classList.add("pdf-exporting-landscape");
    }
    if (document.fonts) await document.fonts.ready;
  } catch (_) {}

  const opt = {
    margin:       isMindMap ? [5, 5, 5, 5] : [8, 8, 8, 8],
    filename,
    image:        { type: "jpeg", quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      logging: false, 
      scrollY: 0,
      scrollX: 0,
      windowWidth: isMindMap ? 1200 : undefined,
      backgroundColor: "#ffffff",
      letterRendering: false,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: isLandscape ? "landscape" : "portrait",
    },
    pagebreak: {
      mode: isMindMap ? ['avoid-all'] : ['avoid-all', 'css', 'legacy'],
      avoid: [
        '.stage-card-remind',
        '.stage-card-activity',
        '.stage-card-rule',
        '.stage-card-app',
        '.stage-card-exercise',
        '.stage-card-remediation',
        '.official-admin-block',
        '.sheet-header-banner',
        '.sheet-footer-banner',
        '.poster-hero-banner',
        '.poster-section-card',
        '.mindmap-radial-layout',
        '.mindmap-pos-top',
        '.mindmap-pos-center',
        '.mindmap-pos-left',
        '.mindmap-pos-right',
        '.mindmap-pos-bottom-left',
        '.mindmap-pos-bottom-right',
        '.mindmap-radial-container',
        '.mindmap-center-node',
        '.mindmap-branch-card',
        '.branch-top',
        '.branch-top-right',
        '.branch-top-left',
        '.branch-bottom-right',
        '.branch-bottom-left',
        '.branch-bottom',
        '.cards-grid',
        '.card-box',
        '.poster-grid-2',
        '.poster-grid-3',
        '.pitfalls-box',
        '.difficulties-table',
        '.poster-questions-strip',
        '.poster-pipeline',
        '.embedded-img-box',
        '.geometry-svg-container',
        'table',
        'tr'
      ]
    },
  };

  try {
    await window.html2pdf().set(opt).from(element).save();
    showToast(currentCycle === "lycee" ? "✅ PDF téléchargé avec succès !" : "✅ تم تحميل ملف الـ PDF بنجاح!");
  } catch (err) {
    console.error("PDF error:", err);
    showError(currentCycle === "lycee" ? "❌ Erreur de génération PDF. Utilisez le bouton 'Imprimer'." : "❌ حدث خطأ أثناء إنشاء PDF. استعمل زر 'طباعة' كبديل فوري.");
  } finally {
    element.classList.remove("pdf-exporting");
    element.classList.remove("pdf-mindmap-landscape");
    element.classList.remove("pdf-exporting-landscape");
  }
}

// ── GENERATE ALTERNATIVE EXERCISE VARIANT (التمارين الموازية الذكية) ──
async function generateExerciseVariant() {
  const apiKey = getApiKey();
  if (!apiKey) {
    showError(currentCycle === "lycee" ? "❌ Veuillez configurer votre clé API Gemini d'abord." : "❌ يرجى ضبط مفتاح Gemini API أولاً.");
    return;
  }

  const lesson = lessonTitle.value.trim() || "الدرس";
  showToast(currentCycle === "lycee" ? "⏳ Génération d'une variante d'exercice..." : "⏳ جاري توليد تمرين موازٍ بأعداد جديدة مع الحفاظ على نفس الهدف البيداغوجي...");
  setLoading(true);
  try {
    const isFr = (currentLang === "fr");
  const isEn = (currentLang === "en");

  const prompt = isFr
    ? `En tant qu'Inspecteur Pédagogique Tunisien, propose une VARIANTE d'exercice inédite avec de nouvelles valeurs numériques et un schéma vectoriel [GEOMETRY: ...] pour la leçon "${lesson}". L'exercice doit conserver exactement les mêmes compétences et le même niveau de difficulté du programme officiel tunisien sans donner la solution.`
    : (isEn
      ? `As a Tunisian Educational Inspector, provide an alternative EXERCISE VARIANT with new numerical values and a diagram [GEOMETRY: ...] for the lesson "${lesson}". Keep the exact same educational objectives and level of difficulty according to the official Tunisian syllabus without giving the solution.`
      : `بصفتك أستاذاً متفقداً للبرنامج الرسمي التونسي، اقترح صيغة بديلة وموازية (Variante) لتمرين جديد بأعداد ومعطيات جديدة وشكل هندسي مناسب [GEOMETRY: ...] لدرس "${lesson}". يجب أن يحافظ التمرين البديل على نفس الأهداف والكفايات ومستوى الصعوبة المقرر في كتاب التلميذ التونسي (دون تقديم الحل).`);

  const modelsToTry = await resolveAvailableGeminiModels(apiKey);
  let variantSuccess = false;
  let lastVariantErr = null;

  for (const targetModel of modelsToTry) {
    const url  = `${GEMINI_BASE}/models/${targetModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${MATH_STRICT_RULES}\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2500 },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawResult = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!rawResult) throw new Error("لم يتم استلام أي نص من النموذج");

      cachedWorkingModel = targetModel; // Lock successful model
      const parsedHtml = renderMarkdownAndMath(rawResult, {});
      const variantBox = document.createElement("div");
      variantBox.className = "stage-card-exercise";
      variantBox.style.border = "2px solid #9333ea";
      variantBox.style.background = "#faf5ff";
      variantBox.innerHTML = `<h4 style="color:#7e22ce;">🎲 تمرين موازٍ مقترح بنفس الهدف البيداغوجي (Variante Inédite) :</h4>${parsedHtml}`;
      outputBody.appendChild(variantBox);

      markAsUnsaved();
      showToast("✅ تمت إضافة التمرين الموازي بنجاح في أسفل الوثيقة!");
      variantBox.scrollIntoView({ behavior: "smooth" });
      variantSuccess = true;
      break;
    } catch (err) {
      console.warn(`Variant model ${targetModel} failed, trying fallback...`, err);
      cachedWorkingModel = null;
      lastVariantErr = err;
    }
  }

  if (!variantSuccess) {
    console.error("Variant error:", lastVariantErr);
    showError("❌ تعذر توليد التمرين الموازي: " + (lastVariantErr?.message || ""));
  }
} finally {
    setLoading(false);
  }
}

// ── PHASE 9.5.4 — MIND MAP PNG A4 LANDSCAPE HIGH-RES EXPORT ───────────────
async function downloadMindMapAsPNG() {
  showToast("⏳ جاري توليد صورة PNG عالية الدقة (A4 Landscape)...");
  const element = printableSheet;
  const classList = element.classList;

  // Classes applied during capture
  const EXPORT_CLASS   = "pdf-exporting";
  const LANDSCAPE_CLASS = "pdf-exporting-landscape";

  try {
    if (document.fonts) await document.fonts.ready;

    // Force A4 Landscape container width (1100px) for capture
    classList.add(EXPORT_CLASS, LANDSCAPE_CLASS);

    // Give browser one frame to reflow layout
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // Target: A4 Landscape @ ~300 DPI  → 3508 × 2480 px
    const TARGET_W = 3508;
    const TARGET_H = 2480;

    // Measure the forced width after layout (should be ~1100)
    const sourceW = element.getBoundingClientRect().width || 1100;
    const sourceH = element.getBoundingClientRect().height || Math.round(sourceW * (210 / 297));

    // Compute scale so that canvas ≥ target resolution
    // canvas.width = sourceW * scale  →  scale = TARGET_W / sourceW
    const scale = Math.max(3, Math.ceil(TARGET_W / sourceW));

    const canvas = await window.html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: 1200,       // KEY: prevents portrait-mode fallback capture
      letterRendering: false,
      logging: false,
    });

    // Derive filename from lesson title
    const rawTitle = (lessonTitle && lessonTitle.value) ? lessonTitle.value.trim() : "";
    const safeName = (rawTitle || "mindmap").replace(/\s+/g, "_").replace(/[^\w\u0600-\u06FF_-]/g, "");
    const filename = `mindmap-${safeName}.png`;

    // Download
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();

    showToast(`✅ تم تحميل الخريطة كصورة (${canvas.width}×${canvas.height} px)!`);
  } catch (err) {
    console.error("[downloadMindMapAsPNG] error:", err);
    showError("❌ تعذر توليد صورة PNG للخريطة الذهنية.");
  } finally {
    classList.remove(EXPORT_CLASS, LANDSCAPE_CLASS);
  }
}

// ── EXPORT & ACTIONS ───────────────────────────────────────
function initExportEvents() {
  btnDownloadPDF.addEventListener("click", downloadPDFDirectly);
  if (btnGenerateVariant) {
    btnGenerateVariant.addEventListener("click", generateExerciseVariant);
  }

  btnDownloadImg.addEventListener("click", async () => {
    const hasMindMap = !!printableSheet.querySelector(".mindmap-radial-container");
    if (hasMindMap) {
      await downloadMindMapAsPNG();
    } else {
      // Fallback: generic PNG at screen resolution for non-mindmap sheets
      showToast("⏳ جاري توليد صورة PNG...");
      try {
        if (document.fonts) await document.fonts.ready;
        const canvas = await window.html2canvas(printableSheet, {
          scale: 2, useCORS: true, backgroundColor: "#ffffff", scrollY: 0, letterRendering: false,
        });
        const link = document.createElement("a");
        link.download = `${(lessonTitle.value.trim() || "fiche").replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("✅ تم تحميل الصورة بنجاح!");
      } catch (e) { showError("❌ تعذر توليد الصورة."); }
    }
  });

  btnPrint.addEventListener("click", () => window.print());

  btnCopy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(outputBody.innerText);
      showToast("✅ تم نسخ النص إلى الحافظة");
    } catch { showToast("❌ فشل النسخ"); }
  });

  btnNew.addEventListener("click", () => {
    showView("creator");
    hideError();
    tabs.forEach((t) => t.classList.remove("active"));
    tabs[0].classList.add("active");
    currentMode = "summary";
    const ficheFields = $("ficheFields");
    if (ficheFields) ficheFields.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ── UI HELPERS ─────────────────────────────────────────────
function setLoading(on) {
  isGenerating         = on;
  loadingPanel.hidden  = !on;
  loadingPanel.style.display = on ? "flex" : "none";
  btnGenerate.disabled = on;
  if (on) {
    btnIcon.textContent = "⏳";
    btnText.textContent = currentCycle === "lycee"
      ? "Rédaction pédagogique en cours (Rappel ➔ Activité ➔ Propriété ➔ Application ➔ Exercice)..."
      : "جاري الصياغة وفق التمشي البيداغوجي (استحضر ➔ نشاط ➔ قاعدة ➔ تطبيق ➔ تمرين)...";
    animateDots();
  }
}
function hideError()  { errorPanel.hidden = true; errorPanel.style.display = "none"; }
function showError(m) { errorPanel.hidden = false; errorPanel.style.display = "block"; errorMsg.textContent = m; }

function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
    background: "#0f172a", color: "white", padding: "10px 24px",
    borderRadius: "30px", fontSize: "0.92rem", fontWeight: "700",
    zIndex: "9999", boxShadow: "0 6px 24px rgba(0,0,0,.35)",
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

let dotsTimer;
function animateDots() {
  let n = 0;
  clearInterval(dotsTimer);
  dotsTimer = setInterval(() => {
    if (!isGenerating) { clearInterval(dotsTimer); return; }
    loadingDots.textContent = ".".repeat((n++ % 3) + 1);
  }, 400);
}

// Math hint styling inline
const mathHintStyle = document.createElement("style");
mathHintStyle.textContent = `
  .math-hint { font-size: 0.76rem; color: #64748b; margin-top: 4px; display: block; direction: rtl; }
  .math-hint code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; direction: ltr; display: inline-block; }
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 0.9em 0; }
  .card-box { background: #fff; border-radius: 8px; border: 1.5px solid #3b82f6; padding: 0.8rem 1rem; display: flex; flex-direction: column; gap: 6px; direction: rtl; text-align: right; }
  .card-box.card-blue { border-color: #2563eb; }
  .card-box.card-orange { border-color: #ea580c; }
  .card-box.card-purple { border-color: #9333ea; }
  .card-box.card-green { border-color: #16a34a; }
  .card-header { text-align: center !important; font-weight: 800; font-size: 0.98rem; border-bottom: 1.5px dashed #cbd5e1; padding-bottom: 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .card-blue .card-header { color: #1e40af; }
  .card-orange .card-header { color: #c2410c; }
  .card-purple .card-header { color: #7e22ce; }
  .card-green .card-header { color: #15803d; }
  .card-icon { font-size: 1.6rem; }
  .card-box ul { padding-right: 1.1rem; font-size: 0.88rem; }
  .section-heading-badge { display: inline-flex; align-items: center; gap: 6px; background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; padding: 4px 12px; border-radius: 8px; font-size: 1.05rem; font-weight: 800; margin: 1em 0 0.4em; }
`;
document.head.appendChild(mathHintStyle);
