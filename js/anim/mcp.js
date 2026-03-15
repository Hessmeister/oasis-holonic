/* ═══════════════════════════════════════
   js/anim/mcp.js — MCP Server animation
   Exported interface: init · setFeature · start · stop
   ═══════════════════════════════════════ */

let canvas, ctx, w, h, dpr;
let running = false;
let particles = [];
let state = -1;
let _litState = {};
let typingLabel = null;
let agentLabels = ['Agent', 'Agent', 'Agent', 'Agent'];

/* Node positions inset from edges so labels have room */
const NODE_DEFS = [
  { rx: 0.18, ry: 0.18, shape: 'diamond', agentIdx: 0 },
  { rx: 0.82, ry: 0.18, shape: 'diamond', agentIdx: 1 },
  { rx: 0.18, ry: 0.82, shape: 'diamond', agentIdx: 2 },
  { rx: 0.82, ry: 0.82, shape: 'diamond', agentIdx: 3 },
  { rx: 0.50, ry: 0.50, shape: 'square',  agentIdx: null },
];

const HUB_EDGES  = [[0,4],[1,4],[2,4],[3,4]];
const PEER_EDGES = [[0,1],[0,2],[1,3],[2,3]];

export function init(c) {
  canvas = c;
  ctx = canvas.getContext('2d');
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  _resize();
  window.addEventListener('resize', _resize);
}

export function setFeature(index) {
  state = index;
  particles = [];
  typingLabel = null;

  if (index === 3) {
    agentLabels = ['Cursor', 'VS Code', 'Windsurf', 'Claude'];
  } else {
    agentLabels = ['Agent', 'Agent', 'Agent', 'Agent'];
  }

  if (index === 0) {
    HUB_EDGES.forEach(([from, to], i) => {
      for (let j = 0; j < 6; j++) {
        _spawnAt(from, to, (i * 60 + j * 25) / 1000);
      }
    });
  }

  if (index === 1) {
    typingLabel = {
      lines: ['"Mint an NFT on Ethereum', 'and replicate to Solana"'],
      progress: 0,
      sent: false
    };
  }
}

export function start() {
  if (running) return;
  running = true;
  requestAnimationFrame(_loop);
}

export function stop() {
  running = false;
}

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
  const n = NODE_DEFS[i];
  return { x: n.rx * w, y: n.ry * h };
}

function _spawnAt(from, to, delay = 0) {
  particles.push({
    from, to,
    t: -delay,
    speed: 0.0025 + Math.random() * 0.003,
    size: 2 + Math.random() * 1.5,
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
  ctx.clearRect(0, 0, w, h);

  const isPeer = state === 2;

  /* ── Edges ── */
  HUB_EDGES.forEach(([a, b]) => {
    const pa = _nodePos(a), pb = _nodePos(b);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isPeer ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  PEER_EDGES.forEach(([a, b]) => {
    const pa = _nodePos(a), pb = _nodePos(b);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isPeer ? 'rgba(255,107,26,0.45)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth   = isPeer ? 1.5 : 1;
    ctx.stroke();
  });

  /* ── Ambient particles ── */
  if (state !== 0 && Math.random() < 0.028) {
    const pool = isPeer ? PEER_EDGES : HUB_EDGES;
    const e    = pool[Math.floor(Math.random() * pool.length)];
    const rev  = Math.random() > 0.5;
    _spawnAt(rev ? e[1] : e[0], rev ? e[0] : e[1]);
  }

  /* ── Typing animation (state 1) ── */
  if (state === 1 && typingLabel) {
    typingLabel.progress = Math.min(typingLabel.progress + 0.006, 1);
    if (typingLabel.progress >= 1 && !typingLabel.sent) {
      typingLabel.sent = true;
      _spawnAt(0, 4);
      setTimeout(() => _spawnAt(4, 0), 700);
    }
  }

  particles = particles.filter(p => p.t <= 1.05);
  particles.forEach(p => { p.t += p.speed; });

  /* ── Nodes ── */
  NODE_DEFS.forEach((node, i) => {
    const { x, y } = _nodePos(i);
    const isHub = i === 4;
    const size  = isHub ? 12 : 10;
    const isHit = _particleNearNode(i);
    const lit   = _litVal(i, isHit, t);

    /* Glow */
    if (lit > 0.05) {
      const gc  = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      const col = isHub ? '255,107,26' : '255,255,255';
      gc.addColorStop(0, `rgba(${col},${0.22 * lit})`);
      gc.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gc;
      ctx.fillRect(x - size*4.5, y - size*4.5, size*9, size*9);
    }

    /* Shape */
    _drawShape(x, y, node.shape, size);
    ctx.strokeStyle = isHub
      ? `rgba(255,107,26,${0.65 + lit*0.35})`
      : `rgba(255,255,255,${0.50 + lit*0.50})`;
    ctx.lineWidth = 1.2 + lit * 0.8;
    ctx.stroke();

    /* Label */
    const label  = isHub ? 'OASIS API' : agentLabels[node.agentIdx];
    const labelA = 0.60 + lit * 0.40;
    const weight = lit > 0.3 ? 600 : 400;
    const fSize  = 11 + lit * 2;
    const above  = (i === 0 || i === 1);
    const ly     = above ? y - size - 12 : y + size + 14;

    ctx.save();
    if (lit > 0.05) {
      ctx.shadowColor = `rgba(255,255,255,${0.6 * lit})`;
      ctx.shadowBlur  = 12 * lit;
    }
    ctx.fillStyle    = isHub ? `rgba(255,107,26,${labelA})` : `rgba(255,255,255,${labelA})`;
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
    ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
    ctx.fill();
  });

  /* ── Typing text overlay (state 1) ── */
  if (state === 1 && typingLabel) {
    const { x, y }  = _nodePos(0);
    const fullText   = typingLabel.lines.join(' ');
    const totalChars = Math.floor(fullText.length * typingLabel.progress);
    const cursorOn   = typingLabel.progress < 1 || Math.sin(t * 0.006) > 0;

    /* Centered above the hub */
    const hubPos     = _nodePos(4);
    const midX       = w * 0.5;
    const midY       = hubPos.y * 0.52;
    const fontSize   = Math.max(12, Math.min(14, w * 0.028));
    const lineH      = fontSize * 1.5;
    const startY     = midY - ((typingLabel.lines.length - 1) * lineH) / 2;

    ctx.save();
    ctx.font         = `400 ${fontSize}px "SF Mono", "Fira Code", Menlo, monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = 'rgba(255,255,255,0.72)';

    let charsUsed = 0;
    let lastVisibleTxt = '';
    let lastLineY = startY;

    for (let l = 0; l < typingLabel.lines.length; l++) {
      const line = typingLabel.lines[l];
      const visible = Math.max(0, Math.min(line.length, totalChars - charsUsed));
      const txt = line.slice(0, visible);
      const lineY = startY + l * lineH;

      ctx.fillText(txt, midX, lineY);

      lastVisibleTxt = txt;
      lastLineY = lineY;
      charsUsed += line.length;
    }

    /* Blinking cursor */
    if (cursorOn && lastVisibleTxt.length > 0) {
      const cursorX = midX + ctx.measureText(lastVisibleTxt).width / 2 + 2;
      ctx.fillStyle = 'rgba(255,107,26,0.9)';
      ctx.fillText('▌', cursorX, lastLineY);
    }
    ctx.restore();
  }
}

const _loop = (timestamp) => {
  if (!running) return;
  _draw(timestamp);
  requestAnimationFrame(_loop);
};
