import { sceneSpec } from './catalog';
import { creatureSpec, drawCreature } from './creatures';
import { drawPersona, personaFor } from './figures';
import { SceneView } from './scene';
import { makeCanvas } from './util';

const RES: Record<string, [number, number]> = { full: [960, 540], card: [640, 360], thumb: [320, 180], tall: [540, 960] };
const views = new WeakMap<HTMLCanvasElement, { key: string; view: SceneView }>();
const live = new Set<HTMLCanvasElement>();
let raf = 0;
let last = 0;
let acc = 0;

const reduced = () => document.documentElement.classList.contains('reduce-motion');

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.1, (now - (last || now)) / 1000);
  last = now;
  acc += dt;
  if (acc < 1 / 30 || document.hidden) return;
  const step = acc;
  acc = 0;
  live.forEach(cv => {
    if (!cv.isConnected) { live.delete(cv); return }
    const r = views.get(cv);
    if (!r || reduced()) return;
    r.view.draw(step);
  });
}

/** Attach art to every `canvas[data-scene]` / `canvas[data-persona]` under root. Safe to call after every render. */
export function mountArt(root: ParentNode = document) {
  root.querySelectorAll<HTMLCanvasElement>('canvas[data-scene]').forEach(cv => {
    const key = cv.dataset.scene!;
    const rec = views.get(cv);
    if (rec && rec.key === key) return;
    const res = cv.dataset.res === 'auto' ? (window.innerHeight > window.innerWidth * 1.05 ? 'tall' : 'full') : cv.dataset.res ?? 'full';
    const [w, h] = RES[res] ?? RES.full;
    const view = new SceneView(sceneSpec(key), w, h, cv);
    view.draw(0.016);
    views.set(cv, { key, view });
    live.add(cv);
  });
  root.querySelectorAll<HTMLCanvasElement>('canvas[data-persona]').forEach(cv => {
    const key = `${cv.dataset.persona}|${cv.dataset.color ?? ''}|${cv.dataset.look ?? ''}`;
    if (cv.dataset.drawn === key) return;
    cv.dataset.drawn = key;
    cv.width = Number(cv.dataset.w ?? 160); cv.height = Number(cv.dataset.h ?? 200);
    drawPersona(cv.getContext('2d')!, cv.width, cv.height, personaFor(cv.dataset.persona!, cv.dataset.color, cv.dataset.look));
  });
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Camera helper for the cinematic: returns the live view of a canvas. */
export const viewOf = (cv: HTMLCanvasElement) => views.get(cv)?.view;

// ---------------------------------------------------------------- thumbnails as data urls
const thumbs = new Map<string, string>();
export function personaUrl(id: string, color?: string, look?: string, w = 72, h = 90): string {
  const k = `p|${id}|${color}|${look}|${w}`;
  let u = thumbs.get(k);
  if (!u) { const cv = makeCanvas(w, h); drawPersona(cv.getContext('2d')!, w, h, personaFor(id, color, look)); u = cv.toDataURL('image/png'); thumbs.set(k, u) }
  return u;
}
export function foeUrl(def: { id: string; name: string; tags: string[]; role: string; look?: string }, rank: 'normal' | 'elite' | 'boss' = 'normal', w = 96, h = 84): string {
  const k = `f|${def.id}|${rank}|${w}`;
  let u = thumbs.get(k);
  if (!u) {
    const cv = makeCanvas(w, h);
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#17110f'; ctx.fillRect(0, 0, w, h);
    drawCreature(ctx, w, h, creatureSpec(def, rank), { t: 1.3, lunge: 0, hit: 0, die: 0 });
    u = cv.toDataURL('image/png');
    thumbs.set(k, u);
  }
  return u;
}
