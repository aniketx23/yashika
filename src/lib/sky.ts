import { LEO, LEO_EDGES } from './constellations';

/**
 * The living sky: one fixed full-viewport canvas, everything drawn per frame in
 * a single rAF loop. A 64×64 radial-gradient sprite is pre-rendered once and
 * `drawImage`d for every star — never a gradient per star per frame.
 */

interface Star {
  x: number;
  y: number;
  r: number;
  z: number;
  ph: number;
  sp: number;
}

interface Meteor {
  t0: number;
  x: number;
  y: number;
  a: number;
  sp: number;
  len: number;
  life: number;
  w: number;
}

interface Bloom {
  t0: number;
  dur: number;
  x: number;
  y: number;
  p: number;
}

/** [nx, ny, "r,g,b", alpha] */
const NEBULAE: readonly (readonly [number, number, string, number])[] = [
  [0.22, 0.26, '201,113,57', 0.11],
  [0.8, 0.74, '255,61,113', 0.07],
  [0.62, 0.12, '240,180,41', 0.06],
];

const SIRIUS_RAYS: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 0],
  [0.7, 0.7],
  [0.7, -0.7],
];

const BLOOM_RING_OFFSETS = [0, 0.16, 0.34] as const;

/** Scroll speed, in px/frame, at which the star draught reaches full stretch. */
const FLICK = 60;
const MOBILE_BREAKPOINT = 560;
const TAU_PLUS = 7; // > 2π, closes every arc

function makeSprite(): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  const ctx = sprite.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.14, 'rgba(255,250,235,.85)');
  grad.addColorStop(0.4, 'rgba(255,225,170,.22)');
  grad.addColorStop(1, 'rgba(255,220,160,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return sprite;
}

export class SkyEngine {
  /** Pushed in by the scroll director; never read from the DOM in the loop. */
  scrollY = 0;
  /**
   * Signed pixels *per frame* — Lenis reports `animatedScroll - lastScroll`,
   * not px/s. A hard flick is roughly 60. Decays on its own, so a dropped
   * event can never leave the smear switched on.
   */
  scrollVelocity = 0;

  private readonly ctx: CanvasRenderingContext2D;
  private readonly sprite: HTMLCanvasElement;
  private readonly stars: Star[];
  private meteors: Meteor[] = [];
  private nextMeteor = 0;
  private bloomFx: Bloom | null = null;
  private w = 0;
  private h = 0;
  private raf = 0;
  /** Smoothed 0–1 draught, so the star trails ease in and out of the motion. */
  private draught = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly meteorRate: number,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.sprite = makeSprite();
    const count = window.innerWidth < MOBILE_BREAKPOINT ? 120 : 210;
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.7,
      z: 0.25 + Math.random() * 0.75,
      ph: Math.random() * 7,
      sp: 0.4 + Math.random() * 1.7,
    }));
    this.resize();
    window.addEventListener('resize', this.resize);
    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      this.draw(t / 1000);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
  }

  /** The one reveal effect. `x`/`y` are normalised viewport coordinates. */
  bloom(x = 0.5, y = 0.5, dur = 1700): void {
    this.bloomFx = { t0: performance.now(), dur, x, y, p: 0 };
  }

  private resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private draw(t: number): void {
    const c = this.ctx;
    const { w, h } = this;
    if (!w || !h) return;
    const sy = this.scrollY;

    c.clearRect(0, 0, w, h);
    this.paintGround(c, w, h);
    this.paintNebulae(c, w, h, t, sy);

    // The bloom drives the star warp, so resolve it before the star field.
    let warp = 0;
    let glow = 0;
    const fx = this.bloomFx;
    if (fx) {
      const p = (performance.now() - fx.t0) / fx.dur;
      if (p >= 1) this.bloomFx = null;
      else {
        warp = p < 0.5 ? p * 2 : (1 - p) * 2;
        glow = 1 - p;
        fx.p = p;
      }
    }

    /* Scroll draught: travelling fast through the sky smears the stars along
       the direction of travel. Self-decaying so it can never stick on. */
    this.scrollVelocity *= 0.92;
    const pull = Math.max(-1, Math.min(1, this.scrollVelocity / FLICK));
    this.draught += (pull - this.draught) * 0.14;

    this.paintStars(c, w, h, t, sy, warp, Math.abs(this.draught) < 0.02 ? 0 : this.draught);
    this.paintLeo(c, w, h, t, sy);
    this.paintSirius(c, w, h, t, sy);
    this.paintMeteors(c, w, h, t);
    if (fx && glow > 0) this.paintBloom(c, w, h, fx);
  }

  private paintGround(c: CanvasRenderingContext2D, w: number, h: number): void {
    const g = c.createLinearGradient(0, 0, w * 0.6, h);
    g.addColorStop(0, '#0B0A1F');
    g.addColorStop(0.5, '#120e33');
    g.addColorStop(1, '#0B0A1F');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }

  private paintNebulae(
    c: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    sy: number,
  ): void {
    const radius = Math.max(w, h) * 0.55;
    for (let i = 0; i < NEBULAE.length; i++) {
      const [nx, ny, rgb, alpha] = NEBULAE[i]!;
      const x = w * nx + Math.sin(t * 0.06 + i) * w * 0.05;
      const y = h * ny + Math.cos(t * 0.05 + i) * h * 0.05 - sy * 0.02;
      const g = c.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    }
  }

  private paintStars(
    c: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    sy: number,
    warp: number,
    draught: number,
  ): void {
    const wrap = h + 80;
    const cx = w / 2;
    const cy = h / 2;
    for (const s of this.stars) {
      let x = s.x * w;
      let y = (((s.y * h - sy * 0.12 * s.z) % wrap) + wrap) % wrap - 40;
      const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
      let len = 0;
      if (warp > 0) {
        const k = 1 + warp * 1.6 * s.z;
        x = cx + (x - cx) * k;
        y = cy + (y - cy) * k;
        len = warp * 90 * s.z;
      }
      if (len > 1.5) {
        const a = Math.atan2(y - cy, x - cx);
        c.strokeStyle = `rgba(240,225,200,${twinkle * 0.85})`;
        c.lineWidth = s.r * 1.4;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x - Math.cos(a) * len, y - Math.sin(a) * len);
        c.stroke();
        continue;
      }

      const d = s.r * 7 * (1 + twinkle * 0.3);
      /* Nearer stars smear further — the parallax already moved them faster. */
      const trail = draught * 26 * s.z;
      if (Math.abs(trail) > 1.5) {
        c.strokeStyle = `rgba(240,225,200,${twinkle * s.z * 0.5})`;
        c.lineWidth = s.r * 1.15;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x, y + trail);
        c.stroke();
      }
      c.globalAlpha = Math.min(1, twinkle * s.z + 0.08);
      c.drawImage(this.sprite, x - d / 2, y - d / 2, d, d);
      c.globalAlpha = 1;
    }
  }

  /** Leo, lit but wordless — the constellation names live on the section maps. */
  private paintLeo(
    c: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    sy: number,
  ): void {
    const short = Math.min(w, h);
    const small = w < MOBILE_BREAKPOINT;
    const lw = small ? w * 0.92 : short * 0.5;
    const lh = lw * 0.74;
    const lx = small ? w * 0.04 : w * 0.06;
    const ly = (small ? h * 0.16 : h * 0.1) - sy * 0.05;

    c.strokeStyle = `rgba(240,180,41,${small ? 0.2 : 0.28})`;
    c.lineWidth = 1;
    c.lineCap = 'round';
    for (const [a, b] of LEO_EDGES) {
      const from = LEO[a]!;
      const to = LEO[b]!;
      c.beginPath();
      c.moveTo(lx + from.x * lw, ly + from.y * lh);
      c.lineTo(lx + to.x * lw, ly + to.y * lh);
      c.stroke();
    }

    for (let i = 0; i < LEO.length; i++) {
      const s = LEO[i]!;
      const x = lx + s.x * lw;
      const y = ly + s.y * lh;
      const isRegulus = s.n === 'REGULUS';
      const pulse = 0.6 + 0.4 * Math.sin(t * (0.5 + i * 0.09) + i);
      const d = s.m * (isRegulus ? 15 : 9) * (isRegulus ? 1 + 0.08 * Math.sin(t * 1.4) : 1);
      c.globalAlpha = isRegulus ? 0.95 : 0.55 + 0.3 * pulse;
      c.drawImage(this.sprite, x - d / 2, y - d / 2, d, d);
      c.globalAlpha = 1;
    }
  }

  /** Sirius, unlabelled. Kept clear of the fixed sound pill in the top-right on mobile. */
  private paintSirius(
    c: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    sy: number,
  ): void {
    const x = w * (w < MOBILE_BREAKPOINT ? 0.68 : 0.86);
    const y = (w < MOBILE_BREAKPOINT ? h * 0.155 : h * 0.16) - sy * 0.04;
    const flare = 0.78 + 0.22 * Math.sin(t * 1.9);

    c.globalAlpha = flare;
    c.drawImage(this.sprite, x - 22, y - 22, 44, 44);
    c.globalAlpha = 1;

    c.strokeStyle = `rgba(237,234,255,${0.4 * flare})`;
    c.lineWidth = 1;
    const rayLen = 26 + 8 * flare;
    for (const [vx, vy] of SIRIUS_RAYS) {
      c.beginPath();
      c.moveTo(x - vx * rayLen, y - vy * rayLen);
      c.lineTo(x + vx * rayLen, y + vy * rayLen);
      c.stroke();
    }
  }

  private paintMeteors(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const rate = Math.max(0.15, this.meteorRate);
    if (t > this.nextMeteor) {
      this.nextMeteor = t + (0.5 + Math.random() * 0.9) / rate;
      const big = Math.random() < 0.2;
      this.meteors.push({
        t0: t,
        x: Math.random() * w * 1.1 - w * 0.15,
        y: Math.random() * h * 0.6 - h * 0.15,
        a: 0.5 + Math.random() * 0.45,
        sp: big ? 330 : 520 + Math.random() * 340,
        len: big ? 190 : 80 + Math.random() * 90,
        life: big ? 1.7 : 0.8 + Math.random() * 0.5,
        w: big ? 2.4 : 1.1 + Math.random() * 0.7,
      });
      if (this.meteors.length > 9) this.meteors.shift();
    }

    for (const m of this.meteors) {
      const p = (t - m.t0) / m.life;
      if (p < 0 || p > 1) continue;
      const ease = 1 - Math.pow(1 - p, 1.7);
      const cos = Math.cos(m.a);
      const sin = Math.sin(m.a);
      const x = m.x + cos * ease * m.sp * m.life;
      const y = m.y + sin * ease * m.sp * m.life;
      const tailX = x - cos * m.len;
      const tailY = y - sin * m.len;
      const fade = Math.sin(p * Math.PI);
      const g = c.createLinearGradient(x, y, tailX, tailY);
      g.addColorStop(0, `rgba(255,253,245,${fade})`);
      g.addColorStop(0.3, `rgba(255,230,185,${fade * 0.45})`);
      g.addColorStop(1, 'rgba(255,230,185,0)');
      c.strokeStyle = g;
      c.lineWidth = m.w;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(tailX, tailY);
      c.stroke();
      c.globalAlpha = fade;
      const head = m.w * 9;
      c.drawImage(this.sprite, x - head / 2, y - head / 2, head, head);
      c.globalAlpha = 1;
    }
    this.meteors = this.meteors.filter((m) => t - m.t0 < m.life);
  }

  private paintBloom(c: CanvasRenderingContext2D, w: number, h: number, fx: Bloom): void {
    const cx = fx.x * w;
    const cy = fx.y * h;
    const R = Math.hypot(w, h);
    for (const off of BLOOM_RING_OFFSETS) {
      const rp = (fx.p - off) / (1 - off);
      if (rp <= 0 || rp >= 1) continue;
      c.strokeStyle = `rgba(240,180,41,${0.45 * (1 - rp)})`;
      c.lineWidth = 3 * (1 - rp) + 0.5;
      c.beginPath();
      c.arc(cx, cy, rp * R * 0.8, 0, TAU_PLUS);
      c.stroke();
    }
    const gl = Math.max(0, 1 - fx.p * 1.25);
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.72);
    g.addColorStop(0, `rgba(255,238,190,${0.8 * gl})`);
    g.addColorStop(0.35, `rgba(240,180,41,${0.32 * gl})`);
    g.addColorStop(1, 'rgba(240,180,41,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }
}
