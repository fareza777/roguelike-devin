import type { AscensionDef, Bonus, SkillDef, Status, TalentDef } from '../types';

const s = (id: string, name: string, icon: string, school: SkillDef['school'], level: number, price: number, cooldown: number, sanityCost: number, mult: number, desc: string, o: Partial<SkillDef> = {}): SkillDef =>
  ({ id, name, icon, school, level, price, cooldown, sanityCost, mult, desc, ...o });
const on = (status: Status, turns: number) => ({ status, turns, target: 'enemy' as const });
const me = (status: Status, turns: number) => ({ status, turns, target: 'self' as const });

export const SKILLS: SkillDef[] = [
  // ------------------------------------------------------------------ Steel
  s('sever', 'Sever', 'bleed', 'Steel', 1, 0, 2, 0, 1.6, '160% damage and inflicts Bleed for 2 turns.', { effect: { status: 'bleed', turns: 2, target: 'enemy' } }),
  s('riposte', 'Riposte', 'ward', 'Steel', 1, 0, 3, 0, 1.1, '110% damage and gain a Ward for 1 turn.', { effect: { status: 'ward', turns: 1, target: 'self' } }),
  s('shatter', 'Skull Shatter', 'stun', 'Steel', 3, 140, 5, 0, 0.9, '90% damage and Stuns the enemy for 1 turn.', { effect: { status: 'stun', turns: 1, target: 'enemy' } }),
  s('cleave', 'Whirling Cleave', 'w_axe', 'Steel', 6, 220, 3, 0, 0.8, 'Two strikes of 80% damage each.', { hits: 2 }),
  s('breaker', 'Bulwark Breaker', 'w_hammer', 'Steel', 9, 300, 4, 0, 1.3, '130% damage that ignores armor.', { effect: { pierce: true } }),
  s('rally', 'Iron Rally', 'shield', 'Steel', 12, 380, 5, 0, 0, 'Restore 20% of your health and gain a Ward for 1 turn.', { effect: { healPct: 20, status: 'ward', turns: 1, target: 'self' } }),
  s('headsman', 'Headsman’s Due', 'w_cleaver', 'Steel', 18, 560, 6, 0, 2.5, '250% damage, +60% against bleeding foes.', { effect: { bonusVs: 'bleed', bonusMult: 0.6 } }),
  s('bastion', 'Bastion', 'shield', 'Steel', 24, 760, 5, 0, 0.9, '90% damage, restore 10% health and gain a Ward for 3 turns.', { effect: { healPct: 10, status: 'ward', turns: 3, target: 'self' } }),
  s('ravage', 'Ravage', 'w_waraxe', 'Steel', 28, 900, 4, 0, 0.85, 'Three strikes of 85% damage; the foe bleeds for 3 turns.', { hits: 3, effect: { status: 'bleed', turns: 3, target: 'enemy' } }),
  s('warcry', 'Warcry', 'crown', 'Steel', 32, 1050, 5, 0, 0.6, '60% damage. The foe is Marked and Weakened for 3 turns.', { effect: { ...on('marked', 3), also: [{ status: 'weak', turns: 3, target: 'enemy' }] } }),
  s('executesk', 'Executioner’s Stroke', 'w_cleaver', 'Steel', 38, 1300, 5, 0, 2.8, '280% damage, +120% against foes below 35% health.', { effect: { bonusLow: 1.2 } }),
  s('unbroken', 'Unbroken', 'heart', 'Steel', 44, 1600, 7, 0, 0, 'Restore 28% health, cleanse every ailment and gain a Ward for 2 turns.', { effect: { healPct: 28, cleanse: true, status: 'ward', turns: 2, target: 'self' } }),
  s('worldsplit', 'World-Splitter', 'w_hammer', 'Steel', 52, 2200, 6, 0, 4.6, '460% damage that ignores armor and shreds it for the rest of the fight.', { effect: { pierce: true, shred: 0.25 } }),

  // -------------------------------------------------------------------- Hex
  s('cinder', 'Cinder Hex', 'burn', 'Hex', 1, 0, 3, 1, 1.3, '130% damage and sets the enemy Burning for 3 turns.', { effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('hexbrand', 'Hexbrand', 'marked', 'Hex', 3, 130, 4, 1, 0.6, '60% damage. The enemy is Marked and takes 30% more damage for 3 turns.', { effect: { status: 'marked', turns: 3, target: 'enemy' } }),
  s('void', 'Void Lance', 'e_dread', 'Hex', 8, 260, 4, 4, 2.2, '220% damage that ignores armor.', { effect: { pierce: true } }),
  s('soulflame', 'Soulflame', 'e_fireelem', 'Hex', 12, 400, 5, 3, 0.7, 'Three strikes of 70% damage; sets the enemy Burning.', { hits: 3, effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('unravel', 'Unravel', 'e_ghost', 'Hex', 15, 460, 5, 3, 2, '200% damage and Weakens the enemy for 3 turns.', { effect: { status: 'weak', turns: 3, target: 'enemy' } }),
  s('nightfall', 'Nightfall', 'moon', 'Hex', 22, 820, 6, 6, 3.2, '320% damage that ignores armor.', { effect: { pierce: true } }),
  s('curse', 'Withering Curse', 'weak', 'Hex', 25, 880, 4, 3, 1.2, '120% damage. The foe is Weakened and Poisoned for 4 turns.', { effect: { ...on('weak', 4), also: [{ status: 'poison', turns: 4, target: 'enemy' }] } }),
  s('witchfire', 'Witchfire', 'burn', 'Hex', 30, 1000, 5, 4, 0.8, 'Three strikes of 80% damage; the foe burns for 4 turns.', { hits: 3, effect: { status: 'burn', turns: 4, target: 'enemy' } }),
  s('siphon', 'Spirit Siphon', 'c_heartbottle', 'Hex', 36, 1250, 5, 4, 1.5, '150% damage, heal for 70% of it and restore 6 sanity.', { effect: { leech: 0.7, sanity: 6 } }),
  s('doomsigil', 'Doom Sigil', 'marked', 'Hex', 42, 1550, 5, 5, 0.8, '80% damage. The foe is Marked for 4 turns and Weakened for 3.', { effect: { ...on('marked', 4), also: [{ status: 'weak', turns: 3, target: 'enemy' }] } }),
  s('riftcollapse', 'Rift Collapse', 'moon', 'Hex', 48, 2000, 6, 7, 3.6, '360% damage that ignores armor and shreds it.', { effect: { pierce: true, shred: 0.2 } }),
  s('abyssalmaw', 'Abyssal Maw', 'e_dread', 'Hex', 56, 2800, 7, 10, 5.2, '520% damage that ignores armor. Costs 8% of your health.', { hpCost: 8, effect: { pierce: true } }),

  // ----------------------------------------------------------------- Shadow
  s('mark', 'Hunter’s Mark', 'marked', 'Shadow', 2, 120, 5, 0, 0.5, '50% damage. The enemy is Marked for 3 turns.', { effect: { status: 'marked', turns: 3, target: 'enemy' } }),
  s('venom', 'Venomstrike', 'poison', 'Shadow', 4, 170, 3, 0, 1.1, '110% damage and Poisons the enemy for 4 turns.', { effect: { status: 'poison', turns: 4, target: 'enemy' } }),
  s('backstab', 'Backstab', 'w_dagger', 'Shadow', 7, 250, 4, 0, 2.2, '220% damage, +50% against Marked or Stunned foes.', { effect: { bonusVs: 'marked', bonusMult: 0.5 } }),
  s('evade', 'Shadowstep', 'boot', 'Shadow', 10, 320, 5, 0, 0.8, '80% damage and gain a Ward for 2 turns.', { effect: { status: 'ward', turns: 2, target: 'self' } }),
  s('flurry', 'Flurry', 'w_whip', 'Shadow', 14, 430, 4, 0, 0.5, 'Four strikes of 50% damage each.', { hits: 4 }),
  s('blossom', 'Deathblossom', 'skull', 'Shadow', 20, 700, 5, 2, 2.6, '260% damage and Poisons the enemy for 4 turns.', { effect: { status: 'poison', turns: 4, target: 'enemy' } }),
  s('smokeveil', 'Smoke Veil', 'c_smoke', 'Shadow', 24, 780, 5, 0, 0.7, '70% damage. Gain a Ward for 2 turns and Regeneration for 3.', { effect: { ...me('ward', 2), also: [{ status: 'regen', turns: 3, target: 'self' }] } }),
  s('garrote', 'Garrote', 'w_whip', 'Shadow', 30, 980, 4, 0, 2.4, '240% damage, +60% against Marked foes. The foe bleeds for 3 turns.', { effect: { status: 'bleed', turns: 3, target: 'enemy', bonusVs: 'marked', bonusMult: 0.6 } }),
  s('knifedance', 'Knife Dance', 'w_dagger', 'Shadow', 36, 1220, 4, 0, 0.45, 'Six strikes of 45% damage each.', { hits: 6 }),
  s('duskstep', 'Dusk Step', 'boot', 'Shadow', 42, 1500, 5, 0, 1.4, '140% damage, gain a Ward for 2 turns, 50% chance to Stun.', { effect: { ...me('ward', 2), stunChance: 0.5 } }),
  s('assassinate', 'Assassinate', 'skull', 'Shadow', 48, 1950, 6, 3, 3.4, '340% damage that ignores armor, +100% against foes below 35% health.', { effect: { pierce: true, bonusLow: 1 } }),
  s('nightbloom', 'Night Bloom', 'poison', 'Shadow', 56, 2700, 6, 4, 3.2, '320% damage. The foe is Poisoned for 5 turns and bleeds for 4.', { effect: { ...on('poison', 5), also: [{ status: 'bleed', turns: 4, target: 'enemy' }] } }),

  // --------------------------------------------------------------- Sanguine
  s('mend', 'Blood Mend', 'heart', 'Sanguine', 1, 0, 4, 2, 0, 'Trade 2 sanity to restore 15% of your health (+8).', { effect: { heal: 8, healPct: 15 } }),
  s('leech', 'Leech Rite', 'c_heartbottle', 'Sanguine', 5, 180, 4, 2, 1.2, '120% damage and heal for half of it.', { effect: { leech: 0.5 } }),
  s('bloodpact', 'Blood Pact', 'bleed', 'Sanguine', 11, 400, 4, 0, 3, 'Spend 12% of your max health for 300% damage.', { hpCost: 12 }),
  s('transfuse', 'Transfusion', 'c_clearwater', 'Sanguine', 16, 550, 7, 4, 0, 'Restore 35% health and cleanse every ailment.', { effect: { healPct: 35, cleanse: true } }),
  s('crimsontide', 'Crimson Tide', 'bleed', 'Sanguine', 22, 800, 4, 3, 1.5, '150% damage, heal for half of it and the foe bleeds for 2 turns.', { effect: { leech: 0.5, status: 'bleed', turns: 2, target: 'enemy' } }),
  s('openvein', 'Open Vein', 'heart', 'Sanguine', 30, 1000, 5, 0, 3.6, 'Spend 8% of your max health for 360% damage.', { hpCost: 8 }),
  s('ichorward', 'Ichor Ward', 'ward', 'Sanguine', 38, 1300, 6, 3, 0, 'Gain a Ward for 3 turns and Regeneration for 4.', { effect: { ...me('ward', 3), also: [{ status: 'regen', turns: 4, target: 'self' }] } }),
  s('bloodmoon', 'Blood Moon', 'moon', 'Sanguine', 46, 1800, 6, 5, 2.4, '240% damage and heal for 80% of it.', { effect: { leech: 0.8 } }),
  s('sanguinesurge', 'Sanguine Surge', 'heart', 'Sanguine', 54, 2500, 8, 6, 0, 'Restore 45% health, cleanse and gain Regeneration for 4 turns.', { effect: { healPct: 45, cleanse: true, status: 'regen', turns: 4, target: 'self' } }),

  // ------------------------------------------------------------- Discipline
  s('still', 'Still Mind', 'sanity', 'Discipline', 2, 90, 4, 0, 0, 'Restore 9 sanity (+15% of maximum) and cleanse Weakness.', { effect: { sanity: 9, sanityPct: 15, cleanse: true } }),
  s('cadence', 'Ashen Cadence', 'sigil', 'Discipline', 4, 160, 5, 0, 0, 'Cleanse yourself and gain a Ward for 2 turns.', { effect: { status: 'ward', turns: 2, target: 'self', cleanse: true } }),
  s('stillness', 'Iron Stillness', 'shield', 'Discipline', 13, 350, 6, 0, 0, 'Gain a Ward for 3 turns and restore 20% of your sanity.', { effect: { status: 'ward', turns: 3, target: 'self', sanityPct: 20 } }),
  s('noonsong', 'Noonsong', 'sun', 'Discipline', 19, 650, 8, 0, 0, 'Cleanse, restore 25% health and 25% sanity.', { effect: { healPct: 25, sanityPct: 25, cleanse: true } }),
  s('focus', 'Iron Focus', 'eye', 'Discipline', 22, 760, 5, 0, 0, 'Restore 20% of your sanity and gain Regeneration for 3 turns.', { effect: { sanityPct: 20, status: 'regen', turns: 3, target: 'self' } }),
  s('resolve', 'Unyielding Resolve', 'ward', 'Discipline', 30, 980, 6, 0, 0, 'Gain a Ward for 4 turns and restore 25% of your sanity.', { effect: { status: 'ward', turns: 4, target: 'self', sanityPct: 25 } }),
  s('clarity', 'Clear Sight', 'eye', 'Discipline', 38, 1250, 5, 0, 0.5, '50% damage. The foe is Marked for 3 turns; restore 20% sanity.', { effect: { ...on('marked', 3), sanityPct: 20 } }),
  s('balance', 'Perfect Balance', 'sun', 'Discipline', 46, 1750, 8, 0, 0, 'Restore 25% health and sanity, cleanse and gain a Ward for 2 turns.', { effect: { healPct: 25, sanityPct: 25, cleanse: true, status: 'ward', turns: 2, target: 'self' } }),
  s('zenith', 'Zenith Calm', 'sun', 'Discipline', 55, 2400, 8, 0, 0, 'Restore 35% health, Ward 3 turns and Regeneration for 5.', { effect: { healPct: 35, ...me('ward', 3), also: [{ status: 'regen', turns: 5, target: 'self' }] } }),

  // ----------------------------------------------------------------- Astral
  s('collapse', 'Collapse', 'weak', 'Astral', 9, 280, 4, 2, 1.5, '150% damage and Weakens the enemy for 3 turns.', { effect: { status: 'weak', turns: 3, target: 'enemy' } }),
  s('starfall', 'Starfall', 'star', 'Astral', 17, 500, 5, 3, 1.1, 'Two blazing strikes of 110% damage each.', { hits: 2 }),
  s('eclipse', 'Black Eclipse', 'eclipse', 'Astral', 26, 1000, 7, 8, 4, '400% damage that ignores armor.', { effect: { pierce: true } }),
  s('nova', 'Nova', 'star', 'Astral', 30, 1050, 5, 4, 1.0, 'Three strikes of 100% damage that ignore armor.', { hits: 3, effect: { pierce: true } }),
  s('gravitywell', 'Gravity Well', 'weak', 'Astral', 36, 1300, 5, 4, 1.8, '180% damage. The foe is Weakened for 3 turns and Chilled for 2.', { effect: { ...on('weak', 3), also: [{ status: 'chill', turns: 2, target: 'enemy' }] } }),
  s('constellation', 'Constellation', 'star', 'Astral', 42, 1650, 5, 5, 0.9, 'Four strikes of 90% damage; the foe is Marked.', { hits: 4, effect: { status: 'marked', turns: 3, target: 'enemy' } }),
  s('horizon', 'Event Horizon', 'eclipse', 'Astral', 50, 2300, 7, 9, 5.5, '550% damage that ignores armor.', { effect: { pierce: true } }),
  s('dawnfall', 'Dawnfall', 'sun', 'Astral', 58, 3200, 7, 10, 6.5, '650% damage that ignores armor, +50% against foes below 35% health.', { effect: { pierce: true, bonusLow: 0.5 } }),

  // -------------------------------------------------------------------- Ash
  s('brand', 'Ember Brand', 'burn', 'Ash', 6, 220, 3, 0, 1, '100% damage and sets the enemy Burning for 3 turns.', { effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('pyre', 'Pyre Wave', 'c_bomb1', 'Ash', 13, 400, 5, 0, 0.6, 'Three strikes of 60% damage and sets the enemy Burning.', { hits: 3, effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('phoenix', 'Phoenix Ash', 'heart', 'Ash', 21, 750, 8, 0, 0, 'Restore 30% health, cleanse and gain a Ward for 2 turns.', { effect: { healPct: 30, cleanse: true, status: 'ward', turns: 2, target: 'self' } }),
  s('cinderstorm', 'Cinderstorm', 'burn', 'Ash', 24, 780, 4, 0, 0.55, 'Four strikes of 55% damage; the foe burns for 3 turns.', { hits: 4, effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('emberward', 'Ember Ward', 'ward', 'Ash', 30, 980, 5, 0, 0.8, '80% damage, gain a Ward for 3 turns and set the foe Burning for 2.', { effect: { ...me('ward', 3), also: [{ status: 'burn', turns: 2, target: 'enemy' }] } }),
  s('inferno', 'Inferno', 'e_fireelem', 'Ash', 38, 1300, 5, 0, 3.4, '340% damage. The foe burns for 4 turns and loses armor.', { effect: { status: 'burn', turns: 4, target: 'enemy', shred: 0.15 } }),
  s('ashfall', 'Ashfall', 'burn', 'Ash', 46, 1800, 5, 0, 2.2, '220% damage. The foe is Weakened and burns for 3 turns.', { effect: { ...on('weak', 3), also: [{ status: 'burn', turns: 3, target: 'enemy' }] } }),
  s('rebirth', 'Rebirth', 'heart', 'Ash', 54, 2500, 9, 0, 0, 'Restore 50% health, cleanse and gain Regeneration for 4 turns.', { effect: { healPct: 50, cleanse: true, status: 'regen', turns: 4, target: 'self' } }),

  // ------------------------------------- regional schools, taught in the new cities
  s('prism', 'Prism Burst', 'star', 'Glass', 25, 900, 4, 0, 1.2, 'Two strikes of 120% damage that ignore armor.', { hits: 2, effect: { pierce: true } }),
  s('refract', 'Refraction', 'ward', 'Glass', 28, 960, 5, 0, 0.8, '80% damage, gain a Ward for 2 turns and Mark the foe.', { effect: { ...me('ward', 2), also: [{ status: 'marked', turns: 2, target: 'enemy' }] } }),
  s('shardstorm', 'Shardstorm', 'bleed', 'Glass', 32, 1150, 4, 0, 0.55, 'Five strikes of 55% damage; the foe bleeds for 3 turns.', { hits: 5, effect: { status: 'bleed', turns: 3, target: 'enemy' } }),
  s('burninglens', 'Burning Lens', 'burn', 'Glass', 36, 1300, 5, 0, 2.8, '280% damage that ignores armor and sets the foe Burning for 3 turns.', { effect: { pierce: true, status: 'burn', turns: 3, target: 'enemy' } }),
  s('mirrorlance', 'Mirror Lance', 'w_spear', 'Glass', 40, 1600, 5, 0, 3, '300% damage and shreds the foe’s armor.', { effect: { pierce: true, shred: 0.2 } }),

  s('undertow', 'Undertow', 'weak', 'Tide', 28, 960, 4, 0, 1.3, '130% damage. The foe is Weakened for 3 turns and Chilled for 2.', { effect: { ...on('weak', 3), also: [{ status: 'chill', turns: 2, target: 'enemy' }] } }),
  s('brinelash', 'Brine Lash', 'w_whip', 'Tide', 31, 1080, 4, 0, 1.6, '160% damage; poison for 3 turns and bleed for 2.', { effect: { ...on('poison', 3), also: [{ status: 'bleed', turns: 2, target: 'enemy' }] } }),
  s('riptide', 'Riptide', 'stun', 'Tide', 35, 1250, 5, 0, 0.9, 'Three strikes of 90% damage, each with 25% chance to Stun.', { hits: 3, effect: { stunChance: 0.25 } }),
  s('tideembrace', 'Tide’s Embrace', 'heart', 'Tide', 39, 1400, 6, 0, 0, 'Restore 30% health, gain a Ward for 2 turns and Regeneration for 3.', { effect: { healPct: 30, ...me('ward', 2), also: [{ status: 'regen', turns: 3, target: 'self' }] } }),
  s('maelstrom', 'Maelstrom', 'stun', 'Tide', 44, 1750, 6, 0, 4, '400% damage and Stuns the foe for 1 turn.', { effect: { status: 'stun', turns: 1, target: 'enemy' } }),

  s('thornlash', 'Thornlash', 'bleed', 'Verdant', 32, 1100, 3, 0, 1.4, '140% damage; the foe bleeds for 3 turns.', { effect: { status: 'bleed', turns: 3, target: 'enemy' } }),
  s('bloom', 'Healing Bloom', 'heart', 'Verdant', 35, 1200, 5, 0, 0, 'Restore 15% health and gain Regeneration for 5 turns.', { effect: { healPct: 15, status: 'regen', turns: 5, target: 'self' } }),
  s('rootsnare', 'Root Snare', 'stun', 'Verdant', 38, 1350, 5, 0, 1, '100% damage; Stun for 1 turn and Weaken for 3.', { effect: { ...on('stun', 1), also: [{ status: 'weak', turns: 3, target: 'enemy' }] } }),
  s('sporecloud', 'Spore Cloud', 'poison', 'Verdant', 42, 1550, 5, 0, 1, '100% damage; Poison for 5 turns and Weaken for 3.', { effect: { ...on('poison', 5), also: [{ status: 'weak', turns: 3, target: 'enemy' }] } }),
  s('overgrowth', 'Overgrowth', 'poison', 'Verdant', 47, 1900, 6, 0, 3.4, '340% damage; Poison for 4 turns and gain Regeneration for 3.', { effect: { ...on('poison', 4), also: [{ status: 'regen', turns: 3, target: 'self' }] } }),

  s('cogstrike', 'Cog-Strike', 'w_hammer', 'Gear', 36, 1300, 3, 0, 1.6, '160% damage with a 35% chance to Stun.', { effect: { stunChance: 0.35 } }),
  s('overclock', 'Overclock', 'ward', 'Gear', 39, 1450, 5, 0, 0.9, 'Three strikes of 90% damage and gain a Ward for 1 turn.', { hits: 3, effect: { status: 'ward', turns: 1, target: 'self' } }),
  s('steamvent', 'Steam Vent', 'burn', 'Gear', 42, 1600, 5, 0, 2, '200% damage; Burn for 3 turns and Weaken for 2.', { effect: { ...on('burn', 3), also: [{ status: 'weak', turns: 2, target: 'enemy' }] } }),
  s('clockwork', 'Clockwork Aid', 'heart', 'Gear', 46, 1850, 6, 0, 0, 'Restore 25% health, cleanse and gain a Ward for 3 turns.', { effect: { healPct: 25, cleanse: true, status: 'ward', turns: 3, target: 'self' } }),
  s('escapement', 'Escapement Break', 'stun', 'Gear', 50, 2200, 6, 0, 4.2, '420% damage that ignores armor and Stuns for 1 turn.', { effect: { pierce: true, status: 'stun', turns: 1, target: 'enemy' } }),

  s('icicle', 'Icicle Volley', 'chill', 'Frost', 40, 1500, 4, 0, 0.6, 'Four strikes of 60% damage; the foe is Chilled for 3 turns.', { hits: 4, effect: { status: 'chill', turns: 3, target: 'enemy' } }),
  s('rimeward', 'Rime Ward', 'ward', 'Frost', 43, 1650, 5, 0, 0.7, '70% damage, gain a Ward for 3 turns and Chill the foe for 3.', { effect: { ...me('ward', 3), also: [{ status: 'chill', turns: 3, target: 'enemy' }] } }),
  s('blizzard', 'Blizzard', 'chill', 'Frost', 46, 1900, 5, 0, 3, '300% damage; Chill for 3 turns and Weaken for 3.', { effect: { ...on('chill', 3), also: [{ status: 'weak', turns: 3, target: 'enemy' }] } }),
  s('permafrost', 'Permafrost', 'stun', 'Frost', 50, 2200, 6, 0, 1.5, '150% damage and Stuns the foe for 2 turns.', { effect: { status: 'stun', turns: 2, target: 'enemy' } }),
  s('absolutezero', 'Absolute Zero', 'chill', 'Frost', 55, 2700, 7, 0, 5, '500% damage that ignores armor; Chill for 4 turns and Stun for 1.', { effect: { pierce: true, ...on('chill', 4), also: [{ status: 'stun', turns: 1, target: 'enemy' }] } }),

  s('umbralgrasp', 'Umbral Grasp', 'weak', 'Deep', 44, 1750, 4, 0, 2.4, '240% damage; Weaken for 3 turns and restore 8 sanity.', { effect: { status: 'weak', turns: 3, target: 'enemy', sanity: 8 } }),
  s('glowtide', 'Glow-Tide', 'sanity', 'Deep', 47, 1900, 6, 0, 0, 'Restore 20% sanity and gain Regeneration for 4 turns.', { effect: { sanityPct: 20, status: 'regen', turns: 4, target: 'self' } }),
  s('abysscall', 'Call of the Deep', 'e_dread', 'Deep', 50, 2200, 5, 4, 3.8, '380% damage that ignores armor.', { effect: { pierce: true } }),
  s('lumenstrike', 'Lumen Strike', 'sun', 'Deep', 53, 2500, 5, 0, 1.2, 'Three strikes of 120% damage.', { hits: 3 }),
  s('hollowing', 'Hollowing', 'e_dread', 'Deep', 57, 3000, 7, 10, 5.8, '580% damage that ignores armor; Weakens and shreds armor.', { effect: { pierce: true, shred: 0.25, status: 'weak', turns: 3, target: 'enemy' } }),

  // ---------- Ascension skills (price 0: only granted by an ascension)
  s('aegiswall', 'Aegis Wall', 'shield', 'Steel', 20, 0, 6, 0, 0.8, '80% damage; Ward for 4 turns and restore 15% health.', { effect: { healPct: 15, ...me('ward', 4) } }),
  s('rampage', 'Rampage', 'w_waraxe', 'Steel', 20, 0, 5, 0, 0.7, 'Four strikes of 70% damage; the foe bleeds.', { hits: 4, effect: { status: 'bleed', turns: 3, target: 'enemy' } }),
  s('unstoppable', 'Unstoppable', 'w_hammer', 'Steel', 40, 0, 7, 0, 3.4, '340% damage, Ward for 2 turns and Stun for 1.', { effect: { ...on('stun', 1), also: [{ status: 'ward', turns: 2, target: 'self' }] } }),
  s('championstrike', 'Champion’s Strike', 'w_blade', 'Steel', 40, 0, 6, 0, 3.8, '380% damage, +100% against foes below 35% health.', { effect: { bonusLow: 1 } }),
  s('wraithcall', 'Wraithcall', 'e_ghost', 'Hex', 20, 0, 5, 3, 1.8, '180% damage; Weaken and Poison the foe.', { effect: { ...on('weak', 3), also: [{ status: 'poison', turns: 3, target: 'enemy' }] } }),
  s('arcaneburst', 'Arcane Burst', 'star', 'Hex', 20, 0, 5, 4, 2.6, '260% damage that ignores armor.', { effect: { pierce: true } }),
  s('voidsnare', 'Void Snare', 'stun', 'Hex', 40, 0, 6, 5, 2.2, '220% damage; Stun for 1 turn and Mark for 3.', { effect: { ...on('stun', 1), also: [{ status: 'marked', turns: 3, target: 'enemy' }] } }),
  s('tempest', 'Tempest', 'burn', 'Hex', 40, 0, 6, 6, 0.9, 'Four strikes of 90% damage that ignore armor, 25% Stun each.', { hits: 4, effect: { pierce: true, stunChance: 0.25 } }),
  s('flourish', 'Flourish', 'w_blade', 'Shadow', 20, 0, 4, 0, 0.7, 'Four strikes of 70% damage; gain a Ward for 1 turn.', { hits: 4, effect: { status: 'ward', turns: 1, target: 'self' } }),
  s('shadowcut', 'Shadow Cut', 'w_dagger', 'Shadow', 20, 0, 5, 0, 2.6, '260% damage, +60% against Marked foes; Bleed for 3.', { effect: { status: 'bleed', turns: 3, target: 'enemy', bonusVs: 'marked', bonusMult: 0.6 } }),
  s('phantomstep', 'Phantom Step', 'boot', 'Shadow', 40, 0, 6, 0, 3, '300% damage, Ward for 3 turns and Regeneration for 3.', { effect: { ...me('ward', 3), also: [{ status: 'regen', turns: 3, target: 'self' }] } }),
  s('liftedfortune', 'Lifted Fortune', 'gold', 'Shadow', 40, 0, 6, 0, 2.8, '280% damage that ignores armor; 50% chance to Stun.', { effect: { pierce: true, stunChance: 0.5 } }),
];
export const SKILL_MAP = new Map(SKILLS.map(x => [x.id, x]));
export const LOADOUT_MAX = 8;
export const MAX_RANK = 5;

/** Mastery: each rank adds 10% damage; rank 5 also shortens the cooldown by one turn. */
export const rankMult = (rank: number) => 1 + 0.1 * (Math.max(1, rank) - 1);
export const rankCost = (sk: SkillDef, nextRank: number) => Math.round((Math.max(120, sk.price * 0.45) + sk.level * 18) * (nextRank - 1) ** 1.6);

const t = (id: string, name: string, icon: string, tree: TalentDef['tree'], tier: number, desc: string, bonus?: Bonus): TalentDef => ({ id, name, icon, tree, tier, desc, bonus });
export const TALENTS: TalentDef[] = [
  t('brawn', 'Iron Sinew', 'armor', 'Steel', 1, '+12 max health.', { maxHp: 12 }),
  t('edge', 'Honed Edge', 'w_blade', 'Steel', 2, '+3 damage.', { damage: 3 }),
  t('bulwarkstance', 'Bulwark Stance', 'shield', 'Steel', 3, '+4 armor.', { armor: 4 }),
  t('executioner', 'Executioner', 'skull', 'Steel', 4, '+50% damage against enemies below 30% health.'),
  t('stalwart', 'Stalwart', 'o_spiked', 'Steel', 5, '+2 Vigor and +4 thorns.', { vigor: 2, thorns: 4 }),
  t('warlord', 'Warlord’s Presence', 'crown', 'Steel', 6, '+6 damage and +6% critical chance.', { damage: 6, crit: 6 }),
  t('ironhide', 'Ironhide', 'armor', 'Steel', 7, '+8 armor and +20 max health.', { armor: 8, maxHp: 20 }),
  t('riposter', 'Riposter', 'w_blade', 'Steel', 8, 'When you dodge an attack, strike back for 60% damage.'),
  t('colossus', 'Colossus', 'o_spiked', 'Steel', 9, '+3 Vigor and +40 max health.', { vigor: 3, maxHp: 40 }),
  t('reaver', 'Reaver', 'w_waraxe', 'Steel', 10, 'Attacks have a 20% chance to strike twice.'),
  t('unyielding', 'Unyielding', 'ward', 'Steel', 11, 'Below 35% health you take 25% less damage.'),
  t('titan', 'Titan’s Mantle', 'crown', 'Steel', 12, '+12 damage, +10 armor and +30 max health.', { damage: 12, armor: 10, maxHp: 30 }),

  t('lucid', 'Lucid Dreamer', 'sanity', 'Hex', 1, '+10 max sanity.', { maxSanity: 10 }),
  t('ironwill', 'Iron Will', 'ward', 'Hex', 2, 'Take 1 less sanity damage from every source. +1 Will.', { will: 1 }),
  t('wellspring', 'Wellspring', 'c_flask', 'Hex', 3, 'Restore sanity after every victory.'),
  t('abyss', 'Abyssal Pact', 'e_dread', 'Hex', 4, 'Below 30% sanity, deal 35% more damage.'),
  t('deepmind', 'Deep Mind', 'eye', 'Hex', 5, '+14 max sanity and +2 Will.', { maxSanity: 14, will: 2 }),
  t('voidtouched', 'Void-Touched', 'moon', 'Hex', 6, 'Skills cost 1 less sanity. +4 damage.', { damage: 4 }),
  t('mindward', 'Mind Ward', 'ward', 'Hex', 7, '+24 max sanity and +2 Will.', { maxSanity: 24, will: 2 }),
  t('echo', 'Echoing Casts', 'star', 'Hex', 8, '20% chance that a skill goes on no cooldown.'),
  t('hexmaster', 'Hexmaster', 'burn', 'Hex', 9, '+7 damage. Your statuses last 1 turn longer.', { damage: 7 }),
  t('sanemend', 'Quiet Tide', 'sanity', 'Hex', 10, 'Restore 2 sanity at the end of every combat turn.'),
  t('archsage', 'Archsage', 'w_staff', 'Hex', 11, '+10 damage and +3 Will.', { damage: 10, will: 3 }),
  t('voidheart', 'Void Heart', 'e_dread', 'Hex', 12, 'Dread blows cost you half as much sanity. +30 max sanity.', { maxSanity: 30 }),

  t('keen', 'Keen Eye', 'marked', 'Shadow', 1, '+9% critical chance.', { crit: 9 }),
  t('scavenger', 'Scavenger', 'gold', 'Shadow', 2, '+40% gold and better loot chances. +10 luck.', { luck: 10 }),
  t('nimble', 'Nimble', 'boot', 'Shadow', 3, '+6% dodge chance.', { dodge: 6 }),
  t('bloodthirst', 'Bloodthirst', 'heart', 'Shadow', 4, 'Heal after every victory.'),
  t('shadowmeld', 'Shadowmeld', 'e_cowled', 'Shadow', 5, '+3 Cunning. Sleeping monsters wake far less often.', { cunning: 3 }),
  t('assassin', 'Assassin’s Grace', 'w_dagger', 'Shadow', 6, '+12% critical chance and +5% dodge.', { crit: 12, dodge: 5 }),
  t('fleet', 'Fleet', 'boot', 'Shadow', 7, '+8% dodge and +20% escape chance.', { dodge: 8, flee: 20 }),
  t('toxicologist', 'Toxicologist', 'poison', 'Shadow', 8, 'Poison deals 60% more damage.'),
  t('opener', 'Opening Strike', 'w_dagger', 'Shadow', 9, 'Your first attack of every fight is a guaranteed critical hit.'),
  t('vanish', 'Vanish', 'c_smoke', 'Shadow', 10, 'Below 30% health you gain +25% dodge.'),
  t('ghost', 'Ghost', 'e_cowled', 'Shadow', 11, '+12% critical chance, +8% dodge and +4 Cunning.', { crit: 12, dodge: 8, cunning: 4 }),
  t('nightmaster', 'Nightmaster', 'moon', 'Shadow', 12, 'Critical hits deal +30% damage. +15 luck.', { luck: 15, critDmg: 30 }),

  t('hardy', 'Hearth-Hardy', 'campfire', 'Ash', 1, '+8 max health and +6 max sanity.', { maxHp: 8, maxSanity: 6 }),
  t('embertouch', 'Ember Touch', 'burn', 'Ash', 2, 'Burning deals 50% more damage.'),
  t('zeal', 'Ashen Zeal', 'sigil', 'Ash', 3, 'Heal for 3% of the damage you deal.', { lifesteal: 3 }),
  t('lastbreath', 'Last Breath', 'c_clearwater', 'Ash', 4, 'Once per fight, survive a lethal blow with 1 health.'),
  t('phoenixblood', 'Phoenixblood', 'j_embers', 'Ash', 5, 'Regenerate 3% of your health every combat turn.'),
  t('sunward', 'Sunward Heart', 'sun', 'Ash', 6, '+2 Vigor, Will and Cunning; +6 luck.', { vigor: 2, will: 2, cunning: 2, luck: 6 }),
  t('emberheart', 'Emberheart', 'heart', 'Ash', 7, '+30 max health, +3 thorns.', { maxHp: 30, thorns: 3 }),
  t('cinderskin', 'Cinderskin', 'armor', 'Ash', 8, '+8 armor and +6 thorns.', { armor: 8, thorns: 6 }),
  t('kindling', 'Kindling', 'burn', 'Ash', 9, 'Burning foes take 25% more damage from every hit.'),
  t('rekindle', 'Rekindle', 'campfire', 'Ash', 10, 'Restore 10% of your health after every victory.'),
  t('sunborn', 'Sunborn', 'sun', 'Ash', 11, '+3 to all attributes.', { vigor: 3, will: 3, cunning: 3 }),
  t('phoenixwing', 'Phoenix Wing', 'heart', 'Ash', 12, 'Regenerate 5% health per turn and +6% lifesteal.', { lifesteal: 6 }),

  t('packrat', 'Packrat', 'bag', 'Wanderer', 1, '+2 supplies from every cache and camp.'),
  t('lightfoot', 'Lightfoot', 'boot', 'Wanderer', 2, '+15% escape chance.', { flee: 15 }),
  t('forager', 'Forager', 'c_wheat', 'Wanderer', 3, 'Supplies last 25% longer on the road.'),
  t('haggler', 'Haggler', 'gold', 'Wanderer', 4, 'Merchants charge 12% less.', { shopPct: 12 }),
  t('treasurehunter', 'Treasure Hunter', 'chest', 'Wanderer', 5, '+25% gold from every source and +8 luck.', { goldPct: 25, luck: 8 }),
  t('scout', 'Scout', 'eye', 'Wanderer', 6, '+1 sight in dungeons and fewer ambushes on the road.', { sight: 1, encPct: 20 }),
  t('tough', 'Tough', 'heart', 'Wanderer', 7, '+30 max health.', { maxHp: 30 }),
  t('lucky', 'Lucky Streak', 'star', 'Wanderer', 8, '+14 luck and +4% critical chance.', { luck: 14, crit: 4 }),
  t('pathfinder', 'Pathfinder', 'compass', 'Wanderer', 9, 'Ambushes on the road are 30% rarer.', { encPct: 30 }),
  t('survivor', 'Survivor', 'campfire', 'Wanderer', 10, '+5% experience from every source.', { xpPct: 5 }),
  t('veteran', 'Veteran', 'crown', 'Wanderer', 11, '+2 to all attributes.', { vigor: 2, will: 2, cunning: 2 }),
  t('legend', 'Living Legend', 'trophy', 'Wanderer', 12, '+12% experience and +12% gold.', { xpPct: 12, goldPct: 12 }),
];
export const TALENT_MAP = new Map(TALENTS.map(x => [x.id, x]));
export const TREES = ['Steel', 'Hex', 'Shadow', 'Ash', 'Wanderer'] as const;

const a = (id: string, name: string, icon: string, path: string, tier: 1 | 2, level: number, desc: string, bonus: Bonus, skill?: string): AscensionDef => ({ id, name, icon, path, tier, level, desc, bonus, skill });
export const ASCENSIONS: AscensionDef[] = [
  a('asc_bulwark', 'Bulwark', 'shield', 'Vanguard', 1, 20, 'A wall that walks. +10 armor, +40 health. Grants Aegis Wall.', { armor: 10, maxHp: 40 }, 'aegiswall'),
  a('asc_warlord', 'Warlord', 'w_waraxe', 'Vanguard', 1, 20, 'A storm in iron. +8 damage, +8% critical chance. Grants Rampage.', { damage: 8, crit: 8 }, 'rampage'),
  a('asc_juggernaut', 'Juggernaut', 'armor', 'Vanguard', 2, 40, 'Nothing stops you. +16 armor, +80 health, +4 Vigor. Grants Unstoppable.', { armor: 16, maxHp: 80, vigor: 4 }, 'unstoppable'),
  a('asc_champion', 'Champion', 'crown', 'Vanguard', 2, 40, 'Every duel is yours. +20 damage, +10% critical chance. Grants Champion’s Strike.', { damage: 20, crit: 10 }, 'championstrike'),
  a('asc_wraithcaller', 'Wraithcaller', 'e_ghost', 'Hexer', 1, 20, 'The dead lean close. +30 sanity, +3 Will. Grants Wraithcall.', { maxSanity: 30, will: 3 }, 'wraithcall'),
  a('asc_archmage', 'Archmage', 'star', 'Hexer', 1, 20, 'Raw, unkind power. +9 damage, +2 Will. Grants Arcane Burst.', { damage: 9, will: 2 }, 'arcaneburst'),
  a('asc_voidbinder', 'Voidbinder', 'moon', 'Hexer', 2, 40, 'You tie the dark in knots. +60 sanity, +5 Will. Grants Void Snare.', { maxSanity: 60, will: 5 }, 'voidsnare'),
  a('asc_stormweaver', 'Stormweaver', 'burn', 'Hexer', 2, 40, 'Lightning learns your name. +22 damage, +4 Will. Grants Tempest.', { damage: 22, will: 4 }, 'tempest'),
  a('asc_duelist', 'Duelist', 'w_blade', 'Vagrant', 1, 20, 'Grace under pressure. +10% dodge, +6% critical chance. Grants Flourish.', { dodge: 10, crit: 6 }, 'flourish'),
  a('asc_nightblade', 'Nightblade', 'w_dagger', 'Vagrant', 1, 20, 'Quiet, then sudden. +12% critical chance, +3 Cunning. Grants Shadow Cut.', { crit: 12, cunning: 3 }, 'shadowcut'),
  a('asc_phantom', 'Phantom', 'e_cowled', 'Vagrant', 2, 40, 'You are mostly rumor. +16% dodge, +5 Cunning. Grants Phantom Step.', { dodge: 16, cunning: 5 }, 'phantomstep'),
  a('asc_ghostthief', 'Ghost-Thief', 'gold', 'Vagrant', 2, 40, 'You steal fortune itself. +25 luck, +14% critical chance. Grants Lifted Fortune.', { luck: 25, crit: 14 }, 'liftedfortune'),
];
export const ASCENSION_MAP = new Map(ASCENSIONS.map(x => [x.id, x]));
