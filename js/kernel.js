/* ═══════════════════════════════════════
   kernel.js — OASIS Kernel Architecture
   Concentric constraint → freedom diagram
   Labels sit ON the orbit rings so dots
   sweep through them naturally
   ═══════════════════════════════════════ */

import { observeCanvas, prefersReducedMotion } from './main.js';

class KernelDiagram {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.revealed = false;
    this.revealProgress = 0;

    // Dots orbit on rings 1–3 (ring 0 = core, ring 4 = outermost)
    // Each ring's dots are spread out so they sweep through the labels
    this.dots = [
      // Ring 1 — Invariants (2 dots, spaced apart)
      { ring: 1, angle: 0,           speed:  0.0006,  size: 2.2 },
      { ring: 1, angle: Math.PI,     speed:  0.0006,  size: 1.6 },
      // Ring 2 — Rules (2 dots, opposite directions)
      { ring: 2, angle: 0.5,         speed: -0.00045, size: 2.0 },
      { ring: 2, angle: 3.8,         speed: -0.00045, size: 1.4 },
      // Ring 3 — Interfaces (3 dots)
      { ring: 3, angle: 0.3,         speed:  0.00035, size: 1.8 },
      { ring: 3, angle: 2.5,         speed:  0.00035, size: 1.2 },
      { ring: 3, angle: 4.7,         speed:  0.00035, size: 1.0 },
    ];

    this._litState = {};
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = Math.min(rect.width, 960);
    const h = w * 0.72;
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
    const dur = 2400;
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

  /* ── Check if any dot on a specific ring is near an angle ── */
  checkDotNearAngle(ringIdx, labelAngle, t, rings) {
    const hitAngle = 0.35; // radians proximity (~20°)
    for (const dot of this.dots) {
      if (dot.ring !== ringIdx) continue;
      const dotAngle = (dot.angle + t * dot.speed) % (Math.PI * 2);
      // Normalize both angles to 0..2π
      const a = ((dotAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const b = ((labelAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let diff = Math.abs(a - b);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < hitAngle) return true;
    }
    return false;
  }

  /* ── Smooth lit state with fade-out ── */
  getLabelLit(key, isHit, t) {
    if (!this._litState[key]) this._litState[key] = { litAt: 0, val: 0 };
    const state = this._litState[key];
    const litDuration = 800;

    if (isHit) state.litAt = t;

    const elapsed = t - state.litAt;
    if (elapsed < litDuration) {
      const progress = elapsed / litDuration;
      if (progress < 0.08) state.val = progress / 0.08;
      else if (progress < 0.55) state.val = 1.0;
      else state.val = 1.0 - ((progress - 0.55) / 0.45);
    } else {
      state.val = 0;
    }
    return state.val;
  }

  draw(t) {
    const { ctx, w, h } = this;
    const cx = w / 2;
    const cy = h * 0.46;
    const rp = this.revealProgress;
    const loop = this.revealed && rp >= 1;
    const S = w * 0.44;

    ctx.clearRect(0, 0, w, h);

    const rings = [
      { r: S * 0.16, dash: [0, 0],  lw: 0,   dir:  1, opacity: 0,    breathOff: 0 },
      { r: S * 0.38, dash: [0, 0],  lw: 1.8, dir:  1, opacity: 0.35, breathOff: 0 },
      { r: S * 0.58, dash: [6, 5],  lw: 1.2, dir: -1, opacity: 0.25, breathOff: 1500 },
      { r: S * 0.78, dash: [4, 8],  lw: 0.8, dir:  1, opacity: 0.20, breathOff: 3000 },
      { r: S * 0.97, dash: [2, 6],  lw: 0.5, dir: -1, opacity: 0.15, breathOff: 4500 },
    ];

    // ── Draw rings ──
    for (let i = rings.length - 1; i >= 1; i--) {
      const ring = rings[i];
      const ringP = this.ringP(rp, i);
      if (ringP <= 0) continue;

      const breathAmp = loop ? 0.008 : 0;
      const breathScale = 1 + Math.sin((t + ring.breathOff) * 0.0005) * breathAmp;
      const r = ring.r * breathScale;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringP);
      ctx.strokeStyle = `rgba(254,218,179,${ring.opacity * ringP})`;
      ctx.lineWidth = ring.lw;
      if (ring.dash[0] > 0) {
        ctx.setLineDash(ring.dash);
        ctx.lineDashOffset = loop ? -(t * 0.006 * ring.dir) : 0;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ── Orbiting dots ──
    if (loop) {
      this.dots.forEach(dot => {
        const ring = rings[dot.ring];
        const breathAmp = 0.008;
        const breathScale = 1 + Math.sin((t + ring.breathOff) * 0.0005) * breathAmp;
        const r = ring.r * breathScale;
        const angle = dot.angle + t * dot.speed;
        const dx = cx + Math.cos(angle) * r;
        const dy = cy + Math.sin(angle) * r;

        const grad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dot.size * 3.5);
        grad.addColorStop(0, 'rgba(254,218,179,0.4)');
        grad.addColorStop(1, 'rgba(254,218,179,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(dx - dot.size * 4, dy - dot.size * 4, dot.size * 8, dot.size * 8);

        ctx.beginPath();
        ctx.arc(dx, dy, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254,218,179,${0.65 + Math.sin(t * 0.002 + dot.angle) * 0.15})`;
        ctx.fill();
      });
    }

    // ═════════════════════════════════════
    //  LABELS — placed ON the ring paths
    //  evenly distributed around the circle
    // ═════════════════════════════════════

    // Ring 1 — Invariants (4 labels, evenly spaced)
    const e1 = this.ringP(rp, 1);
    if (e1 > 0.65) {
      const lp = Math.min(1, (e1 - 0.65) * 2.8);
      const r1 = rings[1].r;
      const inv = [
        { text: 'Self-Containment', a: -Math.PI * 0.5  },  // top
        { text: 'Persistence',      a: 0                },  // right
        { text: 'Interoperability',  a: Math.PI * 0.5   },  // bottom
        { text: 'Observability',     a: Math.PI          },  // left
      ];
      inv.forEach(({ text, a }) => {
        const lx = cx + Math.cos(a) * r1;
        const ly = cy + Math.sin(a) * r1;

        const isHit = loop && this.checkDotNearAngle(1, a, t, rings);
        const lit = loop ? this.getLabelLit('inv_' + text, isHit, t) : 0;

        const alpha = (0.75 + lit * 0.25) * lp;
        const weight = Math.round(500 + lit * 200);
        const scale = 1 + lit * 0.1;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(scale, scale);

        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.7 * lit})`;
          ctx.shadowBlur = 14 * lit;
        }

        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = `${weight} ${this.fs(0.019)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });
    }

    // Ring 2 — Rules (4 labels, evenly spaced, offset from invariants)
    const e2 = this.ringP(rp, 2);
    if (e2 > 0.65) {
      const lp = Math.min(1, (e2 - 0.65) * 2.8);
      const r2 = rings[2].r;
      const rules = [
        { text: 'Identity vs Commitments',  a: -Math.PI * 0.25 },  // top-right
        { text: 'Reconciliation',            a:  Math.PI * 0.25 },  // bottom-right
        { text: 'Explicit Ambiguity',        a:  Math.PI * 0.75 },  // bottom-left
        { text: 'Attributable Resolution',   a: -Math.PI * 0.75 },  // top-left
      ];
      rules.forEach(({ text, a }) => {
        const lx = cx + Math.cos(a) * r2;
        const ly = cy + Math.sin(a) * r2;

        const isHit = loop && this.checkDotNearAngle(2, a, t, rings);
        const lit = loop ? this.getLabelLit('rule_' + text, isHit, t) : 0;

        const alpha = (0.55 + lit * 0.45) * lp;
        const weight = lit > 0.3 ? 600 : 400;
        const scale = 1 + lit * 0.08;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(scale, scale);

        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.5 * lit})`;
          ctx.shadowBlur = 12 * lit;
        }

        ctx.fillStyle = `rgba(254,218,179,${alpha})`;
        ctx.font = `${weight} ${this.fs(0.015)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });
    }

    // Ring 3 — Interfaces (5 labels, evenly spaced around the ring)
    const e3 = this.ringP(rp, 3);
    if (e3 > 0.6) {
      const lp = Math.min(1, (e3 - 0.6) * 2.5);
      const r3 = rings[3].r;
      const items = ['SDK', 'API', 'CLI', 'Visualizers', 'Indexers'];
      items.forEach((label, i) => {
        const a = -Math.PI / 2 + (Math.PI * 2 * i / items.length);
        const lx = cx + Math.cos(a) * r3;
        const ly = cy + Math.sin(a) * r3;

        const isHit = loop && this.checkDotNearAngle(3, a, t, rings);
        const lit = loop ? this.getLabelLit('iface_' + label, isHit, t) : 0;

        const alpha = (0.45 + lit * 0.55) * lp;
        const weight = lit > 0.3 ? 600 : 400;
        const scale = 1 + lit * 0.08;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(scale, scale);

        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.5 * lit})`;
          ctx.shadowBlur = 10 * lit;
        }

        ctx.fillStyle = `rgba(254,218,179,${alpha})`;
        ctx.font = `${weight} ${this.fs(0.014)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });
    }

    // Ring 4 — Environments (pill nodes on the outermost ring)
    const e4 = this.ringP(rp, 4);
    if (e4 > 0.55) {
      const lp = Math.min(1, (e4 - 0.55) * 2.2);
      const r4 = rings[4].r;
      const envs = ['Blockchains', 'Databases', 'Clouds', 'Storage', 'Runtimes'];
      envs.forEach((label, i) => {
        const a = -Math.PI / 2 + (Math.PI * 2 * i / envs.length);
        const drift = loop ? Math.sin(t * 0.0001 + i * 1.3) * 0.005 : 0;
        const na = a + drift;
        const nx = cx + Math.cos(na) * r4;
        const ny = cy + Math.sin(na) * r4;

        // Pill nodes don't have orbiting dots, but check ring 3 dots for proximity
        const isHit = loop && this.checkDotNearAngle(3, a, t, rings);
        const lit = loop ? this.getLabelLit('env_' + label, isHit, t) : 0;

        const fontSize = this.fs(0.013);
        const weight = lit > 0.3 ? 600 : 400;
        ctx.font = `${weight} ${fontSize}px Inter, sans-serif`;
        const tw = ctx.measureText(label).width;
        const pw = tw + 14;
        const ph = fontSize + 8;

        const pillAlpha = 0.85 + lit * 0.15;
        const strokeAlpha = 0.3 + lit * 0.5;
        this.drawPill(ctx, nx - pw / 2, ny - ph / 2, pw, ph, ph / 2,
          `rgba(0,51,70,${pillAlpha * lp})`, `rgba(254,218,179,${strokeAlpha * lp})`);

        const textAlpha = 0.8 + lit * 0.2;
        if (lit > 0.05) {
          ctx.shadowColor = `rgba(255,255,255,${0.4 * lit})`;
          ctx.shadowBlur = 8 * lit;
        }
        ctx.fillStyle = `rgba(255,254,223,${textAlpha * lp})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, nx, ny + 0.5);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
    }

    // ── Core ──
    const e0 = this.ringP(rp, 0);
    if (e0 > 0) {
      const cr = rings[0].r * Math.min(1, e0 * 1.4);
      const grad = ctx.createRadialGradient(cx - cr * 0.1, cy - cr * 0.1, 0, cx, cy, cr);
      grad.addColorStop(0, `rgba(255,55,0,${0.95 * e0})`);
      grad.addColorStop(1, `rgba(255,55,0,${0.98 * e0})`);
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      if (e0 > 0.4) {
        const lp = Math.min(1, (e0 - 0.4) * 1.7);
        ctx.fillStyle = `rgba(255,255,255,${0.95 * lp})`;
        ctx.font = `600 ${this.fs(0.024)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('HOLON', cx, cy);
      }
    }

    // ── Caption ──
    const ec = this.ringP(rp, 5);
    if (ec > 0.2) {
      const captionY = cy + rings[4].r + 36;
      const fontSize = this.fs(0.015);
      const lineH = fontSize * 1.9;
      const lines = [
        { t: 'Constraint is highest at the center and decreases outward.', italic: false },
        { t: 'The kernel enforces invariants, not outcomes.', italic: false },
        { t: 'Everything beyond the kernel is optional.', italic: true },
      ];
      lines.forEach((line, i) => {
        const a = Math.min(1, ec) * (0.55 - i * 0.1);
        ctx.fillStyle = `rgba(254,218,179,${a})`;
        ctx.font = `${line.italic ? 'italic ' : ''}400 ${fontSize}px ${line.italic ? 'Newsreader, serif' : 'Inter, sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(line.t, cx, captionY + i * lineH);
      });
    }
  }

  ringP(rp, ring) {
    const delay = ring * 0.12;
    return Math.max(0, Math.min(1, (rp - delay) / 0.3));
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
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  loop = (ts) => {
    if (!this.running) return;
    this.draw(ts);
    requestAnimationFrame(this.loop);
  }

  start() { if (this.running) return; this.running = true; requestAnimationFrame(this.loop); }
  stop() { this.running = false; }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('kernelCanvas');
  if (!canvas) return;
  const kernel = new KernelDiagram(canvas);
  if (prefersReducedMotion) {
    kernel.revealProgress = 1;
    kernel.revealed = true;
    kernel.draw(0);
  } else {
    const section = canvas.closest('.reveal');
    if (section) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && !kernel.revealed) {
            kernel.animateReveal();
            obs.unobserve(section);
          }
        });
      }, { threshold: 0.15 });
      obs.observe(section);
    }
    observeCanvas(canvas, () => { if (kernel.revealed) kernel.start(); }, () => kernel.stop());
  }
});
