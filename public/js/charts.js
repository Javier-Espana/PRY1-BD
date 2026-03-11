/**
 * Charts — Minimal canvas-based chart library for the dashboard.
 * No external dependencies. Supports: donut, horizontal bar, line.
 */
const Charts = (() => {
  const COLORS = [
    '#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
    '#a855f7', '#84cc16', '#e11d48', '#0ea5e9', '#facc15'
  ];

  function getColor(i) { return COLORS[i % COLORS.length]; }

  // ─── Donut / Pie chart ───────────────────────────────────
  function donut(canvasId, data, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = opts.size || 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const total = data.reduce((s, d) => s + (d.value || 0), 0);
    if (total === 0) { ctx.fillStyle = '#333'; ctx.fillText('Sin datos', size/2 - 25, size/2); return; }

    const cx = size / 2, cy = size / 2;
    const outerR = (size / 2) - 8;
    const innerR = opts.pie ? 0 : outerR * 0.58;
    let angle = -Math.PI / 2;

    data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = d.color || getColor(i);
      ctx.fill();
      angle += sliceAngle;
    });

    if (innerR > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#1a1d2b';
      ctx.fill();

      // Center text
      if (opts.centerLabel) {
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 22px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opts.centerValue || total.toLocaleString(), cx, cy - 6);
        ctx.font = '11px -apple-system, sans-serif';
        ctx.fillStyle = '#8b90a5';
        ctx.fillText(opts.centerLabel, cx, cy + 14);
      }
    }
  }

  // ─── Horizontal bar chart ───────────────────────────────
  function horizontalBar(canvasId, data, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const barH = opts.barHeight || 28;
    const gap = opts.gap || 8;
    const labelW = opts.labelWidth || 110;
    const valueW = 70;
    const w = canvas.parentElement.offsetWidth || 500;
    const h = data.length * (barH + gap) + gap;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const max = Math.max(...data.map(d => d.value || 0), 1);
    const trackW = w - labelW - valueW - 24;

    data.forEach((d, i) => {
      const y = gap + i * (barH + gap);

      // Label
      ctx.fillStyle = '#8b90a5';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const label = d.label.length > 16 ? d.label.substring(0, 16) + '...' : d.label;
      ctx.fillText(label, labelW, y + barH / 2);

      // Track
      ctx.fillStyle = '#252838';
      ctx.beginPath();
      ctx.roundRect(labelW + 12, y, trackW, barH, 4);
      ctx.fill();

      // Fill
      const fillW = Math.max(3, (d.value / max) * trackW);
      ctx.fillStyle = d.color || getColor(i);
      ctx.beginPath();
      ctx.roundRect(labelW + 12, y, fillW, barH, 4);
      ctx.fill();

      // Value
      ctx.fillStyle = '#e8eaf0';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.displayValue || d.value.toLocaleString(), labelW + trackW + 20, y + barH / 2);
    });
  }

  // ─── Line / Area chart ──────────────────────────────────
  function line(canvasId, data, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.offsetWidth || 500;
    const h = opts.height || 220;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    if (!data.length) return;

    const pad = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const values = data.map(d => d.value || 0);
    const maxVal = Math.max(...values, 1);
    const minVal = 0;

    // Grid lines
    ctx.strokeStyle = '#2a2d42';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.top + (plotH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      const val = maxVal - (maxVal / gridLines) * i;
      ctx.fillStyle = '#8b90a5';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.formatValue ? opts.formatValue(val) : Math.round(val).toLocaleString(), pad.left - 8, y);
    }

    // Points
    const points = data.map((d, i) => ({
      x: pad.left + (i / Math.max(data.length - 1, 1)) * plotW,
      y: pad.top + plotH - ((d.value - minVal) / (maxVal - minVal)) * plotH
    }));

    // Area fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    const color = opts.color || '#6366f1';
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '05');
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - pad.bottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#1a1d2b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels
    ctx.fillStyle = '#8b90a5';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(data.length / 8));
    data.forEach((d, i) => {
      if (i % step === 0 || i === data.length - 1) {
        const lbl = (d.label || '').length > 8 ? (d.label || '').substring(0, 8) : (d.label || '');
        ctx.fillText(lbl, points[i].x, h - pad.bottom + 8);
      }
    });
  }

  // ─── Legend builder ─────────────────────────────────────
  function legend(data) {
    return '<div class="chart-legend">' + data.map((d, i) =>
      `<span class="chart-legend-item"><span class="chart-legend-dot" style="background:${d.color || getColor(i)}"></span>${d.label}</span>`
    ).join('') + '</div>';
  }

  return { donut, horizontalBar, line, legend, getColor, COLORS };
})();
