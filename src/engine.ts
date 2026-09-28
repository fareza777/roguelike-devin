import { CHAPTERS, ENEMIES, EVENTS, ITEMS, LORE, QUESTS, REGIONS, SKILLS, TALENTS } from './content';
import type {
  Bonus, Choice, Enemy, EnemyDef, GameState, Intent, ItemDef, Log, Meta, Rarity, Region, Room, RoomKind,
  Settings, Slot, Stat, Status, StoryEvent,
} from './types';

export const SAVE_KEY = 'dreadmarch-save';
export const META_KEY = 'dreadmarch-meta';
export const VERSION = 2;
export const QUEST_LIMIT = 3;
export const SUPPLY_PRICE = 18;

export const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'relic'];
const RARITY_WEIGHT: Record<Rarity, number> = { common: 50, rare: 30, epic: 14, relic: 5 };

export const item = (id: string) => ITEMS.find(x => x.id === id);
export const enemyDef = (id: string) => ENEMIES.find(x => x.id === id)!;
export const regionById = (id: string) => REGIONS.find(r => r.id === id)!;

export function defaultSettings(): Settings {
  return { sfx: true, music: true, haptics: true, motion: true, textSize: 'normal', difficulty: 'Wayfarer' };
}

export function loadMeta(): Meta {
  const base: Meta = { introSeen: false, onboarded: false, settings: defaultSettings(), endings: [], runs: 0 };
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY) || 'null') as Partial<Meta> | null;
    if (!raw) return base;
    return { ...base, ...raw, settings: { ...base.settings, ...raw.settings } };
  } catch {
    return base;
  }
}
export function saveMeta(m: Meta) { localStorage.setItem(META_KEY, JSON.stringify(m)) }

export function fresh(difficulty: Settings['difficulty'] = 'Wayfarer'): GameState {
  const s: GameState = {
    version: VERSION, screen: 'creation', difficulty, name: '', origin: '', path: '', companion: '',
    day: 1, level: 1, xp: 0, xpNext: xpFor(1), statPoints: 0, talentPoints: 0,
    gold: 70, supplies: 6, hp: 1, sanity: 1, vigor: 5, will: 5, cunning: 5, corruption: 0,
    inventory: ['tonic', 'incense'], equipment: { weapon: 'rustblade', offhand: null, armor: null, trinket: null },
    skills: [], cooldowns: {}, talents: [], status: {}, guarding: false,
    run: null, enemy: null, event: null, reward: null,
    chapter: 0, bosses: [], quests: [], completedQuests: [], lore: [], bestiary: {}, kills: 0, elites: 0, eventsSeen: 0,
    companionCharge: 0, log: [], fx: [], ending: null, deaths: 0,
  };
  s.hp = stats(s).maxHp;
  s.sanity = stats(s).maxSanity;
  return s;
}

export function save(s: GameState) { localStorage.setItem(SAVE_KEY, JSON.stringify(s)) }
export function clearSave() { localStorage.removeItem(SAVE_KEY) }
export function load(): GameState | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') as GameState | null;
    if (!raw || raw.version !== VERSION) return null;
    return { ...fresh(raw.difficulty), ...raw };
  } catch {
    return null;
  }
}
export function hasLegacySave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') as { version?: number } | null;
    return !!raw && raw.version !== VERSION;
  } catch {
    return false;
  }
}

export function xpFor(level: number) { return Math.round(45 * level ** 1.45) }

function addBonus(t: Required<Bonus>, b?: Bonus) {
  if (!b) return;
  (Object.keys(b) as (keyof Bonus)[]).forEach(k => { t[k] += b[k] ?? 0 });
}

export function gearBonus(s: GameState): Required<Bonus> {
  const t: Required<Bonus> = { damage: 0, armor: 0, vigor: 0, will: 0, cunning: 0, maxHp: 0, maxSanity: 0, crit: 0 };
  (Object.values(s.equipment) as (string | null)[]).forEach(id => { if (id) addBonus(t, item(id)?.bonus) });
  s.talents.forEach(id => addBonus(t, TALENTS.find(x => x.id === id)?.bonus));
  if (s.run?.blessing === 'blade') t.damage += 2;
  if (s.run?.blessing === 'ward') t.armor += 2;
  if (s.run?.blessing === 'eye') t.crit += 10;
  return t;
}

export function stats(s: GameState) {
  const b = gearBonus(s);
  const vigor = s.vigor + b.vigor;
  const will = s.will + b.will;
  const cunning = s.cunning + b.cunning;
  return {
    vigor, will, cunning,
    maxHp: 18 + vigor * 3 + s.level * 3 + b.maxHp,
    maxSanity: Math.max(8, 12 + will * 2 + s.level + b.maxSanity - s.corruption * 2),
    damage: 2 + b.damage + Math.floor(vigor / 2),
    armor: b.armor,
    crit: Math.min(60, Math.round(5 + cunning * 1.5 + b.crit)),
    flee: Math.min(90, 40 + cunning * 3),
    corruptionBonus: s.corruption * 4,
  };
}

export function clampVitals(s: GameState) {
  const st = stats(s);
  s.hp = clamp(Math.round(s.hp), 0, st.maxHp);
  s.sanity = clamp(Math.round(s.sanity), 0, st.maxSanity);
  s.supplies = Math.max(0, s.supplies);
  s.gold = Math.max(0, s.gold);
}

const push = (s: GameState, text: string, tone: Log['tone'] = 'plain') => {
  s.log.unshift({ text, tone });
  s.log = s.log.slice(0, 8);
};
const fx = (s: GameState, target: 'enemy' | 'player', text: string, kind: GameState['fx'][number]['kind']) => {
  s.fx.push({ target, text, kind });
};

export function setup(s: GameState) {
  if (s.origin.includes('Chirurgeon')) { s.will += 3; s.skills.push('mend'); s.inventory.push('tonic', 'tonic') }
  if (s.origin.includes('Warden')) { s.vigor += 3; s.equipment.offhand = 'buckler' }
  if (s.origin.includes('Scholar')) { s.cunning += 3; s.lore.push('The First Noon'); s.gold += 40 }
  if (s.path === 'Vanguard') { s.skills.push('sever'); s.talentPoints += 1; s.vigor += 2 }
  if (s.path === 'Hexer') { s.skills.push('cinder'); s.will += 3 }
  if (s.path === 'Vagrant') { s.skills.push('riposte'); s.supplies += 3; s.cunning += 2 }
  if (!s.skills.length) s.skills.push('sever');
  s.skills = [...new Set(s.skills)];
  s.hp = stats(s).maxHp;
  s.sanity = stats(s).maxSanity;
  s.screen = 'city';
  push(s, 'Mother Ilse presses a seal-key into your palm. “Four wardens. Four seals. Then the Meridian.”', 'epic');
  save(s);
}

export function gainXp(s: GameState, amount: number, lines?: string[]) {
  s.xp += amount;
  while (s.xp >= s.xpNext && s.level < 20) {
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
  progressQuests(s, 'level', undefined, 0);
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
  const t = TALENTS.find(x => x.id === id);
  if (!t || s.talents.includes(id) || s.talentPoints <= 0) return false;
  if (t.tier === 1) return true;
  return TALENTS.some(x => x.tree === t.tree && x.tier === t.tier - 1 && s.talents.includes(x.id));
}
export function learnTalent(s: GameState, id: string) {
  if (!canLearnTalent(s, id)) return;
  s.talentPoints--;
  s.talents.push(id);
  const before = stats(s);
  s.hp = Math.min(before.maxHp, s.hp + (TALENTS.find(x => x.id === id)?.bonus?.maxHp ?? 0));
  s.sanity = Math.min(before.maxSanity, s.sanity + (TALENTS.find(x => x.id === id)?.bonus?.maxSanity ?? 0));
  save(s);
}

export function regionUnlocked(s: GameState, index: number) { return index <= s.chapter }

export function roomInfo(kind: RoomKind): Room {
  const map: Record<RoomKind, Omit<Room, 'kind'>> = {
    fight: { label: 'Hostile Presence', icon: '⚔', hint: 'A common horror. Gold and experience.' },
    elite: { label: 'Named Horror', icon: '☠', hint: 'A dangerous foe. Guaranteed equipment.' },
    event: { label: 'Strange Encounter', icon: '?', hint: 'A story choice. Anything can happen.' },
    cache: { label: 'Abandoned Cache', icon: '◈', hint: 'Supplies left by the dead.' },
    shrine: { label: 'Forgotten Shrine', icon: '✚', hint: 'Choose a blessing for this expedition.' },
    camp: { label: 'Safe Hollow', icon: '☾', hint: 'Rest or scavenge.' },
    boss: { label: 'Warden’s Lair', icon: '♛', hint: 'The seal-keeper waits.' },
  };
  return { kind, ...map[kind] };
}

export function genRooms(depth: number, maxDepth: number): Room[] {
  if (depth >= maxDepth - 1) return [roomInfo('boss')];
  const weights: [RoomKind, number][] = [['fight', 36], ['event', 26], ['elite', depth >= 2 ? 12 : 0], ['cache', 9], ['shrine', depth >= 1 ? 9 : 0], ['camp', depth >= 3 ? 10 : 0]];
  const out: RoomKind[] = [];
  let guard = 0;
  while (out.length < 3 && guard++ < 60) {
    const total = weights.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * total;
    const k = weights.find(([, w]) => (r -= w) < 0)![0];
    if (!out.includes(k) || guard > 40) out.push(k);
  }
  return out.map(roomInfo);
}

export function startRun(s: GameState, regionId: string) {
  const idx = REGIONS.findIndex(r => r.id === regionId);
  if (idx < 0 || !regionUnlocked(s, idx)) return;
  const r = REGIONS[idx];
  s.run = { region: r.id, depth: 0, maxDepth: r.depth, rooms: genRooms(0, r.depth), blessing: null, found: [], gold: 0 };
  s.screen = 'dungeon';
  s.status = {};
  push(s, `You enter ${r.name}.`);
  save(s);
}

export function region(s: GameState): Region { return regionById(s.run?.region ?? 'catacombs') }

export function abandonRun(s: GameState) {
  if (s.run) push(s, `You return to Veyrgard from ${region(s).name}.`);
  s.run = null;
  s.enemy = null;
  s.event = null;
  s.status = {};
  s.screen = 'city';
  save(s);
}

export function enterRoom(s: GameState, index: number) {
  const run = s.run;
  const room = run?.rooms[index];
  if (!run || !room || s.screen !== 'dungeon') return;
  if (s.supplies > 0) s.supplies--;
  else {
    s.hp = Math.max(1, s.hp - 4);
    s.sanity = Math.max(0, s.sanity - 3);
    push(s, 'Without supplies, the dark gnaws at you. (−4 health, −3 sanity)', 'bad');
  }
  run.depth++;
  run.rooms = genRooms(run.depth, run.maxDepth);
  const r = region(s);
  switch (room.kind) {
    case 'fight': startFight(s, pick(r.enemies), 'normal'); break;
    case 'elite': startFight(s, r.elite, 'elite'); break;
    case 'boss': startFight(s, r.boss, 'boss'); break;
    case 'event': {
      const pool = EVENTS.filter(e => (!e.region || e.region === r.id) && !run.found.includes(e.id));
      const ev = pick(pool.length ? pool : EVENTS.filter(e => !e.region || e.region === r.id));
      run.found.push(ev.id);
      openEvent(s, structuredClone(ev));
      break;
    }
    case 'shrine': openEvent(s, shrineEvent()); break;
    case 'camp': openEvent(s, campEvent()); break;
    case 'cache': {
      const gold = rand(10, 18) + r.danger * 6;
      const items = [pick(['tonic', 'incense', 'salts', 'tonic'])];
      if (Math.random() < 0.25) items.push(rollGear(s, 'common').id);
      const supplies = rand(1, 2);
      s.supplies += supplies;
      grantReward(s, { title: 'Abandoned Cache', gold, xp: 8 + r.danger * 3, items, lines: [`+${supplies} supplies`] });
      break;
    }
  }
  save(s);
}

function shrineEvent(): StoryEvent {
  return { id: 'shrine', title: 'A Forgotten Shrine', icon: '✚', text: 'A saint with no name is carved into the wall. Fresh candles burn at her feet, though no one has been here for a century. She offers one blessing for this expedition.', choices: [
    { label: 'Blessing of Blades', text: '+2 damage until you leave this region.', effect: 'blessBlade' },
    { label: 'Blessing of Warding', text: '+2 armor until you leave this region.', effect: 'blessWard' },
    { label: 'Blessing of the Open Eye', text: '+10% critical chance and restore 6 sanity.', effect: 'blessEye' }] };
}
function campEvent(): StoryEvent {
  return { id: 'camp', title: 'A Safe Hollow', icon: '☾', text: 'A dry hollow sheltered from the wind. Old ashes suggest others rested here. None of them left.', choices: [
    { label: 'Make camp', text: 'Spend 1 supply: restore 40% health and 30% sanity.', effect: 'campRest', cost: { supplies: 1 } },
    { label: 'Scavenge the ashes', text: 'Search the belongings of those who stayed.', effect: 'campScavenge', requires: 'cunning' },
    { label: 'Press on', text: 'Rest is for the living.', effect: 'leave' }] };
}

function openEvent(s: GameState, ev: StoryEvent) {
  s.event = ev;
  s.screen = 'event';
}

export function checkChance(s: GameState, stat: Stat) {
  const danger = s.run ? region(s).danger : 1;
  const target = 11 + danger;
  const value = stats(s)[stat];
  let wins = 0;
  for (let roll = 1; roll <= 12; roll++) if (roll + value >= target) wins++;
  return Math.round((wins / 12) * 100);
}

export function canAfford(s: GameState, c: Choice) {
  return (c.cost?.supplies ?? 0) <= s.supplies && (c.cost?.gold ?? 0) <= s.gold && (c.cost?.hp ?? 0) < s.hp;
}

function addLore(s: GameState, lines: string[]) {
  const missing = LORE.filter(l => !s.lore.includes(l[0]));
  if (!missing.length) {
    s.gold += 25;
    lines.push('You already know this story. (+25 gold)');
    return;
  }
  const l = pick(missing);
  s.lore.push(l[0]);
  lines.push(`Lore recovered: ${l[0]}`);
  progressQuests(s, 'lore', undefined, 1);
}

export function resolveEvent(s: GameState, index: number) {
  const c = s.event?.choices[index];
  if (!c || s.screen !== 'event' || !canAfford(s, c)) return;
  const danger = s.run ? region(s).danger : 1;
  const st = stats(s);
  s.supplies -= c.cost?.supplies ?? 0;
  s.gold -= c.cost?.gold ?? 0;
  s.hp -= c.cost?.hp ?? 0;
  const success = c.requires ? rand(1, 12) + st[c.requires] >= 11 + danger : true;
  const lines: string[] = [];
  const items: string[] = [];
  let gold = 0;
  let xp = 10 + danger * 2;
  let fight: 'normal' | 'elite' | null = null;
  if (c.requires) lines.push(`${c.requires.toUpperCase()} check ${success ? 'succeeded' : 'failed'}.`);
  switch (c.effect) {
    case 'gold': gold = rand(15, 30) + danger * 5; if (Math.random() < 0.3) { s.sanity -= 3; lines.push('Something in the water grips your wrist. (−3 sanity)') } break;
    case 'will': if (success) { s.sanity += 8; xp += 15; lines.push('Your resolve hardens. (+8 sanity)') } else { s.sanity -= 5; lines.push('The voice laughs inside you. (−5 sanity)') } break;
    case 'cunning': if (success) { addLore(s, lines); gold = 20 + danger * 5; xp += 15 } else { s.hp -= 6; lines.push('You are caught listening. (−6 health)') } break;
    case 'vigorLoot': if (success) { items.push(rollGear(s, 'rare').id); xp += 15 } else { s.hp -= 8; lines.push('The effort tears something. (−8 health)') } break;
    case 'rob': if (success) { gold = 60 + danger * 10; items.push(rollGear(s, 'common').id) } else { lines.push('He sees you coming.'); fight = 'elite' } break;
    case 'seal': s.sanity += 6; lines.push('Silence settles like snow. (+6 sanity)'); break;
    case 'kind': s.sanity += 5; lines.push('Kindness steadies you. (+5 sanity)'); if (Math.random() < 0.5) items.push(pick(['tonic', 'incense', 'salts'])); break;
    case 'corrupt': s.corruption++; s.sanity -= 4; items.push(rollGear(s, 'rare').id); lines.push('The flame takes root in you. (+1 corruption, −4 sanity)'); break;
    case 'fight': fight = 'normal'; break;
    case 'lore': addLore(s, lines); s.sanity -= 2; break;
    case 'memoryLore': s.sanity -= 6; addLore(s, lines); xp += 15; lines.push('It costs you a memory. (−6 sanity)'); break;
    case 'hurt': s.hp -= 6; s.sanity += 4; gold = 15; lines.push('Glass bites deep, but the impostor is gone. (−6 health, +4 sanity)'); break;
    case 'trade': s.vigor += 2; s.will = Math.max(1, s.will - 1); s.corruption++; lines.push('You are harder now. (+2 Vigor, −1 Will, +1 corruption)'); break;
    case 'buyMystery': items.push(rollGear(s, 'common').id); break;
    case 'gamble': if (Math.random() < 0.5) items.push(rollGear(s, 'rare').id); else { lines.push('It was a trap.'); fight = 'normal' } break;
    case 'bloodVigor': s.vigor++; lines.push('The stone drinks. Your arms remember. (+1 Vigor)'); break;
    case 'supplies': s.supplies += 2; s.sanity -= 2; lines.push('+2 supplies. His eyes do not close. (−2 sanity)'); break;
    case 'blessBlade': if (s.run) s.run.blessing = 'blade'; lines.push('Blessing of Blades: +2 damage this expedition.'); break;
    case 'blessWard': if (s.run) s.run.blessing = 'ward'; lines.push('Blessing of Warding: +2 armor this expedition.'); break;
    case 'blessEye': if (s.run) s.run.blessing = 'eye'; s.sanity += 6; lines.push('Blessing of the Open Eye: +10% critical chance.'); break;
    case 'campRest': s.hp += Math.round(st.maxHp * 0.4); s.sanity += Math.round(st.maxSanity * 0.3); lines.push('You sleep without dreaming.'); break;
    case 'campScavenge': if (success) { s.supplies += 2; items.push(pick(['tonic', 'incense', 'bomb'])); lines.push('+2 supplies') } else { lines.push('The ashes stir. They were not ashes.'); fight = 'normal' } break;
    default: lines.push('You move on, a little older.'); xp = 4;
  }
  s.eventsSeen++;
  progressQuests(s, 'events', undefined, 1);
  s.event = null;
  clampVitals(s);
  if (s.hp <= 0) { s.hp = 1; lines.push('You barely cling to life.') }
  if (fight) {
    gainXp(s, xp);
    lines.forEach(l => push(s, l, 'bad'));
    startFight(s, fight === 'elite' ? region(s).elite : pick(region(s).enemies), fight);
  } else {
    grantReward(s, { title: 'Aftermath', gold, xp, items, lines });
  }
  save(s);
}

export function rollGear(s: GameState, min: Rarity): ItemDef {
  const tier = s.run ? region(s).danger : s.chapter + 1;
  const minIdx = RARITY_ORDER.indexOf(min);
  const pool = ITEMS.filter(x => x.slot !== 'consumable' && x.tier <= tier && RARITY_ORDER.indexOf(x.rarity) >= minIdx);
  const list = pool.length ? pool : ITEMS.filter(x => x.slot !== 'consumable');
  const luck = s.talents.includes('scavenger') || s.companion === 'Nix' ? 1.4 : 1;
  const weighted = list.map(x => ({ x, w: RARITY_WEIGHT[x.rarity] * (x.rarity === 'common' ? 1 : luck) }));
  let r = Math.random() * weighted.reduce((a, b) => a + b.w, 0);
  return weighted.find(o => (r -= o.w) < 0)?.x ?? list[0];
}

export function grantReward(s: GameState, reward: GameState['reward'] & object) {
  s.gold += reward.gold;
  if (s.run) s.run.gold += reward.gold;
  s.inventory.push(...reward.items);
  gainXp(s, reward.xp, reward.lines);
  clampVitals(s);
  s.reward = reward;
  s.screen = 'reward';
}

export function closeReward(s: GameState) {
  s.reward = null;
  s.screen = s.run ? 'dungeon' : s.ending === 'pending' ? 'ending' : 'city';
  save(s);
}

function scaleEnemy(def: EnemyDef, rank: Enemy['rank']): Enemy {
  const m = rank === 'elite' ? 1.1 : 1;
  const hp = Math.round(def.hp * m + (rank === 'normal' ? rand(-2, 4) : 0));
  const e: Enemy = { id: def.id, name: def.name, icon: def.icon, art: def.art, hp, maxHp: hp, damage: def.damage, armor: def.armor, dread: def.dread, moves: def.moves, afflict: def.afflict, rank, intent: { kind: 'attack', label: '', value: 0 }, status: {}, turn: 0 };
  e.intent = rollIntent(e);
  return e;
}

export function rollIntent(e: Enemy): Intent {
  const kind = Math.random() < 0.25 ? pick(e.moves) : e.moves[e.turn % e.moves.length];
  const [lo, hi] = e.damage;
  const avg = Math.round((lo + hi) / 2);
  switch (kind) {
    case 'heavy': return { kind, label: 'HEAVY BLOW', value: Math.round(avg * 1.8) };
    case 'dread': return { kind, label: 'DREAD', value: e.dread + 2 };
    case 'guard': return { kind, label: 'GUARD', value: 0 };
    case 'afflict': return { kind, label: (e.afflict ?? 'bleed').toUpperCase(), value: Math.round(avg * 0.6), status: e.afflict ?? 'bleed' };
    default: return { kind: 'attack', label: 'ATTACK', value: avg };
  }
}

export function startFight(s: GameState, id: string, rank: Enemy['rank']) {
  s.enemy = scaleEnemy(enemyDef(id), rank);
  s.screen = 'combat';
  s.guarding = false;
  s.cooldowns = {};
  s.companionCharge = 0;
  s.fx = [];
  s.log = [{ tone: rank === 'normal' ? 'bad' : 'epic', text: `${s.enemy.name} ${rank === 'boss' ? 'rises to guard the seal' : 'blocks your path'}.` }];
  save(s);
}

function playerHit(s: GameState, mult: number, pierce = false) {
  const e = s.enemy!;
  const st = stats(s);
  let dmg = rand(st.damage, st.damage + 3) * mult;
  dmg *= 1 + st.corruptionBonus / 100;
  if (e.status.marked) dmg *= 1.3;
  if (s.status.weak) dmg *= 0.75;
  if (s.talents.includes('executioner') && e.hp < e.maxHp * 0.3) dmg *= 1.5;
  if (s.talents.includes('abyss') && s.sanity < st.maxSanity * 0.3) dmg *= 1.35;
  const crit = Math.random() * 100 < st.crit;
  if (crit) dmg *= 1.6;
  if (!pierce) dmg -= e.armor;
  if (e.status.ward) dmg *= 0.5;
  const final = Math.max(1, Math.round(dmg));
  e.hp = Math.max(0, e.hp - final);
  fx(s, 'enemy', crit ? `${final}!` : `${final}`, crit ? 'crit' : 'dmg');
  return { dmg: final, crit };
}

function applyStatus(target: Partial<Record<Status, number>>, status: Status, turns: number) {
  target[status] = Math.max(target[status] ?? 0, turns);
}

function companionAct(s: GameState) {
  if (!s.enemy || s.enemy.hp <= 0) return;
  s.companionCharge++;
  if (s.companionCharge < 3) return;
  s.companionCharge = 0;
  const e = s.enemy;
  if (s.companion === 'Moth') { const d = 4 + s.level; e.hp = Math.max(0, e.hp - d); applyStatus(e.status, 'bleed', 2); push(s, `Moth tears at ${e.name} for ${d}.`, 'good'); fx(s, 'enemy', `${d}`, 'dmg') }
  else if (s.companion === 'Sister Cask') { const d = Math.round(7 + s.level * 1.5); e.hp = Math.max(0, e.hp - d); push(s, `Sister Cask’s arquebus roars: ${d} damage.`, 'good'); fx(s, 'enemy', `${d}`, 'dmg') }
  else if (s.companion === 'Nix') { const g = rand(5, 12); s.gold += g; e.hp = Math.max(0, e.hp - 3); push(s, `Nix steals ${g} gold and pecks an eye.`, 'good'); fx(s, 'enemy', '3', 'dmg') }
}

function sanityLoss(s: GameState, amount: number) {
  const loss = Math.max(0, amount - (s.talents.includes('ironwill') ? 1 : 0));
  s.sanity = Math.max(0, s.sanity - loss);
  if (loss) fx(s, 'player', `−${loss}◉`, 'sanity');
  return loss;
}

function tickEnemyStatus(s: GameState) {
  const e = s.enemy!;
  const bleed = 2 + Math.floor(s.level / 2);
  const burn = 3 + Math.floor(stats(s).will / 3);
  if (e.status.bleed) { e.hp = Math.max(0, e.hp - bleed); push(s, `${e.name} bleeds for ${bleed}.`, 'good'); fx(s, 'enemy', `${bleed}`, 'status') }
  if (e.status.burn) { e.hp = Math.max(0, e.hp - burn); push(s, `${e.name} burns for ${burn}.`, 'good'); fx(s, 'enemy', `${burn}`, 'status') }
  (Object.keys(e.status) as Status[]).forEach(k => { e.status[k] = (e.status[k] ?? 0) - 1; if ((e.status[k] ?? 0) <= 0) delete e.status[k] });
}

function tickPlayerStatus(s: GameState) {
  const danger = region(s).danger;
  if (s.status.bleed) { const d = 2 + danger; s.hp = Math.max(0, s.hp - d); push(s, `You bleed for ${d}.`, 'bad'); fx(s, 'player', `−${d}`, 'status') }
  if (s.status.burn) { const d = 3 + danger; s.hp = Math.max(0, s.hp - d); push(s, `You burn for ${d}.`, 'bad'); fx(s, 'player', `−${d}`, 'status') }
  (Object.keys(s.status) as Status[]).forEach(k => { s.status[k] = (s.status[k] ?? 0) - 1; if ((s.status[k] ?? 0) <= 0) delete s.status[k] });
  Object.keys(s.cooldowns).forEach(k => { s.cooldowns[k] = Math.max(0, s.cooldowns[k] - 1) });
}

function enemyAct(s: GameState) {
  const e = s.enemy!;
  if (e.status.stun) { push(s, `${e.name} is stunned and loses its turn.`, 'good'); return }
  const st = stats(s);
  const enraged = e.rank === 'boss' && e.hp < e.maxHp / 2;
  const doom = s.difficulty === 'Doomed' ? 1.2 : 1;
  const incoming = (base: number) => {
    let d = base * doom * (enraged ? 1.2 : 1) * (e.status.weak ? 0.75 : 1) - st.armor;
    if (s.guarding) d *= 0.4;
    if (s.status.ward) d *= 0.5;
    if (s.sanity <= 0) d *= 1.25;
    return Math.max(0, Math.round(d));
  };
  const hurt = (d: number) => { s.hp = Math.max(0, s.hp - d); fx(s, 'player', d ? `−${d}` : 'BLOCK', d ? 'dmg' : 'miss') };
  const intent = e.intent;
  switch (intent.kind) {
    case 'attack': { const d = incoming(rand(...e.damage)); hurt(d); push(s, `${e.name} strikes for ${d}.`, 'bad'); break }
    case 'heavy': { const d = incoming(rand(...e.damage) * 1.8); hurt(d); if (e.rank !== 'normal' && !s.guarding) sanityLoss(s, 2); push(s, `${e.name} lands a heavy blow for ${d}!`, 'bad'); break }
    case 'dread': { const d = incoming(rand(1, 3)); hurt(d); const l = sanityLoss(s, s.guarding ? Math.ceil(intent.value / 2) : intent.value); push(s, `${e.name} fills your mind with dread (−${l} sanity).`, 'bad'); break }
    case 'guard': applyStatus(e.status, 'ward', 2); e.hp = Math.min(e.maxHp, e.hp + Math.round(e.maxHp * 0.05)); push(s, `${e.name} braces and mends itself.`); break;
    case 'afflict': { const d = incoming(rand(...e.damage) * 0.6); hurt(d); const status = intent.status ?? 'bleed'; if (!s.guarding) { applyStatus(s.status, status, 3); fx(s, 'player', status.toUpperCase(), 'status') } push(s, `${e.name} hits for ${d}${s.guarding ? '' : ` and inflicts ${status}`}.`, 'bad'); break }
  }
  if (enraged && e.turn % 3 === 2) { const d = incoming(rand(...e.damage) * 0.7); hurt(d); push(s, `${e.name} is enraged and strikes again for ${d}!`, 'bad') }
}

function endTurn(s: GameState) {
  const e = s.enemy;
  if (!e) return;
  companionAct(s);
  if (e.hp > 0) tickEnemyStatus(s);
  if (e.hp <= 0) { win(s); return }
  enemyAct(s);
  s.guarding = false;
  tickPlayerStatus(s);
  if (s.hp <= 0) { die(s); return }
  e.turn++;
  e.intent = rollIntent(e);
  clampVitals(s);
  save(s);
}

function beginAction(s: GameState) {
  s.fx = [];
  return !!s.enemy && s.screen === 'combat';
}

export function attack(s: GameState) {
  if (!beginAction(s)) return;
  const { dmg, crit } = playerHit(s, 1);
  push(s, crit ? `Critical strike for ${dmg}!` : `You strike for ${dmg}.`, 'good');
  endTurn(s);
}

export function defend(s: GameState) {
  if (!beginAction(s)) return;
  s.guarding = true;
  s.sanity = Math.min(stats(s).maxSanity, s.sanity + 1);
  push(s, 'You brace against the dark. (+1 sanity)');
  endTurn(s);
}

export function flee(s: GameState) {
  if (!beginAction(s)) return;
  const e = s.enemy!;
  if (e.rank === 'boss') { push(s, 'The warden will not let you leave.', 'bad'); save(s); return }
  if (Math.random() * 100 < stats(s).flee) {
    s.enemy = null;
    s.screen = 'dungeon';
    s.status = {};
    push(s, 'You escape into the dark.', 'good');
    save(s);
  } else {
    push(s, 'You fail to escape!', 'bad');
    endTurn(s);
  }
}

export function useSkill(s: GameState, id: string) {
  if (!beginAction(s)) return;
  const sk = SKILLS.find(x => x.id === id);
  if (!sk || !s.skills.includes(id) || (s.cooldowns[id] ?? 0) > 0 || s.sanity < sk.sanityCost) return;
  s.cooldowns[id] = sk.cooldown;
  s.sanity -= sk.sanityCost;
  const ef = sk.effect ?? {};
  let text = sk.name;
  if (sk.mult > 0) {
    const { dmg, crit } = playerHit(s, sk.mult, ef.pierce);
    text += ` deals ${dmg}${crit ? ' (critical)' : ''}`;
    if (ef.leech) { const h = Math.round(dmg * ef.leech); s.hp += h; fx(s, 'player', `+${h}`, 'heal'); text += `, draining ${h}` }
  }
  if (ef.heal) { s.hp += ef.heal; fx(s, 'player', `+${ef.heal}`, 'heal'); text += ` restores ${ef.heal} health` }
  if (ef.sanity) { s.sanity += ef.sanity; delete s.status.weak; fx(s, 'player', `+${ef.sanity}◉`, 'heal'); text += ` restores ${ef.sanity} sanity` }
  if (id === 'hymn') { delete s.status.bleed; delete s.status.burn; delete s.status.weak }
  if (ef.status) {
    const target = ef.target === 'self' ? s.status : s.enemy!.status;
    applyStatus(target, ef.status, (ef.turns ?? 1) + (ef.target === 'self' ? 1 : 0));
    text += ` · ${ef.status.toUpperCase()}`;
  }
  push(s, `${text}.`, 'good');
  clampVitals(s);
  endTurn(s);
}

export function useItem(s: GameState, id: string) {
  const idx = s.inventory.indexOf(id);
  const def = item(id);
  if (idx < 0 || !def?.use) return;
  const inCombat = s.screen === 'combat' && !!s.enemy;
  if (def.use.damage && !inCombat) return;
  s.fx = [];
  s.inventory.splice(idx, 1);
  const u = def.use;
  if (u.hp) { s.hp += u.hp; fx(s, 'player', `+${u.hp}`, 'heal') }
  if (u.sanity) { s.sanity += u.sanity; fx(s, 'player', `+${u.sanity}◉`, 'heal') }
  if (u.cleanse) { delete s.status.bleed; delete s.status.burn; delete s.status.weak }
  if (u.ward) applyStatus(s.status, 'ward', u.ward + 1);
  if (u.damage && s.enemy) { s.enemy.hp = Math.max(0, s.enemy.hp - u.damage); fx(s, 'enemy', `${u.damage}`, 'crit') }
  push(s, `Used ${def.name}.`, 'good');
  clampVitals(s);
  if (inCombat) endTurn(s);
  else save(s);
}

function progressQuests(s: GameState, type: string, regionId: string | undefined, amount: number) {
  s.quests.forEach(q => {
    const def = QUESTS.find(x => x.id === q.id);
    if (!def || q.done || def.goal.type !== type) return;
    if (def.goal.region && def.goal.region !== regionId) return;
    q.progress = type === 'level' ? s.level : type === 'lore' ? s.lore.length : q.progress + amount;
    if (q.progress >= def.goal.count) { q.progress = def.goal.count; q.done = true; push(s, `Quest complete: ${def.title}. Return to the notice board.`, 'epic') }
  });
}

function win(s: GameState) {
  const e = s.enemy!;
  const r = region(s);
  const mult = e.rank === 'boss' ? 4 : e.rank === 'elite' ? 2 : 1;
  const scav = s.talents.includes('scavenger') ? 1.4 : 1;
  const gold = Math.round((8 + r.danger * 7 + rand(0, 6)) * mult * scav);
  const xp = Math.round((10 + r.danger * 8) * mult);
  const items: string[] = [];
  const lines: string[] = [];
  s.kills++;
  s.bestiary[e.id] = (s.bestiary[e.id] ?? 0) + 1;
  progressQuests(s, 'kill', r.id, 1);
  if (e.rank === 'elite') { s.elites++; progressQuests(s, 'elite', undefined, 1); items.push(rollGear(s, 'rare').id) }
  else if (e.rank === 'normal') {
    if (Math.random() < 0.3) items.push(pick(['tonic', 'incense', 'salts', 'bomb']));
    if (Math.random() < (s.companion === 'Nix' ? 0.18 : 0.12)) items.push(rollGear(s, 'common').id);
  }
  if (s.talents.includes('bloodthirst')) { s.hp += 6; s.sanity += 2; lines.push('Bloodthirst: +6 health, +2 sanity') }
  if (s.companion === 'Moth' && Math.random() < 0.3) { s.supplies++; lines.push('Moth digs up a supply.') }
  s.enemy = null;
  s.status = {};
  s.guarding = false;
  push(s, `${e.name} falls.`, 'good');
  if (e.rank === 'boss') {
    s.bosses.push(e.id);
    items.push(rollGear(s, 'epic').id);
    const ch = CHAPTERS[s.chapter];
    s.day++;
    s.run = null;
    if (ch?.boss === e.id) {
      lines.push(`Chapter complete: ${ch.title}`);
      if (ch.reward.item) items.push(ch.reward.item);
      s.chapter++;
      if (e.id === 'king') s.ending = 'pending';
      else lines.push(`A new region is unsealed: ${REGIONS[s.chapter].name}.`);
    }
    grantReward(s, { title: `${e.name} is defeated`, gold: gold + (ch?.reward.gold ?? 0), xp: xp + (ch?.reward.xp ?? 0), items, lines });
  } else {
    grantReward(s, { title: `${e.name} is slain`, gold, xp, items, lines });
  }
  save(s);
}

function die(s: GameState) {
  s.screen = 'death';
  s.enemy = null;
  s.run = null;
  s.deaths++;
  if (s.difficulty === 'Doomed') clearSave();
  else save(s);
}

export function revive(s: GameState) {
  const lost = Math.floor(s.gold / 2);
  s.gold -= lost;
  s.hp = Math.round(stats(s).maxHp / 2);
  s.sanity = Math.round(stats(s).maxSanity / 2);
  s.status = {};
  s.day++;
  s.screen = 'city';
  push(s, `Mother Ilse drags you back from the dark. You lost ${lost} gold.`, 'bad');
  save(s);
}

export function chooseEnding(s: GameState, id: string) {
  s.ending = id;
  save(s);
}

export function restCost(s: GameState) { return 10 + s.day * 2 }
export function rest(s: GameState) {
  const cost = restCost(s);
  if (s.gold < cost) return;
  s.gold -= cost;
  s.day++;
  s.hp = stats(s).maxHp;
  s.sanity = stats(s).maxSanity;
  s.status = {};
  push(s, 'You sleep at the Last Lantern. The city is still standing when you wake.', 'good');
  save(s);
}

export function cleanseCost(s: GameState) { return 60 + s.chapter * 20 }
export function cleanse(s: GameState) {
  const cost = cleanseCost(s);
  if (s.corruption <= 0 || s.gold < cost) return;
  s.gold -= cost;
  s.corruption--;
  push(s, 'The chapel fire burns a little of the dark out of you.', 'good');
  clampVitals(s);
  save(s);
}

export function shopStock(s: GameState) {
  return ITEMS.filter(x => x.tier <= s.chapter + 1 && (x.rarity !== 'relic' || s.chapter >= 3));
}
export function buy(s: GameState, id: string) {
  const def = item(id);
  if (!def || s.gold < def.price || !shopStock(s).includes(def)) return;
  s.gold -= def.price;
  s.inventory.push(id);
  push(s, `Bought ${def.name}.`, 'good');
  save(s);
}
export function buySupplies(s: GameState) {
  if (s.gold < SUPPLY_PRICE) return;
  s.gold -= SUPPLY_PRICE;
  s.supplies += 2;
  save(s);
}
export function sellPrice(def: ItemDef) { return Math.max(1, Math.floor(def.price * 0.4)) }
export function sell(s: GameState, id: string) {
  const idx = s.inventory.indexOf(id);
  const def = item(id);
  if (idx < 0 || !def) return;
  s.inventory.splice(idx, 1);
  s.gold += sellPrice(def);
  push(s, `Sold ${def.name}.`);
  save(s);
}

export function learn(s: GameState, id: string) {
  const sk = SKILLS.find(x => x.id === id);
  const price = sk ? skillPrice(sk.price) : 0;
  if (!sk || s.skills.includes(id) || s.gold < price) return;
  s.gold -= price;
  s.skills.push(id);
  push(s, `You learn ${sk.name}.`, 'good');
  save(s);
}
export function skillPrice(base: number) { return base || 120 }

export function equip(s: GameState, id: string) {
  const def = item(id);
  const idx = s.inventory.indexOf(id);
  if (!def || def.slot === 'consumable' || idx < 0 || s.screen === 'combat') return;
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

export function availableQuests(s: GameState) {
  return QUESTS.filter(q => !s.completedQuests.includes(q.id) && !s.quests.some(a => a.id === q.id) && (!q.goal.region || regionUnlocked(s, REGIONS.findIndex(r => r.id === q.goal.region))));
}
export function acceptQuest(s: GameState, id: string) {
  if (s.quests.length >= QUEST_LIMIT || !availableQuests(s).some(q => q.id === id)) return;
  const def = QUESTS.find(q => q.id === id)!;
  const progress = def.goal.type === 'level' ? s.level : def.goal.type === 'lore' ? s.lore.length : 0;
  s.quests.push({ id, progress: Math.min(progress, def.goal.count), done: progress >= def.goal.count });
  save(s);
}
export function claimQuest(s: GameState, id: string) {
  const q = s.quests.find(x => x.id === id);
  const def = QUESTS.find(x => x.id === id);
  if (!q || !q.done || !def) return;
  s.quests = s.quests.filter(x => x.id !== id);
  s.completedQuests.push(id);
  grantReward(s, { title: `Quest complete: ${def.title}`, gold: def.reward.gold, xp: def.reward.xp, items: def.reward.item ? [def.reward.item] : [], lines: [`${def.giver} is grateful.`] });
  save(s);
}
