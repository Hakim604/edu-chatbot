// ============================================================
//  GEOGEBRA & MATHEMATICAL VECTOR DRAWING ENGINE
//  Produces crisp, high-resolution geometry & function diagrams
// ============================================================

const GeoGebraEngine = {

  // Generate SVG diagram from structured geometry/algebra commands
  renderDiagram(commandsText, title = "شكل هندسي ديداكتيكي") {
    const raw = commandsText.toLowerCase();

    // 1. Thales Theorem (مبرهنة طالس)
    if (raw.includes("thales") || raw.includes("طالس") || (raw.includes("m") && raw.includes("n") && raw.includes("parallel"))) {
      return this.drawThales(title);
    }

    // 2. Pythagoras Theorem (مبرهنة فيثاغورث / مثلث قائم)
    if (raw.includes("pythagore") || raw.includes("فيثاغورث") || raw.includes("قائم") || raw.includes("right")) {
      return this.drawPythagoras(title);
    }

    // 3. Trigonometric Circle (الدائرة المثلثية / الزوايا)
    if (raw.includes("circle") || raw.includes("دائرة") || raw.includes("trig") || raw.includes("مثلثي") || raw.includes("cos") || raw.includes("sin")) {
      return this.drawTrigCircle(title);
    }

    // 4. Function Curves & Cartesian Graphs (الدوال والمنحنيات)
    if (raw.includes("f(x)") || raw.includes("دالة") || raw.includes("function") || raw.includes("curve") || raw.includes("منحنى") || raw.includes("parabola")) {
      return this.drawFunctionGraph(title);
    }

    // 5. Vectors (المتجهات / الأشعة)
    if (raw.includes("vector") || raw.includes("متجه") || raw.includes("شعاع") || raw.includes("chasles") || raw.includes("شال")) {
      return this.drawVectors(title);
    }

    // Default: General Triangle / Geometric Construction
    return this.drawGeneralGeometry(commandsText, title);
  },

  // ── 1. THALES THEOREM ──
  drawThales(title) {
    return `
      <div class="geogebra-container">
        <div class="geogebra-header">
          <span>📐 ${title} — مبرهنة طالس في المثلث (Théorème de Thalès)</span>
          <span class="geogebra-badge">GeoGebra Geometry</span>
        </div>
        <div class="geogebra-canvas-box">
          <svg width="520" height="280" viewBox="0 0 520 280" class="geogebra-svg">
            <defs>
              <pattern id="grid-thales" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="520" height="280" fill="url(#grid-thales)" />

            <!-- Main Lines -->
            <polygon points="260,30 80,240 440,240" fill="rgba(37,99,235,0.06)" stroke="#1e3a8a" stroke-width="2.5" />
            
            <!-- Parallel Segment MN -->
            <line x1="140" y1="170" x2="380" y2="170" stroke="#dc2626" stroke-width="2.8" stroke-dasharray="0" />
            <line x1="60" y1="170" x2="460" y2="170" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4" opacity="0.6" />
            <line x1="40" y1="240" x2="480" y2="240" stroke="#1e3a8a" stroke-width="1.2" stroke-dasharray="4" opacity="0.6" />

            <!-- Points -->
            <circle cx="260" cy="30" r="5" fill="#1e3a8a" />
            <text x="255" y="20" font-family="Cairo, Segoe UI" font-size="16" font-weight="bold" fill="#1e3a8a">A</text>

            <circle cx="140" cy="170" r="5" fill="#dc2626" />
            <text x="115" y="172" font-family="Cairo, Segoe UI" font-size="16" font-weight="bold" fill="#dc2626">M</text>

            <circle cx="380" cy="170" r="5" fill="#dc2626" />
            <text x="392" y="172" font-family="Cairo, Segoe UI" font-size="16" font-weight="bold" fill="#dc2626">N</text>

            <circle cx="80" cy="240" r="5" fill="#1e3a8a" />
            <text x="60" y="255" font-family="Cairo, Segoe UI" font-size="16" font-weight="bold" fill="#1e3a8a">B</text>

            <circle cx="440" cy="240" r="5" fill="#1e3a8a" />
            <text x="450" y="255" font-family="Cairo, Segoe UI" font-size="16" font-weight="bold" fill="#1e3a8a">C</text>

            <!-- Condition Label -->
            <rect x="180" y="248" width="160" height="24" rx="4" fill="#fee2e2" stroke="#fca5a5" />
            <text x="260" y="265" text-anchor="middle" font-family="Cairo" font-size="12" font-weight="bold" fill="#991b1b">شرط التوازي: (MN) // (BC)</text>
          </svg>
        </div>
        <p class="geogebra-caption">خاصية طالس: $\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$</p>
      </div>
    `;
  },

  // ── 2. PYTHAGORAS THEOREM ──
  drawPythagoras(title) {
    return `
      <div class="geogebra-container">
        <div class="geogebra-header">
          <span>📐 ${title} — مبرهنة فيثاغورث (Théorème de Pythagore)</span>
          <span class="geogebra-badge">GeoGebra Geometry</span>
        </div>
        <div class="geogebra-canvas-box">
          <svg width="520" height="280" viewBox="0 0 520 280" class="geogebra-svg">
            <defs>
              <pattern id="grid-pyth" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="520" height="280" fill="url(#grid-pyth)" />

            <!-- Right-Angled Triangle -->
            <polygon points="120,220 420,220 120,60" fill="rgba(37,99,235,0.08)" stroke="#1e3a8a" stroke-width="2.8" />

            <!-- Right Angle Box at A -->
            <rect x="120" y="198" width="22" height="22" fill="rgba(220,38,38,0.15)" stroke="#dc2626" stroke-width="1.8" />
            <circle cx="131" cy="209" r="2.5" fill="#dc2626" />

            <!-- Altitude AH to Hypotenuse -->
            <line x1="120" y1="220" x2="228" y2="162" stroke="#16a34a" stroke-width="2" stroke-dasharray="4" />
            <circle cx="228" cy="162" r="4" fill="#16a34a" />
            <text x="238" y="155" font-family="Cairo" font-size="14" font-weight="bold" fill="#16a34a">H</text>

            <!-- Vertices -->
            <circle cx="120" cy="220" r="5.5" fill="#dc2626" />
            <text x="95" y="235" font-family="Cairo" font-size="16" font-weight="bold" fill="#dc2626">A (قائم)</text>

            <circle cx="420" cy="220" r="5" fill="#1e3a8a" />
            <text x="430" y="230" font-family="Cairo" font-size="16" font-weight="bold" fill="#1e3a8a">B</text>

            <circle cx="120" cy="60" r="5" fill="#1e3a8a" />
            <text x="110" y="45" font-family="Cairo" font-size="16" font-weight="bold" fill="#1e3a8a">C</text>

            <!-- Hypotenuse label -->
            <text x="290" y="130" font-family="Cairo" font-size="14" font-weight="bold" fill="#1e3a8a" transform="rotate(-28, 290, 130)">الوتر [BC] (Hypoténuse)</text>
          </svg>
        </div>
        <p class="geogebra-caption">مبرهنة فيثاغورث: $BC^2 = AB^2 + AC^2$ | العلاقات القياسية: $AB \\times AC = AH \\times BC$</p>
      </div>
    `;
  },

  // ── 3. TRIGONOMETRIC CIRCLE ──
  drawTrigCircle(title) {
    return `
      <div class="geogebra-container">
        <div class="geogebra-header">
          <span>📐 ${title} — الدائرة المثلثية (Cercle Trigonométrique)</span>
          <span class="geogebra-badge">GeoGebra Trigonometry</span>
        </div>
        <div class="geogebra-canvas-box">
          <svg width="520" height="280" viewBox="0 0 520 280" class="geogebra-svg">
            <!-- Axes -->
            <line x1="80" y1="140" x2="440" y2="140" stroke="#64748b" stroke-width="1.8" />
            <line x1="260" y1="20" x2="260" y2="260" stroke="#64748b" stroke-width="1.8" />
            <text x="445" y="145" font-family="Cairo" font-size="14" font-weight="bold" fill="#1e293b">$\\cos x$</text>
            <text x="250" y="18" font-family="Cairo" font-size="14" font-weight="bold" fill="#1e293b">$\\sin x$</text>

            <!-- Circle R=100 -->
            <circle cx="260" cy="140" r="100" fill="none" stroke="#2563eb" stroke-width="2.5" />

            <!-- Point M at angle 45 deg (cos 45, sin 45) -->
            <line x1="260" y1="140" x2="330" y2="70" stroke="#dc2626" stroke-width="2.5" />
            <circle cx="330" cy="70" r="5" fill="#dc2626" />
            <text x="340" y="65" font-family="Cairo" font-size="15" font-weight="bold" fill="#dc2626">M(x)</text>

            <!-- Projections -->
            <line x1="330" y1="70" x2="330" y2="140" stroke="#16a34a" stroke-width="1.8" stroke-dasharray="4" />
            <line x1="330" y1="70" x2="260" y2="70" stroke="#9333ea" stroke-width="1.8" stroke-dasharray="4" />

            <circle cx="330" cy="140" r="3.5" fill="#16a34a" />
            <text x="315" y="160" font-family="Cairo" font-size="13" font-weight="bold" fill="#16a34a">$\\cos x$</text>

            <circle cx="260" cy="70" r="3.5" fill="#9333ea" />
            <text x="220" y="75" font-family="Cairo" font-size="13" font-weight="bold" fill="#9333ea">$\\sin x$</text>

            <!-- Angle Arc -->
            <path d="M 290 140 A 30 30 0 0 0 281 119" fill="none" stroke="#ea580c" stroke-width="2" />
            <text x="295" y="130" font-family="Cairo" font-size="13" font-weight="bold" fill="#ea580c">$x$</text>
          </svg>
        </div>
        <p class="geogebra-caption">العلاقة الأساسية: $\\cos^2(x) + \\sin^2(x) = 1$ | $-1 \\le \\cos(x) \\le 1$</p>
      </div>
    `;
  },

  // ── 4. FUNCTION GRAPH ──
  drawFunctionGraph(title) {
    return `
      <div class="geogebra-container">
        <div class="geogebra-header">
          <span>📐 ${title} — التمثيل البياني للدالة (Courbe de Fonction)</span>
          <span class="geogebra-badge">GeoGebra Graphing</span>
        </div>
        <div class="geogebra-canvas-box">
          <svg width="520" height="280" viewBox="0 0 520 280" class="geogebra-svg">
            <!-- Grid -->
            <defs>
              <pattern id="grid-fn" width="26" height="26" patternUnits="userSpaceOnUse">
                <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#e2e8f0" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="520" height="280" fill="url(#grid-fn)" />

            <!-- Axes -->
            <line x1="30" y1="180" x2="490" y2="180" stroke="#475569" stroke-width="2" />
            <line x1="260" y1="20" x2="260" y2="260" stroke="#475569" stroke-width="2" />
            <text x="495" y="185" font-family="Cairo" font-size="14" font-weight="bold" fill="#1e293b">x</text>
            <text x="250" y="18" font-family="Cairo" font-size="14" font-weight="bold" fill="#1e293b">y</text>
            <text x="245" y="195" font-family="Cairo" font-size="12" font-weight="bold" fill="#64748b">O</text>

            <!-- Curve f(x) (Parabola/Cubic Curve) -->
            <path d="M 80 240 Q 170 30 260 180 T 440 40" fill="none" stroke="#2563eb" stroke-width="3" />
            <text x="410" y="30" font-family="Cairo" font-size="15" font-weight="bold" fill="#2563eb">$\\mathcal{C}_f$</text>

            <!-- Tangent line at extremum -->
            <line x1="100" y1="85" x2="230" y2="85" stroke="#dc2626" stroke-width="2" stroke-dasharray="4" />
            <circle cx="165" cy="85" r="4.5" fill="#dc2626" />
            <text x="145" y="70" font-family="Cairo" font-size="13" font-weight="bold" fill="#dc2626">ذروة $f'(x_0)=0$</text>
          </svg>
        </div>
        <p class="geogebra-caption">دراسة تغيرات الدالة: جدول التغيرات، مقاربات المنحنى، والمماس الأفقي</p>
      </div>
    `;
  },

  // ── 5. VECTORS ──
  drawVectors(title) {
    return `
      <div class="geogebra-container">
        <div class="geogebra-header">
          <span>📐 ${title} — الأشعة والمتجهات (Calcul Vectoriel)</span>
          <span class="geogebra-badge">GeoGebra Vectors</span>
        </div>
        <div class="geogebra-canvas-box">
          <svg width="520" height="280" viewBox="0 0 520 280" class="geogebra-svg">
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"/>
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a"/>
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626"/>
              </marker>
            </defs>

            <!-- Vector AB -->
            <line x1="100" y1="200" x2="250" y2="120" stroke="#2563eb" stroke-width="3" marker-end="url(#arrow-blue)" />
            <circle cx="100" cy="200" r="5" fill="#1e3a8a" />
            <text x="85" y="215" font-family="Cairo" font-size="15" font-weight="bold" fill="#1e3a8a">A</text>
            <circle cx="250" cy="120" r="5" fill="#1e3a8a" />
            <text x="245" y="105" font-family="Cairo" font-size="15" font-weight="bold" fill="#1e3a8a">B</text>
            <text x="165" y="180" font-family="Cairo" font-size="15" font-weight="bold" fill="#2563eb">$\\vec{u} = \\vec{AB}$</text>

            <!-- Vector BC -->
            <line x1="250" y1="120" x2="420" y2="160" stroke="#16a34a" stroke-width="3" marker-end="url(#arrow-green)" />
            <circle cx="420" cy="160" r="5" fill="#16a34a" />
            <text x="430" y="165" font-family="Cairo" font-size="15" font-weight="bold" fill="#16a34a">C</text>
            <text x="330" y="125" font-family="Cairo" font-size="15" font-weight="bold" fill="#16a34a">$\\vec{v} = \\vec{BC}$</text>

            <!-- Resultant Vector AC (Chasles) -->
            <line x1="100" y1="200" x2="420" y2="160" stroke="#dc2626" stroke-width="3.2" stroke-dasharray="6,3" marker-end="url(#arrow-red)" />
            <text x="250" y="210" font-family="Cairo" font-size="16" font-weight="bold" fill="#dc2626">$\\vec{w} = \\vec{AC} = \\vec{u} + \\vec{v}$</text>
          </svg>
        </div>
        <p class="geogebra-caption">علاقة شال (Relation de Chasles): $\\vec{AB} + \\vec{BC} = \\vec{AC}$</p>
      </div>
    `;
  },

  // ── 6. GENERAL GEOMETRIC SHAPE ──
  drawGeneralGeometry(commands, title) {
    return `
      <div class="geogebra-container">
        <div class="geogebra-header">
          <span>📐 ${title}</span>
          <span class="geogebra-badge">GeoGebra Construction</span>
        </div>
        <div class="geogebra-canvas-box">
          <svg width="520" height="260" viewBox="0 0 520 260" class="geogebra-svg">
            <defs>
              <pattern id="grid-gen" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="520" height="260" fill="url(#grid-gen)" />

            <!-- Coordinate Axes -->
            <line x1="40" y1="200" x2="480" y2="200" stroke="#94a3b8" stroke-width="1.8" />
            <line x1="100" y1="20" x2="100" y2="240" stroke="#94a3b8" stroke-width="1.8" />

            <!-- Shape -->
            <polygon points="140,200 400,200 300,60" fill="rgba(37,99,235,0.12)" stroke="#2563eb" stroke-width="2.6" />
            <line x1="300" y1="60" x2="300" y2="200" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4" />

            <!-- Vertices -->
            <circle cx="140" cy="200" r="5" fill="#1e3a8a" />
            <text x="125" y="220" font-family="Cairo" font-size="15" font-weight="bold" fill="#1e3a8a">A</text>

            <circle cx="400" cy="200" r="5" fill="#1e3a8a" />
            <text x="410" y="220" font-family="Cairo" font-size="15" font-weight="bold" fill="#1e3a8a">B</text>

            <circle cx="300" cy="60" r="5" fill="#b71c1c" />
            <text x="295" y="45" font-family="Cairo" font-size="15" font-weight="bold" fill="#b71c1c">C</text>

            <circle cx="300" cy="200" r="4" fill="#dc2626" />
            <text x="295" y="220" font-family="Cairo" font-size="14" font-weight="bold" fill="#dc2626">H</text>
          </svg>
        </div>
        <p class="geogebra-caption">بناء هندسي بيداغوجي دقيق وفق التوجيهات الرسمية</p>
      </div>
    `;
  },
};

window.GeoGebraEngine = GeoGebraEngine;
