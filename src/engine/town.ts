import { ITEMS } from '../data/items';
import { QUEST_MAP } from '../data/quests';
import { SKILL_MAP, LOADOUT_MAX, TALENTS, TALENT_MAP } from '../data/skills';
import { DUNGEONS, TOWN_MAP, TOWN_SCHOOLS } from '../data/world';
import { hashStr, mulberry32, shuffle } from '../rng';
import type { GameState, ItemDef, Rarity, Slot, Stat } from '../types';
import { MAX_UPGRADE, SLOTS, baseItem, canUpgrade, clampVitals, item, pick, push, save, splitId, stats, upgradeCost } from './core';
import { commit, enqueue } from './flow';
import { addItem, gainXp } from './loot';
import { claimable } from './quests';

export const SUPPLY_PRICE = 16;
const GEAR = ITEMS.filter(x => !x.unique && x.slot !== 'consumable' && x.slot !== 'junk');
const CONS = ITEMS.filter(x => x.slot === 'consumable');
const RARITY_OK: Record<Rarity, number> = { common: 0, rare: 2, epic: 3, relic: 9 };

export function innCost(s: GameState) {
  const t = s.town ? TOWN_MAP.get(s.town) : null;
  return Math.round((t?.innPrice ?? 10) * (1 + s.level * 0.18));
}
export function rest(s: GameState) {
  const cost = innCost(s);
  if (s.gold < cost || !s.town) return;
  s.gold -= cost;
  s.day++;
  s.hp = stats(s).maxHp;
  s.sanity = stats(s).maxSanity;
  s.status = {};
  push(s, `You sleep at the inn in ${TOWN_MAP.get(s.town)!.name}. The world is still standing when you wake.`, 'good');
  commit(s);
}

export function shopStock(s: GameState, townId: string): ItemDef[] {
  const t = TOWN_MAP.get(townId);
  if (!t) return [];
  const rng = mulberry32(hashStr(`${townId}:${Math.floor(s.day / 6)}`));
  const tier = t.tier;
  const cons = CONS.filter(x => x.tier <= tier && (x.rarity !== 'epic' || tier >= 3) && (x.tier === 0 || rng() < 0.85));
  const eligible = GEAR.filter(x => x.tier <= tier && x.tier >= Math.max(0, tier - 1) && RARITY_OK[x.rarity] <= tier + (x.rarity === 'epic' ? 0 : 1));
  const tags = new Set(t.shopTags);
  const preferred = eligible.filter(x => tags.has(x.family ?? ''));
  const others = shuffle(rng, eligible.filter(x => !tags.has(x.family ?? ''))).slice(0, 10);
  return [...cons, ...preferred, ...others];
}

export const sellPrice = (def: ItemDef) => (def.unique && def.slot === 'junk' ? 0 : def.slot === 'junk' ? Math.round(def.price * 0.85) : Math.max(1, Math.floor(def.price * 0.4)));
export const canSell = (id: string) => { const d = item(id); return !!d && sellPrice(d) > 0 };

export function buy(s: GameState, id: string): boolean {
  const def = item(id);
  if (!def || s.gold < def.price) return false;
  s.gold -= def.price;
  addItem(s, id);
  push(s, `Bought ${def.name}.`, 'good');
  save(s);
  return true;
}
export function sell(s: GameState, id: string) {
  const idx = s.inventory.indexOf(id);
  const def = item(id);
  if (idx < 0 || !def || !canSell(id)) return;
  s.inventory.splice(idx, 1);
  s.gold += sellPrice(def);
  push(s, `Sold ${def.name}.`);
  save(s);
}
export function sellAllJunk(s: GameState) {
  let total = 0;
  s.inventory = s.inventory.filter(id => { const d = item(id); if (d?.slot === 'junk' && canSell(id)) { total += sellPrice(d); return false } return true });
  s.gold += total;
  if (total) push(s, `Sold your junk for ${total} gold.`, 'good');
  save(s);
  return total;
}
export function buySupplies(s: GameState) {
  if (s.gold < SUPPLY_PRICE) return;
  s.gold -= SUPPLY_PRICE;
  s.supplies += 2;
  save(s);
}

export function equip(s: GameState, id: string) {
  const def = item(id);
  const idx = s.inventory.indexOf(id);
  if (!def || !SLOTS.includes(def.slot as Slot) || idx < 0 || s.screen === 'combat') return;
  const slot = def.slot as Slot;
  s.inventory.splice(idx, 1);
  const prev = s.equipment[slot];
  if (prev) s.inventory.push(prev);
  s.equipment[slot] = id;
  push(s, `Equipped ${def.name}.`, 'good');
  clampVitals(s);
  save(s);
}
export function unequip(s: GameState, slot: Slot) {
  const id = s.equipment[slot];
  if (!id || s.screen === 'combat') return;
  s.equipment[slot] = null;
  s.inventory.push(id);
  clampVitals(s);
  save(s);
}

export function upgradeItem(s: GameState, id: string, equipped: Slot | null) {
  const cost = upgradeCost(id);
  if (!canUpgrade(id) || s.gold < cost) return false;
  const [base, up] = splitId(id);
  const next = `${base}+${up + 1}`;
  if (equipped) s.equipment[equipped] = next;
  else { const i = s.inventory.indexOf(id); if (i < 0) return false; s.inventory[i] = next }
  s.gold -= cost;
  push(s, `The smith reinforces your ${baseItem(id)?.name}. (+${up + 1})`, 'good');
  clampVitals(s);
  save(s);
  return up + 1 <= MAX_UPGRADE;
}

export function cleanseCost(s: GameState) { return Math.round((60 + s.level * 14) * (1 + s.corruption * 0.25)) }
export function cleanse(s: GameState) {
  const cost = cleanseCost(s);
  if (s.corruption <= 0 || s.gold < cost) return;
  s.gold -= cost;
  s.corruption--;
  push(s, 'The wardhouse’s fire burns a little of the dark out of you.', 'good');
  clampVitals(s);
  save(s);
}
export const sigilCost = (s: GameState) => 40 + s.level * 9;
export function buySigil(s: GameState, kind: 1 | 2 | 3) {
  const cost = sigilCost(s);
  if (s.gold < cost) return;
  s.gold -= cost;
  s.flags.pending_sigil = kind;
  push(s, 'A sigil settles on your skin. It will wake when you next enter a dungeon.', 'good');
  save(s);
}
export function quietHour(s: GameState) {
  if (s.flags[`quiet_${s.day}`]) return false;
  s.flags[`quiet_${s.day}`] = 1;
  s.sanity = Math.min(stats(s).maxSanity, s.sanity + Math.round(stats(s).maxSanity * 0.35));
  push(s, 'You sit in the quiet. Some of the whispering stops.', 'good');
  save(s);
  return true;
}

export function schoolsHere(s: GameState) { return (s.town && TOWN_SCHOOLS[s.town]) || [] }
export function skillPrice(id: string) { return SKILL_MAP.get(id)?.price ?? 0 }
export function learn(s: GameState, id: string) {
  const sk = SKILL_MAP.get(id);
  if (!sk || s.skills.includes(id) || s.gold < sk.price || s.level < sk.level) return;
  s.gold -= sk.price;
  s.skills.push(id);
  if (s.loadout.length < LOADOUT_MAX) s.loadout.push(id);
  push(s, `You learn ${sk.name}.`, 'good');
  save(s);
}
export function toggleLoadout(s: GameState, id: string) {
  if (!s.skills.includes(id)) return;
  const i = s.loadout.indexOf(id);
  if (i >= 0) s.loadout.splice(i, 1);
  else if (s.loadout.length < LOADOUT_MAX) s.loadout.push(id);
  save(s);
}

export function spendStat(s: GameState, stat: Stat) {
  if (s.statPoints <= 0) return;
  s.statPoints--;
  s[stat]++;
  if (stat === 'vigor') s.hp += 3;
  if (stat === 'will') s.sanity += 2;
  clampVitals(s);
  save(s);
}
export function canLearnTalent(s: GameState, id: string) {
  const t = TALENT_MAP.get(id);
  if (!t || s.talents.includes(id) || s.talentPoints <= 0) return false;
  if (t.tier === 1) return true;
  return TALENTS.some(x => x.tree === t.tree && x.tier === t.tier - 1 && s.talents.includes(x.id));
}
export function learnTalent(s: GameState, id: string) {
  if (!canLearnTalent(s, id)) return;
  s.talentPoints--;
  s.talents.push(id);
  const b = TALENT_MAP.get(id)?.bonus;
  s.hp += b?.maxHp ?? 0;
  s.sanity += b?.maxSanity ?? 0;
  clampVitals(s);
  save(s);
}

const GENERIC_RUMORS = ['Someone says the sun is not dead, only angry.', 'A drunk swears the bells in Saltmere ring louder when Wayfarers pass.', 'They say the Regent’s throne has a name carved in it, and the name is blank.', 'A merchant claims Veyrgard’s lanterns are burning something other than oil.', 'The dead have started walking in the direction of the Black Meridian, and not away from it.', 'A child insists the shadows have started leaving. She is very pleased about it.'];
export function rumor(s: GameState): string {
  const t = s.town ? TOWN_MAP.get(s.town) : null;
  return pick([...(t?.rumors ?? []), ...GENERIC_RUMORS]);
}
export const roundCost = (s: GameState) => 10 + (s.town ? (TOWN_MAP.get(s.town)?.tier ?? 1) * 8 : 8) + s.level * 2;
export function buyRound(s: GameState): string | null {
  const t = s.town ? TOWN_MAP.get(s.town) : null;
  const cost = roundCost(s);
  if (!t || s.gold < cost) return null;
  s.gold -= cost;
  s.sanity = Math.min(stats(s).maxSanity, s.sanity + Math.round(stats(s).maxSanity * 0.15));
  const unknown = DUNGEONS.filter(d => !s.world.known.includes(d.id) && !d.gate).sort((a, b) => Math.hypot(a.pos[0] - t.pos[0], a.pos[1] - t.pos[1]) - Math.hypot(b.pos[0] - t.pos[0], b.pos[1] - t.pos[1]));
  let text = rumor(s);
  if (unknown.length) {
    const d = unknown[0];
    s.world.known.push(d.id);
    text = `${text} A patron leans in and whispers of ${d.name}. It is marked on your map now.`;
  }
  push(s, 'You buy a round. Tongues loosen.', 'good');
  save(s);
  return text;
}

export function claimQuest(s: GameState, id: string) {
  const q = s.quests.find(x => x.id === id);
  const def = QUEST_MAP.get(id);
  if (!q || !q.done || !def || def.town !== s.town) return;
  s.quests = s.quests.filter(x => x.id !== id);
  s.completedQuests.push(id);
  if (def.reward.flag) s.flags[def.reward.flag] = 1;
  const items = def.reward.items ?? [];
  s.gold += def.reward.gold;
  items.forEach(i => addItem(s, i));
  const lines: string[] = [`${def.giver} is grateful.`];
  gainXp(s, def.reward.xp, lines);
  enqueue(s, { k: 'reward', reward: { title: `Contract complete: ${def.title}`, gold: def.reward.gold, xp: def.reward.xp, items, lines, icon: 'quest' } }, true);
  commit(s);
}
export const readyToClaim = (s: GameState) => (s.town ? claimable(s, s.town).length : 0);
