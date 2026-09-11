// ============================================================
//  TUNISIAN OFFICIAL CURRICULUM DATABASE — curriculum.js
//  وزارة التربية التونسية — البرامج الرسمية المعتمدة
//  College: عربي | Lycée: Français | FR/EN: langue de la matière
// ============================================================

const CURRICULUM = {

  // ── CYCLES & LEVELS ─────────────────────────────────────
  levels: [
    // 🏫 المرحلة الإعدادية (التعليم الأساسي) — لغة التدريس: العربية
    { id: 'c7',  label: 'السنة 7 أساسي', cycle: 'college', stage: 'college', fr: '7ème année de base' },
    { id: 'c8',  label: 'السنة 8 أساسي', cycle: 'college', stage: 'college', fr: '8ème année de base' },
    { id: 'c9',  label: 'السنة 9 أساسي (شهادة ختم الأساسي)', cycle: 'college', stage: 'college', fr: '9ème année de base' },

    // 🎓 المرحلة الثانوية (التعليم الثانوي)
    { id: 'l1',   label: '1ère Année Secondaire (Tronc Commun)', cycle: 'lycee', stage: 'lycee', fr: '1ère année secondaire' },
    { id: 'l2s',  label: '2ème Année Sciences', cycle: 'lycee', stage: 'lycee', fr: '2ème Sciences' },
    { id: 'l2m',  label: '2ème Année Mathématiques', cycle: 'lycee', stage: 'lycee', fr: '2ème Maths' },
    { id: 'l2e',  label: '2ème Année Économie et Services', cycle: 'lycee', stage: 'lycee', fr: '2ème Économie' },
    { id: 'l2t',  label: '2ème Année Technologies de l\'Informatique', cycle: 'lycee', stage: 'lycee', fr: '2ème Info' },
    { id: 'l2l',  label: '2ème Année Lettres', cycle: 'lycee', stage: 'lycee', fr: '2ème Lettres' },
    { id: 'l3m',  label: '3ème Année Mathématiques', cycle: 'lycee', stage: 'lycee', fr: '3ème Maths' },
    { id: 'l3s',  label: '3ème Année Sciences Expérimentales', cycle: 'lycee', stage: 'lycee', fr: '3ème Sc. exp.' },
    { id: 'l3t',  label: '3ème Année Sciences Techniques', cycle: 'lycee', stage: 'lycee', fr: '3ème Technique' },
    { id: 'l3i',  label: '3ème Année Sciences de l\'Informatique', cycle: 'lycee', stage: 'lycee', fr: '3ème Info' },
    { id: 'l3e',  label: '3ème Année Économie et Gestion', cycle: 'lycee', stage: 'lycee', fr: '3ème Économie' },
    { id: 'l3l',  label: '3ème Année Lettres', cycle: 'lycee', stage: 'lycee', fr: '3ème Lettres' },
    { id: 'l4m',  label: '4ème Année Baccalauréat Mathématiques', cycle: 'lycee', stage: 'lycee', fr: 'Bac Maths' },
    { id: 'l4s',  label: '4ème Année Baccalauréat Sciences Expérimentales', cycle: 'lycee', stage: 'lycee', fr: 'Bac Sc. exp.' },
    { id: 'l4t',  label: '4ème Année Baccalauréat Sciences Techniques', cycle: 'lycee', stage: 'lycee', fr: 'Bac Technique' },
    { id: 'l4i',  label: '4ème Année Baccalauréat Sciences de l\'Informatique', cycle: 'lycee', stage: 'lycee', fr: 'Bac Info' },
    { id: 'l4e',  label: '4ème Année Baccalauréat Économie et Gestion', cycle: 'lycee', stage: 'lycee', fr: 'Bac Économie' },
    { id: 'l4l',  label: '4ème Année Baccalauréat Lettres', cycle: 'lycee', stage: 'lycee', fr: 'Bac Lettres' },
  ],

  // ── SUBJECTS BY CYCLE ───────────────────────────────────
  subjects: {
    college: [
      { id: 'math',   label: '🔢 الرياضيات',                         lang: 'ar' },
      { id: 'pc',     label: '⚗️ العلوم الفيزيائية والتكنولوجية',    lang: 'ar' },
      { id: 'svt',    label: '🌿 علوم الحياة والأرض',               lang: 'ar' },
      { id: 'techno', label: '🔧 التربية التكنولوجية',               lang: 'ar' },
      { id: 'info',   label: '💻 الإعلامية',                         lang: 'ar' },
      { id: 'ar',     label: '📝 اللغة العربية وآدابها',             lang: 'ar' },
      { id: 'fr',     label: '🇫🇷 اللغة الفرنسية (Français)',        lang: 'fr' },
      { id: 'en',     label: '🇬🇧 اللغة الإنجليزية (English)',       lang: 'en' },
    ],
    lycee: [
      { id: 'math',   label: '🔢 Mathématiques',                     lang: 'fr' },
      { id: 'pc',     label: '⚗️ Sciences Physiques (الفيزياء)',     lang: 'fr' },
      { id: 'svt',    label: '🌿 Sciences de la Vie et de la Terre', lang: 'fr' },
      { id: 'info',   label: '💻 Informatique & Algorithmique',      lang: 'fr' },
      { id: 'techno', label: '🔧 Génie Électrique & Mécanique',      lang: 'fr' },
      { id: 'eco',    label: '📊 Économie et Gestion',               lang: 'fr' },
      { id: 'fr',     label: '🇫🇷 Français (Langue et Littérature)', lang: 'fr' },
      { id: 'ar',     label: '📝 Arabe (اللغة العربية وآدابها)',     lang: 'ar' },
      { id: 'en',     label: '🇬🇧 English (اللغة الإنجليزية)',       lang: 'en' },
      { id: 'philo',  label: '🧠 Philosophie (الفلسفة)',             lang: 'ar' },
    ],
  },

  // ── UNITS BY SUBJECT → LEVEL ───────────────────────────
  units: {

    // ════════════════════════════════════════════
    //  MATHEMATICS — الرياضيات / Mathématiques
    // ════════════════════════════════════════════
    math: {
      // 🏫 الإعدادي — عربي 100%
      c7: ['الأعداد الصحيحة الطبيعية والكسرية','العمليات على الأعداد الكسرية','الأعداد النسبية','التناسب والنسبة المئوية','العبارات الحرفية والمعادلات','التوازي والتعامد والتناظر المحوري','المثلثات والرباعيات والمساحات','الأشكال الهندسية في الفضاء','الإحصاء'],
      c8: ['الأعداد النسبية والعمليات عليها','الأعداد الكسرية النسبية','المعادلات والمتراجحات من الدرجة الأولى','الضرب والقوى في مجموعة الأعداد النسبية','مبرهنة فيثاغورث وتطبيقاتها','التناظر المركزي والدائرة والمثلثات','المعين والمستطيل والمربع وشبه المنحرف','الهندسة الفضائية: الموشور القائم والأسطوانة','الإحصاء وقراءة الجداول البيانية'],
      c9: ['مجموعة الأعداد الحقيقية والعمليات عليها','المعادلات والمتراجحات ذات مجهول واحد في R','التعيين في المستوي وإحداثيات نقطة','مبرهنة طالس في المثلث وتطبيقاتها','المثلث القائم والحساب المثلثي (جا، جتا، ظل)','الهندسة في الفضاء: الهرم والمخروط الدوراني ومقاطع المجسمات','الإحصاء: التكرار التراكمي ومخططات التشتت'],
      // 🎓 الثانوي — Français
      l1: ['Ensembles de nombres et calcul dans R','Équations, inéquations et systèmes linéaires','Généralités sur les fonctions numériques','Trigonométrie et relations métriques dans le triangle','Vecteurs et repérage cartésien dans le plan','Statistiques et distributions à une variable','Géométrie dans l\'espace : parallélisme et orthogonalité'],
      l2s: ['Généralités sur les fonctions et variations','Barycentre dans le plan et applications géométriques','Formules de trigonométrie et équations trigonométriques','Suites réelles (arithmétiques et géométriques)','Produit scalaire dans le plan et applications métriques','Géométrie analytique dans l\'espace','Statistiques et paramètres de dispersion'],
      l2m: ['Arithmétique dans Z et divisibilité','Fonctions numériques d\'une variable réelle','Barycentres et lignes de niveau','Trigonométrie avancée','Produit scalaire et applications géométriques','Suites numériques et limites','Vecteurs et repères dans l\'espace'],
      l2e: ['Fonctions numériques et applications économiques','Statistiques descriptives à deux variables','Algèbre linéaire : matrices et systèmes','Mathématiques financières : intérêts simples et composés'],
      l2t: ['Fonctions d\'une variable et variations','Trigonométrie et nombres complexes (initiation)','Suites réelles','Produit scalaire et géométrie vectorielle','Statistiques'],
      l2l: ['Fonctions numériques et modélisation','Statistiques et représentations graphiques','Équations et inéquations du premier et second degré'],
      l3m: ['Continuité et limites de fonctions réelles','Dérivabilité et théorèmes généraux','Étude de fonctions et branches infinies','Suites réelles et convergence','Nombres complexes et géométrie plane','Géométrie vectorielle dans l\'espace et produit scalaire/vectoriel','Dénombrement et probabilités'],
      l3s: ['Continuité et limites de fonctions','Dérivabilité et étude de fonctions','Suites réelles et limites','Produit scalaire dans l\'espace et équations de plans/sphères','Dénombrement et calcul de probabilités'],
      l3t: ['Fonctions numériques et dérivation','Nombres complexes : forme algébrique et trigonométrique','Suites réelles','Géométrie vectorielle dans l\'espace','Probabilités conditionnelles'],
      l3i: ['Graphes et arbres (théorie des graphes)','Arithmétique et systèmes de numération','Fonctions numériques et dérivation','Suites réelles','Matrices et calcul matriciel','Probabilités'],
      l3e: ['Fonctions numériques et optimisation économique','Matrices et résolution de systèmes linéaires','Ajustement affine et séries statistiques doubles','Probabilités et variables aléatoires'],
      l3l: ['Fonctions numériques et taux d\'accroissement','Statistiques et probabilités élémentaires','Mathématiques appliquées à la gestion'],
      l4m: ['Continuité, limites et théorème des valeurs intermédiaires','Dérivabilité, théorème de Rolle et accroissements finis','Fonctions réciproques et fonctions trigonométriques','Fonctions Logarithmes (népérien et base a)','Fonctions Exponentielles et puissances','Calcul Intégral, primitives et équations différentielles','Nombres Complexes et géométrie (similitudes directes)','Arithmétique dans Z : division euclidienne, PGCD, PPCM, congruences','Probabilités discrètes et continues (lois usuelles)','Géométrie dans l\'espace : produit vectoriel, produit mixte, équations'],
      l4s: ['Continuité et limites de fonctions','Dérivabilité et théorèmes fondamentaux','Fonction Logarithme népérien et applications','Fonction Exponentielle et modélisations biologiques','Intégration et équations différentielles','Nombres Complexes et représentations géométriques','Probabilités conditionnelles et lois de probabilité','Géométrie dans l\'espace : droites et plans'],
      l4t: ['Fonctions numériques (Logarithme et Exponentielle)','Calcul Intégral et calcul d\'aires et de volumes','Équations différentielles linéaires d\'ordre 1 et 2','Nombres Complexes appliqués à l\'électricité','Probabilités et variables aléatoires','Statistiques à deux variables'],
      l4i: ['Arithmétique modulaire et cryptographie','Théorie des graphes et algorithmes de parcours','Fonctions Logarithme et Exponentielle','Calcul Intégral et suites réelles','Matrices et chaînes de Markov','Probabilités et lois discrètes'],
      l4e: ['Fonctions numériques d\'une variable et fonctions économiques','Calcul Intégral et surplus du consommateur/producteur','Algèbre linéaire : calcul matriciel et inversion','Graphes et programmation linéaire','Probabilités conditionnelles et arbres de décision','Statistiques à deux variables et séries chronologiques'],
      l4l: ['Fonctions numériques et études graphiques','Statistiques et analyse de données','Probabilités dans la vie quotidienne'],
    },

    // ════════════════════════════════════════════
    //  PHYSICS & CHEMISTRY — الفيزياء والكيمياء
    // ════════════════════════════════════════════
    pc: {
      c7: ['المادة وخصائصها: الحالات الثلاث والتحولات','الخلائط وتقنيات الفصل','المحلول المائي والتركيز','الحرارة وانتقالها: التمدد والتوصيل والإشعاع','الضوء وانعكاسه: الظل والمرايا المستوية','الكهرباء: الدارة الكهربائية البسيطة'],
      c8: ['المادة: التحولات الفيزيائية والكيميائية','الذرة والجدول الدوري (مفاهيم أولية)','المحاليل الحمضية والقاعدية (pH)','المحركات والمولدات الكهربائية','الطاقة: المفهوم وأشكالها وتحولاتها','الموجات الصوتية وخصائصها'],
      c9: ['التفاعلات الكيميائية والمعادلة الكيميائية','الأحماض والقواعد والأملاح (درجة التأكسد)','التيار الكهربائي المستمر والمتناوب','قانون أوم للدارات الكهربائية','الحرارة الكامنة والطاقة الداخلية','المغناطيسية والحث الكهرومغناطيسي (مقدمة)'],
      l1: ['Description de la matière : structure atomique et moléculaire','Transformations chimiques et réactions acido-basiques','Mécanique du point matériel : cinématique et dynamique','Électricité : circuits en courant continu','Ondes mécaniques et acoustiques','Optique géométrique : réflexion et réfraction'],
      l2s: ['Structure de la matière : modèle atomique quantique','Chimie organique : famille de composés et réactions','Mécanique : lois de Newton et énergétique','Électricité : dipôles R, L, C en courant continu','Thermodynamique : premier et second principe','Optique : miroirs et lentilles'],
      l2t: ['Électrotechnique : circuits électriques et puissance','Mécanique des fluides : pression et hydrostatique','Thermodynamique appliquée','Optique instrumentale'],
      l3s: ['Mécanique quantique : ondes et corpuscules','Chimie organique avancée : alcools, acides, esters','Électricité : régimes transitoires RC et RL','Thermodynamique : machines thermiques','Mécanique : oscillateurs et systèmes couplés'],
      l3t: ['Électronique : semi-conducteurs et transistors','Mécanique des solides : statique et dynamique','Ondes électromagnétiques et optique','Pneumatique et hydraulique'],
      l4s: ['Mécanique quantique et physique nucléaire','Chimie organique : polymères et biomolécules','Thermodynamique : entropie et exergie','Électricité : ondes électromagnétiques et propagation','Mécanique : gravitation universelle et cosmologie'],
      l4t: ['Électronique de puissance et conversion d\'énergie','Automatique et asservissements','Électrotechnique avancée : transformateurs et moteurs','Mécanique des structures et matériaux'],
    },

    // ════════════════════════════════════════════
    //  LIFE SCIENCES — علوم الحياة والأرض (SVT)
    // ════════════════════════════════════════════
    svt: {
      c7: ['الخلية وحدة البناء والوظيفة','التغذية عند النبات: البناء الضوئي','التغذية عند الحيوان: الهضم والامتصاص','الحركة عند الحيوان: الجهاز العظمي والعضلي','التوالد عند الكائنات الحية: التوالد اللاجنسي والجنسي','الغلاف الجوي والمناخ: الطقس والتحولات الموسمية'],
      c8: ['الجهاز العصبي: بنية ووظيفة','التنفس وتبادل الغازات: عند الإنسان والنبات','الجهاز الدوري: الدم والقلب والأوعية الدموية','التكاثر والتطور عند الكائنات الحية','الغذاء والصحة: القيمة الغذائية ومصادر الطاقة','الصخور وتاريخ الأرض: التحجيرات وطبقات الأرض'],
      c9: ['الجهاز المناعي: الدفاع عن الذات','الجينات والوراثة: المورثات والصفات الوراثية','التلقيح والتطور الجنيني عند الإنسان','الأنظمة البيئية: العلاقات الغذائية والتوازنات الطبيعية','الغلاف الصخري: الزلازل والبراكين والتكتونية','التأثيرات البشرية على البيئة والتنمية المستدامة'],
      l1: ['Biologie cellulaire : structure et ultrastructure','Métabolisme cellulaire : respiration et fermentation','Génétique mendélienne et chromosomique','Écologie et biocénoses : réseaux trophiques','Géologie : structure interne du globe terrestre'],
      l2s: ['Génétique avancée : mutations et génie génétique','Physiologie végétale : photosynthèse et transpiration','Immunologie : défenses spécifiques et non spécifiques','Géologie : tectonique des plaques et dynamique de la lithosphère','Évolution des êtres vivants : théories et mécanismes'],
      l3s: ['Biologie moléculaire : ADN, transcription et traduction','Régulation de l\'expression génétique','Système nerveux central et périphérique','Endocrinologie : glandes et hormones','Géologie : géodynamique externe : erosion et sédimentation'],
      l4s: ['Biotechnologies et génie génétique : OGM et clonage','Reproduction et embryologie : fécondation et développement','Écophysiologie : adaptation des êtres vivants aux milieux','Biologie marine et biodiversité','Géologie appliquée : ressources naturelles et risques géologiques'],
    },

    // ════════════════════════════════════════════
    //  TECHNOLOGY — التربية التكنولوجية
    // ════════════════════════════════════════════
    techno: {
      c7: ['التكنولوجيا في حياتنا: تعريف ووظائف المنتجات التكنولوجية','البطاقة التقنية: قراءة ووصف المنتجات','الرسم التكنولوجي: القراءة والفهم','المواد: خصائصها واستعمالاتها','عملية الصنع: المراحل والأدوات الأساسية'],
      c8: ['دراسة وظيفة وبنية المنتجات التكنولوجية المعقدة','الرسم التكنولوجي المحرَّض (المقاطع والتفكيك)','الدارة الكهربائية البسيطة في المنتجات التكنولوجية','المواد والمعالجات: الصلادة والمرونة والتشكيل','الإعلامية التطبيقية في التكنولوجيا (رسم بمساعدة الحاسوب)'],
      c9: ['التحليل الوظيفي للمنتجات الصناعية: الجهاز ونظام','تحليل الآليات: البيانوكرانك والتروس وأنواع الحركة','الكهرباء التطبيقية: الدارات المنطقية الأساسية','المواد الصناعية: البلاستيك والمركبات والمعالجات','إنتاج منتج تكنولوجي: التصور والتصميم والإنجاز'],
    },

    // ════════════════════════════════════════════
    //  COMPUTER SCIENCE — الإعلامية / Informatique
    // ════════════════════════════════════════════
    info: {
      c7: ['مكونات الحاسوب: العتاد والبرمجيات','نظام التشغيل والتعامل مع الملفات','معالج النصوص: إنشاء وتنسيق الوثائق','جداول البيانات: الإدخال والحساب البسيط','شبكة الإنترنت: التصفح والبحث والبريد الإلكتروني'],
      c8: ['خوارزميات: مفهوم وخصائص وتمثيل المخطط الانسيابي','البرمجة المرئية: Scratch أو بيئة مماثلة','قواعد البيانات: المفهوم والجداول والاستعلامات البسيطة','العرض التقديمي: Impress أو PowerPoint','مخاطر الإنترنت والأمن الرقمي'],
      c9: ['الخوارزمية والبرمجة: الهياكل التحكمية (if, while, for)','البرمجة بلغة Python (مبادئ أولية)','قواعد البيانات: العلاقات والاستعلامات SQL البسيطة','إنشاء صفحات الويب: HTML و CSS الأساسية','الشبكات: بنية الشبكة والبروتوكولات الأساسية'],
      l1:  ['Algorithmique et structures de données de base','Langage de programmation : Python (introduction)','Systèmes de numération et arithmétique binaire','Réseaux informatiques : architecture et protocoles TCP/IP','Bureautique avancée et production de documents'],
      l2t: ['Programmation orientée objet (POO) avec Python','Bases de données relationnelles et SQL','Développement web : HTML, CSS et JavaScript','Architecture des ordinateurs : processeur et mémoire','Sécurité informatique et cryptographie de base'],
      l3i: ['Algorithmique avancée : complexité et récursivité','Structures de données : listes, piles, files et arbres','Théorie des graphes et algorithmes de recherche','Systèmes d\'exploitation : processus et gestion mémoire','Réseaux avancés : routage et protocoles','Bases de données : normalisation et optimisation SQL'],
      l4i: ['Arithmétique modulaire et cryptographie asymétrique','Théorie des automates et langages formels','Développement d\'applications web avancé (frameworks)','Intelligence artificielle : apprentissage automatique (introduction)','Compilation et interprétation','Génie logiciel : UML et méthodes agiles'],
    },

    // ════════════════════════════════════════════
    //  ARABIC LANGUAGE — اللغة العربية وآدابها
    // ════════════════════════════════════════════
    ar: {
      c7: ['فهم المنطوق والمكتوب: النصوص السردية والوصفية','التعبير الشفوي والكتابي: الوصف والسرد','قواعد اللغة: المبتدأ والخبر، الجملة الاسمية','الصرف: الجذر والوزن، الفعل الصحيح والمعتل','الإملاء: الهمزات وقواعد الكتابة الأساسية','المطالعة: النصوص الأدبية المتنوعة'],
      c8: ['فهم المقروء: النصوص الحجاجية والتفسيرية','التعبير والإنشاء: الحوار والتلخيص والتقرير','النحو: الفاعل والمفعول به والنعت والحال','الصرف: أبنية الأفعال والمشتقات (اسم الفاعل والمفعول)','البلاغة: الاستعارة والتشبيه والكناية','الأدب: قصيدة المنهاج وخصائص الأجناس الأدبية'],
      c9: ['نصوص حجاجية وتحليلها: الأطروحة والحجج','التعبير الكتابي: المقال والرسالة الرسمية','النحو: التوكيد والإبدال والبدل والعطف','الصرف: المصدر الصريح والمؤوّل والمشتقات','البلاغة: التقديم والتأخير، القصر، الفصل والوصل','الأدب: مدارس الشعر العربي الحديث، النثر الفني'],
      l1:  ['النصوص الأدبية الكلاسيكية والحديثة: قراءة ومقاربة','التعبير الكتابي: المقالة الأدبية والنقدية','النحو التطبيقي: الجمل والتراكيب المعقدة','البلاغة: الصور البيانية وعلم البديع','المطالعة الموجهة: قصيدة العصر الحديث'],
      l2l: ['تحليل النصوص النثرية والشعرية (المنهج الأدبي)','النقد الأدبي: الاتجاهات النقدية المعاصرة','التعبير الكتابي: التحرير الأدبي والمقال النقدي','تاريخ الأدب العربي: العصور الأدبية وتطورها','البلاغة التطبيقية: علم المعاني والبيان والبديع'],
      l3l: ['الأدب المقارن والتأثيرات المتبادلة','مناهج تحليل النص الأدبي: البنيوي والسيميولوجي','التعبير الكتابي المتقدم: الكتابة الإبداعية والنقدية','اللسانيات العربية: المستويات اللغوية وعلم الأصوات'],
      l4l: ['الأدب العربي المعاصر: الرواية والمسرح والقصة القصيرة','المناهج النقدية الحديثة: التلقي والتأويل','الكتابة الإبداعية: القصة والمقال الأكاديمي','الشعرية العربية الحديثة والمعاصرة','اللغة والهوية الثقافية'],
    },

    // ════════════════════════════════════════════
    //  FRENCH LANGUAGE — اللغة الفرنسية
    // ════════════════════════════════════════════
    fr: {
      c7: ['Compréhension de l\'oral et de l\'écrit : textes narratifs','Expression orale : se présenter, décrire, raconter','Grammaire : le groupe nominal (déterminants, adjectifs)','Conjugaison : présent, passé composé, imparfait','Orthographe : accords en genre et en nombre','Vocabulaire : la famille de mots, les synonymes et antonymes'],
      c8: ['Compréhension de textes descriptifs et explicatifs','Expression écrite : le compte-rendu et la description','Grammaire : les propositions subordonnées relatives et complétives','Conjugaison : futur simple, conditionnel présent, subjonctif','Orthographe : homophones grammaticaux et verbaux','Lecture suivie : une œuvre courte ou des extraits choisis'],
      c9: ['Compréhension de textes argumentatifs et littéraires','Expression écrite : le paragraphe argumentatif et la lettre formelle','Grammaire : les types et formes de phrases, la modalisation','Conjugaison : formes passives, voix active/passive','Stylistique : figures de style (métaphore, comparaison, ironie)','Lecture analytique : extrait d\'une œuvre au programme'],
      l1:  ['Lecture analytique de textes littéraires (récit, poésie, théâtre)','Expression écrite : le commentaire composé','Grammaire de texte : cohérence et cohésion textuelle','Stylistique et figures de style dans les textes littéraires','Œuvre intégrale : roman ou recueil de nouvelles au programme'],
      l2l: ['Étude des genres littéraires : roman, poésie, théâtre, essai','Méthodologie du commentaire composé et de la dissertation','Histoire littéraire : courants et mouvements (classicisme, romantisme, réalisme...)','Lecture des textes critiques et théoriques','Œuvre intégrale au programme (roman ou théâtre du XXème siècle)'],
      l3l: ['Littérature comparée et intertextualité','Méthodes d\'analyse textuelle : structurale et sémiotique','Dissertation littéraire et commentaire critique avancé','Textes de la littérature francophone (Maghreb, Afrique, Antilles...)','Poétique et narratologie'],
      l4l: ['Littérature contemporaine : enjeux et formes nouvelles','Écriture d\'invention et production créative','Préparation au baccalauréat : méthodologie des épreuves','Textes argumentatifs et enjeux de société','Langue française : registres, niveaux et variation'],
    },

    // ════════════════════════════════════════════
    //  ENGLISH LANGUAGE — اللغة الإنجليزية
    // ════════════════════════════════════════════
    en: {
      c7: ['Greetings and Introductions: meeting people and daily routines','The World Around Us: describing places and environments','School Life: timetables, subjects and school activities','Grammar: Present Simple and Present Continuous','Vocabulary: numbers, colours, clothes, food and daily objects','Reading: short descriptive and narrative texts'],
      c8: ['Daily Life and Culture: comparing lifestyles in Tunisia and abroad','Grammar: Past Simple, Past Continuous and Future forms (will / going to)','Functions: expressing opinions, agreeing and disagreeing','Reading: short narratives, dialogues and informational texts','Writing: paragraphs, informal emails and short compositions','Vocabulary: feelings, environment, technology and transport'],
      c9: ['Teen Issues and Society: social media, health and environment','Grammar: Present Perfect, Conditional (Type 1 & 2), Passive Voice','Functions: giving advice, making suggestions, expressing regret','Reading: newspaper articles, interviews and adapted literary texts','Writing: formal letters, argumentative paragraphs and essays','Literature: a short adapted story or poem at the programme level'],
      l1:  ['Unit 1: The Individual and Society – Identity, culture and belonging','Unit 2: The Media and Communication – Press, TV and social media','Unit 3: Science and Technology – Innovation and everyday life','Grammar: Modal verbs, Reported Speech, Relative Clauses','Writing: argumentative essays and formal letters','Reading: authentic texts (press, literature, social documents)'],
      l2l: ['Literary Texts: short stories, poems and drama extracts','Language Analysis: figures of speech and literary devices','Essay Writing: analytical and argumentative essays','Grammar in context: advanced structures for academic writing','Oral Presentation: debating and public speaking skills'],
      l3l: ['Advanced Literary Analysis: novels, plays and poetry','Cultural Studies: British and American civilization','Academic Writing: research essays and critical analysis','Language and Society: varieties of English (accents, dialects)','Oral Communication: presentations and formal discussions'],
      l4l: ['Contemporary Literature and Global Issues','Advanced Essay Writing: university-level academic writing','Media Literacy: reading and producing media texts','Language Examination Preparation (Baccalaureate methodology)','Oral Examination: structured discussion and commentary'],
    },

    // ════════════════════════════════════════════
    //  ECONOMICS & MANAGEMENT — الاقتصاد والتصرف
    // ════════════════════════════════════════════
    eco: {
      l2e: ['Introduction à l\'économie : besoins, biens et agents économiques','L\'entreprise : structure, fonctions et environnement','La consommation et la production : circuits économiques','La monnaie et le système bancaire tunisien','Introduction à la gestion : comptabilité générale de base'],
      l3e: ['Macroéconomie : croissance, chômage et inflation','Commerce international et mondialisation','Gestion des ressources humaines : recrutement et motivation','Marketing : analyse du marché et mix marketing','Comptabilité analytique et calcul de coûts'],
      l4e: ['Développement économique et politiques économiques','Finance d\'entreprise : investissement et financement','Gestion de la production et logistique','Fiscalité tunisienne : impôts et déclarations','Stratégie d\'entreprise et management','Préparation au baccalauréat économie et gestion'],
    },

    // ════════════════════════════════════════════
    //  PHILOSOPHY — الفلسفة
    // ════════════════════════════════════════════
    philo: {
      l2l: ['مدخل إلى الفلسفة: التساؤل الفلسفي وتاريخ الفلسفة','المنطق والاستدلال: الحجة والمغالطة والبرهان','نظرية المعرفة: مصادر المعرفة وحدودها','فلسفة الأخلاق: الواجب والحرية والمسؤولية','الفلسفة السياسية: الدولة والديمقراطية والعقد الاجتماعي'],
      l3l: ['الفلسفة الوجودية: الوجود والماهية والذات','فلسفة العلوم: المنهج العلمي والنظرية والتجربة','فلسفة اللغة: الدلالة والتواصل والترجمة','الجماليات: الفن والجمال والإبداع','الفلسفة المعاصرة: الظاهراتية والتفكيكية','تحليل نصوص فلسفية كبرى'],
      l4l: ['الفلسفة الأنطولوجية: الوجود والكينونة والزمن','الفلسفة السياسية المعاصرة: العدالة والحرية والحق','الأخلاق التطبيقية: البيوإيتيقا وأخلاق البيئة','تاريخ الفلسفة: المسار الغربي من اليونان إلى الحداثة','منهجية الكتابة الفلسفية: المقالة والتعليق على النص','الفلسفة والعلوم الإنسانية: علم النفس وعلم الاجتماع والتاريخ'],
    },

  },

  // ── HELPER FUNCTIONS ────────────────────────────────────
  getLevelsByCycle(cycle) {
    return this.levels.filter(l => l.cycle === cycle);
  },
  getStage(levelId) {
    return this.levels.find(l => l.id === levelId)?.cycle || 'college';
  },
  getLevelLabel(levelId) {
    const lvl = this.levels.find(l => l.id === levelId);
    if (!lvl) return levelId;
    return lvl.label;
  },
  getSubjects(cycleOrLevelId) {
    if (cycleOrLevelId === 'college' || cycleOrLevelId === 'lycee') {
      return this.subjects[cycleOrLevelId];
    }
    const cycle = this.getStage(cycleOrLevelId);
    return this.subjects[cycle] || this.subjects.college;
  },
  getSubjectLang(subjectId, cycle) {
    const subjs = this.subjects[cycle] || this.subjects.college;
    return subjs.find(s => s.id === subjectId)?.lang || 'ar';
  },
  getUnits(levelId, subjectId) {
    return this.units[subjectId]?.[levelId] || [];
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CURRICULUM;
}
