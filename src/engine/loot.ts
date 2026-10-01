import { BOSS_LOOT } from '../data/enemies';
import { ITEMS } from '../data/items';
import { LORE } from '../data/story';
import type { GameState, ItemDef, Rarity } from '../types';
import { LEVEL_CAP, clamp, clampVitals, pick, push, rand, stats, tierForLevel, xpFor } from './core';
import { questEvent } from './quests';

const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'relic'];
const RARITY_WEIGHT: Record<Rarity, number> = { common: 55, rare: 30, epic: 12, relic: 3 };
const GEAR = ITEMS.filter(x => !x.unique && x.slot !== 'consumable' && x.slot !== 'junk');
const CONS = ITEMS.filter(x => x.slot === 'consumable');
const JUNK = ITEMS.filter(x => x.slot === 'junk' && !x.unique);

export function gainXp(s: GameState, amount: number, lines?: string[]) {
  if (amount <= 0) return;
  s.xp += amount;
  while (s.xp >= s.xpNext && s.level < LEVEL_CAP) {
    s.xp -= s.xpNext;
    s.level++;
    s.xpNext = xpFor(s.level);
    s.statPoints += 2;
    s.talentPoints += 1;
    s.hp = stats(s).maxHp;
    s.sanity = stats(s).maxSanity;
    const line = `Level ${s.level}! +2 attribute points, +1 talent point.`;
    push(s, line, 'epic');
    lines?.push(line);
  }
  if (s.level >= LEVEL_CAP) s.xp = Math.min(s.xp, s.xpNext - 1);
  questEvent(s, { type: 'level' });
}

const luckMult = (s: GameState) => 1 + stats(s).luck / 100 + (s.talents.includes('scavenger') ? 0.15 : 0) + (s.companion === 'Nix' ? 0.1 : 0);

function weighted<T extends ItemDef>(list: T[], s: GameState): T {
  const luck = luckMult(s);
  const w = list.map(x => ({ x, w: RARITY_WEIGHT[x.rarity] * (x.rarity === 'common' ? 1 : luck) }));
  let r = Math.random() * w.reduce((a, b) => a + b.w, 0);
  return w.find(o => (r -= o.w) < 0)?.x ?? list[0];
}

export function rollGear(s: GameState, min: Rarity, lvl: number): ItemDef {
  const tier = tierForLevel(lvl);
  const mi = RARITY_ORDER.indexOf(min);
  let pool = GEAR.filter(x => x.tier <= tier && x.tier >= Math.max(0, tier - 1) && RARITY_ORDER.indexOf(x.rarity) >= mi);
  if (!pool.length) pool = GEAR.filter(x => x.tier <= tier && RARITY_ORDER.indexOf(x.rarity) >= mi);
  if (!pool.length) pool = GEAR.filter(x => x.tier <= tier);
  return weighted(pool, s);
}
export function rollConsumable(s: GameState, lvl: number): ItemDef {
  const tier = tierForLevel(lvl);
  const pool = CONS.filter(x => x.tier <= tier && x.tier >= Math.max(0, tier - 2));
  return weighted(pool.length ? pool : CONS.filter(x => x.tier <= tier), s);
}
export function rollJunk(lvl: number): ItemDef {
  const tier = tierForLevel(lvl);
  const pool = JUNK.filter(x => x.tier <= tier && x.tier >= Math.max(0, tier - 1));
  return pick(pool.length ? pool : JUNK.filter(x => x.tier <= tier));
}

export function rollDrops(s: GameState, rank: 'normal' | 'elite' | 'boss', lvl: number, bossId?: string): string[] {
  const luck = luckMult(s);
  const items: string[] = [];
  if (rank === 'normal') {
    if (Math.random() < 0.3 * luck) items.push(rollConsumable(s, lvl).id);
    if (Math.random() < 0.22 * luck) items.push(rollJunk(lvl).id);
    if (Math.random() < 0.09 * luck) items.push(rollGear(s, 'common', lvl).id);
  } else if (rank === 'elite') {
    items.push(rollGear(s, 'rare', lvl).id);
    if (Math.random() < 0.6) items.push(rollConsumable(s, lvl).id);
    if (Math.random() < 0.6 * luck) items.push(rollJunk(lvl).id);
  } else {
    items.push(rollGear(s, 'epic', lvl).id, rollConsumable(s, lvl).id, rollConsumable(s, lvl).id, rollJunk(lvl).id);
    (BOSS_LOOT[bossId ?? ''] ?? []).forEach(id => { if (!s.inventory.includes(id) && !Object.values(s.equipment).includes(id)) items.push(id) });
  }
  return items;
}

export function goldFor(s: GameState, lvl: number, mult: number) {
  return Math.round((6 + lvl * 3.4 + rand(0, 5)) * mult * luckMult(s));
}
export function xpForKill(lvl: number, mult: number) { return Math.round((10 + 5.5 * lvl) * mult) }

export function addLore(s: GameState, id?: string): string | null {
  const known = new Set(s.lore);
  let entry = id ? LORE.find(l => l[0] === id) : undefined;
  if (entry && known.has(entry[0])) return null;
  if (!entry) {
    const missing = LORE.filter(l => !known.has(l[0]));
    if (!missing.length) return null;
    entry = pick(missing);
  }
  s.lore.push(entry[0]);
  questEvent(s, { type: 'lore' });
  push(s, `Lore recovered: ${entry[0]}`, 'epic');
  return entry[0];
}

export function addItem(s: GameState, id: string, n = 1) {
  for (let i = 0; i < n; i++) s.inventory.push(id);
  clampVitals(s);
}
export const removeItem = (s: GameState, id: string) => { const i = s.inventory.findIndex(x => x === id || x.startsWith(`${id}+`)); if (i >= 0) s.inventory.splice(i, 1) };
export const clampN = clamp;
