import type { CompanionDef, Status } from '../types';

export interface CompanionAct {
  /** Acts every `every` combat turns. */
  every: number;
  /** Damage = base + perLevel × hero level (before the Bonded multiplier). */
  dmg?: [number, number];
  status?: { status: Status; turns: number; chance?: number };
  /** Heal this % of max health. */
  healPct?: number;
  /** Restore this % of max sanity. */
  sanityPct?: number;
  /** Ward the hero for N turns. */
  ward?: number;
  /** Steal gold: [lo, hi] plus 2 per level. */
  gold?: [number, number];
  crit?: boolean;
  text: string;
}
export interface CompanionData extends CompanionDef { act: CompanionAct }

export const COMPANION_DATA: CompanionData[] = [
  { id: 'Moth', name: 'Moth', icon: 'e_hound', blurb: 'A pale hound that growls at empty corners.', perk: 'Bites every 3 turns · finds supplies', act: { every: 3, dmg: [5, 1.6], status: { status: 'bleed', turns: 2 }, text: 'Moth tears at {foe}' } },
  { id: 'Marshal Cask', name: 'Marshal Cask', icon: 'e_soldier', blurb: 'A disgraced Lamp-Marshal with a loaded arquebus.', perk: 'Fires a heavy shot every 3 turns', act: { every: 3, dmg: [9, 2.4], crit: true, text: 'Marshal Cask’s arquebus roars' } },
  { id: 'Nix', name: 'Nix', icon: 'e_raven', blurb: 'A gutter raven that steals only important things.', perk: 'Steals gold · better loot', act: { every: 3, dmg: [3, 0.8], gold: [5, 10], text: 'Nix pecks at {foe}' } },
  { id: 'Tick', name: 'Tick', icon: 'cog', blurb: 'A brass clockwork spider no bigger than a fist.', perk: 'Zaps every 2 turns · may stun', unlock: 'comp_tick', act: { every: 2, dmg: [3, 1], status: { status: 'stun', turns: 1, chance: 0.3 }, text: 'Tick sparks against {foe}' } },
  { id: 'Brine', name: 'Brine', icon: 'e_eel', blurb: 'A salt-glass eel that swims in the air beside you.', perk: 'Heals 12% and wards every 3 turns', unlock: 'comp_brine', act: { every: 3, healPct: 12, ward: 1, text: 'Brine circles you, cold and soothing' } },
  { id: 'Bramble', name: 'Bramble', icon: 'm_tree', blurb: 'A walking sapling with a great deal of attitude.', perk: 'Poisons foes and wards you every 3 turns', unlock: 'comp_bramble', act: { every: 3, dmg: [2, 0.7], status: { status: 'poison', turns: 3 }, ward: 1, text: 'Bramble lashes {foe} with thorns' } },
  { id: 'Lumen', name: 'Lumen', icon: 'e_lantern', blurb: 'A lantern-spirit made of cut glass and stolen noon.', perk: 'Marks foes and restores sanity', unlock: 'comp_lumen', act: { every: 3, dmg: [4, 1.4], status: { status: 'marked', turns: 2 }, sanityPct: 6, text: 'Lumen flares a hard white light' } },
  { id: 'Hrim', name: 'Hrim', icon: 'e_polar', blurb: 'A frost-wolf pup that has decided it is yours.', perk: 'Bites and chills foes every 3 turns', unlock: 'comp_hrim', act: { every: 3, dmg: [5, 1.5], status: { status: 'chill', turns: 3 }, text: 'Hrim snaps at {foe}' } },
  { id: 'Glimmer', name: 'Glimmer', icon: 'e_moth', blurb: 'A cave-moth that glows with borrowed memory.', perk: 'Restores sanity and regrows health', unlock: 'comp_glimmer', act: { every: 3, sanityPct: 10, healPct: 5, text: 'Glimmer scatters a soft, gold dust' } },
];
export const COMPANION_MAP = new Map(COMPANION_DATA.map(c => [c.id, c]));
export const STARTER_COMPANIONS = ['Moth', 'Marshal Cask', 'Nix'];
