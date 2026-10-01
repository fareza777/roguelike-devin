import { ENEMY_MAP } from '../data/enemies';
import { ITEM_MAP, SETS } from '../data/items';
import { ASCENSION_MAP, TALENT_MAP } from '../data/skills';
import { DUNGEON_MAP, MAP_H, MAP_W, START_POS, ZONES } from '../data/world';
import type { Bonus, EnemyDef, Eff, GameState, ItemDef, Log, Meta, Settings, Slot } from '../types';

export const SAVE_KEY = 'dreadmarch-save';
export const META_KEY = 'dreadmarch-meta';
export const VERSION = 4;
export const LEVEL_CAP = 60;
export const SLOTS: Slot[] = ['weapon', 'offhand', 'head', 'body', 'hands', 'feet', 'ring', 'amulet'];
export const SLOT_LABEL: Record<Slot, string> = { weapon: 'Weapon', offhand: 'Off-hand', head: 'Head', body: 'Body', hands: 'Hands', feet: 'Feet', ring: 'Ring', amulet: 'Amulet' };
export const UPGRADABLE: Slot[] = ['weapon', 'offhand', 'head', 'body', 'hands', 'feet'];
export const MAX_UPGRADE = 8;

export const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export interface EffResult { gold: number; xp: number; items: string[]; lines: string[]; ended: boolean; fought: boolean; goto?: string }
export const hooks: {
  runEffects: (s: GameState, effs: Eff[]) => EffResult;
  startScene: (s: GameState, id: string) => void;
  startFight: (s: GameState, id: string, rank: 'normal' | 'elite' | 'boss', opts?: { entId?: number; win?: Eff[]; noFlee?: boolean; boss?: string; from?: 'dungeon' | 'world' | 'scene'; sneak?: boolean; lvl?: number }) => void;
  setMain: (s: GameState, id: string) => void;
  setArc: (s: GameState, id: string, to: number) => void;
} = { runEffects: () => ({ gold: 0, xp: 0, items: [], lines: [], ended: false, fought: false }), startScene: () => undefined, startFight: () => undefined, setMain: () => undefined, setArc: () => undefined };

const itemCache = new Map<string, ItemDef>();
export function splitId(idStr: string): [string, number] {
  const i = idStr.indexOf('+');
  return i < 0 ? [idStr, 0] : [idStr.slice(0, i), Number(idStr.slice(i + 1)) || 0];
}
export function item(idStr: string): ItemDef | undefined {
  const cached = itemCache.get(idStr);
  if (cached) return cached;
  const [id, up] = splitId(idStr);
  const base = ITEM_MAP.get(id);
  if (!base) return undefined;
  if (!up) { itemCache.set(idStr, base); return base }
  const bonus: Bonus = { ...base.bonus };
  if (base.slot === 'weapon') bonus.damage = (bonus.damage ?? 0) + up * Math.max(1, Math.ceil((base.bonus.damage ?? 0) * 0.11));
  else if (base.slot !== 'consumable' && base.slot !== 'junk') {
    if (bonus.armor) bonus.armor += up * Math.max(1, Math.ceil(bonus.armor * 0.11));
    else bonus.maxHp = (bonus.maxHp ?? 0) + up * 3;
  }
  const def: ItemDef = { ...base, id: idStr, name: `${base.name} +${up}`, bonus, price: Math.round(base.price * (1 + up * 0.35)) };
  itemCache.set(idStr, def);
  return def;
}
export const baseItem = (idStr: string) => ITEM_MAP.get(splitId(idStr)[0]);
export const enemyDef = (id: string): EnemyDef => ENEMY_MAP.get(id)!;
export const upgradeCost = (idStr: string) => {
  const [id, up] = splitId(idStr);
  const b = ITEM_MAP.get(id);
  return b ? Math.round((b.price * 0.32 + 30) * (up + 1)) : 0;
};
export const canUpgrade = (idStr: string) => {
  const [id, up] = splitId(idStr);
  const b = ITEM_MAP.get(id);
  return !!b && UPGRADABLE.includes(b.slot as Slot) && up < MAX_UPGRADE;
};

export function defaultSettings(): Settings {
  return { sfx: true, music: true, haptics: true, motion: true, textSize: 'normal', difficulty: 'Wayfarer' };
}
export function loadMeta(): Meta {
  const base: Meta = { introSeen: false, onboarded: false, settings: defaultSettings(), endings: [], runs: 0 };
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY) || 'null') as Partial<Meta> | null;
    if (!raw) return base;
    return { ...base, ...raw, settings: { ...base.settings, ...raw.settings } };
  } catch { return base }
}
export function saveMeta(m: Meta) { localStorage.setItem(META_KEY, JSON.stringify(m)) }

export const xpFor = (level: number) => Math.round(30 * level ** 1.45);

export function fresh(difficulty: Settings['difficulty'] = 'Wayfarer'): GameState {
  const s: GameState = {
    version: VERSION, screen: 'creation', ret: 'town', difficulty, name: '', origin: '', path: '', companion: '',
    day: 1, level: 1, xp: 0, xpNext: xpFor(1), statPoints: 0, talentPoints: 0,
    gold: 80, supplies: 8, hp: 1, sanity: 1, vigor: 5, will: 5, cunning: 5, corruption: 0,
    inventory: ['tonic', 'tallow', 'pitchtorch'], equipment: { weapon: 'w_blade_0', offhand: null, head: null, body: null, hands: null, feet: null, ring: null, amulet: null },
    skills: [], loadout: [], cooldowns: {}, talents: [], status: {}, guarding: false,
    town: 'veyrgard',
    world: { x: START_POS[0], y: START_POS[1], steps: 0, explored: '0'.repeat(MAP_W * MAP_H), known: ['veyrgard'], visited: ['veyrgard'], done: [], facing: 0, lastRoadX: START_POS[0], lastRoadY: START_POS[1] },
    run: null, enemy: null, fight: null, event: null, reward: null, scene: null, queue: [],
    flags: {}, main: 0, quests: [], completedQuests: [],
    lore: [], bestiary: {}, kills: 0, elites: 0, eventsSeen: 0, bosses: [], cleared: [], companionCharge: 0, log: [], fx: [], ending: null, deaths: 0,
    skillRanks: {}, ascensions: [], companions: [], dynQuests: {}, playSeconds: 0, ads: { day: '', counts: {}, inter: 0, open: 0, freeUntil: 0, boostUntil: 0 }, anim: [], lastRun: null,
  };
  s.hp = stats(s).maxHp;
  s.sanity = stats(s).maxSanity;
  return s;
}

export function save(s: GameState) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)) } catch { /* storage full */ } }
export function clearSave() { localStorage.removeItem(SAVE_KEY) }
export function load(): GameState | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') as GameState | null;
    if (!raw || raw.version !== VERSION) return null;
    return { ...fresh(raw.difficulty), ...raw };
  } catch { return null }
}
export function hasLegacySave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') as { version?: number } | null;
    return !!raw && raw.version !== VERSION;
  } catch { return false }
}

type Full = Required<Bonus>;
const emptyBonus = (): Full => ({ damage: 0, armor: 0, vigor: 0, will: 0, cunning: 0, maxHp: 0, maxSanity: 0, crit: 0, dodge: 0, lifesteal: 0, thorns: 0, luck: 0, flee: 0, sight: 0, xpPct: 0, goldPct: 0, shopPct: 0, encPct: 0, critDmg: 0 });
function addBonus(t: Full, b?: Bonus) { if (b) (Object.keys(b) as (keyof Bonus)[]).forEach(k => { t[k] += b[k] ?? 0 }) }

export function setCounts(s: GameState): Record<string, number> {
  const out: Record<string, number> = {};
  (Object.values(s.equipment) as (string | null)[]).forEach(id => { const d = id ? item(id) : null; if (d?.set) out[d.set] = (out[d.set] ?? 0) + 1 });
  return out;
}

export function gearBonus(s: GameState): Full {
  const t = emptyBonus();
  (Object.values(s.equipment) as (string | null)[]).forEach(id => { if (id) addBonus(t, item(id)?.bonus) });
  s.talents.forEach(id => addBonus(t, TALENT_MAP.get(id)?.bonus));
  s.ascensions.forEach(id => addBonus(t, ASCENSION_MAP.get(id)?.bonus));
  Object.entries(setCounts(s)).forEach(([k, n]) => { const set = SETS[k]; if (n >= 2) addBonus(t, set.two); if (n >= 4) addBonus(t, set.four) });
  if (s.run?.sigil === 'blade') t.damage += 3 + Math.floor(s.level / 4);
  if (s.run?.sigil === 'ward') t.armor += 3 + Math.floor(s.level / 4);
  if (s.run?.sigil === 'eye') t.crit += 10;
  return t;
}

export function stats(s: GameState) {
  const b = gearBonus(s);
  const vigor = s.vigor + b.vigor;
  const will = s.will + b.will;
  const cunning = s.cunning + b.cunning;
  return {
    vigor, will, cunning,
    maxHp: 20 + vigor * 3 + s.level * 4 + b.maxHp,
    maxSanity: Math.max(10, 14 + will * 2 + s.level * 2 + b.maxSanity - s.corruption * 3),
    damage: 2 + b.damage + Math.floor(vigor / 2),
    armor: b.armor,
    crit: Math.min(70, Math.round(5 + cunning * 1.2 + b.crit)),
    dodge: Math.min(45, Math.round(b.dodge + cunning * 0.4)),
    lifesteal: b.lifesteal, thorns: b.thorns, luck: b.luck,
    flee: Math.min(92, 40 + cunning * 2 + b.flee),
    corruptionBonus: s.corruption * 4,
    sight: 5 + b.sight + (s.run && s.run.torch > 0 ? 2 : 0),
    critDmg: b.critDmg, xpPct: b.xpPct, goldPct: b.goldPct, shopPct: Math.min(40, b.shopPct), encPct: Math.min(70, b.encPct),
  };
}

export const mitigation = (armor: number, lvl: number) => armor <= 0 ? 0 : Math.min(0.8, armor / (armor + 12 + lvl * 1.6));

export function clampVitals(s: GameState) {
  const st = stats(s);
  s.hp = clamp(Math.round(s.hp), 0, st.maxHp);
  s.sanity = clamp(Math.round(s.sanity), 0, st.maxSanity);
  s.supplies = Math.max(0, s.supplies);
  s.gold = Math.max(0, Math.round(s.gold));
}

export const push = (s: GameState, text: string, tone: Log['tone'] = 'plain') => { s.log.unshift({ text, tone }); s.log = s.log.slice(0, 40) };
export const fxAdd = (s: GameState, target: 'enemy' | 'player', text: string, kind: GameState['fx'][number]['kind']) => { s.fx.push({ target, text, kind }) };

export function zoneAt(x: number, y: number) {
  let best = ZONES[0];
  let bd = Infinity;
  for (const z of ZONES) {
    const d = Math.hypot(x - z.at[0], (y - z.at[1]) * 1.15);
    if (d < bd) { bd = d; best = z }
  }
  return best;
}

export function areaLevel(s: GameState): number {
  if (s.run) {
    const d = DUNGEON_MAP.get(s.run.dungeon);
    return clamp((d?.lvl ?? 1) + s.run.floor, 1, LEVEL_CAP);
  }
  if (s.screen === 'world' || s.ret === 'world') return zoneAt(s.world.x, s.world.y).lvl;
  return clamp(s.level, 1, LEVEL_CAP);
}
export const MAX_TIER = 9;
export const tierForLevel = (lvl: number) => clamp(Math.floor((lvl - 1) / 6), 0, MAX_TIER);
export const scaleAmt = (s: GameState, n: number) => Math.round(n * (1 + s.level * 0.25));
export const scaleSan = (s: GameState, n: number) => Math.round(n * (1 + s.level * 0.1));

export const flag = (s: GameState, k: string) => s.flags[k] ?? 0;
