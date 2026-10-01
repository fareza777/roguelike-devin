import { E, FULL_H, aff, armorSet, arc, c, ch, ck, corrupt, dg, en, flag, g, gold, goldR, gearItem, hp, hpp, item, leave, log, loot, lore, npc, q, recruit, regalia, san, sc, town, tt, unlock, wild, xpL } from '../kit';
import type { RegionPack } from './pack';

const TD = 'tide';
const OPEN = { mainMin: 'r00' } as const;

const towns = [
  town({
    id: 'tidewatch', name: 'Tidewatch', kind: 'city', subtitle: 'The City on the Tide', region: TD, pos: [30, 58], icon: 'm_city', art: 'tidewatch', tier: 6, ferryOnly: true, unlock: OPEN,
    desc: 'A stilt-city of rope bridges and barnacled piers, the sea breathing under every floor. A lighthouse the size of a tower keeps a flame that has not gone out since Corall last sailed.',
    theme: tt('#06141a', '#ff9a70', '#ffe0cc'), services: FULL_H, shopTags: ['spear', 'pistol', 'curved', 'medium', 'potion', 'bomb'], ferry: ['saltmere', 'gullrest', 'lanternatoll'],
    rumors: ['The tide in Tidewatch comes in twice a day, and once, on certain nights, from the wrong direction.', 'Captain Corall never lost a ship. She declared them unsinkable and sank the ones that disagreed.', 'The Harbormaster logs every vessel that has ever left. The ledger is longer than the city.', 'The lighthouse beam does not sweep. It points. Nobody remembers which way it used to turn.'],
    npcs: [
      npc('quillon', 'Quillon Brae', 'Harbormaster', 'e_pirate', 'A wiry man in a coat of oilskin and brass buttons, with a ledger under each arm and a spyglass in his teeth.', ['“Every ship has a name. Every name has a berth. Every berth has a bill.”', '“The tide does not care what you were. It only cares where you are standing.”', '“If you hear the bell under the pier, do not answer it. Write it down.”'], [{ cond: { arc: ['tide', 1] }, scene: 's_quillon_brief' }, { cond: { arcMin: ['tide', 8] }, scene: 's_quillon_after' }], 'hat'),
      npc('maris', 'Maris Vane', 'Net-Mender', 'e_hermit', 'A weathered woman in a headscarf, repairing a net that is a good deal larger than it should be.', ['“Never mend with your own hair. The sea knows.”', '“Salt keeps things. That is both a mercy and a curse.”']),
      npc('tobb', 'Tobb Gannet', 'Dockhand', 'e_goblin', 'A short, cheerful man with a hook for a hand and a voice for a very large dog.', ['“Heave! Heave! Ah, there she goes.”', '“I used to be a sailor. Now I am a very patient man.”']),
    ],
  }),
  town({
    id: 'gullrest', name: 'Gullrest', kind: 'village', subtitle: 'A Hamlet of Sea-Birds', region: TD, pos: [14, 56], icon: 'm_town', art: 'gullrest', tier: 6, ferryOnly: true, unlock: OPEN, services: ['inn', 'shop', 'board', 'harbor'], ferry: ['wickhaven', 'tidewatch'],
    desc: 'A cluster of driftwood huts on a rock the colour of old teeth. The gulls are bigger than the dogs and just as loud.',
    theme: tt('#08161c', '#78d8e8', '#e0f8ff'), shopTags: ['potion', 'bomb', 'cloth'],
    rumors: ['The gulls here remember things the villagers forget.', 'A woman named Nerys has a pet eel that follows her on dry land. She says it is polite.'],
    npcs: [npc('nerys', 'Nerys Tallow', 'Eel-Keeper', 'e_fox', 'A tall girl with an eel the colour of milk glass trailing behind her through the air.', ['“He is called Brine. He does not bite. He only expresses concern.”'], [{ cond: { arcMin: ['tide', 3], not: 'comp_brine' }, scene: 's_nerys_brine' }])],
  }),
  town({
    id: 'lanternatoll', name: 'Lantern Atoll', kind: 'village', subtitle: 'The Last Light', region: TD, pos: [46, 63], icon: 'm_town', art: 'lanternatoll', tier: 6, ferryOnly: true, unlock: OPEN, services: ['inn', 'shop', 'board', 'harbor'], ferry: ['tidewatch'],
    desc: 'A ring of coral around a tiny lagoon, with one stone tower at its heart. A lamp burns at the top, and a keeper sits beneath it, making sure someone, somewhere, is watched over.',
    theme: tt('#061018', '#ffb880', '#ffe8d0'), shopTags: ['potion', 'staff', 'bomb'],
    rumors: ['The lamp has a name. It does not answer to it.', 'The Keeper’s wife drowned the year the tide stopped. He says he is still waiting for her to finish.'],
    npcs: [npc('sive', 'Sive Lamplighter', 'Keeper of the Atoll Light', 'e_bellkeeper', 'A hunched figure in a sailcloth hood, trimming a wick that should have burned out a generation ago.', ['“Every ship I save is a ship that could have saved me. It is a fair trade, I think.”', '“The needle points to whoever owes her. It has pointed at me for forty years.”'], [{ cond: { arc: ['tide', 5] }, scene: 's_sive_needle' }], 'hood')],
  }),
];

const dungeons = [
  dg({ id: 'gullcaves', name: 'The Gull Caves', subtitle: 'Where the tide keeps its quiet things', desc: 'Salt-wet grottos under the rock of Gullrest. The gulls nest in the roof. What nests in the floor is the problem.', art: 'tidewatch', theme: 'reef', floors: 3, lvl: 34, enemies: ['riptideeel', 'wreckcrab', 'gullhawk', 'shellmaw'], elite: 'reefwarden', boss: 'oldtangle', size: [29, 21], pos: [8, 64], cond: { arcMin: ['tide', 3] }, clear: 's_tide_caves', icon: 'm_cave', secretItem: 'u_corall_pistol' }),
  dg({ id: 'reefgrottos', name: 'The Reefbell Grottos', subtitle: 'Coral that rings in the dark', desc: 'A cave of living reef, where every branch is a bell and every bell has a tide-name. The sound is beautiful. It is also a summons.', art: 'reefgrottos', theme: 'reef', floors: 3, lvl: 33, enemies: ['barnaclebrute', 'riptideeel', 'jellylantern', 'shellmaw'], elite: 'reefwarden', boss: 'reefheart', size: [29, 21], pos: [22, 67], cond: { arcMin: ['tide', 2] }, clear: 's_tide_reef', icon: 'm_cave' }),
  dg({ id: 'sunkenarmada', name: 'The Sunken Armada', subtitle: 'Forty ships, still in formation', desc: 'A fleet that went down on its Captain’s order, keels up, masts down, flags still hoisted. The crews are still at their posts.', art: 'armada', theme: 'reef', floors: 3, lvl: 35, enemies: ['drownedmarine', 'ghostrigging', 'anchorgolem', 'petrelswarm', 'wreckcrab'], elite: 'drownedcommodore', boss: 'bellweather', size: [31, 23], pos: [38, 67], cond: { arcMin: ['tide', 4] }, clear: 's_tide_armada', icon: 'm_ship' }),
  dg({ id: 'unsinking', name: 'The Unsinking', subtitle: 'Captain Corall’s flagship', desc: 'A galleon that has been sinking for three hundred years and has not yet reached the bottom. Its decks are dry. Its hold is the sea.', art: 'unsinking', theme: 'reef', floors: 5, lvl: 37, enemies: ['drownedmarine', 'ghostrigging', 'tidecaller', 'anchorgolem', 'krakenarm'], elite: 'leviathancalf', boss: 'corall', size: [33, 25], pos: [50, 58], cond: { arcMin: ['tide', 7] }, clear: 's_corall_end', mainBoss: true, icon: 'm_castle' }),
];

const landmarks = [
  { id: 'compassrock', name: 'Compass Rock', icon: 'compass', pos: [27, 55] as [number, number], scene: 's_tide_rock', lvl: 36, cond: { arc: ['tide', 6] as [string, number] }, hint: 'A black rock in the shape of a compass rose, half-drowned at the island’s edge. The tide laps its points in turn.' },
  { id: 'whalebone', name: 'The Whale-Bone Arch', icon: 'm_ruins', pos: [31, 63] as [number, number], event: 'ev_s_whalebone', once: true, lvl: 35 },
  { id: 'beachedlamp', name: 'The Beached Lamp', icon: 'o_lantern', pos: [33, 54] as [number, number], event: 'ev_s_lamp', once: true, lvl: 34 },
];

const enemies = [
  en('barnaclebrute', 'Barnacle Brute', 'e_crab', 'brute', 'beast sea', ['heavy', 'attack', 'guard'], 'A thing that was a sailor and is now a pier. It has the manners of both.', { look: 'crawler' }),
  en('riptideeel', 'Riptide Eel', 'e_eel', 'skirmisher', 'beast sea', ['attack', 'afflict', 'attack'], 'It pulls you under the way a current does: slowly, and very patiently.', { ...aff('bleed'), look: 'worm' }),
  en('wreckcrab', 'Wreck Crab', 'e_crab', 'tank', 'beast sea', ['guard', 'attack', 'heavy'], 'A crab the size of a pony, wearing a ship’s bell as a helm.', { look: 'crawler' }),
  en('gullhawk', 'Gullhawk', 'e_harpy', 'skirmisher', 'beast sea', ['attack', 'attack', 'afflict'], 'A gull that has eaten something that taught it to think. It still screams.', { ...aff('bleed'), look: 'winged' }),
  en('drownedmarine', 'Drowned Marine', 'e_soldier', 'brute', 'undead sea', ['attack', 'heavy', 'dread'], 'A sailor in the Captain’s tide-livery, still saluting a ship that is no longer above water.', { dread: 2, look: 'armor+mask' }),
  en('shellmaw', 'Shellmaw', 'e_slime', 'tank', 'beast sea', ['guard', 'heavy', 'afflict'], 'A giant clam with a great deal of tongue. Do not ask what it is saying.', { ...aff('weak'), look: 'blob' }),
  en('petrelswarm', 'Storm-Petrel Swarm', 'e_raven', 'swarm', 'beast sea', ['attack', 'afflict', 'attack'], 'A thousand small grey birds, all arguing about the same dead sailor.', { ...aff('bleed'), look: 'swarm' }),
  en('ghostrigging', 'Ghost Rigging', 'e_spectre', 'caster', 'spirit sea', ['dread', 'afflict', 'dread'], 'A tangle of old rope that remembers ships. It ties itself around your wrists in the shape of knots you used to know.', { ...aff('weak'), dread: 3, look: 'spirit' }),
  en('anchorgolem', 'Anchor Golem', 'e_icegolem', 'tank', 'construct sea', ['guard', 'heavy', 'attack'], 'Chain, iron and barnacle, wrapped around a single anchor-shaped heart.', { look: 'golem' }),
  en('jellylantern', 'Lantern Jelly', 'e_jellyfish', 'caster', 'beast sea', ['dread', 'afflict', 'attack'], 'It glows. It follows. It is very beautiful. It is also very, very toxic.', { ...aff('poison'), dread: 2, look: 'spirit' }),
  en('tidecaller', 'Tide-Caller', 'e_hooded', 'caster', 'human sea', ['afflict', 'dread', 'heavy'], 'A masked sailor in a coat of wet silk, who raises water out of nowhere and lets it fall on your head.', { ...aff('weak'), dread: 2, look: 'hood+mask' }),
  en('krakenarm', 'Kraken’s Arm', 'e_kraken', 'brute', 'beast sea', ['heavy', 'afflict', 'heavy'], 'One arm of something that is not interested in the rest of you.', { ...aff('weak'), look: 'worm' }),
  en('reefwarden', 'Reef-Warden', 'e_knight', 'tank', 'construct sea elite', ['guard', 'heavy', 'dread'], 'A suit of coral armor with nothing inside it but the tide.', { dread: 2, look: 'armor' }),
  en('drownedcommodore', 'Drowned Commodore', 'e_blackknight', 'brute', 'undead sea elite', ['heavy', 'attack', 'dread', 'guard'], 'A masked officer whose orders have not stopped, only changed languages.', { dread: 3, look: 'armor+mask' }),
  en('leviathancalf', 'Leviathan Calf', 'e_whale', 'brute', 'beast sea elite', ['heavy', 'attack', 'heavy', 'afflict'], 'It is the size of a house. It is, by its own species’ standards, an infant.', { ...aff('weak'), look: 'titan' }),
  en('oldtangle', 'Old Tangle', 'e_kraken', 'brute', 'beast sea boss', ['heavy', 'afflict', 'heavy', 'guard'], 'A kraken that lives in a cave too small for it and has not been forgiven for it.', { hpMul: 4, ...aff('weak'), look: 'worm' }),
  en('reefheart', 'The Reef-Heart', 'e_eviltree', 'tank', 'construct sea boss', ['guard', 'heavy', 'dread', 'heavy'], 'The heart of the reef, a vast coral colossus whose every branch is a bell.', { hpMul: 4.2, dread: 3, look: 'titan' }),
  en('bellweather', 'Admiral Bellweather', 'e_king', 'brute', 'undead sea boss', ['heavy', 'dread', 'attack', 'guard'], 'The Armada’s admiral, still giving orders to a sea that has long since stopped listening.', { hpMul: 4, dread: 3, look: 'armor+crown' }),
  en('corall', 'Captain Corall', 'e_crowned', 'caster', 'human sea boss', ['dread', 'heavy', 'afflict', 'guard', 'heavy'], 'Fourth Regent of the Meridian. She ruled by the tide, and ordered the sea itself to hold her ships up.', { hpMul: 5.2, dread: 4, ...aff('weak'), look: 'king' }),
];

const quests = [
  q('q_s_eels', 'tidewatch', 'Quillon Brae', 'Eels in the Slip', 'Riptide eels have taken three tenders and a pilot. Fourteen of them, and the slip is safe again.', g('kill', 14, 'Slay riptide eels', 'riptideeel'), { gold: 900, xp: 860, items: ['restorative', 'w_curved_5'] }),
  q('q_s_crabs', 'tidewatch', 'Tobb Gannet', 'Crab Season', 'Wreck crabs wear our harbour bells as helmets. I want the bells back. Ten crabs.', g('kill', 10, 'Break wreck crabs', 'wreckcrab'), { gold: 880, xp: 840, items: ['bloodwine', 'a_body_medium_5'] }),
  q('q_s_marines', 'tidewatch', 'Quillon Brae', 'Standing Orders', 'Drowned marines still stand watch on the old wharf. Relieve eight of them of their duty.', g('kill', 8, 'Relieve drowned marines', 'drownedmarine'), { gold: 960, xp: 900, items: ['panacea', 'x_rune_5'] }),
  q('q_s_gulls', 'tidewatch', 'Maris Vane', 'The Gullhawk Problem', 'They have been stealing my net-floats. Seven gullhawks, and I will mend you something fine.', g('kill', 7, 'Down gullhawks', 'gullhawk'), { gold: 820, xp: 800, items: ['nightshade', 'nightshade', 'a_hands_medium_5'] }),
  q('q_s_elite', 'tidewatch', 'Quillon Brae', 'Leviathans and Such', 'The Harbour Office keeps a prize for the great sea-beasts. Three of them.', g('elites', 3, 'Slay elite foes'), { gold: 1100, xp: 960, items: ['recollection', 'x_gemring_5'] }),
  q('q_s_events', 'tidewatch', 'Maris Vane', 'Tide-Tales', 'Bring me five tales from the open sea. They go into the net.', g('events', 5, 'Survive strange encounters'), { gold: 780, xp: 780, items: ['folio', 'j_pearls'] }),
  q('q_s_whale', 'gullrest', 'Nerys Tallow', 'The Whale-Bone Arch', 'There is an arch of whale-bones on the east shore that hums when the tide turns. Go and listen.', g('reach', 1, 'Visit the Whale-Bone Arch', 'whalebone'), { gold: 640, xp: 720, items: ['clearwater', 'clearwater', 'cratesupply'] }),
  q('q_s_caves', 'gullrest', 'Nerys Tallow', 'Old Tangle', 'There is a kraken in the cave under my house. He is lonely and enormous. He must be put to rest.', g('clear', 1, 'Defeat Old Tangle', 'gullcaves'), { gold: 1200, xp: 1050, items: ['u_corall_pistol', 'lifeblood'] }),
  q('q_s_shells', 'gullrest', 'Nerys Tallow', 'Clam Chowder, Eventually', 'Shellmaws are in the shallows. They eat boats. I want eight of them in a pot.', g('kill', 8, 'Shuck shellmaws', 'shellmaw'), { gold: 860, xp: 820, items: ['salts', 'salts', 'a_head_cloth_5'] }),
  q('q_s_jellies', 'lanternatoll', 'Sive Lamplighter', 'Too Many Lanterns', 'Lantern jellies have crowded the lagoon and confused the ships. Twelve of them, put out.', g('kill', 12, 'Douse lantern jellies', 'jellylantern'), { gold: 940, xp: 880, items: ['frostwater', 'w_staff_5'] }),
  q('q_s_golems', 'lanternatoll', 'Sive Lamplighter', 'Anchors Aweigh', 'The anchor golems have been trying to leave. Anchors are not supposed to want that. Six.', g('kill', 6, 'Smash anchor golems', 'anchorgolem'), { gold: 980, xp: 900, items: ['quarrycharge', 'w_hammer_5'] }),
  q('q_s_calf', 'lanternatoll', 'Sive Lamplighter', 'A Child of the Deep', 'A leviathan calf is lost and angry, and hits the lighthouse for sport. Bring it peace, by whichever method.', g('kill', 1, 'Slay the Leviathan Calf', 'leviathancalf'), { gold: 1300, xp: 1100, items: ['set_tide_body', 'lucid'] }),
];

const events = [
  E('ev_s_whalebone', 'The Whale-Bone Arch', 'm_ruins', 'wild sea', 'An arch of enormous ribs frames the tide. When the water rises through it, the arch hums one deep note, and every gull on the island stops what it is doing to listen.', [
    c('Listen', 'Stand in the arch.', [san(10), lore(), xpL(0.15)], { check: ck('will', 14), fail: [san(-6), log('The note finds the bottom of you and stays.', 'bad')] }),
    c('Salvage a rib', 'Bone is bone.', [item('j_pelvis'), goldR(80, 150), corrupt(1)]),
    c('Sing along', 'The arch changes key.', [loot('rare'), san(6)])], 'bones'),
  E('ev_s_lamp', 'The Beached Lamp', 'o_lantern', 'wild sea', 'A brass lamp as big as a cart lies beached on the sand, still lit. Its flame leans, steadily, toward the open sea.', [
    c('Add oil', 'Keep it burning.', [hpp(20), san(8), xpL(0.15)], { cost: { supplies: 1 } }),
    c('Turn it landward', 'See what happens.', [loot('rare'), san(-4)], { check: ck('vigor', 14), fail: [hp(-16)] }),
    c('Follow the flame', 'It points at something.', [goldR(100, 180), wild()])], 'lantern'),
  E('ev_s_message', 'A Bottle with a Chart', 'c_scroll', 'wild sea', 'A bottle rolls ashore at your feet, stoppered with a silver coin. Inside, a chart, hand-inked, marked with a hatched wreck and a single word: Mine.', [
    c('Open it', 'Read the chart.', [lore(), goldR(120, 200)]),
    c('Keep the bottle sealed', 'It might be a wish.', [item('chart'), log('You tuck it away. It hums faintly.', 'plain')]),
    c('Throw it back', 'Some answers are not for you.', [san(5)])], 'book'),
  E('ev_s_tide', 'A Wrong Tide', 'm_ship', 'wild sea', 'The tide comes in from the wrong side. A long, pale wave rises up the beach, taller than it should be, and goes on rising.', [
    c('Run for high ground', 'Do not look back.', [xpL(0.1)], { check: ck('cunning', 13), fail: [hp(-20), log('The wave takes your pack.', 'bad'), gold(-60)] }),
    c('Stand and face it', 'Let it break around you.', [san(8), loot('rare')], { check: ck('will', 14), fail: [san(-10), hp(-12)] }),
    c('Wade out', 'Something is out there.', [loot('epic'), corrupt(1), wild('elite')])], 'ship'),
  E('ev_s_hold', 'A Flooded Hold', 'chest', 'reef', 'A ship’s hold, ankle-deep, stacked with water-logged crates. A few are labelled. All of them are labelled with your name.', [
    c('Open the nearest', 'Be curious. Be quick.', [loot('rare'), goldR(90, 160)], { check: ck('cunning', 13), fail: [hp(-14)] }),
    c('Read the manifest', 'Corall kept good records.', [lore(), san(-3)]),
    c('Leave them', 'Nobody sends you a present without wanting something.', leave)], 'chest'),
  E('ev_s_bell', 'The Bell Under the Pier', 'j_bell', 'reef', 'A brass bell hangs in the dark water beneath a half-sunk pier. It swings with no wind, and each time it swings, it sounds a tide-name.', [
    c('Answer it', 'Speak your own name.', [san(-6), xpL(0.25)], { check: ck('will', 14), fail: [corrupt(1), san(-10)] }),
    c('Muffle it', 'Wrap the clapper in cloth.', [loot('rare'), san(4)]),
    c('Write it down', 'Quillon would approve.', [lore(), xpL(0.1)])], 'bells'),
  E('ev_s_crew', 'A Crew at Dinner', 'tavern', 'reef', 'A galley, table laid, a crew of drowned sailors in their finest, seated and silent. A meal steams in front of each of them. One seat is free.', [
    c('Sit in the free chair', 'Join the supper.', [hpp(40), san(-8), corrupt(1)]),
    c('Take the silver', 'The spoons are real.', [goldR(120, 200), hp(-10)]),
    c('Salute and leave', 'Respect the dead.', [san(6), xpL(0.1)])], 'candles'),
  E('ev_s_figurehead', 'A Figurehead That Turns', 'e_hooded', 'reef', 'A figurehead, carved from a ship’s prow, leans against the wall. It is veiled in sailcloth. As you pass, it turns, very slowly, to follow you.', [
    c('Lift the veil', 'See what is under.', [lore(), san(-8)], { check: ck('will', 14), fail: [wild('elite')] }),
    c('Leave an offering', 'A coin for the sea.', [loot('rare'), gold(-50)]),
    c('Walk faster', 'You were never here.', leave)], 'mask'),
];

const scenes = [
  sc('s_tide_caves', 'tidewatch', [
    ['narrator', 'Old Tangle subsides into the dark of his cave, quiet at last, one huge arm lying across the entrance like a gate left open. The gulls on the roof go silent, then, one by one, begin to sing.'],
    ['narrator', 'Nerys is waiting on the beach when you come out. She does not say thank you. She just sits down beside you on the sand, and her white eel loops once around your shoulders in what could be gratitude.', { eff: [xpL(0.3), san(-2)] }],
  ]),
  sc('s_tide_arrive', 'tidewatch', [
    ['narrator', 'The ferry noses through a forest of masts, hulls, bridges, and lanterns on lines. Tidewatch rises from the water like a coral, every level a deck, every deck a street, every street a gangway. The air smells of tar and kelp and warm lamp oil.'],
    ['narrator', 'At the very top, a lighthouse beam points at the sea, not sweeping, not moving, as if holding something on a leash.', { eff: [arc('tide', 1), xpL(0.25)] }],
  ]),
  sc('s_quillon_brief', 'tidewatch', [
    ['quillon', '“A key-bearer. Good.” Quillon marks something in a ledger. “Tidewatch pays its debts. Corall did not. She sank her own fleet to keep it from being captured, then declared the wrecks hers forever. There is a Captain at the bottom of every ship in the Armada, and none of them would let you pass.”'],
    ['quillon', '“Three things must be done. The Reefbell Grottos, where the old tide-bell still sounds her name. The Sunken Armada, where Admiral Bellweather still signals for orders. Then the Atoll Light, where the lamplighter has the needle. Only then does her flagship become reachable.”', { choices: [
      ch('“What is the needle?”', '3'), ch('“What was Corall like?”', '4'), ch('“Start with the grottos.”', '5')] }],
    ['quillon', '“A coral compass-needle that points toward whoever owes her. She kept it in her chart room. After she died, it kept pointing. At everyone.”', { id: '3', next: '5' }],
    ['quillon', '“Efficient. Fair. Cold as a harbour in January. She would not have lied to you, and she would not have saved you.”', { id: '4', next: '5' }],
    ['quillon', '“Take this.” He gives you a brass spyglass. “It sees what is under the waves, which is more than I would prefer.”', { id: '5', eff: [item('chart', 2), arc('tide', 2), xpL(0.2)] }],
  ]),
  sc('s_tide_reef', 'reefgrottos', [
    ['narrator', 'The Reef-Heart cracks open like a bell, and every coral branch in the cave rings at once, then falls silent. Where its core was, a shard of pink coral the length of a hand lies in a pool of its own light. It is warm. It points, faintly, east.'],
    ['narrator', 'When you lift it, you hear the tide-bell’s last note, resolved, and under it, very faint, a woman’s voice counting ships.', { eff: [flag('tide_shard1'), xpL(0.3), san(-2)] }],
  ]),
  sc('s_tide_armada', 'armada', [
    ['narrator', 'Admiral Bellweather salutes his own broken sword, then the room, then you. His crew, one by one, stand down. For the first time in three centuries, forty ships stop signalling.'],
    ['narrator', 'In his sea-chest, a second shard of coral, dark red, ringed with barnacle. It glows when you hold it near the first, and the glow points, very precisely, at the Atoll.', { eff: [flag('tide_shard2'), xpL(0.3), san(-3)] }],
  ]),
  sc('s_nerys_brine', 'gullrest', [
    ['narrator', 'The milk-white eel circles Nerys, then you, then Nerys again, as if deciding. “He has never done that,” she says, quietly. “He only follows me. He has never… chosen.” She bites her lip. “Take him. He will be bored with me by midsummer. He likes people who go somewhere.”'],
    ['narrator', 'Brine drifts to your shoulder and hangs there, cool and bright and entirely unbothered, like a thought you are glad you had.', { eff: [recruit('Brine'), xpL(0.2)] }],
  ]),
  sc('s_sive_needle', 'lanternatoll', [
    ['sive', '“Two shards,” Sive says, trimming a wick. He does not look up. “I have been waiting for them since before you were born. Set them in the lamp.” The lamp flares. The two shards fuse in a ring of light, and the needle of Captain Corall’s compass rises from the flame, a bright, pink-gold thing, pointing steadily at a rock in the north.'],
    ['sive', '“It has been pointing at me for forty years. Now it points at her. I am… very tired, I think. Is that all right?”', { choices: [
      ch('“Rest. You have kept the light.”', '2'), ch('“Where does it point?”', '3')] }],
    ['sive', '“Thank you.” He closes his eyes. The lamp burns on without him, quiet and warm.', { id: '2', next: '4' }],
    ['sive', '“Compass Rock. North of the main island. Corall’s last anchorage. You will want the tide at its lowest.”', { id: '3', next: '4' }],
    ['narrator', 'The needle drifts into your hand, light as a sliver of daylight.', { id: '4', eff: [flag('tide_needle'), arc('tide', 6), xpL(0.3), unlock('unsinking')] }],
  ]),
  sc('s_tide_rock', 'tidewatch', [
    ['narrator', 'Compass Rock lies black and flat in the shallows, its four points cut with a surveyor’s precision. At low tide, you can stand on the centre. You do. The needle in your hand swings, then stills.'],
    ['narrator', 'In the distance, far out on the grey water, a dark galleon rises from the horizon, impossibly tall, listing, trailing weed and flags. It has been sinking for three hundred years. The water around it does not part for you. It simply stops being water, and becomes a road.', { eff: [arc('tide', 7), xpL(0.35), san(-3)] }],
  ]),
  sc('s_corall_end', 'unsinking', [
    ['narrator', 'Captain Corall kneels on her own quarterdeck, and the sea she has been holding up for three hundred years sinks, at last, a single fathom. Her mask of coral cracks in the middle. Behind it, there is only a tide.'],
    ['corall', '“You are the first to not ask me why,” she says, tired. “They always want to know why a fleet. Why a drowning. Why not just let the ships go.” She lifts a compass, the same shape as the needle you carry, out of her coat. “Because if the sea is allowed to take one, it will take them all. That is what tides are. That is all they are.”', { choices: [
      ch('Take the Tide-Compass.', '2'), ch('“And if the sea took them anyway?”', '3')] }],
    ['corall', '“Then I would have been a woman who held her breath for three hundred years and lost. That is not worse than being a Regent. It is just quieter.”', { id: '3', next: '2' }],
    ['narrator', 'The Tide-Compass settles in your palm, its needle spinning, then settling on you. Below the deck, three hundred years of water begin, quietly, to drain.', { id: '2', eff: [regalia('tide'), arc('tide', 8), xpL(0.6), gold(900), san(-4)] }],
  ]),
  sc('s_quillon_after', 'tidewatch', [
    ['quillon', '“The tide has turned,” he says, almost smiling. “Properly turned. It will come in tomorrow at the right time.” He hangs a brass key from your belt. “Tidewatch is yours when you want it. There is always a berth, and the bill is already paid.”'],
  ]),
];

const items = [
  gearItem('reg_tide', 'The Tide-Compass', 'compass', 'offhand', 'mythic', 7, 'Captain Corall’s coral compass. It points at whatever you most owe, and whatever you most owe turns, gradually, to face you.', { armor: 22, maxHp: 50, dodge: 10, luck: 10, will: 4, cunning: 3 }, { set: 'regalia' }),
  gearItem('u_corall_pistol', 'The Last Broadside', 'w_pistol', 'weapon', 'epic', 5, 'A pistol with a single, very long barrel, taken from a ship that never fired it.', { damage: 46, crit: 12, luck: 6, dodge: 4 }),
  ...armorSet('tide', 6, 'epic', {
    head: ['Admiral’s Tricorn', 'h_crest', 'A hat that has seen worse seas, and has been recommended for several.'],
    body: ['Brineplate Coat', 'b_chest', 'Oilcloth over coral plates. It sloughs off water, and also some opinions.'],
    hands: ['Rope-Burn Gloves', 'g_medium', 'Gloves that have hauled a thousand knots.'],
    feet: ['Tidewalker Boots', 'f_heavy', 'You will not slip on a wet deck. You may slip in other ways.'],
  }, { head: { maxSanity: 2, dodge: 1 }, body: { maxHp: 3, dodge: 1 }, hands: { crit: 1, cunning: 0 }, feet: { dodge: 2, maxHp: 1 } }),
];

export const TIDE: RegionPack = {
  id: 'tide',
  zone: {
    id: 'tide', name: 'The Tidal Archipelago', at: [32, 62], lvl: 35, pool: ['barnaclebrute', 'riptideeel', 'wreckcrab', 'gullhawk', 'drownedmarine'], biome: 'sea', elite: 'leviathancalf', bg: 'tidewatch', island: true,
    islands: [{ at: [30, 59], r: 7 }, { at: [14, 56], r: 4.6 }, { at: [46, 63], r: 4.6 }, { at: [22, 67], r: 3.8 }, { at: [38, 67], r: 3.8 }, { at: [50, 58], r: 4.2 }, { at: [8, 64], r: 3.8 }, { at: [20, 52], r: 1.8 }, { at: [40, 55], r: 1.8 }, { at: [54, 67], r: 2 }, { at: [26, 50], r: 1.6 }, { at: [4, 56], r: 1.8 }],
  },
  towns, dungeons, landmarks, enemies, quests, events, scenes, items,
  links: [['tidewatch', 'compassrock'], ['tidewatch', 'whalebone'], ['tidewatch', 'beachedlamp'], ['tidewatch', 'reefgrottos']],
  speakers: {
    quillon: { name: 'Quillon Brae', title: 'Harbormaster', icon: 'e_pirate', color: '#ffb890', look: 'hat' },
    sive: { name: 'Sive Lamplighter', title: 'Keeper of the Atoll Light', icon: 'e_bellkeeper', color: '#ffd8b0', look: 'hood' },
    corall: { name: 'Captain Corall', title: 'Fourth Regent', icon: 'e_crowned', color: '#ff9a80', look: 'mask' },
  },
  arc: {
    id: 'tide', title: 'The Tide-Compass', region: 'tide', lvl: 33, regalia: 'tide',
    blurb: 'The fourth Regent ruled by the tide, and ordered the sea to hold her ships up.',
    steps: [
      { title: 'The Harbormaster', obj: 'Speak with Quillon Brae in Tidewatch.', text: 'The harbour keeps a ledger of every ship ever lost. Quillon knows how to find the flagship.', at: 'tidewatch' },
      { title: 'The Reefbell Grottos', obj: 'Defeat the Reef-Heart in the Reefbell Grottos.', text: 'The first coral shard still rings in a cave of living bells.', at: 'reefgrottos', goal: g('clear', 1, 'Defeat the Reef-Heart', 'reefgrottos') },
      { title: 'Clear the Shallows', obj: 'Enter the Gull Caves and defeat Old Tangle.', text: 'The islands are overrun, and the ferries will not run until the kraken under Gullrest is dealt with.', at: 'gullcaves', goal: g('clear', 1, 'Defeat Old Tangle', 'gullcaves') },
      { title: 'The Sunken Armada', obj: 'Defeat Admiral Bellweather in the Sunken Armada.', text: 'The second shard lies in the admiral’s chest.', at: 'sunkenarmada', goal: g('clear', 1, 'Defeat Admiral Bellweather', 'sunkenarmada') },
      { title: 'The Atoll Light', obj: 'Take both shards to Sive Lamplighter on Lantern Atoll.', text: 'Only the lamplighter can set the needle.', at: 'lanternatoll' },
      { title: 'Compass Rock', obj: 'Stand upon Compass Rock at low tide.', text: 'The needle will find the flagship from the place where it was cut.', at: 'unsinking', goal: g('reach', 1, 'Reach Compass Rock', 'compassrock') },
      { title: 'The Unsinking', obj: 'Board the Unsinking and face Captain Corall.', text: 'Five decks of drowned crew, and a Captain who has been holding up the sea for three centuries.', at: 'unsinking', goal: g('clear', 1, 'Defeat Captain Corall', 'unsinking') },
    ],
  },
  triggers: [{ loc: 'tidewatch', cond: { mainAt: 'r00' }, scene: 's_tide_arrive' }],
  schools: { tidewatch: ['Tide', 'Shadow', 'Sanguine'] },
  sets: { tide: { name: 'Brineplate', two: { dodge: 8, maxHp: 30 }, four: { dodge: 10, maxHp: 50, armor: 16, will: 4 }, blurb: 'The old Admiral’s livery, cut for new tides.' } },
  bossLoot: { oldtangle: ['u_corall_pistol'], reefheart: ['set_tide_head'], bellweather: ['set_tide_feet'], corall: ['set_tide_body', 'set_tide_hands'] },
};
