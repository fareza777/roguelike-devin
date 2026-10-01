import type { Bonus, ItemDef, Slot, Choice, Cond, DChoice, DNode, DungeonDef, EnemyDef, Eff, IntentKind as K, NpcDef, QuestDef, QuestGoal, Rarity, Role, SceneDef, ServiceId, Stat, Status, StoryEvent, TownDef } from '../types';

// ------------------------------------------------------------------ effects
export const flag = (k: string, v = 1): Eff => ({ t: 'flag', k, v });
export const main = (to: string): Eff => ({ t: 'main', to });
export const gold = (n: number): Eff => ({ t: 'gold', n });
export const goldR = (lo: number, hi: number): Eff => ({ t: 'goldR', lo, hi });
export const xpL = (m: number): Eff => ({ t: 'xpL', m });
export const item = (id: string, n = 1): Eff => ({ t: 'item', id, n });
export const take = (id: string): Eff => ({ t: 'take', id });
export const san = (n: number): Eff => ({ t: 'san', n });
export const hp = (n: number): Eff => ({ t: 'hp', n });
export const hpp = (n: number): Eff => ({ t: 'hpPct', n });
export const corrupt = (n: number): Eff => ({ t: 'corrupt', n });
export const sup = (n: number): Eff => ({ t: 'supplies', n });
export const lore = (id?: string): Eff => ({ t: 'lore', id });
export const quest = (id: string): Eff => ({ t: 'quest', id });
export const unlock = (loc: string): Eff => ({ t: 'unlock', loc });
export const arc = (id: string, to: number): Eff => ({ t: 'arc', id, to });
export const regalia = (id: string): Eff => ({ t: 'regalia', id });
export const recruit = (id: string): Eff => ({ t: 'recruit', id });
export const learn = (id: string): Eff => ({ t: 'learn', id });
export const stat = (k: Stat, n: number): Eff => ({ t: 'stat', k, n });
export const log = (text: string, tone?: 'good' | 'bad' | 'plain' | 'epic'): Eff => ({ t: 'log', text, tone });
export const loot = (min: Rarity = 'common', n = 1): Eff => ({ t: 'loot', min, n });
export const cons = (n = 1): Eff => ({ t: 'consumable', n });
export const rand = (p: number, eff: Eff[], other?: Eff[]): Eff => ({ t: 'rand', p, eff, else: other });
export const fightEff = (enemy: string, win: Eff[], rank: 'normal' | 'elite' | 'boss' = 'boss'): Eff => ({ t: 'fight', enemy, rank, win, noFlee: true });
export const wild = (rank: 'normal' | 'elite' = 'normal'): Eff => ({ t: 'fight', enemy: rank === 'elite' ? '@elite' : '@normal', rank });

// ------------------------------------------------------------------ scenes
export const ch = (label: string, next?: string, o: Partial<DChoice> = {}): DChoice => ({ label, next, ...o });
export const go = (label = 'Continue', next?: string, cond?: Cond, eff?: Eff[]): DChoice => ({ label, next, cond, eff });
type Extra = Partial<Omit<DNode, 'who' | 'text'>>;
export type Spec = [who: string, text: string, extra?: Extra];
export const sc = (id: string, art: string, specs: Spec[]): SceneDef => ({ id, art, nodes: specs.map(([who, text, x], i) => ({ id: x?.id ?? String(i), who, text, ...x })) });

// ------------------------------------------------------------------ events
export const c = (label: string, text: string, eff: Eff[], o: Partial<Choice> = {}): Choice => ({ label, text, eff, ...o });
export const ck = (stat: Stat, dc?: number) => ({ stat, dc });
export const leave = [log('You move on, a little older.')];
export const E = (id: string, title: string, icon: string, tags: string, text: string, choices: Choice[], motif?: string): StoryEvent => ({ id, title, icon, text, tags: tags.split(' '), choices, motif });

// ------------------------------------------------------------------ quests
export const g = (type: QuestGoal['type'], count: number, label: string, target?: string): QuestGoal => ({ type, count, label, target });
export const q = (id: string, town: string, giver: string, title: string, text: string, goal: QuestGoal, reward: QuestDef['reward'], o: Partial<QuestDef> = {}): QuestDef => ({ id, town, giver, title, text, goal, reward, ...o });

// ------------------------------------------------------------------ enemies
export const aff = (s: Status) => ({ afflict: s });
export const en = (id: string, name: string, icon: string, role: Role, tags: string, moves: K[], lore: string, o: Partial<EnemyDef> = {}): EnemyDef =>
  ({ id, name, icon, role, tags: tags.split(' ').filter(Boolean), moves, lore, ...o });

// ------------------------------------------------------------------ world
export const tt = (sky: string, glow: string, ink: string) => ({ sky, glow, ink });
export const npc = (id: string, name: string, title: string, icon: string, greeting: string, idle: string[], talk?: NpcDef['talk'], look?: string): NpcDef => ({ id, name, title, icon, greeting, idle, talk, look });
export const FULL: ServiceId[] = ['inn', 'shop', 'smithy', 'wardhouse', 'tavern', 'board', 'trainer'];
export const FULL_H: ServiceId[] = [...FULL, 'harbor'];
export const SMALL: ServiceId[] = ['inn', 'shop', 'board'];
export const town = (t: Omit<TownDef, 'services' | 'innPrice' | 'shopTags'> & Partial<Pick<TownDef, 'services' | 'innPrice' | 'shopTags'>>): TownDef =>
  ({ services: t.kind === 'city' ? FULL : SMALL, innPrice: 20 + t.tier * 6, shopTags: ['potion', 'medium'], ...t });
export const dg = (d: DungeonDef): DungeonDef => d;

// ------------------------------------------------------------------ items
const PRICE = [45, 130, 300, 650, 1300, 2400, 4200, 7000, 11000, 17000];
export const gearItem = (id: string, name: string, icon: string, slot: Slot, rarity: Rarity, tier: number, desc: string, bonus: Bonus, extra: Partial<ItemDef> = {}): ItemDef =>
  ({ id, name, icon, slot, rarity, tier, desc, price: Math.round(PRICE[tier] * 2.2 * (rarity === 'relic' ? 2 : rarity === 'mythic' ? 3 : 1.4) / 10) * 10, bonus, unique: true, ...extra });

const BODY_ARMOR = [2, 5, 9, 14, 20, 27, 35, 44, 54, 66];
type PartSpec = [name: string, icon: string, desc: string];
/** Four-piece armor set: armor scales with tier, `sec` adds a themed bonus per piece (values scale with tier). */
export function armorSet(set: string, tier: number, rarity: Rarity, parts: { head: PartSpec; body: PartSpec; hands: PartSpec; feet: PartSpec }, sec: { head: Bonus; body: Bonus; hands: Bonus; feet: Bonus }): ItemDef[] {
  const mul = { head: 0.5, body: 1.1, hands: 0.38, feet: 0.38 } as const;
  return (['head', 'body', 'hands', 'feet'] as const).map(slot => {
    const [name, icon, desc] = parts[slot];
    const k = 1 + tier * 0.55;
    const bonus: Bonus = { armor: Math.round(BODY_ARMOR[tier] * mul[slot]) + 1 };
    for (const [key, val] of Object.entries(sec[slot]) as [keyof Bonus, number][]) bonus[key] = Math.max(1, Math.round(val * k));
    return gearItem(`set_${set}_${slot}`, name, icon, slot, rarity, tier, desc, bonus, { set });
  });
}
/** A themed unique weapon or accessory whose primary stat tracks its tier. */
export const uniqueGear = (id: string, name: string, icon: string, slot: Slot, rarity: Rarity, tier: number, desc: string, bonus: Bonus) => gearItem(id, name, icon, slot, rarity, tier, desc, bonus);
