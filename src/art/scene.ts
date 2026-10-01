import { Noise, clamp, ctxOf, glow, hashKey, lerp, makeCanvas, mix, poly, rgba, rgrad, rngOf, shade, vgrad } from './util';
import { drawFigure, type FigureSpec } from './figures';
import { drawMotif, type Motif } from './motifs';
import type { Rng } from '../rng';

export interface Body { kind: 'eclipse' | 'moon' | 'sun' | 'void' | 'orb'; x: number; y: number; r: number; c: string; corona?: string }
export type SkylineStyle = 'keep' | 'town' | 'lamp' | 'ruin' | 'cog' | 'glass' | 'ice' | 'harbor' | 'noon' | 'stilt';
export type Layer =
  | { t: 'ridge'; y: number; amp: number; c: string; haze?: number; freq?: number; snow?: boolean; seed?: number }
  | { t: 'skyline'; y: number; c: string; style: SkylineStyle; h?: number; density?: number; windows?: string; haze?: number; seed?: number; x0?: number; x1?: number }
  | { t: 'pines'; y: number; n: number; h: number; c: string; haze?: number; seed?: number; snow?: boolean }
  | { t: 'dead'; y: number; n: number; h: number; c: string; haze?: number; seed?: number; glow?: string }
  | { t: 'columns'; y: number; n: number; h: number; c: string; w?: number; style?: 'broken' | 'arch' | 'colonnade'; haze?: number; seed?: number; x0?: number; x1?: number }
  | { t: 'ribs'; y: number; n: number; h: number; c: string; haze?: number; seed?: number }
  | { t: 'dunes'; y: number; amp: number; c: string; haze?: number; seed?: number }
  | { t: 'spires'; y: number; n: number; h: number; c: string; rim: string; haze?: number; seed?: number; style?: 'glass' | 'ice' | 'rock' }
  | { t: 'stalactites'; n: number; h: number; c: string; seed?: number }
  | { t: 'shrooms'; y: number; n: number; h: number; c: string; glow: string; seed?: number }
  | { t: 'kelp'; y: number; n: number; h: number; c: string; seed?: number }
  | { t: 'thorns'; y: number; n: number; h: number; c: string; seed?: number }
  | { t: 'cogs'; y: number; n: number; r: number; c: string; seed?: number }
  | { t: 'pillars'; n: number; c: string; w: number; seed?: number }
  | { t: 'tower'; x: number; y: number; w: number; h: number; c: string; lit?: string; roof?: 'cone' | 'flat' | 'lamp' }
  | { t: 'ship'; x: number; y: number; s: number; c: string; ghost?: boolean }
  | { t: 'banner'; x: number; y: number; h: number; c: string }
  | { t: 'hang'; n: number; c: string; glow: string; seed?: number }
  | { t: 'stairs'; x: number; y: number; w: number; steps: number; c: string }
  | { t: 'throne'; x: number; y: number; s: number; c: string; glow?: string }
  | { t: 'ground'; y: number; c: string; c2?: string; road?: boolean; puddles?: string; roadC?: string; seed?: number }
  | { t: 'crowd'; y: number; n: number; c: string; s: number; seed?: number }
  | { t: 'motif'; key: Motif; accent?: string; dark?: string }
  | { t: 'figure'; x: number; y: number; s: number; look?: FigureSpec['look']; c: string; lantern?: string; weapon?: FigureSpec['weapon']; flip?: boolean; back?: boolean; rim?: string; accent?: string };

export interface SceneSpec {
  id?: string;
  seed: number;
  sky: { top: string; mid: string; low: string; glow?: { x: number; y: number; r: number; c: string; a?: number }; stars?: number; clouds?: { c: string; a: number; y: number; h: number; scale?: number }[]; body?: Body | null; aurora?: string[]; rays?: { x: number; c: string; a?: number } };
  far?: Layer[]; mid?: Layer[]; near?: Layer[];
  water?: { y: number; c1: string; c2: string; reflect?: number };
  fog?: { c: string; a: number; y: number; h: number; speed?: number }[];
  particles?: { kind: 'embers' | 'snow' | 'ash' | 'motes' | 'rain' | 'spores' | 'dust' | 'sparks' | 'drips'; n: number; c?: string };
  lights?: { x: number; y: number; r: number; c: string; flicker?: number; a?: number }[];
  grade?: { tint?: string; a?: number; vignette?: number; grain?: number };
  lightning?: boolean;
  /** 1 = default. Larger = wider parallax travel. */
  depth?: number;
}

export interface SceneBitmaps { w: number; h: number; sky: HTMLCanvasElement; clouds: HTMLCanvasElement | null; far: HTMLCanvasElement; mid: HTMLCanvasElement; near: HTMLCanvasElement; fogs: HTMLCanvasElement[]; vig: HTMLCanvasElement; grain: HTMLCanvasElement; wide: number }

const WIDE = 1.2;

// ------------------------------------------------------------------ sky
function paintSky(ctx: CanvasRenderingContext2D, spec: SceneSpec, w: number, h: number, rng: Rng) {
  const s = spec.sky;
  ctx.fillStyle = vgrad(ctx, 0, h, [[0, s.top], [0.55, s.mid], [1, s.low]]);
  ctx.fillRect(0, 0, w, h);
  if (s.glow) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, s.glow.x * w, s.glow.y * h, s.glow.r * w, s.glow.c, s.glow.a ?? 0.6); ctx.globalCompositeOperation = 'source-over' }
  if (s.stars) {
    for (let i = 0; i < s.stars; i++) {
      const x = rng() * w, y = rng() * h * 0.7, a = 0.15 + rng() * 0.7;
      ctx.fillStyle = `rgba(255,248,230,${a * (1 - y / (h * 0.8))})`;
      const r = rng() < 0.08 ? 1.6 : 0.8;
      ctx.fillRect(x, y, r, r);
    }
  }
  if (s.aurora) {
    s.aurora.forEach((c, k) => {
      const base = h * (0.18 + k * 0.07);
      for (let band = 0; band < 3; band++) {
        ctx.beginPath();
        ctx.moveTo(0, base + band * 14);
        for (let x = 0; x <= w; x += 12) ctx.lineTo(x, base + band * 14 + Math.sin(x * 0.012 + k * 2 + band) * h * 0.05 + Math.sin(x * 0.031 + band) * h * 0.02);
        for (let x = w; x >= 0; x -= 12) ctx.lineTo(x, base + band * 14 + h * (0.1 + 0.05 * Math.sin(x * 0.02 + k)) + Math.sin(x * 0.025) * h * 0.03);
        ctx.closePath();
        ctx.fillStyle = rgrad(ctx, w / 2, base, 0, w * 0.6, [[0, rgba(c, 0.35)], [1, rgba(c, 0)]]);
        ctx.globalCompositeOperation = 'lighter';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    });
  }
  const b = s.body;
  if (b) {
    const x = b.x * w, y = b.y * h, r = b.r * w;
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, y, r * 4.2, b.corona ?? b.c, 0.55);
    glow(ctx, x, y, r * 2.2, b.corona ?? b.c, 0.5);
    ctx.globalCompositeOperation = 'source-over';
    if (b.kind === 'eclipse' || b.kind === 'void') {
      ctx.strokeStyle = rgba(b.corona ?? b.c, 0.85); ctx.lineWidth = Math.max(2, r * 0.07);
      ctx.shadowColor = b.corona ?? b.c; ctx.shadowBlur = r * 0.9;
      ctx.beginPath(); ctx.arc(x, y, r * 1.03, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
      for (let i = 0; i < 26; i++) {
        const a = rng() * Math.PI * 2, l = r * (0.15 + rng() * 0.5);
        ctx.strokeStyle = rgba(b.corona ?? b.c, 0.25 + rng() * 0.3); ctx.lineWidth = 1 + rng() * 2;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05); ctx.lineTo(x + Math.cos(a) * (r * 1.05 + l), y + Math.sin(a) * (r * 1.05 + l)); ctx.stroke();
      }
      ctx.fillStyle = b.kind === 'void' ? '#000' : rgrad(ctx, x - r * 0.25, y - r * 0.25, 0, r, [[0, '#1b0d0c'], [1, '#000']]);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = rgrad(ctx, x - r * 0.2, y - r * 0.2, r * 0.1, r, [[0, shade(b.c, 0.35)], [1, b.c]]);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      if (b.kind === 'moon') { ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(x + (rng() - 0.5) * r, y + (rng() - 0.5) * r, r * (0.08 + rng() * 0.12), 0, Math.PI * 2); ctx.fill() } }
    }
  }
  if (s.rays) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x0 = (s.rays.x + (i - 3) * 0.05) * w, x1 = x0 + (i - 3) * w * 0.12;
      ctx.fillStyle = vgrad(ctx, 0, h, [[0, rgba(s.rays.c, (s.rays.a ?? 0.18) * (0.5 + rng() * 0.5))], [1, rgba(s.rays.c, 0)]]);
      poly(ctx, [[x0 - 8, 0], [x0 + 8, 0], [x1 + 70, h], [x1 - 70, h]]);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}

function paintClouds(spec: SceneSpec, w: number, h: number, seed: number): HTMLCanvasElement | null {
  const cl = spec.sky.clouds;
  if (!cl?.length) return null;
  const W = Math.round(w * 1.6), H = Math.round(h);
  const out = makeCanvas(W, H);
  const o = ctxOf(out);
  const lw = 200, lh = Math.round((200 * H) / W) + 1;
  const tmp = makeCanvas(lw, lh);
  const t = ctxOf(tmp);
  const img = t.createImageData(lw, lh);
  const noise = new Noise(seed + 11);
  cl.forEach((layer, li) => {
    const [r, g, b] = [parseInt(rgbHex(layer.c)[0], 16), parseInt(rgbHex(layer.c)[1], 16), parseInt(rgbHex(layer.c)[2], 16)];
    const sc = layer.scale ?? 1;
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      const ny = (y / lh - layer.y) / layer.h;
      const band = Math.max(0, 1 - Math.abs(ny) * 1.15);
      const n = noise.fbm((x / lw) * 5 * sc + li * 9, (y / lh) * 3.2 * sc + li * 4, 5);
      const v = clamp((n - 0.42) * 3.1) * band;
      const i = (y * lw + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = Math.round(255 * v * layer.a);
    }
    t.putImageData(img, 0, 0);
    o.imageSmoothingEnabled = true;
    o.drawImage(tmp, 0, 0, W, H);
    t.clearRect(0, 0, lw, lh);
  });
  return out;
}
const rgbHex = (c: string): [string, string, string] => { let h = c.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); return [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)] };

// --------------------------------------------------------------- layers
interface Pen { ctx: CanvasRenderingContext2D; W: number; H: number; X: (x: number) => number; Y: (y: number) => number; haze: string; noise: Noise; rng: (seed?: number) => Rng; rim: string }

function col(p: Pen, c: string, haze = 0) { return haze ? mix(c, p.haze, haze) : c }

function ridge(p: Pen, l: Extract<Layer, { t: 'ridge' }>) {
  const { ctx, W, H } = p;
  const base = p.Y(l.y), amp = l.amp * H, f = l.freq ?? 3;
  const n = new Noise(hashKey(`r${l.seed ?? 1}`));
  const c = col(p, l.c, l.haze ?? 0);
  const pts: [number, number][] = [];
  for (let x = 0; x <= W; x += 5) { const t = x / W; pts.push([x, base - amp * (0.15 + 1.1 * n.fbm(t * f, 3.1, 5) ** 1.35)]) }
  ctx.beginPath(); ctx.moveTo(0, H);
  pts.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(W, H); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, base - amp, H, [[0, shade(c, 0.12)], [0.4, c], [1, shade(c, -0.35)]]);
  ctx.fill();
  ctx.strokeStyle = rgba(p.rim, 0.22); ctx.lineWidth = 1.2;
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  if (l.snow) { ctx.strokeStyle = 'rgba(220,235,255,0.5)'; ctx.lineWidth = 2.4; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + 1.5) : ctx.moveTo(x, y + 1.5))); ctx.stroke() }
}

function windowsAt(p: Pen, x: number, y: number, w: number, h: number, c: string, rng: Rng, density = 0.5) {
  const { ctx } = p;
  const cols = Math.max(1, Math.floor(w / 9)), rows = Math.max(1, Math.floor(h / 13));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if (rng() > density) continue;
    ctx.fillStyle = rgba(c, 0.5 + rng() * 0.5);
    ctx.fillRect(x + 4 + i * (w - 8) / cols, y + 6 + j * (h - 10) / rows, 2.6, 4.2);
  }
}

function skyline(p: Pen, l: Extract<Layer, { t: 'skyline' }>) {
  const { ctx, W, H } = p;
  const r = p.rng(l.seed ?? 5);
  const base = p.Y(l.y), mh = (l.h ?? 0.28) * H;
  const c = col(p, l.c, l.haze ?? 0);
  const dens = l.density ?? 1;
  const x0 = (l.x0 ?? 0) * W, x1 = (l.x1 ?? 1) * W;
  const win = l.windows;
  let x = x0 - 20;
  const dark = shade(c, -0.25);
  const rimc = rgba(p.rim, 0.28);
  while (x < x1) {
    const style = l.style;
    if (style === 'keep' || style === 'town' || style === 'lamp' || style === 'noon') {
      const bw = (style === 'town' ? 22 + r() * 34 : 30 + r() * 60) * (W / 1100);
      const tall = style === 'town' ? 0.25 + r() * 0.55 : 0.22 + r() * 0.78;
      const bh = mh * tall;
      const fill = vgrad(ctx, base - bh, base, [[0, shade(c, 0.1)], [1, dark]]);
      ctx.fillStyle = fill;
      const kind = r();
      if (style === 'lamp' && kind < 0.55) {
        // slender lamp-tower topped with a glowing lantern
        const tw = bw * 0.42;
        ctx.fillRect(x, base - bh, tw, bh + 4);
        poly(ctx, [[x - 3, base - bh], [x + tw / 2, base - bh - tw * 1.1], [x + tw + 3, base - bh]]); ctx.fill();
        if (win) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x + tw / 2, base - bh - tw * 0.45, 26, win, 0.9); ctx.globalCompositeOperation = 'source-over' }
        ctx.fillStyle = win ?? '#ffd8a0'; ctx.fillRect(x + tw / 2 - 2, base - bh - tw * 0.55, 4, 6);
        windowsAt(p, x, base - bh, tw, bh, win ?? '#ffcf90', r, 0.35);
      } else if (kind < 0.62 && style !== 'town') {
        // round tower with a cone roof
        const tw = bw * 0.7;
        ctx.fillRect(x, base - bh, tw, bh + 4);
        poly(ctx, [[x - 4, base - bh], [x + tw / 2, base - bh - tw * 1.2], [x + tw + 4, base - bh]]); ctx.fill();
        if (win) windowsAt(p, x, base - bh, tw, bh, win, r, 0.4);
      } else if (style === 'noon' && kind < 0.85) {
        // slender tower with a sun-disc finial
        const tw = bw * 0.38;
        ctx.fillRect(x, base - bh, tw, bh + 4);
        ctx.beginPath(); ctx.arc(x + tw / 2, base - bh - tw * 0.6, tw * 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = rgba(win ?? '#ffe08a', 0.9); ctx.lineWidth = 1.6; ctx.stroke();
      } else {
        ctx.fillRect(x, base - bh, bw, bh + 4);
        if (style === 'town' || kind < 0.8) { poly(ctx, [[x - 3, base - bh], [x + bw / 2, base - bh - bw * 0.55], [x + bw + 3, base - bh]]); ctx.fill() }
        else for (let k = 0; k < Math.floor(bw / 10); k++) ctx.fillRect(x + k * 10, base - bh - 5, 6, 6);
        if (win) windowsAt(p, x, base - bh, bw, bh, win, r, style === 'town' ? 0.45 : 0.3);
        if (style === 'town' && r() < 0.3) ctx.fillRect(x + bw * 0.7, base - bh - bw * 0.5 - 10, 4, 12);
      }
      ctx.strokeStyle = rimc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, base - bh); ctx.lineTo(x + bw, base - bh); ctx.stroke();
      x += bw * (0.6 + r() * 0.5) / dens;
    } else if (style === 'ruin') {
      const bw = 18 + r() * 50, bh = mh * (0.15 + r() * 0.8);
      ctx.fillStyle = vgrad(ctx, base - bh, base, [[0, shade(c, 0.08)], [1, dark]]);
      ctx.beginPath(); ctx.moveTo(x, base + 4);
      let yy = base - bh; ctx.lineTo(x, yy);
      for (let k = 1; k <= 5; k++) { yy = base - bh * (0.7 + r() * 0.3); ctx.lineTo(x + (bw * k) / 5, yy) }
      ctx.lineTo(x + bw, base + 4); ctx.closePath(); ctx.fill();
      if (r() < 0.4) { ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x + bw / 2, base - bh * 0.5, bw * 0.16, bw * 0.22, 0, Math.PI, 0); ctx.fill() }
      x += bw * (0.8 + r() * 0.9) / dens;
    } else if (style === 'cog') {
      const bw = 30 + r() * 70, bh = mh * (0.2 + r() * 0.7);
      ctx.fillStyle = vgrad(ctx, base - bh, base, [[0, shade(c, 0.08)], [1, dark]]);
      ctx.fillRect(x, base - bh, bw, bh + 4);
      const ch = r();
      if (ch < 0.5) { const cw = 7 + r() * 8; ctx.fillRect(x + bw * 0.6, base - bh - 40 - r() * 40, cw, 60); ctx.globalAlpha = 0.3; ctx.fillStyle = shade(c, 0.4); ctx.beginPath(); ctx.arc(x + bw * 0.6 + cw / 2, base - bh - 70, 16 + r() * 10, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = vgrad(ctx, base - bh, base, [[0, shade(c, 0.1)], [1, dark]]) }
      else { poly(ctx, [[x, base - bh], [x + bw / 2, base - bh - bw * 0.3], [x + bw, base - bh]]); ctx.fill() }
      if (win) windowsAt(p, x, base - bh, bw, bh, win, r, 0.3);
      x += bw * (0.7 + r() * 0.5) / dens;
    } else if (style === 'glass' || style === 'ice') {
      const bw = 14 + r() * 30, bh = mh * (0.3 + r() * 0.9);
      const lean = (r() - 0.5) * bw * 1.2;
      ctx.fillStyle = vgrad(ctx, base - bh, base, [[0, style === 'ice' ? '#bcd6ee' : shade(c, 0.4)], [0.5, c], [1, dark]]);
      poly(ctx, [[x, base + 4], [x + bw * 0.2 + lean, base - bh], [x + bw * 0.6 + lean, base - bh * 0.92], [x + bw, base + 4]]); ctx.fill();
      ctx.strokeStyle = rgba(p.rim, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + bw * 0.2 + lean, base - bh); ctx.lineTo(x, base + 4); ctx.stroke();
      x += bw * (0.3 + r() * 0.6) / dens;
    } else if (style === 'harbor') {
      const bw = 22 + r() * 40, bh = mh * (0.1 + r() * 0.5);
      ctx.fillStyle = vgrad(ctx, base - bh, base, [[0, shade(c, 0.1)], [1, dark]]);
      ctx.fillRect(x, base - bh, bw, bh + 4);
      poly(ctx, [[x - 2, base - bh], [x + bw / 2, base - bh - bw * 0.35], [x + bw + 2, base - bh]]); ctx.fill();
      if (r() < 0.5) { ctx.fillRect(x + bw * 0.5, base - bh - mh * 0.6, 2.5, mh * 0.6); ctx.beginPath(); ctx.moveTo(x + bw * 0.5, base - bh - mh * 0.55); ctx.lineTo(x + bw * 0.5 + 24, base - bh - mh * 0.2); ctx.lineTo(x + bw * 0.5, base - bh - mh * 0.2); ctx.fill() }
      if (win) windowsAt(p, x, base - bh, bw, bh, win, r, 0.4);
      x += bw * (0.8 + r() * 0.6) / dens;
    } else { // stilt houses
      const bw = 26 + r() * 30, bh = mh * (0.1 + r() * 0.3);
      ctx.fillStyle = dark;
      ctx.fillRect(x + 4, base - bh, 3, bh + 6); ctx.fillRect(x + bw - 7, base - bh, 3, bh + 6);
      ctx.fillStyle = vgrad(ctx, base - bh - 20, base - bh, [[0, shade(c, 0.1)], [1, c]]);
      ctx.fillRect(x, base - bh - 22, bw, 22);
      poly(ctx, [[x - 4, base - bh - 22], [x + bw / 2, base - bh - 40], [x + bw + 4, base - bh - 22]]); ctx.fill();
      if (win) { ctx.fillStyle = rgba(win, 0.9); ctx.fillRect(x + bw * 0.4, base - bh - 16, 5, 7) }
      x += bw * (1 + r() * 0.8) / dens;
    }
  }
  ctx.fillStyle = dark; ctx.fillRect(x0 - 20, base, x1 - x0 + 40, H - base);
}

function branch(ctx: CanvasRenderingContext2D, x: number, y: number, a: number, len: number, wid: number, depth: number, r: Rng) {
  if (depth <= 0 || len < 3) return;
  const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
  ctx.lineWidth = wid; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x2) / 2 + (r() - 0.5) * len * 0.3, (y + y2) / 2, x2, y2); ctx.stroke();
  const kids = depth > 2 ? 2 : r() < 0.7 ? 2 : 1;
  for (let k = 0; k < kids; k++) branch(ctx, x2, y2, a + (r() - 0.5) * 1.3 + (k ? 0.4 : -0.4), len * (0.62 + r() * 0.15), wid * 0.66, depth - 1, r);
}

function deadTrees(p: Pen, l: Extract<Layer, { t: 'dead' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 3);
  const c = col(p, l.c, l.haze ?? 0);
  ctx.strokeStyle = c; ctx.lineCap = 'round';
  for (let i = 0; i < l.n; i++) {
    const x = r() * W, h = p.H * l.h * (0.6 + r() * 0.6), y = p.Y(l.y) + r() * 8;
    branch(ctx, x, y, -Math.PI / 2 + (r() - 0.5) * 0.3, h * 0.38, Math.max(2, h * 0.045), 5, r);
    if (l.glow && r() < 0.5) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x + (r() - 0.5) * h * 0.4, y - h * (0.4 + r() * 0.5), 14 + r() * 10, l.glow, 0.5); ctx.globalCompositeOperation = 'source-over' }
  }
}

function pines(p: Pen, l: Extract<Layer, { t: 'pines' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 4);
  const c = col(p, l.c, l.haze ?? 0);
  for (let i = 0; i < l.n; i++) {
    const x = r() * W, h = p.H * l.h * (0.55 + r() * 0.7), y = p.Y(l.y) + r() * 10, w = h * 0.34;
    ctx.fillStyle = vgrad(ctx, y - h, y, [[0, shade(c, 0.1)], [1, shade(c, -0.25)]]);
    const tiers = 5;
    for (let t = 0; t < tiers; t++) {
      const ty = y - h * (t / tiers) * 0.9, tw = w * (1 - t / (tiers + 0.5));
      poly(ctx, [[x - tw, ty], [x, ty - h * 0.33], [x + tw, ty]]); ctx.fill();
    }
    ctx.fillRect(x - 2, y - 6, 4, 10);
    if (l.snow) { ctx.fillStyle = 'rgba(225,238,255,.35)'; for (let t = 0; t < tiers; t++) { const ty = y - h * (t / tiers) * 0.9, tw = w * (1 - t / (tiers + 0.5)); poly(ctx, [[x - tw * 0.55, ty - h * 0.1], [x, ty - h * 0.33], [x + tw * 0.55, ty - h * 0.1]]); ctx.fill() } }
  }
}

function columns(p: Pen, l: Extract<Layer, { t: 'columns' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 6);
  const c = col(p, l.c, l.haze ?? 0);
  const base = p.Y(l.y), h = p.H * l.h;
  const x0 = (l.x0 ?? 0) * W, x1 = (l.x1 ?? 1) * W;
  const cw = (l.w ?? 0.045) * W;
  const style = l.style ?? 'broken';
  for (let i = 0; i < l.n; i++) {
    const x = lerp(x0, x1, l.n === 1 ? 0.5 : i / (l.n - 1)) + (r() - 0.5) * cw * 1.3;
    const ch = style === 'broken' ? h * (0.3 + r() * 0.8) : h * (0.9 + r() * 0.1);
    ctx.fillStyle = vgrad(ctx, base - ch, base, [[0, shade(c, 0.12)], [0.5, c], [1, shade(c, -0.3)]]);
    ctx.beginPath(); ctx.moveTo(x - cw / 2, base);
    ctx.lineTo(x - cw / 2, base - ch);
    if (style === 'broken') { ctx.lineTo(x - cw * 0.2, base - ch - 5 - r() * 9); ctx.lineTo(x + cw * 0.1, base - ch + 4); ctx.lineTo(x + cw / 2, base - ch - r() * 12) }
    else { ctx.lineTo(x + cw / 2, base - ch) }
    ctx.lineTo(x + cw / 2, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(c, 0.05); ctx.fillRect(x - cw * 0.7, base - 6, cw * 1.4, 8);
    if (style !== 'broken') ctx.fillRect(x - cw * 0.65, base - ch - 5, cw * 1.3, 8);
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(x + cw * 0.12, base - ch, cw * 0.22, ch);
    if (style === 'arch' && i < l.n - 1) {
      const nx = lerp(x0, x1, (i + 1) / (l.n - 1));
      const ax = (x + nx) / 2, rx = (nx - x) / 2 - cw / 2;
      ctx.strokeStyle = c; ctx.lineWidth = cw * 0.55; ctx.beginPath(); ctx.ellipse(ax, base - ch, Math.max(8, rx), Math.max(12, rx * 0.8), 0, Math.PI, 0); ctx.stroke();
    }
  }
}

function ribs(p: Pen, l: Extract<Layer, { t: 'ribs' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 7);
  const c = col(p, l.c, l.haze ?? 0);
  const base = p.Y(l.y), h = p.H * l.h;
  ctx.lineCap = 'round';
  for (let i = 0; i < l.n; i++) {
    const x = (i + 0.5) / l.n * W + (r() - 0.5) * 30, side = r() < 0.5 ? -1 : 1, hh = h * (0.7 + r() * 0.5), wd = hh * (0.35 + r() * 0.25);
    const wid = 10 + hh * 0.05;
    ctx.strokeStyle = vgrad(ctx, base - hh, base, [[0, shade(c, 0.22)], [1, shade(c, -0.15)]]);
    ctx.lineWidth = wid;
    ctx.beginPath(); ctx.moveTo(x, base + 6); ctx.bezierCurveTo(x + side * wd * 0.2, base - hh * 0.6, x + side * wd * 0.9, base - hh * 1.02, x + side * wd * 1.6, base - hh * 0.78); ctx.stroke();
    ctx.lineWidth = wid * 0.35; ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.moveTo(x + 2, base); ctx.bezierCurveTo(x + side * wd * 0.2 + 2, base - hh * 0.6, x + side * wd * 0.9 + 2, base - hh * 1.0, x + side * wd * 1.6, base - hh * 0.78); ctx.stroke();
  }
}

function dunes(p: Pen, l: Extract<Layer, { t: 'dunes' }>) {
  const { ctx, W, H } = p;
  const c = col(p, l.c, l.haze ?? 0);
  const n = new Noise(hashKey(`d${l.seed ?? 2}`));
  const base = p.Y(l.y), amp = l.amp * H;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) ctx.lineTo(x, base - amp * (0.3 + Math.abs(Math.sin(x / W * 5 + n.n1(x / 140) * 3)) * n.n1(x / 260 + 5)));
  ctx.lineTo(W, H); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, base - amp, H, [[0, shade(c, 0.15)], [0.5, c], [1, shade(c, -0.3)]]);
  ctx.fill();
}

function spires(p: Pen, l: Extract<Layer, { t: 'spires' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 8);
  const c = col(p, l.c, l.haze ?? 0);
  const base = p.Y(l.y);
  for (let i = 0; i < l.n; i++) {
    const x = r() * W, h = p.H * l.h * (0.35 + r() * 0.9), w = h * (0.1 + r() * 0.1), lean = (r() - 0.5) * w * 3;
    const g = vgrad(ctx, base - h, base, [[0, l.style === 'ice' ? '#d4e8fa' : shade(l.rim, -0.1)], [0.35, c], [1, shade(c, -0.4)]]);
    ctx.fillStyle = g;
    poly(ctx, [[x - w, base + 4], [x - w * 0.3 + lean, base - h * 0.7], [x + lean, base - h], [x + w * 0.45 + lean, base - h * 0.62], [x + w, base + 4]]); ctx.fill();
    ctx.strokeStyle = rgba(l.rim, 0.6); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(x - w, base + 4); ctx.lineTo(x - w * 0.3 + lean, base - h * 0.7); ctx.lineTo(x + lean, base - h); ctx.stroke();
    if (l.style !== 'rock') { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x + lean, base - h * 0.9, w * 2.2, l.rim, 0.25); ctx.globalCompositeOperation = 'source-over' }
  }
}

function stalactites(p: Pen, l: Extract<Layer, { t: 'stalactites' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 9);
  ctx.fillStyle = l.c;
  ctx.fillRect(0, 0, W, p.H * 0.06);
  for (let i = 0; i < l.n; i++) {
    const x = (i + r()) / l.n * W, h = p.H * l.h * (0.2 + r() * 0.9), w = 8 + r() * 30;
    ctx.fillStyle = vgrad(ctx, 0, h, [[0, l.c], [1, shade(l.c, 0.18)]]);
    poly(ctx, [[x - w, 0], [x + w, 0], [x + (r() - 0.5) * 6, h]]); ctx.fill();
  }
}

function shrooms(p: Pen, l: Extract<Layer, { t: 'shrooms' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 10);
  const base = p.Y(l.y);
  for (let i = 0; i < l.n; i++) {
    const x = r() * W, h = p.H * l.h * (0.3 + r() * 0.9), cw = h * (0.35 + r() * 0.3);
    ctx.fillStyle = shade(l.c, -0.2);
    ctx.beginPath(); ctx.moveTo(x - h * 0.06, base + 4); ctx.quadraticCurveTo(x - h * 0.03, base - h * 0.5, x, base - h); ctx.lineTo(x + h * 0.03, base - h); ctx.quadraticCurveTo(x + h * 0.04, base - h * 0.5, x + h * 0.08, base + 4); ctx.fill();
    ctx.fillStyle = vgrad(ctx, base - h - cw * 0.5, base - h, [[0, shade(l.c, 0.15)], [1, l.c]]);
    ctx.beginPath(); ctx.ellipse(x, base - h, cw, cw * 0.5, 0, Math.PI, 0); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, base - h, cw * 1.6, l.glow, 0.45); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgba(l.glow, 0.85);
    for (let k = 0; k < 4; k++) ctx.fillRect(x - cw * 0.7 + r() * cw * 1.4, base - h - cw * (0.1 + r() * 0.28), 2.4, 2.4);
  }
}

function kelp(p: Pen, l: Extract<Layer, { t: 'kelp' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 11);
  const base = p.Y(l.y);
  ctx.lineCap = 'round';
  for (let i = 0; i < l.n; i++) {
    const x = r() * W, h = p.H * l.h * (0.4 + r() * 0.8), ph = r() * 6;
    ctx.strokeStyle = l.c; ctx.lineWidth = 3 + r() * 5;
    ctx.beginPath(); ctx.moveTo(x, base + 6);
    for (let t = 0; t <= 1; t += 0.1) ctx.lineTo(x + Math.sin(t * 5 + ph) * 12 * t, base - h * t);
    ctx.stroke();
  }
}

function thornsLayer(p: Pen, l: Extract<Layer, { t: 'thorns' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 12);
  const base = p.Y(l.y);
  ctx.strokeStyle = l.c; ctx.lineCap = 'round';
  for (let i = 0; i < l.n; i++) {
    let x = r() * W, y = base + 6;
    const h = p.H * l.h * (0.4 + r() * 0.9);
    ctx.lineWidth = 3 + r() * 4;
    ctx.beginPath(); ctx.moveTo(x, y);
    let a = -Math.PI / 2 + (r() - 0.5) * 0.8;
    const steps = 9;
    for (let s = 0; s < steps; s++) {
      a += (r() - 0.5) * 1.1;
      x += Math.cos(a) * h / steps * 1.2; y += Math.sin(a) * h / steps * 1.2;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = l.c;
    for (let s = 0; s < 6; s++) { const tx = x - (r() - 0.5) * 60, ty = y + r() * h * 0.5; poly(ctx, [[tx, ty], [tx + 5, ty - 14], [tx + 9, ty + 2]]); ctx.fill() }
  }
}

function cogs(p: Pen, l: Extract<Layer, { t: 'cogs' }>) {
  const { ctx, W } = p;
  const r = p.rng(l.seed ?? 13);
  for (let i = 0; i < l.n; i++) {
    const x = r() * W, y = p.Y(l.y) + (r() - 0.5) * p.H * 0.4, R = l.r * p.H * (0.4 + r() * 0.8), teeth = 12 + Math.floor(r() * 8);
    ctx.fillStyle = l.c; ctx.beginPath();
    for (let k = 0; k < teeth * 2; k++) { const a = (k / (teeth * 2)) * Math.PI * 2, rr = k % 2 ? R * 0.86 : R; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) }
    ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x, y, R * 0.28, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * R * 0.55, y + Math.sin(a) * R * 0.55, R * 0.12, R * 0.18, a, 0, Math.PI * 2); ctx.fill() }
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = rgba(p.rim, 0.25); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, R * 0.96, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
  }
}

function pillars(p: Pen, l: Extract<Layer, { t: 'pillars' }>) {
  const { ctx, W, H } = p;
  const r = p.rng(l.seed ?? 14);
  for (let i = 0; i < l.n; i++) {
    const side = i % 2 ? 1 : -1;
    const depth = Math.floor(i / 2) / Math.max(1, Math.floor(l.n / 2));
    const x = W / 2 + side * (W * (0.17 + depth * 0.3)) + (r() - 0.5) * 8;
    const w = W * l.w * (1 - depth * 0.55);
    ctx.fillStyle = vgrad(ctx, 0, H, [[0, shade(l.c, -0.1)], [0.5, l.c], [1, shade(l.c, -0.4)]]);
    ctx.fillRect(x - w / 2, 0, w, H);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x + (side < 0 ? w * 0.15 : -w * 0.45), 0, w * 0.3, H);
    ctx.fillStyle = shade(l.c, 0.06); ctx.fillRect(x - w * 0.7, H * 0.86, w * 1.4, H * 0.14);
  }
}

function tower(p: Pen, l: Extract<Layer, { t: 'tower' }>) {
  const { ctx, W, H } = p;
  const x = l.x * W, base = l.y * H, w = l.w * W, h = l.h * H;
  ctx.fillStyle = vgrad(ctx, base - h, base, [[0, shade(l.c, 0.12)], [1, shade(l.c, -0.3)]]);
  ctx.fillRect(x - w / 2, base - h, w, h);
  if (l.roof === 'cone') poly(ctx, [[x - w / 2 - 6, base - h], [x, base - h - w * 1.15], [x + w / 2 + 6, base - h]]);
  else if (l.roof === 'lamp') { poly(ctx, [[x - w / 2 - 4, base - h], [x - w * 0.2, base - h - w * 0.5], [x + w * 0.2, base - h - w * 0.5], [x + w / 2 + 4, base - h]]); ctx.fill(); ctx.fillRect(x - 3, base - h - w * 0.5 - 18, 6, 18); if (l.lit) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, base - h - w * 0.5 - 24, w * 1.6, l.lit, 0.9); ctx.globalCompositeOperation = 'source-over' } }
  else { for (let k = 0; k < Math.floor(w / 12); k++) ctx.fillRect(x - w / 2 + k * 12, base - h - 7, 7, 8) }
  ctx.fill();
  if (l.lit) {
    for (let k = 0; k < 6; k++) { ctx.fillStyle = rgba(l.lit, 0.4 + (k % 3) * 0.2); ctx.fillRect(x - w * 0.15 + (k % 2) * w * 0.12, base - h * (0.2 + k * 0.12), 4, 9) }
  }
}

function ship(p: Pen, l: Extract<Layer, { t: 'ship' }>) {
  const { ctx, W, H } = p;
  const x = l.x * W, y = l.y * H, s = l.s * H;
  ctx.fillStyle = l.c;
  ctx.beginPath(); ctx.moveTo(x - s * 0.9, y - s * 0.12); ctx.quadraticCurveTo(x - s * 0.55, y + s * 0.18, x, y + s * 0.2); ctx.quadraticCurveTo(x + s * 0.6, y + s * 0.16, x + s * 0.95, y - s * 0.2); ctx.lineTo(x + s * 0.8, y - s * 0.12); ctx.lineTo(x - s * 0.9, y - s * 0.12); ctx.fill();
  for (const mx of [-0.3, 0.15, 0.55]) {
    const mh = s * (1.1 - Math.abs(mx) * 0.4);
    ctx.fillRect(x + mx * s - 1.5, y - s * 0.12 - mh, 3, mh);
    ctx.globalAlpha = l.ghost ? 0.45 : 0.9;
    ctx.beginPath(); ctx.moveTo(x + mx * s, y - s * 0.12 - mh * 0.92); ctx.quadraticCurveTo(x + mx * s + s * 0.34, y - s * 0.12 - mh * 0.55, x + mx * s + s * 0.02, y - s * 0.12 - mh * 0.15); ctx.lineTo(x + mx * s, y - s * 0.12 - mh * 0.15); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (l.ghost) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - s * 0.2, s * 1.4, '#79e0c8', 0.28); ctx.globalCompositeOperation = 'source-over' }
}

function banner(p: Pen, l: Extract<Layer, { t: 'banner' }>) {
  const { ctx, W, H } = p;
  const x = l.x * W, y = l.y * H, h = l.h * H;
  ctx.fillStyle = shade(l.c, -0.45); ctx.fillRect(x - 1.5, y - h * 0.2, 3, h * 1.25);
  ctx.fillStyle = l.c;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + h * 0.25, y + h * 0.1, x + h * 0.15, y + h * 0.5, x + h * 0.32, y + h * 0.62);
  ctx.lineTo(x + h * 0.26, y + h * 0.78); ctx.lineTo(x + h * 0.14, y + h * 0.7); ctx.lineTo(x + h * 0.1, y + h * 0.82); ctx.lineTo(x, y + h * 0.7); ctx.closePath(); ctx.fill();
}

function hang(p: Pen, l: Extract<Layer, { t: 'hang' }>) {
  const { ctx, W, H } = p;
  const r = p.rng(l.seed ?? 15);
  for (let i = 0; i < l.n; i++) {
    const x = (i + 0.5 + (r() - 0.5) * 0.4) / l.n * W, len = H * (0.12 + r() * 0.2);
    ctx.strokeStyle = l.c; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, len); ctx.stroke();
    ctx.fillStyle = l.c; ctx.fillRect(x - 5, len, 10, 14);
    ctx.fillStyle = rgba(l.glow, 0.95); ctx.fillRect(x - 3, len + 3, 6, 8);
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, len + 8, 46, l.glow, 0.55); ctx.globalCompositeOperation = 'source-over';
  }
}

function stairs(p: Pen, l: Extract<Layer, { t: 'stairs' }>) {
  const { ctx, W, H } = p;
  const x = l.x * W, y = l.y * H, w = l.w * W;
  for (let i = 0; i < l.steps; i++) {
    const t = i / l.steps, sw = w * (1 - t * 0.55), sy = y - t * H * 0.34;
    ctx.fillStyle = mix(l.c, '#000000', 0.15 + t * 0.35);
    ctx.fillRect(x - sw / 2, sy, sw, H * 0.34 / l.steps + 1.5);
    ctx.fillStyle = rgba(p.rim, 0.12 * (1 - t)); ctx.fillRect(x - sw / 2, sy, sw, 1.4);
  }
}

function throne(p: Pen, l: Extract<Layer, { t: 'throne' }>) {
  const { ctx, W, H } = p;
  const x = l.x * W, y = l.y * H, s = l.s * H;
  if (l.glow) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - s * 0.7, s * 1.5, l.glow, 0.45); ctx.globalCompositeOperation = 'source-over' }
  ctx.fillStyle = l.c;
  poly(ctx, [[x - s * 0.34, y], [x - s * 0.34, y - s * 1.0], [x - s * 0.2, y - s * 1.28], [x - s * 0.1, y - s * 1.0], [x, y - s * 1.45], [x + s * 0.1, y - s * 1.0], [x + s * 0.2, y - s * 1.28], [x + s * 0.34, y - s * 1.0], [x + s * 0.34, y]]); ctx.fill();
  ctx.fillStyle = shade(l.c, -0.3); ctx.fillRect(x - s * 0.22, y - s * 0.62, s * 0.44, s * 0.62);
  ctx.fillStyle = shade(l.c, 0.08); ctx.fillRect(x - s * 0.4, y - s * 0.34, s * 0.16, s * 0.34); ctx.fillRect(x + s * 0.24, y - s * 0.34, s * 0.16, s * 0.34);
}

function ground(p: Pen, l: Extract<Layer, { t: 'ground' }>) {
  const { ctx, W, H } = p;
  const y = p.Y(l.y);
  ctx.fillStyle = vgrad(ctx, y, H, [[0, l.c], [1, l.c2 ?? shade(l.c, -0.5)]]);
  ctx.fillRect(0, y, W, H - y);
  const r = p.rng(l.seed ?? 21);
  for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.2})`; const gy = y + Math.pow(r(), 1.6) * (H - y); ctx.fillRect(r() * W, gy, 6 + r() * 30, 1 + (gy - y) / (H - y) * 3) }
  if (l.road) {
    const rc = l.roadC ?? shade(l.c, 0.12);
    ctx.fillStyle = rgba(rc, 0.55);
    poly(ctx, [[W * 0.46, y], [W * 0.54, y], [W * 0.82, H], [W * 0.18, H]]); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.22)';
    for (let k = 0; k < 9; k++) { const t = (k + 1) / 10, yy = y + (H - y) * t * t; ctx.beginPath(); ctx.moveTo(lerp(W * 0.46, W * 0.18, t * t), yy); ctx.lineTo(lerp(W * 0.54, W * 0.82, t * t), yy); ctx.stroke() }
  }
  if (l.puddles) {
    for (let i = 0; i < 9; i++) { const t = r(); const yy = y + (H - y) * (0.2 + t * 0.75); ctx.fillStyle = rgba(l.puddles, 0.14 + r() * 0.2); ctx.beginPath(); ctx.ellipse(r() * W, yy, 30 + t * 120, 4 + t * 12, 0, 0, Math.PI * 2); ctx.fill() }
  }
}

function crowd(p: Pen, l: Extract<Layer, { t: 'crowd' }>) {
  const r = p.rng(l.seed ?? 31);
  for (let i = 0; i < l.n; i++) {
    const x = r() * p.W, s = l.s * p.H * (0.7 + r() * 0.6), y = p.Y(l.y) + r() * p.H * 0.08;
    drawFigure(p.ctx, { x, y, h: s, look: r() < 0.5 ? 'hood' : 'veil', c: mix(l.c, '#000', r() * 0.4), back: r() < 0.6, rim: p.rim, sway: r() });
  }
}

function drawLayer(p: Pen, l: Layer) {
  switch (l.t) {
    case 'ridge': ridge(p, l); break;
    case 'skyline': skyline(p, l); break;
    case 'pines': pines(p, l); break;
    case 'dead': deadTrees(p, l); break;
    case 'columns': columns(p, l); break;
    case 'ribs': ribs(p, l); break;
    case 'dunes': dunes(p, l); break;
    case 'spires': spires(p, l); break;
    case 'stalactites': stalactites(p, l); break;
    case 'shrooms': shrooms(p, l); break;
    case 'kelp': kelp(p, l); break;
    case 'thorns': thornsLayer(p, l); break;
    case 'cogs': cogs(p, l); break;
    case 'pillars': pillars(p, l); break;
    case 'tower': tower(p, l); break;
    case 'ship': ship(p, l); break;
    case 'banner': banner(p, l); break;
    case 'hang': hang(p, l); break;
    case 'stairs': stairs(p, l); break;
    case 'throne': throne(p, l); break;
    case 'ground': ground(p, l); break;
    case 'crowd': crowd(p, l); break;
    case 'motif': drawMotif(p.ctx, l.key, p.W, p.H, l.accent, l.dark, p.rng(3)() * 1000 | 0); break;
    case 'figure': drawFigure(p.ctx, { x: l.x * p.W, y: l.y * p.H, h: l.s * p.H, look: l.look ?? 'hood', c: l.c, lantern: l.lantern, weapon: l.weapon, flip: l.flip, back: l.back ?? true, rim: l.rim ?? p.rim, accent: l.accent }); break;
  }
}

function fogTexture(w: number, h: number, c: string, a: number, seed: number) {
  const cv = makeCanvas(w, h);
  const ctx = ctxOf(cv);
  const r = rngOf(seed);
  for (let i = 0; i < 26; i++) {
    const x = r() * w, y = h * (0.25 + r() * 0.5), rx = w * (0.08 + r() * 0.16), ry = h * (0.18 + r() * 0.3);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, rgba(c, a * (0.5 + r() * 0.5))); g.addColorStop(1, rgba(c, 0));
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
    ctx.fillStyle = g; ctx.fillRect(x - rx, y - rx, rx * 2, rx * 2); ctx.restore();
  }
  return cv;
}

let grainTile: HTMLCanvasElement | null = null;
function grain(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const cv = makeCanvas(160, 160);
  const ctx = ctxOf(cv);
  const img = ctx.createImageData(160, 160);
  const r = rngOf(77);
  for (let i = 0; i < 160 * 160; i++) { const v = Math.floor(r() * 255); img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255 }
  ctx.putImageData(img, 0, 0);
  return (grainTile = cv);
}

// ------------------------------------------------------------- the renderer
export function renderScene(spec: SceneSpec, W: number, H: number): SceneBitmaps {
  const rngTop = rngOf(spec.seed);
  const sky = makeCanvas(W, H);
  paintSky(ctxOf(sky), spec, W, H, rngTop);
  const clouds = paintClouds(spec, W, H, spec.seed);
  const wideW = Math.round(W * WIDE);
  const rimC = spec.sky.body?.corona ?? spec.sky.body?.c ?? spec.sky.glow?.c ?? '#ffffff';
  const haze = spec.sky.low;
  const mk = (layers: Layer[] | undefined, seed: number): HTMLCanvasElement => {
    const cv = makeCanvas(wideW, H);
    const ctx = ctxOf(cv);
    const pen: Pen = { ctx, W: wideW, H, X: x => x * wideW, Y: y => y * H, haze, noise: new Noise(spec.seed + seed), rng: s => rngOf(spec.seed * 31 + (s ?? 1) * 977 + seed), rim: rimC };
    layers?.forEach(l => drawLayer(pen, l));
    return cv;
  };
  const far = mk(spec.far, 1);
  const mid = mk(spec.mid, 2);
  const near = mk(spec.near, 3);
  if (spec.water) {
    const wc = ctxOf(near);
    const wy = spec.water.y * H;
    // reflect the far + mid layers, then lay the water tint over it
    const refl = makeCanvas(wideW, H - wy);
    const rc = ctxOf(refl);
    rc.save(); rc.translate(0, H - wy); rc.scale(1, -1);
    rc.drawImage(far, 0, -(2 * wy - H) - 0, wideW, H); rc.drawImage(mid, 0, -(2 * wy - H), wideW, H);
    rc.restore();
    // simplest convincing reflection: mirror around the waterline
    wc.save();
    wc.beginPath(); wc.rect(0, wy, wideW, H - wy); wc.clip();
    wc.globalAlpha = spec.water.reflect ?? 0.5;
    wc.translate(0, 2 * wy); wc.scale(1, -1);
    wc.drawImage(far, 0, 0); wc.drawImage(mid, 0, 0);
    wc.restore();
    wc.fillStyle = vgrad(wc, wy, H, [[0, rgba(spec.water.c1, 0.55)], [1, rgba(spec.water.c2, 0.92)]]);
    wc.fillRect(0, wy, wideW, H - wy);
    const rr = rngOf(spec.seed + 5);
    for (let i = 0; i < 90; i++) { wc.fillStyle = rgba(rimC, 0.04 + rr() * 0.12); const yy = wy + Math.pow(rr(), 1.5) * (H - wy); wc.fillRect(rr() * wideW, yy, 20 + rr() * 90, 1 + (yy - wy) / (H - wy) * 2) }
  }
  const fogs = (spec.fog ?? []).map((f, i) => fogTexture(Math.round(W * 1.5), Math.round(H * f.h), f.c, f.a, spec.seed + i * 13));
  const vig = makeCanvas(W, H);
  const vc = ctxOf(vig);
  const vs = spec.grade?.vignette ?? 0.7;
  vc.fillStyle = rgrad(vc, W / 2, H * 0.5, Math.min(W, H) * 0.3, Math.max(W, H) * 0.78, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${vs})`]]);
  vc.fillRect(0, 0, W, H);
  return { w: W, h: H, sky, clouds, far, mid, near, fogs, vig, grain: grain(), wide: wideW };
}

// ----------------------------------------------------------- the animated view
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; ph: number }

export class SceneView {
  private bm: SceneBitmaps;
  private t = 0;
  private parts: Part[] = [];
  private flash = 0;
  private nextFlash = 3 + Math.random() * 6;
  camera = { zoom: 1.04, x: 0, y: 0 };
  /** Optional camera move: from → to over `dur` seconds (used by the cinematic). */
  move: { z0: number; z1: number; x0: number; x1: number; y0: number; y1: number; dur: number } | null = null;
  readonly cv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  constructor(public spec: SceneSpec, public w: number, public h: number, cv?: HTMLCanvasElement) {
    this.cv = cv ?? makeCanvas(w, h);
    this.cv.width = w; this.cv.height = h;
    this.ctx = ctxOf(this.cv);
    this.bm = renderScene(spec, w, h);
    const n = spec.particles?.n ?? 0;
    for (let i = 0; i < n; i++) this.parts.push(this.spawn(true));
  }
  private spawn(init: boolean): Part {
    const k = this.spec.particles!.kind, r = Math.random;
    const p: Part = { x: r() * this.w, y: init ? r() * this.h : -6, vx: 0, vy: 0, life: init ? r() * 5 : 0, max: 4 + r() * 5, s: 1 + r() * 2, ph: r() * 6 };
    switch (k) {
      case 'embers': case 'sparks': p.y = init ? r() * this.h : this.h + 6; p.vx = (r() - 0.35) * 22; p.vy = -(18 + r() * 38); p.s = 1 + r() * 2.2; break;
      case 'snow': p.vx = 10 + r() * 14; p.vy = 22 + r() * 34; p.s = 1 + r() * 2.2; break;
      case 'rain': p.vx = -40; p.vy = 520 + r() * 120; p.s = 1; p.max = 1.4; break;
      case 'ash': p.vx = 8 + r() * 12; p.vy = 12 + r() * 20; break;
      case 'drips': p.vy = 120 + r() * 80; p.s = 1; break;
      case 'spores': case 'motes': p.y = r() * this.h; p.vx = (r() - 0.5) * 9; p.vy = -(3 + r() * 8); p.s = 1.2 + r() * 2.4; break;
      default: p.y = r() * this.h; p.vx = (r() - 0.5) * 7; p.vy = -(1 + r() * 4); p.s = 0.8 + r() * 1.6;
    }
    return p;
  }

  /** Restart the clock (camera move + animation) when a view is reused. */
  reset() { this.t = 0 }

  draw(dt: number) {
    this.t += dt;
    const { ctx, w, h, bm, spec } = this;
    if (this.move) {
      const m = this.move, k = clamp(this.t / m.dur), e = k * k * (3 - 2 * k);
      this.camera.zoom = lerp(m.z0, m.z1, e); this.camera.x = lerp(m.x0, m.x1, e); this.camera.y = lerp(m.y0, m.y1, e);
    } else { this.camera.zoom = 1.045 + Math.sin(this.t * 0.12) * 0.012; this.camera.x = Math.sin(this.t * 0.16) * 0.012; this.camera.y = 0 }
    const cam = this.camera;
    const depth = spec.depth ?? 1;
    ctx.save();
    ctx.translate(w / 2, h / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-w / 2, -h / 2);
    ctx.drawImage(bm.sky, -cam.x * w * 0.08 * depth, cam.y * h * 0.1, w, h);
    if (bm.clouds) { const cw = bm.clouds.width, ox = -((this.t * 3.2) % cw) - cam.x * w * 0.1; ctx.drawImage(bm.clouds, ox, 0, cw, h); ctx.drawImage(bm.clouds, ox + cw - 1, 0, cw, h) }
    const off = (k: number) => -(bm.wide - w) / 2 - cam.x * w * k * depth;
    ctx.drawImage(bm.far, off(0.18), cam.y * h * 0.06, bm.wide, h);
    spec.fog?.forEach((f, i) => { if (i !== 0) return; this.fog(i, f, 0.25) });
    ctx.drawImage(bm.mid, off(0.4), cam.y * h * 0.03, bm.wide, h);
    spec.fog?.forEach((f, i) => { if (i === 0) return; this.fog(i, f, 0.5 + i * 0.2) });
    ctx.drawImage(bm.near, off(0.8), 0, bm.wide, h);
    ctx.restore();
    // animated glows
    ctx.globalCompositeOperation = 'lighter';
    spec.lights?.forEach((l, i) => {
      const f = 1 + (l.flicker ?? 0.12) * (Math.sin(this.t * (7 + i) + i * 3) * 0.6 + Math.sin(this.t * 13.7 + i) * 0.4);
      const x = l.x * w - cam.x * w * 0.3, y = l.y * h;
      const g = ctx.createRadialGradient(x, y, 0, x, y, l.r * w * f);
      g.addColorStop(0, rgba(l.c, (l.a ?? 0.5) * f)); g.addColorStop(1, rgba(l.c, 0));
      ctx.fillStyle = g; ctx.fillRect(x - l.r * w * 1.2, y - l.r * w * 1.2, l.r * w * 2.4, l.r * w * 2.4);
    });
    ctx.globalCompositeOperation = 'source-over';
    if (spec.particles) this.particles(dt);
    if (spec.lightning) {
      this.nextFlash -= dt;
      if (this.nextFlash < 0) { this.flash = 1; this.nextFlash = 4 + Math.random() * 9 }
      if (this.flash > 0) { ctx.fillStyle = `rgba(200,210,255,${this.flash * 0.35})`; ctx.fillRect(0, 0, w, h); this.flash = Math.max(0, this.flash - dt * 3.2) }
    }
    const g = spec.grade;
    if (g?.tint) { ctx.fillStyle = rgba(g.tint, g.a ?? 0.12); ctx.fillRect(0, 0, w, h) }
    ctx.drawImage(bm.vig, 0, 0);
    const gr = g?.grain ?? 0.07;
    if (gr > 0) {
      ctx.globalAlpha = gr; ctx.globalCompositeOperation = 'overlay';
      const gx = Math.floor(Math.random() * 40), gy = Math.floor(Math.random() * 40);
      ctx.fillStyle = ctx.createPattern(bm.grain, 'repeat')!;
      ctx.save(); ctx.translate(-gx, -gy); ctx.fillRect(0, 0, w + 40, h + 40); ctx.restore();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
  }

  private fog(i: number, f: NonNullable<SceneSpec['fog']>[number], par: number) {
    const tex = this.bm.fogs[i];
    if (!tex) return;
    const { ctx, w, h } = this;
    const speed = f.speed ?? 6;
    const tw = tex.width, ox = -((this.t * speed) % tw) - this.camera.x * w * par;
    const y = f.y * h - tex.height / 2;
    ctx.drawImage(tex, ox, y); ctx.drawImage(tex, ox + tw - 1, y);
    ctx.drawImage(tex, ox + tw * 2 - 2, y);
  }

  private particles(dt: number) {
    const { ctx, w, h } = this;
    const cfg = this.spec.particles!;
    const kind = cfg.kind;
    const col = cfg.c ?? ({ embers: '#ff9a4a', sparks: '#ffe6a0', snow: '#eef6ff', rain: '#a8c8e8', ash: '#bdb3a8', motes: '#ffe9a8', spores: '#b8f090', dust: '#d8c8a8', drips: '#8fd8e8' } as Record<string, string>)[kind];
    this.parts.forEach((p, i) => {
      p.life += dt; p.x += (p.vx + Math.sin(this.t * 0.9 + p.ph) * (kind === 'snow' || kind === 'ash' ? 8 : 4)) * dt; p.y += p.vy * dt;
      if (p.y < -12 || p.y > h + 12 || p.x > w + 12 || p.x < -12 || p.life > p.max + 4) this.parts[i] = this.spawn(false);
      const a = clamp(Math.min(p.life * 1.5, (p.max - p.life) * 0.7 + 0.5)) * (kind === 'snow' ? 0.85 : 0.7);
      if (kind === 'rain') { ctx.strokeStyle = rgba(col, 0.28); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 3, p.y - 13); ctx.stroke() }
      else if (kind === 'drips') { ctx.fillStyle = rgba(col, 0.5); ctx.fillRect(p.x, p.y, 1.2, 6) }
      else {
        ctx.fillStyle = rgba(col, Math.max(0, a));
        if (kind === 'embers' || kind === 'sparks' || kind === 'motes' || kind === 'spores') { ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over' }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill() }
      }
    });
  }
}

/** Composite a still frame of a scene (for thumbnails / tests). */
export function stillOf(spec: SceneSpec, w: number, h: number): HTMLCanvasElement {
  const v = new SceneView(spec, w, h);
  v.draw(0.016);
  return v.cv;
}
