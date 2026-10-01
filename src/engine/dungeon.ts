import { DUNGEON_MAP } from '../data/world';
import { MAIN_INDEX } from '../data/story';
import type { Choice, Eff, Ent, Floor, GameState, StoryEvent } from '../types';
import { areaLevel, clamp, clampVitals, hooks, pick, push, rand, scaleSan, stats } from './core';
import { BLOCKING_ENTS, WALKABLE, computeFov, genFloor } from './dungeongen';
import { commit, enqueue } from './flow';
import { addItem, goldFor, rollConsumable, rollGear } from './loot';
import { cond, questEvent, hasItem } from './quests';
import { locationTriggers, openEvent, openEventById } from './story';

export const STEPS_PER_SUPPLY = 14;
const WHISPERS = ['Something whispers your name from behind the wall.', 'You hear your own footsteps, half a beat late.', 'The shadows lean toward you.', 'A child’s laugh, very close, very cold.', 'The walls breathe.', 'You count three shadows. Then one.'];

export const floorOf = (s: GameState): Floor => s.run!.floors[s.run!.floor]!;
export const tileAt = (f: Floor, x: number, y: number) => (x < 0 || y < 0 || x >= f.w || y >= f.h ? '#' : f.tiles[y * f.w + x]);
function setTile(f: Floor, x: number, y: number, ch: string) { const i = y * f.w + x; f.tiles = f.tiles.slice(0, i) + ch + f.tiles.slice(i + 1) }
export const entAt = (f: Floor, x: number, y: number) => f.ents.find(e => e.x === x && e.y === y && !e.done);

export function visibleSet(s: GameState): Uint8Array {
  const f = floorOf(s);
  return computeFov(f.tiles, f.w, f.h, s.run!.px, s.run!.py, stats(s).sight);
}
function refreshSeen(s: GameState) {
  const f = floorOf(s);
  const vis = visibleSet(s);
  const seen = f.seen.split('');
  for (let i = 0; i < vis.length; i++) if (vis[i]) seen[i] = '1';
  f.seen = seen.join('');
}

export function gotoFloor(s: GameState, idx: number, arrive: 'down' | 'up') { loadFloor(s, idx, arrive) }
function loadFloor(s: GameState, idx: number, arrive: 'down' | 'up') {
  const run = s.run!;
  const def = DUNGEON_MAP.get(run.dungeon)!;
  if (!run.floors[idx]) {
    const owned = def.secretItem && (hasItem(s, def.secretItem) || s.flags[`got_${def.secretItem}`]);
    run.floors[idx] = genFloor(def, idx, run.seed, { bossRespawn: false, secretItem: owned ? undefined : def.secretItem, mainCleared: !!def.mainBoss && s.cleared.includes(def.id) });
  }
  run.floor = idx;
  const f = run.floors[idx]!;
  const at = arrive === 'down' ? f.up : f.down ?? f.up;
  run.px = at![0];
  run.py = at![1];
  refreshSeen(s);
}

export function enterDungeon(s: GameState, id: string): boolean {
  const def = DUNGEON_MAP.get(id);
  if (!def) return false;
  if (def.gate && s.main < (MAIN_INDEX.get(def.gate) ?? 0)) { push(s, `${def.name} is sealed to you. The story has not led you here yet.`, 'bad'); return false }
  if (def.cond && !cond(s, def.cond)) { push(s, `${def.name} is sealed to you. The story has not led you here yet.`, 'bad'); return false }
  const sigil = ['', 'blade', 'ward', 'eye'][s.flags.pending_sigil ?? 0] || null;
  s.flags.pending_sigil = 0;
  s.run = { dungeon: id, floor: 0, seed: rand(1, 1 << 30), px: 0, py: 0, floors: [], keys: 0, steps: 0, sigil, found: [], gold: 0, kills: 0, light: 0, torch: 0, bossDown: false, facing: 0 };
  s.status = {};
  s.town = null;
  loadFloor(s, 0, 'down');
  s.screen = 'dungeon';
  s.ret = 'dungeon';
  if (!s.world.visited.includes(id)) s.world.visited.push(id);
  if (!s.world.known.includes(id)) s.world.known.push(id);
  push(s, `You enter ${def.name}.`);
  questEvent(s, { type: 'reach', id });
  locationTriggers(s, id);
  commit(s);
  return true;
}

export const onEntrance = (s: GameState) => !!s.run && s.run.floor === 0 && floorOf(s).up?.[0] === s.run.px && floorOf(s).up?.[1] === s.run.py;
export const onExit = (s: GameState) => !!s.run && !!entAt(floorOf(s), s.run.px, s.run.py) && entAt(floorOf(s), s.run.px, s.run.py)!.k === 'exit';

export function leaveDungeon(s: GameState, force = false) {
  const run = s.run;
  if (!run || s.screen !== 'dungeon') return;
  if (!force && !onEntrance(s) && !onExit(s)) return;
  const def = DUNGEON_MAP.get(run.dungeon)!;
  s.world.x = def.pos[0];
  s.world.y = def.pos[1];
  s.run = null;
  s.status = {};
  s.screen = 'world';
  s.ret = 'world';
  s.day++;
  push(s, `You emerge from ${def.name}.`);
  commit(s);
}

function changeFloor(s: GameState, delta: 1 | -1) {
  const run = s.run!;
  const def = DUNGEON_MAP.get(run.dungeon)!;
  const idx = run.floor + delta;
  if (idx < 0 || idx >= def.floors) return;
  loadFloor(s, idx, delta > 0 ? 'down' : 'up');
  push(s, delta > 0 ? `You descend to depth ${idx + 1}.` : `You climb to depth ${idx + 1}.`);
}

const ch = (label: string, text: string, eff: Eff[], o: Partial<Choice> = {}): Choice => ({ label, text, eff, ...o });
const done: Eff = { t: 'flag', k: '__done' };
const WAYSTONE: StoryEvent = { id: 'waystone', title: 'A Forgotten Waystone', icon: 'sigil', text: 'A hooded figure with no face is carved into the wall. Fresh candles burn at its feet, though no one has been here for a century. It offers one sigil for this expedition.', choices: [
  ch('Sigil of Blades', 'Bonus damage until you leave this place.', [{ t: 'sigil', k: 'blade' }, done]),
  ch('Sigil of Warding', 'Bonus armor until you leave this place.', [{ t: 'sigil', k: 'ward' }, done]),
  ch('Sigil of the Open Eye', '+10% critical chance and restore some sanity.', [{ t: 'sigil', k: 'eye' }, { t: 'san', n: 5 }, done]),
  ch('Leave it be', 'Not every gift is free.', [{ t: 'log', text: 'You leave the waystone in peace.' }])] };
const CAMP: StoryEvent = { id: 'camp', title: 'A Safe Hollow', icon: 'campfire', text: 'A dry hollow sheltered from the dark. Old ashes suggest others rested here. None of them left.', choices: [
  ch('Make camp', 'Spend 1 supply: restore 45% health and sanity.', [{ t: 'hpPct', n: 45 }, { t: 'san', n: 6 }, { t: 'rand', p: 0.12, eff: [{ t: 'log', text: 'Something found you in your sleep.', tone: 'bad' }, { t: 'fight', enemy: '@normal' }] }, done], { cost: { supplies: 1 } }),
  ch('Scavenge the ashes', 'Search the belongings of those who stayed.', [{ t: 'supplies', n: 2 }, { t: 'consumable' }, done], { check: { stat: 'cunning' }, fail: [{ t: 'log', text: 'The ashes stir. They were not ashes.', tone: 'bad' }, { t: 'fight', enemy: '@normal' }, done] }),
  ch('Press on', 'Rest is for the living.', [{ t: 'log', text: 'You leave the hollow.' }])] };
const FOUNTAIN: StoryEvent = { id: 'fountain', title: 'A Still Fountain', icon: 'fountain', text: 'A stone fountain gurgles in the dark. The water is clear and very cold, and it shows you a sky you have never seen.', choices: [
  ch('Drink', 'Restore health and sanity.', [{ t: 'hpPct', n: 30 }, { t: 'san', n: 10 }, done]),
  ch('Bottle some', 'A vial for later.', [{ t: 'item', id: 'clearwater' }, done]),
  ch('Leave it', 'Suspicious water is a kind of wisdom.', [{ t: 'log', text: 'You leave the fountain alone.' }])] };
const PRISONER: StoryEvent = { id: 'prisoner', title: 'A Prisoner in Chains', icon: 'prisoner', text: 'A gaunt figure hangs in manacles, murmuring. “Please,” they say. “I know things. I know where things are.”', choices: [
  ch('Free them', 'Vigor to break the chains.', [{ t: 'loot', min: 'rare' }, { t: 'goldR', lo: 30, hi: 60 }, { t: 'xpL', m: 0.1 }, done], { check: { stat: 'vigor' }, fail: [{ t: 'hp', n: -6 }, { t: 'log', text: 'The chains hold. So does the pain.', tone: 'bad' }] }),
  ch('Question them', 'Cunning to separate truth from fear.', [{ t: 'lore' }, { t: 'reveal' }, done], { check: { stat: 'cunning' }, fail: [{ t: 'san', n: -4 }, { t: 'log', text: 'They tell you everything. It was not helpful.', tone: 'bad' }] }),
  ch('Leave them', 'You cannot save everyone.', [{ t: 'san', n: -2 }, done])] };

function tickSteps(s: GameState) {
  const run = s.run!;
  run.steps++;
  if (run.torch > 0) run.torch--;
  const st = stats(s);
  if (run.steps % STEPS_PER_SUPPLY === 0) {
    if (s.supplies > 0) s.supplies--;
    else { s.hp = Math.max(1, s.hp - Math.round(st.maxHp * 0.06)); s.sanity = Math.max(0, s.sanity - scaleSan(s, 2)); push(s, 'Without supplies, the dark gnaws at you.', 'bad') }
  }
  if (s.sanity < st.maxSanity * 0.25 && Math.random() < 0.05) push(s, pick(WHISPERS), 'bad');
  if (s.sanity <= 0 && run.steps % 6 === 0) { s.hp = Math.max(1, s.hp - Math.max(1, Math.round(st.maxHp * 0.015))); push(s, 'Your unravelled mind tears at you.', 'bad') }
  const f = floorOf(s);
  const chance = Math.min(0.9, 0.25 + st.cunning * 0.03);
  f.ents.forEach(e => { if (e.k === 'trap' && e.hidden && !e.done && Math.abs(e.x - run.px) <= 1 && Math.abs(e.y - run.py) <= 1 && Math.random() < chance) { e.hidden = false; push(s, 'You spot a trap.', 'good') } });
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (tileAt(f, run.px + dx, run.py + dy) === 'S' && Math.random() < 0.04 + st.cunning * 0.02) { setTile(f, run.px + dx, run.py + dy, '/'); push(s, 'A hidden passage grinds open!', 'epic') }
  }
  clampVitals(s);
}

function bfsFrom(f: Floor, sx: number, sy: number, radius: number) {
  const dist = new Map<number, number>();
  const q: number[] = [sy * f.w + sx];
  dist.set(q[0], 0);
  for (let i = 0; i < q.length; i++) {
    const c = q[i], x = c % f.w, y = Math.floor(c / f.w), d = dist.get(c)!;
    if (d >= radius) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, ni = ny * f.w + nx;
      if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h || dist.has(ni)) continue;
      if (!WALKABLE.has(f.tiles[ni])) continue;
      dist.set(ni, d + 1);
      q.push(ni);
    }
  }
  return dist;
}

export function engage(s: GameState, e: Ent, sneak: boolean) {
  const def = DUNGEON_MAP.get(s.run!.dungeon)!;
  const isBoss = e.k === 'boss';
  s.flags._ent = e.id;
  hooks.startFight(s, e.enemy!, e.rank ?? 'normal', { entId: e.id, from: 'dungeon', sneak, boss: isBoss && e.rank === 'boss' ? def.boss : undefined, noFlee: isBoss && e.rank === 'boss' });
}

function enemiesAct(s: GameState): boolean {
  const run = s.run!;
  const f = floorOf(s);
  const st = stats(s);
  const wake = clamp(0.3 - st.cunning * 0.012 - (s.talents.includes('shadowmeld') ? 0.12 : 0), 0.03, 0.4);
  const dist = bfsFrom(f, run.px, run.py, 13);
  const occ = new Set(f.ents.filter(e => !e.done && BLOCKING_ENTS.has(e.k)).map(e => e.y * f.w + e.x));
  for (const e of f.ents) {
    if (e.done || (e.k !== 'enemy' && e.k !== 'boss')) continue;
    if (e.cd && e.cd > 0) { e.cd--; continue }
    const d = Math.abs(e.x - run.px) + Math.abs(e.y - run.py);
    if (e.k === 'boss') { if (d <= 2) { engage(s, e, false); return true } continue }
    if (!e.awake) { if (d <= 3 && Math.random() < wake) { e.awake = true; push(s, 'Something stirs nearby.', 'bad') } continue }
    if (d === 1) { engage(s, e, false); return true }
    if (d > 10) continue;
    if (Math.random() > (e.rank === 'elite' ? 0.8 : 0.62)) continue;
    let best: [number, number] | null = null;
    let bd = dist.get(e.y * f.w + e.x) ?? 99;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = e.x + dx, ny = e.y + dy, ni = ny * f.w + nx;
      const nd = dist.get(ni);
      if (nd === undefined || nd >= bd || occ.has(ni) || (nx === run.px && ny === run.py)) continue;
      bd = nd; best = [nx, ny];
    }
    if (best) {
      occ.delete(e.y * f.w + e.x);
      e.x = best[0]; e.y = best[1];
      occ.add(e.y * f.w + e.x);
      if (Math.abs(e.x - run.px) + Math.abs(e.y - run.py) === 1) { engage(s, e, false); return true }
    }
  }
  return false;
}

function trap(s: GameState, e: Ent) {
  e.done = true;
  e.hidden = false;
  const st = stats(s);
  const L = areaLevel(s);
  if (Math.random() * 100 < st.dodge) { push(s, 'You leap clear of a trap.', 'good'); return }
  const kind = e.id % 4;
  const dmg = Math.max(2, Math.round(st.maxHp * 0.09 + L * 0.8));
  if (kind === 0) { s.hp = Math.max(1, s.hp - dmg); push(s, `Spikes lance up through the floor! (−${dmg} health)`, 'bad') }
  else if (kind === 1) { s.status.poison = 4; s.hp = Math.max(1, s.hp - Math.round(dmg / 2)); push(s, 'A cloud of green spores bursts around you. You are poisoned.', 'bad') }
  else if (kind === 2) { const f = floorOf(s); f.ents.forEach(x => { if (x.k === 'enemy' && !x.done) x.awake = true }); push(s, 'A bell shrieks through the dungeon. Everything is awake.', 'bad') }
  else { s.sanity = Math.max(0, s.sanity - scaleSan(s, 4)); push(s, 'A whisper crawls into your skull. (−sanity)', 'bad') }
}

function openChest(s: GameState, e: Ent) {
  e.done = true;
  const L = areaLevel(s);
  s.flags._ent = e.id;
  if (e.mimic) { push(s, 'The chest has teeth!', 'bad'); hooks.startFight(s, '@normal', 'normal', { from: 'dungeon', entId: undefined }); return }
  const gold = goldFor(s, L, e.ref === 'vault' ? 2.6 : e.ref === 'secret' ? 2 : 1.3);
  const items: string[] = [];
  const cons = rollConsumable(s, L).id;
  items.push(cons);
  const gearChance = e.ref === 'vault' ? 1 : e.ref === 'secret' ? 0.8 : 0.25;
  if (Math.random() < gearChance) items.push(rollGear(s, e.ref ? 'rare' : 'common', L).id);
  if (Math.random() < 0.3) items.push(rollConsumable(s, L).id);
  s.gold += gold;
  s.run!.gold += gold;
  items.forEach(i => addItem(s, i));
  enqueue(s, { k: 'reward', reward: { title: e.ref === 'vault' ? 'The Vault' : e.ref === 'secret' ? 'A Hidden Cache' : 'A Chest', gold, xp: 0, items, lines: [], icon: 'chest_open' } }, true);
}

function interact(s: GameState, e: Ent) {
  s.flags._ent = e.id;
  switch (e.k) {
    case 'enemy': case 'boss': engage(s, e, !e.awake && e.k === 'enemy'); return;
    case 'chest': openChest(s, e); return;
    case 'waystone': openEvent(s, WAYSTONE); return;
    case 'camp': openEvent(s, CAMP); return;
    case 'fountain': openEvent(s, FOUNTAIN); return;
    case 'prisoner': openEvent(s, PRISONER); return;
    case 'lore': {
      e.done = true;
      enqueue(s, { k: 'effects', eff: [{ t: 'lore' }, { t: 'xpL', m: 0.08 }] });
      push(s, 'You read the inscription.');
      return;
    }
  }
}

function stepOn(s: GameState, e: Ent) {
  const run = s.run!;
  switch (e.k) {
    case 'gold': { e.done = true; const g = goldFor(s, areaLevel(s), 0.6); s.gold += g; run.gold += g; push(s, `You find ${g} gold.`, 'good'); break }
    case 'potion': { e.done = true; const d = rollConsumable(s, areaLevel(s)); addItem(s, d.id); push(s, `You find ${d.name}.`, 'good'); break }
    case 'key': e.done = true; run.keys++; push(s, 'You pick up a rusted key.', 'good'); break;
    case 'questitem': {
      e.done = true;
      addItem(s, e.ref!);
      s.flags[`got_${e.ref}`] = 1;
      questEvent(s, { type: 'fetch' });
      enqueue(s, { k: 'reward', reward: { title: 'A Keepsake', gold: 0, xp: 0, items: [e.ref!], lines: ['You have found something that mattered to someone.'], icon: 'quest' } }, true);
      break;
    }
    case 'trap': trap(s, e); break;
    case 'event': { e.done = true; openEventById(s, e.ref!); break }
    case 'exit': leaveDungeon(s, true); break;
  }
}

function afterMove(s: GameState) {
  tickSteps(s);
  refreshSeen(s);
  if (s.screen === 'dungeon') enemiesAct(s);
}

export function moveDungeon(s: GameState, dx: number, dy: number) {
  const run = s.run;
  if (!run || s.screen !== 'dungeon') return;
  const f = floorOf(s);
  const nx = run.px + dx, ny = run.py + dy;
  run.facing = dx > 0 ? 0 : dx < 0 ? 2 : dy > 0 ? 1 : 3;
  const t = tileAt(f, nx, ny);
  const ent = entAt(f, nx, ny);
  if (ent && BLOCKING_ENTS.has(ent.k)) {
    interact(s, ent);
    if (s.screen === 'dungeon') { afterMove(s) }
    commit(s);
    return;
  }
  if (t === '#') { return }
  if (t === 'S') {
    if (Math.random() < 0.3 + stats(s).cunning * 0.04) { setTile(f, nx, ny, '/'); push(s, 'You find a hidden passage!', 'epic') } else push(s, 'The wall is cold and solid. Too solid.');
    afterMove(s); commit(s); return;
  }
  if (t === '+') { setTile(f, nx, ny, '/'); push(s, 'You open the door.'); afterMove(s); commit(s); return }
  if (t === 'L') {
    if (run.keys > 0) { run.keys--; setTile(f, nx, ny, '/'); push(s, 'The rusted key turns. The vault door swings open.', 'good') }
    else if (Math.random() < 0.15 + stats(s).cunning * 0.02) { setTile(f, nx, ny, '/'); push(s, 'You pick the lock.', 'good') }
    else push(s, 'The door is locked. You need a key.', 'bad');
    afterMove(s); commit(s); return;
  }
  if (!WALKABLE.has(t)) return;
  run.px = nx; run.py = ny;
  if (t === '>') { changeFloor(s, 1); tickSteps(s); commit(s); return }
  if (t === '<' && run.floor > 0) { changeFloor(s, -1); tickSteps(s); commit(s); return }
  const on = entAt(f, nx, ny);
  if (on) stepOn(s, on);
  if (!s.run) { commit(s); return }
  afterMove(s);
  commit(s);
}

export function searchDungeon(s: GameState) {
  const run = s.run;
  if (!run || s.screen !== 'dungeon') return;
  const f = floorOf(s);
  let found = 0;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const x = run.px + dx, y = run.py + dy;
    if (tileAt(f, x, y) === 'S' && Math.random() < 0.55 + stats(s).cunning * 0.03) { setTile(f, x, y, '/'); found++ }
    f.ents.forEach(e => { if (e.k === 'trap' && e.hidden && e.x === x && e.y === y) { e.hidden = false; found++ } });
  }
  push(s, found ? `Your search turns up ${found} hidden thing${found > 1 ? 's' : ''}.` : 'You search carefully, and find nothing.', found ? 'good' : 'plain');
  afterMove(s);
  commit(s);
}

export function dungeonProgress(s: GameState) {
  const run = s.run!;
  const def = DUNGEON_MAP.get(run.dungeon)!;
  return { floor: run.floor + 1, floors: def.floors, name: def.name, def };
}
