import type { Bonus, ItemDef, ItemUse, Rarity, Slot } from '../types';

type SecSpec = [keyof Bonus, number, number];
const v = (base: number, step: number, t: number) => Math.round(base + step * t);
const PRICE = [45, 130, 300, 650, 1300];
const TIER_FLAVOR = [
  'Worn, but it has kept someone alive before.',
  'Well made and trusted by people who survive.',
  'Forged for the deep places, and it shows.',
  'Carried by heroes and buried with them.',
  'A relic of the Twelve Regents. It hums when you sleep.',
];

const tierRarity = (t: number, fi: number): Rarity => (t === 0 ? 'common' : t === 1 ? (fi % 2 ? 'rare' : 'common') : t === 2 ? 'rare' : t === 3 ? 'epic' : fi % 2 ? 'relic' : 'epic');

interface WeaponFamily { f: string; icon: string; dmg: number; sec: SecSpec[]; blurb: string; names: string[] }
const WEAPONS: WeaponFamily[] = [
  { f: 'blade', icon: 'w_blade', dmg: 1, sec: [['crit', 1, 1.6]], blurb: 'A straight blade.', names: ['Notched Sabre', 'Watchman’s Longsword', 'Wardsteel Falchion', 'Warden’s Oathblade', 'Dawnsplitter'] },
  { f: 'curved', icon: 'w_curved', dmg: 0.95, sec: [['crit', 2, 2.2]], blurb: 'A curved cutting blade.', names: ['Rusted Scimitar', 'Saltmere Cutlass', 'Emberforged Kris', 'Nightwind Tulwar', 'Moonlit Shamshir'] },
  { f: 'axe', icon: 'w_axe', dmg: 1.1, sec: [['vigor', 0, 0.7]], blurb: 'An axe that ends arguments.', names: ['Woodsman’s Hatchet', 'Bearded Axe', 'Gravedigger’s Bardiche', 'Frostbite Waraxe', 'Hollowbell Cleaver-Axe'] },
  { f: 'hammer', icon: 'w_hammer', dmg: 1.15, sec: [['maxHp', 2, 4]], blurb: 'A hammer made for breaking things that should not move.', names: ['Mason’s Maul', 'Bell-Breaker', 'Titan’s Gavel', 'Rimefall Hammer', 'Regent’s Judgement'] },
  { f: 'mace', icon: 'w_mace', dmg: 1, sec: [['armor', 0, 0.9]], blurb: 'A weighted club. The weight is mostly rhetorical.', names: ['Caretaker’s Mace', 'Mourner’s Morningstar', 'Ashbrand Flail', 'Frozen Lamp-Mace', 'Mace of the Blind Seer'] },
  { f: 'spear', icon: 'w_spear', dmg: 1, sec: [['cunning', 0, 0.8], ['dodge', 1, 1]], blurb: 'Reach is a kind of armor.', names: ['Boar Spear', 'Harpoon-Lance', 'Ashwood Pike', 'Wardstaff Spear', 'Sunpiercer'] },
  { f: 'halberd', icon: 'w_halberd', dmg: 1.1, sec: [['armor', 0, 0.6], ['vigor', 0, 0.4]], blurb: 'The gate-warden’s answer to most questions.', names: ['Watch Halberd', 'Gatekeeper Poleaxe', 'Marrow Glaive', 'Frostguard Bardiche', 'Pale Regent’s Halberd'] },
  { f: 'dagger', icon: 'w_dagger', dmg: 0.75, sec: [['crit', 3, 2.6], ['dodge', 1, 1.2]], blurb: 'Quiet, quick and unforgiving.', names: ['Boot Knife', 'Smuggler’s Stiletto', 'Bone Kris', 'Nightshade Dirk', 'Whisper of Noon'] },
  { f: 'whip', icon: 'w_whip', dmg: 0.8, sec: [['cunning', 1, 0.9], ['crit', 0, 1.6]], blurb: 'Reaches what the sword cannot.', names: ['Drover’s Lash', 'Ringmaster’s Whip', 'Barbed Scourge', 'Frostbitten Flagellum', 'Serpent of Noon'] },
  { f: 'arquebus', icon: 'w_musket', dmg: 1.25, sec: [['crit', 1, 1.6]], blurb: 'Loud, slow and decisive.', names: ['Grave-Iron Arquebus', 'Marshal’s Handcannon', 'Emberlock Musket', 'Winterbore Long-Gun', 'Thunder of the Last Hour'] },
  { f: 'pistol', icon: 'w_pistol', dmg: 1, sec: [['crit', 2, 2], ['luck', 0, 1]], blurb: 'Built from coffin nails and bad decisions.', names: ['Coffin-Nail Pistol', 'Duelist’s Flintlock', 'Cinderlock Revolver', 'Frostspit Pistol', 'Star-Eater'] },
  { f: 'crossbow', icon: 'w_crossbow', dmg: 1.05, sec: [['cunning', 0, 0.8], ['crit', 1, 1.2]], blurb: 'Patient death at range.', names: ['Rustbolt Crossbow', 'Hunter’s Arbalest', 'Marrowbone Crossbow', 'Wintergale Repeater', 'Regent’s Ballista'] },
  { f: 'staff', icon: 'w_staff', dmg: 0.8, sec: [['will', 1, 0.9], ['maxSanity', 2, 3]], blurb: 'A focus for those who bargain with the dark.', names: ['Driftwood Staff', 'Wanderer’s Crook', 'Ashbloom Staff', 'Rimeglass Staff', 'Staff of the Twelfth Hour'] },
  { f: 'tome', icon: 'w_tome', dmg: 0.85, sec: [['will', 1, 1], ['crit', 0, 1.4]], blurb: 'Its pages turn toward whatever you fear.', names: ['Water-Stained Ledger', 'Unbound Songbook', 'Outlaw’s Codex', 'Frozen Lexicon', 'Book of Noon’s Names'] },
  { f: 'scythe', icon: 'w_scythe', dmg: 1.1, sec: [['lifesteal', 0, 1.6]], blurb: 'Harvests more than grain.', names: ['Harvester’s Sickle', 'Reaper’s Scythe', 'Marrow-Reaper', 'Winter’s Tithe', 'Scythe of the Final Harvest'] },
  { f: 'cleaver', icon: 'w_cleaver', dmg: 1.05, sec: [['vigor', 0, 0.6], ['thorns', 0, 1]], blurb: 'Heavy and honest.', names: ['Butcher’s Cleaver', 'Slaughterman’s Chopper', 'Marrow-Splitter', 'Frostjaw Cleaver', 'Executioner of Noon'] },
];

interface ArmorSlot { slot: Slot; mul: number; label: string }
const ARMOR_SLOTS: ArmorSlot[] = [{ slot: 'head', mul: 0.45, label: 'head' }, { slot: 'body', mul: 1, label: 'body' }, { slot: 'hands', mul: 0.35, label: 'hands' }, { slot: 'feet', mul: 0.35, label: 'feet' }];
const BODY_ARMOR = [2, 5, 9, 14, 20];
interface Arch { a: 'heavy' | 'medium' | 'cloth'; mul: number; sec: SecSpec[] }
const ARCH: Arch[] = [
  { a: 'heavy', mul: 1, sec: [['maxHp', 2, 3.5]] },
  { a: 'medium', mul: 0.7, sec: [['dodge', 0, 1.1], ['cunning', 0, 0.35]] },
  { a: 'cloth', mul: 0.4, sec: [['maxSanity', 1, 2.5], ['will', 0, 0.5]] },
];
const ARMOR_NAMES: Record<string, string[][]> = {
  'head:heavy': [['Kettle Helm', 'Saltsteel Barbute', 'Wardbone Greathelm', 'Frostguard Visor', 'Warden’s Crown-Helm']],
  'head:medium': [['Ragged Hood', 'Smuggler’s Cowl', 'Ashwood Mask', 'Rimewolf Hood', 'Nightwalker’s Veil']],
  'head:cloth': [['Wanderer’s Circlet', 'Scholar’s Cap', 'Hexer’s Hat', 'Rimeglass Diadem', 'Circlet of the Third Eye']],
  'body:heavy': [['Watchman Coat', 'Saltplate Cuirass', 'Wardbone Mail', 'Frostbitten Plate', 'Warden’s Bulwark']],
  'body:medium': [['Traveler’s Jerkin', 'Smuggler Leathers', 'Ashhide Vest', 'Wolfpelt Coat', 'Nightweave Cloak']],
  'body:cloth': [['Mourner’s Robe', 'Scribe’s Garb', 'Ember Surcoat', 'Rimespun Robes', 'Garb of the Hollow Chorus']],
  'hands:heavy': [['Iron Gauntlets', 'Saltforged Gauntlets', 'Bonebound Fists', 'Frostplate Gauntlets', 'Warden’s Grasp']],
  'hands:medium': [['Worn Gloves', 'Lockpicker’s Gloves', 'Ashfinger Wraps', 'Wolfhide Mitts', 'Whispering Gloves']],
  'hands:cloth': [['Bandage Wraps', 'Ink-Stained Gloves', 'Cinder Wristbands', 'Rimeweave Cuffs', 'Bracers of Quiet Hands']],
  'feet:heavy': [['Iron Greaves', 'Saltsteel Sabatons', 'Marrow Greaves', 'Frostshod Sabatons', 'Warden’s Stride']],
  'feet:medium': [['Muddy Boots', 'Dockwalker Boots', 'Ashstep Boots', 'Snowstalker Boots', 'Boots of Soft Falling']],
  'feet:cloth': [['Wanderer Sandals', 'Scholar’s Slippers', 'Emberwalk Sandals', 'Rimeslip Slippers', 'Slippers of the Last Hour']],
};
const ARMOR_ICON: Record<string, string> = {
  'head:heavy': 'h_heavy', 'head:medium': 'h_medium', 'head:cloth': 'h_cloth', 'body:heavy': 'b_heavy', 'body:medium': 'b_medium', 'body:cloth': 'b_cloth',
  'hands:heavy': 'g_heavy', 'hands:medium': 'g_medium', 'hands:cloth': 'g_cloth', 'feet:heavy': 'f_heavy', 'feet:medium': 'f_medium', 'feet:cloth': 'f_cloth',
};

interface Accessory { f: string; slot: Slot; icon: string; prim: SecSpec[]; mul: number; blurb: string; names: string[] }
const ACCESSORIES: Accessory[] = [
  { f: 'shield', slot: 'offhand', icon: 'o_round', prim: [['armor', 1, 2.2], ['maxHp', 2, 3]], mul: 0.85, blurb: 'Something to stand behind.', names: ['Dented Buckler', 'Harbor Roundshield', 'Ashwood Targe', 'Frostguard Kite', 'Aegis of Vigil'] },
  { f: 'bulwark', slot: 'offhand', icon: 'o_spiked', prim: [['armor', 1, 2.4], ['thorns', 1, 2]], mul: 0.95, blurb: 'Hurts to hit.', names: ['Spiked Pavise', 'Barbed Bulwark', 'Marrowspike Shield', 'Icetooth Bulwark', 'Thornwall of the Dead'] },
  { f: 'lantern', slot: 'offhand', icon: 'o_lantern', prim: [['maxSanity', 4, 4], ['will', 0, 1]], mul: 0.85, blurb: 'Holds the whispering at arm’s length.', names: ['Tin Lantern', 'Wanderer Lantern', 'Emberglass Lantern', 'Rimeglass Lantern', 'Lantern of the Long Vigil'] },
  { f: 'orb', slot: 'offhand', icon: 'o_orb', prim: [['will', 1, 1.2], ['crit', 2, 2]], mul: 0.9, blurb: 'Shows a future you did not order.', names: ['Cloudy Scrying Glass', 'Tidecaller Orb', 'Cinder Orb', 'Frozen Eye', 'Orb of Twelve Veyrs'] },
  { f: 'signet', slot: 'ring', icon: 'r_signet', prim: [['vigor', 1, 0.7], ['maxHp', 3, 4]], mul: 0.85, blurb: 'A ring worn by people who hold the line.', names: ['Copper Signet', 'Watch Signet', 'Bonebound Signet', 'Frostiron Signet', 'Signet of the Regent'] },
  { f: 'band', slot: 'ring', icon: 'r_ring', prim: [['cunning', 1, 0.7], ['crit', 2, 1.8]], mul: 0.85, blurb: 'Light fingers wear light rings.', names: ['Twisted Wire Band', 'Smuggler’s Band', 'Cinderglass Band', 'Rime Band', 'Band of Idle Hours'] },
  { f: 'gemring', slot: 'ring', icon: 'r_diamond', prim: [['will', 1, 0.7], ['maxSanity', 3, 3.5]], mul: 0.9, blurb: 'A stone that remembers being a star.', names: ['Glass Ring', 'Pearl Ring', 'Ember Ring', 'Frostdiamond Ring', 'Ring of Noon’s Tears'] },
  { f: 'links', slot: 'ring', icon: 'r_linked', prim: [['luck', 4, 4], ['dodge', 1, 1.2]], mul: 0.85, blurb: 'Fortune favours those who wear its knots.', names: ['Hempen Knots', 'Charm Rings', 'Amber Links', 'Rime Links', 'Links of Fate'] },
  { f: 'pendant', slot: 'amulet', icon: 'a_gem', prim: [['maxHp', 5, 6], ['armor', 0, 0.6]], mul: 0.9, blurb: 'Warm against the skin.', names: ['Tin Pendant', 'Warden’s Pendant', 'Ashen Pendant', 'Frozen Pendant', 'Heartstone of the Warden'] },
  { f: 'charm', slot: 'amulet', icon: 'a_charm', prim: [['luck', 5, 5], ['cunning', 0, 0.6]], mul: 0.85, blurb: 'It watches over your pockets.', names: ['Gull-Bone Charm', 'Saltwitch Charm', 'Charwood Charm', 'Snowbone Charm', 'Seer’s Charm'] },
  { f: 'rune', slot: 'amulet', icon: 'a_rune', prim: [['damage', 1, 1.6], ['crit', 1, 1.4]], mul: 1, blurb: 'A single word, carved deep.', names: ['Chipped Rune', 'Etched Rune', 'Emberrune', 'Rimerune', 'Sunrune'] },
  { f: 'locket', slot: 'amulet', icon: 'a_heart', prim: [['maxSanity', 5, 5], ['will', 0, 0.8]], mul: 0.9, blurb: 'A stranger’s face, and it is kind.', names: ['Faded Locket', 'Widow’s Locket', 'Cinder Locket', 'Rimelocket', 'Locket of Remembered Faces'] },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const priceFor = (t: number, mul: number, r: Rarity) => Math.round((PRICE[t] * mul * (1 + ['common', 'rare', 'epic', 'relic'].indexOf(r) * 0.12)) / 5) * 5;

function applySec(b: Bonus, specs: SecSpec[], t: number) {
  specs.forEach(([k, base, step]) => { const val = v(base, step, t); if (val) b[k] = (b[k] ?? 0) + val });
}

const generated: ItemDef[] = [];
WEAPONS.forEach((w, fi) => w.names.forEach((name, t) => {
  const r = tierRarity(t, fi);
  const bonus: Bonus = { damage: Math.max(1, Math.round([3, 7, 12, 18, 26][t] * w.dmg)) };
  applySec(bonus, w.sec, t);
  generated.push({ id: `w_${w.f}_${t}`, name, icon: w.icon, slot: 'weapon', rarity: r, tier: t, desc: `${w.blurb} ${TIER_FLAVOR[t]}`, price: priceFor(t, 1, r), bonus, family: w.f });
}));
ARMOR_SLOTS.forEach(as => ARCH.forEach((ar, ai) => {
  const key = `${as.slot}:${ar.a}`;
  ARMOR_NAMES[key][0].forEach((name, t) => {
    const r = tierRarity(t, as.slot.length + ai);
    const bonus: Bonus = { armor: Math.max(1, Math.round(BODY_ARMOR[t] * as.mul * ar.mul)) };
    applySec(bonus, ar.sec.map(([k, b, s]) => [k, b * as.mul * 1.3, s * as.mul * 1.3] as SecSpec), t);
    const blurb = ar.a === 'heavy' ? 'Heavy protection for the front line.' : ar.a === 'medium' ? 'Light armor for those who prefer not to be hit.' : 'Woven with whispers and stitched with will.';
    generated.push({ id: `a_${as.slot}_${ar.a}_${t}`, name, icon: ARMOR_ICON[key], slot: as.slot, rarity: r, tier: t, desc: `${blurb} ${TIER_FLAVOR[t]}`, price: priceFor(t, as.mul * 1.1 + 0.1, r), bonus, family: ar.a });
  });
}));
ACCESSORIES.forEach((a, fi) => a.names.forEach((name, t) => {
  const r = tierRarity(t, fi);
  const bonus: Bonus = {};
  applySec(bonus, a.prim, t);
  if (a.slot === 'offhand') (['armor', 'maxHp'] as const).forEach(k => { if (bonus[k]) bonus[k] = Math.round((bonus[k] ?? 0) * a.mul) });
  generated.push({ id: `x_${a.f}_${t}`, name, icon: a.icon, slot: a.slot, rarity: r, tier: t, desc: `${a.blurb} ${TIER_FLAVOR[t]}`, price: priceFor(t, a.mul, r), bonus, family: a.f });
}));

const gear = (id: string, name: string, icon: string, slot: Slot, rarity: Rarity, tier: number, desc: string, bonus: Bonus, extra: Partial<ItemDef> = {}): ItemDef =>
  ({ id, name, icon, slot, rarity, tier, desc, price: Math.round(PRICE[tier] * 2.2 * (rarity === 'relic' ? 2 : 1.4) / 10) * 10, bonus, unique: true, ...extra });

export const SETS: Record<string, { name: string; two: Bonus; four: Bonus; blurb: string }> = {
  drowned: { name: 'Drowned Regalia', two: { maxSanity: 10, will: 2 }, four: { maxSanity: 12, will: 3, dodge: 6 }, blurb: 'The Widow’s bridal wardrobe. It is still wet.' },
  ember: { name: 'Ember Raiment', two: { damage: 4, crit: 5 }, four: { damage: 6, crit: 8, thorns: 4 }, blurb: 'Woven from the Hart’s shed forest.' },
  marrow: { name: 'Marrowbound', two: { armor: 6, maxHp: 20 }, four: { armor: 8, maxHp: 30, thorns: 6, vigor: 3 }, blurb: 'Bone-plate cut by miners who wanted to be remembered.' },
  frost: { name: 'Frostwarden Panoply', two: { armor: 8, will: 2 }, four: { armor: 10, maxHp: 25, dodge: 5, will: 3 }, blurb: 'The southward army’s last uniform.' },
  noon: { name: 'Regalia of Noon', two: { damage: 8, crit: 8 }, four: { damage: 10, vigor: 3, will: 3, cunning: 3, luck: 10 }, blurb: 'Every piece fits. That is the horror of it.' },
};

const uniques: ItemDef[] = [
  gear('set_drowned_head', 'Widow’s Veil', 'h_cloth', 'head', 'epic', 1, 'A veil of black lace that drips no matter the weather.', { armor: 3, maxSanity: 8, will: 1 }, { set: 'drowned' }),
  gear('set_drowned_body', 'Bellwright Habit', 'b_cloth', 'body', 'epic', 1, 'Every stitch is a bell-note.', { armor: 6, maxSanity: 12, will: 1 }, { set: 'drowned' }),
  gear('set_drowned_hands', 'Tidewrung Gloves', 'g_cloth', 'hands', 'epic', 1, 'Rope-burned by a thousand bell-pulls.', { armor: 2, cunning: 1, maxSanity: 4 }, { set: 'drowned' }),
  gear('set_drowned_feet', 'Saltlogged Boots', 'f_medium', 'feet', 'epic', 1, 'They squelch even on dry stone.', { armor: 2, dodge: 3, maxHp: 6 }, { set: 'drowned' }),
  gear('set_ember_head', 'Cinder Antlers', 'h_horned', 'head', 'epic', 2, 'Charred antlers on a leather cap. They warm when you are hunted.', { armor: 4, crit: 4, damage: 1 }, { set: 'ember' }),
  gear('set_ember_body', 'Hartwyn’s Hide', 'b_vest', 'body', 'epic', 2, 'Hide from a stag that was a man.', { armor: 8, maxHp: 12, damage: 1 }, { set: 'ember' }),
  gear('set_ember_hands', 'Ashwalker Gloves', 'g_medium', 'hands', 'epic', 2, 'Ash falls off them like memory.', { armor: 3, crit: 3, cunning: 1 }, { set: 'ember' }),
  gear('set_ember_feet', 'Emberstep Boots', 'f_medium', 'feet', 'epic', 2, 'Leave scorch marks in the shape of a hoof.', { armor: 3, dodge: 4, damage: 1 }, { set: 'ember' }),
  gear('set_marrow_head', 'Skullcap of Grist', 'h_viking', 'head', 'epic', 3, 'The foreman’s own cap. Still has his name stitched in.', { armor: 6, maxHp: 10, vigor: 1 }, { set: 'marrow' }),
  gear('set_marrow_body', 'Titan-Rib Cuirass', 'b_scale', 'body', 'epic', 3, 'Cut from the ribcage of a dead sun.', { armor: 13, maxHp: 18, vigor: 1 }, { set: 'marrow' }),
  gear('set_marrow_hands', 'Miner’s Bonefists', 'g_mailed', 'hands', 'epic', 3, 'Knuckles reinforced with someone else’s knuckles.', { armor: 5, vigor: 2, thorns: 2 }, { set: 'marrow' }),
  gear('set_marrow_feet', 'Quarrystep Greaves', 'f_greaves', 'feet', 'epic', 3, 'Sure-footed on rubble and regret.', { armor: 5, maxHp: 10, dodge: 2 }, { set: 'marrow' }),
  gear('set_frost_head', 'Vhal’s Rimecrown', 'h_crest', 'head', 'epic', 3, 'A general’s helm, frozen to a crown.', { armor: 6, will: 2, maxSanity: 6 }, { set: 'frost' }),
  gear('set_frost_body', 'Frostwarden Plate', 'b_heavy', 'body', 'epic', 3, 'Officer’s plate. He did not object.', { armor: 14, maxHp: 16, will: 1 }, { set: 'frost' }),
  gear('set_frost_hands', 'Banner-Bearer’s Grasp', 'g_heavy', 'hands', 'epic', 3, 'Never once dropped the flag.', { armor: 5, vigor: 2, crit: 2 }, { set: 'frost' }),
  gear('set_frost_feet', 'Southward Greaves', 'f_heavy', 'feet', 'epic', 3, 'Faces south, always.', { armor: 5, maxHp: 10, dodge: 2 }, { set: 'frost' }),
  gear('set_noon_head', 'Crown of Reflected Noon', 'h_crest', 'head', 'relic', 4, 'It fits every head.', { armor: 8, will: 3, crit: 4 }, { set: 'noon' }),
  gear('set_noon_body', 'Regent’s Raiment', 'b_chest', 'body', 'relic', 4, 'Threads of the caged sun.', { armor: 20, maxHp: 25, maxSanity: 10 }, { set: 'noon' }),
  gear('set_noon_hands', 'Hands of the Twelfth', 'g_mailed', 'hands', 'relic', 4, 'They remember signing things.', { armor: 7, damage: 3, crit: 4 }, { set: 'noon' }),
  gear('set_noon_feet', 'Steps Toward Morning', 'f_medium', 'feet', 'relic', 4, 'Each step leaves a very small dawn.', { armor: 7, dodge: 6, luck: 6 }, { set: 'noon' }),

  gear('u_widow_staff', 'Tolling Staff of the Widow', 'w_staff', 'weapon', 'epic', 1, 'A bell-rope wound round a mast. It tolls once for each life it ends.', { damage: 11, will: 3, maxSanity: 8 }),
  gear('u_hart_blade', 'Antler-Blade of the Hart', 'w_curved', 'weapon', 'epic', 2, 'Grown, not forged. Warm as a living thing.', { damage: 17, crit: 9, thorns: 3 }),
  gear('u_grist_scythe', 'Grist’s Marrow Scythe', 'w_scythe', 'weapon', 'epic', 3, 'Reaps names out of walls.', { damage: 23, lifesteal: 6, vigor: 2 }),
  gear('u_vhal_blade', 'Southward Blade', 'w_relic', 'weapon', 'epic', 3, 'A general’s sword that never once pointed north.', { damage: 24, armor: 3, crit: 6 }),
  gear('u_herald_spear', 'Herald’s Sunspear', 'w_sunspear', 'weapon', 'relic', 4, 'Announces its own arrival.', { damage: 28, will: 3, crit: 8 }),
  gear('u_noonblade', 'Shard of Noon', 'w_rune', 'weapon', 'relic', 4, 'A sliver of the dead sun. It is still hot.', { damage: 32, crit: 10, maxSanity: -4 }),
  gear('u_ilse_censer', 'Blind Seer’s Lantern-Staff', 'w_mace', 'weapon', 'relic', 4, 'Smoke that sees.', { damage: 27, will: 4, maxSanity: 12, crit: 6 }),
  gear('u_moth_fang', 'Moth-Silk Rapier', 'w_blade', 'weapon', 'rare', 2, 'Thin as a lie, sharp as the truth.', { damage: 12, crit: 8, dodge: 4 }),
  gear('u_corvin_knife', 'Corvin’s Lucky Knife', 'w_dagger', 'weapon', 'rare', 1, 'Lucky for Corvin, mostly.', { damage: 6, crit: 8, luck: 10, dodge: 3 }),
  gear('u_dagna_hammer', 'Dagna’s Forgehammer', 'w_hammer', 'weapon', 'epic', 3, 'Struck the first Morning-glass lantern.', { damage: 22, maxHp: 22, armor: 2 }),
  gear('u_roe_sabre', 'Captain Roe’s Sabre', 'w_blade', 'weapon', 'rare', 0, 'The Watch’s oldest blade. Roe insisted.', { damage: 6, armor: 1, vigor: 1 }),
  gear('u_sigrun_axe', 'Sigrun’s Wolfaxe', 'w_waraxe', 'weapon', 'epic', 3, 'A daughter’s inheritance, unwelcome and well-balanced.', { damage: 21, vigor: 2, thorns: 4 }),
  gear('u_pell_lens', 'Pell’s Twelvefold Lens', 'o_orb', 'offhand', 'epic', 2, 'Through it, twelve versions of the same sky.', { will: 3, crit: 7, maxSanity: 8, luck: 8 }),
  gear('u_aegis', 'Aegis of Orra', 'o_aegis', 'offhand', 'relic', 3, 'Orra’s shield. Orra is still inside.', { armor: 10, maxHp: 26, will: 3 }),
  gear('u_ysolde_compass', 'Ysolde’s Compass', 'a_gem', 'amulet', 'rare', 1, 'Points at what you need. Not always what you want.', { luck: 12, cunning: 2, maxHp: 8 }),
  gear('u_tamsin_ring', 'Tamsin’s Oathring', 'r_signet', 'ring', 'epic', 2, 'Sworn on ash, pledged to fire.', { damage: 4, vigor: 2, maxHp: 12 }),
  gear('u_osk_bell', 'Osk’s Ringing Bell', 'a_charm', 'amulet', 'rare', 1, 'Rings when something wrong is near.', { dodge: 6, maxSanity: 8, will: 1 }),
  gear('u_maren_eyes', 'Ash-Eyes of Lamp-Keeper Maren', 'a_eyes', 'amulet', 'epic', 2, 'They see for someone else. You can change that.', { crit: 10, cunning: 3, luck: 8 }),
  gear('u_crown_fragment', 'Fragment of the Crown', 'r_signet', 'ring', 'relic', 4, 'It fits every finger. That is the problem.', { vigor: 3, will: 3, cunning: 3, maxSanity: -6 }),
  gear('u_briar', 'Briar Circlet', 'h_cowl', 'head', 'relic', 3, 'A circlet taken from a warden who did not need it.', { armor: 5, will: 4, maxSanity: 14 }),
  gear('u_clockheart', 'Clockwork Heart', 'a_heart', 'amulet', 'epic', 2, 'Ticks faster when you lie.', { maxHp: 26, vigor: 3, lifesteal: 2 }),
  gear('u_two_coin', 'Two-Headed Coin', 'a_charm', 'amulet', 'rare', 1, 'Both heads are yours.', { cunning: 3, crit: 6, luck: 10 }),
  gear('u_wolf_teeth', 'Wolf-Fang Charm', 'a_charm', 'amulet', 'common', 0, 'Warm to the touch.', { vigor: 2, maxHp: 6 }),
  gear('u_glass_eye', 'Sealed Glass Eye', 'a_eyes', 'amulet', 'common', 0, 'Sometimes looks away.', { will: 2, maxSanity: 4 }),
  gear('u_last_candle', 'The Last Candle', 'o_candle', 'offhand', 'epic', 2, 'It has burned since before you were born and will not finish.', { maxSanity: 18, will: 2, armor: 2 }),
  gear('u_dwarf_pick', 'Forgemother’s Signet', 'r_signet', 'ring', 'rare', 2, 'Mined, not made.', { vigor: 2, armor: 2, maxHp: 10 }),
  gear('u_snow_cloak', 'Sigrun’s Wolfcloak', 'b_cloak', 'body', 'epic', 3, 'Trimmed with the fur of something that ate the frost.', { armor: 11, dodge: 8, maxHp: 14 }),
];

interface ConsSpec { id: string; name: string; icon: string; rarity: Rarity; tier: number; desc: string; price: number; use: ItemUse }
const c = (id: string, name: string, icon: string, rarity: Rarity, tier: number, price: number, desc: string, use: ItemUse): ConsSpec => ({ id, name, icon, rarity, tier, desc, price, use });
const CONSUMABLES: ConsSpec[] = [
  c('tonic', 'Red Tonic', 'c_hp', 'common', 0, 25, 'Restore 18 health.', { hp: 18 }),
  c('draught', 'Stout Draught', 'c_hp2', 'common', 1, 55, 'Restore 40 health.', { hp: 40 }),
  c('restorative', 'Saltmere Restorative', 'c_hp3', 'rare', 2, 110, 'Restore 75 health.', { hp: 75 }),
  c('panacea', 'Grand Panacea', 'c_heartbottle', 'epic', 3, 220, 'Restore 60% of your maximum health.', { hpPct: 60 }),
  c('lifeblood', 'Heartblood Vial', 'c_flask', 'epic', 4, 420, 'Restore all health.', { hpPct: 100 }),
  c('tallow', 'Quiet Tallow', 'c_ball', 'common', 0, 30, 'Restore 12 sanity.', { sanity: 12 }),
  c('lullaby', 'Lullaby Resin', 'c_vial', 'common', 1, 65, 'Restore 24 sanity.', { sanity: 24 }),
  c('stillwater', 'Still-Water Flask', 'c_waterskin', 'rare', 2, 120, 'Restore 40 sanity.', { sanity: 40 }),
  c('lucid', 'Lucid Dew', 'c_flask2', 'epic', 3, 240, 'Restore 70 sanity.', { sanity: 70 }),
  c('oblivion', 'Draught of Oblivion', 'c_drink', 'epic', 4, 400, 'Restore all sanity and cleanse every ailment.', { sanity: 999, cleanse: true }),
  c('salts', 'Smelling Salts', 'c_cloth', 'common', 0, 35, 'Cleanse bleed, burn, poison and weakness.', { cleanse: true }),
  c('antidote', 'Grave Antidote', 'c_poison', 'common', 1, 60, 'Cleanse all ailments and restore 20 health.', { cleanse: true, hp: 20 }),
  c('clearwater', 'Vial of Clearwater', 'c_clearwater', 'rare', 2, 130, 'Cleanse all ailments and gain a Ward for 2 turns.', { cleanse: true, ward: 2 }),
  c('remission', 'Ashen Remission', 'c_burnbook', 'epic', 3, 320, 'Purge 1 point of corruption.', { corruption: 1 }),
  c('elixir', 'Warden’s Elixir', 'c_madness', 'epic', 2, 150, 'Restore 40 health and 25 sanity, and gain a Ward for 2 turns.', { hp: 40, sanity: 25, ward: 2 }),
  c('bandage', 'Clean Bandage', 'c_bandage', 'common', 0, 18, 'Restore 8 health and stop bleeding.', { hp: 8, cleanse: true }),
  c('bomb', 'Bone Grenade', 'c_bomb2', 'common', 0, 55, 'Deal 20 damage ignoring armor.', { damage: 20 }),
  c('pitchbomb', 'Pitch Bomb', 'c_bomb1', 'common', 1, 85, 'Deal 32 damage and set the foe Burning.', { damage: 32, burn: 3 }),
  c('molotov', 'Molotov Flask', 'c_bomb3', 'rare', 1, 70, 'Deal 18 damage and set the foe Burning for 4 turns.', { damage: 18, burn: 4 }),
  c('rimebomb', 'Rime Bomb', 'c_icebomb', 'rare', 2, 130, 'Deal 45 damage and stun the foe for 1 turn.', { damage: 45, stun: 1 }),
  c('quarrycharge', 'Quarry Charge', 'c_dynamite', 'rare', 3, 210, 'Deal 85 damage ignoring armor.', { damage: 85 }),
  c('thunderbead', 'Thunder Bead', 'c_stun', 'rare', 2, 110, 'Stun the foe for 2 turns.', { stun: 2 }),
  c('widowvenom', 'Widow’s Venom', 'c_poison', 'rare', 1, 90, 'Deal 12 damage and poison the foe for 5 turns.', { damage: 12, poison: 5 }),
  c('blightjar', 'Blight Jar', 'c_flask2', 'epic', 3, 200, 'Deal 40 damage and poison the foe for 6 turns.', { damage: 40, poison: 6 }),
  c('sunbomb', 'Sunburst Grenade', 'c_sunbomb', 'epic', 4, 380, 'Deal 140 damage and stun the foe for 1 turn.', { damage: 140, stun: 1 }),
  c('smokepellet', 'Smoke Pellet', 'c_smoke', 'common', 1, 60, 'Slip away from any non-boss fight.', { escape: true }),
  c('chart', 'Surveyor’s Chart', 'c_scroll', 'common', 1, 70, 'Reveal the whole floor of a dungeon.', { reveal: true }),
  c('folio', 'Cartographer’s Folio', 'c_scroll2', 'rare', 2, 140, 'Reveal the floor and brighten your light for 60 steps.', { reveal: true, light: 60 }),
  c('pitchtorch', 'Pitch Torch', 'c_torch', 'common', 0, 22, 'Brighter light in dungeons for 40 steps.', { light: 40 }),
  c('lampoil', 'Lantern Oil', 'c_bellows', 'common', 1, 45, 'Brighter light in dungeons for 90 steps.', { light: 90 }),
  c('suncandle', 'Sun-Candle', 'c_torch', 'epic', 3, 180, 'Sunlit sight in dungeons for 200 steps.', { light: 200 }),
  c('hardtack', 'Hardtack', 'c_breadslice', 'common', 0, 12, 'Gain 1 supply.', { supplies: 1 }),
  c('smokedfish', 'Smoked Wick-Fish', 'c_fish', 'common', 0, 22, 'Gain 2 supplies.', { supplies: 2 }),
  c('stew', 'Traveler’s Stew', 'c_pot', 'common', 1, 42, 'Gain 3 supplies and restore 12 health.', { supplies: 3, hp: 12 }),
  c('cratesupply', 'Ration Crate', 'c_bread', 'rare', 2, 90, 'Gain 6 supplies.', { supplies: 6 }),
  c('vellum', 'Vellum of Insight', 'c_letter', 'rare', 1, 120, 'Gain 120 experience.', { xp: 120 }),
  c('recollection', 'Regent’s Recollection', 'c_blackbook', 'epic', 3, 360, 'Gain 900 experience.', { xp: 900 }),
  c('cheese', 'Wax-Sealed Cheese', 'c_cheese', 'common', 0, 16, 'Gain 1 supply and restore 4 sanity.', { supplies: 1, sanity: 4 }),
  c('boneroth', 'Bone Broth', 'c_meat', 'common', 1, 30, 'Restore 22 health and gain 1 supply.', { hp: 22, supplies: 1 }),
  c('bloodwine', 'Bloodwine', 'c_drink', 'rare', 2, 95, 'Restore 30 health and 20 sanity. Bleeds you for 2 turns.', { hp: 30, sanity: 20, bleed: 2 }),
  c('nightshade', 'Nightshade Tincture', 'c_flask', 'rare', 2, 100, 'Deal 24 damage and poison the foe for 4 turns. Costs nothing but your conscience.', { damage: 24, poison: 4 }),
  c('frostwater', 'Frost-Water Phial', 'c_vial', 'rare', 3, 150, 'Deal 30 damage, stun 1 turn.', { damage: 30, stun: 1 }),
  c('emberwick', 'Ember Wick', 'c_bomb3', 'rare', 2, 90, 'Deal 26 damage and set the foe Burning for 3 turns.', { damage: 26, burn: 3 }),
];

interface JunkSpec { id: string; name: string; icon: string; tier: number; price: number; desc: string }
const j = (id: string, name: string, icon: string, tier: number, price: number, desc: string): JunkSpec => ({ id, name, icon, tier, price, desc });
const JUNK: JunkSpec[] = [
  j('j_dice', 'Bone Dice', 'j_bone', 0, 14, 'Loaded. Everyone knew.'), j('j_tooth', 'Silver Tooth', 'j_tooth', 0, 20, 'Somebody paid dearly for a smile.'),
  j('j_button', 'Widow’s Button', 'j_shine', 0, 16, 'Pearl-inlaid, engraved with a bell.'), j('j_coin', 'Drowned Coin', 'j_crowncoin', 0, 24, 'Salt-crusted, green with age.'),
  j('j_fishbone', 'Carved Fishbone', 'j_fishbone', 0, 12, 'A tiny map cut into the spine.'), j('j_feather', 'Raven Feather', 'j_feather', 0, 10, 'Black, with one white barb.'),
  j('j_pearls', 'Salt Pearls', 'j_pearls', 1, 48, 'Harvested from something that hated it.'), j('j_jaw', 'Hound Jawbone', 'j_jawbone', 1, 40, 'Still has all its opinions.'),
  j('j_nugget', 'Gold Nugget', 'j_nuggets', 1, 70, 'Honest weight, dishonest origin.'), j('j_web', 'Silk-Wrapped Bundle', 'j_cobweb', 1, 44, 'Do not unwrap it.'),
  j('j_ember', 'Ember Glass', 'j_embers', 2, 90, 'Glass fused from burning forest.'), j('j_cluster', 'Crystal Cluster', 'j_crystals', 2, 120, 'Hums faintly at dusk.'),
  j('j_bell', 'Cracked Handbell', 'j_bell', 2, 100, 'Rings a note that should not exist.'), j('j_eggs', 'Amber Egg Clutch', 'j_eggs', 2, 110, 'Best not to hatch them.'),
  j('j_goblet', 'Jeweled Goblet', 'j_goblet', 3, 240, 'Fit for a duke or a thief.'), j('j_pelvis', 'Titan Bone Shard', 'j_pelvis', 3, 200, 'Enormous, ancient, humming.'),
  j('j_horn', 'Frostbitten War-Horn', 'j_horn', 3, 210, 'Sounded once. The echo is still going.'), j('j_gold', 'Ingot of Old Gold', 'j_bar', 3, 260, 'Stamped with a face you almost recognise.'),
  j('j_firegem', 'Fire Opal', 'j_firegem', 3, 250, 'Warm as blood.'), j('j_mask', 'Masquerade Mask', 'j_mask', 2, 130, 'The eyeholes are too far apart.'),
  j('j_starskull', 'Star-Skull', 'j_starskull', 4, 420, 'A skull with a night sky inside.'), j('j_hourglass', 'Empty Hourglass', 'j_hourglass', 4, 380, 'Its sand has gone elsewhere.'),
  j('j_imperial', 'Imperial Circlet', 'j_imperial', 4, 520, 'A king’s crown. Not the King’s, one hopes.'), j('j_sunfeather', 'Sunbird Feather', 'j_sunfeather', 4, 460, 'Too heavy to be a feather.'),
  j('j_marker', 'Bone Marker', 'j_marker', 1, 52, 'Watches whichever way you are not.'), j('j_thorns', 'Briar Circlet', 'j_thorns', 3, 230, 'Someone wore this on purpose.'),
];

const tokens: ItemDef[] = [
  { id: 'tok_widow', name: 'Widow’s Wedding Ring', icon: 'r_ring', slot: 'junk', rarity: 'relic', tier: 1, desc: 'Keepsake of the Bell-Widow. Offer it at her grave to grant her mercy.', price: 0, bonus: {}, unique: true },
  { id: 'tok_hart', name: 'Hartwyn’s Antler Locket', icon: 'a_heart', slot: 'junk', rarity: 'relic', tier: 2, desc: 'Keepsake of the Cinder Hart. Offer it at his grave to grant him mercy.', price: 0, bonus: {}, unique: true },
  { id: 'tok_grist', name: 'Grist’s Lamp of Names', icon: 'o_lantern', slot: 'junk', rarity: 'relic', tier: 3, desc: 'Keepsake of Foreman Grist. Offer it at his grave to grant him mercy.', price: 0, bonus: {}, unique: true },
  { id: 'tok_vhal', name: 'Vhal’s Sunward Banner', icon: 'j_horn', slot: 'junk', rarity: 'relic', tier: 3, desc: 'Keepsake of General Vhal. Offer it at his grave to grant him mercy.', price: 0, bonus: {}, unique: true },
  { id: 'tok_key', name: 'Seal-Key of Veyrgard', icon: 'skeleton_key', slot: 'junk', rarity: 'relic', tier: 0, desc: 'Ilse’s gift. It is warm. Sometimes it blinks.', price: 0, bonus: {}, unique: true },
  { id: 'tok_letter', name: 'Letter in Your Own Hand', icon: 'c_letter', slot: 'junk', rarity: 'epic', tier: 1, desc: '“Do not trust Ilse. Do not sit the throne. — You.”', price: 0, bonus: {}, unique: true },
  { id: 'tok_glass', name: 'Shard of Morning-Glass', icon: 'j_shine', slot: 'junk', rarity: 'epic', tier: 3, desc: 'A sliver of the caged Morning’s light. It flinches when you touch it.', price: 0, bonus: {}, unique: true },
  { id: 'tok_banner', name: 'Frayed Regimental Standard', icon: 'j_horn', slot: 'junk', rarity: 'rare', tier: 3, desc: 'Proof that the southward army was real. Sigrun will want to see it.', price: 0, bonus: {}, unique: true },
];

const consumables: ItemDef[] = CONSUMABLES.map(x => ({ id: x.id, name: x.name, icon: x.icon, slot: 'consumable', rarity: x.rarity, tier: x.tier, desc: x.desc, price: x.price, bonus: {}, use: x.use }));
const junk: ItemDef[] = JUNK.map(x => ({ id: x.id, name: x.name, icon: x.icon, slot: 'junk', rarity: x.tier >= 4 ? 'epic' : x.tier >= 2 ? 'rare' : 'common', tier: x.tier, desc: x.desc, price: x.price, bonus: {} }));

export const ITEMS: ItemDef[] = [...generated, ...uniques, ...consumables, ...junk, ...tokens];
export const ITEM_MAP = new Map(ITEMS.map(i => [i.id, i]));
export const ITEM_COUNT = ITEMS.length;
export { slug };
