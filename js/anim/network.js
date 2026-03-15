/* ═══════════════════════════════════════
   js/anim/network.js — Configurable network animation engine
   Used by all product pages except MCP Server (which has its own bespoke anim).
   Exported interface: init · configure · setFeature · start · stop
   ═══════════════════════════════════════ */

let canvas, ctx, w, h, dpr;
let running = false;
let particles = [];
let state = -1;
let _litState = {};
let config = null;

/* ── Public API ── */

export function init(c) {
  canvas = c;
  ctx = canvas.getContext('2d');
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  _resize();
  window.addEventListener('resize', _resize);
}

export function configure(cfg) {
  config = cfg;
}

export function setFeature(index) {
  state = index;
  particles = [];
  _litState = {};

  if (!config) return;

  const feat = config.features[index];
  if (!feat) return;

  /* Spawn initial particles along highlighted edges */
  const edges = feat.activeEdges || config.edges;
  edges.forEach(([from, to], i) => {
    for (let j = 0; j < 4; j++) {
      _spawnAt(from, to, (i * 50 + j * 30) / 1000);
    }
  });
}

export function start() {
  if (running) return;
  running = true;
  requestAnimationFrame(_loop);
}

export function stop() {
  running = false;
}

/* ── Internal ── */

function _resize() {
  const rect = canvas.getBoundingClientRect();
  w = rect.width  || canvas.parentElement.offsetWidth;
  h = rect.height || Math.min(w * 0.85, 460);
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function _nodePos(i) {
  if (!config) return { x: 0, y: 0 };
  const n = config.nodes[i];
  return { x: n.rx * w, y: n.ry * h };
}

function _spawnAt(from, to, delay = 0) {
  particles.push({
    from, to,
    t: -delay,
    speed: 0.002 + Math.random() * 0.003,
    size: 1.5 + Math.random() * 1.5,
  });
}

function _drawShape(x, y, shape, size) {
  ctx.beginPath();
  if (shape === 'diamond') {
    ctx.moveTo(x,        y - size * 1.35);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x,        y + size * 1.35);
    ctx.lineTo(x - size, y);
    ctx.closePath();
  } else if (shape === 'square') {
    ctx.rect(x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);
  } else if (shape === 'hexagon') {
    const a = size;
    for (let i = 0; i < 6; i++) {
      const ang = Math.PI / 3 * i - Math.PI / 6;
      const px = x + a * Math.cos(ang);
      const py = y + a * Math.sin(ang);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (shape === 'triangle') {
    ctx.moveTo(x, y - size * 1.2);
    ctx.lineTo(x + size * 1.1, y + size * 0.7);
    ctx.lineTo(x - size * 1.1, y + size * 0.7);
    ctx.closePath();
  } else {
    ctx.arc(x, y, size, 0, Math.PI * 2);
  }
}

function _particleNearNode(nodeIdx) {
  const np = _nodePos(nodeIdx);
  const hit = Math.max(36, w * 0.045);
  for (const p of particles) {
    if (p.t <= 0 || p.t >= 1) continue;
    const fp = _nodePos(p.from), tp = _nodePos(p.to);
    const e  = p.t < 0.5 ? 2*p.t*p.t : 1 - Math.pow(-2*p.t+2, 2)/2;
    const px = fp.x + (tp.x - fp.x) * e;
    const py = fp.y + (tp.y - fp.y) * e;
    if (Math.sqrt((px - np.x)**2 + (py - np.y)**2) < hit) return true;
  }
  return false;
}

function _litVal(nodeIdx, isHit, t) {
  const key = 'n' + nodeIdx;
  if (!_litState[key]) _litState[key] = { litAt: 0, val: 0 };
  const s = _litState[key];
  if (isHit) s.litAt = t;
  const elapsed = t - s.litAt, dur = 700;
  if (elapsed < dur) {
    const p = elapsed / dur;
    s.val = p < 0.08 ? p / 0.08 : p < 0.5 ? 1.0 : 1.0 - (p - 0.5) / 0.5;
  } else {
    s.val = 0;
  }
  return s.val;
}

function _draw(t) {
  if (!config) return;
  ctx.clearRect(0, 0, w, h);

  const accent = config.accent || '255,107,26';
  const feat = config.features[state] || {};
  const activeEdges = feat.activeEdges || [];
  const activeEdgeSet = new Set(activeEdges.map(e => e[0] + '-' + e[1]));
  const activeNodeSet = new Set(feat.activeNodes || []);

  /* ── Edges ── */
  config.edges.forEach(([a, b]) => {
    const pa = _nodePos(a), pb = _nodePos(b);
    const isActive = activeEdgeSet.has(a + '-' + b) || activeEdgeSet.has(b + '-' + a);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isActive
      ? `rgba(${accent},0.50)`
      : 'rgba(255,255,255,0.10)';
    ctx.lineWidth = isActive ? 1.5 : 1;
    ctx.stroke();
  });

  /* ── Ambient particles ── */
  if (Math.random() < 0.025) {
    const pool = activeEdges.length > 0 ? activeEdges : config.edges;
    const e    = pool[Math.floor(Math.random() * pool.length)];
    const rev  = Math.random() > 0.5;
    _spawnAt(rev ? e[1] : e[0], rev ? e[0] : e[1]);
  }

  particles = particles.filter(p => p.t <= 1.05);
  particles.forEach(p => { p.t += p.speed; });

  /* ── Nodes ── */
  config.nodes.forEach((node, i) => {
    const { x, y } = _nodePos(i);
    const isHub   = node.isHub;
    const size    = node.size || (isHub ? 13 : 10);
    const isHit   = _particleNearNode(i);
    const lit     = _litVal(i, isHit, t);
    const isHighlighted = activeNodeSet.has(i) || isHub;

    /* Glow */
    if (lit > 0.05) {
      const gc  = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      const col = isHub ? accent : '255,255,255';
      gc.addColorStop(0, `rgba(${col},${0.22 * lit})`);
      gc.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gc;
      ctx.fillRect(x - size*4.5, y - size*4.5, size*9, size*9);
    }

    /* Shape */
    _drawShape(x, y, node.shape || 'circle', size);
    const baseAlpha = isHighlighted ? 0.65 : 0.35;
    ctx.strokeStyle = isHub
      ? `rgba(${accent},${baseAlpha + lit*0.35})`
      : `rgba(255,255,255,${baseAlpha + lit*0.50})`;
    ctx.lineWidth = 1.2 + lit * 0.8;
    ctx.stroke();

    /* Fill for hub */
    if (isHub) {
      ctx.fillStyle = `rgba(${accent},${0.08 + lit * 0.12})`;
      ctx.fill();
    }

    /* Label */
    const label  = node.label;
    const labelA = isHighlighted ? 0.60 + lit * 0.40 : 0.30 + lit * 0.40;
    const weight = lit > 0.3 ? 600 : 400;
    const fSize  = 11 + lit * 2;
    const above  = node.labelAbove !== undefined ? node.labelAbove : (node.ry < 0.5);
    const ly     = above ? y - size - 12 : y + size + 14;

    ctx.save();
    if (lit > 0.05) {
      ctx.shadowColor = `rgba(255,255,255,${0.6 * lit})`;
      ctx.shadowBlur  = 12 * lit;
    }
    ctx.fillStyle    = isHub ? `rgba(${accent},${labelA})` : `rgba(255,255,255,${labelA})`;
    ctx.font         = `${weight} ${fSize}px Inter, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = above ? 'bottom' : 'top';
    ctx.fillText(label, x, ly);
    ctx.restore();
  });

  /* ── Particles ── */
  particles.forEach(p => {
    if (p.t <= 0 || p.t > 1) return;
    const fp = _nodePos(p.from), tp = _nodePos(p.to);
    const e  = p.t < 0.5 ? 2*p.t*p.t : 1 - Math.pow(-2*p.t+2, 2)/2;
    const px = fp.x + (tp.x - fp.x) * e;
    const py = fp.y + (tp.y - fp.y) * e;
    const a  = Math.min(p.t * 5, 1, (1 - p.t) * 5);
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accent},${0.85 * a})`;
    ctx.fill();
  });

  /* ── Feature label overlay ── */
  if (feat.overlay) {
    const midX     = w * 0.5;
    const midY     = h * 0.05;
    const fontSize = Math.max(13, Math.min(16, w * 0.030));
    ctx.save();
    ctx.font         = `italic 400 ${fontSize}px Newsreader, "Times New Roman", serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = `rgba(${accent},0.60)`;
    ctx.fillText(feat.overlay, midX, midY);
    ctx.restore();
  }
}

const _loop = (timestamp) => {
  if (!running) return;
  _draw(timestamp);
  requestAnimationFrame(_loop);
};
