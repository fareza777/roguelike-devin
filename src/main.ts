import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';
import './styles/game.css';
import './styles/art.css';
import { mountArt } from './art/mount';
import { startCinematic } from './cinematic/player';
import { sfx, setMood, setMusicEnabled, unlockAudio, type Mood, type Sfx } from './audio';
import { DUNGEON_MAP, MAP_H, MAP_W, TOWN_MAP } from './data/world';
import * as G from './engine/game';
import { WALKABLE } from './engine/dungeongen';
import { haptic, nativeReady, rateGame, shareGame } from './platform';
import { BattleStage } from './render/battle';
import { MapView, drawFullMap, type MapHit } from './render/mapview';
import type { Enemy, GameState, Meta, Screen, Settings, Slot, Stat } from './types';
import { UI } from './ui/common';
import * as E from './ui/explore';
import * as H from './ui/hero';
import * as M from './ui/meta';
import { patch } from './ui/morph';
import * as P from './ui/play';
import { DOCK_SCREENS, HUD_SCREENS, dock, hud, toast } from './ui/shell';
import { ENDINGS } from './data/story';
import { isOverlay } from './engine/flow';

const app = document.querySelector<HTMLDivElement>('#app')!;
const meta: Meta = G.loadMeta();
let s: GameState = G.load() ?? G.fresh(meta.settings.difficulty);
let screen: Screen = 'splash';
let lastScreen: Screen | null = null;
let toastTimer = 0;
const ui: UI = {
  creationStep: 0, introPanel: 0, onboardStep: 0, prevScreen: 'title', charTab: 'attributes', journalTab: 'story', shopTab: 'buy', shopCat: 'all',
  invFilter: 'all', sheet: null, mapSel: null, confirmDelete: false, toast: null, fxSeq: 0, logSeq: 0, tavernText: null, confirmLeave: false,
  smithTab: 'equipped', typed: '', enterNote: null,
};
const META_SCREENS: Screen[] = ['splash', 'intro', 'onboarding', 'title', 'settings', 'about', 'creation'];
const FULL: Screen[] = ['splash', 'intro', 'onboarding', 'title', 'settings', 'about', 'creation', 'dialogue', 'event', 'reward', 'death', 'ending', 'combat'];
const DIRS: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];

const mapView = new MapView(() => s);
const battle = new BattleStage(() => s);
/** While a kill / death animation plays, the finished foe stays on screen. */
let holdFoe: Enemy | null = null;
let holdFoeTimer = 0;
const fullCv = document.createElement('canvas');
let fullHits: MapHit[] = [];
let fullInfo = { scale: 1, ox: 0, oy: 0 };
let typedStarted = '';
let typeTimer = 0;
let autoTimer = 0;

const current = (): Screen => (holdFoe ? 'combat' : META_SCREENS.includes(screen) ? screen : s.screen);
const persist = () => { if (s.name && s.origin && !(s.screen === 'death' && s.difficulty === 'Doomed')) G.save(s) };
const inGame = () => !!G.load() && !['title', 'creation', 'death'].includes(s.screen);
const play = (kind: Sfx) => { if (meta.settings.sfx) sfx(kind) };

function show(next: Screen) {
  screen = next;
  if (!META_SCREENS.includes(next)) { s.screen = next; if (!isOverlay(next)) s.ret = next === 'map' || next === 'town' || next === 'world' || next === 'dungeon' ? next : s.ret; persist() }
  cancelAuto();
  render();
}
function toastMsg(text: string) {
  ui.toast = text;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { ui.toast = null; render() }, 2600);
  render();
}
function applySettings() {
  document.documentElement.classList.toggle('large-text', meta.settings.textSize === 'large');
  document.documentElement.classList.toggle('reduce-motion', !meta.settings.motion);
  mapView.showLabels = true;
  setMusicEnabled(meta.settings.music);
}
function persistMeta() { G.saveMeta(meta); applySettings() }

function moodFor(cur: Screen): Mood {
  if (['splash', 'intro', 'onboarding', 'title', 'settings', 'about', 'creation'].includes(cur)) return 'title';
  if (cur === 'combat') return 'combat';
  if (cur === 'death') return 'off';
  if (cur === 'ending') return 'noon';
  if (cur === 'dungeon') { const t = s.run ? DUNGEON_MAP.get(s.run.dungeon)?.theme : ''; return t === 'noon' || t === 'archive' ? 'noon' : 'dungeon' }
  if (cur === 'world' || cur === 'map') return (s.world.y > 34 && G.gateOpen(s, 'G')) ? 'noon' : 'world';
  if (cur === 'dialogue' || cur === 'event' || cur === 'reward') return s.ret === 'dungeon' ? 'dungeon' : s.ret === 'world' ? 'world' : 'town';
  return 'town';
}

function view(cur: Screen): string {
  switch (cur) {
    case 'splash': return M.splash();
    case 'intro': return M.intro();
    case 'onboarding': return M.onboarding(ui);
    case 'title': return M.title(meta);
    case 'settings': return M.settings(meta, ui, inGame());
    case 'about': return M.about();
    case 'creation': return M.creation(s, ui, meta);
    case 'town': return s.town ? E.town(s) : E.world(s, ui);
    case 'world': return E.world(s, ui);
    case 'dungeon': return s.run ? E.dungeon(s, ui) : E.world(s, ui);
    case 'map': return E.mapScreen(s, ui);
    case 'combat': return s.enemy || holdFoe ? P.combat(s, ui, holdFoe) : '';
    case 'event': return s.event ? P.event(s) : '';
    case 'reward': return s.reward ? P.reward(s) : '';
    case 'dialogue': return s.scene ? P.dialogue(s, ui) : '';
    case 'character': return H.character(s, ui);
    case 'inventory': return H.inventory(s, ui);
    case 'journal': return H.journal(s, ui, meta);
    case 'shop': return E.shop(s, ui);
    case 'smithy': return E.smithy(s, ui);
    case 'skills': return E.trainer(s);
    case 'board': return E.board(s);
    case 'inn': return E.inn(s, ui);
    case 'wardhouse': return E.wardhouse(s);
    case 'harbor': return E.harbor(s);
    case 'death': return P.death(s);
    case 'ending': return P.ending(s);
  }
}

function stageClass(cur: Screen) {
  if (cur === 'world' || cur === 'dungeon') return 'stage explore-stage';
  if (cur === 'map') return 'stage mapstage';
  if (cur === 'combat') return 'stage combat-stage';
  if (cur === 'event' || cur === 'reward') return 'stage overlay-stage';
  if (FULL.includes(cur)) return 'stage bleed';
  return 'stage';
}

function render() {
  const cur = current();
  const entering = cur !== lastScreen;
  const showHud = !META_SCREENS.includes(cur) && HUD_SCREENS.includes(cur) && cur !== 'combat';
  const showDock = !META_SCREENS.includes(cur) && DOCK_SCREENS.includes(cur);
  const sheet = !META_SCREENS.includes(cur) && ui.sheet ? H.sheet(s, ui, cur === 'shop', G.sellPrice) : '';
  const body = view(cur);
  const html = `<div class="app screen-${cur} ${FULL.includes(cur) ? 'nohud' : ''} ${entering ? 'enter' : ''}" id="root">${showHud ? hud(s) : ''}<main class="${stageClass(cur)}" id="stage">${body}</main>${showDock ? dock(s) : ''}${sheet}${toast(ui)}</div>`;
  patch(app, html);
  if (entering) {
    lastScreen = cur;
    document.getElementById('stage')?.scrollTo(0, 0);
    setMood(moodFor(cur));
    if (cur === 'world' || cur === 'dungeon') mapView.snap();
  }
  afterRender(cur);
}

function battleBg(): string {
  if (s.run) return `dg:${DUNGEON_MAP.get(s.run.dungeon)?.theme ?? 'crypt'}`;
  const z = G.zoneAt(s.world.x, s.world.y);
  return z.bg ?? ({ plains: 'heartland', coast: 'saltmere', swamp: 'hollowhill', ash: 'ashwood', bone: 'quarry', snow: 'pass', noon: 'solenne' } as Record<string, string>)[z.biome] ?? 'heartland';
}

let cineHost: HTMLElement | null = null;
let cineStop: (() => void) | null = null;
function stopCine() { cineStop?.(); cineStop = null; cineHost = null }

function afterRender(cur: Screen) {
  mountArt(app);
  const cine = document.getElementById('cine');
  if (cine && cur === 'intro') {
    if (cine !== cineHost) {
      stopCine();
      cineHost = cine;
      const st = meta.settings;
      cineStop = startCinematic(cine, { voice: st.voice, subs: st.subs, motion: st.motion, sfx: st.sfx, onDone: () => actions.skipIntro() });
    }
  } else if (cineHost) stopCine();
  const bh = document.getElementById('battlemount');
  if (bh && cur === 'combat') { battle.attach(bh); battle.reduced = !meta.settings.motion; const fe = holdFoe ?? s.enemy; if (fe) battle.setFoe(fe, battleBg(), s.path) }
  const host = document.getElementById('mapmount');
  if (host && (cur === 'world' || cur === 'dungeon')) mapView.attach(host);
  const fhost = document.getElementById('fullmount');
  if (fhost && cur === 'map') { if (fullCv.parentElement !== fhost) fhost.appendChild(fullCv); drawFull() }
  const t = document.querySelector<HTMLElement>('.d-text[data-typed]');
  if (t) { if (t.dataset.typed !== typedStarted) startTyping(t) }
  else typedStarted = '';
}

let mapLoop = 0;
function drawFull() {
  if (mapLoop) return;
  const tick = () => {
    if (current() !== 'map' || !fullCv.isConnected) { mapLoop = 0; return }
    const r = drawFullMap(fullCv, s, performance.now() / 1000);
    fullHits = r.hits; fullInfo = r;
    mapLoop = requestAnimationFrame(tick);
  };
  mapLoop = requestAnimationFrame(tick);
}

function startTyping(el: HTMLElement) {
  clearInterval(typeTimer);
  const key = el.dataset.typed!;
  typedStarted = key;
  const full = el.dataset.full ?? '';
  const text = new DOMParser().parseFromString(full, 'text/html').body.textContent ?? '';
  const done = () => {
    clearInterval(typeTimer);
    el.textContent = text;
    if (ui.typed !== key) { ui.typed = key; document.querySelector('.d-choices')?.classList.remove('wait') }
  };
  if (!meta.settings.motion || ui.typed === key) return done();
  ui.typed = '';
  let i = 0;
  const cursor = '<span class="cursor"></span>';
  el.innerHTML = cursor;
  typeTimer = window.setInterval(() => {
    i += 2;
    if (i >= text.length) return done();
    el.textContent = text.slice(0, i);
    el.insertAdjacentHTML('beforeend', cursor);
  }, 16);
}

function feedback(before: { hp: number; level: number; screen: Screen; gold: number; kills: number; items: number }) {
  const hurt = s.hp < before.hp;
  if (s.level > before.level) { play('level'); haptic(meta.settings.haptics, true) }
  if (s.screen === 'death') { play('death'); haptic(meta.settings.haptics, true); return }
  if (before.screen !== s.screen) {
    if (s.screen === 'combat') { play('enter'); mapView.impulse('hurt') }
    else if (s.screen === 'reward') play(before.screen === 'combat' ? 'win' : 'chest');
    else if (s.screen === 'dialogue') play('page');
    else if (s.screen === 'event') play('quest');
    else if (s.screen === 'ending') play('bell');
  }
  if (s.screen === 'combat') {
    if (s.fx.some(f => f.kind === 'crit')) play('crit');
    else if (s.fx.some(f => f.target === 'enemy')) play('hit');
    if (s.fx.some(f => f.kind === 'miss' && f.text === 'DODGE')) play('dodge');
  }
  if (hurt) { if (s.screen !== 'combat') play('trap'); else play('hurt'); mapView.impulse('hurt'); haptic(meta.settings.haptics, s.hp < before.hp - 8) }
  else if (s.fx.some(f => f.kind === 'heal') || s.hp > before.hp) play('heal');
  if (s.gold > before.gold && (s.screen === 'dungeon' || s.screen === 'world')) { play('coin'); mapView.impulse('gold') }
  else if (s.inventory.length > before.items && (s.screen === 'dungeon')) play('pickup');
}

function act(fn: () => void, silent = false) {
  const before = { hp: s.hp, level: s.level, screen: s.screen, gold: s.gold, kills: s.kills, items: s.inventory.length };
  const logHead = s.log[0];
  const foeBefore = s.enemy;
  fn();
  screen = META_SCREENS.includes(screen) && !META_SCREENS.includes(s.screen) ? s.screen : screen;
  if (s.log[0] !== logHead) ui.logSeq++;
  if (s.fx.length || before.screen === 'combat') ui.fxSeq++;
  if (!silent) feedback(before);
  if (before.screen === 'combat' && foeBefore) {
    battle.setFoe(foeBefore, battleBg(), s.path);
    battle.consume(s.anim);
    s.anim = [];
    const ended = s.screen !== 'combat' && (foeBefore.hp <= 0 || s.screen === 'death');
    if (ended && meta.settings.motion) {
      holdFoe = foeBefore;
      clearTimeout(holdFoeTimer);
      holdFoeTimer = window.setTimeout(() => { holdFoe = null; lastScreen = null; render() }, Math.min(2600, 700 + battle.busy() * 1000));
    }
  } else if (s.screen === 'combat') s.anim = [];
  render();
}

function go(v: string) {
  ui.sheet = null;
  if (v === 'explore') { if (s.screen === 'map' || !['town', 'world', 'dungeon'].includes(s.screen)) return show(s.town ? 'town' : s.run ? 'dungeon' : 'world'); return show(s.screen) }
  if (v === 'title') { persist(); screen = 'title'; render(); return }
  if (v === 'about') { screen = 'about'; return render() }
  if (v === 'map' && s.run) return;
  show(v as Screen);
}

// ---------------------------------------------------------------- movement

const cancelAuto = () => { clearTimeout(autoTimer); autoTimer = 0; mapView.path = [] };

function stepDir(dir: number) {
  const [dx, dy] = DIRS[dir];
  if (s.screen === 'world') { const before = `${s.world.x},${s.world.y}`; act(() => G.moveWorld(s, dx, dy), false); if (`${s.world.x},${s.world.y}` !== before && s.screen === 'world') play('step') }
  else if (s.screen === 'dungeon' && s.run) { const before = `${s.run.px},${s.run.py},${s.run.floor}`; act(() => G.moveDungeon(s, dx, dy), false); if (s.run && `${s.run.px},${s.run.py},${s.run.floor}` !== before && s.screen === 'dungeon') play(s.run.floor !== Number(before.split(',')[2]) ? 'stairs' : 'step') }
}

let holdTimer = 0;
function startHold(dir: number, el: Element) {
  cancelAuto();
  stopHold();
  el.classList.add('held');
  stepDir(dir);
  holdTimer = window.setTimeout(function rep() { stepDir(dir); holdTimer = window.setTimeout(rep, 130) }, 340);
}
function stopHold() { clearTimeout(holdTimer); holdTimer = 0; document.querySelectorAll('.dbtn.held').forEach(e => e.classList.remove('held')) }

function bfsPath(tx: number, ty: number): [number, number][] {
  const start: [number, number] = s.screen === 'dungeon' && s.run ? [s.run.px, s.run.py] : [s.world.x, s.world.y];
  const passable = (x: number, y: number): boolean => {
    if (s.screen === 'dungeon' && s.run) {
      const f = G.floorOf(s);
      if (x < 0 || y < 0 || x >= f.w || y >= f.h || f.seen[y * f.w + x] !== '1') return false;
      const ch = f.tiles[y * f.w + x];
      if (!WALKABLE.has(ch) && ch !== '+') return false;
      const e = G.entAt(f, x, y);
      return !e || (e.k !== 'enemy' && e.k !== 'boss' && e.k !== 'trap') || (x === tx && y === ty);
    }
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
    return G.isExplored(s, x, y) && !G.blocked(s, x, y);
  };
  const prev = new Map<number, number>();
  const W = 200;
  const key = (x: number, y: number) => y * W + x;
  const q: [number, number][] = [start];
  prev.set(key(...start), -1);
  for (let i = 0; i < q.length && i < 4000; i++) {
    const [x, y] = q[i];
    if (x === tx && y === ty) break;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (prev.has(key(nx, ny)) || !passable(nx, ny)) continue;
      prev.set(key(nx, ny), key(x, y));
      q.push([nx, ny]);
    }
  }
  if (!prev.has(key(tx, ty))) return [];
  const path: [number, number][] = [];
  for (let c = key(tx, ty); c !== key(...start); c = prev.get(c)!) path.push([c % W, Math.floor(c / W)]);
  return path.reverse();
}

function walkTo(tx: number, ty: number) {
  cancelAuto();
  const path = bfsPath(tx, ty);
  if (!path.length) { play('error'); return }
  mapView.path = path.slice();
  const stepNext = () => {
    if (!mapView.path.length || (s.screen !== 'world' && s.screen !== 'dungeon')) return cancelAuto();
    const [nx, ny] = mapView.path[0];
    const px = s.screen === 'dungeon' ? s.run!.px : s.world.x, py = s.screen === 'dungeon' ? s.run!.py : s.world.y;
    const dir = DIRS.findIndex(([dx, dy]) => px + dx === nx && py + dy === ny);
    if (dir < 0) return cancelAuto();
    const hp = s.hp, scr = s.screen;
    stepDir(dir);
    const npx = s.screen === 'dungeon' && s.run ? s.run.px : s.world.x, npy = s.screen === 'dungeon' && s.run ? s.run.py : s.world.y;
    if (s.screen !== scr || s.hp < hp) return cancelAuto();
    if (npx === nx && npy === ny) mapView.path.shift();
    else if (npx === px && npy === py) { if ((autoRetry += 1) > 2) { autoRetry = 0; return cancelAuto() } } else return cancelAuto();
    autoTimer = window.setTimeout(stepNext, 110);
  };
  autoRetry = 0;
  stepNext();
}
let autoRetry = 0;

function attachCanvasInput() {
  let sx = 0, sy = 0, st = 0;
  mapView.cv.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = performance.now(); unlockAudio() });
  mapView.cv.addEventListener('pointerup', e => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.hypot(dx, dy) > 28) { cancelAuto(); stepDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 2) : dy > 0 ? 1 : 3); return }
    if (performance.now() - st > 600) return;
    const r = mapView.cv.getBoundingClientRect();
    const [tx, ty] = mapView.tileFromPoint(e.clientX - r.left, e.clientY - r.top);
    const px = s.screen === 'dungeon' && s.run ? s.run.px : s.world.x, py = s.screen === 'dungeon' && s.run ? s.run.py : s.world.y;
    if (tx === px && ty === py) { if (s.screen === 'world') act(() => actions.enterPoi()); else act(() => G.searchDungeon(s)); return }
    if (Math.abs(tx - px) + Math.abs(ty - py) === 1) { cancelAuto(); stepDir(DIRS.findIndex(([ddx, ddy]) => px + ddx === tx && py + ddy === ty)); return }
    walkTo(tx, ty);
  });
}

// ----------------------------------------------------------------- actions

const actions: Record<string, () => void> = {
  noop: () => undefined,
  skipSplash: () => afterSplash(),
  skipIntro: () => { stopCine(); meta.introSeen = true; persistMeta(); show(meta.onboarded ? 'title' : 'onboarding') },
  nextOnboard: () => { if (ui.onboardStep < 4) { ui.onboardStep++; render() } else actions.skipOnboard() },
  skipOnboard: () => { meta.onboarded = true; persistMeta(); show('title') },
  continue: () => {
    const saved = G.load();
    if (!saved) return;
    s = saved;
    G.fixRet(s);
    if (!s.town && !s.run && s.screen !== 'world' && !isOverlay(s.screen)) s.screen = 'world';
    if (['title', 'creation', 'splash', 'intro', 'onboarding', 'settings', 'about'].includes(s.screen)) s.screen = s.town ? 'town' : s.run ? 'dungeon' : 'world';
    lastScreen = null;
    screen = s.screen;
    G.drain(s);
    mapView.snap();
    show(s.screen);
  },
  new: () => { s = G.fresh(meta.settings.difficulty); ui.creationStep = 0; meta.runs++; persistMeta(); lastScreen = null; screen = 'creation'; render() },
  creationBack: () => { if (ui.creationStep > 0) { ui.creationStep--; render() } else { screen = 'title'; render() } },
  creationNext: () => {
    captureName();
    if (ui.creationStep < 2) { ui.creationStep++; render(); return }
    if (!s.name.trim()) s.name = 'Nameless';
    G.setup(s);
    play('door');
    lastScreen = null;
    screen = 'town';
    G.drain(s);
    show('town');
  },
  openSettings: () => { ui.prevScreen = current() === 'settings' ? 'title' : current(); ui.confirmDelete = false; screen = 'settings'; render() },
  closeSettings: () => { const back = ui.prevScreen; screen = back; if (!META_SCREENS.includes(back)) { s.screen = back } lastScreen = null; render() },
  toTitle: () => { persist(); screen = 'title'; render() },
  replayIntro: () => { ui.introPanel = 0; meta.introSeen = false; persistMeta(); screen = 'intro'; render() },
  replayTutorial: () => { ui.onboardStep = 0; meta.onboarded = false; persistMeta(); screen = 'onboarding'; render() },
  deleteSave: () => {
    if (!ui.confirmDelete) { ui.confirmDelete = true; render(); return }
    G.clearSave(); s = G.fresh(meta.settings.difficulty); ui.confirmDelete = false; ui.prevScreen = 'title'; screen = 'title'; toastMsg('Chronicle erased.');
  },
  share: async () => {
    const text = s.ending && ENDINGS[s.ending] ? `I reached the ${ENDINGS[s.ending].title} ending in Dreadmarch: The Black Meridian.` : 'Traverse a shattered continent, break the seals and decide what morning means. Dreadmarch: The Black Meridian.';
    const r = await shareGame(text);
    if (r === 'copied') toastMsg('Link copied to clipboard.');
    if (r === 'failed') toastMsg('Sharing is unavailable here.');
  },
  rate: () => rateGame(),
  closeSheet: () => { ui.sheet = null; render() },

  attack: () => act(() => G.attack(s)),
  defend: () => act(() => G.defend(s)),
  flee: () => act(() => G.flee(s)),
  closeReward: () => act(() => G.closeReward(s)),
  sceneNext: () => act(() => { if (typeTimer && ui.typed !== `${s.scene?.id}:${s.scene?.node}`) { skipTyping(); return } G.sceneAdvance(s) }),
  skipType: () => { skipTyping() },
  revive: () => { G.revive(s); lastScreen = null; screen = 'town'; show('town') },
  epilogue: () => {
    if (s.ending && !meta.endings.includes(s.ending)) { meta.endings.push(s.ending); persistMeta() }
    s.screen = 'town'; s.ret = 'town'; s.town = 'veyrgard'; s.enemy = null; s.run = null;
    lastScreen = null; screen = 'town'; G.commit(s); show('town');
  },

  leaveTown: () => act(() => G.leaveTown(s)),
  enterPoi: () => {
    const poi = G.currentPoi(s);
    if (!poi) return;
    if (poi.kind === 'town') act(() => G.enterTown(s, poi.id));
    else if (poi.kind === 'dungeon') { const ok = G.enterDungeon(s, poi.id); if (ok) play('enter'); else play('error'); act(() => undefined, true) }
    else if (poi.kind === 'landmark') act(() => G.approachHere(s));
  },
  wait: () => act(() => { G.push(s, 'You wait, listening.'); if (s.screen === 'dungeon' && s.run) G.searchDungeon(s); else G.commit(s) }),
  campWorld: () => act(() => G.campWorld(s)),
  searchDungeon: () => act(() => G.searchDungeon(s)),
  quickHeal: () => act(() => { if (!G.quickHeal(s)) toastMsg('You have no healing potions.') }),
  quickLight: () => act(() => { if (!G.quickLight(s)) toastMsg('You have no torches or lantern oil.') }),
  leaveDungeon: () => act(() => G.leaveDungeon(s)),
  openMap: () => go('map'),

  buySupplies: () => { G.buySupplies(s); play('buy'); render() },
  sellJunk: () => { const n = G.sellAllJunk(s); play(n ? 'coin' : 'error'); render() },
  rest: () => { G.rest(s); play('heal'); toastMsg('You wake rested. Health and sanity restored.') },
  cleanse: () => { const c = s.corruption; G.cleanse(s); if (s.corruption < c) { play('heal'); toastMsg('Corruption purged.') } else render() },
  quiet: () => { if (G.quietHour(s)) { play('heal'); toastMsg('The whispering quiets.') } else render() },
  round: () => { const t = G.buyRound(s); if (t) { ui.tavernText = t; play('coin') } render() },
  listen: () => { ui.tavernText = G.rumor(s); play('page'); render() },
};

function skipTyping() {
  const el = document.querySelector<HTMLElement>('.d-text[data-typed]');
  if (!el) return;
  clearInterval(typeTimer);
  typeTimer = 0;
  const text = new DOMParser().parseFromString(el.dataset.full ?? '', 'text/html').body.textContent ?? '';
  el.textContent = text;
  ui.typed = el.dataset.typed!;
  document.querySelector('.d-choices')?.classList.remove('wait');
}

function afterSplash() { unlockAudio(); screen = !meta.introSeen ? 'intro' : !meta.onboarded ? 'onboarding' : 'title'; render() }

function captureName() {
  const input = document.querySelector<HTMLInputElement>('#heroName');
  if (input) s.name = input.value.slice(0, 18);
}

function attr(el: Element, name: string): string | undefined { const t = el.closest<HTMLElement>(`[data-${name}]`); return t?.dataset[name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())] }

const handlers: [string, (v: string, el: HTMLElement) => void][] = [
  ['act', v => actions[v]?.()],
  ['go', v => go(v)],
  ['pick', v => { captureName(); s[(['origin', 'path', 'companion'] as const)[ui.creationStep]] = v; render() }],
  ['talk', v => act(() => G.talkNpc(s, s.town!, v))],
  ['choice', v => act(() => G.resolveEvent(s, Number(v)))],
  ['scene-choice', v => act(() => G.sceneChoose(s, Number(v)))],
  ['skill', v => act(() => G.useSkill(s, v))],
  ['item', v => { act(() => G.useItem(s, v)); if (!s.inventory.includes(v)) ui.sheet = null; render() }],
  ['equip', v => { G.equip(s, v); play('equip'); ui.sheet = null; render() }],
  ['unequip', v => { G.unequip(s, v as Slot); play('equip'); ui.sheet = null; render() }],
  ['sheet', (v, el) => { ui.sheet = { id: v, from: (el.dataset.from as 'bag' | 'equip' | 'shop') ?? 'bag', slot: el.dataset.slot as Slot | undefined }; play('page'); render() }],
  ['buy', v => { if (G.buy(s, v)) { play('buy'); ui.sheet = null; toastMsg('Purchased. Find it in your Pack.') } else play('error') }],
  ['sell', v => { G.sell(s, v); play('coin'); if (!s.inventory.includes(v)) ui.sheet = null; render() }],
  ['upgrade', (v, el) => { const ok = G.upgradeItem(s, v, (el.dataset.slot || null) as Slot | null); play(ok !== false ? 'level' : 'error'); render() }],
  ['learn', v => { G.learn(s, v); play('quest'); render() }],
  ['loadout', v => { G.toggleLoadout(s, v); play('click'); render() }],
  ['companion', v => { G.swapCompanion(s, v); play('heal'); render() }],
  ['rankup', v => { if (G.rankUp(s, v)) play('level'); else play('error'); render() }],
  ['sail', v => act(() => G.sail(s, v))],
  ['accept', v => { G.acceptQuest(s, v); play('quest'); render() }],
  ['claim', v => act(() => G.claimQuest(s, v))],
  ['sigil', v => { G.buySigil(s, Number(v) as 1 | 2 | 3); play('heal'); toastMsg('A sigil settles on your skin.') }],
  ['travel', v => act(() => G.fastTravel(s, v))],
  ['stat', v => { G.spendStat(s, v as Stat); play('level'); render() }],
  ['talent', v => { G.learnTalent(s, v); play('level'); render() }],
  ['chartab', v => { ui.charTab = v as UI['charTab']; render() }],
  ['jtab', v => { ui.journalTab = v as UI['journalTab']; render() }],
  ['shoptab', v => { ui.shopTab = v as UI['shopTab']; ui.shopCat = 'all'; render() }],
  ['shopcat', v => { ui.shopCat = v as UI['shopCat']; render() }],
  ['invfilter', v => { ui.invFilter = v as UI['invFilter']; render() }],
  ['smithtab', v => { ui.smithTab = v as UI['smithTab']; render() }],
  ['setting', v => {
    const k = v as 'sfx' | 'music' | 'haptics' | 'motion' | 'voice' | 'subs';
    meta.settings[k] = !meta.settings[k];
    persistMeta();
    render();
  }],
  ['text', v => { meta.settings.textSize = v as Settings['textSize']; persistMeta(); render() }],
  ['diff', v => { meta.settings.difficulty = v as Settings['difficulty']; persistMeta(); render() }],
];

app.addEventListener('click', ev => {
  const target = ev.target as Element;
  for (const [name, fn] of handlers) {
    const el = target.closest<HTMLElement>(`[data-${name}]`);
    if (!el || !app.contains(el)) continue;
    if ((el as HTMLButtonElement).disabled) return;
    if (name === 'sheet' && (target.closest('[data-buy],[data-sell],[data-equip],[data-item],[data-unequip]') )) continue;
    const silent = ['skill', 'act', 'item', 'choice', 'scene-choice', 'talk'].includes(name);
    if (!silent) play('click');
    if (name === 'act' && ['attack', 'defend', 'flee', 'sceneNext', 'skipType'].includes(el.dataset.act ?? '')) unlockAudio();
    fn(attr(el, name)!, el);
    return;
  }
  const mp = target.closest<HTMLElement>('#fullmount');
  if (mp && current() === 'map') {
    const r = fullCv.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    const hit = fullHits.filter(h => Math.hypot(h.x - x, h.y - y) < Math.max(18, fullInfo.scale * 2.2)).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    ui.mapSel = hit ? hit.id : null;
    play('click');
    render();
  }
});

app.addEventListener('pointerdown', ev => {
  const d = (ev.target as Element).closest<HTMLElement>('[data-dir]');
  if (d && !(d as HTMLButtonElement).disabled) { unlockAudio(); ev.preventDefault(); startHold(Number(d.dataset.dir), d) }
});
window.addEventListener('pointerup', stopHold);
window.addEventListener('pointercancel', stopHold);
window.addEventListener('blur', stopHold);

window.addEventListener('keydown', ev => {
  if (ev.target instanceof HTMLInputElement) { if (ev.key === 'Enter') actions.creationNext(); return }
  const cur = current();
  const k = ev.key.toLowerCase();
  const dirKey = ({ arrowright: 0, d: 0, arrowdown: 1, s: 1, arrowleft: 2, a: 2, arrowup: 3, w: 3 } as Record<string, number>)[k];
  if ((cur === 'world' || cur === 'dungeon') && dirKey !== undefined) { ev.preventDefault(); cancelAuto(); stepDir(dirKey); return }
  if ((cur === 'world' || cur === 'dungeon') && (k === 'e' || k === ' ')) { ev.preventDefault(); if (cur === 'world') actions.enterPoi(); else actions.searchDungeon(); return }
  if (cur === 'dialogue' && (k === 'enter' || k === ' ')) { ev.preventDefault(); if (typeTimer && ui.typed !== `${s.scene?.id}:${s.scene?.node}`) skipTyping(); else if (!document.querySelector('.dchoice')) actions.sceneNext(); return }
  if (cur === 'dialogue' && /^[1-9]$/.test(k)) { const n = Number(k) - 1; if (document.querySelectorAll('.dchoice')[n]) act(() => G.sceneChoose(s, n)); return }
  if (cur === 'event' && /^[1-9]$/.test(k)) { const n = Number(k) - 1; if (s.event?.choices[n]) act(() => G.resolveEvent(s, n)); return }
  if (cur === 'combat' && !holdFoe) { if (k === 'a' || k === '1') actions.attack(); else if (k === 'd' || k === '2') actions.defend(); else if (k === 'f') actions.flee() }
  if (cur === 'reward' && (k === 'enter' || k === ' ')) { actions.closeReward(); return }
  if (['town', 'world', 'dungeon', 'character', 'inventory', 'journal', 'map'].includes(cur)) {
    if (k === 'i') go('inventory'); else if (k === 'c') go('character'); else if (k === 'j') go('journal'); else if (k === 'm' && !s.run) go('map'); else if (k === 'escape') { if (ui.sheet) actions.closeSheet(); else go('explore') }
  }
});

document.addEventListener('pointerdown', () => unlockAudio(), { once: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) persist() });
window.addEventListener('pagehide', persist);
attachCanvasInput();
applySettings();
render();
void nativeReady();
void TOWN_MAP;
window.setTimeout(() => { if (screen === 'splash') afterSplash() }, 2800);

const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
if (dev) Object.assign(window, { __dm: { G, get s() { return s }, set s(v: GameState) { s = v }, render, show, ui, meta, actions, mapView, setScreen: (v: Screen) => { screen = v } } });
