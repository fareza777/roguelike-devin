export type Screen =
  | 'splash' | 'intro' | 'onboarding' | 'title' | 'settings' | 'about' | 'creation'
  | 'town' | 'world' | 'dungeon' | 'map' | 'combat' | 'event' | 'reward' | 'dialogue'
  | 'character' | 'inventory' | 'journal' | 'shop' | 'smithy' | 'skills' | 'board' | 'inn' | 'wardhouse'
  | 'death' | 'ending';

export type Stat = 'vigor' | 'will' | 'cunning';
export type Slot = 'weapon' | 'offhand' | 'head' | 'body' | 'hands' | 'feet' | 'ring' | 'amulet';
export type Rarity = 'common' | 'rare' | 'epic' | 'relic' | 'mythic';
export type Status = 'bleed' | 'burn' | 'stun' | 'ward' | 'weak' | 'marked' | 'poison' | 'chill' | 'regen';
export type School = 'Steel' | 'Hex' | 'Shadow' | 'Sanguine' | 'Discipline' | 'Astral' | 'Ash' | 'Glass' | 'Tide' | 'Verdant' | 'Gear' | 'Frost' | 'Deep';
export type Tree = 'Steel' | 'Hex' | 'Shadow' | 'Ash' | 'Wanderer';

export interface Bonus {
  damage?: number; armor?: number; vigor?: number; will?: number; cunning?: number;
  maxHp?: number; maxSanity?: number; crit?: number; dodge?: number; lifesteal?: number; thorns?: number; luck?: number;
  flee?: number; sight?: number; xpPct?: number; goldPct?: number; shopPct?: number; encPct?: number; critDmg?: number;
}

export interface ItemUse {
  hp?: number; hpPct?: number; sanity?: number; damage?: number; cleanse?: boolean; ward?: number; stun?: number;
  burn?: number; poison?: number; supplies?: number; reveal?: boolean; escape?: boolean; light?: number;
  corruption?: number; xp?: number; bleed?: number;
}

export interface ItemDef {
  id: string; name: string; icon: string; slot: Slot | 'consumable' | 'junk'; rarity: Rarity;
  tier: number; desc: string; price: number; bonus: Bonus; use?: ItemUse; set?: string; unique?: boolean; family?: string;
}

export interface SkillEffect {
  status?: Status; turns?: number; target?: 'self' | 'enemy'; heal?: number; healPct?: number; sanity?: number;
  pierce?: boolean; leech?: number; cleanse?: boolean; ward?: number; bonusVs?: Status; bonusMult?: number; sanityPct?: number;
  /** Extra statuses applied alongside `status`. */
  also?: { status: Status; turns: number; target: 'self' | 'enemy' }[];
  /** Extra damage multiplier while the foe is below 35% health. */
  bonusLow?: number;
  /** Chance (0-1) that a hit also stuns. */
  stunChance?: number;
  /** Drain this much enemy-side armor for the fight (permanent in-fight armor shred). */
  shred?: number;
}
export interface SkillDef {
  id: string; name: string; icon: string; school: School; desc: string; price: number; level: number;
  cooldown: number; sanityCost: number; hpCost?: number; mult: number; hits?: number; effect?: SkillEffect;
}

export interface TalentDef {
  id: string; name: string; icon: string; tree: Tree; tier: number; desc: string; bonus?: Bonus;
}

export interface AscensionDef {
  id: string; name: string; icon: string; path: string; tier: 1 | 2; level: number; desc: string; bonus: Bonus; skill?: string;
}
export interface CompanionDef { id: string; name: string; icon: string; blurb: string; perk: string; unlock?: string }

export type IntentKind = 'attack' | 'heavy' | 'dread' | 'guard' | 'afflict';
export interface Intent { kind: IntentKind; label: string; value: number; status?: Status }

export type Role = 'brute' | 'skirmisher' | 'caster' | 'tank' | 'swarm';
export interface EnemyDef {
  id: string; name: string; icon: string; art?: string; look?: string; role: Role; tags: string[]; lore: string;
  moves: IntentKind[]; afflict?: Status; dread?: number; hpMul?: number; dmgMul?: number; armorAdd?: number;
  drops?: string[];
}

export interface Enemy {
  id: string; name: string; icon: string; art?: string; look?: string; hp: number; maxHp: number; damage: [number, number];
  armor: number; dread: number; moves: IntentKind[]; afflict?: Status; rank: 'normal' | 'elite' | 'boss';
  intent: Intent; status: Partial<Record<Status, number>>; turn: number; lvl: number; tags: string[];
}

export interface Cond {
  flag?: string; not?: string; min?: [string, number]; mainAt?: string; mainMin?: string; mainBelow?: string;
  item?: string; gold?: number; companion?: string; corruption?: number; level?: number; done?: string; active?: string;
  origin?: string; path?: string; any?: Cond[]; all?: string[];
  arc?: [string, number]; arcMin?: [string, number]; regalia?: number; ascended?: number; town?: string;
}

export type Eff =
  | { t: 'flag'; k: string; v?: number } | { t: 'inc'; k: string; n?: number }
  | { t: 'gold'; n: number } | { t: 'goldR'; lo: number; hi: number } | { t: 'xp'; n: number } | { t: 'xpL'; m: number }
  | { t: 'item'; id: string; n?: number } | { t: 'take'; id: string } | { t: 'loot'; min?: Rarity; n?: number } | { t: 'consumable'; n?: number }
  | { t: 'hp'; n: number } | { t: 'hpPct'; n: number } | { t: 'san'; n: number } | { t: 'corrupt'; n: number }
  | { t: 'supplies'; n: number } | { t: 'stat'; k: Stat; n: number } | { t: 'restore' }
  | { t: 'main'; to: string } | { t: 'quest'; id: string } | { t: 'lore'; id?: string } | { t: 'unlock'; loc: string }
  | { t: 'fight'; enemy: string; rank?: Enemy['rank']; win?: Eff[]; noFlee?: boolean }
  | { t: 'rand'; p: number; eff: Eff[]; else?: Eff[] } | { t: 'log'; text: string; tone?: Log['tone'] }
  | { t: 'end'; id: string } | { t: 'goto'; node: string } | { t: 'sigil'; k: 'blade' | 'ward' | 'eye' }
  | { t: 'key'; n: number } | { t: 'reveal' } | { t: 'companion'; name: string } | { t: 'scene'; id: string }
  | { t: 'arc'; id: string; to: number } | { t: 'regalia'; id: string } | { t: 'recruit'; id: string } | { t: 'learn'; id: string };

export interface Choice {
  label: string; text: string; cond?: Cond; check?: { stat: Stat; dc?: number };
  cost?: { supplies?: number; gold?: number; hp?: number }; eff: Eff[]; fail?: Eff[];
}
export interface StoryEvent { id: string; title: string; icon: string; text: string; tags?: string[]; choices: Choice[]; art?: string; motif?: string }

export interface DChoice { label: string; next?: string; cond?: Cond; eff?: Eff[]; check?: { stat: Stat; dc: number; pass: string; fail: string } }
export interface DNode { id: string; who?: string; text: string; eff?: Eff[]; choices?: DChoice[]; next?: string; mood?: string }
export interface SceneDef { id: string; art?: string; nodes: DNode[] }
export interface Speaker { name: string; title?: string; icon: string; color?: string; look?: string }

export type Theme = 'crypt' | 'flooded' | 'forest' | 'ember' | 'bone' | 'mine' | 'ice' | 'noon' | 'cave' | 'ruin' | 'swamp' | 'archive';

export interface DungeonDef {
  id: string; name: string; subtitle: string; desc: string; art: string; theme: Theme; floors: number; lvl: number;
  enemies: string[]; elite: string; boss: string; size: [number, number]; pos: [number, number]; gate?: string;
  intro?: string; clear?: string; mainBoss?: boolean; tags?: string[]; icon?: string; secretItem?: string;
}

export interface NpcDef {
  id: string; name: string; title: string; icon: string; look?: string; greeting: string; idle: string[];
  talk?: { cond?: Cond; scene: string }[]; shop?: boolean;
}

export type ServiceId = 'inn' | 'shop' | 'smithy' | 'wardhouse' | 'tavern' | 'board' | 'trainer' | 'harbor';
export interface TownDef {
  id: string; name: string; kind: 'city' | 'village'; subtitle: string; desc: string; art: string; pos: [number, number];
  theme: { sky: string; glow: string; ink: string }; services: ServiceId[]; tier: number; shopTags: string[];
  npcs: NpcDef[]; rumors: string[]; innPrice: number; region: string; icon?: string;
  /** Ports this town sails to (needs a Harbor). Ferry-only towns are not joined to the road network. */
  ferry?: string[]; ferryOnly?: boolean; unlock?: Cond;
}

export interface LandmarkDef {
  id: string; name: string; icon: string; pos: [number, number]; event?: string; scene?: string; once?: boolean;
  lvl: number; cond?: Cond; hint?: string; art?: string;
}

export interface QuestGoal { type: 'kill' | 'killTag' | 'clear' | 'fetch' | 'talk' | 'events' | 'level' | 'lore' | 'reach' | 'elites'; target?: string; count: number; label: string }
export interface QuestDef {
  id: string; title: string; giver: string; town: string; text: string; done?: string; goal: QuestGoal;
  reward: { gold: number; xp: number; items?: string[]; flag?: string }; cond?: Cond; item?: string; region?: string; bounty?: boolean;
}

export interface MainStep { id: string; act: number; title: string; text: string; obj: string; at?: string; goal?: QuestGoal; done?: string }
export interface ActDef { id: number; title: string; blurb: string; part?: number }
export interface ArcStep { title: string; obj: string; text: string; at?: string; goal?: QuestGoal; done?: string }
export interface ArcDef { id: string; title: string; region: string; lvl: number; blurb: string; regalia: string; steps: ArcStep[] }

export interface Log { tone: 'good' | 'bad' | 'plain' | 'epic'; text: string }
export interface Fx { target: 'enemy' | 'player'; text: string; kind: 'dmg' | 'crit' | 'heal' | 'sanity' | 'status' | 'miss' }
/** Transient presentation events produced by the combat engine; the battle stage plays them back and they are never saved. */
export type Anim =
  | { t: 'hit'; who: 'enemy' | 'player'; dmg: number; crit: boolean; heavy?: boolean; element?: 'burn' | 'poison' | 'bleed' | 'chill' | 'pierce' | 'plain' }
  | { t: 'skill'; id: string; school: School; hits: number; crit: boolean }
  | { t: 'item'; id: string; kind: 'bomb' | 'fire' | 'stun' | 'poison' | 'heal' | 'sanity' | 'cleanse' | 'ward' | 'smoke' | 'misc' }
  | { t: 'enemyAct'; kind: IntentKind; dmg: number; dodged?: boolean; blocked?: boolean }
  | { t: 'status'; who: 'enemy' | 'player'; status: Status }
  | { t: 'tick'; who: 'enemy' | 'player'; status: Status; dmg: number }
  | { t: 'heal'; who: 'player'; n: number; kind: 'hp' | 'sanity' }
  | { t: 'guard' } | { t: 'dodge' } | { t: 'companion'; name: string } | { t: 'die' } | { t: 'flee' } | { t: 'enrage' };

export type EntKind =
  | 'enemy' | 'boss' | 'chest' | 'trap' | 'event' | 'waystone' | 'camp' | 'fountain' | 'lore' | 'key' | 'lever'
  | 'potion' | 'gold' | 'plinth' | 'prisoner' | 'questitem' | 'exit' | 'secret' | 'npc';
export interface Ent {
  id: number; k: EntKind; x: number; y: number; enemy?: string; rank?: Enemy['rank']; awake?: boolean;
  done?: boolean; hidden?: boolean; ref?: string; cd?: number; locked?: boolean; mimic?: boolean;
}
export interface Floor { w: number; h: number; tiles: string; seen: string; ents: Ent[]; up: [number, number] | null; down: [number, number] | null; nextId: number }
export interface Run {
  dungeon: string; floor: number; seed: number; px: number; py: number; floors: (Floor | null)[]; keys: number;
  steps: number; sigil: string | null; found: string[]; gold: number; kills: number; light: number; torch: number;
  bossDown: boolean; facing: number;
}
export interface WorldState { x: number; y: number; steps: number; explored: string; known: string[]; visited: string[]; done: string[]; facing: number; lastRoadX: number; lastRoadY: number }

export interface Reward { title: string; gold: number; xp: number; items: string[]; lines: string[]; icon?: string; boss?: boolean; doubled?: boolean }
export interface FightCtx { win?: Eff[]; from: 'dungeon' | 'world' | 'scene'; entId?: number; noFlee?: boolean; boss?: string; landmark?: string }
export interface SceneState { id: string; node: string; log: string[]; pending?: Eff[] }
export type Pending = { k: 'scene'; id: string } | { k: 'ending'; id: string } | { k: 'reward'; reward: Reward } | { k: 'effects'; eff: Eff[] };

export interface QuestState { id: string; progress: number; done: boolean }

export interface GameState {
  version: number; screen: Screen; ret: Screen; difficulty: Settings['difficulty']; name: string; origin: string; path: string; companion: string;
  day: number; level: number; xp: number; xpNext: number; statPoints: number; talentPoints: number;
  gold: number; supplies: number; hp: number; sanity: number;
  vigor: number; will: number; cunning: number; corruption: number;
  inventory: string[]; equipment: Record<Slot, string | null>;
  skills: string[]; loadout: string[]; cooldowns: Record<string, number>; talents: string[];
  status: Partial<Record<Status, number>>; guarding: boolean;
  town: string | null; world: WorldState; run: Run | null;
  enemy: Enemy | null; fight: FightCtx | null; event: StoryEvent | null; reward: Reward | null; scene: SceneState | null; queue: Pending[];
  flags: Record<string, number>; main: number; quests: QuestState[]; completedQuests: string[];
  lore: string[]; bestiary: Record<string, number>; kills: number; elites: number; eventsSeen: number;
  bosses: string[]; cleared: string[]; companionCharge: number; log: Log[]; fx: Fx[]; ending: string | null; deaths: number;
  /** Skill mastery ranks (1-5), ascensions taken, owned companions, generated bounty contracts, ad bookkeeping, seconds played. */
  skillRanks: Record<string, number>; ascensions: string[]; companions: string[]; dynQuests: Record<string, QuestDef>;
  playSeconds: number; ads: AdsState; anim: Anim[]; lastRun: Run | null;
}

export interface AdsState { day: string; counts: Record<string, number>; inter: number; open: number; freeUntil: number; boostUntil: number }

export interface Settings {
  sfx: boolean; music: boolean; haptics: boolean; motion: boolean; textSize: 'normal' | 'large';
  difficulty: 'Wayfarer' | 'Doomed';
}

export interface Meta { introSeen: boolean; onboarded: boolean; settings: Settings; endings: string[]; runs: number }
