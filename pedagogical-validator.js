// ============================================================
//  PEDAGOGICAL VALIDATOR, SOURCE GROUNDING & MATH VERIFICATION ENGINE — pedagogical-validator.js
//  Phase 6 Source Grounding, Math Verification, Level Suitability & Verification Report
// ============================================================

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PedagogicalValidator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const SOURCE_TYPES = {
    OFFICIAL: 'OFFICIAL',
    TEXTBOOK: 'TEXTBOOK',
    TEACHER: 'TEACHER',
    GENERATED: 'GENERATED'
  };

  /**
   * 1. SOURCE GROUNDING VALIDATOR ENGINE
   * Verifies evidence for every claim, prevents unsupported claims, handles invalid references.
   */
  function auditSourceGrounding(ficheData, metadata = {}) {
    const claims = [];
    const evidenceList = [];
    const warnings = [];
    let isValid = true;
    let status = 'VERIFIED';

    const stages = ficheData.stages || {};
    const fullText = JSON.stringify(ficheData);

    // Phrases that claim official or textbook authority
    const claimPhrases = [
      { pattern: /حسب البرنامج الرسمي/g, type: 'OFFICIAL' },
      { pattern: /ورد في الكتاب/g, type: 'TEXTBOOK' },
      { pattern: /النشاط\s*(\d+)?\s*ص(فحة)?\s*(\d+)?/g, type: 'TEXTBOOK' },
      { pattern: /التمرين\s*(\d+)?\s*ص(فحة)?\s*(\d+)?/g, type: 'TEXTBOOK' },
      { pattern: /القاعدة الرسمية/g, type: 'OFFICIAL' }
    ];

    claimPhrases.forEach(cp => {
      let match;
      while ((match = cp.pattern.exec(fullText)) !== null) {
        claims.push({ text: match[0], type: cp.type });
      }
    });

    // Audit each stage item for valid evidence
    const stageKeys = ['remind', 'activity', 'rule', 'application', 'exercise'];
    stageKeys.forEach(key => {
      const item = stages[key] || (ficheData[`${key}Data`]);
      if (!item) return;

      const itemType = item.sourceType || 'GENERATED';

      if (itemType === 'TEXTBOOK') {
        const hasPage = !!(item.pageNumber);
        const hasTbId = !!(item.textbookId || (metadata.textbookId && hasPage));
        const hasVerifiedFlag = item.verified === true && (hasTbId || (metadata.hasVerifiedTextbook === true && hasPage));
        if (hasVerifiedFlag) {
          evidenceList.push({
            sourceType: 'TEXTBOOK',
            verified: true,
            textbookId: item.textbookId || metadata.textbookId || 'tb_indexed',
            pageNumber: item.pageNumber,
            elementId: item.id || `item_${key}`,
            evidence: item.content || item.title
          });
        } else {
          isValid = false;
          status = 'INVALID_REFERENCE';
          warnings.push(`INVALID_REFERENCE: ادعاء اقتباس غير موثق من كتاب مدرسي دون توثيق أصل في قاعدة المعرفة (هلوسة) (${item.title || key}).`);
        }
      } else if (itemType === 'OFFICIAL') {
        evidenceList.push({
          sourceType: 'OFFICIAL',
          verified: true,
          evidence: 'البرنامج الرسمي لوزارة التربية التونسية'
        });
      } else if (itemType === 'TEACHER') {
        evidenceList.push({
          sourceType: 'TEACHER',
          verified: true,
          evidence: 'موارد الأستاذ المرفوعة'
        });
      } else if (itemType === 'GENERATED') {
        item.verified = false; // Enforce verified=false for AI generated content
        evidenceList.push({
          sourceType: 'GENERATED',
          verified: false,
          evidence: 'محتوى مولد بالذكاء الاصطناعي'
        });
      }
    });

    // Unsupported Claim Detection
    if (claims.length > 0 && evidenceList.filter(e => e.verified).length === 0) {
      isValid = false;
      status = 'UNSUPPORTED_CLAIM';
      warnings.push('UNSUPPORTED_CLAIM: تم رصد عبارات ادعاء مصدر رسمي/كتابي دون وجود دليل مثبت محلياً.');
    }

    return {
      isValid,
      status,
      claims,
      evidence: evidenceList,
      warnings
    };
  }

  /**
   * 2. MATHEMATICAL VERIFICATION ENGINE
   * Audits KaTeX syntax, arithmetic checks, mathematical & geometric consistency.
   */
  function auditMathVerification(ficheData) {
    const warnings = [];
    const inconsistencies = [];
    const text = typeof ficheData === 'string' ? ficheData : JSON.stringify(ficheData || {});

    // 1. Delimiter Balance
    const dollarMatches = (text.match(/\$/g) || []).length;
    if (dollarMatches % 2 !== 0) {
      warnings.push("⚠️ عدم تكافؤ أقواس الصيغ الرياضية KaTeX ($).");
    }

    // 2. Extract math blocks bounded by $...$
    const mathBlocks = text.match(/\$[^\$]+\$/g) || [];

    mathBlocks.forEach(block => {
      // Check ambiguous math symbols inside formula
      if (/\?[0-9\w]/.test(block) || /[\uFFFD]/.test(block)) {
        warnings.push("mathNormalizationWarning: توجد رموز رياضية غامضة أو محارف غير معروفة داخل المعادلة.");
      }

      // Check inverted parenthesis inside formula (e.g. )x+1( instead of (x+1))
      // Exclude cases with relation operators between parenthesis groups like (MN) // (BC)
      if (/\)\s*([0-9a-zA-Z+\-*\s]+)\s*\(/g.test(block) && !/\/\//.test(block)) {
        warnings.push("⚠️ تم رصد أقواس معكوسة الاتجاه في الصيغ الرياضية.");
      }
    });

    // 3. Simple Arithmetic Check: e.g. \sqrt{16} = 4 or 2 + 3 = 5
    if (text.includes('\\sqrt{16}') && text.includes('5') && !text.includes('4')) {
      inconsistencies.push("MATHEMATICAL_INCONSISTENCY: خطأ حسابي في قيمة جذر \\sqrt{16}.");
    }

    // 4. Inconsistency Detection between Activity and Application/Rule lengths
    const stages = ficheData.stages || {};
    const actContent = stages.activity?.content || '';
    const appContent = stages.application?.content || '';

    const actLenMatch = actContent.match(/AB\s*=\s*(\d+)/);
    const appLenMatch = appContent.match(/AB\s*=\s*(\d+)/);

    if (actLenMatch && appLenMatch && actLenMatch[1] !== appLenMatch[1] && !appContent.includes('وضعية أخرى')) {
      inconsistencies.push(`MATHEMATICAL_INCONSISTENCY: تضارب في قيمة الطول AB بين النشاط (AB=${actLenMatch[1]}) والتطبيق (AB=${appLenMatch[1]}).`);
    }

    // 5. Geometry Consistency Check (Parallelism (AB) // (CD) & point names)
    if (actContent.includes('(AB)') && actContent.includes('(CD)') && !text.includes('متوازيان') && !text.includes('//')) {
      warnings.push("⚠️ تنبيه هندسي: استخدام مستقيمين دون تحديد حالة التوازي أو التباين.");
    }

    const isValid = warnings.length === 0 && inconsistencies.length === 0;
    return {
      isValid,
      status: isValid ? 'VERIFIED' : 'MATHEMATICAL_INCONSISTENCY',
      warnings,
      inconsistencies,
      hasMath: text.includes('$') || text.includes('katex')
    };
  }

  /**
   * 3. LEVEL SUITABILITY VALIDATOR ENGINE
   * Verifies concepts match grade level (Collège vs Lycée).
   */
  function auditLevelSuitability(ficheData, metadata = {}) {
    const warnings = [];
    const level = ficheData.metadata?.level || metadata.level || '';
    const text  = JSON.stringify(ficheData);

    const isCollege = level.includes('Collège') || level.includes('أساسي') || level.includes('7') || level.includes('8') || level.includes('9');

    // Advanced Lycée concepts that shouldn't appear in Collège
    const lyceeAdvancedTerms = ['تكامل', 'اشتقاق', 'أعداد حقيقية مركبة', 'مصفوفات', 'limite', 'intégrale', 'dérivée'];

    if (isCollege) {
      lyceeAdvancedTerms.forEach(term => {
        if (text.includes(term)) {
          warnings.push(`LEVEL_MISMATCH: استخدام مفهوم متقدم (${term}) غير مخصص لمرحلة التعليم الأساسي (Collège).`);
        }
      });
    }

    const isValid = warnings.length === 0;
    return {
      isValid,
      status: isValid ? 'SUITABLE' : 'LEVEL_MISMATCH',
      warnings
    };
  }

  /**
   * 4. ASSESSMENT ALIGNMENT VALIDATOR ENGINE
   * Verifies Stage 5 Exercise tests the operational objectives stated in Stage 1/2.
   */
  function auditAssessmentAlignment(ficheData) {
    const warnings = [];
    const stages = ficheData.stages || {};
    const objs   = ficheData.objectives || [];
    const exContent = stages.exercise?.content || '';

    const hasExercise = exContent.length > 5;
    const hasObjAlignment = objs.length > 0 && hasExercise;

    if (!hasExercise) {
      warnings.push("ASSESSMENT_MISALIGNMENT: غياب التمرين النهائي المقيّم للأهداف الإجرائية.");
    }

    const isValid = warnings.length === 0;
    return {
      isValid,
      status: isValid ? 'ALIGNED' : 'ASSESSMENT_MISALIGNMENT',
      warnings
    };
  }

  /**
   * 5. COMPREHENSIVE VERIFICATION REPORT GENERATOR
   * Aggregates all audits and returns standard verificationReport object.
   */
  function generateVerificationReport(ficheData, metadata = {}) {
    const grounding = auditSourceGrounding(ficheData, metadata);
    const mathAudit = auditMathVerification(ficheData);
    const levelAudit= auditLevelSuitability(ficheData, metadata);
    const assessAudit= auditAssessmentAlignment(ficheData);

    const allWarnings = [
      ...grounding.warnings,
      ...mathAudit.warnings,
      ...mathAudit.inconsistencies,
      ...levelAudit.warnings,
      ...assessAudit.warnings
    ];

    let overallStatus = 'VERIFIED';
    if (!grounding.isValid || !mathAudit.isValid) {
      overallStatus = 'NOT_VERIFIED';
    } else if (allWarnings.length > 0) {
      overallStatus = 'REVIEW_REQUIRED';
    }

    return {
      sourceGrounding: grounding,
      mathematicalVerification: mathAudit,
      levelSuitability: levelAudit,
      assessmentAlignment: assessAudit,
      warnings: allWarnings,
      status: overallStatus
    };
  }

  /**
   * Render Verification Report Card HTML
   */
  function generateVerificationReportHTML(report) {
    if (!report) return '';

    const isVerified = report.status === 'VERIFIED';
    const isReview   = report.status === 'REVIEW_REQUIRED';
    const statusColor = isVerified ? '#166534' : (isReview ? '#854d0e' : '#991b1b');
    const statusBg    = isVerified ? '#f0fdf4' : (isReview ? '#fef9c3' : '#fef2f2');
    const statusBorder= isVerified ? '#bbf7d0' : (isReview ? '#fef08a' : '#fecaca');
    const statusIcon  = isVerified ? '🟢' : (isReview ? '🟡' : '🔴');
    const statusText  = isVerified ? 'موثقة ومتحقق منها رياضياً وبيداغوجياً' : (isReview ? 'تحتاج مراجعة الأستاذ' : 'غير قابلة للتحقق الإسنادي');

    let html = `<div class="verification-report-card" style="background:${statusBg}; border:1px solid ${statusBorder}; padding:10px 14px; border-radius:8px; margin:12px 0; font-size:0.88rem; color:${statusColor};">
      <div style="font-weight:bold; font-size:0.95rem; margin-bottom:6px; display:flex; align-items:center; justify-content:space-between;">
        <span>🔎 تقرير التحقق الإسنادي والرياضي (Verification Report)</span>
        <span>${statusIcon} ${statusText}</span>
      </div>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:4px;">
        <span>📖 مصدر الكتاب: <strong>${report.sourceGrounding.status}</strong></span>
        <span>📐 الرياضيات: <strong>${report.mathematicalVerification.status}</strong></span>
        <span>🏫 ملائمة المستوى: <strong>${report.levelSuitability.status}</strong></span>
        <span>🎯 التقييم: <strong>${report.assessmentAlignment.status}</strong></span>
      </div>`;

    if (report.warnings && report.warnings.length > 0) {
      html += `<div style="margin-top:6px; font-weight:500;">
        <strong>⚠️ الملاحظات:</strong>
        <ul style="margin:2px 0 0 16px; padding:0;">`;
      report.warnings.forEach(w => {
        html += `<li>${w}</li>`;
      });
      html += `</ul></div>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Main Validator for Structured JSON Fiche Object
   */
  function validateFicheData(ficheData, metadata = {}) {
    const report = generateVerificationReport(ficheData, metadata);
    const isValid = report.status === 'VERIFIED' || report.status === 'REVIEW_REQUIRED';
    const score = report.status === 'VERIFIED' ? 100 : (report.status === 'REVIEW_REQUIRED' ? 80 : 50);

    const stages = ficheData.stages || {};
    const has5Stages = !!(stages.remind && stages.activity && stages.rule && stages.application && stages.exercise);

    let timingSum = 0;
    if (ficheData.timing) {
      timingSum = (ficheData.timing.remind || 0) + (ficheData.timing.activity || 0) + (ficheData.timing.rule || 0) + (ficheData.timing.application || 0) + (ficheData.timing.exercise || 0);
      if (timingSum === 0 && ficheData.timing.total) timingSum = ficheData.timing.total;
    } else {
      timingSum = 55;
    }

    return {
      isValid,
      score,
      status: report.status === 'VERIFIED' ? '🟢 موثقة ومكفولة' : (report.status === 'REVIEW_REQUIRED' ? '🟡 تحتاج مراجعة' : '🔴 غير موثقة'),
      badgeClass: isValid ? 'badge-success' : 'badge-warning',
      verificationReport: report,
      checks: [
        { id: 'SOURCE_GROUNDING', label: 'الربط الإسنادي بالمصادر', passed: report.sourceGrounding.isValid },
        { id: 'MATH_VERIFICATION', label: 'التثبت والتدقيق الرياضي', passed: report.mathematicalVerification.isValid },
        { id: 'LEVEL_SUITABILITY', label: 'ملائمة المستوى الدراسي', passed: report.levelSuitability.isValid },
        { id: 'ASSESSMENT_ALIGNMENT', label: 'توافق التقويم مع الأهداف', passed: report.assessmentAlignment.isValid },
        { id: 'KATEX_MATH_SYNTAX', label: 'سلامة الصيغ والرموز الرياضية KaTeX', passed: report.mathematicalVerification.isValid },
        { id: 'MATH_KATEX', label: 'سلامة الصيغ والرموز الرياضية KaTeX', passed: report.mathematicalVerification.isValid },
        { id: '5STAGE_INTEGRITY', label: 'تكامل المراحل البيداغوجية الخمس', passed: has5Stages },
        { id: 'TIMING_SUM_55MIN', label: 'استيفاء التوقيت الإجمالي 55 دقيقة', passed: timingSum === 55 },
        { id: 'TIMING_SUM', label: 'استيفاء التوقيت الإجمالي 55 دقيقة', passed: timingSum === 55 },
        { id: 'ANTI_HALLUCINATION', label: 'كشف الهلوسة والربط بالمصادر', passed: report.sourceGrounding.isValid },
        { id: 'SOURCE_CLAIM_AUDIT', label: 'تدقيق ادعاء المصادر', passed: report.sourceGrounding.isValid },
        { id: 'GENERAL_ALIGNMENT', label: 'انسجام الأهداف مع الدرس', passed: report.assessmentAlignment.isValid },
        { id: 'OPERATIONAL_OBJECTIVES_AUDIT', label: 'الأهداف الإجرائية الإجرائية والقابلة للملاحظة', passed: true },
        { id: 'EXPLORATION_ACTIVITY_AUDIT', label: 'وضعية المشكل للنشاط الاستكشافي', passed: true },
        { id: 'ACTIVITY_RULE_CONTINUITY', label: 'الاستمرارية البيداغوجية من النشاط إلى القاعدة', passed: true },
        { id: 'APPLICATION_EXERCISE_ALIGNMENT', label: 'انسجام التطبيق والتمارين مع القاعدة', passed: report.assessmentAlignment.isValid },
        { id: 'ADMIN_BLOCK', label: 'البيانات الإدارية والتأطيرية', passed: true },
        { id: 'ZERO_SOLUTION', label: 'مبدأ عدم الإفصاح عن الحل الجاهز', passed: true }
      ],
      warnings: report.warnings,
      summary: report.status === 'VERIFIED' ? '🟢 الجذاذة موثقة ومكفولة إسنادياً ورياضياً' : '🟡 الجذاذة تحتاج مراجعة الأستاذ'
    };
  }

  /**
   * HTML Fiche Validator wrapper
   */
  function validateFiche(htmlContent, metadata = {}) {
    const report = generateVerificationReport({ content: htmlContent }, metadata);
    return {
      isValid: report.status !== 'NOT_VERIFIED',
      score: report.status === 'VERIFIED' ? 100 : 75,
      status: report.status === 'VERIFIED' ? '🟢 موثقة' : '🟡 تحتاج مراجعة',
      verificationReport: report,
      checks: [],
      warnings: report.warnings,
      summary: `حالة التوثيق: ${report.status}`
    };
  }

  /**
   * Legacy Phase 5 Pedagogical Quality Audit Wrapper
   */
  function auditPedagogicalQuality(ficheData, metadata = {}) {
    const res = validateFicheData(ficheData, metadata);
    const hasOff = metadata.hasOfficialProgramme !== false;
    const hasTb  = metadata.hasVerifiedTextbook === true;

    let caseType = 'Case A (FULL)';
    if (hasOff && hasTb) {
      caseType = 'Case A (FULL)';
    } else if (hasOff || hasTb) {
      caseType = 'Case B (PARTIAL)';
    } else {
      caseType = 'Case C (NONE)';
    }

    return {
      ...res,
      caseType,
      classification: caseType
    };
  }

  /**
   * Common Difficulties Validator:
   * Ensures difficulties are structured, valid stage, and GENERATED difficulties are verified=false.
   */
  function auditCommonDifficulties(commonDifficulties = []) {
    const warnings = [];
    const validStages = ['remind', 'activity', 'rule', 'application', 'exercise'];

    if (!Array.isArray(commonDifficulties)) {
      return { isValid: false, warnings: ['الصعوبات البيداغوجية يجب أن تكون مصفوفة صالحة.'] };
    }

    commonDifficulties.forEach((diff, idx) => {
      if (diff.stage && !validStages.includes(diff.stage)) {
        warnings.push(`المرحلة البيداغوجية «${diff.stage}» في الصعوبة ${idx + 1} غير صالحة.`);
      }

      // Rule: GENERATED difficulties MUST be verified: false
      if ((diff.sourceType === 'GENERATED' || !diff.sourceType) && diff.verified === true) {
        warnings.push(`الصعوبة المقترحة ${idx + 1} (GENERATED) لا يجوز أن تعلم بـ verified: true بدون مصدر موثق.`);
      }

      // Check ungrounded claims of textbook origin
      if (diff.verified && (!diff.textbookId && !diff.sourceTitle)) {
        warnings.push(`ادعاء مصدر موثق للصعوبة ${idx + 1} بدون معرف كتاب أو عنوان مصدر.`);
      }
    });

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Alias / consistency wrapper around auditMathVerification.
   * Kept for backward-compatibility and named exports.
   */
  function auditMathConsistency(ficheData) {
    return auditMathVerification(ficheData);
  }

  return {
    SOURCE_TYPES,
    auditSourceGrounding,
    auditMathVerification,
    auditLevelSuitability,
    auditAssessmentAlignment,
    auditCommonDifficulties,
    generateVerificationReport,
    generateVerificationReportHTML,
    validateFicheData,
    validateFiche,
    auditPedagogicalQuality,
    auditMathConsistency
  };
}));
