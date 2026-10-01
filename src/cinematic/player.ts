import { sfx } from '../audio';
import { sceneSpec } from '../art/catalog';
import { SceneView } from '../art/scene';
import { CINEMATIC, VO, type Shot } from '../data/cinematic';
import { loadVoManifest, playVo, stopVo, voDuration } from './voice';

export interface CineOpts { voice: boolean; subs: boolean; motion: boolean; sfx: boolean; onDone: () => void }

const LINE = new Map(VO.map(v => [v.id, v]));

/** Mounts the opening cinematic into `root`. Returns a cancel function. */
export function startCinematic(root: HTMLElement, o: CineOpts): () => void {
  const portrait = root.clientHeight > root.clientWidth * 1.05;
  const W = portrait ? 540 : 960, H = portrait ? 960 : 540;
  root.classList.toggle('tall', portrait);
  root.innerHTML = `<canvas class="cine-cv a" width="${W}" height="${H}"></canvas><canvas class="cine-cv b" width="${W}" height="${H}"></canvas>
    <div class="cine-bars top"></div><div class="cine-bars bot"></div><div class="cine-vig"></div><div class="cine-flash"></div>
    <div class="cine-sub" aria-live="polite"></div>
    <div class="cine-title"><div class="eclipse big" aria-hidden="true"><i class="corona"></i><i class="corona c2"></i><i class="disc"></i></div><h1>DREADMARCH</h1><p>THE BLACK MERIDIAN</p></div>
    <div class="cine-prog"><i></i></div>`;
  const cvs = [root.querySelector<HTMLCanvasElement>('.cine-cv.a')!, root.querySelector<HTMLCanvasElement>('.cine-cv.b')!];
  const sub = root.querySelector<HTMLElement>('.cine-sub')!;
  const flash = root.querySelector<HTMLElement>('.cine-flash')!;
  const prog = root.querySelector<HTMLElement>('.cine-prog i')!;
  const titleEl = root.querySelector<HTMLElement>('.cine-title')!;
  const views = new Map<string, SceneView>();
  const viewFor = (key: string, cv: HTMLCanvasElement) => {
    // a view owns its canvas, so reuse of a scene on the other layer gets its own copy
    const k = `${key}|${cvs.indexOf(cv)}`;
    let v = views.get(k);
    if (!v) { v = new SceneView(sceneSpec(key), W, H, cv); views.set(k, v) }
    return v;
  };

  let alive = true, idx = -1, layer = 1, t0 = 0, dur = 0, raf = 0, last = performance.now(), timer = 0, ended = false;
  let active: SceneView | null = null, fading: SceneView | null = null, fadeT = 0;
  const total = CINEMATIC.length;

  const play = (kind: NonNullable<Shot['sting']> | 'boom') => { if (o.sfx) sfx(kind) };

  function showShot(i: number) {
    idx = i;
    const shot = CINEMATIC[i];
    const line = LINE.get(shot.vo);
    const cv = cvs[layer ^= 1];
    const view = viewFor(shot.scene, cv);
    view.reset();
    view.move = o.motion ? { z0: shot.cam[0], z1: shot.cam[1], x0: shot.cam[2], x1: shot.cam[3], y0: shot.cam[4], y1: shot.cam[5], dur: 12 } : null;
    fading = active; fadeT = 0; active = view;
    cvs.forEach(c => c.classList.toggle('on', c === cv));
    const vd = o.voice ? playVo(shot.vo) : 0;
    dur = Math.max(shot.dur, vd ? vd + 1.1 : 0);
    if (view.move) view.move.dur = dur + 1.4;
    t0 = performance.now();
    if (shot.sting) play(shot.sting);
    if (shot.flash && o.motion) { flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go') }
    // word-by-word subtitle reveal
    if (o.subs && line) {
      const words = line.text.split(' ');
      const span = Math.min(dur * 0.62, vd ? vd * 0.95 : dur * 0.62);
      sub.className = `cine-sub on ${line.voice}`;
      sub.innerHTML = words.map((w, n) => `<span style="animation-delay:${(0.5 + (n / words.length) * span).toFixed(2)}s">${w}</span>`).join(' ');
    } else sub.className = 'cine-sub';
    prog.style.width = `${((i + 1) / (total + 1)) * 100}%`;
    // pre-render the next shot's bitmaps so the cut stays smooth
    const next = CINEMATIC[i + 1];
    if (next) window.setTimeout(() => { if (alive) viewFor(next.scene, cvs[layer ^ 1]) }, 450);
  }

  function finish() {
    if (ended) return;
    ended = true;
    alive = false;
    cancelAnimationFrame(raf); clearTimeout(timer); stopVo();
    o.onDone();
  }

  function endCard() {
    idx = total;
    stopVo();
    sub.className = 'cine-sub';
    titleEl.classList.add('on');
    prog.style.width = '100%';
    play('boom');
    timer = window.setTimeout(finish, 4200);
  }

  const advance = () => { if (!alive || ended) return; if (idx >= total) return finish(); if (idx + 1 >= total) endCard(); else showShot(idx + 1) };

  function tick(now: number) {
    if (!alive) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    active?.draw(o.motion ? dt : 0.0001);
    if (fading) { fadeT += dt; fading.draw(o.motion ? dt : 0.0001); if (fadeT > 1.4) fading = null }
    if (idx >= 0 && idx < total && (now - t0) / 1000 > dur) advance();
  }

  const onTap = (e: Event) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-act="skipIntro"]')) return;
    advance();
  };
  root.addEventListener('click', onTap);

  void loadVoManifest().then(() => { if (!alive) return; showShot(0); raf = requestAnimationFrame(tick) });
  return () => { if (alive) { alive = false; cancelAnimationFrame(raf); clearTimeout(timer); stopVo() } root.removeEventListener('click', onTap) };
}

/** Total fallback run time in seconds (no voice). */
export const cinematicSeconds = () => CINEMATIC.reduce((a, s) => a + Math.max(s.dur, voDuration(s.vo) + 1.1), 4.2);
