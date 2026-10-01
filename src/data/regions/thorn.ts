import { E, FULL, aff, armorSet, arc, c, ch, ck, corrupt, dg, en, flag, g, gold, goldR, gearItem, hp, hpp, item, leave, log, loot, lore, npc, q, recruit, regalia, san, sc, town, tt, unlock, wild, xpL } from '../kit';
import type { RegionPack } from './pack';

const TW = 'thorn';

const towns = [
  town({
    id: 'mirewick', name: 'Mirewick', kind: 'city', subtitle: 'The City in the Hedge', region: TW, pos: [76, 40], icon: 'm_city', art: 'mirewick', tier: 5,
    desc: 'A city of lashed timber and trained vine built inside a living hedge-wall forty feet thick. The streets are hallways. The ceilings are leaves. Everything is pruned, politely, to fit.',
    theme: tt('#08140a', '#9ad868', '#e0f4c0'), services: FULL, shopTags: ['spear', 'whip', 'crossbow', 'medium', 'potion', 'cloth'],
    rumors: ['The Hedge-Wardens trim the road every dawn. If you are standing on it, they trim around you, eventually.', 'The Heartbriar has a heartbeat. Mirewick sets its clocks by it.', 'A child planted a bean at the city gate. By morning there was a staircase, and by evening a very polite landlord.', 'The Gardener never ruled with a sword. He ruled with a list, and the list was always growing.'],
    npcs: [
      npc('ysmay', 'Ysmay Thorne', 'Head Hedge-Warden', 'e_ninja', 'A lean woman in a cloak of stitched leaves. Her shears are longer than her forearm, and she handles them like pens.', ['“Mind the green. It minds you.”', '“Pruning is mercy. Nobody believes that until the third spring.”', '“Everything in Thornwick is a garden, Wayfarer. The only question is who is holding the shears.”'], [{ cond: { arc: ['thorn', 1] }, scene: 's_ysmay_brief' }, { cond: { arcMin: ['thorn', 8] }, scene: 's_ysmay_after' }], 'hood'),
      npc('oskar', 'Pruner Oskar', 'Master Pruner', 'e_miner', 'A gentle old man with soil in every crease and a ladder strapped to his back.', ['“Cut at the node, never between. Between leaves a stub, and a stub rots.”', '“I have pruned this city for sixty years. It has not yet learned to say thank you.”']),
      npc('tillie', 'Tillie Greenhand', 'Herbalist', 'e_witch', 'A young woman wearing a hat that has opinions and a belt of small jars.', ['“Foxglove for the heart, nightshade for the other thing. Do not mix up the labels. I did once.”']),
    ],
  }),
  town({
    id: 'bramblegate', name: 'Bramblegate', kind: 'village', subtitle: 'The Trellis Gate', region: TW, pos: [66, 36], icon: 'm_town', art: 'thornwick', tier: 5,
    desc: 'A village strung along a trellis arch two hundred paces long. Travellers walk through it in silence, because the plants listen.',
    theme: tt('#0a160c', '#a8e070', '#e8f8c8'), shopTags: ['potion', 'bomb', 'medium'],
    rumors: ['The arch has a toll, and it is paid in leaves.', 'The scarecrows in the Scarecrow Court are not scarecrows. They are very patient.'],
    npcs: [npc('wilm', 'Wilm the Gatekeeper', 'Keeper of the Trellis', 'e_goblin', 'A short man in a hat of woven vine who counts everyone who goes through. Twice.', ['“One in, one out. If I count wrong, the arch notices.”'])],
  }),
  town({
    id: 'lowmire', name: 'Lowmire', kind: 'village', subtitle: 'A Hamlet on Stilts', region: TW, pos: [84, 45], icon: 'm_town', art: 'lowmire', tier: 5,
    desc: 'Huts on stilts over a black bog, lit by glowing blooms the villagers keep in jars. It smells of rot and flowers, and the flowers are winning.',
    theme: tt('#071009', '#8ae890', '#d8ffd0'), shopTags: ['potion', 'cloth', 'staff'],
    rumors: ['The lanternblooms follow children home. Parents are of two minds about it.', 'Something walks the bog at night, tall and slow, tending the water.'],
    npcs: [npc('fenn', 'Fenn Seedwright', 'Keeper of Seeds', 'e_hermit', 'A bent figure in a mask of woven reeds, scattering seed over the water as if it were a conversation.', ['“Everything planted here wants to be a tree. Most should be allowed.”', '“The Gardener is not cruel. He is thorough. It is much worse.”'], [{ cond: { arc: ['thorn', 5] }, scene: 's_fenn_seed' }], 'mask')],
  }),
];

const dungeons = [
  dg({ id: 'sunkenmaze', name: 'The Sunken Maze', subtitle: 'A hedge-maze that grew a roof', desc: 'A labyrinth of living walls, drowned to the knee. The paths rearrange when you blink, and sometimes when you do not.', art: 'thornwick', theme: 'thorn', floors: 3, lvl: 30, enemies: ['briarhound', 'thornback', 'mosswalker', 'pollencloud'], elite: 'hedgeguard', boss: 'mazekeeper', size: [29, 21], pos: [68, 44], icon: 'm_deadtree', secretItem: 'u_thorn_vest' }),
  dg({ id: 'conservatory', name: 'The Overgrown Conservatory', subtitle: 'A glasshouse where something went on growing', desc: 'The Gardener’s first greenhouse. The glass is cracked open and the plants walked out. A few came back to see who had been in their garden.', art: 'conservatory', theme: 'thorn', floors: 3, lvl: 29, enemies: ['briarhound', 'seedsower', 'lanternbloom', 'strangler'], elite: 'thornlord', boss: 'bloomtyrant', size: [29, 21], pos: [70, 34], cond: { arcMin: ['thorn', 2] }, clear: 's_thorn_conservatory', icon: 'm_ruins' }),
  dg({ id: 'prunehalls', name: 'The Pruning Halls', subtitle: 'Where dissent was trimmed to shape', desc: 'Long, tidy corridors of hedge-wall, trimmed to the width of a single person. At every corner, a bench. At every bench, a pair of shears.', art: 'thornwick', theme: 'thorn', floors: 3, lvl: 31, enemies: ['scythehand', 'topiaryknight', 'hedgeguard', 'carrionrook', 'lichenwraith'], elite: 'thornlord', boss: 'headpruner', size: [31, 23], pos: [88, 38], cond: { arcMin: ['thorn', 4] }, clear: 's_thorn_prune', icon: 'm_dungeon' }),
  dg({ id: 'heartbriar', name: 'The Heartbriar', subtitle: 'The root of the whole hedge', desc: 'A single bramble, three miles across, with a chamber at its heart where the Gardener tends a seat of living thorn. The chamber is warm. The thorns are warmer.', art: 'heartbriar', theme: 'thorn', floors: 5, lvl: 33, enemies: ['scythehand', 'strangler', 'topiaryknight', 'lanternbloom', 'rootmaw'], elite: 'strangleking', boss: 'hobthessaly', size: [33, 25], pos: [90, 46], cond: { arcMin: ['thorn', 7] }, clear: 's_hob_end', mainBoss: true, icon: 'm_castle' }),
];

const landmarks = [
  { id: 'firstgrove', name: 'The First Grove', icon: 'm_tree', pos: [80, 35] as [number, number], scene: 's_thorn_grove', lvl: 32, cond: { arc: ['thorn', 6] as [string, number] }, hint: 'A ring of trees older than the hedge stands in a clearing. Something is missing from the middle.' },
  { id: 'weepingtrellis', name: 'The Weeping Trellis', icon: 'm_ruins', pos: [72, 45] as [number, number], event: 'ev_t_trellis', once: true, lvl: 31 },
  { id: 'scarecrowcourt', name: 'The Scarecrow Court', icon: 'tombstone', pos: [86, 34] as [number, number], event: 'ev_t_scarecrows', once: true, lvl: 32 },
];

const enemies = [
  en('briarhound', 'Briar Hound', 'e_hound', 'skirmisher', 'beast plant', ['attack', 'afflict', 'attack'], 'A hound grown rather than born, with a coat of living thorns that grow back when he sheds.', { ...aff('bleed'), look: 'quad' }),
  en('thornback', 'Thornback Crawler', 'e_beetle', 'tank', 'beast plant', ['guard', 'attack', 'heavy'], 'A beetle the size of a cart, carrying a hedge on its shell.', { look: 'crawler' }),
  en('mosswalker', 'Mosswalker', 'e_eviltree', 'brute', 'plant', ['attack', 'heavy', 'afflict'], 'A walking carpet of moss around a framework of branches. It is polite, and enormous, and does not understand doors.', { ...aff('weak'), look: 'plant' }),
  en('pollencloud', 'Pollen Cloud', 'e_butterfly', 'swarm', 'plant', ['afflict', 'attack', 'afflict'], 'A drift of seed and dust that wants to be somewhere else, preferably in your lungs.', { ...aff('poison'), look: 'swarm' }),
  en('seedsower', 'Seed-Sower', 'e_hooded', 'caster', 'human plant', ['afflict', 'dread', 'attack'], 'A veiled sower in a coat of leaves. What he scatters grows in anything warm.', { ...aff('poison'), dread: 2, look: 'hood+veil' }),
  en('lanternbloom', 'Lanternbloom', 'e_wisp', 'caster', 'plant spirit', ['dread', 'attack', 'dread'], 'A pale flower that glows like a window. It follows people home, and then redecorates.', { dread: 3, look: 'plant' }),
  en('strangler', 'Strangler Vine', 'e_hydra', 'brute', 'plant', ['heavy', 'afflict', 'attack'], 'It does not hunt. It waits, and then it is the only place left to stand.', { ...aff('weak'), look: 'plant' }),
  en('carrionrook', 'Hedge Rook', 'e_raven', 'skirmisher', 'beast', ['attack', 'attack', 'afflict'], 'A black bird that nests in the pruned wounds of the hedge, and has opinions about trespassers.', { ...aff('bleed'), look: 'winged' }),
  en('scythehand', 'Scythe-Hand', 'e_reaper', 'brute', 'human plant', ['heavy', 'attack', 'afflict'], 'A hedge-warden in a hood of woven leaves, one arm replaced by a long curved blade. He prunes in straight lines.', { ...aff('bleed'), look: 'hood+mask' }),
  en('topiaryknight', 'Topiary Knight', 'e_knight', 'tank', 'construct plant', ['guard', 'heavy', 'attack'], 'A boxwood knight clipped to the exact shape of someone the Gardener once admired.', { look: 'armor' }),
  en('hedgeguard', 'Hedge-Guard', 'e_soldier', 'tank', 'human plant elite', ['guard', 'heavy', 'dread'], 'A warden in a barbed cuirass, immovable as a bramble and just as welcoming.', { dread: 2, look: 'armor' }),
  en('lichenwraith', 'Lichen Wraith', 'e_ghost', 'caster', 'spirit plant', ['afflict', 'dread', 'attack'], 'The ghost of something that was pruned too late.', { ...aff('weak'), dread: 2 }),
  en('rootmaw', 'Rootmaw', 'e_wormmouth', 'brute', 'plant', ['heavy', 'afflict', 'heavy'], 'A mouth that grew out of the ground to ask a question and was too impatient to wait for the answer.', { ...aff('bleed'), look: 'worm' }),
  en('thornlord', 'Thorn-Lord', 'e_barbarian', 'brute', 'human plant elite', ['heavy', 'attack', 'afflict', 'heavy'], 'A knight whose armor has grown through him, so the thorns on the inside are his own.', { ...aff('bleed'), look: 'armor+crown' }),
  en('strangleking', 'Strangle-King', 'e_hydra', 'brute', 'plant elite', ['heavy', 'afflict', 'heavy', 'guard'], 'A knot of vine the size of a barn, wearing a crown of its own prey.', { ...aff('weak'), look: 'plant' }),
  en('mazekeeper', 'The Maze-Keeper', 'e_minotaur', 'brute', 'beast plant boss', ['heavy', 'attack', 'heavy', 'afflict'], 'The thing that lives at the centre of every maze. In this one, it is mostly hedge.', { hpMul: 4, ...aff('bleed'), look: 'titan' }),
  en('bloomtyrant', 'The Bloom Tyrant', 'e_eviltree', 'caster', 'plant boss', ['dread', 'heavy', 'afflict', 'guard'], 'A flower grown to the size of a house, in the middle of a greenhouse it has outgrown. It wants to be admired.', { hpMul: 4.2, dread: 3, ...aff('poison'), look: 'plant' }),
  en('headpruner', 'The Head Pruner', 'e_reaper', 'brute', 'human plant boss', ['heavy', 'attack', 'afflict', 'guard'], 'The Gardener’s right hand. A tall veiled figure with shears of living wood, who has never once cut anything crooked.', { hpMul: 4, ...aff('bleed'), look: 'hood+veil' }),
  en('hobthessaly', 'Hob Thessaly, the Gardener', 'e_crowned', 'caster', 'human plant boss', ['dread', 'heavy', 'afflict', 'guard', 'heavy'], 'Third Regent of the Meridian. He ruled by tending, and he tended until the garden was the only thing left to rule.', { hpMul: 5.2, dread: 4, ...aff('poison'), look: 'king' }),
];

const quests = [
  q('q_t_hounds', 'mirewick', 'Ysmay Thorne', 'The Hedge Has Dogs', 'Briar hounds have been coming through the walls at night. Kill ten before they teach the pups.', g('kill', 10, 'Slay briar hounds', 'briarhound'), { gold: 700, xp: 640, items: ['restorative', 'w_spear_5'] }),
  q('q_t_walkers', 'mirewick', 'Pruner Oskar', 'Mind the Moss', 'The mosswalkers have wandered onto the city road. Move six of them along. Permanently.', g('kill', 6, 'Fell mosswalkers', 'mosswalker'), { gold: 720, xp: 660, items: ['panacea', 'a_feet_medium_5'] }),
  q('q_t_blooms', 'mirewick', 'Tillie Greenhand', 'Lanternblooms for the Jar', 'I need eight lanternblooms for a very large order of very small lamps. Do not be sentimental.', g('kill', 8, 'Pluck lanternblooms', 'lanternbloom'), { gold: 760, xp: 690, items: ['lucid', 'j_thorns'] }),
  q('q_t_scythe', 'mirewick', 'Ysmay Thorne', 'Strays in the Hedge', 'Some of my own wardens have gone over to the Gardener. Cut down six Scythe-Hands.', g('kill', 6, 'Defeat scythe-hands', 'scythehand'), { gold: 800, xp: 720, items: ['x_charm_5', 'bloodwine'] }),
  q('q_t_elite', 'mirewick', 'Pruner Oskar', 'The Biggest Weeds', 'There are named weeds in the Overgrowth. Pull three by the root.', g('elites', 3, 'Slay elite foes'), { gold: 880, xp: 760, items: ['recollection', 'x_gemring_5'] }),
  q('q_t_events', 'mirewick', 'Tillie Greenhand', 'Field Notes', 'Bring me five stories from the Overgrowth. I will turn them into tea.', g('events', 5, 'Survive strange encounters'), { gold: 620, xp: 600, items: ['folio', 'j_pearls'] }),
  q('q_t_trellis', 'bramblegate', 'Wilm the Gatekeeper', 'The Weeping Trellis', 'There is a trellis in the south that weeps sap. The sap is not a good colour. See what it wants.', g('reach', 1, 'Visit the Weeping Trellis', 'weepingtrellis'), { gold: 520, xp: 560, items: ['clearwater', 'clearwater', 'cratesupply'] }),
  q('q_t_maze', 'bramblegate', 'Wilm the Gatekeeper', 'The Maze Is Hungry', 'A maze has grown in the lowlands, and travellers keep going into it. Put the Keeper down.', g('clear', 1, 'Defeat the Maze-Keeper', 'sunkenmaze'), { gold: 900, xp: 800, items: ['u_thorn_vest', 'lifeblood'] }),
  q('q_t_rooks', 'bramblegate', 'Wilm the Gatekeeper', 'Pests Upon the Arch', 'Rooks roost on my arch and drop things. Thirteen is the usual number.', g('kill', 13, 'Chase off hedge rooks', 'carrionrook'), { gold: 680, xp: 620, items: ['nightshade', 'nightshade', 'a_head_medium_5'] }),
  q('q_t_cloud', 'lowmire', 'Fenn Seedwright', 'Seed and Smoke', 'Pollen clouds drift over the bog and sicken the stilts. Break up eight of them.', g('kill', 8, 'Disperse pollen clouds', 'pollencloud'), { gold: 650, xp: 610, items: ['salts', 'salts', 'a_hands_cloth_5'] }),
  q('q_t_knights', 'lowmire', 'Fenn Seedwright', 'A Clipped Court', 'Topiary Knights stand guard on every path. Five, laid low, and I can sleep.', g('kill', 5, 'Topple topiary knights', 'topiaryknight'), { gold: 840, xp: 740, items: ['quarrycharge', 'w_mace_5'] }),
  q('q_t_strangler', 'lowmire', 'Fenn Seedwright', 'Cut the Strangler', 'A Strangle-King has taken root north of the bog. A single stroke at the heart.', g('kill', 1, 'Slay the Strangle-King', 'strangleking'), { gold: 960, xp: 840, items: ['set_thorn_body', 'lucid'] }),
];

const events = [
  E('ev_t_trellis', 'The Weeping Trellis', 'm_ruins', 'wild thorn', 'A wooden trellis taller than a house, wrapped in vine that bleeds green sap from every node. The sap collects in a stone basin, and in the basin something rises and falls like a breath.', [
    c('Taste the sap', 'Be brave, or at least curious.', [hpp(30), san(-5), log('It tastes like a very good garden.', 'good')], { check: ck('vigor', 13), fail: [hp(-18), log('The garden remembers its manners.', 'bad')] }),
    c('Bottle some', 'Tillie would pay well.', [item('clearwater', 2), goldR(60, 110)], { cost: { supplies: 1 } }),
    c('Cut the trellis down', 'End the weeping.', [loot('rare'), corrupt(1), log('The trellis falls with a sound like a sigh.', 'bad')])], 'tree'),
  E('ev_t_scarecrows', 'The Scarecrow Court', 'tombstone', 'wild thorn', 'Forty scarecrows stand in a circle around a throne of woven straw. None of them is a scarecrow. All of them are patiently pretending.', [
    c('Bow to the throne', 'Manners cost nothing here.', [san(8), xpL(0.15), log('The circle shifts, approving.', 'good')]),
    c('Search the throne', 'The pretenders watch.', [goldR(100, 180), loot('rare')], { check: ck('cunning', 13), fail: [wild('elite')] }),
    c('Walk through them', 'Do not slow down.', leave)], 'figure'),
  E('ev_t_gardener', 'The Gardener’s Tea', 'c_pot', 'wild thorn', 'A small table set for one in the middle of the path. A pot of green tea steams. A card reads: “Please. Sit. You look like you have been pruned by life.”', [
    c('Drink the tea', 'Courtesy, the Gardener’s weapon.', [hpp(40), san(10), corrupt(1), log('It is the best tea you have ever had.', 'good')]),
    c('Pour it on the roots', 'The roots seem pleased.', [xpL(0.2), loot('rare')]),
    c('Leave the card', 'You were never here.', leave)], 'candles'),
  E('ev_t_swarm', 'A Wall of Pollen', 'm_tree', 'wild thorn', 'A golden wall of pollen crosses the road, so thick you could lean on it. Through it you can hear very faint, polite humming.', [
    c('Wait it out', 'Pollen settles.', [san(-3), hpp(10)], { cost: { supplies: 1 } }),
    c('Push through', 'Hold your breath.', [goldR(60, 120), xpL(0.1)], { check: ck('vigor', 13), fail: [hp(-16), wild()] }),
    c('Burn it', 'A terrible idea, executed efficiently.', [corrupt(1), loot('rare'), hp(-12)])], 'tree'),
  E('ev_t_greenhouse', 'A Greenhouse Without Plants', 'm_ruins', 'thorn', 'A small greenhouse, every pane intact, no plants inside. Every pot is empty, every label is in your handwriting.', [
    c('Read the labels', 'They are lists. They are all lists of you.', [lore(), san(-5), xpL(0.2)]),
    c('Plant something', 'Add a seed, any seed.', [loot('rare'), san(5)], { cost: { supplies: 1 } }),
    c('Break a pane', 'Let the air in.', [goldR(70, 140), hp(-10)])], 'crystal'),
  E('ev_t_bench', 'A Pruner’s Bench', 'tablet', 'thorn', 'A stone bench under a clipped arch. On it, a pair of shears and a handwritten note: “Leave them here and take what you need.”', [
    c('Take the shears', 'They are very sharp.', [item('x_charm_5'), corrupt(1)]),
    c('Leave a coin', 'A fair trade.', [goldR(70, 120), item('bandage', 2), gold(-30)]),
    c('Sit and rest', 'It is a very good bench.', [hpp(25), san(8)], { cost: { supplies: 1 } })], 'stone'),
  E('ev_t_roots', 'The Roots Beneath', 'm_deadtree', 'thorn', 'The floor ahead is a lattice of roots, humming. Between them, glimpses of something pale and warm moving in the dark.', [
    c('Climb through', 'Careful with the grip.', [loot('rare'), xpL(0.15)], { check: ck('cunning', 13), fail: [hp(-18), log('The roots take a keepsake.', 'bad')] }),
    c('Cut a way', 'Hurt the garden.', [goldR(80, 150), corrupt(1)]),
    c('Wait', 'They sometimes rearrange.', [san(-3)])], 'tree'),
  E('ev_t_seedbed', 'A Seed-Bed of Names', 'm_camp', 'thorn', 'A bed of rich black soil, in which dozens of small stones are planted, each carved with a name. Some have sprouted.', [
    c('Water one', 'Be kind to a stranger.', [san(8), xpL(0.15), log('A very small green shoot unfurls.', 'good')], { cost: { supplies: 1 } }),
    c('Read the names', 'You find your own, still waiting.', [lore(), san(-6)]),
    c('Dig one up', 'Wake someone.', [loot('epic'), corrupt(1)])], 'stone'),
];

const scenes = [
  sc('s_thorn_arrive', 'mirewick', [
    ['narrator', 'The road narrows to a lane, and the lane to a tunnel, and then you are inside the hedge. Walls of living green forty feet thick, lit from within by lanterns hung on thorns. Mirewick: the city you cannot see until you are in it. Pruners on ladders wave to you, politely, with shears.'],
    ['narrator', 'In the middle distance, something very large breathes. The city leans toward it the way a plant leans toward a window.', { eff: [arc('thorn', 1), xpL(0.25)] }],
  ]),
  sc('s_ysmay_brief', 'mirewick', [
    ['ysmay', '“You are the Seer’s Wayfarer,” Ysmay says, not as a question. She oils her shears while she talks. “I will be brief, because the hedge is not. The Gardener, Hob Thessaly, has been tending the Heartbriar for four hundred years. We trim, we weed, we survive. He is not our enemy. He is our landlord.”'],
    ['ysmay', '“But he is tending the wrong thing now. The hedge is growing faster than we can prune it. It will eat the road by midsummer and the city by autumn. Go down into his Overgrown Conservatory. There is a Bloom Tyrant at the bottom. Cut it down. Take the first seed.”', { choices: [
      ch('“What is the Gardener’s plan?”', '3'), ch('“And if I refuse?”', '4'), ch('“I’ll start at the Conservatory.”', '5')] }],
    ['ysmay', '“A garden without a gardener is a jungle. A gardener without a garden is a king. He picked king.”', { id: '3', next: '5' }],
    ['ysmay', '“Then you walk away, and I trim your trail from the city’s memory. It is gentler than it sounds.”', { id: '4', next: '5' }],
    ['ysmay', '“Good. Take this, a gardener’s knife. If something grabs you, cut it at the node, never between.”', { id: '5', eff: [item('pitchbomb', 2), arc('thorn', 2), xpL(0.2)] }],
  ]),
  sc('s_thorn_conservatory', 'conservatory', [
    ['narrator', 'The Bloom Tyrant folds, petal by petal, like a hand closing. At its heart, among the stamens, lies a single seed the size of a fist, warm to the touch, humming a note you have heard in your sleep.'],
    ['narrator', 'The seed does not want to be carried. It wants to be planted. For a moment you hold the idea of an entire forest in one hand, and then the moment passes, and the seed settles into your pack and is only a seed.', { eff: [flag('thorn_seed1'), xpL(0.3), san(-2)] }],
  ]),
  sc('s_thorn_prune', 'thornwick', [
    ['narrator', 'The Head Pruner’s shears fall from his hands and stand upright in the floor. The long hedge-corridors begin, slowly, to grow. Branches arch over the benches. Moss spreads over the stones. In ten minutes the Pruning Halls will be a wood.'],
    ['narrator', 'On a bench at the far end, a note, in tidy script: “I only ever did what I was asked. Please remember that someone asked.” Beneath it, a second seed, cold and bright.', { eff: [flag('thorn_seed2'), xpL(0.3), san(-3)] }],
  ]),
  sc('s_fenn_seed', 'lowmire', [
    ['fenn', '“Two seeds,” Fenn says, kneeling at the edge of the water. “Plant one in the bog and one in the firm ground, and see which grows. No. Do not look at me like that. I am a gardener. It is how we think.”'],
    ['fenn', 'The seeds sink. For a long, bright moment nothing happens, and then the water parts, and from the black mud rises a single sapling, no taller than your hand, wrapped in a ring of tiny golden thorns. It walks out of the bog and stands at your boot.', { choices: [
      ch('“What is it?”', '3'), ch('“Does it have a name?”', '4')] }],
    ['fenn', '“Hope, mostly. And a will to live. Take it. It will tell you where to go.”', { id: '3', next: '5' }],
    ['fenn', '“Bramble. It picked it itself. I just write the labels.”', { id: '4', next: '5' }],
    ['narrator', 'The sapling climbs your boot, up the lantern pole, and perches on your shoulder, delighted. Far to the north, the First Grove draws a breath.', { id: '5', eff: [recruit('Bramble'), arc('thorn', 6), xpL(0.3), unlock('heartbriar')] }],
  ]),
  sc('s_thorn_grove', 'thornwick', [
    ['narrator', 'The First Grove is a ring of seven oaks around an empty circle of black earth. Seven oaks, and one hollow where an eighth has been pulled out by the roots. Bramble shivers on your shoulder.'],
    ['narrator', 'You plant both seeds in the circle. The earth takes them like water takes a stone. The Grove shudders, and a road of green light unspools through the hedge toward the Heartbriar, wide enough for one person and their sapling.', { eff: [arc('thorn', 7), xpL(0.35), san(-3)] }],
  ]),
  sc('s_hob_end', 'heartbriar', [
    ['narrator', 'Hob Thessaly sinks into his seat of thorns, and the thorns, for the first time in four hundred years, let go. He is a tall, thin man in a coat of woven leaves, face hidden by a hood of living moss. He holds a sickle of green glass in both hands.'],
    ['hob', '“A very good prune,” he says, softly. “Clean at the node. Nothing left to rot.” He lifts the sickle toward you, hilt first. “I was not unkind. I want you to know that. I was only so very, very careful. Everything I loved was a garden, and a garden needs a gardener, and a gardener needs a gate, and a gate needs a wall, and a wall needs a guard, and one day you look up, and it is all walls.”', { choices: [
      ch('Take the Sickle-Scepter.', '2'), ch('“What should I have done differently?”', '3')] }],
    ['hob', '“Let it get away from you, a little. Not too far. Just enough to be surprised.”', { id: '3', next: '2' }],
    ['narrator', 'The Sickle-Scepter hums in your hand like a held note. Behind you, the Heartbriar exhales, and a thousand thorns fall away, and in the clearing where the throne stood, a single white flower opens.', { id: '2', eff: [regalia('sickle'), arc('thorn', 8), xpL(0.6), gold(800), san(-4)] }],
  ]),
  sc('s_ysmay_after', 'mirewick', [
    ['ysmay', '“The hedge is growing again,” Ysmay says, awed. “Properly. In its own way. It is a mess. It is the best thing I have ever seen.” She hands you a bundle of leaves tied with thread. “Mirewick keeps your name in its walls. Come back and we will grow you something.”'],
  ]),
];

const items = [
  gearItem('reg_sickle', 'The Sickle-Scepter', 'w_scythe', 'weapon', 'mythic', 7, 'Hob Thessaly’s green-glass sickle. It cuts at the node and never between. The wound heals as a flower.', { damage: 64, crit: 12, lifesteal: 5, will: 4, thorns: 5 }, { set: 'regalia' }),
  gearItem('u_thorn_vest', 'Maze-Keeper’s Vest', 'b_vest', 'body', 'epic', 5, 'Woven from a hedge that remembers every path it ever blocked.', { armor: 30, maxHp: 28, dodge: 6, thorns: 6 }),
  ...armorSet('thorn', 5, 'epic', {
    head: ['Briarthorn Crown', 'h_horned', 'A circlet of live thorn. It was a gift. It was a sentence.'],
    body: ['Hedgewarden Cuirass', 'b_spiked', 'Barbed plates grown to the shape of your ribs.'],
    hands: ['Pruner’s Gauntlets', 'g_claw', 'Gloves whose fingers end in shears.'],
    feet: ['Mosswalk Boots', 'f_medium', 'They soften the ground before you step.'],
  }, { head: { thorns: 1, maxSanity: 2 }, body: { maxHp: 3, thorns: 1 }, hands: { crit: 1, thorns: 1 }, feet: { dodge: 2, maxHp: 1 } }),
];

export const THORN: RegionPack = {
  id: 'thorn',
  zone: { id: 'thorn', name: 'Thornwick', at: [78, 40], lvl: 31, pool: ['briarhound', 'thornback', 'mosswalker', 'seedsower', 'strangler'], biome: 'thorn', elite: 'thornlord', bg: 'thornwick' },
  towns, dungeons, landmarks, enemies, quests, events, scenes, items,
  links: [['brasshaven', 'mirewick'], ['mirewick', 'bramblegate'], ['mirewick', 'lowmire'], ['mirewick', 'conservatory'], ['mirewick', 'prunehalls'], ['lowmire', 'heartbriar'], ['bramblegate', 'sunkenmaze']],
  speakers: {
    ysmay: { name: 'Ysmay Thorne', title: 'Head Hedge-Warden', icon: 'e_ninja', color: '#a8e070', look: 'hood' },
    fenn: { name: 'Fenn Seedwright', title: 'Keeper of Seeds', icon: 'e_hermit', color: '#d0e8a0', look: 'mask' },
    hob: { name: 'Hob Thessaly', title: 'The Gardener', icon: 'e_crowned', color: '#c8e8a0', look: 'cowl' },
  },
  arc: {
    id: 'thorn', title: 'The Sickle-Scepter', region: 'thorn', lvl: 29, regalia: 'sickle',
    blurb: 'The Gardener ruled by tending, until the garden was the only thing left to rule.',
    steps: [
      { title: 'The Head Hedge-Warden', obj: 'Speak with Ysmay Thorne in Mirewick.', text: 'The hedge is growing faster than the city can prune. Ysmay knows where it begins.', at: 'mirewick' },
      { title: 'The Overgrown Conservatory', obj: 'Defeat the Bloom Tyrant in the Overgrown Conservatory.', text: 'The first seed lies at the heart of a ruined glasshouse.', at: 'conservatory', goal: g('clear', 1, 'Defeat the Bloom Tyrant', 'conservatory') },
      { title: 'Cut Back the Wild', obj: 'Slay twelve plant creatures in Thornwick.', text: 'The Hedge-Wardens cannot spare anyone. Thin the green.', at: 'mirewick', goal: g('killTag', 12, 'Slay plant creatures', 'plant') },
      { title: 'The Pruning Halls', obj: 'Defeat the Head Pruner in the Pruning Halls.', text: 'The second seed is kept by the Gardener’s right hand.', at: 'prunehalls', goal: g('clear', 1, 'Defeat the Head Pruner', 'prunehalls') },
      { title: 'The Keeper of Seeds', obj: 'Bring both seeds to Fenn Seedwright in Lowmire.', text: 'Fenn can wake what the seeds are for.', at: 'lowmire' },
      { title: 'The First Grove', obj: 'Plant the seeds in the First Grove.', text: 'Seven oaks, one hollow. The hollow is waiting.', at: 'heartbriar', goal: g('reach', 1, 'Reach the First Grove', 'firstgrove') },
      { title: 'The Heartbriar', obj: 'Enter the Heartbriar and face Hob Thessaly, the Gardener.', text: 'Five floors of thorn, and at the heart a man who only wanted to be careful.', at: 'heartbriar', goal: g('clear', 1, 'Defeat the Gardener', 'heartbriar') },
    ],
  },
  triggers: [{ loc: 'mirewick', cond: { mainAt: 'r00' }, scene: 's_thorn_arrive' }],
  schools: { mirewick: ['Verdant', 'Hex', 'Shadow'] },
  sets: { thorn: { name: 'Briarbound', two: { thorns: 5, maxHp: 25 }, four: { thorns: 8, maxHp: 40, armor: 14, lifesteal: 4 }, blurb: 'Armor that grows back, and makes sure you notice.' } },
  bossLoot: { mazekeeper: ['u_thorn_vest'], bloomtyrant: ['set_thorn_head'], headpruner: ['set_thorn_hands'], hobthessaly: ['set_thorn_body', 'set_thorn_feet'] },
};
