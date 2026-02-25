/* ═══════════════════════════════════════
   flow.js — Data flow between holons
   Particles traveling between nodes
   Labels light up when particles pass near
   ═══════════════════════════════════════ */

import { observeCanvas, prefersReducedMotion } from './main.js';

class FlowAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.particles = [];
    this.revealed = false;
    this.revealProgress = 0;

    // Track lit state per node
    this._litState = {};

    // Nodes — positioned as ratios
    this.nodes = [
      { x: 0.12, y: 0.50, label: 'Holochain', shape: 'hex' },
      { x: 0.35, y: 0.28, label: 'Ethereum',  shape: 'circle' },
      { x: 0.50, y: 0.65, label: 'OASIS API', shape: 'square' },
      { x: 0.65, y: 0.35, label: 'MongoDB',   shape: 'circle' },
      { x: 0.88, y: 0.50, label: 'IPFS',      shape: 'hex' },
    ];

    // Connections between nodes (index pairs)
    this.edges = [
      [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [2, 4]
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.w = parent.offsetWidth;
    this.h = Math.min(this.w * 0.4, 280);
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  animateReveal() {
    if (this.revealed) return;
    this.revealed = true;
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      this.revealProgress = Math.min((now - start) / dur, 1);
      this.revealProgress = 1 - Math.pow(1 - this.revealProgress, 3);
      if (this.revealProgress < 1) requestAnimationFrame(step);
      else this.start();
    };
    requestAnimationFrame(step);
    this.start();
  }

  spawnParticle() {
    const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
    const reverse = Math.random() > 0.5;
    this.particles.push({
      from: reverse ? edge[1] : edge[0],
      to: reverse ? edge[0] : edge[1],
      t: 0,
      speed: 0.003 + Math.random() * 0.004,
      size: 1.5 + Math.random() * 1.5,
    });
  }

  nodePos(i) {
    const n = this.nodes[i];
    return { x: n.x * this.w, y: n.y * this.h };
  }

  drawShape(ctx, x, y, shape, size) {
    ctx.beginPath();
    if (shape === 'hex') {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (shape === 'square') {
      ctx.rect(x - size * 0.8, y - size * 0.8, size * 1.6, size * 1.6);
    } else {
      ctx.arc(x, y, size, 0, Math.PI * 2);
    }
  }

  /* ── Check if any particle is near a node ── */
  isParticleNearNode(nodeIdx, t) {
    const nPos = this.nodePos(nodeIdx);
    const hitRadius = Math.max(30, this.w * 0.035);

    for (const p of this.particles) {
      // A particle is "at" its destination when t is high, or "at" its source when t is low
      const from = this.nodePos(p.from);
      const to = this.nodePos(p.to);

      const ease = p.t < 0.5
        ? 2 * p.t * p.t
        : 1 - Math.pow(-2 * p.t + 2, 2) / 2;

      const px = from.x + (to.x - from.x) * ease;
      const py = from.y + (to.y - from.y) * ease;

      const dist = Math.sqrt((px - nPos.x) ** 2 + (py - nPos.y) ** 2);
      if (dist < hitRadius) return true;
    }
    return false;
  }

  /* ── Smooth lit state with fade-out ── */
  getNodeLit(nodeIdx, isHit, t) {
    const key = 'node_' + nodeIdx;
    if (!this._litState[key]) this._litState[key] = { litAt: 0, val: 0 };

    const state = this._litState[key];
    const litDuration = 700; // ms

    if (isHit) {
      state.litAt = t;
    }

    const elapsed = t - state.litAt;
    if (elapsed < litDuration) {
      const progress = elapsed / litDuration;
      if (progress < 0.08) {
        state.val = progress / 0.08; // fast ramp up
      } else if (progress < 0.5) {
        state.val = 1.0; // hold bright
      } else {
        state.val = 1.0 - ((progress - 0.5) / 0.5); // smooth fade out
      }
    } else {
      state.val = 0;
    }

    return state.val;
  }

  draw(t) {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    const rp = this.revealProgress;
    const isLooping = rp >= 1;

    // Draw edges
    this.edges.forEach(([a, b], i) => {
      const edgeP = Math.max(0, Math.min(1, (rp * (this.edges.length + 2) - i) / 2));
      if (edgeP <= 0) return;

      const pa = this.nodePos(a);
      const pb = this.nodePos(b);
      const mx = pa.x + (pb.x - pa.x) * edgeP;
      const my = pa.y + (pb.y - pa.y) * edgeP;

      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(mx, my);
      ctx.strokeStyle = `rgba(255,255,255,${0.35 * edgeP})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw nodes with lit-up effect
    this.nodes.forEach((node, i) => {
      const nodeP = Math.max(0, Math.min(1, rp * 3 - i * 0.15));
      if (nodeP <= 0) return;

      const { x, y } = this.nodePos(i);
      const size = 8;

      // Check proximity & get lit value
      const isHit = isLooping && this.isParticleNearNode(i, t);
      const lit = isLooping ? this.getNodeLit(i, isHit, t) : 0;

      // Shape stroke — brightens when lit
      const strokeAlpha = 0.6 + lit * 0.4;
      const strokeWidth = 1 + lit * 0.8;

      // Glow around node when lit
      if (lit > 0.05) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3.5);
        glow.addColorStop(0, `rgba(255,255,255,${0.2 * lit})`);
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
      }

      this.drawShape(ctx, x, y, node.shape, size * nodeP);
      ctx.strokeStyle = `rgba(255,255,255,${strokeAlpha * nodeP})`;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      // Label — lights up bold and bright when particle is near
      if (nodeP > 0.5) {
        const labelA = (nodeP - 0.5) * 2;
        const baseAlpha = 0.85;
        const litAlpha = 1.0;
        const alpha = (baseAlpha + lit * (litAlpha - baseAlpha)) * labelA;
        const weight = lit > 0.3 ? 700 : 400;
        const fontSize = 10 + lit * 3;
        const scale = 1 + lit * 0.1;

        ctx.save();
        ctx.translate(x, y + size + 16);
        ctx.scale(scale, scale);

        // Text glow when lit
        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.7 * lit})`;
          ctx.shadowBlur = 14 * lit;
        }

        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = `${weight} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, 0, 0);
        ctx.restore();
      }
    });

    // Update & draw particles
    if (isLooping) {
      // Spawn occasionally
      if (Math.random() < 0.04) this.spawnParticle();

      this.particles = this.particles.filter(p => p.t <= 1);

      this.particles.forEach(p => {
        p.t += p.speed;
        const from = this.nodePos(p.from);
        const to = this.nodePos(p.to);

        // Ease in-out
        const ease = p.t < 0.5
          ? 2 * p.t * p.t
          : 1 - Math.pow(-2 * p.t + 2, 2) / 2;

        const px = from.x + (to.x - from.x) * ease;
        const py = from.y + (to.y - from.y) * ease;

        // Fade in/out at ends
        const alpha = Math.min(p.t * 5, 1, (1 - p.t) * 5);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.8 * alpha})`;
        ctx.fill();
      });
    }
  }

  loop = (timestamp) => {
    if (!this.running) return;
    this.time = timestamp;
    this.draw(timestamp);
    requestAnimationFrame(this.loop);
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.loop);
  }

  stop() { this.running = false; }
}

// ── Init ──
function _init_flow() {
  const canvas = document.getElementById('flowCanvas');
  if (!canvas) return;

  const flow = new FlowAnimation(canvas);

  if (prefersReducedMotion) {
    flow.revealProgress = 1;
    flow.revealed = true;
    flow.draw(0);
  } else {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !flow.revealed) {
          flow.animateReveal();
        }
      });
    }, { threshold: 0.25 });
    revealObs.observe(canvas);
    observeCanvas(canvas, () => { if (flow.revealed) flow.start(); }, () => flow.stop());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _init_flow);
} else {
  _init_flow();
}
