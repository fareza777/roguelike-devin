import { glow, hashKey, lerp, mix, rgba, rngOf, shade, vgrad } from './util';

/** Every figure in Dreadmarch is faceless: the face is always a dark hood, a blank mask, a veil or a closed helm. */
export type Look = 'hood' | 'mask' | 'veil' | 'helm' | 'cowl' | 'hat' | 'crown' | 'goggles' | 'plague' | 'bell';
export interface FigureSpec {
  x: number; y: number; h: number; look: Look; c: string;
  lantern?: string; weapon?: 'blade' | 'staff' | 'banner' | 'bow' | 'bell' | 'none'; flip?: boolean; back?: boolean; rim?: string; accent?: string; sway?: number;
}

/** Foot-centred cloaked silhouette. */
export function drawFigure(ctx: CanvasRenderingContext2D, f: FigureSpec) {
  const { x, y, h } = f;
  const u = h;
  const dir = f.flip ? -1 : 1;
  const sway = (f.sway ?? 0.3) * 0.03 * u;
  const body = f.c;
  const dark = shade(body, -0.55);
  const rim = f.rim ?? '#ffffff';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.ellipse(0, 2, u * 0.26, u * 0.035, 0, 0, Math.PI * 2); ctx.fill();

  // weapon behind the body
  if (f.weapon === 'staff') {
    ctx.strokeStyle = shade(body, -0.2); ctx.lineWidth = Math.max(2, u * 0.014);
    ctx.beginPath(); ctx.moveTo(u * 0.3, 0); ctx.lineTo(u * 0.28, -u * 1.08); ctx.stroke();
    if (f.accent) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, u * 0.28, -u * 1.1, u * 0.22, f.accent, 0.8); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = f.accent; ctx.beginPath(); ctx.arc(u * 0.28, -u * 1.1, u * 0.03, 0, Math.PI * 2); ctx.fill() }
  } else if (f.weapon === 'banner') {
    ctx.strokeStyle = shade(body, -0.2); ctx.lineWidth = Math.max(2, u * 0.012);
    ctx.beginPath(); ctx.moveTo(u * 0.3, 0); ctx.lineTo(u * 0.3, -u * 1.25); ctx.stroke();
    ctx.fillStyle = f.accent ?? '#8a2a22';
    ctx.beginPath(); ctx.moveTo(u * 0.3, -u * 1.22); ctx.bezierCurveTo(u * 0.5, -u * 1.2, u * 0.45, -u * 1.0, u * 0.62, -u * 0.98); ctx.lineTo(u * 0.3, -u * 0.8); ctx.fill();
  }

  // cloak
  const g = vgrad(ctx, -u, 0, [[0, shade(body, 0.08)], [0.5, body], [1, dark]]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -u);
  ctx.bezierCurveTo(-u * 0.07, -u * 0.99, -u * 0.12, -u * 0.95, -u * 0.12, -u * 0.89);
  ctx.bezierCurveTo(-u * 0.12, -u * 0.8, -u * 0.2, -u * 0.78, -u * 0.22, -u * 0.72);
  ctx.bezierCurveTo(-u * 0.29, -u * 0.55, -u * 0.31, -u * 0.38, -u * 0.34 - sway, -u * 0.12);
  const teeth = 9;
  for (let i = 0; i <= teeth; i++) {
    const t = i / teeth;
    ctx.lineTo(lerp(-u * 0.36 - sway, u * 0.36 + sway, t), i % 2 ? -u * 0.012 : u * 0.018);
  }
  ctx.bezierCurveTo(u * 0.31, -u * 0.38, u * 0.29, -u * 0.55, u * 0.22, -u * 0.72);
  ctx.bezierCurveTo(u * 0.2, -u * 0.78, u * 0.12, -u * 0.8, u * 0.12, -u * 0.89);
  ctx.bezierCurveTo(u * 0.12, -u * 0.95, u * 0.07, -u * 0.99, 0, -u);
  ctx.closePath();
  ctx.fill();
  // cloak folds
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = Math.max(1, u * 0.008);
  for (const fx of [-0.14, -0.05, 0.06, 0.15]) { ctx.beginPath(); ctx.moveTo(u * fx * 0.6, -u * 0.62); ctx.quadraticCurveTo(u * fx * 1.4, -u * 0.3, u * fx * 1.9, -u * 0.03); ctx.stroke() }
  // rim light on the lit edge
  ctx.strokeStyle = rgba(rim, 0.28); ctx.lineWidth = Math.max(1, u * 0.007);
  ctx.beginPath(); ctx.moveTo(-u * 0.12, -u * 0.89); ctx.bezierCurveTo(-u * 0.12, -u * 0.8, -u * 0.2, -u * 0.78, -u * 0.22, -u * 0.72); ctx.bezierCurveTo(-u * 0.29, -u * 0.55, -u * 0.31, -u * 0.38, -u * 0.34, -u * 0.12); ctx.stroke();

  // head
  head(ctx, f, u, dark);

  // arms / items
  if (f.lantern) {
    ctx.strokeStyle = shade(body, -0.4); ctx.lineWidth = Math.max(1.5, u * 0.01);
    ctx.beginPath(); ctx.moveTo(-u * 0.2, -u * 0.62); ctx.lineTo(-u * 0.27, -u * 0.46); ctx.stroke();
    ctx.fillStyle = '#16100c'; ctx.fillRect(-u * 0.3, -u * 0.46, u * 0.06, u * 0.085);
    ctx.fillStyle = f.lantern; ctx.fillRect(-u * 0.288, -u * 0.44, u * 0.036, u * 0.05);
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, -u * 0.27, -u * 0.42, u * 0.42, f.lantern, 0.85); ctx.globalCompositeOperation = 'source-over';
  }
  if (f.weapon === 'blade') {
    ctx.save(); ctx.translate(u * 0.22, -u * 0.5); ctx.rotate(-0.5);
    ctx.fillStyle = '#c8ccd4'; ctx.beginPath(); ctx.moveTo(-u * 0.008, 0); ctx.lineTo(u * 0.008, 0); ctx.lineTo(u * 0.004, u * 0.5); ctx.lineTo(0, u * 0.54); ctx.lineTo(-u * 0.004, u * 0.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-u * 0.002, u * 0.04, u * 0.003, u * 0.46);
    ctx.fillStyle = shade(body, -0.4); ctx.fillRect(-u * 0.03, -u * 0.012, u * 0.06, u * 0.012);
    ctx.restore();
  } else if (f.weapon === 'bell') {
    ctx.fillStyle = '#b79a4a'; ctx.beginPath(); ctx.moveTo(u * 0.2, -u * 0.46); ctx.quadraticCurveTo(u * 0.22, -u * 0.58, u * 0.27, -u * 0.46); ctx.lineTo(u * 0.29, -u * 0.43); ctx.lineTo(u * 0.18, -u * 0.43); ctx.closePath(); ctx.fill();
  } else if (f.weapon === 'bow') {
    ctx.strokeStyle = shade(body, -0.1); ctx.lineWidth = Math.max(1.5, u * 0.012);
    ctx.beginPath(); ctx.arc(u * 0.32, -u * 0.5, u * 0.34, -1.1, 1.1); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(220,210,190,.6)'; ctx.beginPath(); ctx.moveTo(u * 0.32 + Math.cos(-1.1) * u * 0.34, -u * 0.5 + Math.sin(-1.1) * u * 0.34); ctx.lineTo(u * 0.32 + Math.cos(1.1) * u * 0.34, -u * 0.5 + Math.sin(1.1) * u * 0.34); ctx.stroke();
  }
  ctx.restore();
}

function head(ctx: CanvasRenderingContext2D, f: FigureSpec, u: number, dark: string) {
  const look = f.look;
  const cy = -u * 0.885;
  const body = f.c;
  if (look === 'helm') {
    ctx.fillStyle = vgrad(ctx, cy - u * 0.1, cy + u * 0.1, [[0, shade('#778090', -0.1)], [1, shade('#778090', -0.55)]]);
    ctx.beginPath(); ctx.moveTo(-u * 0.075, cy + u * 0.09); ctx.lineTo(-u * 0.08, cy - u * 0.02); ctx.quadraticCurveTo(-u * 0.08, cy - u * 0.12, 0, cy - u * 0.125); ctx.quadraticCurveTo(u * 0.08, cy - u * 0.12, u * 0.08, cy - u * 0.02); ctx.lineTo(u * 0.075, cy + u * 0.09); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#050505'; ctx.fillRect(-u * 0.065, cy - u * 0.02, u * 0.13, u * 0.012);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-u * 0.075, cy - u * 0.1, u * 0.012, u * 0.16);
    if (!f.back) { ctx.fillStyle = f.accent ?? '#7a1f1a'; ctx.beginPath(); ctx.moveTo(0, cy - u * 0.125); ctx.quadraticCurveTo(u * 0.03, cy - u * 0.2, u * 0.01, cy - u * 0.24); ctx.lineTo(-u * 0.012, cy - u * 0.2); ctx.closePath(); ctx.fill() }
    return;
  }
  if (look === 'hat') {
    ctx.fillStyle = shade(body, -0.35);
    ctx.beginPath(); ctx.ellipse(0, cy - u * 0.05, u * 0.17, u * 0.034, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-u * 0.08, cy - u * 0.05); ctx.quadraticCurveTo(-u * 0.07, cy - u * 0.17, 0, cy - u * 0.18); ctx.quadraticCurveTo(u * 0.07, cy - u * 0.17, u * 0.08, cy - u * 0.05); ctx.fill();
    ctx.fillStyle = '#050404'; ctx.beginPath(); ctx.ellipse(0, cy + u * 0.02, u * 0.07, u * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = f.accent ?? shade(body, 0.25); ctx.beginPath(); ctx.moveTo(-u * 0.08, cy + u * 0.03); ctx.quadraticCurveTo(0, cy + u * 0.11, u * 0.08, cy + u * 0.03); ctx.lineTo(u * 0.07, cy + u * 0.1); ctx.quadraticCurveTo(0, cy + u * 0.14, -u * 0.07, cy + u * 0.1); ctx.closePath(); ctx.fill();
    return;
  }
  // hood shape (all other looks)
  ctx.fillStyle = vgrad(ctx, cy - u * 0.12, cy + u * 0.1, [[0, shade(body, 0.1)], [1, dark]]);
  ctx.beginPath(); ctx.moveTo(0, cy - u * (look === 'cowl' ? 0.19 : 0.125));
  ctx.bezierCurveTo(u * 0.09, cy - u * 0.1, u * 0.115, cy - u * 0.02, u * 0.11, cy + u * 0.09);
  ctx.lineTo(-u * 0.11, cy + u * 0.09);
  ctx.bezierCurveTo(-u * 0.115, cy - u * 0.02, -u * 0.09, cy - u * 0.1, 0, cy - u * (look === 'cowl' ? 0.19 : 0.125));
  ctx.fill();
  if (f.back) return;
  if (look === 'mask' || look === 'bell') {
    ctx.fillStyle = vgrad(ctx, cy - u * 0.06, cy + u * 0.08, [[0, '#e9e1d2'], [1, '#a89f8e']]);
    ctx.beginPath(); ctx.ellipse(0, cy + u * 0.01, u * 0.055, u * 0.072, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(u * 0.02, cy + u * 0.015, u * 0.03, u * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    if (look === 'bell') { ctx.fillStyle = f.accent ?? '#c9a94a'; ctx.beginPath(); ctx.arc(0, cy + u * 0.095, u * 0.014, 0, Math.PI * 2); ctx.fill() }
  } else if (look === 'plague') {
    ctx.fillStyle = vgrad(ctx, cy - u * 0.04, cy + u * 0.1, [[0, '#cfc6b4'], [1, '#8d856f']]);
    ctx.beginPath(); ctx.ellipse(0, cy, u * 0.05, u * 0.065, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-u * 0.016, cy + u * 0.01); ctx.lineTo(0, cy + u * 0.15); ctx.lineTo(u * 0.016, cy + u * 0.01); ctx.fill();
  } else if (look === 'goggles') {
    ctx.fillStyle = '#050404'; ctx.beginPath(); ctx.ellipse(0, cy + u * 0.02, u * 0.072, u * 0.075, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = f.accent ?? '#e8b04a'; ctx.beginPath(); ctx.arc(-u * 0.028, cy + u * 0.01, u * 0.02, 0, Math.PI * 2); ctx.arc(u * 0.028, cy + u * 0.01, u * 0.02, 0, Math.PI * 2); ctx.fill();
  } else if (look === 'veil') {
    ctx.fillStyle = '#050404'; ctx.beginPath(); ctx.ellipse(0, cy + u * 0.02, u * 0.07, u * 0.078, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba(f.accent ?? '#cfd8e0', 0.5); ctx.beginPath(); ctx.moveTo(-u * 0.075, cy - u * 0.02); ctx.quadraticCurveTo(0, cy - u * 0.05, u * 0.075, cy - u * 0.02); ctx.lineTo(u * 0.1, cy + u * 0.22); ctx.quadraticCurveTo(0, cy + u * 0.27, -u * 0.1, cy + u * 0.22); ctx.closePath(); ctx.fill();
  } else {
    // dark hood: a void with a faint rim
    ctx.fillStyle = '#030202'; ctx.beginPath(); ctx.ellipse(0, cy + u * 0.025, u * 0.066, u * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(f.rim ?? '#ffffff', 0.12); ctx.lineWidth = Math.max(1, u * 0.006); ctx.beginPath(); ctx.arc(0, cy + u * 0.025, u * 0.068, Math.PI * 1.05, Math.PI * 1.65); ctx.stroke();
  }
  if (look === 'crown') { ctx.fillStyle = f.accent ?? '#d4b04a'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * u * 0.03 - u * 0.012, cy - u * 0.118); ctx.lineTo(i * u * 0.03, cy - u * (0.17 + (i % 2 ? 0 : 0.03))); ctx.lineTo(i * u * 0.03 + u * 0.012, cy - u * 0.118); ctx.fill() } }
}

// ------------------------------------------------------------ personas
export interface Persona { look: Look; c: string; accent?: string; extra?: 'bell' | 'lantern' | 'book' | 'scarf' | 'crown' | 'pauldron' | 'antler' | 'none' }

const LOOKS: Look[] = ['hood', 'mask', 'veil', 'cowl', 'helm', 'hat', 'plague'];
export const personaFor = (id: string, color?: string, look?: string): Persona => {
  const h = hashKey(id);
  const l = (look && (LOOKS as string[]).concat(['crown', 'bell']).includes(look.split('+')[0]) ? look.split('+')[0] : LOOKS[h % LOOKS.length]) as Look;
  const extra = look?.split('+')[1] as Persona['extra'] | undefined;
  return { look: l, c: color ? mix(color, '#0c0a0a', 0.62) : mix('#3a3430', '#0c0a0a', (h % 40) / 100), accent: color, extra };
};

/** A faceless bust portrait: hood / mask / veil / helm over shoulders. */
export function drawPersona(ctx: CanvasRenderingContext2D, w: number, h: number, p: Persona, t = 0) {
  ctx.clearRect(0, 0, w, h);
  const acc = p.accent ?? '#d8c090';
  const bg = ctx.createRadialGradient(w / 2, h * 0.42, 2, w / 2, h * 0.5, w * 0.8);
  bg.addColorStop(0, rgba(mix(acc, '#000000', 0.55), 0.95)); bg.addColorStop(1, 'rgba(6,5,5,1)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, w / 2, h * 0.34, w * 0.5, acc, 0.22 + Math.sin(t * 1.5) * 0.03); ctx.globalCompositeOperation = 'source-over';
  const cx = w / 2, u = h;
  // the cloaked figure, scaled so the head sits in the upper half of the frame
  ctx.save();
  ctx.translate(cx, u * 1.5);
  drawFigure(ctx, { x: 0, y: 0, h: u * 1.25, look: p.look, c: p.c, accent: p.accent, rim: acc, back: false, sway: 0 });
  ctx.restore();
  if (p.extra === 'scarf') { ctx.fillStyle = shade(acc, -0.5); ctx.beginPath(); ctx.ellipse(cx, u * 0.55, w * 0.2, u * 0.05, 0, 0, Math.PI * 2); ctx.fill() }
  if (p.extra === 'antler') { ctx.strokeStyle = shade(acc, -0.1); ctx.lineWidth = 3; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * w * 0.1, u * 0.2); ctx.quadraticCurveTo(cx + s * w * 0.28, u * 0.08, cx + s * w * 0.3, -u * 0.02); ctx.moveTo(cx + s * w * 0.2, u * 0.13); ctx.lineTo(cx + s * w * 0.3, u * 0.14); ctx.stroke() } }
  const vg = ctx.createRadialGradient(cx, u * 0.5, w * 0.2, cx, u * 0.5, w * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = rgba(acc, 0.45); ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  void rngOf;
}
