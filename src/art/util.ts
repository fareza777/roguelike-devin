import { mulberry32, type Rng } from '../rng';

export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function hex(c: string): [number, number, number] {
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgba = (c: string, a = 1) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})` };
export function mix(a: string, b: string, t: number) {
  const A = hex(a), B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
}
/** k in -1..1: negative darkens, positive lightens. */
export function shade(c: string, k: number) { return k < 0 ? mix(c, '#000000', -k) : mix(c, '#ffffff', k) }

export const rngOf = (seed: number): Rng => mulberry32(seed >>> 0);

/** Seeded 2D value noise with fbm. */
export class Noise {
  private p = new Float32Array(1024);
  constructor(seed: number) { const r = mulberry32(seed); for (let i = 0; i < 1024; i++) this.p[i] = r() }
  private at(x: number, y: number) { return this.p[((x * 73856093) ^ (y * 19349663)) & 1023] }
  n2(x: number, y: number) {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = smooth(x - x0), fy = smooth(y - y0);
    const a = this.at(x0, y0), b = this.at(x0 + 1, y0), c = this.at(x0, y0 + 1), d = this.at(x0 + 1, y0 + 1);
    return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
  }
  fbm(x: number, y: number, oct = 4) {
    let v = 0, a = 0.5, f = 1, tot = 0;
    for (let i = 0; i < oct; i++) { v += this.n2(x * f, y * f) * a; tot += a; a *= 0.5; f *= 2 }
    return v / tot;
  }
  n1(x: number) { return this.n2(x, 0.37) }
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}
export const ctxOf = (c: HTMLCanvasElement) => c.getContext('2d')!;

/** Polygon from points helper (closed). */
export function poly(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

/** Vertical gradient fill helper. */
export function vgrad(ctx: CanvasRenderingContext2D, y0: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
export function rgrad(ctx: CanvasRenderingContext2D, x: number, y: number, r0: number, r1: number, stops: [number, string][]) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

/** Soft glow blob (additive-friendly). */
export function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 1) {
  ctx.fillStyle = rgrad(ctx, x, y, 0, r, [[0, rgba(c, a)], [0.35, rgba(c, a * 0.35)], [1, rgba(c, 0)]]);
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Hash string → number. */
export function hashKey(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
