/* ═══════════════════════════════════════
   mesh.js — 3D Gyroscopic Holon
   White lines + white glowing dots,
   flat matte orange core sphere.
   ═══════════════════════════════════════ */

import { observeCanvas, prefersReducedMotion } from './main.js';

const TAU = Math.PI * 2;
const PI  = Math.PI;

/* ── 3D Math helpers ── */

function rotateX(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}
function rotateY(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function rotateZ(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

function project(p, cx, cy, fov) {
  const scale = fov / (fov + p.z);
  return { x: cx + p.x * scale, y: cy + p.y * scale, s: scale, z: p.z };
}

class GyroscopeAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.time = 0;
    this.startTime = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Glow buffer
    this.buffer = document.createElement('canvas');
    this.bCtx = this.buffer.getContext('2d');

    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseInCanvas = false;
    this.tiltX = 0;
    this.tiltY = 0;

    this._initRings();
    this._initParticles();
    this._initCore();

    this.bloom = 0;
    this.fov = 600;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      this.mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      this.mouseInCanvas = true;
    });
    canvas.addEventListener('mouseleave', () => {
      this.mouseInCanvas = false;
    });
  }

  _initRings() {
    // All rings are white — varying opacity and line weight for depth
    const W = [255, 255, 255];
    this.rings = [
      // Inner rings — tight, fast
      {
        radius: 0.16, segments: 100, lineWidth: 2.0,
        tiltX: 0.3, tiltY: 0, tiltZ: 0,
        spinAxis: 'y', spinSpeed: 0.0005, spinAngle: 0,
        color: W, opacity: 0.65,
        dashPattern: null, bloomDelay: 200,
      },
      {
        radius: 0.21, segments: 100, lineWidth: 1.7,
        tiltX: PI * 0.42, tiltY: PI * 0.15, tiltZ: 0,
        spinAxis: 'x', spinSpeed: -0.00042, spinAngle: 0,
        color: W, opacity: 0.50,
        dashPattern: null, bloomDelay: 350,
      },
      {
        radius: 0.19, segments: 100, lineWidth: 1.2,
        tiltX: PI * 0.52, tiltY: 0, tiltZ: PI * 0.3,
        spinAxis: 'z', spinSpeed: 0.000378, spinAngle: 0,
        color: W, opacity: 0.35,
        dashPattern: [4, 5], bloomDelay: 500,
      },

      // Middle rings
      {
        radius: 0.30, segments: 140, lineWidth: 1.3,
        tiltX: 0.15, tiltY: PI * 0.25, tiltZ: 0,
        spinAxis: 'y', spinSpeed: 0.000294, spinAngle: 0,
        color: W, opacity: 0.32,
        dashPattern: null, bloomDelay: 650,
      },
      {
        radius: 0.34, segments: 140, lineWidth: 1.1,
        tiltX: PI * 0.35, tiltY: 0, tiltZ: PI * 0.5,
        spinAxis: 'x', spinSpeed: -0.000252, spinAngle: 0,
        color: W, opacity: 0.26,
        dashPattern: [5, 7], bloomDelay: 800,
      },
      {
        radius: 0.28, segments: 120, lineWidth: 1.0,
        tiltX: PI * 0.6, tiltY: PI * 0.4, tiltZ: 0,
        spinAxis: 'z', spinSpeed: 0.000336, spinAngle: 0,
        color: W, opacity: 0.22,
        dashPattern: [3, 4], bloomDelay: 750,
      },

      // Outer rings — large, slower, ethereal
      {
        radius: 0.42, segments: 180, lineWidth: 0.9,
        tiltX: 0.1, tiltY: PI * 0.1, tiltZ: PI * 0.2,
        spinAxis: 'y', spinSpeed: 0.000168, spinAngle: 0,
        color: W, opacity: 0.18,
        dashPattern: [2, 4], bloomDelay: 1000,
      },
      {
        radius: 0.46, segments: 180, lineWidth: 0.7,
        tiltX: PI * 0.45, tiltY: PI * 0.3, tiltZ: 0,
        spinAxis: 'x', spinSpeed: -0.000147, spinAngle: 0,
        color: W, opacity: 0.14,
        dashPattern: [2, 3], bloomDelay: 1200,
      },

      // Wide outer rings — fill full page width
      {
        radius: 0.58, segments: 220, lineWidth: 0.6,
        tiltX: PI * 0.12, tiltY: PI * 0.08, tiltZ: PI * 0.35,
        spinAxis: 'z', spinSpeed: 0.00012, spinAngle: 0,
        color: W, opacity: 0.11,
        dashPattern: [2, 6], bloomDelay: 1400,
      },
      {
        radius: 0.72, segments: 260, lineWidth: 0.5,
        tiltX: PI * 0.3, tiltY: PI * 0.18, tiltZ: 0,
        spinAxis: 'y', spinSpeed: -0.0001, spinAngle: 0,
        color: W, opacity: 0.08,
        dashPattern: [1, 5], bloomDelay: 1600,
      },
    ];
  }

  _initParticles() {
    this.particles = [];
    const W = [255, 255, 255];
    const particlesPerRing = [10, 8, 8, 7, 6, 5, 4, 4, 5, 6];

    for (let r = 0; r < this.rings.length; r++) {
      const count = particlesPerRing[r] || 4;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          ringIdx: r,
          angle: Math.random() * TAU,
          speed: (0.00042 + Math.random() * 0.00063) * (r < 3 ? 1.3 : 0.8),
          size: 1.0 + Math.random() * 1.8,
          baseAlpha: 0.35 + Math.random() * 0.45,
          color: W,
          bloomDelay: this.rings[r].bloomDelay + 200 + Math.random() * 300,
          bloom: 0,
        });
      }
    }

    // Free-floating ambient dust — all white
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        ringIdx: -1,
        x: (Math.random() - 0.5) * 1.1,
        y: (Math.random() - 0.5) * 1.1,
        z: (Math.random() - 0.5) * 0.5,
        vx: (Math.random() - 0.5) * 0.000021,
        vy: (Math.random() - 0.5) * 0.000021,
        vz: (Math.random() - 0.5) * 0.0000126,
        size: 0.5 + Math.random() * 1.0,
        baseAlpha: 0.1 + Math.random() * 0.15,
        color: W,
        bloomDelay: 1500 + Math.random() * 600,
        bloom: 0,
      });
    }
  }

  _initCore() {
    this.core = {
      radius: 0.06,
      pulsePhase: 0,
      bloom: 0,
      bloomDelay: 0,
      // White inner mini-rings orbiting the core
      innerRings: [
        { radius: 0.085, tiltX: 0.8, tiltY: 0, speed: 0.00126, angle: 0, opacity: 0.35, width: 0.8 },
        { radius: 0.105, tiltX: 0, tiltY: 1.2, speed: -0.00105, angle: PI * 0.7, opacity: 0.25, width: 0.7 },
        { radius: 0.095, tiltX: 1.4, tiltY: 0.5, speed: 0.00084, angle: PI * 1.3, opacity: 0.2, width: 0.6 },
      ],
    };
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.w = parent.offsetWidth;
    this.h = parent.offsetHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.buffer.width = this.w * this.dpr;
    this.buffer.height = this.h * this.dpr;
    this.bCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /* ── Get 3D position on a ring ── */
  _ringPoint3D(ring, angle, scale) {
    const r = ring.radius * scale;
    let p = { x: Math.cos(angle) * r, y: Math.sin(angle) * r, z: 0 };
    p = rotateX(p, ring.tiltX);
    p = rotateY(p, ring.tiltY);
    if (ring.tiltZ) p = rotateZ(p, ring.tiltZ);
    if (ring.spinAxis === 'x') p = rotateX(p, ring.spinAngle);
    else if (ring.spinAxis === 'y') p = rotateY(p, ring.spinAngle);
    else p = rotateZ(p, ring.spinAngle);
    return p;
  }

  /* ── Core inner ring 3D point ── */
  _coreRingPoint3D(ir, angle, scale) {
    const r = ir.radius * scale;
    let p = { x: Math.cos(angle) * r, y: Math.sin(angle) * r, z: 0 };
    p = rotateX(p, ir.tiltX);
    p = rotateY(p, ir.tiltY);
    p = rotateY(p, ir.angle);
    p = rotateX(p, ir.angle * 0.3);
    return p;
  }

  /* ── Update ── */
  _update(t, dt, elapsed) {
    if (this.bloom < 1) {
      this.bloom = Math.min(1, this.bloom + dt * 0.0008);
    }

    if (elapsed > this.core.bloomDelay && this.core.bloom < 1) {
      this.core.bloom = Math.min(1, this.core.bloom + dt * 0.0012);
    }
    this.core.pulsePhase += 0.0008 * dt;

    // Heartbeat — slow expanding light wave from core
    if (!this.heartbeat) this.heartbeat = { phase: 0 };
    this.heartbeat.phase += dt * 0.00018;  // ~5.8s full cycle

    // Core inner rings spin
    this.core.innerRings.forEach(ir => {
      ir.angle += ir.speed * dt;
    });

    // Mouse → tilt
    if (this.mouseInCanvas) {
      this.tiltX += (this.mouseY * 0.4 - this.tiltX) * 0.05;
      this.tiltY += (this.mouseX * 0.4 - this.tiltY) * 0.05;
    } else {
      this.tiltX += (0 - this.tiltX) * 0.02;
      this.tiltY += (0 - this.tiltY) * 0.02;
    }

    // Ring spins
    this.rings.forEach(ring => {
      ring.spinAngle += ring.spinSpeed * dt;
    });

    // Particles
    this.particles.forEach(p => {
      if (elapsed > p.bloomDelay && p.bloom < 1) {
        p.bloom = Math.min(1, p.bloom + dt * 0.0012);
      }
      if (p.ringIdx >= 0) {
        p.angle = (p.angle + p.speed * dt) % TAU;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        if (Math.abs(p.x) > 0.65) p.vx *= -1;
        if (Math.abs(p.y) > 0.65) p.vy *= -1;
        if (Math.abs(p.z) > 0.35) p.vz *= -1;
      }
    });
  }

  /* ── Apply global rotation ── */
  _applyGlobalRotation(p, t) {
    let pt = p;
    pt = rotateY(pt, t * 0.0000336);
    pt = rotateX(pt, t * 0.0000168);
    pt = rotateX(pt, this.tiltX);
    pt = rotateY(pt, this.tiltY);
    return pt;
  }

  /* ── Draw ring (white, depth-faded) ── */
  _drawRing(ctx, ring, t, cx, cy, scale, fov, ringBloom) {
    if (ringBloom < 0.01) return;

    const segments = ring.segments;
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * TAU;
      let p = this._ringPoint3D(ring, angle, scale);
      p = this._applyGlobalRotation(p, t);
      points.push(project(p, cx, cy, fov));
    }

    ctx.save();
    if (ring.dashPattern) ctx.setLineDash(ring.dashPattern);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const avgZ = (p0.z + p1.z) / 2;
      const depthFade = 0.2 + 0.8 * ((avgZ + scale * 0.5) / scale);
      const alpha = ring.opacity * ringBloom * Math.max(0.05, Math.min(1, depthFade));
      const lineW = ring.lineWidth * (0.4 + 0.6 * p0.s);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = lineW;
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  /* ── Draw core: flat matte orange sphere with heartbeat ignition ── */
  _drawCore(ctx, t, cx, cy, scale, fov) {
    const b = this.core.bloom;
    if (b < 0.01) return;

    // Heartbeat: core ignites brighter, then the glow expands outward
    const hbPhase = this.heartbeat ? this.heartbeat.phase % 1 : 0;
    // Sharp ignition peak — rises fast, decays slowly
    const hbRaw = Math.sin(hbPhase * TAU);
    const hbIgnite = Math.pow(Math.max(0, hbRaw), 1.5);
    // Secondary beat
    const hb2Raw = Math.sin(((hbPhase + 0.15) % 1) * TAU);
    const hb2Ignite = Math.pow(Math.max(0, hb2Raw), 1.5) * 0.4;
    const hbPulse = Math.min(1, hbIgnite + hb2Ignite);

    const pulse = Math.sin(this.core.pulsePhase) * 0.06;
    // Core swells slightly on heartbeat
    const hbSwell = 1 + hbPulse * 0.08;
    const r = this.core.radius * scale * (1 + pulse) * b * hbSwell;

    // Outer glow — expands dramatically from the core ignition
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glowIntensity = 1 + hbPulse * 1.2;
    const glowR = r * (3.5 + hbPulse * 3.0);
    const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, glowR);
    glow.addColorStop(0, `rgba(255,70,10,${0.12 * glowIntensity * b})`);
    glow.addColorStop(0.3, `rgba(255,55,0,${0.06 * glowIntensity * b})`);
    glow.addColorStop(0.7, `rgba(255,40,0,${0.02 * glowIntensity * b})`);
    glow.addColorStop(1, 'rgba(255,30,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
    ctx.restore();

    // White inner mini-rings orbiting the core
    this.core.innerRings.forEach(ir => {
      const segs = 60;
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * TAU;
        let p = this._coreRingPoint3D(ir, a, scale);
        p = this._applyGlobalRotation(p, t);
        pts.push(project(p, cx, cy, fov));
      }

      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const depthFade = 0.3 + 0.7 * ((p0.z + scale * 0.3) / (scale * 0.6));
        const alpha = ir.opacity * b * Math.max(0.06, Math.min(1, depthFade));

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = ir.width * (0.5 + 0.5 * p0.s);
        ctx.stroke();
      }
    });

    // Orange sphere — heartbeat ignites from within (orange → hotter orange-white)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    // At rest: flat matte orange. On beat: center shifts toward bright white-orange
    const centerR = Math.round(255);
    const centerG = Math.round(65 + hbPulse * 120);   // 65 → 185 (toward warm white)
    const centerB = Math.round(15 + hbPulse * 80);    // 15 → 95
    const midR = 255;
    const midG = Math.round(55 + hbPulse * 60);       // 55 → 115
    const midB = Math.round(0 + hbPulse * 30);        // 0 → 30
    const edgeR = 230;
    const edgeG = Math.round(45 + hbPulse * 30);
    const edgeB = Math.round(0 + hbPulse * 10);

    grad.addColorStop(0, `rgba(${centerR},${centerG},${centerB},${0.95 * b})`);
    grad.addColorStop(0.7, `rgba(${midR},${midG},${midB},${0.92 * b})`);
    grad.addColorStop(1, `rgba(${edgeR},${edgeG},${edgeB},${0.85 * b})`);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fillStyle = grad;
    ctx.fill();

    // Hot-white bloom overlay on peak ignition
    if (hbPulse > 0.1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const hotR = r * 0.7;
      const hotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hotR);
      hotGrad.addColorStop(0, `rgba(255,220,180,${0.25 * hbPulse * b})`);
      hotGrad.addColorStop(0.5, `rgba(255,120,50,${0.1 * hbPulse * b})`);
      hotGrad.addColorStop(1, 'rgba(255,60,10,0)');
      ctx.fillStyle = hotGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, hotR, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Draw particles (all white, with white glow) ── */
  _drawParticles(ctx, t, cx, cy, scale, fov) {
    const items = [];

    this.particles.forEach(p => {
      if (p.bloom < 0.01) return;

      let pt;
      if (p.ringIdx >= 0) {
        const ring = this.rings[p.ringIdx];
        pt = this._ringPoint3D(ring, p.angle, scale);
      } else {
        pt = { x: p.x * scale, y: p.y * scale, z: p.z * scale };
      }

      pt = this._applyGlobalRotation(pt, t);
      const proj = project(pt, cx, cy, fov);

      items.push({
        x: proj.x, y: proj.y, z: proj.z, s: proj.s,
        size: p.size * proj.s,
        alpha: p.baseAlpha * p.bloom,
      });
    });

    items.sort((a, b) => b.z - a.z);

    items.forEach(item => {
      const depthFade = 0.2 + 0.8 * Math.max(0, Math.min(1, (item.z + scale * 0.5) / scale));
      const alpha = item.alpha * depthFade;
      const sz = Math.max(0.5, item.size);

      // White glow
      const gRad = Math.max(1, sz * 5);
      const grad = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, gRad);
      grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.35})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(item.x - gRad, item.y - gRad, gRad * 2, gRad * 2);

      // White dot
      ctx.beginPath();
      ctx.arc(item.x, item.y, sz, 0, TAU);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
  }

  /* ── HUD ── */
  _drawHUD(ctx, cx, cy, scale) {
    const a = this.bloom;
    if (a < 0.01) return;

    ctx.save();

    // Crosshair
    const cl = scale * 0.55;
    ctx.strokeStyle = `rgba(255,255,255,${0.025 * a})`;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(cx - cl, cy); ctx.lineTo(cx + cl, cy);
    ctx.moveTo(cx, cy - cl); ctx.lineTo(cx, cy + cl);
    ctx.stroke();

    // Tick marks
    const tr = scale * 0.50;
    const tickCount = 96;
    for (let i = 0; i < tickCount; i++) {
      const ang = (i / tickCount) * TAU;
      const isMajor = i % 6 === 0;
      const len = isMajor ? scale * 0.016 : scale * 0.008;
      const alpha = isMajor ? 0.05 : 0.025;
      ctx.strokeStyle = `rgba(255,255,255,${alpha * a})`;
      ctx.lineWidth = isMajor ? 0.5 : 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * tr, cy + Math.sin(ang) * tr);
      ctx.lineTo(cx + Math.cos(ang) * (tr + len), cy + Math.sin(ang) * (tr + len));
      ctx.stroke();
    }

    // Guide circles
    ctx.strokeStyle = `rgba(255,255,255,${0.02 * a})`;
    ctx.lineWidth = 0.3;
    ctx.setLineDash([2, 6]);
    [0.16, 0.30, 0.44].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, TAU);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    ctx.restore();
  }

  /* ── Connections (white lines between nearby particles) ── */
  _drawConnections(ctx, t, cx, cy, scale, fov) {
    if (this.bloom < 0.3) return;

    const positions = [];
    this.particles.forEach(p => {
      if (p.bloom < 0.2) return;
      let pt;
      if (p.ringIdx >= 0) {
        const ring = this.rings[p.ringIdx];
        pt = this._ringPoint3D(ring, p.angle, scale);
      } else {
        pt = { x: p.x * scale, y: p.y * scale, z: p.z * scale };
      }
      pt = this._applyGlobalRotation(pt, t);
      const proj = project(pt, cx, cy, fov);
      positions.push({ ...proj, bloom: p.bloom });
    });

    const maxDist = scale * 0.18;
    const maxDistSq = maxDist * maxDist;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistSq) continue;

        const dist = Math.sqrt(distSq);
        const proximity = 1 - dist / maxDist;
        const depthAvg = (positions[i].s + positions[j].s) / 2;
        const alpha = proximity * proximity * 0.12 * this.bloom * Math.min(positions[i].bloom, positions[j].bloom) * depthAvg;

        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[j].x, positions[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.3 + proximity * 0.4;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /* ── Heartbeat: slow radial light pulse from the core ── */
  _drawHeartbeat(ctx, cx, cy, scale) {
    if (!this.heartbeat || this.bloom < 0.5) return;

    const phase = this.heartbeat.phase % 1;

    // Two overlapping waves for a double-beat rhythm
    const waves = [
      { p: phase, strength: 1.0 },
      { p: (phase + 0.15) % 1, strength: 0.5 },
    ];

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    waves.forEach(wave => {
      // Wave expands from 0 → full radius, fading as it goes
      const radius = wave.p * scale * 0.85;
      const fadeIn = Math.min(1, wave.p * 8);        // quick fade in
      const fadeOut = 1 - Math.pow(wave.p, 0.6);     // slow fade out
      const alpha = fadeIn * fadeOut * 0.04 * wave.strength * this.bloom;

      if (alpha < 0.001 || radius < 1) return;

      const ringWidth = scale * 0.12;
      const innerR = Math.max(0, radius - ringWidth);

      const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, radius);
      grad.addColorStop(0, `rgba(255,80,20,0)`);
      grad.addColorStop(0.3, `rgba(255,70,15,${alpha * 0.5})`);
      grad.addColorStop(0.6, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.85, `rgba(255,70,15,${alpha * 0.5})`);
      grad.addColorStop(1, `rgba(255,55,0,0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    });

    ctx.restore();
  }

  /* ── Main draw ── */
  draw(t) {
    const { ctx, bCtx, w, h } = this;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h);
    const dt = this.time ? Math.min(t - this.time, 50) : 16;
    const elapsed = t - this.startTime;

    this._update(t, dt, elapsed);

    // Clear
    ctx.fillStyle = '#0C0C0E';
    ctx.fillRect(0, 0, w, h);

    // Ring bloom
    const ringBlooms = this.rings.map(ring => {
      if (elapsed < ring.bloomDelay) return 0;
      return Math.min(1, (elapsed - ring.bloomDelay) * 0.0008);
    });

    // Glow pass
    bCtx.clearRect(0, 0, w, h);
    this._drawCore(bCtx, t, cx, cy, scale, this.fov);
    this._drawParticles(bCtx, t, cx, cy, scale, this.fov);

    // Blur composite
    ctx.save();
    ctx.filter = `blur(${Math.max(8, scale * 0.015)}px)`;
    ctx.globalAlpha = 0.45;
    ctx.drawImage(this.buffer, 0, 0, w * this.dpr, h * this.dpr, 0, 0, w, h);
    ctx.restore();

    // Heartbeat pulse wave
    this._drawHeartbeat(ctx, cx, cy, scale);

    // Sharp layers
    this._drawHUD(ctx, cx, cy, scale);
    this._drawConnections(ctx, t, cx, cy, scale, this.fov);

    this.rings.forEach((ring, i) => {
      this._drawRing(ctx, ring, t, cx, cy, scale, this.fov, ringBlooms[i]);
    });

    this._drawParticles(ctx, t, cx, cy, scale, this.fov);
    this._drawCore(ctx, t, cx, cy, scale, this.fov);

    // Vignette
    const vig = ctx.createRadialGradient(cx, cy, scale * 0.2, cx, cy, Math.max(w, h) * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Noise
    ctx.save();
    ctx.globalAlpha = 0.01;
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random(), 1 + Math.random());
    }
    ctx.restore();

    this.time = t;
  }

  loop = (timestamp) => {
    if (!this.running) return;
    this.draw(timestamp);
    requestAnimationFrame(this.loop);
  }

  start() {
    if (this.running) return;
    this.running = true;
    if (!this._everStarted) {
      this.startTime = performance.now();
      this.time = this.startTime;
      this._everStarted = true;
    } else {
      const now = performance.now();
      const pausedDuration = now - this._pausedAt;
      this.startTime += pausedDuration;
      this.time = now;
    }
    requestAnimationFrame(this.loop);
  }

  stop() {
    this._pausedAt = performance.now();
    this.running = false;
  }
}

// ── Init ──
function initGyroscope() {
  const canvas = document.getElementById('meshCanvas');
  if (!canvas) return;

  const gyro = new GyroscopeAnimation(canvas);

  if (prefersReducedMotion) {
    gyro.bloom = 1;
    gyro.core.bloom = 1;
    gyro.particles.forEach(p => { p.bloom = 1; });
    gyro.startTime = 0;
    gyro.time = 0;
    gyro.draw(3000);
  } else {
    gyro.start();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        gyro.stop();
      } else {
        gyro.start();
      }
    });
  }
}

// Modules are deferred — DOMContentLoaded may have already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGyroscope);
} else {
  initGyroscope();
}
