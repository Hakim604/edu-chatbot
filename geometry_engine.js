/**
 * ===================================================================
 *  TUNISIAN PEDAGOGICAL GEOMETRY & SVG VECTOR ENGINE
 *  محرك الرسوم الرياضية والهندسية المتجهة التلقائي (المنهاج التونسي الرسمي)
 * ===================================================================
 */

const GeometryEngine = (() => {

  /**
   * Escape XML/HTML special characters for SVG text
   */
  function escapeXml(unsafe) {
    if (typeof unsafe !== "string") return String(unsafe);
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  /**
   * 1. رسم المستقيم المدرج التونسي مع النقاط والمجالات (Number Line / Droite Graduée)
   * config: { min: -5, max: 5, step: 1, origin: 0, unit: "I", points: [{ name: "A", val: -2 }, { name: "B", val: 3.5 }], intervals: [{ from: -2, to: 3, includeFrom: true, includeTo: false, color: "#2563eb" }], title: "المستقيم المدرج (D)" }
   */
  function renderNumberLine(config = {}) {
    const min = Number(config.min ?? -5);
    const max = Number(config.max ?? 5);
    const step = Number(config.step ?? 1);
    const points = Array.isArray(config.points) ? config.points : [];
    const intervals = Array.isArray(config.intervals) ? config.intervals : [];
    const title = config.title || "";

    const width = 640;
    const height = 110;
    const paddingX = 50;
    const lineY = 60;
    const usableWidth = width - (2 * paddingX);

    const valToX = (v) => paddingX + ((v - min) / (max - min)) * usableWidth;

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="pedagogical-svg" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; height:auto; display:block; margin:0 auto; font-family:'Tajawal', sans-serif;">
      <defs>
        <marker id="arrow-r" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#0f172a" />
        </marker>
        <marker id="arrow-l" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#0f172a" />
        </marker>
      </defs>`;

    if (title) {
      svg += `<text x="${width / 2}" y="20" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e3a8a">${escapeXml(title)}</text>`;
    }

    // Main horizontal axis with arrows
    svg += `<line x1="${paddingX - 25}" y1="${lineY}" x2="${width - paddingX + 25}" y2="${lineY}" stroke="#0f172a" stroke-width="2" marker-end="url(#arrow-r)" />`;
    svg += `<text x="${width - paddingX + 35}" y="${lineY + 4}" font-size="14" font-weight="bold" fill="#0f172a">(D)</text>`;

    // Highlighted Intervals (تظليل المجالات بالألوان)
    intervals.forEach((inv) => {
      const x1 = Math.max(paddingX, valToX(inv.from ?? min));
      const x2 = Math.min(width - paddingX, valToX(inv.to ?? max));
      const col = inv.color || "#2563eb";
      svg += `<line x1="${x1}" y1="${lineY}" x2="${x2}" y2="${lineY}" stroke="${col}" stroke-width="5" stroke-linecap="round" opacity="0.85" />`;
      // Brackets
      if (inv.from !== undefined && inv.from >= min) {
        const b = inv.includeFrom ? "[" : "]";
        svg += `<text x="${x1}" y="${lineY - 8}" font-size="16" font-weight="bold" fill="${col}" text-anchor="middle">${b}</text>`;
      }
      if (inv.to !== undefined && inv.to <= max) {
        const b = inv.includeTo ? "]" : "[";
        svg += `<text x="${x2}" y="${lineY - 8}" font-size="16" font-weight="bold" fill="${col}" text-anchor="middle">${b}</text>`;
      }
    });

    // Graduation ticks & numbers
    for (let v = min; v <= max; v += step) {
      const x = valToX(v);
      const isOrigin = (v === 0);
      const isUnit = (v === 1);
      const tickH = isOrigin ? 12 : 7;
      const strokeW = isOrigin ? 2.5 : 1.2;

      svg += `<line x1="${x}" y1="${lineY - tickH}" x2="${x}" y2="${lineY + tickH}" stroke="#0f172a" stroke-width="${strokeW}" />`;
      svg += `<text x="${x}" y="${lineY + 22}" text-anchor="middle" font-size="12" font-weight="${isOrigin ? 'bold' : 'normal'}" fill="#334155">${v}</text>`;

      if (isOrigin) {
        svg += `<text x="${x}" y="${lineY - 16}" text-anchor="middle" font-size="13" font-weight="bold" fill="#b71c1c">O</text>`;
      }
      if (isUnit) {
        svg += `<text x="${x}" y="${lineY - 16}" text-anchor="middle" font-size="13" font-weight="bold" fill="#0284c7">I</text>`;
      }
    }

    // Specific Points (النقاط وفواصلها)
    points.forEach((pt) => {
      if (pt.val < min || pt.val > max) return;
      const x = valToX(pt.val);
      const col = pt.color || "#b71c1c";
      svg += `<circle cx="${x}" cy="${lineY}" r="4.5" fill="${col}" stroke="#ffffff" stroke-width="1.5" />`;
      svg += `<text x="${x}" y="${lineY - 14}" text-anchor="middle" font-size="13" font-weight="bold" fill="${col}">${escapeXml(pt.name || '')}</text>`;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * 2. رسم المعلم المتعامد والمتجانس التونسي (O, I, J) (Repère orthonormé dans le plan)
   * config: { xMin: -4, xMax: 4, yMin: -3, yMax: 3, points: [{ name: "A", x: 2, y: 1 }, { name: "B", x: -1, y: 2 }], lines: [{ m: 1, p: 0, label: "y = x" }], vectors: [{ name: "u", from: [0,0], to: [2,1] }], title: "المعلم المتعامد في المستوي (O, I, J)" }
   */
  function renderCoordinatePlane(config = {}) {
    const xMin = Number(config.xMin ?? -4);
    const xMax = Number(config.xMax ?? 4);
    const yMin = Number(config.yMin ?? -3);
    const yMax = Number(config.yMax ?? 3);
    const points = Array.isArray(config.points) ? config.points : [];
    const lines = Array.isArray(config.lines) ? config.lines : [];
    const vectors = Array.isArray(config.vectors) ? config.vectors : [];
    const title = config.title || "";

    const width = 480;
    const height = 360;
    const padding = 35;
    const usableW = width - (2 * padding);
    const usableH = height - (2 * padding);

    const toSvgX = (x) => padding + ((x - xMin) / (xMax - xMin)) * usableW;
    const toSvgY = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * usableH;

    const originX = toSvgX(0);
    const originY = toSvgY(0);

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="pedagogical-svg" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; height:auto; display:block; margin:0 auto; font-family:'Tajawal', sans-serif;">
      <defs>
        <marker id="plane-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#0f172a" />
        </marker>
        <marker id="vec-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#2563eb" />
        </marker>
      </defs>`;

    // Background Grid (التربيعات)
    svg += `<g stroke="#e2e8f0" stroke-width="1">`;
    for (let x = xMin; x <= xMax; x++) {
      const sx = toSvgX(x);
      svg += `<line x1="${sx}" y1="${padding}" x2="${sx}" y2="${height - padding}" />`;
    }
    for (let y = yMin; y <= yMax; y++) {
      const sy = toSvgY(y);
      svg += `<line x1="${padding}" y1="${sy}" x2="${width - padding}" y2="${sy}" />`;
    }
    svg += `</g>`;

    if (title) {
      svg += `<text x="${width / 2}" y="20" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e3a8a">${escapeXml(title)}</text>`;
    }

    // X-Axis (محور الفواصل)
    svg += `<line x1="${padding - 15}" y1="${originY}" x2="${width - padding + 15}" y2="${originY}" stroke="#0f172a" stroke-width="2" marker-end="url(#plane-arrow)" />`;
    svg += `<text x="${width - padding + 20}" y="${originY + 4}" font-size="13" font-weight="bold" fill="#0f172a">x</text>`;

    // Y-Axis (محور التراتيب)
    svg += `<line x1="${originX}" y1="${height - padding + 15}" x2="${originX}" y2="${padding - 15}" stroke="#0f172a" stroke-width="2" marker-end="url(#plane-arrow)" />`;
    svg += `<text x="${originX - 4}" y="${padding - 20}" font-size="13" font-weight="bold" fill="#0f172a">y</text>`;

    // Origin label 'O'
    svg += `<text x="${originX - 10}" y="${originY + 14}" font-size="13" font-weight="bold" fill="#b71c1c">O</text>`;

    // Ticks & Unit labels (I, J)
    for (let x = xMin; x <= xMax; x++) {
      if (x === 0) continue;
      const sx = toSvgX(x);
      svg += `<line x1="${sx}" y1="${originY - 4}" x2="${sx}" y2="${originY + 4}" stroke="#0f172a" stroke-width="1.5" />`;
      if (x === 1) {
        svg += `<text x="${sx}" y="${originY + 16}" text-anchor="middle" font-size="12" font-weight="bold" fill="#0284c7">I</text>`;
      } else {
        svg += `<text x="${sx}" y="${originY + 16}" text-anchor="middle" font-size="10" fill="#64748b">${x}</text>`;
      }
    }
    for (let y = yMin; y <= yMax; y++) {
      if (y === 0) continue;
      const sy = toSvgY(y);
      svg += `<line x1="${originX - 4}" y1="${sy}" x2="${originX + 4}" stroke="#0f172a" stroke-width="1.5" />`;
      if (y === 1) {
        svg += `<text x="${originX - 14}" y="${sy + 4}" text-anchor="end" font-size="12" font-weight="bold" fill="#0284c7">J</text>`;
      } else {
        svg += `<text x="${originX - 8}" y="${sy + 4}" text-anchor="end" font-size="10" fill="#64748b">${y}</text>`;
      }
    }

    // Lines (y = mx + p)
    lines.forEach((l) => {
      const m = Number(l.m ?? 1);
      const p = Number(l.p ?? 0);
      const col = l.color || "#ea580c";
      const x1 = xMin;
      const y1 = m * x1 + p;
      const x2 = xMax;
      const y2 = m * x2 + p;
      svg += `<line x1="${toSvgX(x1)}" y1="${toSvgY(y1)}" x2="${toSvgX(x2)}" y2="${toSvgY(y2)}" stroke="${col}" stroke-width="2" stroke-dasharray="${l.dashed ? '4,4' : 'none'}" />`;
      if (l.label) {
        svg += `<text x="${toSvgX(xMax) - 10}" y="${toSvgY(y2) - 8}" font-size="11" font-weight="bold" fill="${col}">${escapeXml(l.label)}</text>`;
      }
    });

    // Vectors
    vectors.forEach((v) => {
      const from = v.from || [0, 0];
      const to = v.to || [1, 1];
      const col = v.color || "#2563eb";
      const x1 = toSvgX(from[0]);
      const y1 = toSvgY(from[1]);
      const x2 = toSvgX(to[0]);
      const y2 = toSvgY(to[1]);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2.5" marker-end="url(#vec-arrow)" />`;
      if (v.name) {
        svg += `<text x="${(x1 + x2) / 2 + 6}" y="${(y1 + y2) / 2 - 6}" font-size="12" font-weight="bold" fill="${col}">vec(${escapeXml(v.name)})</text>`;
      }
    });

    // Points & Projections
    points.forEach((pt) => {
      const px = toSvgX(pt.x);
      const py = toSvgY(pt.y);
      const col = pt.color || "#b71c1c";

      // Dashed projection lines to axes
      svg += `<line x1="${px}" y1="${py}" x2="${px}" y2="${originY}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />`;
      svg += `<line x1="${px}" y1="${py}" x2="${originX}" y2="${py}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />`;

      svg += `<circle cx="${px}" cy="${py}" r="4.5" fill="${col}" stroke="#ffffff" stroke-width="1.5" />`;
      svg += `<text x="${px + 8}" y="${py - 8}" font-size="13" font-weight="bold" fill="${col}">${escapeXml(pt.name || '')} (${pt.x}, ${pt.y})</text>`;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * 3. رسم الأشكال الهندسية الأساسية (المثلث القائم مع نظرية بيتاغور، الدائرة، متوازي الأضلاع)
   * config: { type: "right_triangle", a: "A", b: "B", c: "C", rightAt: "A", ab: 3, ac: 4, bc: 5, title: "مثلث ABC قائم الزاوية في A" }
   */
  function renderGeometricFigure(config = {}) {
    const type = config.type || "right_triangle";
    const title = config.title || "";
    const width = 420;
    const height = 240;

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="pedagogical-svg" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; height:auto; display:block; margin:0 auto; font-family:'Tajawal', sans-serif;">`;

    if (title) {
      svg += `<text x="${width / 2}" y="20" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e3a8a">${escapeXml(title)}</text>`;
    }

    if (type === "right_triangle") {
      // Right triangle at A
      const ax = 80, ay = 190;
      const bx = 340, by = 190;
      const cx = 80, cy = 60;

      svg += `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="#f0f9ff" stroke="#0284c7" stroke-width="2.5" />`;
      // Right angle square marker at A
      svg += `<path d="M ${ax + 16} ${ay} L ${ax + 16} ${ay - 16} L ${ax} ${ay - 16}" fill="none" stroke="#b71c1c" stroke-width="1.8" />`;
      svg += `<circle cx="${ax + 8}" cy="${ay - 8}" r="2" fill="#b71c1c" />`;

      // Vertex labels
      svg += `<text x="${ax - 18}" y="${ay + 10}" font-size="14" font-weight="bold" fill="#0f172a">${escapeXml(config.rightAt || 'A')}</text>`;
      svg += `<text x="${bx + 10}" y="${by + 6}" font-size="14" font-weight="bold" fill="#0f172a">${escapeXml(config.b || 'B')}</text>`;
      svg += `<text x="${cx - 10}" y="${cy - 8}" font-size="14" font-weight="bold" fill="#0f172a">${escapeXml(config.c || 'C')}</text>`;

      // Side measurements (if provided)
      if (config.ab) svg += `<text x="${(ax + bx) / 2}" y="${ay + 20}" text-anchor="middle" font-size="12" font-weight="bold" fill="#0369a1">${escapeXml(String(config.ab))}</text>`;
      if (config.ac) svg += `<text x="${ax - 20}" y="${(ay + cy) / 2}" text-anchor="middle" font-size="12" font-weight="bold" fill="#0369a1">${escapeXml(String(config.ac))}</text>`;
      if (config.bc) svg += `<text x="${(bx + cx) / 2 + 15}" y="${(by + cy) / 2 - 10}" text-anchor="middle" font-size="12" font-weight="bold" fill="#ea580c">${escapeXml(String(config.bc))}</text>`;
    } else if (type === "circle") {
      const cx = width / 2, cy = height / 2 + 10, r = 75;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fffaf5" stroke="#ea580c" stroke-width="2.5" />`;
      svg += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#b71c1c" />`;
      svg += `<text x="${cx - 14}" y="${cy + 4}" font-size="13" font-weight="bold" fill="#b71c1c">O</text>`;
      // Radius line
      svg += `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3" />`;
      svg += `<text x="${cx + (r / 2)}" y="${cy - 6}" font-size="12" font-weight="bold" fill="#2563eb">r</text>`;
    } else if (type === "parallelogram") {
      const p1 = [70, 180], p2 = [270, 180], p3 = [350, 70], p4 = [150, 70];
      svg += `<polygon points="${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5" />`;
      svg += `<text x="${p1[0] - 16}" y="${p1[1] + 14}" font-size="14" font-weight="bold" fill="#0f172a">A</text>`;
      svg += `<text x="${p2[0] + 10}" y="${p2[1] + 14}" font-size="14" font-weight="bold" fill="#0f172a">B</text>`;
      svg += `<text x="${p3[0] + 10}" y="${p3[1] - 4}" font-size="14" font-weight="bold" fill="#0f172a">C</text>`;
      svg += `<text x="${p4[0] - 16}" y="${p4[1] - 4}" font-size="14" font-weight="bold" fill="#0f172a">D</text>`;
    }

    svg += `</svg>`;
    return svg;
  }

  /**
   * 4. مخطط المجموعات العددية التونسية (Diagramme des Ensembles de Nombres: N ⊂ Z ⊂ D ⊂ Q ⊂ R)
   */
  function renderSetsDiagram(config = {}) {
    const width = 500;
    const height = 260;
    const title = config.title || "المجموعات العددية: N ⊂ Z ⊂ D ⊂ Q ⊂ R";

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="pedagogical-svg" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; height:auto; display:block; margin:0 auto; font-family:'Tajawal', sans-serif;">
      <text x="${width / 2}" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e3a8a">${escapeXml(title)}</text>
      
      <!-- R (Real numbers) -->
      <ellipse cx="250" cy="140" rx="230" ry="105" fill="#f8fafc" stroke="#334155" stroke-width="2" />
      <text x="50" y="70" font-size="16" font-weight="bold" fill="#334155">ℝ</text>
      <text x="70" y="100" font-size="11" fill="#64748b">π, √2, √3</text>

      <!-- Q (Rational numbers) -->
      <ellipse cx="270" cy="145" rx="185" ry="85" fill="#faf5ff" stroke="#9333ea" stroke-width="2" />
      <text x="110" y="95" font-size="16" font-weight="bold" fill="#7e22ce">ℚ</text>
      <text x="130" y="125" font-size="11" fill="#7e22ce">1/3, 7/11, 0.333...</text>

      <!-- D (Decimal numbers) -->
      <ellipse cx="290" cy="150" rx="140" ry="68" fill="#fffaf5" stroke="#ea580c" stroke-width="2" />
      <text x="175" y="120" font-size="16" font-weight="bold" fill="#c2410c">𝔻</text>
      <text x="185" y="150" font-size="11" fill="#c2410c">0.75, 3.14, -2.5</text>

      <!-- Z (Integers) -->
      <ellipse cx="310" cy="155" rx="100" ry="50" fill="#f0f9ff" stroke="#0284c7" stroke-width="2" />
      <text x="235" y="145" font-size="16" font-weight="bold" fill="#0369a1">ℤ</text>
      <text x="245" y="170" font-size="11" fill="#0369a1">-1, -5, -12</text>

      <!-- N (Natural numbers) -->
      <ellipse cx="330" cy="160" rx="60" ry="32" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5" />
      <text x="310" y="165" font-size="16" font-weight="bold" fill="#15803d">ℕ</text>
      <text x="330" y="172" font-size="11" fill="#15803d">0, 1, 2, 7, 100</text>
    </svg>`;
    return svg;
  }

  /**
   * Main Parser: finds [GEOMETRY: ...] tags in model text and converts them to SVG
   */
  function parseAndRenderGeometries(text) {
    if (typeof text !== "string") return text;

    // 1. Matches: [GEOMETRY: type { json_or_params }]
    const regex = /\[GEOMETRY:\s*([a-zA-Z0-9_-]+)\s*(\{[\s\S]*?\})?\]/gi;

    let parsed = text.replace(regex, (match, type, jsonStr) => {
      let config = {};
      if (jsonStr) {
        try {
          // Normalize relaxed json (quotes, commas)
          const normalized = jsonStr
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/'/g, '"');
          config = JSON.parse(normalized);
        } catch (e) {
          console.warn("Could not parse GEOMETRY json:", jsonStr, e);
        }
      }

      let svgHtml = "";
      const t = type.toLowerCase();

      if (t === "number_line" || t === "droite" || t === "axe") {
        svgHtml = renderNumberLine(config);
      } else if (t === "coordinate_plane" || t === "repere" || t === "plane") {
        svgHtml = renderCoordinatePlane(config);
      } else if (t === "sets" || t === "ensembles" || t === "venn") {
        svgHtml = renderSetsDiagram(config);
      } else if (t === "triangle" || t === "right_triangle" || t === "circle" || t === "parallelogram") {
        config.type = t;
        svgHtml = renderGeometricFigure(config);
      } else {
        svgHtml = renderGeometricFigure({ ...config, type: t });
      }

      return `<div class="geometry-svg-container" page-break-inside="avoid">${svgHtml}</div>`;
    });

    return parsed;
  }

  return {
    renderNumberLine,
    renderCoordinatePlane,
    renderGeometricFigure,
    renderSetsDiagram,
    parseAndRenderGeometries
  };

})();

if (typeof window !== "undefined") {
  window.GeometryEngine = GeometryEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = GeometryEngine;
}
