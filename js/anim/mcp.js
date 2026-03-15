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

const NODE_DEFS = [
  { rx: 0.15, ry: 0.22, shape: 'diamond', agentIdx: 0 },
  { rx: 0.85, ry: 0.22, shape: 'diamond', agentIdx: 1 },
  { rx: 0.15, ry: 0.78, shape: 'diamond', agentIdx: 2 },
  { rx: 0.85, ry: 0.78, shape: 'diamond', agentIdx: 3 },
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
    typingLabel = { text: '"Mint an NFT on Ethereum and replicate to Solana"', progress: 0, sent: false };
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
  const parent = canvas.parentElement;
  w = parent.offsetWidth;
  h = parent.offsetHeight || Math.min(w * 0.75, 460);
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
    size: 1.5 + Math.random(),
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
  const hit = Math.max(30, w * 0.035);
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

  HUB_EDGES.forEach(([a, b]) => {
    const pa = _nodePos(a), pb = _nodePos(b);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isPeer ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  PEER_EDGES.forEach(([a, b]) => {
    const pa = _nodePos(a), pb = _nodePos(b);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isPeer ? 'rgba(255,107,26,0.40)' : 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = isPeer ? 1.5 : 1;
    ctx.stroke();
  });

  if (state !== 0 && Math.random() < 0.028) {
    const pool = isPeer ? PEER_EDGES : HUB_EDGES;
    const e    = pool[Math.floor(Math.random() * pool.length)];
    const rev  = Math.random() > 0.5;
    _spawnAt(rev ? e[1] : e[0], rev ? e[0] : e[1]);
  }

  if (state === 1 && typingLabel) {
    typingLabel.progress = Math.min(typingLabel.progress + 0.007, 1);
    if (typingLabel.progress >= 1 && !typingLabel.sent) {
      typingLabel.sent = true;
      _spawnAt(0, 4);
      setTimeout(() => _spawnAt(4, 0), 700);
    }
  }

  particles = particles.filter(p => p.t <= 1.05);
  particles.forEach(p => { p.t += p.speed; });

  NODE_DEFS.forEach((node, i) => {
    const { x, y } = _nodePos(i);
    const isHub = i === 4;
    const size  = isHub ? 9 : 7;
    const isHit = _particleNearNode(i);
    const lit   = _litVal(i, isHit, t);

    if (lit > 0.05) {
      const gc  = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      const col = isHub ? '255,107,26' : '255,255,255';
      gc.addColorStop(0, `rgba(${col},${0.22 * lit})`);
      gc.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gc;
      ctx.fillRect(x - size*4.5, y - size*4.5, size*9, size*9);
    }

    _drawShape(x, y, node.shape, size);
    ctx.strokeStyle = isHub
      ? `rgba(255,107,26,${0.65 + lit*0.35})`
      : `rgba(255,255,255,${0.50 + lit*0.50})`;
    ctx.lineWidth = 1 + lit * 0.8;
    ctx.stroke();

    const label  = isHub ? 'OASIS API' : agentLabels[node.agentIdx];
    const labelA = 0.65 + lit * 0.35;
    const weight = lit > 0.3 ? 600 : 400;
    const fSize  = 10 + lit * 2;
    const above  = (i === 0 || i === 1);
    const ly     = above ? y - size - 11 : y + size + 13;

    ctx.save();
    if (lit > 0.05) {
      ctx.shadowColor = `rgba(255,255,255,${0.65 * lit})`;
      ctx.shadowBlur  = 13 * lit;
    }
    ctx.fillStyle    = isHub ? `rgba(255,107,26,${labelA})` : `rgba(255,255,255,${labelA})`;
    ctx.font         = `${weight} ${fSize}px Inter, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = above ? 'bottom' : 'top';
    ctx.fillText(label, x, ly);
    ctx.restore();
  });

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

  if (state === 1 && typingLabel) {
    const { x, y }  = _nodePos(0);
    const chars      = Math.floor(typingLabel.text.length * typingLabel.progress);
    const txt        = typingLabel.text.slice(0, chars);
    const cursorOn   = typingLabel.progress < 1 || Math.sin(t * 0.006) > 0;

    ctx.save();
    ctx.fillStyle    = 'rgba(255,255,255,0.70)';
    ctx.font         = '400 9px "Courier New", monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    const tw = ctx.measureText(txt).width;
    ctx.fillText(txt, x - tw / 2, y - 26);
    if (cursorOn) {
      ctx.fillStyle = 'rgba(255,107,26,0.9)';
      ctx.fillText('▌', x - tw / 2 + tw, y - 26);
    }
    ctx.restore();
  }
}

const _loop = (timestamp) => {
  if (!running) return;
  _draw(timestamp);
  requestAnimationFrame(_loop);
};
