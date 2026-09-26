import type { ChapterDef, EnemyDef, ItemDef, QuestDef, Region, SkillDef, StoryEvent, TalentDef } from './types';

export const REGIONS: Region[] = [
  { id: 'catacombs', name: 'The Drowned Catacombs', subtitle: 'Where the dead refuse the tide', description: 'Flooded crypts beneath Veyr. The bells ring under water, and every ring is a name.', art: 'r_catacombs.webp', pos: [48, 68], danger: 1, depth: 7, enemies: ['pilgrim', 'eel', 'acolyte'], elite: 'ringer', boss: 'widow' },
  { id: 'ashwood', name: 'Ashwood Expanse', subtitle: 'A forest that remembers fire', description: 'Black trees bleed embers. Lanterns lead travelers in circles until they become lanterns too.', art: 'r_ashwood.webp', pos: [66, 51], danger: 2, depth: 8, enemies: ['hound', 'lanternkin', 'charcoal'], elite: 'huntsman', boss: 'hart' },
  { id: 'quarry', name: 'Ossuary Quarry', subtitle: 'The old world had larger bones', description: 'Miners carved a city through the skeletons of forgotten gods, then carved each other.', art: 'r_quarry.webp', pos: [29, 45], danger: 3, depth: 8, enemies: ['prospector', 'marrow', 'dustwife'], elite: 'overseer', boss: 'grist' },
  { id: 'pass', name: 'The Weeping Pass', subtitle: 'Every frozen corpse faces south', description: 'A lost army waits beneath the snow for one final command. Some of them hear it early.', art: 'r_pass.webp', pos: [51, 20], danger: 4, depth: 9, enemies: ['deserter', 'rime', 'standard'], elite: 'colonel', boss: 'vhal' },
  { id: 'meridian', name: 'The Black Meridian', subtitle: 'The wound at the end of the world', description: 'Here the sky opens and every possible ending screams at once.', art: 'intro2.webp', pos: [49, 88], danger: 5, depth: 6, enemies: ['echo', 'noonchild', 'penitent'], elite: 'herald', boss: 'king' },
];

const e = (d: EnemyDef) => d;
export const ENEMIES: EnemyDef[] = [
  e({ id: 'pilgrim', name: 'Drowned Pilgrim', icon: '♙', hp: 20, damage: [3, 6], armor: 0, dread: 1, moves: ['attack', 'attack', 'dread'], lore: 'They walked into the flood to be closer to the bell.' }),
  e({ id: 'eel', name: 'Crypt Eel', icon: '§', hp: 16, damage: [3, 7], armor: 0, dread: 0, moves: ['attack', 'afflict', 'attack'], afflict: 'bleed', lore: 'Fat on grave-water. Its bite does not close.' }),
  e({ id: 'acolyte', name: 'Tide Acolyte', icon: '☥', hp: 18, damage: [2, 5], armor: 1, dread: 2, moves: ['dread', 'attack', 'guard'], lore: 'Sings hymns backwards to wake what sleeps below.' }),
  e({ id: 'ringer', name: 'The Bell-Ringer', icon: '♫', hp: 34, damage: [4, 8], armor: 1, dread: 3, moves: ['attack', 'dread', 'heavy'], lore: 'Deaf for three centuries. Still rings on time.' }),
  e({ id: 'widow', name: 'The Bell-Widow', icon: '♛', art: 'boss_catacombs.webp', hp: 60, damage: [5, 9], armor: 1, dread: 4, moves: ['attack', 'dread', 'heavy', 'afflict'], afflict: 'weak', lore: 'She married the bell to save the city. It kept her.' }),
  e({ id: 'hound', name: 'Ash Hound', icon: '♞', hp: 24, damage: [4, 8], armor: 0, dread: 1, moves: ['attack', 'attack', 'afflict'], afflict: 'bleed', lore: 'Hunts by the smell of fear. You smell delicious.' }),
  e({ id: 'lanternkin', name: 'Lanternkin', icon: '☼', hp: 20, damage: [3, 6], armor: 1, dread: 3, moves: ['afflict', 'dread', 'attack'], afflict: 'burn', lore: 'A lost traveler, now a lamp for the next one.' }),
  e({ id: 'charcoal', name: 'Charcoal Saint', icon: '✝', hp: 28, damage: [4, 7], armor: 2, dread: 1, moves: ['guard', 'attack', 'heavy'], lore: 'Martyred by fire. Refuses to finish burning.' }),
  e({ id: 'huntsman', name: 'The Ember Huntsman', icon: '➶', hp: 44, damage: [5, 10], armor: 2, dread: 2, moves: ['afflict', 'attack', 'heavy'], afflict: 'burn', lore: 'Hunts the Hart. Has not noticed it hunts him.' }),
  e({ id: 'hart', name: 'The Cinder Hart', icon: '♛', art: 'boss_ashwood.webp', hp: 82, damage: [6, 11], armor: 2, dread: 4, moves: ['attack', 'afflict', 'heavy', 'guard'], afflict: 'burn', lore: 'Wherever it walks, the forest remembers being alive.' }),
  e({ id: 'prospector', name: 'Bone Prospector', icon: '☠', hp: 30, damage: [5, 9], armor: 2, dread: 1, moves: ['attack', 'heavy', 'attack'], lore: 'Still searching for the marrow-gold. Will settle for yours.' }),
  e({ id: 'marrow', name: 'Marrow Crawler', icon: '⋔', hp: 26, damage: [4, 8], armor: 1, dread: 2, moves: ['afflict', 'attack', 'attack'], afflict: 'weak', lore: 'Lives inside god-bones. Would like to live inside yours.' }),
  e({ id: 'dustwife', name: 'Dust Wife', icon: '♀', hp: 24, damage: [3, 7], armor: 1, dread: 4, moves: ['dread', 'dread', 'attack'], lore: 'Sweeps the quarry floors of every trace of her husband.' }),
  e({ id: 'overseer', name: 'The Overseer', icon: '⚒', hp: 52, damage: [6, 11], armor: 3, dread: 2, moves: ['guard', 'heavy', 'attack'], lore: 'Counts the dead workers. The number is always one short.' }),
  e({ id: 'grist', name: 'Foreman Grist', icon: '♛', art: 'boss_quarry.webp', hp: 104, damage: [7, 13], armor: 3, dread: 3, moves: ['attack', 'heavy', 'guard', 'afflict'], afflict: 'bleed', lore: 'He promised the miners they would be remembered. He built them into the walls.' }),
  e({ id: 'deserter', name: 'Frozen Deserter', icon: '♜', hp: 34, damage: [6, 10], armor: 2, dread: 2, moves: ['attack', 'attack', 'heavy'], lore: 'He turned north. He was the only one who saw it.' }),
  e({ id: 'rime', name: 'Rime Wraith', icon: '❄', hp: 28, damage: [5, 9], armor: 1, dread: 4, moves: ['dread', 'afflict', 'attack'], afflict: 'weak', lore: 'The last breath of a soldier, still looking for a mouth.' }),
  e({ id: 'standard', name: 'Standard-Bearer', icon: '⚑', hp: 38, damage: [5, 10], armor: 3, dread: 2, moves: ['guard', 'attack', 'heavy'], lore: 'The banner is stitched from the skin of cowards.' }),
  e({ id: 'colonel', name: 'Colonel Ashgrave', icon: '♚', hp: 64, damage: [7, 12], armor: 3, dread: 3, moves: ['heavy', 'afflict', 'attack', 'guard'], afflict: 'bleed', lore: 'Vhal’s right hand. The left hand is somewhere in the snow.' }),
  e({ id: 'vhal', name: 'General Vhal', icon: '♛', art: 'boss_pass.webp', hp: 126, damage: [8, 14], armor: 4, dread: 4, moves: ['attack', 'heavy', 'dread', 'guard', 'afflict'], afflict: 'weak', lore: 'He faced south so the thing in the north would believe they were unafraid.' }),
  e({ id: 'echo', name: 'Meridian Echo', icon: '◐', hp: 38, damage: [7, 11], armor: 2, dread: 5, moves: ['dread', 'attack', 'heavy'], lore: 'You from another ending. It lost.' }),
  e({ id: 'noonchild', name: 'Noonchild', icon: '☉', hp: 34, damage: [6, 12], armor: 2, dread: 4, moves: ['afflict', 'attack', 'dread'], afflict: 'burn', lore: 'Born in the nine-day noon. Has never seen night.' }),
  e({ id: 'penitent', name: 'Hollow Penitent', icon: '†', hp: 44, damage: [7, 12], armor: 4, dread: 3, moves: ['guard', 'heavy', 'attack'], lore: 'Confesses sins it did not commit, and then commits them.' }),
  e({ id: 'herald', name: 'Herald of Noon', icon: '✺', hp: 74, damage: [8, 13], armor: 4, dread: 5, moves: ['dread', 'heavy', 'afflict', 'attack'], afflict: 'burn', lore: 'Announces the King. The announcement never ends.' }),
  e({ id: 'king', name: 'The King Behind Noon', icon: '♛', art: 'boss_meridian.webp', hp: 170, damage: [9, 16], armor: 5, dread: 6, moves: ['dread', 'heavy', 'afflict', 'attack', 'guard', 'heavy'], afflict: 'weak', lore: 'He wears the face of whoever reaches him.' }),
];

const i = (d: ItemDef) => d;
export const ITEMS: ItemDef[] = [
  i({ id: 'rustblade', name: 'Notched Sabre', icon: '⚔', slot: 'weapon', rarity: 'common', tier: 0, desc: 'Reliable steel.', price: 40, bonus: { damage: 2 } }),
  i({ id: 'cleaver', name: 'Butcher’s Cleaver', icon: '🗡', slot: 'weapon', rarity: 'common', tier: 1, desc: 'Heavy and honest.', price: 90, bonus: { damage: 4, vigor: 1 } }),
  i({ id: 'pistol', name: 'Grave-Iron Pistol', icon: '⌁', slot: 'weapon', rarity: 'rare', tier: 1, desc: 'Built from coffin nails.', price: 150, bonus: { damage: 5, crit: 6 } }),
  i({ id: 'censer', name: 'Heretic Censer', icon: '♨', slot: 'weapon', rarity: 'rare', tier: 2, desc: 'Swings smoke that remembers screams.', price: 240, bonus: { damage: 5, will: 2 } }),
  i({ id: 'glaive', name: 'Warden Glaive', icon: '⚚', slot: 'weapon', rarity: 'epic', tier: 3, desc: 'Carried by the last honest guard.', price: 420, bonus: { damage: 8, vigor: 2, crit: 4 } }),
  i({ id: 'noonblade', name: 'Shard of Noon', icon: '✧', slot: 'weapon', rarity: 'relic', tier: 4, desc: 'A sliver of the dead sun. It is still hot.', price: 800, bonus: { damage: 12, crit: 10, maxSanity: -4 } }),
  i({ id: 'buckler', name: 'Dented Buckler', icon: '◍', slot: 'offhand', rarity: 'common', tier: 0, desc: 'Has stopped worse than you.', price: 50, bonus: { armor: 1, maxHp: 4 } }),
  i({ id: 'lantern', name: 'Pilgrim Lantern', icon: '☀', slot: 'offhand', rarity: 'rare', tier: 1, desc: 'Keeps the whispering at arm’s length.', price: 140, bonus: { maxSanity: 6, will: 1 } }),
  i({ id: 'grimoire', name: 'Unbound Grimoire', icon: '▤', slot: 'offhand', rarity: 'epic', tier: 2, desc: 'Pages flip toward whatever you fear.', price: 360, bonus: { will: 3, crit: 5, maxSanity: 4 } }),
  i({ id: 'aegis', name: 'Aegis of Saint Orra', icon: '⛨', slot: 'offhand', rarity: 'relic', tier: 3, desc: 'The saint’s shield. The saint is still inside.', price: 700, bonus: { armor: 3, maxHp: 14, will: 2 } }),
  i({ id: 'coat', name: 'Watchman Coat', icon: '♜', slot: 'armor', rarity: 'common', tier: 0, desc: 'Blood stiffens its seams.', price: 80, bonus: { armor: 2 } }),
  i({ id: 'leathers', name: 'Smuggler Leathers', icon: '⌇', slot: 'armor', rarity: 'rare', tier: 1, desc: 'Many pockets. Some of them lead elsewhere.', price: 170, bonus: { armor: 2, cunning: 2 } }),
  i({ id: 'mail', name: 'Saintbone Mail', icon: '♙', slot: 'armor', rarity: 'rare', tier: 2, desc: 'Small prayers carved in ivory.', price: 260, bonus: { armor: 4, maxHp: 6 } }),
  i({ id: 'plate', name: 'Frostbitten Plate', icon: '⛊', slot: 'armor', rarity: 'epic', tier: 3, desc: 'Taken from one of Vhal’s officers. He did not object.', price: 480, bonus: { armor: 6, vigor: 2, maxHp: 10 } }),
  i({ id: 'eye', name: 'Sealed Glass Eye', icon: '◉', slot: 'trinket', rarity: 'common', tier: 0, desc: 'Sometimes looks away.', price: 95, bonus: { will: 2 } }),
  i({ id: 'teeth', name: 'Wolf-Saint Teeth', icon: '⋈', slot: 'trinket', rarity: 'common', tier: 0, desc: 'Warm to the touch.', price: 95, bonus: { vigor: 2 } }),
  i({ id: 'coin', name: 'Two-Headed Coin', icon: '◎', slot: 'trinket', rarity: 'rare', tier: 1, desc: 'Both heads are yours.', price: 180, bonus: { cunning: 3, crit: 5 } }),
  i({ id: 'heart', name: 'Clockwork Heart', icon: '♥', slot: 'trinket', rarity: 'epic', tier: 2, desc: 'Ticks faster when you lie.', price: 380, bonus: { maxHp: 12, vigor: 2 } }),
  i({ id: 'crown', name: 'Fragment of the Crown', icon: '♔', slot: 'trinket', rarity: 'relic', tier: 4, desc: 'It fits every head. That is the problem.', price: 900, bonus: { vigor: 3, will: 3, cunning: 3, maxSanity: -6 } }),
  i({ id: 'tonic', name: 'Red Tonic', icon: '⚗', slot: 'consumable', rarity: 'common', tier: 0, desc: 'Restore 16 health.', price: 25, bonus: {}, use: { hp: 16 } }),
  i({ id: 'incense', name: 'Quiet Incense', icon: '☁', slot: 'consumable', rarity: 'common', tier: 0, desc: 'Restore 12 sanity.', price: 30, bonus: {}, use: { sanity: 12 } }),
  i({ id: 'salts', name: 'Smelling Salts', icon: '✚', slot: 'consumable', rarity: 'common', tier: 0, desc: 'Cleanse bleed, burn and weakness.', price: 35, bonus: {}, use: { cleanse: true } }),
  i({ id: 'bomb', name: 'Bone Grenade', icon: '✹', slot: 'consumable', rarity: 'rare', tier: 1, desc: 'Deal 18 damage, ignoring armor.', price: 55, bonus: {}, use: { damage: 18 } }),
  i({ id: 'elixir', name: 'Saint’s Elixir', icon: '⚱', slot: 'consumable', rarity: 'epic', tier: 2, desc: 'Restore 30 health and 20 sanity, and gain a ward.', price: 140, bonus: {}, use: { hp: 30, sanity: 20, ward: 2 } }),
];

export const SKILLS: SkillDef[] = [
  { id: 'sever', name: 'Sever', icon: '⚔', school: 'Steel', desc: '160% damage and inflicts Bleed for 2 turns.', price: 0, cooldown: 2, sanityCost: 0, mult: 1.6, effect: { status: 'bleed', turns: 2, target: 'enemy' } },
  { id: 'riposte', name: 'Riposte', icon: '⟲', school: 'Steel', desc: '110% damage and gain a Ward for 1 turn.', price: 0, cooldown: 3, sanityCost: 0, mult: 1.1, effect: { status: 'ward', turns: 1, target: 'self' } },
  { id: 'cinder', name: 'Cinder Hex', icon: '♨', school: 'Occult', desc: '130% damage and sets the enemy Burning for 3 turns.', price: 0, cooldown: 3, sanityCost: 1, mult: 1.3, effect: { status: 'burn', turns: 3, target: 'enemy' } },
  { id: 'mend', name: 'Blood Mend', icon: '♥', school: 'Sanguine', desc: 'Trade 2 sanity to restore 14 health.', price: 0, cooldown: 4, sanityCost: 2, mult: 0, effect: { heal: 14 } },
  { id: 'still', name: 'Still Mind', icon: '◉', school: 'Discipline', desc: 'Restore 9 sanity and cleanse Weakness.', price: 90, cooldown: 4, sanityCost: 0, mult: 0, effect: { sanity: 9 } },
  { id: 'shatter', name: 'Skull Shatter', icon: '✊', school: 'Steel', desc: '90% damage and Stuns the enemy for 1 turn.', price: 140, cooldown: 5, sanityCost: 0, mult: 0.9, effect: { status: 'stun', turns: 1, target: 'enemy' } },
  { id: 'mark', name: 'Hunter’s Mark', icon: '⌖', school: 'Shadow', desc: 'Mark the enemy: it takes 30% more damage for 3 turns.', price: 120, cooldown: 5, sanityCost: 0, mult: 0.5, effect: { status: 'marked', turns: 3, target: 'enemy' } },
  { id: 'leech', name: 'Leech Rite', icon: '☾', school: 'Sanguine', desc: '120% damage and heal for half of it.', price: 180, cooldown: 4, sanityCost: 2, mult: 1.2, effect: { leech: 0.5 } },
  { id: 'hymn', name: 'Ashen Hymn', icon: '♪', school: 'Discipline', desc: 'Cleanse yourself and gain a Ward for 2 turns.', price: 160, cooldown: 5, sanityCost: 0, mult: 0, effect: { status: 'ward', turns: 2, target: 'self' } },
  { id: 'void', name: 'Void Lance', icon: '✦', school: 'Astral', desc: '220% damage that ignores armor. Costs 4 sanity.', price: 260, cooldown: 4, sanityCost: 4, mult: 2.2, effect: { pierce: true } },
];

export const TALENTS: TalentDef[] = [
  { id: 'brawn', name: 'Iron Sinew', icon: '♜', tree: 'Steel', tier: 1, desc: '+10 max health.', bonus: { maxHp: 10 } },
  { id: 'edge', name: 'Honed Edge', icon: '⚔', tree: 'Steel', tier: 2, desc: '+2 weapon damage.', bonus: { damage: 2 } },
  { id: 'executioner', name: 'Executioner', icon: '☠', tree: 'Steel', tier: 3, desc: '+50% damage against enemies below 30% health.' },
  { id: 'lucid', name: 'Lucid Dreamer', icon: '◉', tree: 'Occult', tier: 1, desc: '+8 max sanity.', bonus: { maxSanity: 8 } },
  { id: 'ironwill', name: 'Iron Will', icon: '⛨', tree: 'Occult', tier: 2, desc: 'Take 1 less sanity damage from every source.' },
  { id: 'abyss', name: 'Abyssal Pact', icon: '✦', tree: 'Occult', tier: 3, desc: 'Below 30% sanity, deal 35% more damage.' },
  { id: 'keen', name: 'Keen Eye', icon: '⌖', tree: 'Shadow', tier: 1, desc: '+8% critical chance.', bonus: { crit: 8 } },
  { id: 'scavenger', name: 'Scavenger', icon: '◈', tree: 'Shadow', tier: 2, desc: '+40% gold and better loot chance.' },
  { id: 'bloodthirst', name: 'Bloodthirst', icon: '♥', tree: 'Shadow', tier: 3, desc: 'Heal 6 health and 2 sanity after every victory.' },
];

export const EVENTS: StoryEvent[] = [
  { id: 'well', region: 'catacombs', title: 'The Well That Knows You', icon: '◉', text: 'At a junction drowned ankle-deep, a stone well whispers your childhood name. A silver coin spins on its black surface without sinking.', choices: [
    { label: 'Take the coin', text: 'Reach into the water.', effect: 'gold' },
    { label: 'Answer the voice', text: 'Tell it who you have become.', effect: 'will', requires: 'will' },
    { label: 'Seal the well', text: 'Spend a supply and leave it silent.', effect: 'seal', cost: { supplies: 1 } }] },
  { id: 'choir', region: 'catacombs', title: 'The Choir Under the Water', icon: '♫', text: 'Beneath the surface, drowned choristers sing with their mouths open. The hymn is beautiful. It is also a map.', choices: [
    { label: 'Dive and follow the song', text: 'Hold your breath and trust.', effect: 'vigorLoot', requires: 'vigor' },
    { label: 'Memorize the melody', text: 'Some songs are lore.', effect: 'lore' },
    { label: 'Walk on', text: 'Beauty drowns people.', effect: 'leave' }] },
  { id: 'pilgrim', title: 'A Pilgrim of Wax', icon: '♙', text: 'A kneeling figure blocks the path. Every inch of it is candle wax, but a living eye turns within its melting face. “Carry my flame,” it begs.', choices: [
    { label: 'Accept the flame', text: 'Power has a price. (+Corruption)', effect: 'corrupt' },
    { label: 'Extinguish it', text: 'End this strange mercy.', effect: 'fight' },
    { label: 'Share your food', text: 'Kindness in a dying world.', effect: 'kind', cost: { supplies: 1 } }] },
  { id: 'door', title: 'The Red Door', icon: '▣', text: 'A crimson door stands alone in a ruined wall. Behind it, someone hums the lullaby sung at every funeral in Veyr.', choices: [
    { label: 'Open it', text: 'There are truths behind every door.', effect: 'lore' },
    { label: 'Listen closely', text: 'Use cunning to learn safely.', effect: 'cunning', requires: 'cunning' },
    { label: 'Mark it and leave', text: 'Some doors are warnings.', effect: 'leave' }] },
  { id: 'mirror', title: 'A Mirror Full of Teeth', icon: '◇', text: 'Your reflection is a heartbeat late. It smiles when you do not. Behind its teeth, a tiny version of the city burns.', choices: [
    { label: 'Break the mirror', text: 'Suffer no impostor.', effect: 'hurt' },
    { label: 'Trade reflections', text: 'Become harder to kill, and less yourself.', effect: 'trade' },
    { label: 'Look away', text: 'Keep what remains of yourself.', effect: 'leave' }] },
  { id: 'merchant', title: 'The Merchant of Last Things', icon: '⚖', text: 'A man with no shadow sells from a coffin-cart. “Everything here was someone’s final possession. Very fair prices.”', choices: [
    { label: 'Buy a mystery (40 gold)', text: 'You will not know until it is yours.', effect: 'buyMystery', cost: { gold: 40 } },
    { label: 'Rob him', text: 'Cunning, or a fight.', effect: 'rob', requires: 'cunning' },
    { label: 'Decline politely', text: 'He bows until his neck cracks.', effect: 'leave' }] },
  { id: 'lanterns', region: 'ashwood', title: 'Lanterns in the Ash', icon: '☼', text: 'Three lanterns sway in the smoke, each offering a path. One of them is holding a hand.', choices: [
    { label: 'Follow the left lantern', text: 'Trust your instincts.', effect: 'gamble' },
    { label: 'Snuff them all', text: 'Test your will against their pull.', effect: 'will', requires: 'will' },
    { label: 'Take the hand', text: 'Someone needs you. (Fight)', effect: 'fight' }] },
  { id: 'altar', title: 'An Altar of Hungry Stone', icon: '▲', text: 'An altar asks for blood in a language you learned in nightmares. It promises strength in exchange.', choices: [
    { label: 'Offer blood (8 health)', text: 'Gain permanent Vigor.', effect: 'bloodVigor', cost: { hp: 8 } },
    { label: 'Offer memory', text: 'Lose sanity, gain lore.', effect: 'memoryLore' },
    { label: 'Desecrate it', text: 'Strength against stone.', effect: 'vigorLoot', requires: 'vigor' }] },
  { id: 'soldier', region: 'pass', title: 'A Soldier Who Still Salutes', icon: '⚑', text: 'A frozen soldier holds out a sealed letter. His eyes follow you. The letter is addressed to you, in your own handwriting.', choices: [
    { label: 'Read the letter', text: 'Lore at the cost of sanity.', effect: 'memoryLore' },
    { label: 'Return the salute', text: 'Honor the dead. (Will)', effect: 'will', requires: 'will' },
    { label: 'Take his rations', text: 'He will not need them.', effect: 'supplies' }] },
  { id: 'cage', region: 'quarry', title: 'The Singing Cage', icon: '▦', text: 'A bone cage hangs over the pit. Inside, a child-shaped thing sings a miner’s work song and begs you to open it.', choices: [
    { label: 'Open the cage', text: 'Mercy, whatever it costs.', effect: 'gamble' },
    { label: 'Pick the lock of its jaw', text: 'Cunning reveals what it hides.', effect: 'cunning', requires: 'cunning' },
    { label: 'Cut the rope', text: 'Let the pit decide.', effect: 'corrupt' }] },
];

export const LORE: [string, string][] = [
  ['The First Noon', 'Before the Meridian, noon lasted nine days. Crops turned white and men cast three shadows. The church called it a miracle until the shadows began speaking.'],
  ['The Bell Beneath', 'Veyr’s oldest bell was cast before the city. It rings only under water, tolling once for each citizen who will die before dawn.'],
  ['Saint Orra’s Heresy', 'Orra proved the gods could feel pain. The gods proved that saints could be erased. Both demonstrations were thorough.'],
  ['The Bone Titans', 'The continent rests upon creatures too large to have lived. Scholars disagree whether the bones are fossils or architecture.'],
  ['Letters from the Pass', 'General Vhal ordered his army to face south. “Whatever follows us from the north must believe we are unafraid.” They froze in formation.'],
  ['A Map of Other Veyrs', 'The astronomer Pell found twelve versions of the city in the night sky. In eleven, the walls had already fallen.'],
  ['The Ash Covenant', 'The foresters of Ashwood swore to keep the fire alive after the sun died. They kept their oath. The forest did not consent.'],
  ['On Wardens', 'Each seal needed a keeper willing to never die. The church found four volunteers. It never asked what they would become.'],
  ['The Blind Priestess', 'Mother Ilse tore out her eyes the day the sun went black, so she would never have to watch it again. She sees the seals instead.'],
  ['The Crown Behind Noon', 'There is a throne behind the eclipse. Whoever sits in it decides what morning means. It has been empty for a very long time.'],
];

export const CHAPTERS: ChapterDef[] = [
  { id: 'c1', title: 'I · The Drowned Bell', text: 'Mother Ilse hears the first seal cracking beneath the city. The Bell-Widow tolls for all of Veyr.', objective: 'Descend into the Drowned Catacombs and silence the Bell-Widow.', boss: 'widow', reward: { gold: 80, xp: 60, item: 'lantern' } },
  { id: 'c2', title: 'II · A Forest That Remembers', text: 'With the bell silent, smoke rises in the east. The Cinder Hart walks, and the second seal burns.', objective: 'Hunt the Cinder Hart in Ashwood Expanse.', boss: 'hart', reward: { gold: 120, xp: 90, item: 'leathers' } },
  { id: 'c3', title: 'III · Marrow and Stone', text: 'Something digs beneath the continent. Foreman Grist has breached the third seal from below.', objective: 'Bring down Foreman Grist in the Ossuary Quarry.', boss: 'grist', reward: { gold: 170, xp: 130, item: 'grimoire' } },
  { id: 'c4', title: 'IV · The Southward Army', text: 'The frozen army has begun to turn north. General Vhal must be relieved of command.', objective: 'Defeat General Vhal at the Weeping Pass.', boss: 'vhal', reward: { gold: 240, xp: 180, item: 'plate' } },
  { id: 'c5', title: 'V · Behind Noon', text: 'All four wardens have fallen. The Black Meridian opens, and something on the throne is waiting for your face.', objective: 'Enter the Black Meridian and confront the King Behind Noon.', boss: 'king', reward: { gold: 0, xp: 0 } },
];

export const QUESTS: QuestDef[] = [
  { id: 'q_rats', title: 'Clear the Undercroft', giver: 'Warden Hollis', text: 'Drowned things crawl up the drains at night. Put down five of them.', goal: { type: 'kill', region: 'catacombs', count: 5 }, reward: { gold: 60, xp: 40, item: 'tonic' } },
  { id: 'q_lore', title: 'Ink That Moves', giver: 'Archivist Pell', text: 'Recover three lost fragments of lore for the Collegium.', goal: { type: 'lore', count: 3 }, reward: { gold: 90, xp: 60, item: 'eye' } },
  { id: 'q_elite', title: 'Bounty: Named Horrors', giver: 'The Carrion Exchange', text: 'Named horrors fetch fine prices. Slay two elite foes anywhere.', goal: { type: 'elite', count: 2 }, reward: { gold: 150, xp: 90, item: 'bomb' } },
  { id: 'q_ash', title: 'Embers for the Chapel', giver: 'Sister Maren', text: 'The chapel needs fire that does not die. Slay six creatures of Ashwood.', goal: { type: 'kill', region: 'ashwood', count: 6 }, reward: { gold: 130, xp: 80, item: 'salts' } },
  { id: 'q_roads', title: 'Mapping the Roads', giver: 'Cartographer Venn', text: 'Survive six strange encounters in the Dreadmarch and report back.', goal: { type: 'events', count: 6 }, reward: { gold: 110, xp: 70, item: 'coin' } },
  { id: 'q_bones', title: 'The Marrow Price', giver: 'Old Tobbin', text: 'His sons never came back from the quarry. Kill eight of what took them.', goal: { type: 'kill', region: 'quarry', count: 8 }, reward: { gold: 220, xp: 130, item: 'heart' } },
  { id: 'q_veteran', title: 'Seasoned', giver: 'Captain Roe', text: 'The watch needs officers who survive. Reach level 6.', goal: { type: 'level', count: 6 }, reward: { gold: 200, xp: 0, item: 'elixir' } },
  { id: 'q_pass', title: 'Relieve the Sentries', giver: 'Captain Roe', text: 'The frozen sentries still hold their posts. Grant ten of them rest.', goal: { type: 'kill', region: 'pass', count: 10 }, reward: { gold: 300, xp: 180, item: 'glaive' } },
];

export const ORIGINS: [string, string, string][] = [
  ['Exiled Chirurgeon', 'Once a battlefield surgeon, now hunted for what you learned inside the dead.', '+3 Will · Blood Mend · Red Tonic ×2'],
  ['Grave Warden', 'You guarded the city’s dead until they began guarding you.', '+3 Vigor · Dented Buckler'],
  ['Debt-Bound Scholar', 'The Collegium owns your name. The things in your books own the rest.', '+3 Cunning · Lore fragment · +40 gold'],
];
export const PATHS: [string, string, string][] = [
  ['Vanguard', 'Meet horror edge-first.', 'Sever · +1 talent point · +6 health'],
  ['Hexer', 'Name the darkness and make it kneel.', 'Cinder Hex · +6 sanity'],
  ['Vagrant', 'Survive through guile and quick hands.', 'Riposte · +3 supplies · +5% crit'],
];
export const COMPANIONS: [string, string, string][] = [
  ['Moth', 'A pale hound that growls at empty corners.', 'Bites every 3 turns · finds supplies'],
  ['Sister Cask', 'A disgraced nun with a loaded arquebus.', 'Fires a heavy shot every 3 turns'],
  ['Nix', 'A gutter raven that steals only important things.', 'Steals gold · better loot'],
];

export const TIPS = [
  'Read the enemy intent above its health bar. Defend against HEAVY blows.',
  'Sanity is a second health bar. At zero you become Unraveled and take more damage.',
  'Each step deeper costs a supply. Without supplies, the dark feeds on you.',
  'Choose your rooms: elites drop better loot, shrines grant blessings, camps let you breathe.',
  'Level ups grant attribute and talent points. Spend them in the Character screen.',
];
