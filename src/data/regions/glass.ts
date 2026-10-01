import { E, FULL, aff, armorSet, arc, c, ch, ck, cons, corrupt, dg, en, flag, g, gold, goldR, gearItem, hp, hpp, item, leave, log, loot, lore, npc, q, rand, recruit, regalia, san, sc, town, tt, unlock, wild, xpL } from '../kit';
import type { RegionPack } from './pack';

const GW = 'glass';

const towns = [
  town({
    id: 'brasshaven', name: 'Brasshaven', kind: 'city', subtitle: 'The Port of Dunes', region: GW, pos: [74, 22], icon: 'm_city', art: 'brasshaven', tier: 4,
    desc: 'A city of brass domes and ground-glass windows rising out of the dunes. Every roof carries a lens, and every lens carries an opinion about your intentions.',
    theme: tt('#1c1008', '#ffb450', '#ffe0a8'), services: FULL, shopTags: ['staff', 'tome', 'crossbow', 'arquebus', 'cloth', 'potion'],
    rumors: ['The Opticians’ Guild grinds a new lens every dawn. The lens that shows nothing sells best.', 'Nobody sleeps facing the Prism Palace. They say it looks back.', 'A caravan returned from the Wastes with its water barrels full of sand and its drivers full of questions.', 'The Lens-Queen once read a lie off a man’s forehead from three miles away. He admitted it to the whole crowd, then to the sand.'],
    npcs: [
      npc('orla', 'Orla Brasswick', 'Guildmistress of the Opticians', 'e_gearmask', 'A broad woman in a brass apron, her left eye replaced by a loupe that rotates when she lies. It rotates a lot.', ['“Everything in this city is glass or brass. Everything that is not will be, by Thursday.”', '“Do not stare at the Palace. It takes that personally.”', '“I trade in clarity. It is the only commodity that gets worse the more you buy.”'], [{ cond: { arc: ['glass', 1] }, scene: 's_orla_brief' }, { cond: { arcMin: ['glass', 8] }, scene: 's_orla_after' }], 'mask'),
      npc('calder', 'Calder Veyn', 'Glass-Cutter', 'e_dwarf', 'A lean artisan whose hands are a map of old cuts. He is polishing a lens that is polishing him back.', ['“Cut once, regret forever. That is the whole craft.”', '“You want a lens that shows the truth? I can sell you three. They disagree.”'], [{ cond: { arcMin: ['glass', 3], not: 'comp_lumen' }, scene: 's_calder_lumen' }]),
      npc('rue', 'Rue Dunmere', 'Caravan Guide', 'e_fox', 'A weathered scout who talks to the horizon as if it owes her money.', ['“The dunes move. Do not argue with them about it.”', '“Wear a veil, drink on schedule, and never follow a footprint that leads toward the glare.”']),
    ],
  }),
  town({
    id: 'shardrest', name: 'Shardrest', kind: 'village', subtitle: 'A Caravan Halt', region: GW, pos: [67, 27], icon: 'm_town', art: 'shardrest', tier: 4,
    desc: 'A ring of tents and one stone cistern, ringed by glittering drifts of shard-glass. Travellers pay for water by the shadow.',
    theme: tt('#1a1006', '#ffcc70', '#fff0c8'), shopTags: ['potion', 'bomb', 'cloth'],
    rumors: ['The cistern is deeper than the well it was built over. Somebody keeps digging in the dark.', 'A jackal made of cut glass followed a trader for nine days and never once blinked.'],
    npcs: [npc('hadd', 'Hadd Orsolo', 'Caravan-Master', 'e_bandit', 'A barrel-chested man whose beard is full of sand and old promises.', ['“Water by the cup, shade by the hour, advice by the sigh.”', '“The glass cuts. The sand scours. The sun does both. I recommend the tents.”'])],
  }),
  town({
    id: 'kilnhold', name: 'Kilnhold', kind: 'village', subtitle: 'Where the Lenses Are Fired', region: GW, pos: [85, 17], icon: 'm_town', art: 'kilnhold', tier: 4,
    desc: 'A walled village of kilns, each one glowing like a held breath. The kiln-masters speak softly because the glass listens.',
    theme: tt('#1c0c06', '#ff8a40', '#ffd8a8'), shopTags: ['staff', 'orb', 'potion'],
    rumors: ['The Lens-Queen’s own lensmaker still lives here. She cannot see anything she did not grind herself.', 'The kilns burn without fuel on the night of a true eclipse.'],
    npcs: [
      npc('ana', 'Ana the Lensless', 'Last of the Queen’s Grinders', 'e_hermit', 'A very old woman with white silk wound over her eyes. She holds a lens up to the sun and sees something there.', ['“I ground eleven thousand lenses for her. Not one of them let me see my own hands.”', '“Do not look at the Queen. Look through what she wants you to look through.”'], [{ cond: { arc: ['glass', 5] }, scene: 's_ana_key' }], 'veil'),
      npc('brannock', 'Sooty Brannock', 'Kiln-Master', 'e_miner', 'A man the colour of old chimneys, grinning through a mask of ash.', ['“Hot work. Long work. The glass will outlive us both and judge us for it.”']),
    ],
  }),
];

const dungeons = [
  dg({ id: 'scorchquarry', name: 'The Scorchglass Quarry', subtitle: 'Where the sand was melted on purpose', desc: 'A pit mine where the Guild cuts raw glass from the fused desert. The overseers stopped answering their own horns.', art: 'glasswastes', theme: 'glass', floors: 3, lvl: 25, enemies: ['glassscarab', 'shardjackal', 'cullet', 'lensgrinder'], elite: 'slagoverseer', boss: 'obsid', size: [29, 21], pos: [64, 18], cond: { arcMin: ['glass', 3] }, clear: 's_glass_quarry', icon: 'm_mine', secretItem: 'u_glass_hound' }),
  dg({ id: 'orangery', name: 'The Cracked Orangery', subtitle: 'A garden of glass, kept by something that forgot why', desc: 'A hothouse built by the Lens-Queen to grow trees from light. The trees are gone. The glass remembers them.', art: 'orangery', theme: 'glass', floors: 3, lvl: 24, enemies: ['glassscarab', 'cullet', 'lensgrinder', 'shardjackal'], elite: 'prismhulk', boss: 'glasshousekeeper', size: [29, 21], pos: [71, 16], cond: { arcMin: ['glass', 2] }, clear: 's_glass_orangery', icon: 'm_ruins' }),
  dg({ id: 'mirage', name: 'The Mirage Cistern', subtitle: 'Water that remembers being a lie', desc: 'A vast drowned vault beneath the dunes. Its pools show the room you are not standing in.', art: 'cistern', theme: 'glass', floors: 3, lvl: 26, enemies: ['miragedancer', 'saltwraith', 'dunewyrm', 'mirrormimic'], elite: 'wellwarden', boss: 'siltmaw', size: [31, 23], pos: [82, 28], cond: { arcMin: ['glass', 4] }, clear: 's_glass_cistern', icon: 'm_cave' }),
  dg({ id: 'prismpalace', name: 'The Prism Palace', subtitle: 'The Lens-Queen’s court of light', desc: 'A palace built of lenses, so that nothing within it can be concealed, including you. At its heart, the Great Lens still turns.', art: 'prismpalace', theme: 'glass', floors: 5, lvl: 28, enemies: ['heliosentry', 'sunstruck', 'miragedancer', 'lensgrinder', 'mirrormimic'], elite: 'lensbearer', boss: 'maridel', size: [33, 25], pos: [90, 23], cond: { arcMin: ['glass', 7] }, clear: 's_maridel_end', mainBoss: true, icon: 'm_castle' }),
];

const landmarks = [
  { id: 'greatlens', name: 'The Great Lens', icon: 'm_obelisk', pos: [79, 18] as [number, number], scene: 's_glass_lens', lvl: 27, cond: { arc: ['glass', 6] as [string, number] }, hint: 'A lens the size of a house lies half-buried in the dunes. It is waiting for something.' },
  { id: 'dryfountain', name: 'The Dry Fountain', icon: 'fountain', pos: [70, 29] as [number, number], event: 'ev_g_fountain', once: true, lvl: 25 },
  { id: 'mirrorcairn', name: 'Cairn of Mirrors', icon: 'm_ruins', pos: [88, 29] as [number, number], event: 'ev_g_cairn', once: true, lvl: 27 },
];

const enemies = [
  en('glassscarab', 'Glass Scarab', 'e_scarab', 'skirmisher', 'beast glass', ['attack', 'afflict', 'attack'], 'A beetle that swallowed a lens. It sees everything and cannot decide what to bite first.', aff('bleed')),
  en('shardjackal', 'Shard Jackal', 'e_fanged', 'skirmisher', 'beast glass', ['attack', 'attack', 'afflict'], 'Cut glass over bone. It runs like water and bites like a window.', aff('bleed')),
  en('miragedancer', 'Mirage Dancer', 'e_spectre', 'caster', 'spirit glass', ['dread', 'attack', 'dread'], 'A shape of heat and silk that is always three steps from where it appears to be.', { dread: 3 }),
  en('dunewyrm', 'Dune Wyrm', 'e_wormmouth', 'brute', 'beast glass', ['heavy', 'attack', 'afflict'], 'Eats sand and what the sand has eaten. Its scales are rolled glass.', { ...aff('weak'), look: 'worm' }),
  en('heliosentry', 'Heliograph Sentry', 'e_gearmask', 'caster', 'construct glass', ['dread', 'heavy', 'dread'], 'A brass tripod holding a mirror. It flashes a signal you can feel on your teeth.', { dread: 3, look: 'golem' }),
  en('lensgrinder', 'Lensgrinder', 'e_icegolem', 'tank', 'construct glass', ['guard', 'heavy', 'attack'], 'A brass automaton that polishes everything it meets, including bone.', { look: 'golem' }),
  en('sunstruck', 'Sunstruck Wanderer', 'e_hooded', 'brute', 'human glass', ['attack', 'heavy', 'afflict'], 'Veiled against a glare that has since moved inside. It walks toward the light and calls it home.', { ...aff('burn'), look: 'hood+veil' }),
  en('cullet', 'Cullet Swarm', 'e_scarab', 'swarm', 'glass', ['attack', 'attack', 'afflict'], 'A drift of broken glass moving with one mind and no manners.', { ...aff('bleed'), look: 'swarm' }),
  en('saltwraith', 'Salt Wraith', 'e_ghost', 'caster', 'spirit', ['afflict', 'dread', 'attack'], 'What is left when a traveller walks until the water in them is a rumour.', { ...aff('weak'), dread: 2 }),
  en('mirrormimic', 'Mirror Mimic', 'e_slime', 'tank', 'glass', ['guard', 'attack', 'heavy'], 'A pane that learned to stand. It copies your stance a half-second late, and harder.', { look: 'blob' }),
  en('silicacolossus', 'Silica Colossus', 'e_cyclops', 'brute', 'construct glass elite', ['heavy', 'attack', 'heavy', 'afflict'], 'A walking dune of fused sand and one great cracked lens for an eye-socket. It does not see you. It sees the sun, through you.', { ...aff('burn'), look: 'titan' }),
  en('prismhulk', 'Prism Hulk', 'e_icegolem', 'tank', 'construct glass elite', ['guard', 'heavy', 'attack'], 'The Orangery’s gardener, made of grown glass. Its leaves are blades.', { look: 'golem' }),
  en('wellwarden', 'Well-Warden', 'e_knight', 'tank', 'construct glass elite', ['guard', 'dread', 'heavy'], 'A bronze sentinel standing waist-deep in water that is not there.', { dread: 2, look: 'armor' }),
  en('lensbearer', 'Lens-Bearer', 'e_blackknight', 'brute', 'human glass elite', ['heavy', 'dread', 'attack'], 'A masked guard carrying a lens that focuses everything it looks at into a point. The point is you.', { dread: 2, ...aff('burn'), look: 'armor+mask' }),
  en('slagoverseer', 'Slag Overseer', 'e_ogre', 'brute', 'human glass elite', ['heavy', 'attack', 'afflict'], 'A foreman fused into his own whip. He has not stopped the shift.', { ...aff('burn'), look: 'armor' }),
  en('glasshousekeeper', 'The Glasshouse Keeper', 'e_icegolem', 'tank', 'construct glass boss', ['guard', 'heavy', 'attack', 'afflict'], 'It tends a garden that has been dead for a century and will not hear otherwise.', { hpMul: 4, ...aff('bleed'), look: 'golem' }),
  en('siltmaw', 'Siltmaw', 'e_wormmouth', 'brute', 'beast glass boss', ['heavy', 'afflict', 'attack', 'heavy'], 'The thing that drank the Cistern. It is still thirsty.', { hpMul: 4.2, ...aff('weak'), look: 'worm' }),
  en('obsid', 'Quarrymaster Obsid', 'e_king', 'brute', 'human glass boss', ['heavy', 'attack', 'afflict', 'guard'], 'He promised the Guild a deeper pit. The pit has been collecting.', { hpMul: 3.8, ...aff('bleed'), look: 'armor' }),
  en('maridel', 'Maridel, the Lens-Queen', 'e_crowned', 'caster', 'human glass boss', ['dread', 'heavy', 'afflict', 'attack'], 'Second Regent of the Meridian. She ruled by seeing, and she has not been able to look away for four hundred years.', { hpMul: 5, dread: 4, ...aff('burn'), look: 'king' }),
];

const quests = [
  q('q_g_scarabs', 'brasshaven', 'Orla Brasswick', 'Beetle Season', 'Glass scarabs are chewing through the Guild’s drying racks. Break ten of them.', g('kill', 10, 'Slay glass scarabs', 'glassscarab'), { gold: 520, xp: 420, items: ['restorative', 'w_dagger_4'] }),
  q('q_g_jackals', 'brasshaven', 'Rue Dunmere', 'Jackals of Cut Glass', 'Caravans are losing animals to jackals that glitter. Bring me eight of their pelts. Or what passes for pelts.', g('kill', 8, 'Slay shard jackals', 'shardjackal'), { gold: 560, xp: 440, items: ['pitchbomb', 'pitchbomb', 'a_feet_medium_4'] }),
  q('q_g_sentries', 'brasshaven', 'Orla Brasswick', 'Dim the Signals', 'The Heliograph Sentries flash signals that give the city headaches. Four of them, switched off for good.', g('kill', 4, 'Smash heliograph sentries', 'heliosentry'), { gold: 600, xp: 480, items: ['x_lantern_4', 'stillwater'] }),
  q('q_g_wanderers', 'brasshaven', 'Rue Dunmere', 'Sunstruck', 'The glare gets into some of them and never leaves. Six wanderers who cannot be led home. I will not ask what you do about it.', g('kill', 6, 'Put down sunstruck wanderers', 'sunstruck'), { gold: 580, xp: 470, items: ['salts', 'a_head_medium_4'] }),
  q('q_g_elites', 'brasshaven', 'Orla Brasswick', 'Named in Glass', 'The Guild keeps a ledger of the Wastes’ named horrors. Strike two off it.', g('elites', 2, 'Slay elite foes'), { gold: 700, xp: 520, items: ['recollection', 'x_gemring_4'] }),
  q('q_g_events', 'brasshaven', 'Calder Veyn', 'What the Dunes Show', 'Come back with four stories I have not heard. Do not make them up. The glass will know.', g('events', 4, 'Survive strange encounters'), { gold: 480, xp: 400, items: ['folio', 'j_cluster'] }),
  q('q_g_dryfountain', 'shardrest', 'Hadd Orsolo', 'The Dry Fountain', 'There is a dry fountain on the old road. The caravan song says it flows for the honest. Go and find out what it does for you.', g('reach', 1, 'Visit the Dry Fountain', 'dryfountain'), { gold: 400, xp: 360, items: ['clearwater', 'clearwater', 'cratesupply'] }),
  q('q_g_wyrms', 'shardrest', 'Hadd Orsolo', 'Under the Sand', 'Dune wyrms keep rolling under the road. Kill three before they get under the cistern too.', g('kill', 3, 'Slay dune wyrms', 'dunewyrm'), { gold: 640, xp: 500, items: ['quarrycharge', 'quarrycharge', 'w_hammer_4'] }),
  q('q_g_quarry', 'shardrest', 'Hadd Orsolo', 'Scorchglass', 'The Quarrymaster stopped answering the horn. His shift has not stopped. Find out why.', g('clear', 1, 'Defeat Quarrymaster Obsid', 'scorchquarry'), { gold: 760, xp: 620, items: ['u_glass_hound', 'panacea'] }),
  q('q_g_cullet', 'kilnhold', 'Sooty Brannock', 'A Draft in the Racks', 'Cullet drifts through the cooling sheds and cuts the new glass. Twelve swarms. Please.', g('kill', 12, 'Scatter cullet swarms', 'cullet'), { gold: 540, xp: 450, items: ['widowvenom', 'widowvenom', 'a_hands_cloth_4'] }),
  q('q_g_mimics', 'kilnhold', 'Sooty Brannock', 'Standing Panes', 'Some of my finest sheets have stood up and gone for a walk. Break four before they learn doors.', g('kill', 4, 'Shatter mirror mimics', 'mirrormimic'), { gold: 620, xp: 490, items: ['frostwater', 'w_staff_4'] }),
  q('q_g_colossus', 'kilnhold', 'Ana the Lensless', 'The Colossus Does Not See You', 'A great lens-eyed dune walks the Wastes. It looks only at the sun. Make it look at you. Then break it.', g('kill', 1, 'Slay the Silica Colossus', 'silicacolossus'), { gold: 820, xp: 660, items: ['set_glass_body', 'lucid'] }),
];

const events = [
  E('ev_g_fountain', 'The Dry Fountain', 'fountain', 'wild sand glass', 'A basin of fused glass stands at an old crossroads, perfectly dry. Carved around its rim, in a hundred languages, is a single word: Tell.', [
    c('Tell it a truth', 'Say something you have told no one.', [san(10), xpL(0.2), log('The basin fills for a moment with cold, clear water.', 'good')], { check: ck('will'), fail: [san(-6), log('The truth turns out to be the wrong size.', 'bad')] }),
    c('Tell it a lie', 'See what it does.', [goldR(60, 120), corrupt(1), log('The basin pays you for a lie. The coins are warm.', 'bad')]),
    c('Say nothing', 'Some basins are better left empty.', leave)], 'pool'),
  E('ev_g_cairn', 'Cairn of Mirrors', 'm_ruins', 'wild sand glass', 'A tower of tiny mirrors, balanced without mortar. Each shows a different you, all hooded, all faceless, all a half-second out of step.', [
    c('Smash one', 'See which one flinches.', [loot('rare'), san(-5)], { check: ck('cunning'), fail: [hp(-14), log('The shards find you first.', 'bad')] }),
    c('Add your own mirror', 'Leave a piece of yourself for the next traveller.', [san(8), xpL(0.15), log('The tower hums once, grateful.', 'good')], { cost: { supplies: 1 } }),
    c('Walk around it', 'There is nothing to be gained from looking.', leave)], 'mirror'),
  E('ev_g_caravan', 'The Caravan That Waited', 'm_camp', 'wild sand', 'A caravan stands in perfect order at the base of a dune: wagons, camels, tents. Everyone is seated around a fire that burned out years ago, facing east.', [
    c('Search the wagons', 'Dead men do not mind, and the heat is slowly killing the living.', [goldR(70, 140), cons(), rand(0.3, [hp(-10), log('Something in the wagon bites.', 'bad')])]),
    c('Sit with them a moment', 'Face east with the rest.', [san(7), lore(), log('Whatever they waited for, you feel its absence.', 'plain')]),
    c('Leave before dusk', 'The shadows here fall the wrong way.', leave)], 'tent'),
  E('ev_g_mirage', 'A Very Good Mirage', 'fountain', 'wild sand', 'A lake, trees, a city skyline: a mirage so fine you can hear the market. Something in it is waving at you.', [
    c('Walk toward it', 'Trust the thing that waves.', [wild()], { check: ck('will', 12), fail: [san(-8), hp(-12), log('You walk until the heat finds the bottom of you.', 'bad')] }),
    c('Throw a stone into it', 'Mirages hate honesty.', [goldR(40, 90), xpL(0.1), log('The lake shatters. Something lands in the sand.', 'good')]),
    c('Close your eyes and walk on', 'Trust in a compass beats trust in eyes.', leave)], 'pool'),
  E('ev_g_lensroom', 'A Room of Small Suns', 'o_lantern', 'glass', 'A circular room where a hundred lenses on wires aim a hundred beams at a single point on the floor. The floor there is melted, and very beautiful.', [
    c('Step into the focus', 'Burn for knowledge.', [lore(), hp(-18), xpL(0.25)], { check: ck('vigor', 13), fail: [hp(-30), log('The point finds you and stays.', 'bad')] }),
    c('Break a lens', 'The beams bend. Something unlocks.', [loot('rare'), san(-3)]),
    c('Tilt one slightly', 'A small, scholarly kind of vandalism.', [goldR(80, 150), xpL(0.1)], { check: ck('cunning') })], 'crystal'),
  E('ev_g_orchard', 'The Orchard of Light', 'm_tree', 'glass', 'A grove of trees made of grown glass, each fruit a captured sunrise. The air smells faintly of citrus and hot metal.', [
    c('Pick a fruit', 'Be careful. They are sharp.', [cons(2), hp(-8)], { check: ck('cunning'), fail: [hp(-20), log('The fruit bursts into blades.', 'bad')] }),
    c('Eat what has fallen', 'Waste not.', [hpp(25), san(-4), log('It tastes like noon.', 'plain')]),
    c('Water the roots with your canteen', 'Revive something.', [san(6), loot('rare'), log('A single leaf turns green.', 'good')], { cost: { supplies: 2 } })], 'tree'),
  E('ev_g_cistern', 'The Pool That Shows Another Room', 'fountain', 'glass', 'Water on a stone floor, perfectly still. In it you see the room you are standing in, but the door is on a different wall, and open.', [
    c('Use the reflected door', 'Step through the water.', [loot('epic'), san(-6)], { check: ck('will', 13), fail: [hp(-18), log('You hit water and then floor.', 'bad')] }),
    c('Drop a coin in', 'The reflection catches it.', [goldR(100, 160), xpL(0.1)]),
    c('Look away', 'Cheaper that way.', leave)], 'pool'),
  E('ev_g_scribe', 'The Queen’s Last Letter', 'c_letter', 'glass', 'A letter on a stand, in a hand that shakes. “If I cannot look away, someone must look for me. Come to the Palace. Bring a veil. I will not hurt you. I will try.”', [
    c('Read it twice', 'Every word has a second meaning, and it is worse.', [lore(), san(-3), xpL(0.2)]),
    c('Burn it', 'A kindness, or its opposite.', [corrupt(1), san(4), log('The ash curls toward the Palace.', 'bad')]),
    c('Keep it', 'Proof of something.', [item('j_cluster'), log('You tuck it away. It is warm.', 'plain')])], 'book'),
];

const scenes = [
  sc('s_glass_quarry', 'quarry', [
    ['narrator', 'The Quarrymaster’s whip falls from his fused hand. In the pit below, the last lens-cutters finally stop, look up, and see you. One of them, an old woman with a blanket over her shoulders, raises a glass cup in silent thanks.'],
    ['narrator', 'The sheet of raw glass you carry out of the pit is the colour of honey and does not cut anyone. That, in the Wastes, counts as a marvel.', { eff: [xpL(0.3), san(-2)] }],
  ]),
  sc('s_glass_arrive', 'brasshaven', [
    ['narrator', 'The dunes end in a wall of glass. Beyond it, Brasshaven: a dome of brass the colour of an old trumpet, lenses winking on every rooftop, a river of sand-sellers in veils and goggles pouring through the gates. Not one face anywhere. Every traveller is wrapped, masked, hooded against the glare.'],
    ['narrator', 'Somewhere under the noise, a very large lens turns on its axis, and the whole city changes colour for one breath.', { eff: [arc('glass', 1), xpL(0.25)] }],
  ]),
  sc('s_orla_brief', 'brasshaven', [
    ['orla', '“A stranger with an Ilse-coloured key,” Orla says, tapping her loupe. “Do not look surprised. The Seer’s runners reached us a week ago.” She leans in. “There is a thing in the Prism Palace. The old Queen. She has been looking at the Guild for four hundred years and nobody has the courage to say it makes the lenses itch.”'],
    ['orla', '“The Palace is sealed behind three doors. Each is a puzzle of light. Each costs something to open. The Cracked Orangery first, then the Cistern, then the old Grinder in Kilnhold. Then, if you still have your sight, the Queen.”', { choices: [
      ch('“What does she want?”', '3'), ch('“What did she do to the desert?”', '4'), ch('“I’ll start with the Orangery.”', '5')] }],
    ['orla', '“Nothing. That is what makes it terrible. She wants nothing, and she cannot stop watching.”', { id: '3', next: '5' }],
    ['orla', '“She focused the sun. For centuries. The sand went to glass, then the glass went to Guild coin. It was a very profitable century. Then the sun went black, and the lens did not know what to look at.”', { id: '4', next: '5' }],
    ['orla', '“Good. Take this.” She hands you a dark glass visor. “It dims the glare. It does not dim the truth. Nothing does.”', { id: '5', eff: [item('lampoil'), arc('glass', 2), xpL(0.2)] }],
  ]),
  sc('s_glass_orangery', 'orangery', [
    ['narrator', 'The Keeper kneels in the ruin of its own garden. It holds a leaf of glass in both hands, turning it, and as it turns it casts a small rainbow on the wall that fades when you step into it.'],
    ['narrator', 'On a pedestal behind it, a lens the size of a plate hums. Etched round the rim: Look with me.', { eff: [flag('glass_lens1'), xpL(0.3), san(-2)] }],
  ]),
  sc('s_glass_cistern', 'cistern', [
    ['narrator', 'Siltmaw’s last roar empties the Cistern. The water drains in a single breath, and on the bare stone floor the tide leaves a lens, intact, blue as a held breath.'],
    ['narrator', 'When you lift it, the room changes. The ceiling is the sky, and the sky is the Prism Palace seen from above, and the Palace is looking at you. A voice, polite and bone-weary, speaks inside the glass: “Come quickly. I have kept the door closed as long as I could.”', { eff: [flag('glass_lens2'), xpL(0.3), san(-4)] }],
  ]),
  sc('s_ana_key', 'kilnhold', [
    ['ana', '“You carry two lenses,” Ana says, before you have spoken. She holds out her hands without turning her head. “Give them to me. I cannot see them, but I made them. I know their weight.”'],
    ['ana', 'She sets them in a brass ring and turns them against each other. The room fills with a thin, clean, impossible light, and where the beams meet, a key forms out of nothing, made of focus.', { choices: [
      ch('“Why did you make all this for her?”', '3'), ch('“What happens when I reach her?”', '4')] }],
    ['ana', '“Because she asked. Because she was lonely. Because a thing that sees everything has no one to show it to, and I was the only one who ever looked back.”', { id: '3', next: '5' }],
    ['ana', '“She will try to look away and she will not be able to. You will have to help her. It is a very small kindness and a very large violence. I think she would thank you for either.”', { id: '4', next: '5' }],
    ['ana', '“Here. The last door.” The key rests in your palm like a drop of daylight. “Go before the kilns go cold.”', { id: '5', eff: [flag('glass_key'), arc('glass', 6), xpL(0.3), unlock('prismpalace')] }],
  ]),
  sc('s_glass_lens', 'glasswastes', [
    ['narrator', 'The Great Lens lies at an angle in the dunes, a pane the size of a plaza, cracked in a single clean line from rim to rim. You can see yourself in it: a hooded figure, a lantern, no face. Behind your reflection, very far down, a second figure moves.'],
    ['narrator', 'You press the Prism Key to the crack. The glass drinks the light, and a road of focused sun draws itself across the dunes toward the horizon, toward the Palace, narrow as a thread and bright as a sword.', { eff: [arc('glass', 7), xpL(0.35), san(-3)] }],
  ]),
  sc('s_maridel_end', 'prismpalace', [
    ['narrator', 'The Lens-Queen falls to her knees at the foot of her own throne. Her mask of mirrors cracks. The cracks are very beautiful. For the first time in four centuries, she looks away.'],
    ['maridel', '“Thank you,” she says, and there is no performance in it. “Thank you for being someone I did not need to look at.” She lifts the crown from her head with both hands. It is a ring of tiny lenses, each one turned toward a different truth. “It will help you see what is real. It will also, I am afraid, help you see what is not. You will learn which is which. I never did.”', { choices: [
      ch('Take the crown.', '2'), ch('“Why did you keep looking?”', '3')] }],
    ['maridel', '“Because I could. That is the whole of tyranny, you know. Not cruelty. Only ability, left unattended.”', { id: '3', next: '2' }],
    ['narrator', 'The Lens-Crown settles into your hands, light as a held breath. The Great Lens, a hundred miles away, goes dark for the first time in four hundred years. In Brasshaven, every lens on every rooftop turns, together, toward the ground.', { id: '2', eff: [regalia('lens'), arc('glass', 8), xpL(0.6), gold(600), san(-4)] }],
  ]),
  sc('s_orla_after', 'brasshaven', [
    ['orla', '“The lenses are all looking down,” Orla says, awed. “For the first time ever, I can hear my own thoughts.” She presses a heavy brass coin into your palm. “Guild gratitude. It is worth more than it looks. It is also worth more than it weighs.”'],
    ['orla', '“If you go after the others, tell them Brasshaven keeps a bed for anyone who finishes what they started.”'],
  ]),
  sc('s_calder_lumen', 'brasshaven', [
    ['calder', 'Calder sets down his tools. On the bench is a lantern of cut glass, no larger than a heart, and inside it something small and white is turning in place, like a held-breath star. “She woke up when you came in,” he says. “I have been grinding her for forty years. She has never once chosen anyone.”'],
    ['narrator', 'The lantern floats up, circles you twice, and settles at your shoulder, a small bright thing that throws no shadow and wants nothing but to be useful.', { eff: [recruit('Lumen'), xpL(0.2)] }],
  ]),
];

const items = [
  gearItem('reg_lens', 'The Lens-Crown', 'a_gem', 'head', 'mythic', 5, 'Maridel’s ring of lenses. Each is turned toward a different truth. Wearing it, the world is very sharp, and so are you.', { armor: 14, crit: 10, critDmg: 25, sight: 1, will: 5, luck: 8 }, { set: 'regalia' }),
  gearItem('u_glass_hound', 'Obsid’s Hound-Tooth Blade', 'w_curved', 'weapon', 'epic', 4, 'Cut from the quarry’s first sheet. It sings when anyone lies nearby.', { damage: 36, crit: 10, dodge: 4 }),
  ...armorSet('glass', 4, 'epic', {
    head: ['Prism Barbute', 'h_visor', 'A faceted helm with no opening to look through. It does not need one.'],
    body: ['Glasswright Cuirass', 'b_scale', 'Overlapped panes, ground to fit. Light bends around the wearer.'],
    hands: ['Lens-Cutter Gloves', 'g_mailed', 'Safe against the sharpest edge in the world, and quite possibly the sharpest.'],
    feet: ['Dunewalker Greaves', 'f_greaves', 'They do not sink, and they do not skid on glass.'],
  }, { head: { crit: 2, sight: 0 }, body: { maxHp: 3, armor: 0 }, hands: { crit: 1, dodge: 1 }, feet: { dodge: 2, maxHp: 1 } }),
];

export const GLASS: RegionPack = {
  id: 'glass',
  zone: { id: 'glass', name: 'The Glasswastes', at: [76, 22], lvl: 26, pool: ['glassscarab', 'shardjackal', 'miragedancer', 'dunewyrm', 'heliosentry'], biome: 'sand', elite: 'silicacolossus', bg: 'glasswastes', fx: 'dust' },
  towns, dungeons, landmarks, enemies, quests, events, scenes, items,
  links: [['emberhollow', 'brasshaven'], ['brasshaven', 'shardrest'], ['brasshaven', 'kilnhold'], ['brasshaven', 'orangery'], ['brasshaven', 'mirage'], ['kilnhold', 'prismpalace'], ['shardrest', 'scorchquarry']],
  speakers: {
    orla: { name: 'Orla Brasswick', title: 'Guildmistress', icon: 'e_gearmask', color: '#ffc880', look: 'mask' },
    ana: { name: 'Ana the Lensless', title: 'Last of the Queen’s Grinders', icon: 'e_hermit', color: '#e8e0c8', look: 'veil' },
    maridel: { name: 'Maridel', title: 'The Lens-Queen', icon: 'e_crowned', color: '#ffd8a0', look: 'crown' },
    calder: { name: 'Calder Veyn', title: 'Glass-Cutter', icon: 'e_dwarf', color: '#d8c8b0', look: 'cowl' },
  },
  arc: {
    id: 'glass', title: 'The Lens-Crown', region: 'glass', lvl: 24, regalia: 'lens',
    blurb: 'Four centuries ago the second Regent ruled by seeing. She still cannot look away.',
    steps: [
      { title: 'The Guildmistress', obj: 'Speak with Orla Brasswick in Brasshaven.', text: 'Brasshaven’s Opticians’ Guild knows what sleeps in the Prism Palace. Orla will tell you how to reach it.', at: 'brasshaven' },
      { title: 'The Cracked Orangery', obj: 'Enter the Cracked Orangery and defeat its Keeper.', text: 'The first of three keys is a lens in a ruined glass garden.', at: 'orangery', goal: g('clear', 1, 'Defeat the Glasshouse Keeper', 'orangery') },
      { title: 'Shards for the Guild', obj: 'Clear the Scorchglass Quarry and defeat Quarrymaster Obsid.', text: 'The Guild needs raw shard-glass, and the quarry that cuts it has gone silent. Find out why.', at: 'scorchquarry', goal: g('clear', 1, 'Defeat Quarrymaster Obsid', 'scorchquarry') },
      { title: 'The Mirage Cistern', obj: 'Enter the Mirage Cistern and defeat Siltmaw.', text: 'The second lens lies in a drowned vault under the dunes.', at: 'mirage', goal: g('clear', 1, 'Defeat Siltmaw', 'mirage') },
      { title: 'The Last Grinder', obj: 'Take both lenses to Ana the Lensless in Kilnhold.', text: 'Only the Queen’s own grinder can fuse them into a key.', at: 'kilnhold' },
      { title: 'The Great Lens', obj: 'Reach the Great Lens in the dunes.', text: 'The key must be aimed through the old Great Lens to find the Palace road.', at: 'prismpalace', goal: g('reach', 1, 'Reach the Great Lens', 'greatlens') },
      { title: 'The Prism Palace', obj: 'Enter the Prism Palace and face Maridel, the Lens-Queen.', text: 'Five floors of mirrors, and a Queen who has not looked away since before the sun died.', at: 'prismpalace', goal: g('clear', 1, 'Defeat the Lens-Queen', 'prismpalace') },
    ],
  },
  triggers: [{ loc: 'brasshaven', cond: { mainAt: 'r00' }, scene: 's_glass_arrive' }],
  schools: { brasshaven: ['Glass', 'Astral', 'Steel'] },
  sets: {
    glass: { name: 'Glasswright’s Panoply', two: { crit: 8, sight: 1 }, four: { crit: 10, dodge: 8, armor: 12, critDmg: 25 }, blurb: 'Ground to the angle at which the Queen first looked away.' },
    regalia: { name: 'The Six Regalia', two: { damage: 8, armor: 10, will: 3 }, four: { damage: 14, maxHp: 80, will: 5, luck: 12, crit: 8 }, blurb: 'Each Regent’s crown of rule. Together they remember what it was for.' },
  },
  bossLoot: { glasshousekeeper: ['set_glass_head'], siltmaw: ['set_glass_feet'], obsid: ['u_glass_hound'], maridel: ['set_glass_body', 'set_glass_hands'] },
};
