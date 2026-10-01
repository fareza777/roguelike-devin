import type { SkillDef, TalentDef } from '../types';

const s = (id: string, name: string, icon: string, school: SkillDef['school'], level: number, price: number, cooldown: number, sanityCost: number, mult: number, desc: string, o: Partial<SkillDef> = {}): SkillDef =>
  ({ id, name, icon, school, level, price, cooldown, sanityCost, mult, desc, ...o });

export const SKILLS: SkillDef[] = [
  s('sever', 'Sever', 'bleed', 'Steel', 1, 0, 2, 0, 1.6, '160% damage and inflicts Bleed for 2 turns.', { effect: { status: 'bleed', turns: 2, target: 'enemy' } }),
  s('riposte', 'Riposte', 'ward', 'Steel', 1, 0, 3, 0, 1.1, '110% damage and gain a Ward for 1 turn.', { effect: { status: 'ward', turns: 1, target: 'self' } }),
  s('shatter', 'Skull Shatter', 'stun', 'Steel', 3, 140, 5, 0, 0.9, '90% damage and Stuns the enemy for 1 turn.', { effect: { status: 'stun', turns: 1, target: 'enemy' } }),
  s('cleave', 'Whirling Cleave', 'w_axe', 'Steel', 6, 220, 3, 0, 0.8, 'Two strikes of 80% damage each.', { hits: 2 }),
  s('breaker', 'Bulwark Breaker', 'w_hammer', 'Steel', 9, 300, 4, 0, 1.3, '130% damage that ignores armor.', { effect: { pierce: true } }),
  s('rally', 'Iron Rally', 'shield', 'Steel', 12, 380, 5, 0, 0, 'Restore 20% of your health and gain a Ward for 1 turn.', { effect: { healPct: 20, status: 'ward', turns: 1, target: 'self' } }),
  s('headsman', 'Headsman’s Due', 'w_cleaver', 'Steel', 18, 560, 6, 0, 2.5, '250% damage, +60% against bleeding foes.', { effect: { bonusVs: 'bleed', bonusMult: 0.6 } }),

  s('cinder', 'Cinder Hex', 'burn', 'Occult', 1, 0, 3, 1, 1.3, '130% damage and sets the enemy Burning for 3 turns.', { effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('hexbrand', 'Hexbrand', 'marked', 'Occult', 3, 130, 4, 1, 0.6, '60% damage. The enemy is Marked and takes 30% more damage for 3 turns.', { effect: { status: 'marked', turns: 3, target: 'enemy' } }),
  s('void', 'Void Lance', 'e_dread', 'Occult', 8, 260, 4, 4, 2.2, '220% damage that ignores armor.', { effect: { pierce: true } }),
  s('soulflame', 'Soulflame', 'e_fireelem', 'Occult', 12, 400, 5, 3, 0.7, 'Three strikes of 70% damage; sets the enemy Burning.', { hits: 3, effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('unravel', 'Unravel', 'e_ghost', 'Occult', 15, 460, 5, 3, 2, '200% damage and Weakens the enemy for 3 turns.', { effect: { status: 'weak', turns: 3, target: 'enemy' } }),
  s('nightfall', 'Nightfall', 'moon', 'Occult', 22, 820, 6, 6, 3.2, '320% damage that ignores armor.', { effect: { pierce: true } }),

  s('mark', 'Hunter’s Mark', 'marked', 'Shadow', 2, 120, 5, 0, 0.5, '50% damage. The enemy is Marked for 3 turns.', { effect: { status: 'marked', turns: 3, target: 'enemy' } }),
  s('venom', 'Venomstrike', 'poison', 'Shadow', 4, 170, 3, 0, 1.1, '110% damage and Poisons the enemy for 4 turns.', { effect: { status: 'poison', turns: 4, target: 'enemy' } }),
  s('backstab', 'Backstab', 'w_dagger', 'Shadow', 7, 250, 4, 0, 2.2, '220% damage, +50% against Marked or Stunned foes.', { effect: { bonusVs: 'marked', bonusMult: 0.5 } }),
  s('evade', 'Shadowstep', 'boot', 'Shadow', 10, 320, 5, 0, 0.8, '80% damage and gain a Ward for 2 turns.', { effect: { status: 'ward', turns: 2, target: 'self' } }),
  s('flurry', 'Flurry', 'w_whip', 'Shadow', 14, 430, 4, 0, 0.5, 'Four strikes of 50% damage each.', { hits: 4 }),
  s('blossom', 'Deathblossom', 'skull', 'Shadow', 20, 700, 5, 2, 2.6, '260% damage and Poisons the enemy for 4 turns.', { effect: { status: 'poison', turns: 4, target: 'enemy' } }),

  s('mend', 'Blood Mend', 'heart', 'Sanguine', 1, 0, 4, 2, 0, 'Trade 2 sanity to restore 15% of your health (+8).', { effect: { heal: 8, healPct: 15 } }),
  s('leech', 'Leech Rite', 'c_heartbottle', 'Sanguine', 5, 180, 4, 2, 1.2, '120% damage and heal for half of it.', { effect: { leech: 0.5 } }),
  s('bloodpact', 'Blood Pact', 'bleed', 'Sanguine', 11, 400, 4, 0, 3, 'Sacrifice 12% of your max health for 300% damage.', { hpCost: 12 }),
  s('transfuse', 'Transfusion', 'c_holywater', 'Sanguine', 16, 550, 7, 4, 0, 'Restore 35% health and cleanse every ailment.', { effect: { healPct: 35, cleanse: true } }),

  s('still', 'Still Mind', 'sanity', 'Discipline', 2, 90, 4, 0, 0, 'Restore 9 sanity (+15% of maximum) and cleanse Weakness.', { effect: { sanity: 9, sanityPct: 15, cleanse: true } }),
  s('hymn', 'Ashen Hymn', 'holy', 'Discipline', 4, 160, 5, 0, 0, 'Cleanse yourself and gain a Ward for 2 turns.', { effect: { status: 'ward', turns: 2, target: 'self', cleanse: true } }),
  s('stillness', 'Iron Stillness', 'shield', 'Discipline', 13, 350, 6, 0, 0, 'Gain a Ward for 3 turns and restore 20% of your sanity.', { effect: { status: 'ward', turns: 3, target: 'self', sanityPct: 20 } }),
  s('litany', 'Litany of Noon', 'sun', 'Discipline', 19, 650, 8, 0, 0, 'Cleanse, restore 25% health and 25% sanity.', { effect: { healPct: 25, sanityPct: 25, cleanse: true } }),

  s('collapse', 'Collapse', 'weak', 'Astral', 9, 280, 4, 2, 1.5, '150% damage and Weakens the enemy for 3 turns.', { effect: { status: 'weak', turns: 3, target: 'enemy' } }),
  s('starfall', 'Starfall', 'star', 'Astral', 17, 500, 5, 3, 1.1, 'Two blazing strikes of 110% damage each.', { hits: 2 }),
  s('eclipse', 'Black Eclipse', 'eclipse', 'Astral', 26, 1000, 7, 8, 4, '400% damage that ignores armor.', { effect: { pierce: true } }),

  s('brand', 'Ember Brand', 'burn', 'Ash', 6, 220, 3, 0, 1, '100% damage and sets the enemy Burning for 3 turns.', { effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('pyre', 'Pyre Wave', 'c_bomb1', 'Ash', 13, 400, 5, 0, 0.6, 'Three strikes of 60% damage and sets the enemy Burning.', { hits: 3, effect: { status: 'burn', turns: 3, target: 'enemy' } }),
  s('phoenix', 'Phoenix Ash', 'heart', 'Ash', 21, 750, 8, 0, 0, 'Restore 30% health, cleanse and gain a Ward for 2 turns.', { effect: { healPct: 30, cleanse: true, status: 'ward', turns: 2, target: 'self' } }),
];
export const SKILL_MAP = new Map(SKILLS.map(x => [x.id, x]));
export const LOADOUT_MAX = 6;

const t = (id: string, name: string, icon: string, tree: TalentDef['tree'], tier: number, desc: string, bonus?: TalentDef['bonus']): TalentDef => ({ id, name, icon, tree, tier, desc, bonus });
export const TALENTS: TalentDef[] = [
  t('brawn', 'Iron Sinew', 'armor', 'Steel', 1, '+12 max health.', { maxHp: 12 }),
  t('edge', 'Honed Edge', 'w_blade', 'Steel', 2, '+3 damage.', { damage: 3 }),
  t('bulwarkstance', 'Bulwark Stance', 'shield', 'Steel', 3, '+4 armor.', { armor: 4 }),
  t('executioner', 'Executioner', 'skull', 'Steel', 4, '+50% damage against enemies below 30% health.'),
  t('stalwart', 'Stalwart', 'o_spiked', 'Steel', 5, '+2 Vigor and +4 thorns.', { vigor: 2, thorns: 4 }),
  t('warlord', 'Warlord’s Presence', 'crown', 'Steel', 6, '+6 damage and +6% critical chance.', { damage: 6, crit: 6 }),

  t('lucid', 'Lucid Dreamer', 'sanity', 'Occult', 1, '+10 max sanity.', { maxSanity: 10 }),
  t('ironwill', 'Iron Will', 'ward', 'Occult', 2, 'Take 1 less sanity damage from every source. +1 Will.', { will: 1 }),
  t('wellspring', 'Wellspring', 'c_flask', 'Occult', 3, 'Restore sanity after every victory.'),
  t('abyss', 'Abyssal Pact', 'e_dread', 'Occult', 4, 'Below 30% sanity, deal 35% more damage.'),
  t('deepmind', 'Deep Mind', 'eye', 'Occult', 5, '+14 max sanity and +2 Will.', { maxSanity: 14, will: 2 }),
  t('voidtouched', 'Void-Touched', 'moon', 'Occult', 6, 'Skills cost 1 less sanity. +4 damage.', { damage: 4 }),

  t('keen', 'Keen Eye', 'marked', 'Shadow', 1, '+9% critical chance.', { crit: 9 }),
  t('scavenger', 'Scavenger', 'gold', 'Shadow', 2, '+40% gold and better loot chances. +10 luck.', { luck: 10 }),
  t('nimble', 'Nimble', 'boot', 'Shadow', 3, '+6% dodge chance.', { dodge: 6 }),
  t('bloodthirst', 'Bloodthirst', 'heart', 'Shadow', 4, 'Heal after every victory.'),
  t('shadowmeld', 'Shadowmeld', 'e_cowled', 'Shadow', 5, '+3 Cunning. Sleeping monsters wake far less often.', { cunning: 3 }),
  t('assassin', 'Assassin’s Grace', 'w_dagger', 'Shadow', 6, '+12% critical chance and +5% dodge.', { crit: 12, dodge: 5 }),

  t('hardy', 'Hearth-Hardy', 'campfire', 'Ash', 1, '+8 max health and +6 max sanity.', { maxHp: 8, maxSanity: 6 }),
  t('embertouch', 'Ember Touch', 'burn', 'Ash', 2, 'Burning deals 50% more damage.'),
  t('zeal', 'Ashen Zeal', 'holy', 'Ash', 3, 'Heal for 3% of the damage you deal.', { lifesteal: 3 }),
  t('martyr', 'Martyr’s Resolve', 'c_holywater', 'Ash', 4, 'Once per fight, survive a lethal blow with 1 health.'),
  t('phoenixblood', 'Phoenixblood', 'j_embers', 'Ash', 5, 'Regenerate 3% of your health every combat turn.'),
  t('sunward', 'Sunward Heart', 'sun', 'Ash', 6, '+2 Vigor, Will and Cunning; +6 luck.', { vigor: 2, will: 2, cunning: 2, luck: 6 }),
];
export const TALENT_MAP = new Map(TALENTS.map(x => [x.id, x]));
export const TREES = ['Steel', 'Occult', 'Shadow', 'Ash'] as const;
