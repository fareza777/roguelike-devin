import { E, FULL, aff, armorSet, arc, c, ch, ck, corrupt, dg, en, flag, g, gold, goldR, gearItem, hp, hpp, item, leave, log, loot, lore, npc, q, recruit, regalia, san, sc, town, tt, unlock, wild, xpL } from '../kit';
import type { RegionPack } from './pack';

const AR = 'frost';

const towns = [
  town({
    id: 'skerrig', name: 'Skerrig', kind: 'city', subtitle: 'The Harbour Under the Lights', region: AR, pos: [78, 6], icon: 'm_city', art: 'skerrig', tier: 7,
    desc: 'A grey stone harbour-city on a frozen fjord, every roof turned toward the sky. The aurora hangs overhead, green and slow, and the whole city walks softly, because it has learned that the sky listens.',
    theme: tt('#06101a', '#7affc8', '#d8fff0'), services: FULL, shopTags: ['halberd', 'axe', 'hammer', 'heavy', 'potion', 'spear'],
    rumors: ['The aurora changes colour when someone lies. Skerrig has the quietest politics in the world.', 'The Winter Queen has not moved in three hundred years. Her court has stopped waiting.', 'Whalers still sail from Whalefall, though no whale has been seen since the sky went black.', 'There is a place where the snow does not fall: a perfect circle, forty paces wide. The Queen sits in the middle.'],
    npcs: [
      npc('brynja', 'Brynja Skarn', 'Chancellor of Skerrig', 'e_barbarian', 'A tall woman in a coat of white fox and iron, a lamp on her shoulder and a stillness in her hands you can feel from across the room.', ['“The aurora is not a decoration. It is a ledger.”', '“We do not rush in Skerrig. The ice would notice.”', '“I have kept this city for thirty winters. It has never once asked me anything I could answer.”'], [{ cond: { arc: ['frost', 1] }, scene: 's_brynja_brief' }, { cond: { arcMin: ['frost', 8] }, scene: 's_brynja_after' }], 'hood'),
      npc('eyvind', 'Eyvind Rimecloak', 'Lamp-Master', 'e_bellkeeper', 'A bent man with a lantern on a long pole, lighting lamps in a street that is already bright.', ['“A lamp is an argument against the dark. It is an old argument. I intend to win it.”']),
      npc('sigrid', 'Sigrid Ash-Ear', 'Fur-Trader', 'e_fox', 'A girl in a hood far too large for her, selling coats with an air of enormous generosity.', ['“Fur keeps you warm. Honesty keeps you alive. I sell one of them.”']),
    ],
  }),
  town({
    id: 'rimewatch', name: 'Rimewatch', kind: 'village', subtitle: 'The Weaver’s Hamlet', region: AR, pos: [66, 8], icon: 'm_town', art: 'rimewatch', tier: 7,
    desc: 'A village of white stone huts hung with threads of coloured light. The weavers here spin aurora into silk, and the silk keeps whatever it is wrapped around.',
    theme: tt('#08121c', '#a0ffe0', '#e8fff8'), shopTags: ['potion', 'cloth', 'medium'],
    rumors: ['Ragnhild’s silk is cold as a held breath. She says it is the only warm thing she knows.', 'Nobody in Rimewatch sleeps in a bed. They sleep in a hammock under the sky.'],
    npcs: [npc('ragnhild', 'Ragnhild Frostbrand', 'Weaver of Aurora-Silk', 'e_hermit', 'A tall, thin woman wrapped in so many layers of colourless silk she looks like a column of snow.', ['“Aurora-silk keeps the cold in, and the warmth out, and the grief where it belongs.”'], [{ cond: { arc: ['frost', 5] }, scene: 's_ragnhild_mantle' }], 'veil')],
  }),
  town({
    id: 'whalefall', name: 'Whalefall', kind: 'village', subtitle: 'The Last Whalers', region: AR, pos: [90, 10], icon: 'm_town', art: 'whalefall', tier: 7,
    desc: 'A camp of boat-sheds and flensing-racks on a field of ice, every rack hung with a different bone. The whalers still sing, in a low unison, to a sea that no longer sings back.',
    theme: tt('#08141a', '#80f0e0', '#e0fff8'), shopTags: ['potion', 'halberd', 'bomb'],
    rumors: ['The oldest whaler claims he saw a whale rise out of the ice, shining, and swim up into the aurora.', 'A wolf pup follows the whalers’ boats, always three paces behind, and has not yet been named.'],
    npcs: [npc('torvald', 'Torvald Ice-Eye', 'Harpooner', 'e_polar', 'A one-eyed old man with a coat of bone buttons and a harpoon older than the village.', ['“We follow the song. When it stops, we stop. It has been silent a long, long time.”'], [{ cond: { arcMin: ['frost', 3], not: 'comp_hrim' }, scene: 's_torvald_hrim' }])],
  }),
];

const dungeons = [
  dg({ id: 'whalebarrows', name: 'The Whaleback Barrows', subtitle: 'A graveyard in the shape of a whale', desc: 'A long ridge of ice that is, on closer inspection, the back of a vast whale. The whalers buried their dead in the blow-hole. The dead did not stay.', art: 'aurora', theme: 'aurora', floors: 3, lvl: 44, enemies: ['frostbound', 'iciclehound', 'whiteoutshade', 'glaciermaw'], elite: 'frostchampion', boss: 'hollowleviathan', size: [29, 21], pos: [64, 3], cond: { arcMin: ['frost', 3] }, clear: 's_frost_barrows', icon: 'm_graveyard', secretItem: 'u_frost_harpoon' }),
  dg({ id: 'auroraobservatory', name: 'The Aurora Observatory', subtitle: 'Where the lights are counted', desc: 'A tower of ice and brass, tall as a fjord, where astronomers once charted every colour that crossed the sky. The Star-Reader still takes notes.', art: 'aurora', theme: 'aurora', floors: 3, lvl: 43, enemies: ['aurorawisp', 'icemantis', 'wintercourtier', 'frostharpy'], elite: 'rimegiant', boss: 'starreader', size: [29, 21], pos: [72, 10], cond: { arcMin: ['frost', 2] }, clear: 's_frost_observatory', icon: 'm_tower' }),
  dg({ id: 'silentmere', name: 'The Silent Mere', subtitle: 'A lake under glass', desc: 'A frozen lake, clear as a window, with a drowned city beneath it that you can see but not hear. Nothing in the Mere has made a sound in three hundred years.', art: 'aurora', theme: 'aurora', floors: 3, lvl: 45, enemies: ['whiteoutshade', 'glaciermaw', 'frostbound', 'snowblind', 'iciclehound'], elite: 'frostchampion', boss: 'merewarden', size: [31, 23], pos: [86, 12], cond: { arcMin: ['frost', 4] }, clear: 's_frost_mere', icon: 'm_cave' }),
  dg({ id: 'glasskeep', name: 'Hrimm’s Glass Keep', subtitle: 'The Winter Queen’s court of ice', desc: 'A palace of ice so clear it seems to be made of light. Inside, three hundred courtiers stand frozen in the middle of a dance, and at the heart of the court, the Queen sits very still on a throne of snow.', art: 'glasskeep', theme: 'aurora', floors: 5, lvl: 47, enemies: ['wintercourtier', 'frostbound', 'mammoth', 'whiteoutshade', 'icemantis'], elite: 'rimegiant', boss: 'skadi', size: [33, 25], pos: [92, 3], cond: { arcMin: ['frost', 7] }, clear: 's_skadi_end', mainBoss: true, icon: 'm_castle' }),
];

const landmarks = [
  { id: 'stillpoint', name: 'The Still Point', icon: 'star', pos: [84, 4] as [number, number], scene: 's_frost_still', lvl: 46, cond: { arc: ['frost', 6] as [string, number] }, hint: 'A perfect circle of bare ground, forty paces wide, where the snow does not fall.' },
  { id: 'iceharp', name: 'The Ice-Harp', icon: 'm_ruins', pos: [70, 4] as [number, number], event: 'ev_f_harp', once: true, lvl: 44 },
  { id: 'lastfire', name: 'The Last Fire', icon: 'campfire', pos: [88, 7] as [number, number], event: 'ev_f_fire', once: true, lvl: 45 },
];

const enemies = [
  en('aurorawisp', 'Aurora Wisp', 'e_wisp', 'caster', 'spirit frost', ['dread', 'attack', 'dread'], 'A ribbon of the northern lights that came down to see what the fuss was about. It stays for the conversation.', { dread: 3, look: 'spirit' }),
  en('icemantis', 'Ice Mantis', 'e_spider', 'skirmisher', 'beast frost', ['attack', 'heavy', 'attack'], 'A mantis the size of a man, made of blue ice, forelegs folded as if in thought. It is not thinking.', { ...aff('bleed'), look: 'crawler' }),
  en('iciclehound', 'Icicle Hound', 'e_polar', 'skirmisher', 'beast frost', ['attack', 'afflict', 'attack'], 'A wolf of ice whose fur is frozen needles. It makes no sound, and leaves no print.', { ...aff('bleed'), look: 'quad' }),
  en('frostbound', 'Frostbound Warrior', 'e_knight', 'brute', 'undead frost', ['attack', 'heavy', 'guard'], 'An old soldier frozen mid-stride and animated by the cold alone. His breath hangs in front of him.', { look: 'armor+mask' }),
  en('whiteoutshade', 'Whiteout Shade', 'e_ghost', 'caster', 'spirit frost', ['afflict', 'dread', 'attack'], 'The blank white of a blizzard, in the shape of someone you almost remember.', { ...aff('weak'), dread: 3, look: 'spirit' }),
  en('wintercourtier', 'Winter Courtier', 'e_hooded', 'caster', 'human frost', ['dread', 'afflict', 'attack'], 'A frozen noble in a mask of white lace, caught mid-bow. When it finishes bowing, someone will be sorry.', { ...aff('weak'), dread: 2, look: 'hood+mask' }),
  en('glaciermaw', 'Glacier Maw', 'e_wormmouth', 'brute', 'beast frost', ['heavy', 'afflict', 'heavy'], 'A blue worm that tunnels through the ice and leaves a clear, perfect hole behind.', { ...aff('weak'), look: 'worm' }),
  en('snowblind', 'Snowblind Wanderer', 'e_hooded', 'brute', 'human frost', ['attack', 'heavy', 'afflict'], 'A traveller whose eyes froze open. Now he walks toward every light, and keeps it.', { ...aff('weak'), look: 'hood' }),
  en('frostharpy', 'Frost Harpy', 'e_harpy', 'skirmisher', 'beast frost', ['attack', 'attack', 'afflict'], 'A winged thing of rime and bone, shrieking in a pitch that breaks icicles.', { ...aff('bleed'), look: 'winged' }),
  en('mammoth', 'Rime Mammoth', 'e_bear', 'brute', 'beast frost', ['heavy', 'attack', 'heavy', 'guard'], 'A woolly giant in an ice coat, tusks as long as spears. It is not hostile. It is simply very large.', { look: 'quad' }),
  en('frostchampion', 'Frost Champion', 'e_blackknight', 'tank', 'undead frost elite', ['guard', 'heavy', 'dread'], 'A masked warlord frozen in mid-charge, still mid-charge.', { dread: 2, look: 'armor+mask' }),
  en('rimegiant', 'Rime Giant', 'e_ogre', 'brute', 'beast frost elite', ['heavy', 'attack', 'heavy', 'afflict'], 'A giant carved of ice and old snow. His club is a glacier that stopped.', { ...aff('weak'), look: 'titan' }),
  en('hollowleviathan', 'The Hollow Leviathan', 'e_whale', 'brute', 'beast frost boss', ['heavy', 'afflict', 'heavy', 'dread'], 'A whale, or the shape a whale left behind in the ice. It is hollow. Something lives in the hollow.', { hpMul: 4.2, ...aff('weak'), dread: 2, look: 'titan' }),
  en('starreader', 'The Star-Reader', 'e_wizard', 'caster', 'human frost boss', ['dread', 'heavy', 'afflict', 'guard'], 'An astronomer in a robe of woven constellations, whose telescope is a lance of ice. She is still taking notes.', { hpMul: 4, dread: 3, look: 'hood+veil' }),
  en('merewarden', 'The Mere-Warden', 'e_knight', 'tank', 'undead frost boss', ['guard', 'heavy', 'dread', 'heavy'], 'A sentinel standing in the middle of the frozen lake, ice up to its throat, holding the Mere shut.', { hpMul: 4.2, dread: 3, look: 'armor' }),
  en('skadi', 'Skadi Hrimm, the Winter Queen', 'e_crowned', 'caster', 'human frost boss', ['dread', 'heavy', 'afflict', 'guard', 'heavy'], 'Seventh Regent of the Meridian. She ruled by stillness, and she held the whole world still so nothing could be lost.', { hpMul: 5.6, dread: 4, ...aff('weak'), look: 'king' }),
];

const quests = [
  q('q_f_hounds', 'skerrig', 'Brynja Skarn', 'The Pack in the Fjord', 'Icicle hounds have been circling the fjord road. Twelve of them, and the road is open again.', g('kill', 12, 'Slay icicle hounds', 'iciclehound'), { gold: 1200, xp: 1280, items: ['restorative', 'w_axe_7'] }),
  q('q_f_courtiers', 'skerrig', 'Brynja Skarn', 'A Bow Too Far', 'The frozen courtiers have started to bow in unison. Eight of them, laid to rest. Please, gently.', g('kill', 8, 'Lay winter courtiers to rest', 'wintercourtier'), { gold: 1300, xp: 1340, items: ['panacea', 'a_head_cloth_7'] }),
  q('q_f_wisps', 'skerrig', 'Eyvind Rimecloak', 'The Lights That Come Down', 'Aurora wisps have been drifting into the lamps and putting them out. Ten, if you please.', g('kill', 10, 'Snuff aurora wisps', 'aurorawisp'), { gold: 1260, xp: 1300, items: ['lucid', 'x_lantern_7'] }),
  q('q_f_mantis', 'skerrig', 'Sigrid Ash-Ear', 'Hunting Season', 'I need mantis claws for my winter line. Nine of them, please, and do not damage the pelts.', g('kill', 9, 'Hunt ice mantises', 'icemantis'), { gold: 1180, xp: 1260, items: ['bloodwine', 'a_body_medium_7'] }),
  q('q_f_elite', 'skerrig', 'Brynja Skarn', 'Named Winters', 'The Chancellery keeps a list of frozen warlords. Three of them, retired.', g('elites', 3, 'Slay elite foes'), { gold: 1500, xp: 1500, items: ['recollection', 'x_gemring_7'] }),
  q('q_f_events', 'skerrig', 'Sigrid Ash-Ear', 'Winter Tales', 'Bring me five stories from the snow. They sell very well in the south.', g('events', 5, 'Survive strange encounters'), { gold: 1100, xp: 1180, items: ['folio', 'j_horn'] }),
  q('q_f_harp', 'rimewatch', 'Ragnhild Frostbrand', 'The Ice-Harp', 'There is a harp of ice on the western ridge. It plays itself when someone grieves. Go and be sad at it.', g('reach', 1, 'Visit the Ice-Harp', 'iceharp'), { gold: 900, xp: 1100, items: ['clearwater', 'clearwater', 'cratesupply'] }),
  q('q_f_shades', 'rimewatch', 'Ragnhild Frostbrand', 'White Blanks', 'Whiteout shades cut through the silk. Eight of them, and I will weave you something nice.', g('kill', 8, 'Banish whiteout shades', 'whiteoutshade'), { gold: 1260, xp: 1320, items: ['salts', 'salts', 'a_hands_cloth_7'] }),
  q('q_f_observatory', 'rimewatch', 'Ragnhild Frostbrand', 'What the Sky Wrote', 'The observatory has been writing letters to the aurora. Find out who it is writing to, and silence the Reader.', g('clear', 1, 'Defeat the Star-Reader', 'auroraobservatory'), { gold: 1600, xp: 1480, items: ['u_frost_harpoon', 'lifeblood'] }),
  q('q_f_barrows', 'whalefall', 'Torvald Ice-Eye', 'The Whaleback', 'The old whale is walking again. Put the Hollow Leviathan to rest, and I will sing for you.', g('clear', 1, 'Defeat the Hollow Leviathan', 'whalebarrows'), { gold: 1700, xp: 1560, items: ['u_frost_harpoon', 'lifeblood'] }),
  q('q_f_maw', 'whalefall', 'Torvald Ice-Eye', 'Holes in the Ice', 'Glacier maws have been drilling under the boat-sheds. Seven of them, and we sleep again.', g('kill', 7, 'Plug glacier maws', 'glaciermaw'), { gold: 1180, xp: 1280, items: ['quarrycharge', 'w_hammer_7'] }),
  q('q_f_giant', 'whalefall', 'Torvald Ice-Eye', 'The Giant in the Fjord', 'A Rime Giant walks the fjord. It has not hurt anyone yet. It has not not hurt anyone either.', g('kill', 1, 'Slay a Rime Giant', 'rimegiant'), { gold: 1800, xp: 1640, items: ['set_frost2_body', 'lucid'] }),
];

const events = [
  E('ev_f_harp', 'The Ice-Harp', 'm_ruins', 'wild snow aurora', 'A harp of clear ice stands on the ridge, strings of frozen rain. When the wind passes it plays a chord, and the chord is somebody you lost.', [
    c('Play a note', 'Add one voice.', [san(10), xpL(0.2), log('The harp answers with a very small, very soft sound.', 'good')], { check: ck('will', 15), fail: [san(-8), log('The chord breaks.', 'bad')] }),
    c('Break a string', 'Take the silence home.', [loot('rare'), corrupt(1)]),
    c('Walk on', 'Let it grieve for you.', leave)], 'crystal'),
  E('ev_f_fire', 'The Last Fire', 'campfire', 'wild snow aurora', 'A small fire on a field of snow, the only warm thing for ten miles. No logs, no fuel. It burns on itself, and beside it, a single empty seat.', [
    c('Sit and warm yourself', 'Take the empty seat.', [hpp(50), san(12), corrupt(1)]),
    c('Feed it a coin', 'It is hungry.', [loot('rare'), gold(-60)]),
    c('Pass by', 'You are not that cold.', leave)], 'fire'),
  E('ev_f_whiteout', 'Whiteout', 'm_snow', 'wild snow aurora', 'The world goes white without warning. The snow does not fall; it simply becomes the air. You hear your own footsteps, and then, a half-second after, someone else’s.', [
    c('Stand still', 'Wait it out.', [san(-4), hpp(10)], { cost: { supplies: 1 } }),
    c('Follow the other footsteps', 'They know the way.', [goldR(120, 200), wild('elite')], { check: ck('cunning', 14), fail: [hp(-22)] }),
    c('Light a flare', 'Make them find you.', [wild(), xpL(0.15)])], 'figure'),
  E('ev_f_aurora', 'The Aurora Descends', 'sigil', 'wild snow aurora', 'A ribbon of green light comes down from the sky and lies across the snow in front of you, as if it had been dropped. When you step on it, it is warm.', [
    c('Follow it', 'See where it leads.', [lore(), xpL(0.2)]),
    c('Gather some', 'It will not hold, but try.', [item('j_cluster'), san(-3)], { check: ck('cunning', 14), fail: [hp(-14)] }),
    c('Walk through it', 'Let it change you.', [san(8), corrupt(1)])], 'circle'),
  E('ev_f_ballroom', 'A Frozen Ballroom', 'e_hooded', 'aurora', 'A grand room of ice. Three hundred figures dance in frozen pairs, cloaked and masked, lit by a chandelier of icicles. Not one of them has a face. A single couple is missing from the floor.', [
    c('Take the empty place', 'Join the dance.', [san(-6), loot('epic')], { check: ck('will', 15), fail: [hp(-24), wild('elite')] }),
    c('Pick a pocket', 'They will not notice.', [goldR(140, 240), corrupt(1)]),
    c('Slip away', 'You were never invited.', leave)], 'mask'),
  E('ev_f_telescope', 'The Great Telescope', 'm_tower', 'aurora', 'A telescope of ice and brass, as long as a ship, pointed at the black sun. In the eyepiece, the sun is not black. It is full of small lights, each a window.', [
    c('Look', 'Everything is a window.', [lore(), san(-8), xpL(0.25)]),
    c('Turn it away', 'Aim it somewhere kinder.', [san(8), loot('rare')]),
    c('Break the lens', 'Some things should not be watched.', [corrupt(1), goldR(120, 200)])], 'crystal'),
  E('ev_f_waterfall', 'The Frozen Waterfall', 'fountain', 'aurora', 'A waterfall stopped in mid-fall, a column of glass. Behind it, in the ice, you can see a shape: a person, very still, with one hand pressed against the other side.', [
    c('Break the ice', 'Let them out.', [loot('epic'), san(-6)], { check: ck('vigor', 15), fail: [hp(-22)] }),
    c('Press your hand to the ice', 'Offer company.', [san(10), xpL(0.2)]),
    c('Leave them', 'They have waited this long.', [san(-3)])], 'pool'),
  E('ev_f_courier', 'A Courier of Snow', 'c_letter', 'aurora', 'A messenger of packed snow stands in the corridor, one arm raised, a letter in its fist. The letter is addressed to Skadi Hrimm. The handwriting is yours.', [
    c('Read the letter', 'Spoil it, if you must.', [lore(), san(-6)]),
    c('Deliver it', 'To the Queen.', [loot('rare'), xpL(0.15)]),
    c('Burn it', 'You wrote it, after all.', [corrupt(1), san(5)])], 'book'),
];

const scenes = [
  sc('s_frost_barrows', 'aurora', [
    ['narrator', 'The Hollow Leviathan sings one long, low note, and the ice around you rings with it. Then the great ribs sag, the blow-hole closes, and the whale, or what was shaped like a whale, becomes a hill again.'],
    ['narrator', 'Torvald stands at the edge of the ice with his old harpoon lowered. He does not salute you. He lifts his chin toward the sea, and the whole camp, in a low unison, starts to sing.', { eff: [xpL(0.3), san(-2)] }],
  ]),
  sc('s_frost_arrive', 'skerrig', [
    ['narrator', 'The fjord road ends at Skerrig. A grey harbour, every roof turned to the sky, every window dark but for the aurora overhead: slow ribbons of green and violet unfurling above the roofs, listening. In the harbour, whalers’ boats sit in black ice, quiet as sleeping animals.'],
    ['narrator', 'Not a soul on the quay speaks above a murmur. The whole city holds its breath, and the sky overhead holds it with them.', { eff: [arc('frost', 1), xpL(0.25)] }],
  ]),
  sc('s_brynja_brief', 'skerrig', [
    ['brynja', '“You arrive in a quiet city,” Brynja says. “Do not mistake it for peaceful. Three hundred years ago the Queen of this country stopped time at the edge of her palace. She meant to preserve her people. She preserved them very well.” She turns the lamp on her shoulder a quarter-inch. “They are standing in the Glass Keep now, mid-dance, mid-bow, mid-breath. We have nothing to bury.”'],
    ['brynja', '“The Observatory holds the first key. The Silent Mere, the second. Ragnhild in Rimewatch can weave them into a mantle that will let you walk into the Keep without freezing. Then, the Still Point. Then, the Queen. You will want a good coat.”', { choices: [
      ch('“Why did she stop it?”', '3'), ch('“Is she dangerous?”', '4'), ch('“I’ll start at the Observatory.”', '5')] }],
    ['brynja', '“Because something was about to end. She would not let it. She never told us what.”', { id: '3', next: '5' }],
    ['brynja', '“Only to those who move. Please move carefully.”', { id: '4', next: '5' }],
    ['brynja', '“Good. Take this.” She hangs a lamp on your belt. “It does not give heat. It gives direction. In a whiteout, that is better.”', { id: '5', eff: [item('lampoil', 2), arc('frost', 2), xpL(0.2)] }],
  ]),
  sc('s_frost_observatory', 'aurora', [
    ['narrator', 'The Star-Reader sets down her pen. Her robe of woven constellations dims, one star at a time, until it is only cloth. At her feet, a single sheet of paper, covered end to end with the same sentence, in your handwriting: Do not wake her.'],
    ['narrator', 'On her desk, pressed between two panes of ice, a thread of aurora, green and living. It leaps to your hand when you reach for it, and tucks itself into your glove.', { eff: [flag('frost_thread1'), xpL(0.3), san(-3)] }],
  ]),
  sc('s_frost_mere', 'aurora', [
    ['narrator', 'The Mere-Warden steps aside, and the ice beneath you goes clear. Below, in the blue light of a drowned noon, a city lies on the bed of the lake, each building intact, each street empty. In the centre, in the town square, a single lamp burns.'],
    ['narrator', 'It rises toward you through the water, a thread of violet-green light on a hook of ice. When you take it, the lake hums, once, a deep, grateful note, and for a heartbeat, you hear it: the first sound the Mere has made in three hundred years.', { eff: [flag('frost_thread2'), xpL(0.3), san(-3)] }],
  ]),
  sc('s_torvald_hrim', 'whalefall', [
    ['narrator', 'Old Torvald has been watching the wolf pup for three days. It has watched him back, three paces off, never closer. Now, when you walk into camp, it pads over, sits on your boot, and looks up with a pair of eyes the colour of moonlight on snow.'],
    ['torvald', '“Well,” says Torvald. “He has picked.” His voice is rough. “He was a stray. He followed the boats. I never gave him a name, because I did not want to be the one to lose him.” He scratches the pup’s ear. “Go on, then. Take him. He is yours. Teach him something kind.”', { eff: [recruit('Hrim'), xpL(0.2)] }],
  ]),
  sc('s_ragnhild_mantle', 'rimewatch', [
    ['ragnhild', '“Two threads,” Ragnhild says. She touches them, once, and they brighten. “Thread of the Observatory, thread of the Mere. Both from the same loom, though they never met.” She sets them on her frame, hums a note, and begins to weave. The colours climb out of the loom in layers: green, violet, white, a blue that you do not have a name for.'],
    ['ragnhild', 'By the time she is done, a mantle hangs in front of you. It is a garment made of light and wind, cool as snow and quiet as a held breath. It does not weigh. It listens. It will keep you alive in the Keep.', { choices: [
      ch('“Why did she freeze them?”', '3'), ch('“Thank you.”', '4')] }],
    ['ragnhild', '“Because she loved them. It is the only reason anyone stops anything.”', { id: '3', next: '5' }],
    ['ragnhild', '“Do not thank me. Go and be kind. The Queen has had a very long, cold wait.”', { id: '4', next: '5' }],
    ['narrator', 'You put the mantle on. For a breath, the whole world is quiet and clear. Then, far to the north, a perfect circle of bare ground opens in the snow.', { id: '5', eff: [flag('frost_mantle'), arc('frost', 6), xpL(0.3), unlock('glasskeep')] }],
  ]),
  sc('s_frost_still', 'aurora', [
    ['narrator', 'The Still Point is a perfect circle of bare black stone, forty paces across, ringed by snow that does not fall into it. No wind. No sound. In the centre, a single footprint in the ice, pointing toward the Keep, and a deep, cold, patient silence.'],
    ['narrator', 'You step into the circle, and the mantle hums. Overhead, the aurora gathers itself, folds, and lays a road of green fire across the sky toward the Glass Keep.', { eff: [arc('frost', 7), xpL(0.35), san(-3)] }],
  ]),
  sc('s_skadi_end', 'glasskeep', [
    ['narrator', 'The Winter Queen rises from her throne for the first time in three hundred years. The snow at her feet begins, slowly, to fall. Three hundred courtiers stir in the ballroom behind you, and begin, awkwardly, to finish their dance.'],
    ['skadi', '“You are late,” she says, not unkindly. “I was waiting for the end of the sentence.” She holds the Frost-Mantle’s twin, a cloak of white and silver, in both hands. “I stopped it because something was coming. It was a good reason. It is always a good reason. And it came anyway, and I was still, and so were they.”', { choices: [
      ch('Take the Frost-Mantle.', '2'), ch('“What was coming?”', '3')] }],
    ['skadi', '“Sorrow,” she says. “Only that. I could not bear to see it arrive. It arrives all the same, whether you watch or not.”', { id: '3', next: '2' }],
    ['narrator', 'The Frost-Mantle settles over your shoulders. It does not weigh. It breathes. Across the Keep, a thousand icicles begin to melt, and in the ballroom, three hundred masked dancers finish their bows, straighten, and walk out into the first real night in three hundred years.', { id: '2', eff: [regalia('frost'), arc('frost', 8), xpL(0.6), gold(1100), san(-4)] }],
  ]),
  sc('s_brynja_after', 'skerrig', [
    ['brynja', '“The city is making noise,” Brynja says, wonderingly. “I can hear it from my window. People are talking, in the street, at the top of their voices. It is dreadful.” She turns the lamp on her shoulder a quarter-inch, and the aurora overhead turns with it. “Skerrig will remember you. Loudly.”'],
  ]),
];

const items = [
  gearItem('reg_frost', 'The Frost-Mantle', 'b_cloak', 'body', 'mythic', 8, 'Skadi’s cloak of aurora-silk. It keeps the cold in, and the warmth out, and the grief where it belongs.', { armor: 50, maxHp: 80, maxSanity: 30, dodge: 6, will: 6, thorns: 6 }, { set: 'regalia' }),
  gearItem('u_frost_harpoon', 'The Whalesong Harpoon', 'w_trident', 'weapon', 'epic', 7, 'A whaler’s harpoon whose shaft is a single narwhal tusk. It sings when you throw it.', { damage: 72, crit: 12, lifesteal: 4, dodge: 4 }),
  ...armorSet('frost2', 7, 'epic', {
    head: ['Aurora Veil', 'h_cowl', 'A veil of pale silk that hides the wearer from the sky.'],
    body: ['Rimeweave Robes', 'b_cloth', 'Cold as a breath, warm as a secret.'],
    hands: ['Frostglass Gloves', 'g_cloth', 'They never freeze to anything. Not even regret.'],
    feet: ['Snowstep Boots', 'f_cloth', 'You leave no footprint.'],
  }, { head: { maxSanity: 2, will: 0 }, body: { maxHp: 3, maxSanity: 2 }, hands: { crit: 1, dodge: 1 }, feet: { dodge: 2, maxHp: 1 } }),
];

export const FROST: RegionPack = {
  id: 'frost',
  zone: { id: 'frost', name: 'Aurora Reach', at: [78, 6], lvl: 45, pool: ['aurorawisp', 'icemantis', 'iciclehound', 'frostbound', 'whiteoutshade'], biome: 'aurora', elite: 'rimegiant', bg: 'aurora' },
  towns, dungeons, landmarks, enemies, quests, events, scenes, items,
  links: [['brasshaven', 'skerrig'], ['skerrig', 'rimewatch'], ['skerrig', 'whalefall'], ['skerrig', 'auroraobservatory'], ['whalefall', 'silentmere'], ['whalefall', 'glasskeep'], ['rimewatch', 'whalebarrows']],
  speakers: {
    brynja: { name: 'Brynja Skarn', title: 'Chancellor of Skerrig', icon: 'e_barbarian', color: '#a0ffe0', look: 'hood' },
    ragnhild: { name: 'Ragnhild Frostbrand', title: 'Weaver of Aurora-Silk', icon: 'e_hermit', color: '#e0fff0', look: 'veil' },
    skadi: { name: 'Skadi Hrimm', title: 'The Winter Queen', icon: 'e_crowned', color: '#c8f0ff', look: 'crown' },
    torvald: { name: 'Torvald Ice-Eye', title: 'Harpooner', icon: 'e_polar', color: '#d8f0ff', look: 'cowl' },
  },
  arc: {
    id: 'frost', title: 'The Frost-Mantle', region: 'frost', lvl: 43, regalia: 'frost',
    blurb: 'The seventh Regent ruled by stillness, and held the whole realm still so nothing could be lost.',
    steps: [
      { title: 'The Chancellor', obj: 'Speak with Brynja Skarn in Skerrig.', text: 'Skerrig has been quiet for three centuries. Brynja knows why.', at: 'skerrig' },
      { title: 'The Aurora Observatory', obj: 'Defeat the Star-Reader in the Aurora Observatory.', text: 'The first thread of aurora lies in the Observatory’s ice.', at: 'auroraobservatory', goal: g('clear', 1, 'Defeat the Star-Reader', 'auroraobservatory') },
      { title: 'Break the Frost', obj: 'Enter the Whaleback Barrows and defeat the Hollow Leviathan.', text: 'The cold-things have spilled out of the Keep and the Whaleback is walking again. Put the leviathan to rest.', at: 'whalebarrows', goal: g('clear', 1, 'Defeat the Hollow Leviathan', 'whalebarrows') },
      { title: 'The Silent Mere', obj: 'Defeat the Mere-Warden in the Silent Mere.', text: 'The second thread lies at the bottom of a frozen lake.', at: 'silentmere', goal: g('clear', 1, 'Defeat the Mere-Warden', 'silentmere') },
      { title: 'The Weaver', obj: 'Take both threads to Ragnhild Frostbrand in Rimewatch.', text: 'Only a weaver of aurora-silk can make a mantle that will survive the Keep.', at: 'rimewatch' },
      { title: 'The Still Point', obj: 'Stand at the Still Point in the northern snow.', text: 'The one patch of bare ground in the world, where the Queen’s road begins.', at: 'glasskeep', goal: g('reach', 1, 'Reach the Still Point', 'stillpoint') },
      { title: 'Hrimm’s Glass Keep', obj: 'Enter the Glass Keep and face Skadi Hrimm, the Winter Queen.', text: 'Five floors of ice, three hundred frozen dancers, and a Queen who has been waiting for the end of a sentence.', at: 'glasskeep', goal: g('clear', 1, 'Defeat the Winter Queen', 'glasskeep') },
    ],
  },
  triggers: [{ loc: 'skerrig', cond: { mainAt: 'r00' }, scene: 's_frost_arrive' }],
  schools: { skerrig: ['Frost', 'Discipline', 'Hex'] },
  sets: { frost2: { name: 'Aurorawoven', two: { maxSanity: 14, will: 3 }, four: { maxSanity: 20, will: 5, maxHp: 50, dodge: 8 }, blurb: 'Woven from ribbons of the northern lights. It keeps what it wraps.' } },
  bossLoot: { hollowleviathan: ['u_frost_harpoon'], starreader: ['set_frost2_head'], merewarden: ['set_frost2_feet'], skadi: ['set_frost2_body', 'set_frost2_hands'] },
};
