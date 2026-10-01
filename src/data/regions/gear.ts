import { E, FULL, aff, armorSet, arc, c, ch, ck, corrupt, dg, en, flag, g, gold, goldR, gearItem, hp, hpp, item, leave, log, loot, lore, npc, q, recruit, regalia, san, sc, town, tt, unlock, wild, xpL } from '../kit';
import type { RegionPack } from './pack';

const GR = 'gear';

const towns = [
  town({
    id: 'cogspire', name: 'Cogspire', kind: 'city', subtitle: 'The City of Hours', region: GR, pos: [78, 58], icon: 'm_city', art: 'cogspire', tier: 6,
    desc: 'A city that is also a machine: streets of interlocking wheels, towers wound like springs, a bell on every hour that rings in a different pitch. Nothing in Cogspire is late. Nothing has been late in three hundred years.',
    theme: tt('#1a1008', '#ffb44a', '#ffe8b8'), services: FULL, shopTags: ['pistol', 'arquebus', 'crossbow', 'whip', 'cloth', 'bomb', 'potion'],
    rumors: ['The Clockwright set every hour of every life in the city to a schedule. Missing it is a crime. Meeting it is worse.', 'The Hour Engine has not stopped, but it has not advanced either.', 'A child in Cogspire is born, taught, wed and buried on the same day for a hundred and four years. The child does not seem to mind.', 'Pim the Tick-Mender claims he can fix any clock. The ones he cannot fix, he apologises to.'],
    npcs: [
      npc('ines', 'Ines Vael', 'Horologist of the Spire', 'e_wizard', 'A lean woman in goggles and a leather apron, listening to a pocket watch that has not told the time in years.', ['“Time does not pass. It is made. We make it. Usually very badly.”', '“Do not stand on the third cog. It is not load-bearing and it knows.”', '“My great-grandfather made this city. I would like to apologise to everyone, in order.”'], [{ cond: { arc: ['gear', 1] }, scene: 's_ines_brief' }, { cond: { arcMin: ['gear', 8] }, scene: 's_ines_after' }], 'mask'),
      npc('brindle', 'Brindle Cog', 'Master Mechanic', 'e_dwarf', 'A small, wide man with a toolbelt that clanks when he laughs and a laugh that clanks when he does not.', ['“Oil it twice. Then oil it once more. Then sit down.”', '“Everything in this city is a clock. Even the ones that are not clocks.”']),
      npc('perrin', 'Perrin Hale', 'Timekeeper', 'e_bellkeeper', 'A thin man in a sleeved coat and a hat with a small clock embedded in the brim.', ['“You are early. That is a sin. You are late. That is a worse one.”']),
    ],
  }),
  town({
    id: 'escapement', name: 'Escapement', kind: 'village', subtitle: 'The Tick-Menders’ Hamlet', region: GR, pos: [68, 54], icon: 'm_town', art: 'escapement', tier: 6,
    desc: 'A small hamlet of workshops built into the ribs of a cracked gear the size of a house. Every window shows a bench, every bench a small lamp, every lamp a very small gear.',
    theme: tt('#1a0e08', '#ffc060', '#fff0cc'), shopTags: ['potion', 'bomb', 'cloth'],
    rumors: ['The Tick-Menders will fix anything that turns. They will not fix anything that does not.', 'Pim has a pet spider made of brass. It is better at repairs than he is.'],
    npcs: [npc('pim', 'Pim Tickwell', 'Tick-Mender', 'e_goblin', 'A short man with an enormous magnifier on one eye, bent over a brass spider the size of a fist.', ['“Hold still. No, not you. The spider.”', '“Everything is a mechanism. Even grief. Especially grief. It just has more springs.”'], [{ cond: { arc: ['gear', 5] }, scene: 's_pim_key' }], 'mask')],
  }),
  town({
    id: 'pendulumrest', name: 'Pendulum Rest', kind: 'village', subtitle: 'Where the Swing Stops', region: GR, pos: [86, 66], icon: 'm_town', art: 'cogspire', tier: 6,
    desc: 'A quiet hamlet at the bottom of the Orrery’s great pendulum swing. Once an hour the pendulum passes overhead, and for one second the village stands in its shadow, and everyone looks up.',
    theme: tt('#150c08', '#ffa850', '#ffe0b0'), shopTags: ['potion', 'bomb', 'medium'],
    rumors: ['At the bottom of the swing, the shadow of the pendulum stops for a heartbeat. That heartbeat belongs to no one.', 'The innkeeper keeps the only clock in Pendulum Rest. It is five minutes wrong, and it is the only comfort.'],
    npcs: [npc('hett', 'Hett Longstride', 'Innkeeper', 'e_barbarian', 'A big woman with a ladle in one hand and a stopwatch in the other.', ['“Supper is at seven. It is always seven. I have stopped asking why.”'])],
  }),
];

const dungeons = [
  dg({ id: 'mainspring', name: 'The Mainspring Works', subtitle: 'Where the first spring was wound', desc: 'A vast, humming foundry of brass springs, each tight enough to hurl a house. The workers left in a hurry, or were never really workers at all.', art: 'orrery', theme: 'gear', floors: 3, lvl: 38, enemies: ['tickspider', 'brasswasp', 'clockworkhound', 'gearswarm'], elite: 'pendulumwarden', boss: 'mainspring', size: [29, 21], pos: [66, 64], icon: 'm_mine', secretItem: 'u_hour_cog' }),
  dg({ id: 'geartrain', name: 'The Great Gear-Train', subtitle: 'The wheel inside the wheel inside the wheel', desc: 'A maze of interlocking gears the size of cathedrals. They turn. You must time your crossing, or be turned.', art: 'orrery', theme: 'gear', floors: 3, lvl: 38, enemies: ['tickspider', 'springknight', 'gearswarm', 'steamelemental'], elite: 'pendulumwarden', boss: 'gearmaster', size: [29, 21], pos: [72, 52], cond: { arcMin: ['gear', 2] }, clear: 's_gear_train', icon: 'm_ruins' }),
  dg({ id: 'equationvaults', name: 'The Equation Vaults', subtitle: 'Where the schedule was calculated', desc: 'Rooms of brass tablets, each engraved with an equation that solved a life. The tablets are still adding.', art: 'orrery', theme: 'gear', floors: 3, lvl: 40, enemies: ['minutehand', 'hourgolem', 'cogwraith', 'chronophage'], elite: 'orrerytitan', boss: 'primeengine', size: [31, 23], pos: [90, 56], cond: { arcMin: ['gear', 4] }, clear: 's_gear_vaults', icon: 'm_cave' }),
  dg({ id: 'hourengine', name: 'The Hour Engine', subtitle: 'The heart of every clock in the world', desc: 'The vast central mechanism of the Orrery, a spinning tower of gears that has not advanced a second in three centuries. At the top, a man stands at a console, and has never once looked up.', art: 'hourengine', theme: 'gear', floors: 5, lvl: 42, enemies: ['minutehand', 'hourgolem', 'pendulumreaper', 'cuckoosentinel', 'springknight'], elite: 'orrerytitan', boss: 'orrin', size: [33, 25], pos: [88, 68], cond: { arcMin: ['gear', 7] }, clear: 's_orrin_end', mainBoss: true, icon: 'm_castle' }),
];

const landmarks = [
  { id: 'zeropoint', name: 'The Zero Point', icon: 'hourglass', pos: [80, 64] as [number, number], scene: 's_gear_zero', lvl: 41, cond: { arc: ['gear', 6] as [string, number] }, hint: 'A brass disc set in the plain, graduated in a thousand marks. At the centre, a hole the shape of a key.' },
  { id: 'stoppedclock', name: 'The Stopped Clock', icon: 'cog', pos: [70, 60] as [number, number], event: 'ev_o_stopped', once: true, lvl: 39 },
  { id: 'cuckooturret', name: 'The Cuckoo Tower', icon: 'm_tower', pos: [84, 52] as [number, number], event: 'ev_o_cuckoo', once: true, lvl: 40 },
];

const enemies = [
  en('tickspider', 'Tick-Spider', 'e_spider2', 'skirmisher', 'construct beast', ['attack', 'afflict', 'attack'], 'A brass spider, fist-sized, that injects a ticking venom. You can hear it in your teeth.', { ...aff('weak'), look: 'crawler' }),
  en('brasswasp', 'Brass Wasp', 'e_dragonfly', 'skirmisher', 'construct beast', ['attack', 'attack', 'afflict'], 'A wasp wound tight with spring-steel. Its sting is a spiral.', { ...aff('bleed'), look: 'winged' }),
  en('clockworkhound', 'Clockwork Hound', 'e_hound', 'skirmisher', 'construct beast', ['attack', 'afflict', 'attack'], 'It runs at one speed and bites at another.', { ...aff('bleed'), look: 'quad' }),
  en('gearswarm', 'Gear Swarm', 'e_scarab', 'swarm', 'construct', ['attack', 'attack', 'afflict'], 'A drift of loose cogs, spinning, meshing, tearing.', { ...aff('bleed'), look: 'swarm' }),
  en('springknight', 'Spring-Knight', 'e_knight', 'tank', 'construct', ['guard', 'heavy', 'attack'], 'A suit of armor that holds its own tension. When it releases, you notice.', { look: 'armor' }),
  en('steamelemental', 'Steam Elemental', 'e_fireelem', 'caster', 'construct fire', ['dread', 'attack', 'afflict'], 'Pressure with an opinion, wearing a boiler-coat.', { ...aff('burn'), dread: 2, look: 'elemental' }),
  en('minutehand', 'Minute-Hand', 'e_assassin', 'skirmisher', 'construct human', ['attack', 'heavy', 'attack'], 'A long, lean clockwork figure in a veiled cowl, one arm a single sweeping blade. It cuts exactly once a minute.', { ...aff('bleed'), look: 'rogue+mask' }),
  en('hourgolem', 'Hour-Golem', 'e_icegolem', 'tank', 'construct', ['guard', 'heavy', 'attack'], 'A heavy brass golem with a clock face where a head would be. The clock face is blank.', { look: 'golem' }),
  en('cogwraith', 'Cog-Wraith', 'e_ghost', 'caster', 'spirit construct', ['afflict', 'dread', 'attack'], 'The ghost of a gear that was never installed.', { ...aff('weak'), dread: 2 }),
  en('chronophage', 'Chronophage', 'e_slime', 'tank', 'construct beast', ['guard', 'afflict', 'heavy'], 'A fat brass mite that eats seconds. It is always a little late to its own bite.', { ...aff('weak'), look: 'blob' }),
  en('pendulumreaper', 'Pendulum Reaper', 'e_reaper', 'brute', 'construct', ['heavy', 'attack', 'heavy', 'afflict'], 'A scythe on a long, swinging arm, attached to nothing but the beat of the Orrery.', { ...aff('bleed'), look: 'hood' }),
  en('cuckoosentinel', 'Cuckoo Sentinel', 'e_owl', 'caster', 'construct beast', ['dread', 'attack', 'dread'], 'A brass bird that pops out of a tower and calls the hour. The hour is always now.', { dread: 3, look: 'winged' }),
  en('pendulumwarden', 'Pendulum Warden', 'e_blackknight', 'tank', 'construct elite', ['guard', 'heavy', 'dread'], 'A massive brass sentinel that swings a pendulum of lead. Each swing is a different time.', { dread: 2, look: 'armor' }),
  en('orrerytitan', 'Orrery Titan', 'e_cyclops', 'brute', 'construct elite', ['heavy', 'attack', 'heavy', 'afflict'], 'A walking planetarium: rings, spheres, orbits, and a heavy fist at the end of each arm.', { ...aff('weak'), look: 'titan' }),
  en('mainspring', 'The Mainspring', 'e_icegolem', 'tank', 'construct boss', ['guard', 'heavy', 'heavy', 'afflict'], 'A single coiled spring the height of a tower, with a will of its own, wound to the point of snapping.', { hpMul: 4, ...aff('bleed'), look: 'golem' }),
  en('gearmaster', 'Gearmaster Brindle-Kane', 'e_dwarf', 'brute', 'construct human boss', ['heavy', 'attack', 'guard', 'heavy'], 'The last foreman of the Great Gear-Train, replaced piece by piece until the machine was the only thing left.', { hpMul: 4, look: 'armor+mask' }),
  en('primeengine', 'The Prime Engine', 'e_gearmask', 'caster', 'construct boss', ['dread', 'heavy', 'afflict', 'guard'], 'An engine that computes lives. It has just completed yours.', { hpMul: 4.2, dread: 3, look: 'golem' }),
  en('orrin', 'Orrin Vael, the Clockwright', 'e_crowned', 'caster', 'human construct boss', ['dread', 'heavy', 'afflict', 'guard', 'heavy'], 'Fifth Regent of the Meridian. He ruled by the schedule, and kept ruling after he stopped being a man.', { hpMul: 5.4, dread: 4, ...aff('weak'), look: 'king' }),
];

const quests = [
  q('q_o_spiders', 'cogspire', 'Brindle Cog', 'Ticks in the Works', 'Tick-spiders have got into the housing. Twelve of them. Do not step on them. They do not mind, but the floor does.', g('kill', 12, 'Crush tick-spiders', 'tickspider'), { gold: 1000, xp: 1020, items: ['restorative', 'w_whip_6'] }),
  q('q_o_knights', 'cogspire', 'Ines Vael', 'Overwound', 'Spring-Knights are releasing in the main square. Six of them, rendered inert.', g('kill', 6, 'Disarm spring-knights', 'springknight'), { gold: 1080, xp: 1060, items: ['panacea', 'a_body_heavy_6'] }),
  q('q_o_hands', 'cogspire', 'Perrin Hale', 'The Minutes Are Cutting People', 'The Minute-Hands have been exact. Too exact. Seven of them, removed from the schedule.', g('kill', 7, 'Remove minute-hands', 'minutehand'), { gold: 1120, xp: 1100, items: ['x_gemring_6', 'bloodwine'] }),
  q('q_o_hounds', 'cogspire', 'Brindle Cog', 'Clockwork Hounds', 'They have started to bite at the wrong time. Nine of them, wound down.', g('kill', 9, 'Wind down hounds', 'clockworkhound'), { gold: 960, xp: 1000, items: ['salts', 'salts', 'a_feet_heavy_6'] }),
  q('q_o_elite', 'cogspire', 'Ines Vael', 'Named Mechanisms', 'The Spire keeps a list of the great machines. Three of them, retired.', g('elites', 3, 'Slay elite foes'), { gold: 1300, xp: 1180, items: ['recollection', 'x_signet_6'] }),
  q('q_o_events', 'cogspire', 'Perrin Hale', 'Irregularities', 'Report five irregularities in the countryside. I will file them. They will not be fixed. But they will be filed.', g('events', 5, 'Survive strange encounters'), { gold: 900, xp: 960, items: ['folio', 'j_hourglass'] }),
  q('q_o_clock', 'escapement', 'Pim Tickwell', 'The Stopped Clock', 'There is a clock on the western road that has been stopped for sixty years. I want to know who stopped it.', g('reach', 1, 'Visit the Stopped Clock', 'stoppedclock'), { gold: 760, xp: 900, items: ['clearwater', 'clearwater', 'cratesupply'] }),
  q('q_o_springs', 'escapement', 'Pim Tickwell', 'The Mainspring', 'The Mainspring Works is overwound. Someone should unwind it. I will pay very well if it does not go off.', g('clear', 1, 'Defeat the Mainspring', 'mainspring'), { gold: 1500, xp: 1300, items: ['u_hour_cog', 'lifeblood'] }),
  q('q_o_wasps', 'escapement', 'Pim Tickwell', 'Wasp Nest', 'Brass wasps have nested in the roof of my shop. Eleven of them. Do not tell them I said please.', g('kill', 11, 'Swat brass wasps', 'brasswasp'), { gold: 940, xp: 980, items: ['widowvenom', 'widowvenom', 'a_hands_cloth_6'] }),
  q('q_o_cuckoo', 'pendulumrest', 'Hett Longstride', 'The Cuckoo Tower', 'A cuckoo sentinel has been calling the same hour for forty days. I want to know what time it is.', g('reach', 1, 'Visit the Cuckoo Tower', 'cuckooturret'), { gold: 800, xp: 920, items: ['elixir', 'lampoil', 'lampoil'] }),
  q('q_o_golems', 'pendulumrest', 'Hett Longstride', 'Heavy Hours', 'Hour-Golems have been crushing the grain-sheds. Six of them, and I will cook you something real.', g('kill', 6, 'Topple hour-golems', 'hourgolem'), { gold: 1100, xp: 1060, items: ['quarrycharge', 'w_halberd_6'] }),
  q('q_o_titan', 'pendulumrest', 'Hett Longstride', 'The Walking Orrery', 'An Orrery Titan walks the plain. Every circuit it takes eats another farm. Make it stop.', g('kill', 1, 'Slay the Orrery Titan', 'orrerytitan'), { gold: 1600, xp: 1400, items: ['set_gear_body', 'lucid'] }),
];

const events = [
  E('ev_o_stopped', 'The Stopped Clock', 'cog', 'wild brass gear', 'A great clock-face on the plain, hands stopped at seven minutes to noon. Someone has scratched a tally into the glass beneath it, one mark for each day. The tally ends, abruptly, at a thousand.', [
    c('Wind it', 'One turn, no more.', [hpp(20), xpL(0.2), log('The hands tick once, forward.', 'good')], { check: ck('cunning', 14), fail: [hp(-18), log('The spring bites back.', 'bad')] }),
    c('Read the tally', 'Count the days.', [lore(), san(-4)]),
    c('Smash the face', 'Break the pattern.', [loot('rare'), corrupt(1)])], 'hourglass'),
  E('ev_o_cuckoo', 'The Cuckoo Tower', 'm_tower', 'wild brass gear', 'A slender brass tower, its upper door open, a clockwork bird perched on the sill. As you approach it pops out, announces an hour that is not now, and retreats.', [
    c('Wait for the next hour', 'Time it.', [loot('rare'), xpL(0.15)], { check: ck('cunning', 14), fail: [wild()] }),
    c('Climb the tower', 'See what it keeps.', [goldR(120, 200), lore()], { check: ck('vigor', 14), fail: [hp(-16)] }),
    c('Leave it be', 'Some hours are best unannounced.', leave)], 'cog'),
  E('ev_o_caravan', 'A Caravan of Clocks', 'm_camp', 'wild brass gear', 'A wagon train of pocket watches, tall-case clocks, sundials, and hourglasses, drawn by clockwork oxen. The drivers wave. Every clock shows a different time.', [
    c('Trade', 'Buy a watch.', [item('lampoil'), item('elixir'), gold(-80)], { cost: { gold: 80 } }),
    c('Ask the time', 'You will get seventeen answers.', [lore(), san(-3)]),
    c('Wave and walk on', 'Do not check your own watch.', leave)], 'cart'),
  E('ev_o_tide', 'A Second That Will Not End', 'hourglass', 'wild brass gear', 'You step into a patch of road where a single second has been stuck for decades. Birds hang in mid-air. A raindrop hovers at the height of your eye.', [
    c('Push through', 'Walk slowly, steadily.', [xpL(0.2), san(-4)], { check: ck('will', 14), fail: [hp(-20)] }),
    c('Take the raindrop', 'It is quite beautiful.', [loot('rare')]),
    c('Step back', 'This is not your time.', leave)], 'hourglass'),
  E('ev_o_gears', 'The Gear-Garden', 'cog', 'gear', 'A walled courtyard where small gears grow in rows, planted by hand and watered with oil. Some turn slowly. Some have flowered.', [
    c('Pick a gear', 'Choose a ripe one.', [item('j_cluster'), goldR(80, 140)], { check: ck('cunning', 13), fail: [hp(-12)] }),
    c('Oil the beds', 'Be a kind gardener.', [san(8), xpL(0.15)], { cost: { supplies: 1 } }),
    c('Walk the rows', 'Quietly.', [lore(), san(-3)])], 'cog'),
  E('ev_o_ledger', 'The Schedule on the Wall', 'tablet', 'gear', 'A brass board listing every hour of every person in the city. Yours is already on it, in a fine copperplate hand, with an hour, a place, and a cause.', [
    c('Read your entry', 'You wish you had not.', [lore(), san(-8), xpL(0.25)]),
    c('Strike it out', 'With a knife, with spite.', [corrupt(1), loot('epic')], { check: ck('will', 15), fail: [hp(-22), san(-6)] }),
    c('Add a line', 'Write something new.', [san(8), hpp(20), log('A very small, brand-new hour appears.', 'good')])], 'book'),
  E('ev_o_wind', 'The Winding-Key Room', 'skeleton_key', 'gear', 'A tall room, its walls hung with giant keys. At the centre, a keyhole in the floor the size of a manhole. It is humming.', [
    c('Turn a key', 'It takes both hands.', [loot('rare'), xpL(0.15)], { check: ck('vigor', 14), fail: [hp(-18)] }),
    c('Listen at the keyhole', 'Hear what it is winding.', [lore(), san(-5)]),
    c('Leave the keys', 'Not yours.', leave)], 'door'),
  E('ev_o_swing', 'The Pendulum’s Shadow', 'hourglass', 'gear', 'The great pendulum passes overhead, slow as a decision. In its shadow, for one heartbeat, the whole room stands still. You notice something you could take, or something you could say.', [
    c('Take what is in the shadow', 'Just a heartbeat.', [loot('epic')], { check: ck('cunning', 15), fail: [hp(-24)] }),
    c('Speak into the stillness', 'Say something true.', [san(10), xpL(0.2)]),
    c('Wait for it to pass', 'Patience.', [hpp(15)])], 'hourglass'),
];

const scenes = [
  sc('s_gear_arrive', 'cogspire', [
    ['narrator', 'A hundred bells ring on the hour, in a hundred different pitches, and the city of Cogspire hums to life like an enormous watch being wound. Gear-streets turn slowly beneath your feet. Veiled clerks in brass masks hurry along the pavement, each carrying a slip of paper with a time written on it.'],
    ['narrator', 'High above, at the top of the tallest spire, a great clock face turns its hands. Somehow you know, without checking, that it is exactly the right time. It always is.', { eff: [arc('gear', 1), xpL(0.25)] }],
  ]),
  sc('s_ines_brief', 'cogspire', [
    ['ines', '“You are on time,” Ines says. She sounds almost sad about it. “Good. The Clockwright is not.” She taps a diagram on the wall: a great spinning tower of gears. “My great-grandfather. Orrin Vael. Fifth Regent. He made this city, and then he stopped it. He said the world would be happier if everything arrived on time. Then he locked himself inside the Hour Engine to prove it.”'],
    ['ines', '“There are three doors, and each is a lock of time. The Great Gear-Train, to open the first. The Equation Vaults, to open the second. And Pim Tickwell in Escapement, who can build the key. Then, the Zero Point. Then my great-grandfather, and his schedule.”', { choices: [
      ch('“What happens if I fail?”', '3'), ch('“Why does the engine not stop?”', '4'), ch('“I will start at the Gear-Train.”', '5')] }],
    ['ines', '“Nothing. That is the problem. Everything continues exactly as it was.”', { id: '3', next: '5' }],
    ['ines', '“Because he wrote its last instruction as ‘continue’. And he has never, in three hundred years, been wrong about an instruction.”', { id: '4', next: '5' }],
    ['ines', '“Good. Take this.” She presses a brass pocket watch into your hand. “It runs backwards. Do not worry. It will make sense.”', { id: '5', eff: [item('lampoil', 2), arc('gear', 2), xpL(0.2)] }],
  ]),
  sc('s_gear_train', 'orrery', [
    ['narrator', 'The Gearmaster stops mid-swing, and the thousand gears around you stop with him, one by one, like a held breath let go. In the sudden silence, you can hear your own heart. At the heart of the Gear-Train, a small brass wheel, bright as a coin, spins on a single pin.'],
    ['narrator', 'It is warm. When you close your hand around it, it ticks, once, and continues.', { eff: [flag('gear_wheel1'), xpL(0.3), san(-2)] }],
  ]),
  sc('s_gear_vaults', 'orrery', [
    ['narrator', 'The Prime Engine finishes its calculation and goes quiet. A final tablet drops from its housing, engraved with a single line: Result: indeterminate. You look at it for a long time.'],
    ['narrator', 'Behind the tablet, set into the wall like a heart, a second brass wheel, cooler, with a heavier tick. It hums at the same frequency as the first. The two wheels, held side by side, lean toward each other.', { eff: [flag('gear_wheel2'), xpL(0.3), san(-3)] }],
  ]),
  sc('s_pim_key', 'escapement', [
    ['pim', '“Two wheels,” Pim says, eyes bright behind the magnifier. “Do you know how long I have waited to see these? The First and the Second. The Gear-Train and the Equation Vaults. Hold still. No, you. Not the spider.”'],
    ['pim', 'He sets the wheels in a small cradle of brass, hums a tune that has no beginning, and winds a tiny key. For a moment the whole workshop rings with a single note. The wheels fuse. Out of the cradle rises a brass key, no longer than a finger, with a bow like a sun.', { choices: [
      ch('“What does it open?”', '3'), ch('“Can I keep the spider?”', '4')] }],
    ['pim', '“A moment. The Zero Point. The only moment in this entire city that is not on a schedule. You will have to be there on the hour, and the hour is never when you think it is.”', { id: '3', next: '5' }],
    ['pim', '“Her? She picks. She picked you three minutes ago. I was a bit offended, honestly.”', { id: '4', next: '5' }],
    ['narrator', 'The brass spider hops from the bench onto your shoulder, delighted, and begins, with great seriousness, to check your pockets.', { id: '5', eff: [recruit('Tick'), flag('gear_key'), arc('gear', 6), xpL(0.3), unlock('hourengine')] }],
  ]),
  sc('s_gear_zero', 'orrery', [
    ['narrator', 'The Zero Point is a disc of brass set in the plain, graduated in a thousand marks, each one a different second. In the middle, a small keyhole. The wind drops. The light pauses.'],
    ['narrator', 'You turn the key. The disc rings, and across the plain the Orrery’s mighty rings begin to rotate. A gate opens in the sky, brass-edged, ticking, and a road made of hours unspools toward the Hour Engine.', { eff: [arc('gear', 7), xpL(0.35), san(-3)] }],
  ]),
  sc('s_orrin_end', 'hourengine', [
    ['narrator', 'The Clockwright turns, at last, from his console. He is no longer a man: a brass figure in a long coat, a clock face where the head should be, a pair of gloved hands that rest, trembling, on a single lever. The clock face reads the same time as the one in Cogspire. Then it shows a different time. Then it stops.'],
    ['orrin', '“I was wrong,” he says, in a voice like a spring uncoiling. “I would like that to be the first thing I say. I was wrong about everything, and I would like you to hear it from me.” He lifts the lever. “I will not live to see what happens next, and I am so very glad.”', { choices: [
      ch('Take the Hour-Key.', '2'), ch('“What happens when the engine stops?”', '3')] }],
    ['orrin', '“Nothing. And then something. That is the whole thing about time. It is nothing, and then it is something, and you cannot be there for the transition.”', { id: '3', next: '2' }],
    ['narrator', 'The Hour-Key slides out of his chest, light as a drop of oil. As he folds, the Engine slows. Across the world, every clock hesitates, then ticks, then ticks again, at a different speed, and for the first time in three hundred years, nobody is exactly on time.', { id: '2', eff: [regalia('hour'), arc('gear', 8), xpL(0.6), gold(1000), san(-4)] }],
  ]),
  sc('s_ines_after', 'cogspire', [
    ['ines', '“My great-grandfather is gone,” Ines says, not quite crying. “And the city is nearly ten minutes late. It is the best thing that has ever happened to us.” She presses a tiny brass cog into your palm. “Cogspire remembers. Come back when you have time. Any time.”'],
  ]),
];

const items = [
  gearItem('reg_hour', 'The Hour-Key', 'skeleton_key', 'amulet', 'mythic', 7, 'Orrin’s brass key, worn on a chain. It winds, and unwinds, and occasionally lets you decide which.', { armor: 12, damage: 10, crit: 10, critDmg: 20, cunning: 6, dodge: 8, xpPct: 6 }, { set: 'regalia' }),
  gearItem('u_hour_cog', 'Mainspring Hammer', 'w_hammer', 'weapon', 'epic', 6, 'Forged in the Works from a spring that nearly killed the forger.', { damage: 58, crit: 9, maxHp: 24, armor: 4 }),
  ...armorSet('gear', 6, 'epic', {
    head: ['Gearwright Goggles', 'h_visor', 'Brass lenses that show the next tick.'],
    body: ['Clockplate Cuirass', 'b_lamellar', 'Overlapping brass plates that tick softly when you breathe.'],
    hands: ['Escapement Gauntlets', 'g_mailed', 'They pause for half a heartbeat before every strike.'],
    feet: ['Ratchet Boots', 'f_greaves', 'Click, click. Never slip.'],
  }, { head: { crit: 2, sight: 0 }, body: { maxHp: 3, armor: 0 }, hands: { crit: 1, dodge: 1 }, feet: { dodge: 2, maxHp: 1 } }),
];

export const GEAR: RegionPack = {
  id: 'gear',
  zone: { id: 'gear', name: 'The Orrery', at: [80, 60], lvl: 40, pool: ['tickspider', 'brasswasp', 'clockworkhound', 'springknight', 'steamelemental'], biome: 'brass', elite: 'orrerytitan', bg: 'orrery' },
  towns, dungeons, landmarks, enemies, quests, events, scenes, items,
  links: [['mirewick', 'cogspire'], ['cogspire', 'escapement'], ['cogspire', 'pendulumrest'], ['cogspire', 'geartrain'], ['cogspire', 'equationvaults'], ['pendulumrest', 'hourengine'], ['escapement', 'mainspring']],
  speakers: {
    ines: { name: 'Ines Vael', title: 'Horologist of the Spire', icon: 'e_wizard', color: '#ffc880', look: 'mask' },
    pim: { name: 'Pim Tickwell', title: 'Tick-Mender', icon: 'e_goblin', color: '#ffd8a0', look: 'hat' },
    orrin: { name: 'Orrin Vael', title: 'The Clockwright', icon: 'e_crowned', color: '#ffb450', look: 'crown' },
  },
  arc: {
    id: 'gear', title: 'The Hour-Key', region: 'gear', lvl: 38, regalia: 'hour',
    blurb: 'The fifth Regent ruled by the schedule, and stopped the city so it would never be late.',
    steps: [
      { title: 'The Horologist', obj: 'Speak with Ines Vael in Cogspire.', text: 'The Clockwright’s great-granddaughter knows where he locked himself in.', at: 'cogspire' },
      { title: 'The Great Gear-Train', obj: 'Defeat the Gearmaster in the Great Gear-Train.', text: 'The first brass wheel spins at the heart of the Gear-Train.', at: 'geartrain', goal: g('clear', 1, 'Defeat the Gearmaster', 'geartrain') },
      { title: 'Clear the Mechanisms', obj: 'Slay fourteen constructs in the Orrery.', text: 'The wild clockwork has outgrown its keepers. Thin it before the next hour.', at: 'cogspire', goal: g('killTag', 14, 'Slay constructs', 'construct') },
      { title: 'The Equation Vaults', obj: 'Defeat the Prime Engine in the Equation Vaults.', text: 'The second wheel lies at the heart of the calculating engine.', at: 'equationvaults', goal: g('clear', 1, 'Defeat the Prime Engine', 'equationvaults') },
      { title: 'The Tick-Mender', obj: 'Take both wheels to Pim Tickwell in Escapement.', text: 'Only Pim can build the Key.', at: 'escapement' },
      { title: 'The Zero Point', obj: 'Stand on the Zero Point and turn the Key.', text: 'The one moment in the Orrery that is not on a schedule.', at: 'hourengine', goal: g('reach', 1, 'Reach the Zero Point', 'zeropoint') },
      { title: 'The Hour Engine', obj: 'Enter the Hour Engine and face Orrin Vael, the Clockwright.', text: 'Five floors of mechanism, and a man who has been right about everything, forever.', at: 'hourengine', goal: g('clear', 1, 'Defeat the Clockwright', 'hourengine') },
    ],
  },
  triggers: [{ loc: 'cogspire', cond: { mainAt: 'r00' }, scene: 's_gear_arrive' }],
  schools: { cogspire: ['Gear', 'Steel', 'Astral'] },
  sets: { gear: { name: 'Clockplate Panoply', two: { crit: 8, dodge: 6 }, four: { crit: 12, dodge: 8, armor: 18, damage: 10 }, blurb: 'Every plate fits to the thousandth of a second.' } },
  bossLoot: { mainspring: ['u_hour_cog'], gearmaster: ['set_gear_head'], primeengine: ['set_gear_feet'], orrin: ['set_gear_body', 'set_gear_hands'] },
};
