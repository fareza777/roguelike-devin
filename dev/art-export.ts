import '../src/art/regions';
import { sceneSpec } from '../src/art/catalog';
import { SceneView } from '../src/art/scene';

declare global { interface Window { splash: (w: number, h: number) => Promise<string>; icon: (size: number, foreground: boolean, round: boolean) => string; ready: boolean } }

function eclipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 2.6);
  g.addColorStop(0, 'rgba(255,170,80,0.85)'); g.addColorStop(0.35, 'rgba(255,110,50,0.35)'); g.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffc070'; ctx.lineWidth = r * 0.09; ctx.shadowColor = '#ff9a40'; ctx.shadowBlur = r * 0.5;
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.04, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + (i % 3) * 0.04, l = r * (0.18 + ((i * 7) % 5) * 0.1);
    ctx.strokeStyle = `rgba(255,200,120,${0.25 + (i % 4) * 0.1})`; ctx.lineWidth = r * 0.03;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * 1.08, cy + Math.sin(a) * r * 1.08); ctx.lineTo(cx + Math.cos(a) * (r * 1.08 + l), cy + Math.sin(a) * (r * 1.08 + l)); ctx.stroke();
  }
  const d = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
  d.addColorStop(0, '#1d1110'); d.addColorStop(1, '#000');
  ctx.fillStyle = d; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
}

window.icon = (size, foreground, round) => {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const ctx = cv.getContext('2d')!;
  if (!foreground) {
    if (round) { ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.clip() }
    const g = ctx.createRadialGradient(size / 2, size * 0.42, 0, size / 2, size / 2, size * 0.75);
    g.addColorStop(0, '#2a100c'); g.addColorStop(1, '#070606');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  }
  const r = size * (foreground ? 0.17 : 0.24);
  eclipse(ctx, size / 2, size * (foreground ? 0.42 : 0.4), r);
  // a hooded wanderer with a lantern, small, below the eclipse
  const fy = size * (foreground ? 0.8 : 0.9), fh = size * (foreground ? 0.16 : 0.2), fx = size / 2;
  ctx.fillStyle = '#0a0606';
  ctx.beginPath(); ctx.moveTo(fx - fh * 0.38, fy); ctx.quadraticCurveTo(fx - fh * 0.3, fy - fh * 0.62, fx, fy - fh); ctx.quadraticCurveTo(fx + fh * 0.3, fy - fh * 0.62, fx + fh * 0.38, fy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffb860'; ctx.shadowColor = '#ffb860'; ctx.shadowBlur = size * 0.05; ctx.fillRect(fx + fh * 0.36, fy - fh * 0.34, size * 0.02, size * 0.032); ctx.shadowBlur = 0;
  return cv.toDataURL('image/png');
};

window.splash = async (w, h) => {
  await document.fonts.load('700 64px Cinzel');
  const cv = document.createElement('canvas');
  const view = new SceneView(sceneSpec('splash'), w, h, cv);
  view.draw(0.016);
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(0.45, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const fs = Math.min(w * 0.082, h * 0.06);
  ctx.textAlign = 'center'; ctx.fillStyle = '#efe4d0'; ctx.shadowColor = 'rgba(255,140,60,0.5)'; ctx.shadowBlur = fs * 0.5;
  ctx.font = `700 ${fs}px Cinzel`;
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${fs * 0.16}px`;
  ctx.fillText('DREADMARCH', w / 2, h * 0.52);
  ctx.shadowBlur = 0; ctx.fillStyle = '#c9a45c'; ctx.font = `600 ${fs * 0.26}px Cinzel`;
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${fs * 0.1}px`;
  ctx.fillText('THE BLACK MERIDIAN', w / 2, h * 0.52 + fs * 0.7);
  return cv.toDataURL('image/png');
};
window.ready = true;
