export type Screen =
  | 'splash' | 'intro' | 'onboarding' | 'title' | 'settings' | 'about'
  | 'creation' | 'city' | 'map' | 'dungeon' | 'combat' | 'event' | 'reward'
  | 'character' | 'inventory' | 'journal' | 'shop' | 'skills' | 'board' | 'death' | 'ending';
export type Stat = 'vigor' | 'will' | 'cunning';
export type Slot = 'weapon' | 'offhand' | 'armor' | 'trinket';
export type Rarity = 'common' | 'rare' | 'epic' | 'relic';
export type Status = 'bleed' | 'burn' | 'stun' | 'ward' | 'weak' | 'marked';
export type RoomKind = 'fight' | 'elite' | 'event' | 'cache' | 'shrine' | 'camp' | 'boss';

export interface Bonus {
  damage?: number; armor?: number; vigor?: number; will?: number; cunning?: number;
  maxHp?: number; maxSanity?: number; crit?: number;
}

export interface ItemDef {
  id: string; name: string; icon: string; slot: Slot | 'consumable'; rarity: Rarity;
  tier: number; desc: string; price: number; bonus: Bonus;
  use?: { hp?: number; sanity?: number; damage?: number; cleanse?: boolean; ward?: number };
}

export interface SkillDef {
  id: string; name: string; icon: string; school: string; desc: string; price: number;
  cooldown: number; sanityCost: number; mult: number;
  effect?: { status?: Status; turns?: number; target?: 'self' | 'enemy'; heal?: number; sanity?: number; pierce?: boolean; leech?: number };
}

export interface TalentDef {
  id: string; name: string; icon: string; tree: 'Steel' | 'Occult' | 'Shadow'; tier: number; desc: string; bonus?: Bonus;
}

export type IntentKind = 'attack' | 'heavy' | 'dread' | 'guard' | 'afflict';
export interface Intent { kind: IntentKind; label: string; value: number; status?: Status }

export interface EnemyDef {
  id: string; name: string; icon: string; art?: string; hp: number; damage: [number, number];
  armor: number; dread: number; lore: string; moves: IntentKind[]; afflict?: Status;
}

export interface Enemy {
  id: string; name: string; icon: string; art?: string; hp: number; maxHp: number; damage: [number, number];
  armor: number; dread: number; moves: IntentKind[]; afflict?: Status; rank: 'normal' | 'elite' | 'boss';
  intent: Intent; status: Partial<Record<Status, number>>; turn: number;
}

export interface Choice { label: string; text: string; effect: string; requires?: Stat; cost?: { supplies?: number; gold?: number; hp?: number } }
export interface StoryEvent { id: string; title: string; icon: string; text: string; region?: string; choices: Choice[] }

export interface Region {
  id: string; name: string; subtitle: string; description: string; art: string; pos: [number, number];
  danger: number; depth: number; enemies: string[]; elite: string; boss: string;
}

export interface Room { kind: RoomKind; label: string; icon: string; hint: string }

export interface QuestDef {
  id: string; title: string; giver: string; text: string;
  goal: { type: 'kill' | 'elite' | 'lore' | 'events' | 'boss' | 'level'; region?: string; count: number };
  reward: { gold: number; xp: number; item?: string };
}

export interface ChapterDef { id: string; title: string; text: string; objective: string; boss?: string; reward: { gold: number; xp: number; item?: string } }

export interface Log { tone: 'good' | 'bad' | 'plain' | 'epic'; text: string }
export interface Fx { target: 'enemy' | 'player'; text: string; kind: 'dmg' | 'crit' | 'heal' | 'sanity' | 'status' | 'miss' }

export interface Run { region: string; depth: number; maxDepth: number; rooms: Room[]; blessing: string | null; found: string[]; gold: number }

export interface Reward { title: string; gold: number; xp: number; items: string[]; lines: string[] }

export interface GameState {
  version: number; screen: Screen; difficulty: Settings['difficulty']; name: string; origin: string; path: string; companion: string;
  day: number; level: number; xp: number; xpNext: number; statPoints: number; talentPoints: number;
  gold: number; supplies: number; hp: number; sanity: number;
  vigor: number; will: number; cunning: number; corruption: number;
  inventory: string[]; equipment: Record<Slot, string | null>;
  skills: string[]; cooldowns: Record<string, number>; talents: string[];
  status: Partial<Record<Status, number>>; guarding: boolean;
  run: Run | null; enemy: Enemy | null; event: StoryEvent | null; reward: Reward | null;
  chapter: number; bosses: string[]; quests: { id: string; progress: number; done: boolean }[]; completedQuests: string[];
  lore: string[]; bestiary: Record<string, number>; kills: number; elites: number; eventsSeen: number;
  companionCharge: number; log: Log[]; fx: Fx[]; ending: string | null; deaths: number;
}

export interface Settings {
  sfx: boolean; music: boolean; haptics: boolean; motion: boolean; textSize: 'normal' | 'large';
  difficulty: 'Wayfarer' | 'Doomed';
}

export interface Meta { introSeen: boolean; onboarded: boolean; settings: Settings; endings: string[]; runs: number }
