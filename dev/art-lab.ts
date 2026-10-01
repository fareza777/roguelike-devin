import { ENEMIES } from '../src/data/enemies';
import { SCENES } from '../src/art/catalog';
import { creatureSpec, drawCreature } from '../src/art/creatures';
import { drawPersona, personaFor } from '../src/art/figures';
import { SceneView } from '../src/art/scene';

const g = document.getElementById('g')!;
const q = new URLSearchParams(location.search);
const mode = q.get('mode') ?? 'scenes';
const only = q.get('only');
const bossIds = new Set(['oldsentinel', 'rookking', 'saltbeard', 'widow', 'huntsman', 'hart', 'crone', 'unburntkeeper', 'grist', 'hollowtitan', 'moltenregent', 'vhal', 'barrowking', 'glacierwyrm', 'herald', 'king', 'ilse']);

if (mode === 'scenes') {
  const keys = Object.keys(SCENES).filter(k => !only || only.split(',').includes(k));
  for (const k of keys) {
    const fig = document.createElement('figure');
    const t0 = performance.now();
    const v = new SceneView(SCENES[k], 960, 540);
    for (let i = 0; i < 30; i++) v.draw(0.05);
    const ms = Math.round(performance.now() - t0);
    fig.appendChild(v.cv);
    const cap = document.createElement('figcaption'); cap.textContent = `${k} (${ms}ms)`; fig.appendChild(cap);
    g.appendChild(fig);
  }
} else if (mode === 'creatures') {
  document.body.style.setProperty('--cols', '220px');
  const list = ENEMIES.filter(e => !only || only.split(',').includes(e.id));
  const from = +(q.get('from') ?? 0), n = +(q.get('n') ?? 60);
  list.slice(from, from + n).forEach(e => {
    const rank = bossIds.has(e.id) ? 'boss' : e.tags.includes('elite') ? 'elite' : 'normal';
    const fig = document.createElement('figure');
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 280;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#17110f'; ctx.fillRect(0, 0, 320, 280);
    const spec = creatureSpec(e, rank);
    drawCreature(ctx, 320, 280, spec, { t: 1.3, lunge: 0, hit: 0, die: 0 });
    fig.appendChild(cv);
    const cap = document.createElement('figcaption'); cap.textContent = `${e.id} · ${spec.arch} · ${rank}`; fig.appendChild(cap);
    g.appendChild(fig);
  });
} else {
  const names = ['ilse', 'roe', 'pell', 'ysolde', 'corvin', 'osk', 'nettle', 'tamsin', 'maren', 'dagna', 'sigrun', 'aurelia', 'pip', 'hart', 'widow', 'vhal'];
  names.forEach(n => {
    const fig = document.createElement('figure');
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 200;
    drawPersona(cv.getContext('2d')!, 160, 200, personaFor(n, ['#f0d8a8', '#b8c8d8', '#c8b8e8', '#8fd8c8', '#d8a878', '#c8c0a8', '#e8b088', '#ffb070', '#e8e0d0', '#d8c090', '#a8c8f0', '#ffe090', '#ffe8b0', '#ff9a50', '#a0d0d0', '#a0c0e8'][names.indexOf(n)]));
    fig.appendChild(cv);
    const cap = document.createElement('figcaption'); cap.textContent = n; fig.appendChild(cap);
    g.appendChild(fig);
  });
}
(window as unknown as { ready: boolean }).ready = true;
