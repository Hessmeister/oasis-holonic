/* ═══════════════════════════════════════
   kernel.js — OASIS Kernel Architecture
   Refined concentric diagram with depth,
   radial connectors, and elegant typography
   ═══════════════════════════════════════ */

import { observeCanvas, prefersReducedMotion } from './main.js';

const TAU = Math.PI * 2;

class KernelDiagram {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.revealed = false;
    this.revealProgress = 0;

    this.dots = [
      { ring: 1, angle: 0,           speed:  0.0005,  size: 2.5, trail: [] },
      { ring: 1, angle: Math.PI,     speed:  0.0005,  size: 1.8, trail: [] },
      { ring: 2, angle: 0.5,         speed: -0.0004,  size: 2.2, trail: [] },
      { ring: 2, angle: 3.8,         speed: -0.0004,  size: 1.5, trail: [] },
      { ring: 3, angle: 0.3,         speed:  0.0003,  size: 2.0, trail: [] },
      { ring: 3, angle: 2.5,         speed:  0.0003,  size: 1.4, trail: [] },
      { ring: 3, angle: 4.7,         speed:  0.0003,  size: 1.0, trail: [] },
    ];

    this._litState = {};
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = Math.min(parent.offsetWidth, 960);
    const h = w * 0.78;
    this.w = w;
    this.h = h;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  animateReveal() {
    if (this.revealed) return;
    this.revealed = true;
    const dur = 2800;
    const start = performance.now();
    const step = (now) => {
      this.revealProgress = Math.min((now - start) / dur, 1);
      this.revealProgress = 1 - Math.pow(1 - this.revealProgress, 3);
      this.draw(now);
      if (this.revealProgress < 1) requestAnimationFrame(step);
      else { this.revealProgress = 1; this.start(); }
    };
    requestAnimationFrame(step);
  }

  checkDotNearAngle(ringIdx, labelAngle, t) {
    const hitAngle = 0.35;
    for (const dot of this.dots) {
      if (dot.ring !== ringIdx) continue;
      const dotAngle = (dot.angle + t * dot.speed) % TAU;
      const a = ((dotAngle % TAU) + TAU) % TAU;
      const b = ((labelAngle % TAU) + TAU) % TAU;
      let diff = Math.abs(a - b);
      if (diff > Math.PI) diff = TAU - diff;
      if (diff < hitAngle) return true;
    }
    return false;
  }

  getLabelLit(key, isHit, t) {
    if (!this._litState[key]) this._litState[key] = { litAt: 0, val: 0 };
    const state = this._litState[key];
    const litDuration = 900;
    if (isHit) state.litAt = t;
    const elapsed = t - state.litAt;
    if (elapsed < litDuration) {
      const progress = elapsed / litDuration;
      if (progress < 0.08) state.val = progress / 0.08;
      else if (progress < 0.5) state.val = 1.0;
      else state.val = 1.0 - ((progress - 0.5) / 0.5);
    } else {
      state.val = 0;
    }
    return state.val;
  }

  draw(t) {
    const { ctx, w, h } = this;
    const cx = w / 2;
    const cy = h * 0.44;
    const rp = this.revealProgress;
    const loop = this.revealed && rp >= 1;
    const S = w * 0.44;

    ctx.clearRect(0, 0, w, h);

    const rings = [
      { r: S * 0.155, dash: [0, 0],  lw: 0,   dir:  1, opacity: 0,    breathOff: 0 },
      { r: S * 0.37,  dash: [0, 0],  lw: 1.2, dir:  1, opacity: 0.30, breathOff: 0 },
      { r: S * 0.57,  dash: [6, 5],  lw: 0.8, dir: -1, opacity: 0.20, breathOff: 1500 },
      { r: S * 0.76,  dash: [4, 8],  lw: 0.6, dir:  1, opacity: 0.16, breathOff: 3000 },
      { r: S * 0.95,  dash: [2, 6],  lw: 0.5, dir: -1, opacity: 0.12, breathOff: 4500 },
    ];

    // ── Subtle radial guide lines from center outward ──
    const guideCount = 10;
    const maxR = rings[4].r;
    for (let i = 0; i < guideCount; i++) {
      const a = (i / guideCount) * TAU - Math.PI / 2;
      const guideAlpha = 0.035 * rp;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * rings[0].r * 0.8, cy + Math.sin(a) * rings[0].r * 0.8);
      ctx.lineTo(cx + Math.cos(a) * maxR * 1.02, cy + Math.sin(a) * maxR * 1.02);
      ctx.strokeStyle = `rgba(255,255,255,${guideAlpha})`;
      ctx.lineWidth = 0.3;
      ctx.setLineDash([1, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Draw rings (back to front) ──
    for (let i = rings.length - 1; i >= 1; i--) {
      const ring = rings[i];
      const ringP = this.ringP(rp, i);
      if (ringP <= 0) continue;
      const breathAmp = loop ? 0.006 : 0;
      const breathScale = 1 + Math.sin((t + ring.breathOff) * 0.0005) * breathAmp;
      const r = ring.r * breathScale;

      // Ring stroke
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * ringP);
      ctx.strokeStyle = `rgba(255,255,255,${ring.opacity * ringP})`;
      ctx.lineWidth = ring.lw;
      if (ring.dash[0] > 0) {
        ctx.setLineDash(ring.dash);
        ctx.lineDashOffset = loop ? -(t * 0.004 * ring.dir) : 0;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Subtle tick marks on ring 1 (invariants ring)
      if (i === 1 && ringP > 0.8) {
        const tickAlpha = 0.08 * ringP;
        const tickCount = 48;
        for (let j = 0; j < tickCount; j++) {
          const a = (j / tickCount) * TAU;
          const isMajor = j % 12 === 0;
          const tickLen = isMajor ? 5 : 2.5;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.lineTo(cx + Math.cos(a) * (r - tickLen), cy + Math.sin(a) * (r - tickLen));
          ctx.strokeStyle = `rgba(255,255,255,${isMajor ? tickAlpha * 2 : tickAlpha})`;
          ctx.lineWidth = isMajor ? 0.6 : 0.3;
          ctx.stroke();
        }
      }
    }

    // ── Orbiting dots with trails ──
    if (loop) {
      this.dots.forEach(dot => {
        const ring = rings[dot.ring];
        const breathAmp = 0.006;
        const breathScale = 1 + Math.sin((t + ring.breathOff) * 0.0005) * breathAmp;
        const r = ring.r * breathScale;
        const angle = dot.angle + t * dot.speed;
        const dx = cx + Math.cos(angle) * r;
        const dy = cy + Math.sin(angle) * r;

        // Store trail
        dot.trail.push({ x: dx, y: dy });
        if (dot.trail.length > 12) dot.trail.shift();

        // Draw trail
        for (let i = 0; i < dot.trail.length - 1; i++) {
          const tp = dot.trail[i];
          const trailAlpha = (i / dot.trail.length) * 0.15;
          const trailSize = dot.size * (i / dot.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, Math.max(0.3, trailSize), 0, TAU);
          ctx.fillStyle = `rgba(255,255,255,${trailAlpha})`;
          ctx.fill();
        }

        // Glow
        const gRad = Math.max(1, dot.size * 4);
        const grad = ctx.createRadialGradient(dx, dy, 0, dx, dy, gRad);
        grad.addColorStop(0, 'rgba(255,255,255,0.35)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(dx - gRad * 1.5, dy - gRad * 1.5, gRad * 3, gRad * 3);

        // Dot
        ctx.beginPath();
        ctx.arc(dx, dy, dot.size, 0, TAU);
        const dotAlpha = 0.6 + Math.sin(t * 0.002 + dot.angle) * 0.15;
        ctx.fillStyle = `rgba(255,255,255,${dotAlpha})`;
        ctx.fill();
      });
    }

    // ── Ring 1 — Invariants ──
    const e1 = this.ringP(rp, 1);
    if (e1 > 0.65) {
      const lp = Math.min(1, (e1 - 0.65) * 2.8);
      const r1 = rings[1].r;
      const inv = [
        { text: 'Self-Containment', a: -Math.PI * 0.5 },
        { text: 'Persistence',      a: 0 },
        { text: 'Interoperability',  a: Math.PI * 0.5 },
        { text: 'Observability',     a: Math.PI },
      ];
      inv.forEach(({ text, a }) => {
        const lx = cx + Math.cos(a) * r1;
        const ly = cy + Math.sin(a) * r1;
        const isHit = loop && this.checkDotNearAngle(1, a, t);
        const lit = loop ? this.getLabelLit('inv_' + text, isHit, t) : 0;
        const alpha = (0.7 + lit * 0.3) * lp;
        const weight = Math.round(500 + lit * 200);
        const scale = 1 + lit * 0.08;
        const fontSize = this.fs(0.019);

        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(scale, scale);

        // Subtle background halo behind text
        const haloAlpha = 0.12 + lit * 0.15;
        const haloGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, fontSize * 3);
        haloGrad.addColorStop(0, `rgba(0,0,0,${haloAlpha})`);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haloGrad;
        ctx.fillRect(-fontSize * 3, -fontSize * 2, fontSize * 6, fontSize * 4);

        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.5 * lit})`;
          ctx.shadowBlur = 12 * lit;
        }
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = `${weight} ${fontSize}px Inter, sans-serif`;
        ctx.letterSpacing = '-0.01em';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });
    }

    // ── Ring 2 — Rules ──
    const e2 = this.ringP(rp, 2);
    if (e2 > 0.65) {
      const lp = Math.min(1, (e2 - 0.65) * 2.8);
      const r2 = rings[2].r;
      const rules = [
        { text: 'Identity vs Commitments',  a: -Math.PI * 0.25 },
        { text: 'Reconciliation',            a:  Math.PI * 0.25 },
        { text: 'Explicit Ambiguity',        a:  Math.PI * 0.75 },
        { text: 'Attributable Resolution',   a: -Math.PI * 0.75 },
      ];
      rules.forEach(({ text, a }) => {
        const lx = cx + Math.cos(a) * r2;
        const ly = cy + Math.sin(a) * r2;
        const isHit = loop && this.checkDotNearAngle(2, a, t);
        const lit = loop ? this.getLabelLit('rule_' + text, isHit, t) : 0;
        const alpha = (0.45 + lit * 0.55) * lp;
        const weight = lit > 0.3 ? 500 : 400;
        const scale = 1 + lit * 0.06;
        const fontSize = this.fs(0.014);

        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(scale, scale);

        // Text bg halo
        const haloAlpha = 0.08 + lit * 0.1;
        const haloGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, fontSize * 3);
        haloGrad.addColorStop(0, `rgba(0,0,0,${haloAlpha})`);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haloGrad;
        ctx.fillRect(-fontSize * 3.5, -fontSize * 2, fontSize * 7, fontSize * 4);

        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.4 * lit})`;
          ctx.shadowBlur = 10 * lit;
        }
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = `${weight} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });
    }

    // ── Ring 3 — Interfaces ──
    const e3 = this.ringP(rp, 3);
    if (e3 > 0.6) {
      const lp = Math.min(1, (e3 - 0.6) * 2.5);
      const r3 = rings[3].r;
      const items = ['SDK', 'API', 'CLI', 'Visualizers', 'Indexers'];
      items.forEach((label, i) => {
        const a = -Math.PI / 2 + (TAU * i / items.length);
        const lx = cx + Math.cos(a) * r3;
        const ly = cy + Math.sin(a) * r3;
        const isHit = loop && this.checkDotNearAngle(3, a, t);
        const lit = loop ? this.getLabelLit('iface_' + label, isHit, t) : 0;
        const alpha = (0.4 + lit * 0.6) * lp;
        const weight = lit > 0.3 ? 500 : 400;
        const fontSize = this.fs(0.013);

        ctx.save();
        const scale = 1 + lit * 0.06;
        ctx.translate(lx, ly);
        ctx.scale(scale, scale);

        // Halo
        const haloGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, fontSize * 2.5);
        haloGrad.addColorStop(0, `rgba(0,0,0,${0.06 + lit * 0.08})`);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haloGrad;
        ctx.fillRect(-fontSize * 3, -fontSize * 2, fontSize * 6, fontSize * 4);

        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.4 * lit})`;
          ctx.shadowBlur = 8 * lit;
        }
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = `${weight} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });
    }

    // ── Ring 4 — Environments (pills) ──
    const e4 = this.ringP(rp, 4);
    if (e4 > 0.55) {
      const lp = Math.min(1, (e4 - 0.55) * 2.2);
      const r4 = rings[4].r;
      const envs = ['Blockchains', 'Databases', 'Clouds', 'Storage', 'Runtimes'];
      envs.forEach((label, i) => {
        const a = -Math.PI / 2 + (TAU * i / envs.length);
        const drift = loop ? Math.sin(t * 0.0001 + i * 1.3) * 0.004 : 0;
        const na = a + drift;
        const nx = cx + Math.cos(na) * r4;
        const ny = cy + Math.sin(na) * r4;
        const isHit = loop && this.checkDotNearAngle(3, a, t);
        const lit = loop ? this.getLabelLit('env_' + label, isHit, t) : 0;
        const fontSize = this.fs(0.012);
        const weight = lit > 0.3 ? 500 : 400;
        ctx.font = `${weight} ${fontSize}px Inter, sans-serif`;
        const tw = ctx.measureText(label).width;
        const pw = tw + 16;
        const ph = fontSize + 10;
        const pillAlpha = (0.7 + lit * 0.3) * lp;
        const strokeAlpha = (0.2 + lit * 0.4) * lp;

        this.drawPill(ctx, nx - pw / 2, ny - ph / 2, pw, ph, ph / 2,
          `rgba(26,26,26,${pillAlpha})`, `rgba(255,255,255,${strokeAlpha})`);

        const textAlpha = (0.7 + lit * 0.3) * lp;
        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.3 * lit})`;
          ctx.shadowBlur = 6 * lit;
        }
        ctx.fillStyle = `rgba(255,255,255,${textAlpha})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, nx, ny + 0.5);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
    }

    // ── Core (flat matte orange) ──
    const e0 = this.ringP(rp, 0);
    if (e0 > 0) {
      const cr = rings[0].r * Math.min(1, e0 * 1.4);

      // Subtle glow around core
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const coreGlow = ctx.createRadialGradient(cx, cy, cr * 0.5, cx, cy, cr * 2.5);
      coreGlow.addColorStop(0, `rgba(255,55,0,${0.06 * e0})`);
      coreGlow.addColorStop(1, 'rgba(255,55,0,0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - cr * 3, cy - cr * 3, cr * 6, cr * 6);
      ctx.restore();

      // Flat orange fill
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      grad.addColorStop(0, `rgba(255,65,15,${0.95 * e0})`);
      grad.addColorStop(0.8, `rgba(255,55,0,${0.93 * e0})`);
      grad.addColorStop(1, `rgba(230,45,0,${0.88 * e0})`);
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, TAU);
      ctx.fillStyle = grad;
      ctx.fill();

      // Label
      if (e0 > 0.4) {
        const lp = Math.min(1, (e0 - 0.4) * 1.7);
        ctx.fillStyle = `rgba(255,255,255,${0.95 * lp})`;
        ctx.font = `600 ${this.fs(0.022)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '0.06em';
        ctx.fillText('HOLON', cx, cy);
      }
    }

    // ── Caption (more refined) ──
    const ec = this.ringP(rp, 5);
    if (ec > 0.2) {
      const captionY = cy + rings[4].r + 40;
      const fontSize = this.fs(0.013);
      const lineH = fontSize * 2.0;
      const lines = [
        { t: 'Constraint is highest at the center and decreases outward.', italic: false },
        { t: 'The kernel enforces invariants, not outcomes.', italic: false },
        { t: 'Everything beyond the kernel is optional.', italic: true },
      ];
      lines.forEach((line, i) => {
        const a = Math.min(1, ec) * (0.4 - i * 0.08);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.font = `${line.italic ? 'italic ' : ''}400 ${fontSize}px ${line.italic ? 'Newsreader, serif' : 'Inter, sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(line.t, cx, captionY + i * lineH);
      });
    }
  }

  ringP(rp, ring) {
    const delay = ring * 0.10;
    return Math.max(0, Math.min(1, (rp - delay) / 0.28));
  }

  fs(ratio) { return Math.max(9, this.w * ratio); }

  drawPill(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  loop = (ts) => {
    if (!this.running) return;
    this.draw(ts);
    requestAnimationFrame(this.loop);
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.loop);
  }

  stop() { this.running = false; }
}

function _init_kernel() {
  const canvas = document.getElementById('kernelCanvas');
  if (!canvas) return;
  const kernel = new KernelDiagram(canvas);
  if (prefersReducedMotion) {
    kernel.revealProgress = 1;
    kernel.revealed = true;
    kernel.draw(0);
  } else {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !kernel.revealed) {
          kernel.animateReveal();
        }
      });
    }, { threshold: 0.2 });
    revealObs.observe(canvas);
    observeCanvas(canvas, () => { if (kernel.revealed) kernel.start(); }, () => kernel.stop());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _init_kernel);
} else {
  _init_kernel();
}
