import './style.css';
import { sfx, setMusic, type Sfx } from './audio';
import {
  abandonRun, acceptQuest, attack, buy, buySupplies, chooseEnding, claimQuest, cleanse, clearSave, closeReward, defend, enterRoom,
  equip, flee, fresh, learn, learnTalent, load, loadMeta, resolveEvent, rest, revive, save, saveMeta, sell, setup, spendStat,
  startRun, unequip, useItem, useSkill,
} from './engine';
import { haptic, nativeReady, rateGame, shareGame } from './platform';
import type { GameState, Meta, Screen, Settings, Stat } from './types';
import * as V from './views';

const app = document.querySelector<HTMLDivElement>('#app')!;
const meta: Meta = loadMeta();
let s: GameState = load() ?? fresh(meta.settings.difficulty);
let screen: Screen = 'splash';
let lastScreen: Screen | null = null;
let toastTimer = 0;
const ui: V.UI = {
  creationStep: 0, introPanel: 0, onboardStep: 0, back: 'title', prevScreen: 'title', mapSel: null, invSel: null,
  charTab: 'attributes', journalTab: 'quests', shopTab: 'buy', confirmDelete: false, toast: null,
};
const META_SCREENS: Screen[] = ['splash', 'intro', 'onboarding', 'title', 'settings', 'about'];

function current(): Screen { return META_SCREENS.includes(screen) ? screen : s.screen }
function persist() { if (s.name && s.origin && !(s.screen === 'death' && s.difficulty === 'Doomed')) save(s) }
function show(next: Screen) {
  screen = next;
  if (!META_SCREENS.includes(next)) { s.screen = next; persist() }
  render();
}
function play(kind: Sfx) { if (meta.settings.sfx) sfx(kind) }
function toast(text: string) {
  ui.toast = text;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { ui.toast = null; render() }, 2600);
  render();
}
function persistMeta() { saveMeta(meta); applySettings() }
function applySettings() {
  document.documentElement.classList.toggle('large-text', meta.settings.textSize === 'large');
  document.documentElement.classList.toggle('reduce-motion', !meta.settings.motion);
}
function afterSplash() { show(!meta.introSeen ? 'intro' : !meta.onboarded ? 'onboarding' : 'title') }
function inGame() { return !!load() && !['title', 'creation', 'death'].includes(s.screen) }

function view(): string {
  switch (current()) {
    case 'splash': return V.splash();
    case 'intro': return V.intro(ui);
    case 'onboarding': return V.onboarding(ui);
    case 'title': return V.title(meta);
    case 'settings': return V.settings(meta, ui, inGame());
    case 'about': return V.about();
    case 'creation': return V.creation(s, ui, meta);
    case 'city': return V.city(s);
    case 'map': return V.map(s, ui);
    case 'dungeon': return s.run ? V.dungeon(s) : V.city(s);
    case 'combat': return s.enemy ? V.combat(s) : V.city(s);
    case 'event': return s.event ? V.event(s) : V.city(s);
    case 'reward': return s.reward ? V.reward(s) : V.city(s);
    case 'character': return V.character(s, ui);
    case 'inventory': return V.inventory(s, ui);
    case 'journal': return V.journal(s, ui);
    case 'shop': return V.shop(s, ui);
    case 'skills': return V.skills(s);
    case 'board': return V.board(s);
    case 'death': return V.death(s);
    case 'ending': return V.ending(s);
  }
}

function render() {
  const cur = current();
  const entering = cur !== lastScreen;
  lastScreen = cur;
  app.innerHTML = `<div class="app screen-${cur} ${entering ? 'enter' : ''}">${V.embers(meta.settings.motion && !['combat', 'inventory', 'shop'].includes(cur))}${view()}${V.bottomNav({ ...s, screen: cur })}${ui.toast ? `<div class="toast">${ui.toast}</div>` : ''}</div>`;
  if (entering) window.scrollTo(0, 0);
  bind();
}

function combatFeedback(before: { hp: number; level: number; screen: Screen }) {
  const hurt = s.hp < before.hp;
  if (s.level > before.level) { play('level'); haptic(meta.settings.haptics, true) }
  if (s.screen === 'death') { play('death'); haptic(meta.settings.haptics, true); return }
  if (s.screen === 'reward' && before.screen === 'combat') play('win');
  else if (s.fx.some(f => f.kind === 'crit')) play('crit');
  else if (s.fx.some(f => f.target === 'enemy')) play('hit');
  if (hurt) { play('hurt'); haptic(meta.settings.haptics, s.hp < before.hp - 8) }
  else if (s.fx.some(f => f.kind === 'heal')) play('heal');
}
function act(fn: () => void) {
  const before = { hp: s.hp, level: s.level, screen: s.screen };
  fn();
  screen = s.screen;
  combatFeedback(before);
  render();
}

const actions: Record<string, () => void> = {
  skipSplash: afterSplash,
  nextIntro: () => { if (ui.introPanel < V.INTRO_LENGTH - 1) { ui.introPanel++; play('door'); render() } else actions.skipIntro() },
  skipIntro: () => { meta.introSeen = true; persistMeta(); show(meta.onboarded ? 'title' : 'onboarding') },
  nextOnboard: () => { if (ui.onboardStep < 4) { ui.onboardStep++; render() } else actions.skipOnboard() },
  skipOnboard: () => { meta.onboarded = true; persistMeta(); show('title') },
  continue: () => {
    const saved = load();
    if (!saved) return;
    s = saved;
    if (['title', 'creation', 'splash', 'intro', 'onboarding', 'settings', 'about'].includes(s.screen)) s.screen = 'city';
    show(s.screen);
  },
  new: () => { s = fresh(meta.settings.difficulty); ui.creationStep = 0; meta.runs++; persistMeta(); show('creation') },
  creationBack: () => { if (ui.creationStep > 0) { ui.creationStep--; render() } else show('title') },
  creationNext: () => {
    captureName();
    if (ui.creationStep < 2) { ui.creationStep++; render(); return }
    if (!s.name.trim()) s.name = 'Nameless';
    setup(s);
    play('door');
    show('city');
  },
  openSettings: () => { ui.prevScreen = current(); ui.confirmDelete = false; show('settings') },
  closeSettings: () => { show(ui.prevScreen === 'settings' ? 'title' : ui.prevScreen) },
  toTitle: () => { persist(); show('title') },
  replayIntro: () => { ui.introPanel = 0; meta.introSeen = false; persistMeta(); show('intro') },
  replayTutorial: () => { ui.onboardStep = 0; meta.onboarded = false; persistMeta(); show('onboarding') },
  deleteSave: () => {
    if (!ui.confirmDelete) { ui.confirmDelete = true; render(); return }
    clearSave(); s = fresh(meta.settings.difficulty); ui.confirmDelete = false; ui.prevScreen = 'title'; toast('Chronicle erased.');
  },
  share: async () => {
    const text = s.ending && s.ending !== 'pending' ? `I reached the ${V.ENDINGS[s.ending][0]} ending in Dreadmarch: The Black Meridian.` : 'Survive the Dreadmarch — a dark-fantasy roguelike RPG.';
    const r = await shareGame(text);
    if (r === 'copied') toast('Link copied to clipboard.');
    if (r === 'failed') toast('Sharing is unavailable here.');
  },
  rate: () => rateGame(),
  attack: () => act(() => attack(s)),
  defend: () => act(() => defend(s)),
  flee: () => act(() => flee(s)),
  rest: () => { rest(s); play('heal'); toast('You wake rested. Health and sanity restored.') },
  cleanse: () => { const c = s.corruption; cleanse(s); if (s.corruption < c) { play('heal'); toast('Corruption purged.') } else render() },
  abandon: () => act(() => abandonRun(s)),
  closeReward: () => act(() => closeReward(s)),
  buySupplies: () => { buySupplies(s); play('click'); render() },
  revive: () => { revive(s); show('city') },
  epilogue: () => { if (!meta.endings.includes(s.ending!)) { meta.endings.push(s.ending!); persistMeta() } show('city') },
};

function captureName() {
  const input = document.querySelector<HTMLInputElement>('#heroName');
  if (input) s.name = input.value.slice(0, 18);
}

function on(attr: string, fn: (value: string) => void) {
  app.querySelectorAll<HTMLElement>(`[data-${attr}]`).forEach(el => {
    el.addEventListener('click', ev => {
      ev.stopPropagation();
      if (el instanceof HTMLButtonElement && el.disabled) return;
      if (!['skill', 'act'].includes(attr)) play('click');
      fn(el.dataset[attr.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())]!);
    });
  });
}

function bind() {
  on('act', v => actions[v]?.());
  on('go', v => {
    ui.invSel = null;
    ui.mapSel = v === 'map' ? ui.mapSel : null;
    if (v === 'title') persist();
    show(v as Screen);
  });
  on('pick', v => {
    captureName();
    const key = (['origin', 'path', 'companion'] as const)[ui.creationStep];
    s[key] = v;
    render();
  });
  on('mapsel', v => { ui.mapSel = v; render() });
  on('region', v => act(() => startRun(s, v)));
  on('room', v => { play('door'); act(() => enterRoom(s, Number(v))) });
  on('choice', v => act(() => resolveEvent(s, Number(v))));
  on('skill', v => act(() => useSkill(s, v)));
  on('item', v => { act(() => useItem(s, v)); if (!s.inventory.includes(v)) ui.invSel = null; render() });
  on('equip', v => { equip(s, v); ui.invSel = null; render() });
  on('unequip', v => { unequip(s, v as keyof GameState['equipment']); render() });
  on('invsel', v => { ui.invSel = ui.invSel === v ? null : v; render() });
  on('buy', v => { buy(s, v); toast('Purchased. Find it in your Equipment.') });
  on('sell', v => { sell(s, v); render() });
  on('learn', v => { learn(s, v); render() });
  on('stat', v => { spendStat(s, v as Stat); render() });
  on('talent', v => { learnTalent(s, v); play('level'); render() });
  on('accept', v => { acceptQuest(s, v); render() });
  on('claim', v => act(() => claimQuest(s, v)));
  on('chartab', v => { ui.charTab = v as V.UI['charTab']; render() });
  on('jtab', v => { ui.journalTab = v as V.UI['journalTab']; render() });
  on('shoptab', v => { ui.shopTab = v as V.UI['shopTab']; render() });
  on('ending', v => { chooseEnding(s, v); play('win'); render() });
  on('setting', v => {
    const k = v as 'sfx' | 'music' | 'haptics' | 'motion';
    meta.settings[k] = !meta.settings[k];
    persistMeta();
    if (k === 'music') setMusic(meta.settings.music);
    render();
  });
  on('text', v => { meta.settings.textSize = v as Settings['textSize']; persistMeta(); render() });
  on('diff', v => { meta.settings.difficulty = v as Settings['difficulty']; persistMeta(); render() });
}

document.addEventListener('pointerdown', () => { if (meta.settings.music) setMusic(true) }, { once: true });
applySettings();
render();
void nativeReady();
window.setTimeout(() => { if (screen === 'splash') afterSplash() }, 2600);
