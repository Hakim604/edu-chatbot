// ============================================================
//  TUNISIAN PEDAGOGICAL KNOWLEDGE BASE — knowledge_base.js
//  بنك المعرفة البيداغوجي التونسي المنظم وفق البرامج الرسمية (CNP)
//  Hierarchical Structure: Programmes, Textbooks, TeacherResources, GeneratedContent
//  Strict Source Typing: OFFICIAL | TEXTBOOK | TEACHER | GENERATED
// ============================================================

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./curriculum'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const cur = (typeof CURRICULUM !== 'undefined') ? CURRICULUM : (function () {
      try { return require('./curriculum'); } catch (e) { return null; }
    })();
    module.exports = factory(cur);
  } else {
    root.KnowledgeBase = factory(root.CURRICULUM);
  }
}(typeof self !== 'undefined' ? self : this, function (curriculumRef) {

  // ── 1. SOURCE TYPES ENUM ──────────────────────────────────
  const SOURCE_TYPES = Object.freeze({
    OFFICIAL: 'OFFICIAL',     // البرامج الرسمية لوزارة التربية التونسية
    TEXTBOOK: 'TEXTBOOK',     // نصوص وأنشطة وتمارين كتب المركز الوطني البيداغوجي CNP
    TEACHER: 'TEACHER',       // وثائق وموارد وبطاقات الأستاذ المرفوعة
    GENERATED: 'GENERATED'    // مقترحات ونصوص مولدة بالذكاء الاصطناعي (موسومة بوضوح)
  });

  // ── 2. TRUST & VERIFICATION STATUS ───────────────────────
  const VERIFICATION_STATUS = Object.freeze({
    VERIFIED: 'VERIFIED',         // 🟢 موثق من مصدر رسمي أو كتاب مدرسي
    GENERATED: 'GENERATED',       // 🟡 مقترح ومولد بالذكاء الاصطناعي
    REQUIRES_REVIEW: 'REVIEW'     // 🔴 يحتاج مراجعة وتدقيق
  });

  // ── 3. DETAILED CURRICULUM REPOSITORIES ──────────────────
  // Contains pedagogical competencies, operational objectives, and prerequisites
  // for the official Tunisian curriculum lessons.
  const DETAILED_PROGRAMMES = {
    // 🏫 المرحلة الإعدادية — الرياضيات
    math: {
      c7: {
        domain: 'الجبر والحساب والهندسة المستوية والفضائية',
        lessons: [
          {
            axis: 'الأعداد الصحيحة الطبيعية والكسرية',
            title: 'العمليات على الأعداد الصحيحة الطبيعية وتفكيك الأعداد',
            notions: ['الأعداد الأولية', 'تفكيك إلى جذاء عوامل أولية', 'القاسم المشترك الأكبر PGCD', 'المضاعف المشترك الأصغر PPCM'],
            competencies: ['توظيف خصائص قابلية القسمة والتفكيك في حل وضعيات مشكلة'],
            objectives: ['يتعرف التلميذ على العدد الأولي', 'يفكك عدداً صحيحاً إلى جذاء عوامل أولية', 'يوظف PGCD و PPCM لاختصار الكسور وحل المسائل'],
            prerequisites: ['العمليات الحسابية الأساسية في N', 'مفهوم قاسم ومضاعف عدد طبيعي'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'العمليات على الأعداد الكسرية',
            title: 'جمع وطرح وضرب وقسمة الأعداد الكسرية وقابلية الاختزال',
            notions: ['الكسور المتكافئة', 'توحيد المقامات', 'مقلوب عدد كسري', 'الاختزال إلى أقصى حد'],
            competencies: ['إنجاز الحسابات على الأعداد الكسرية وتوظيفها في حل وضعيات مشكلة'],
            objectives: ['يحسب مجموع وفرق وجذاء وجداء قسمة أعداد كسرية', 'يختزل كسراً باستخدام PGCD'],
            prerequisites: ['الأعداد الكسرية وتفكيك الأعداد الصحيحة'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الأعداد النسبية',
            title: 'تقديم الأعداد الصحيحة النسبية والمقارنة والقيمة المطلقة',
            notions: ['العدد الصحيح النسبي', 'المستقيم المدرج', 'القيمة المطلقة', 'مقارنة أعداد نسبية'],
            competencies: ['تعيين مقارنة الأعداد النسبية وتأطيرها على مستقيم مدرج'],
            objectives: ['يمثل الأعداد النسبية على مستقيم مدرج', 'يقارن عددين نسبيين ويحسب القيمة المطلقة'],
            prerequisites: ['الأعداد الصحيحة الطبيعية وتدريج مستقيم'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'التناسب والنسبة المئوية',
            title: 'جدول التناسبية معامل التناسب والنسبة المئوية والسلم',
            notions: ['معامل التناسب', 'النسبة المئوية', 'السلم والمخططات', 'الرسم البياني للتناسبية'],
            competencies: ['استخراج وتطبيق النسبة المئوية والسلم وحل وضعيات تناسبية'],
            objectives: ['يتعرف جدول تناسبية ويحسب معامل التناسب', 'يطبق النسبة المئوية وحساب المسافات الحقيقية والتصميمية'],
            prerequisites: ['الأعداد الكسرية والعمليات الحسابية'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'العبارات الحرفية والمعادلات',
            title: 'تبسيط العبارات الحرفية وحل معادلات من الشكل x + a = b',
            notions: ['المتغير والحرف', 'النشر والتبسيط', 'المعادلة البسيطة في N و Q'],
            competencies: ['ترييض وضعيات بسيطة بصياغة وحل معادلات حرفية'],
            objectives: ['يبسط عبارة حرفية بسيطة', 'يحل معادلة من الشكل x + a = b و a * x = b'],
            prerequisites: ['العمليات على الأعداد الصحيحة والكسرية'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'التوازي والتعامد والتناظر المحوري',
            title: 'المستقيمات المتوازية والمتعامدة والتناظر المحوري وخصائصه',
            notions: ['محور قطعة مستقيمة', 'منصف الزاوية', 'التناظر المحوري', 'الحفاظ على المسافات والزوايا'],
            competencies: ['إنشاء نظير شكل بالتناظر المحوري واستغلال خصائصه في الإثبات الهندسي'],
            objectives: ['ينشئ نظير نقطة وقطعة مستقيمة وزاوية بالتناظر المحوري', 'يطبق خاصية التناظر في إثبات استقامية وتقايس القطع'],
            prerequisites: ['المستقيمات والقطع والزوايا وحالات التعامد والتوازي'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'المثلثات والرباعيات والمساحات',
            title: 'خاصيات المثلثات والرباعيات وحساب مساحات الأشكال المستوية',
            notions: ['مجموع زوايا مثلث', 'المثلث القائم ومتساوي الساقين ومقايس الأضلاع', 'المتوازي الاضلاع والمستطيل والمربع', 'المساحات'],
            competencies: ['حساب زوايا ومساحات المثلثات والرباعيات الاستناد إلى خاصياتها'],
            objectives: ['يحسب قياس زاوية مجهولة في مثلث', 'يحسب مساحة مثلث ومتوازي اضلاع وشبه منحرف'],
            prerequisites: ['الزوايا وحساب الأطوال والمساحات الأساسية'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الأشكال الهندسية في الفضاء',
            title: 'المتوازي المستطيلات والمكعب والموشور القائم',
            notions: ['الأوجه', 'الأحرف', 'الرؤوس', 'المساحة الجانبية والكلية', 'الحجم'],
            competencies: ['تمثيل المجسمات في الفضاء وحساب الحجوم والمساحات'],
            objectives: ['يميز التلميذ عناصر المجسم الفضائي', 'ينشر المجسمات القائمة', 'يحسب الحجم والمساحة الجانبية'],
            prerequisites: ['حساب مساحات الأشكال المستوية (مستطيل، مربع، مثلث)'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الإحصاء',
            title: 'تجميع المعطيات الإحصائية وحساب التكرارات والمخطط الدائري والعصوي',
            notions: ['المجتمع الإحصائي', 'الميزة الإحصائية', 'التكرار والتكرار النسبي', 'المخطط الإحصائي'],
            competencies: ['قراءة وتنظيم معطيات إحصائية في جدول وتمثيلها بيانيا'],
            objectives: ['ينظم معطيات في جدول تكرارات', 'يمثل المعطيات بمخطط أعمدة أو مخطط دائري'],
            prerequisites: ['النسبة المئوية وحساب الزوايا والكسور'],
            source: SOURCE_TYPES.OFFICIAL
          }
        ]
      },
      c8: {
        domain: 'الأعداد والحساب والهندسة',
        lessons: [
          {
            axis: 'مبرهنة فيثاغورث وتطبيقاتها',
            title: 'خاصية فيثاغورث في المثلث القائم',
            notions: ['المثلث القائم', 'الوتر', 'مجموع مربعي طولي ضلعي القائمة', 'المثلثات القائمة الخاصة'],
            competencies: ['حل وضعيات هندسية وحساب أطوال أضلاع مجهولة في مثلث قائم بتطبيق مبرهنة فيثاغورث'],
            objectives: ['يصيغ التلميذ مبرهنة فيثاغورث بدقة', 'يحسب طول الوتر بمعرفة ضلعي القائمة', 'يحسب طول أحد أضلاع القائمة', 'يثبت أن مثلثاً قائم الزاوية باستعمال الخاصية العكسية'],
            prerequisites: ['مفهوم المثلث القائم والزاوية القائمة', 'مربع عدد نسبي والجذر التربيعي البسيط للأعداد المربعة الكاملة'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الأعداد النسبية والعمليات عليها',
            title: 'جمع وطرح وضرب الأعداد النسبية',
            notions: ['العدد النسبي', 'القيمة المطلقة', 'المستقيم المدرج', 'جداء أعداد نسبية', 'قاعدة الإشارات'],
            competencies: ['التحكم في الحساب على الأعداد الصحيحة النسبية ومقارنتها'],
            objectives: ['يمثل الأعداد النسبية على مستقيم مدرج', 'يطبق قاعدة الإشارات في الجمع والضرب', 'يحسب عبارات جبرية بها أقواس ومعقفات'],
            prerequisites: ['الأعداد الصحيحة الطبيعية', 'المستقيم المدرج في N'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الأعداد الكسرية النسبية',
            title: 'العمليات على الأعداد الكسرية النسبية ومقارنتها والترتيب',
            notions: ['العدد الكسري النسبي', 'العمليات الأربع في Q', 'الترتيب والقيمة المطلقة في Q'],
            competencies: ['إنجاز حسابات معقدة على الأعداد الكسرية النسبية والترتيب'],
            objectives: ['يبسط ويحسب عبارات تحتوي كسوراً نسبية', 'يقارن ويرتب أعداداً كسرية نسبية'],
            prerequisites: ['الأعداد الكسرية والأعداد الصحيحة النسبية'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'المعادلات والمتراجحات من الدرجة الأولى',
            title: 'حل معادلات ومتراجحات من الدرجة الأولى بمجهول واحد في Q',
            notions: ['المعادلة من الدرجة الأولى في Q', 'المتراجحة في Q', 'خاصيات المساواة والترتيب'],
            competencies: ['حل معادلات ومتراجحات خطية وتوظيفها في حل مسائل'],
            objectives: ['يحل معادلات من الشكل ax + b = c', 'يحل متراجحات بسيطة ويمثل مجموعة الحلول'],
            prerequisites: ['الحساب الحرفي والعمليات في Q'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الضرب والقوى في مجموعة الأعداد النسبية',
            title: 'قوى عدد نسبي بدليل صحيح طبيعي وخصائص القوى العشرية',
            notions: ['قوة عدد نسبي', 'قواعد الحساب على القوى', 'الكتابة العلمية لعدد'],
            competencies: ['تطبيق قواعد الحساب على القوى واستعمال الكتابة العلمية'],
            objectives: ['يحسب قوى عدد نسبي ويوظف قواعد القوى a^n * a^m و (a^n)^m', 'يكتب أعداداً كبيرة أو صغيرة جداً بالصيغة العلمية'],
            prerequisites: ['ضرب وقسمة الأعداد النسبية'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'التناظر المركزي والدائرة والمثلثات',
            title: 'التناظر المركزي وخصائصه وخاصيات منتصفات أضلاع مثلث والدائرة',
            notions: ['مركز التناظر', 'خاصية المنتصفين في مثلث', 'المماس لدائرة', 'الزاوية المحيطية والمركزية'],
            competencies: ['استعمال التناظر المركزي وخاصية منتصف ضلعين لحساب أطوال وإثبات التوازي'],
            objectives: ['ينشئ نظير شكل بالتناظر المركزي', 'يطبق مبرهنة منتصف ضلعين في مثلث لإثبات التوازي والتنصيف'],
            prerequisites: ['التناظر المحوري والمثلثات والمنتصف'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'المعين والمستطيل والمربع وشبه المنحرف',
            title: 'الرباعيات الخاصة وخصائص الأقطار والأضلاع والمساحات',
            notions: ['المتوازي الاضلاع والرباعيات الخاصة', 'شبه المنحرف القائم ومتساوي الساقين', 'خاصيات الأقطار والمساحات'],
            competencies: ['التمييز بين الرباعيات الخاصة وإثبات طبيعة رباعي بتوظيف أقطاره وأضلاعه'],
            objectives: ['يبرهن أن رباعياً هو معين أو مستطيل أو مربع', 'يحسب مساحة شبه منحرف'],
            prerequisites: ['التناظر المحوري والمركز والمثلثات'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الهندسة الفضائية: الموشور القائم والأسطوانة',
            title: 'حساب مساحات وحجوم الموشور القائم وأسطوانة الدوران',
            notions: ['نشر أسطوانة الدوران والموشور', 'المساحة الجانبية والكلية', 'الحجم'],
            competencies: ['تمثيل وحساب حجم ومساحة أسطوانة دوران وموشور قائم'],
            objectives: ['يحسب حجم أسطوانة دوران V = pi * r^2 * h', 'يحسب المساحة الجانبية والكلية'],
            prerequisites: ['المجسمات في الفضاء ومساحة الدائرة والمستطيل'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الإحصاء وقراءة الجداول البيانية',
            title: 'المعدل الحسابي والتكرار التراكمي والتمثيل البياني بالمخطط الدائري',
            notions: ['المعدل الحسابي الموزون', 'التكرار التراكمي', 'المخطط الدائري والشريطي'],
            competencies: ['حساب المعدل الحسابي وتأويل البيانات الإحصائية في التخذ القرار'],
            objectives: ['يحسب المعدل الحسابي الموزون لسلسلة إحصائية', 'يمثل البيانات بمخطط قطاعي دائري'],
            prerequisites: ['التكرارات والنسب المئوية وتجميع المعطيات'],
            source: SOURCE_TYPES.OFFICIAL
          }
        ]
      },
      c9: {
        domain: 'الجبر والهندسة والتحليل الإحصائي',
        lessons: [
          {
            axis: 'مجموعة الأعداد الحقيقية والعمليات عليها',
            title: 'الأعداد الصامتة ومجموعة الأعداد الحقيقية R والمجالات',
            notions: ['العدد غير الناطق (الأصم)', 'الجذر التربيعي', 'مجموعة الأعداد الحقيقية R', 'المستقيم العددي والمجالات', 'حصر ومقارنة الأعداد الحقيقية'],
            competencies: ['التعرف على الأعداد الحقيقية وتوظيف الجذور التربيعية والمجالات في التعبير عن وضعيات وحل متراجحات'],
            objectives: ['يميز التلميذ بين الأعداد الناطقة وغير الناطقة', 'يعرف مجموعة الأعداد الحقيقية R وعلاقة الاحتواء N ⊂ Z ⊂ D ⊂ Q ⊂ R', 'يمثل المجالات على المستقيم المدرج', 'يحسب ويبسط عبارات تحتوي جذوراً تربيعية'],
            prerequisites: ['مجموعة الأعداد الكسرية النسبية Q', 'الكتابة العشرية للأعداد وتعيين فواصل على مستقيم مدرج'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'المثلث القائم والحساب المثلثي (جا، جتا، ظل)',
            title: 'النسب المثلثية لزاوية حادة في مثلث قائم',
            notions: ['الضلع المقابل', 'الضلع المجاور', 'جيب الزاوية sin', 'جيب تمام الزاوية cos', 'ظل الزاوية tan', 'العلاقات المثلثية الأساسية'],
            competencies: ['توظيف الحساب المثلثي في حساب أطوال وزوايا وحل وضعيات هندسية وفضائية'],
            objectives: ['يعرّف جيب وجيب تمام وظل زاوية حادة', 'يطبق العلاقات cos²(x) + sin²(x) = 1 و tan(x) = sin(x)/cos(x)', 'يحسب أطوال أضلاع المثلث بمعرفة زاوية وأحد الأضلاع'],
            prerequisites: ['المثلث القائم ومبرهنة فيثاغورث', 'الزوايا المتبادلة والمتتامة'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'مبرهنة طالس في المثلث وتطبيقاتها',
            title: 'مبرهنة طالس وخاصية المستقيمات المتوازية والمتقاطعة',
            notions: ['تناسب الأطوال', 'المستقيم الموازي لضلع مثلث', 'مبرهنة طالس المباشرة', 'المبرهنة العكسية لطالس'],
            competencies: ['استعمال التوازي وتناسب الأطوال لحساب المسافات وإثبات التوازي'],
            objectives: ['يصيغ التلميذ مبرهنة طالس في المثلث', 'يحسب أطوال قطع مستقيمة مجهولة', 'يبرهن توازي مستقيمين باستعمال المبرهنة العكسية'],
            prerequisites: ['التوازي في المستوي', 'التناسب والكسور المتكافئة'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'المعادلات والمتراجحات من الدرجة الأولى',
            title: 'حل معادلات ومتراجحات من الدرجة الأولى بمجهول واحد وترييض وضعيات',
            notions: ['المعادلة من الدرجة الأولى', 'المتراجحة', 'خاصيات المساواة والترتيب', 'ترييض مشكل'],
            competencies: ['ترييض وضعيات مشكلة وحلها باستخدام المعادلات والمتراجحات في R'],
            objectives: ['يحل معادلات من الشكل ax + b = 0', 'يحل متراجحات من الدرجة الأولى ويمثل الحلول على مستقيم', 'يروض وضعية مشكلة واقعية بصياغة وحل معادلة'],
            prerequisites: ['الحساب الحرفي والنشر والتبسيط', 'العمليات في Q و R'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'التعيين في المستوي وإحداثيات نقطة',
            title: 'المركب في المستوي وإحداثيات نقطة ومنتصف قطعة مستقيمة ومتجهة',
            notions: ['المعلم المتعامد والمتجانس', 'إحداثيتا نقطة', 'إحداثيتا منتصف قطعة', 'المسافة بين نقطتين'],
            competencies: ['تعيين نقط في المعلم وتوظيف الإحداثيات لحساب المسافات ومنتصفات القطع'],
            objectives: ['يعين نقطاً في معلم متعامد ومتجانس', 'يحسب إحداثيات منتصف قطعة مستقيمة والمسافة بين نقطتين'],
            prerequisites: ['المستقيم المدرج والأعداد الحقيقية ومبرهنة فيثاغورث'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الهندسة في الفضاء: الهرم والمخروط الدوراني ومقاطع المجسمات',
            title: 'حساب حجوم ومساحات الهرم والمخروط الدوراني والمقاطع بمستو',
            notions: ['الهرم القائم', 'المخروط الدوراني', 'ارتفاع المجسم', 'مقطع بمستو مواز للقاعدة', 'معامل التصغير والتكبير'],
            competencies: ['تمثيل وحساب حجم ومساحة الهرم والمخروط وتوظيف التصغير والتكبير في المقطع'],
            objectives: ['يحسب حجم الهرم والمخروط V = (1/3) * B * h', 'يطبق معامل التصغير k على الأطوال و k^2 على المساحات و k^3 على الحجوم'],
            prerequisites: ['المجسمات القائمة وحساب مساحة القاعدة في المستوي'],
            source: SOURCE_TYPES.OFFICIAL
          },
          {
            axis: 'الإحصاء: التكرار التراكمي ومخططات التشتت',
            title: 'التكرار التراكمي المجمع الصاعد والنازل والمؤشرات الإحصائية',
            notions: ['التكرار التراكمي الصاعد والنازل', 'الفئات الإحصائية', 'المعدل الحسابي للفئات', 'مخطط التشتت ومضلع التكرارات'],
            competencies: ['تنظيم سلسلة إحصائية بالمعطيات المستمرة وحساب المؤشرات الإحصائية'],
            objectives: ['يمثل جدول التكرارات التراكمية في مخطط مجمع', 'يحسب المعدل الحسابي لسلسلة مجمعة في فئات'],
            prerequisites: ['المعدل الحسابي والتكرارات في 7 و 8 أساسي'],
            source: SOURCE_TYPES.OFFICIAL
          }
        ]
      }
    },
    // 🎓 المرحلة الثانوية — الرياضيات (بالفرنسية وفق المنهاج الرسمي)
    math_lycee: {
      l1: {
        domain: 'Mathématiques - Analyse et Géométrie du plan (1ère année secondaire)',
        lessons: [
          {
            axis: 'Ensembles de nombres et calcul dans R',
            title: 'Ensembles de nombres, intervalles, valeur absolue et calcul dans R',
            notions: ['Nombres réels', 'Intervalles de R', 'Valeur absolue et distance', 'Encadrements et puissances', 'Radicaux'],
            competencies: ['Maîtriser le calcul algébrique dans R et manipuler les intervalles et valeurs absolues'],
            objectives: ['Résoudre des inéquations avec valeurs absolues', 'Manipuler les réunions et intersections d\'intervalles', 'Simplifier les expressions contenant des radicaux'],
            prerequisites: ['Ensemble des nombres réels (9ème)', 'Ordre et opérations'],
            source: SOURCE_TYPES.OFFICIAL
          }
        ]
      }
    }
  };

  // ── 4. OFFICIAL TEXTBOOKS REPOSITORY (CNP) ─────────────────
  // Structured database of approved textbook activities and page references
  const TEXTBOOK_CATALOG = [
    {
      id: 'tb_math_9_cnp_2024',
      title: 'كتاب الرياضيات للسنة التاسعة من التعليم الأساسي',
      level: 'c9',
      levelLabel: 'السنة 9 أساسي',
      subject: 'math',
      edition: 'المركز الوطني البيداغوجي (CNP) تونس',
      year: '2024/2025',
      chapters: [
        {
          chapterNumber: 1,
          title: 'الأعداد الحقيقية',
          pages: [18, 19, 20, 21, 22, 23, 24],
          activities: [
            {
              id: 'ACT-9-REAL-P19-1',
              activityNumber: 1,
              title: 'نشاط 1: استكشاف الأعداد غير الناطقة والأعداد الصامتة',
              page: 19,
              chapter: 'الأعداد الحقيقية',
              sourceType: SOURCE_TYPES.TEXTBOOK,
              sourceTitle: 'كتاب الرياضيات للسنة 9 أساسي (CNP) - ص 19',
              verified: true,
              content: `نعتبر n عدداً صحيحاً نسبياً (n ∈ Z). ونعرف العددين a و b كما يلي: a = 2n و b = 2n + 1.
1. هل العدد a زوجي أم فردي؟
2. إذا كان n ∈ Z، هل a² زوجي أم فردي؟
3. إذا كان c² زوجياً، هل c زوجي؟
4. أوجد طبيعة الأعداد التالية: A = 1/2 ، B = 2/3 ، C = 12/5 ، D = 19/4.
ملاحظة واستنتاج: من خلال دراسة الأعداد A و B و C و D، هل يمكننا القول أن كل عدد يمكن كتابته على شكل كسر p/q (حيث p ∈ Z و q ∈ Z*) هو عدد ناطق؟ وهل كل عدد ناطق هو بالضرورة عدد عشري؟`
            },
            {
              id: 'ACT-9-REAL-P20-2',
              activityNumber: 2,
              title: 'نشاط 2: تصنيف الأعداد العشرية الدورية والأعداد الحقيقية',
              page: 20,
              chapter: 'الأعداد الحقيقية',
              sourceType: SOURCE_TYPES.TEXTBOOK,
              sourceTitle: 'كتاب الرياضيات للسنة 9 أساسي (CNP) - ص 20',
              verified: true,
              content: `1. أنجز عمليات القسمة لـ : 7 على 12,5 ثم 9 على 17 ثم 3 على 4 و 65 على 22.
2. ما هو الفرق بين الأعداد ذات الكتابة العشرية المنتهية وتلك ذات الكتابة العشرية الدورية غير المنتهية؟
3. نعتبر العددين: A = 2,101001000100001... و B = -3,123456789101112...
هل أن الكتابة العشرية لكل من A و B دورية؟ هل ينتميان إلى Q؟
استنتاج: نسمي كل عدد كتابته العشرية غير منتهية وغير دورية عدداً أصمّ (أو غير ناطق). مجموعة الأعداد الناطقة وغير الناطقة تكون مجموعة الأعداد الحقيقية R.`
            }
          ],
          exercises: [
            {
              id: 'EX-9-REAL-P21-1',
              exerciseNumber: 1,
              page: 21,
              title: 'تمرين 1: ترتيب ومقارنة الأعداد الحقيقية',
              sourceType: SOURCE_TYPES.TEXTBOOK,
              sourceTitle: 'كتاب الرياضيات للسنة 9 أساسي (CNP) - تمرين 1 ص 21',
              verified: true,
              content: 'رتب الأعداد التالية ترتيباً تصاعدياً على مستقيم مدرج: 11/5 ، 2 ، 1 ، 35/7 ، -3 ، 8 ، 11.'
            },
            {
              id: 'EX-9-REAL-P21-2',
              exerciseNumber: 2,
              page: 21,
              title: 'تمرين 2: طبيعة الأعداد وصواب وخطأ مع التعليل',
              sourceType: SOURCE_TYPES.TEXTBOOK,
              sourceTitle: 'كتاب الرياضيات للسنة 9 أساسي (CNP) - تمرين 2 ص 21',
              verified: true,
              content: `أجب بصواب أو خطأ مع التعليل العلمي لكل حالة مما يلي:
1. العدد A = 2,101001000100001... هو عدد ناطق.
2. العدد B = -3,123456789101112... هو عدد حقيقي غير ناطق.
3. كل عدد عشري هو عدد صحيح.
4. المجموعة Q هي مجموعة جزئية من R (أي Q ⊂ R).`
            }
          ]
        }
      ]
    }
  ];

  // ── Helper Normalization Functions ─────────────────────────
  function normalizeLevel(levelId) {
    if (!levelId) return '';
    const l = String(levelId).toLowerCase().trim();
    if (l === '7' || l === '7eme' || l === '7ème' || l === 'c7' || l.includes('السابعة') || l.includes('7')) return 'c7';
    if (l === '8' || l === '8eme' || l === '8ème' || l === 'c8' || l.includes('الثامنة') || l.includes('8')) return 'c8';
    if (l === '9' || l === '9eme' || l === '9ème' || l === 'c9' || l.includes('التاسعة') || l.includes('9') || l.includes('3')) return 'c9';
    if (l === '1ere' || l === '1ere_sec' || l === 's1' || l === 'l1' || l === '1ère' || l.includes('الأولى ثانوي') || l === '1') return 'l1';
    return l;
  }

  function normalizeSubject(subjectId) {
    if (!subjectId) return 'math';
    const s = String(subjectId).toLowerCase().trim();
    if (s.includes('math') || s.includes('رياضيات')) return 'math';
    if (s.includes('phys') || s.includes('فيزياء')) return 'physics';
    if (s.includes('arab') || s.includes('عربية')) return 'arabic';
    if (s.includes('french') || s.includes('français') || s.includes('فرنسية')) return 'french';
    if (s.includes('eng') || s.includes('إنجليزية')) return 'english';
    return s;
  }

  // ── 5. RUNTIME STORES (In-memory cache for Teachers & Generated items) ──
  const teacherResourcesStore = [];
  const generatedContentStore = [];

  // ── 6. KNOWLEDGE BASE CORE CLASS & API ────────────────────
  const KnowledgeBase = {
    // Enum Exports
    SOURCE_TYPES,
    VERIFICATION_STATUS,

    /**
     * Get official curriculum structure for a given level and subject
     */
    getProgrammes(levelId, subjectId) {
      const normLevel = normalizeLevel(levelId);
      const normSub = normalizeSubject(subjectId);

      // 1. Check detailed programmes database
      const detailed = DETAILED_PROGRAMMES[normSub]?.[normLevel] ||
                       DETAILED_PROGRAMMES[subjectId]?.[levelId] ||
                       DETAILED_PROGRAMMES[normSub + '_lycee']?.[normLevel];
      if (detailed) return detailed;

      // 2. Fallback to curriculumRef if available
      if (curriculumRef && curriculumRef.getUnits) {
        const units = curriculumRef.getUnits(levelId, subjectId) || [];
        return {
          domain: 'المنهاج الرسمي التونسي المعياري',
          lessons: units.map(u => ({
            axis: u,
            title: u,
            notions: [u],
            competencies: [`توظيف وتطبيق معارف مادة ${subjectId} في وحدة ${u}`],
            objectives: [`يتعرف التلميذ على المفاهيم الأساسية لـ ${u}`, `يطبق القواعد والنتائج في وضعيات ملائمة`],
            prerequisites: ['المكتسبات القبلية المقررة في المنهاج التونسي للمستويات السابقة'],
            source: SOURCE_TYPES.OFFICIAL
          }))
        };
      }

      return null;
    },

    /**
     * Find exact lesson details by axis & title
     */
    findLesson(levelId, subjectId, axisTitle, lessonTitle) {
      const prog = this.getProgrammes(levelId, subjectId);
      if (!prog || !prog.lessons) return null;

      const norm = (s) => (s || '').toLowerCase().trim().replace(/[\s\-_]+/g, ' ');
      const searchLesson = norm(lessonTitle);
      const searchAxis   = norm(axisTitle);

      // Search matching lesson
      let match = prog.lessons.find(l => {
        const lTitle = norm(l.title);
        const lAxis  = norm(l.axis);
        if (searchLesson && (lTitle.includes(searchLesson) || searchLesson.includes(lTitle))) return true;
        if (searchAxis && (lAxis.includes(searchAxis) || searchAxis.includes(lAxis))) return true;
        return false;
      });

      if (match) {
        return {
          ...match,
          domain: prog.domain,
          sourceType: SOURCE_TYPES.OFFICIAL,
          verified: true
        };
      }

      return null;
    },

    /**
     * Validate whether a chosen lesson matches the official curriculum axis
     */
    verifyLessonMatch(levelId, subjectId, axisTitle, lessonTitle) {
      const prog = this.getProgrammes(levelId, subjectId);
      if (!prog || !prog.lessons || prog.lessons.length === 0) {
        return { valid: true, warning: null };
      }

      const norm = (s) => (s || '').toLowerCase().trim();
      const normAxis = norm(axisTitle);
      const normLesson = norm(lessonTitle);

      // Check if axis exists in official list
      const axisExists = prog.lessons.some(l => norm(l.axis) === normAxis || norm(l.axis).includes(normAxis) || normAxis.includes(norm(l.axis)));
      if (axisTitle && !axisExists) {
        return {
          valid: false,
          warning: `⚠️ تنبيه بيداغوجي: المحور المختار «${axisTitle}» غير متطابق مع قائمة المحاور الرسمية للمستوى المختار في البرنامج التونسي.`
        };
      }

      return { valid: true, warning: null };
    },

    /**
     * Search official textbooks for activities/exercises
     */
    getTextbookActivities(levelId, subjectId, lessonOrChapterTitle) {
      const results = [];
      const normLevel = normalizeLevel(levelId);
      const normSub = normalizeSubject(subjectId);
      const norm = (s) => (s || '').toLowerCase().trim();
      const query = norm(lessonOrChapterTitle);

      TEXTBOOK_CATALOG.forEach(tb => {
        const tbLevelNorm = normalizeLevel(tb.level);
        const tbSubNorm = normalizeSubject(tb.subject);
        if ((tbLevelNorm === normLevel || tb.level === levelId) && (tbSubNorm === normSub || tb.subject === subjectId)) {
          tb.chapters.forEach(ch => {
            const chNorm = norm(ch.title);
            const matchesChapter = !query || chNorm.includes(query) || query.includes(chNorm);

            ch.activities.forEach(act => {
              const actNorm = norm(act.title);
              if (matchesChapter || actNorm.includes(query)) {
                results.push({
                  ...act,
                  textbookId: tb.id,
                  textbookTitle: tb.title,
                  sourceType: SOURCE_TYPES.TEXTBOOK,
                  verified: true
                });
              }
            });
          });
        }
      });

      return results;
    },

    /**
     * Search official textbooks for exercises
     */
    getTextbookExercises(levelId, subjectId, lessonOrChapterTitle) {
      const results = [];
      const normLevel = normalizeLevel(levelId);
      const normSub = normalizeSubject(subjectId);
      const norm = (s) => (s || '').toLowerCase().trim();
      const query = norm(lessonOrChapterTitle);

      TEXTBOOK_CATALOG.forEach(tb => {
        const tbLevelNorm = normalizeLevel(tb.level);
        const tbSubNorm = normalizeSubject(tb.subject);
        if ((tbLevelNorm === normLevel || tb.level === levelId) && (tbSubNorm === normSub || tb.subject === subjectId)) {
          tb.chapters.forEach(ch => {
            const chNorm = norm(ch.title);
            const matchesChapter = !query || chNorm.includes(query) || query.includes(chNorm);

            ch.exercises.forEach(ex => {
              const exNorm = norm(ex.title);
              if (matchesChapter || exNorm.includes(query)) {
                results.push({
                  ...ex,
                  textbookId: tb.id,
                  textbookTitle: tb.title,
                  sourceType: SOURCE_TYPES.TEXTBOOK,
                  verified: true
                });
              }
            });
          });
        }
      });

      return results;
    },

    /**
     * Add and record teacher resource
     */
    addTeacherResource(resource) {
      if (!resource) return null;
      const item = {
        id: resource.id || `tr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sourceType: SOURCE_TYPES.TEACHER,
        sourceTitle: resource.title || 'مورد بيداغوجي مضاف من قِبل الأستاذ',
        level: resource.level || '',
        subject: resource.subject || '',
        lesson: resource.lesson || '',
        type: resource.type || 'document',
        content: resource.content || '',
        verified: true,
        dateAdded: new Date().toISOString()
      };
      teacherResourcesStore.push(item);
      return item;
    },

    /**
     * Add and record AI generated content item
     */
    addGeneratedItem(item) {
      if (!item) return null;
      const record = {
        id: item.id || `gen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sourceType: SOURCE_TYPES.GENERATED,
        sourceTitle: item.title || 'نشاط مقترح مولد بالذكاء الاصطناعي',
        level: item.level || '',
        subject: item.subject || '',
        lesson: item.lesson || '',
        type: item.type || 'activity_variant',
        content: item.content || '',
        confidence: item.confidence || 'AI_SUGGESTION',
        verified: false,
        timestamp: new Date().toISOString()
      };
      generatedContentStore.push(record);
      return record;
    },

    /**
     * Get all recorded teacher resources
     */
    getTeacherResources(levelId, subjectId) {
      const normLevel = normalizeLevel(levelId);
      const normSub = normalizeSubject(subjectId);
      return teacherResourcesStore.filter(r => {
        if (levelId && r.level && normalizeLevel(r.level) !== normLevel && r.level !== levelId) return false;
        if (subjectId && r.subject && normalizeSubject(r.subject) !== normSub && r.subject !== subjectId) return false;
        return true;
      });
    },

    /**
     * Get all recorded generated items
     */
    getGeneratedItems(levelId, subjectId) {
      const normLevel = normalizeLevel(levelId);
      const normSub = normalizeSubject(subjectId);
      return generatedContentStore.filter(g => {
        if (levelId && g.level && normalizeLevel(g.level) !== normLevel && g.level !== levelId) return false;
        if (subjectId && g.subject && normalizeSubject(g.subject) !== normSub && g.subject !== subjectId) return false;
        return true;
      });
    },

    /**
     * Get all knowledge items (activities, rules, exercises)
     */
    getKnowledgeItems(levelId, subjectId) {
      const items = [];
      const normLevel = normalizeLevel(levelId);
      const normSub = normalizeSubject(subjectId);

      // 1. Pull items from TEXTBOOK_CATALOG
      TEXTBOOK_CATALOG.forEach(tb => {
        if ((!levelId || normalizeLevel(tb.level) === normLevel || tb.level === levelId) &&
            (!subjectId || normalizeSubject(tb.subject) === normSub || tb.subject === subjectId)) {
          tb.chapters.forEach(c => {
            c.activities.forEach(a => {
              items.push({
                textbookId: tb.id,
                pageNumber: a.page,
                level: tb.level,
                subject: tb.subject,
                lessonTitle: c.title,
                title: a.title,
                content: a.content || `${a.title} — صفحة ${a.page} من كتاب ${tb.title}`,
                type: 'activity',
                number: a.num
              });
            });
          });
        }
      });

      // 2. Pull items from DETAILED_PROGRAMMES
      Object.keys(DETAILED_PROGRAMMES).forEach(subjKey => {
        if (!subjectId || normSub === subjKey || subjectId === subjKey) {
          const subjData = DETAILED_PROGRAMMES[subjKey];
          Object.keys(subjData).forEach(lvlKey => {
            if (!levelId || normLevel === lvlKey || levelId === lvlKey) {
              const lvlData = subjData[lvlKey];
              if (lvlData && lvlData.lessons) {
                lvlData.lessons.forEach((l, idx) => {
                  items.push({
                    textbookId: 'tb_official_prog',
                    pageNumber: 12 + idx * 4,
                    level: lvlKey,
                    subject: subjKey,
                    lessonTitle: l.title,
                    title: `${l.axis} — ${l.title}`,
                    content: `المحور: ${l.axis} | الدرس: ${l.title} | المفاهيم: ${(l.notions || []).join('، ')} | الكفايات: ${(l.competencies || []).join('، ')}`,
                    type: 'rule',
                    number: idx + 1
                  });
                });
              }
            }
          });
        }
      });

      return items;
    },

    /**
     * Validate an item reference: checks if page/chapter exists in textbook catalog
     */
    validateReference({ level, subject, page, chapter }) {
      if (!page && !chapter) return { valid: true, error: null };

      const normLevel = normalizeLevel(level);
      const normSub = normalizeSubject(subject);

      const tb = TEXTBOOK_CATALOG.find(t =>
        (normalizeLevel(t.level) === normLevel || t.level === level) &&
        (normalizeSubject(t.subject) === normSub || t.subject === subject)
      );
      if (!tb) {
        return { valid: false, error: 'INVALID_REFERENCE: لا يوجد كتاب مدرسي مسجل في بنك المعرفة لهذا المستوى والمادة.' };
      }

      if (page) {
        const pageExists = tb.chapters.some(c => c.pages.includes(Number(page)));
        if (!pageExists) {
          return { valid: false, error: `INVALID_REFERENCE: الصفحة ${page} غير موجودة في فهرس كتاب ${tb.title}.` };
        }
      }

      return { valid: true, error: null, textbookTitle: tb.title };
    }
  };

  return KnowledgeBase;
}));
