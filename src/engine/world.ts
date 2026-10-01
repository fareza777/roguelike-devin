import { LANDMARK_MAP, DUNGEON_MAP, GATE_MERIDIAN, GATE_SOLENNE, MAP_H, MAP_W, TOWN_MAP, ZONES } from '../data/world';
import { MAIN, MAIN_INDEX } from '../data/story';
import type { GameState } from '../types';
import { clamp, hooks, pick, push, rand, scaleSan, stats, zoneAt } from './core';
import { commit } from './flow';
import { cond, questEvent } from './quests';
import { locationTriggers, openEventById, startScene } from './story';
import { ENC, IMPASSABLE, getWorld, poiAt, tileAt, worldIdx, type Poi } from './worldgen';

export const STEPS_PER_DAY = 24;
export const STEPS_PER_RATION = 16;
const WHISPERS = ['The road is very quiet. Then it is not.', 'Your shadow lags behind you.', 'Something is counting your footsteps.', 'The wind says a name. It might be yours.'];

export function isExplored(s: GameState, x: number, y: number) { return s.world.explored[worldIdx(x, y)] === '1' }

export function revealAround(s: GameState, r = 4) {
  const w = s.world;
  const arr = w.explored.split('');
  let changed = false;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = w.x + dx, y = w.y + dy;
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H || dx * dx + dy * dy > r * r + 1) continue;
    const i = worldIdx(x, y);
    if (arr[i] !== '1') { arr[i] = '1'; changed = true }
    const poi = getWorld().poi.get(i);
    if (poi && poi.kind !== 'landmark' && !w.known.includes(poi.id)) {
      w.known.push(poi.id);
      const name = poi.kind === 'town' ? TOWN_MAP.get(poi.id)?.name : DUNGEON_MAP.get(poi.id)?.name;
      push(s, `You spot ${name} in the distance.`, 'epic');
    }
  }
  if (changed) w.explored = arr.join('');
}

export function gateOpen(s: GameState, ch: string) {
  if (ch === 'G') return s.main >= (MAIN_INDEX.get('m21') ?? 99);
  if (ch === 'H') return s.main >= (MAIN_INDEX.get('m24') ?? 99);
  return true;
}
export const blocked = (s: GameState, x: number, y: number) => {
  const ch = tileAt(x, y);
  return IMPASSABLE.has(ch) || !gateOpen(s, ch);
};

export const currentPoi = (s: GameState): Poi | undefined => poiAt(s.world.x, s.world.y);

export function enterTown(s: GameState, id: string) {
  const t = TOWN_MAP.get(id);
  if (!t) return;
  s.town = id;
  s.screen = 'town';
  s.ret = 'town';
  s.world.x = t.pos[0];
  s.world.y = t.pos[1];
  if (!s.world.visited.includes(id)) s.world.visited.push(id);
  if (!s.world.known.includes(id)) s.world.known.push(id);
  push(s, `You arrive in ${t.name}.`);
  questEvent(s, { type: 'reach', id });
  locationTriggers(s, id);
  commit(s);
}

export function leaveTown(s: GameState) {
  const t = s.town && TOWN_MAP.get(s.town);
  if (!t || s.screen !== 'town') return;
  s.town = null;
  s.screen = 'world';
  s.ret = 'world';
  s.world.x = t.pos[0];
  s.world.y = t.pos[1];
  revealAround(s);
  commit(s);
}

function nearTown(s: GameState, r: number) {
  return [...TOWN_MAP.values()].some(t => Math.abs(t.pos[0] - s.world.x) + Math.abs(t.pos[1] - s.world.y) <= r);
}

const MERCY: Record<string, string> = {
  grave_widow: 'mercy_widow', grave_hart: 'mercy_hart', grave_grist: 'mercy_grist', grave_vhal: 'mercy_vhal',
};

function triggerLandmark(s: GameState, id: string): boolean {
  const lm = LANDMARK_MAP.get(id);
  if (!lm) return false;
  if (lm.cond && !cond(s, lm.cond)) {
    if (lm.hint && !s.flags[`hint_${id}`]) { s.flags[`hint_${id}`] = 1; push(s, lm.hint) }
    return false;
  }
  if ((MERCY[id] && s.flags[MERCY[id]]) || (lm.once && s.world.done.includes(id))) return false;
  if (lm.scene) { startScene(s, lm.scene); return true }
  if (lm.once) s.world.done.push(id);
  if (lm.event) openEventById(s, lm.event);
  questEvent(s, { type: 'reach', id });
  return true;
}

export function approachHere(s: GameState) {
  if (s.screen !== 'world') return;
  const poi = currentPoi(s);
  if (poi?.kind !== 'landmark') return;
  const before = s.log[0];
  if (!triggerLandmark(s, poi.id) && s.log[0] === before) push(s, 'The place is quiet. Whatever it wanted, it has had.');
  commit(s);
}

export function moveWorld(s: GameState, dx: number, dy: number) {
  if (s.screen !== 'world') return;
  const w = s.world;
  const nx = w.x + dx, ny = w.y + dy;
  w.facing = dx > 0 ? 0 : dx < 0 ? 2 : dy > 0 ? 1 : 3;
  if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) return;
  const ch = tileAt(nx, ny);
  if (!gateOpen(s, ch)) { push(s, ch === 'G' ? 'A wall of golden mist bars the way south. It does not part for you. Yet.' : 'The gate to the Black Meridian is sealed by five seals. Four have been broken. The fifth has not.', 'bad'); commit(s); return }
  if (IMPASSABLE.has(ch)) return;
  w.x = nx; w.y = ny;
  w.steps++;
  const st = stats(s);
  if (w.steps % STEPS_PER_DAY === 0) s.day++;
  if (w.steps % STEPS_PER_RATION === 0) {
    if (s.supplies > 0) s.supplies--;
    else { s.hp = Math.max(1, s.hp - Math.round(st.maxHp * 0.05)); s.sanity = Math.max(0, s.sanity - scaleSan(s, 1)); push(s, 'Hunger gnaws at you as you walk.', 'bad') }
  }
  if (s.sanity < st.maxSanity * 0.25 && Math.random() < 0.04) push(s, pick(WHISPERS), 'bad');
  revealAround(s);
  const poi = poiAt(nx, ny);
  if (poi?.kind === 'town') { enterTown(s, poi.id); return }
  if (poi?.kind === 'landmark') { triggerLandmark(s, poi.id); commit(s); return }
  if (poi?.kind === 'dungeon') { push(s, `${DUNGEON_MAP.get(poi.id)?.name} lies before you. Enter when you are ready.`); commit(s); return }
  const cd = s.flags._enc ?? 0;
  s.flags._enc = Math.max(0, cd - 1);
  if (cd <= 0 && !nearTown(s, 2) && Math.random() < 0.045 * (ENC[ch] ?? 1)) {
    s.flags._enc = 6;
    const zone = zoneAt(nx, ny);
    const elite = Math.random() < 0.06;
    push(s, elite ? 'Something large steps out of the dark.' : 'You are ambushed!', 'bad');
    hooks.startFight(s, elite ? '@elite' : '@normal', elite ? 'elite' : 'normal', { from: 'world', lvl: clamp(zone.lvl + rand(0, 1), 1, 30) });
  }
  commit(s);
}

export function travelCost(s: GameState, townId: string) {
  const t = TOWN_MAP.get(townId)!;
  const d = Math.abs(t.pos[0] - s.world.x) + Math.abs(t.pos[1] - s.world.y);
  return { supplies: Math.max(1, Math.ceil(d / 10)), days: Math.max(1, Math.ceil(d / 12)), dist: d };
}

export function canFastTravel(s: GameState, townId: string) {
  if (!s.world.visited.includes(townId) || (s.screen !== 'world' && s.screen !== 'map') || s.town === townId) return false;
  if (townId === 'solenne' && !gateOpen(s, 'G')) return false;
  return travelCost(s, townId).supplies <= s.supplies;
}

export function fastTravel(s: GameState, townId: string) {
  if (!canFastTravel(s, townId)) return;
  const c = travelCost(s, townId);
  s.supplies -= c.supplies;
  s.day += c.days;
  push(s, `You travel to ${TOWN_MAP.get(townId)!.name}. ${c.days} day${c.days > 1 ? 's' : ''} pass.`);
  enterTown(s, townId);
}

export function objectiveTarget(s: GameState): { id: string; name: string; pos: [number, number] } | null {
  const at = MAIN[Math.min(s.main, MAIN.length - 1)].at;
  if (!at) return null;
  const t = TOWN_MAP.get(at);
  if (t) return { id: at, name: t.name, pos: t.pos };
  const d = DUNGEON_MAP.get(at);
  return d ? { id: at, name: d.name, pos: d.pos } : null;
}

export function zoneInfo(s: GameState) { return zoneAt(s.world.x, s.world.y) }
export const GATES = { GATE_SOLENNE, GATE_MERIDIAN, ZONES };

export function campWorld(s: GameState) {
  if (s.screen !== 'world' || s.supplies < 1) return;
  s.supplies--;
  const st = stats(s);
  s.hp = Math.min(st.maxHp, s.hp + Math.round(st.maxHp * 0.28));
  s.sanity = Math.min(st.maxSanity, s.sanity + Math.round(st.maxSanity * 0.18));
  s.status = {};
  s.world.steps += 10;
  push(s, 'You make a cold camp and sleep in snatches.', 'good');
  if (Math.random() < 0.2 && !nearTown(s, 2)) {
    const zone = zoneAt(s.world.x, s.world.y);
    push(s, 'Something found your camp in the night.', 'bad');
    hooks.startFight(s, '@normal', 'normal', { from: 'world', lvl: clamp(zone.lvl + rand(0, 1), 1, 30) });
  }
  commit(s);
}
