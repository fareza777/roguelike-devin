import { E, FULL, aff, armorSet, arc, c, ch, ck, corrupt, dg, en, flag, g, gold, goldR, gearItem, hp, hpp, item, leave, log, loot, lore, npc, q, recruit, regalia, san, sc, town, tt, unlock, wild, xpL } from '../kit';
import type { RegionPack } from './pack';

const UD = 'deep';

const towns = [
  town({
    id: 'lumenhollow', name: 'Lumen Hollow', kind: 'city', subtitle: 'The City Under the Bones', region: UD, pos: [8, 6], icon: 'm_city', art: 'lumenhollow', tier: 8,
    desc: 'A vast cavern lit from within by glowing fungus, cut into terraces of stone houses and ink-wells. Lamplighters walk the streets with long poles, tending a thousand pale blue lamps. Every shelf in every home holds a book. Nobody remembers who wrote them.',
    theme: tt('#041014', '#5af0d0', '#d0fff0'), services: FULL, shopTags: ['tome', 'staff', 'dagger', 'cloth', 'potion', 'orb'],
    rumors: ['The Archivist writes down everything that has ever happened. The Hollow dreads the day the book is finished.', 'Every child here is given a ledger at birth. Nobody has ever been allowed to see what is written in it.', 'The lamps do not need oil. They need names, read aloud, once a year.', 'There is a page in the Final Index that is still blank, and it is not for lack of ink.'],
    npcs: [
      npc('odalys', 'Odalys Reed', 'Head Lamplighter-Librarian', 'e_wizard', 'A narrow woman in a coat of inked parchment, carrying a lamp on a pole and a book under one arm, equally ready to light or to read.', ['“The dark is not the enemy. The unread is.”', '“Every book here is a debt. Every lamp is a receipt.”', '“Do not read your own page. I have known people who did. They were never able to put it down.”'], [{ cond: { arc: ['ledger', 1] }, scene: 's_odalys_brief' }, { cond: { arcMin: ['ledger', 8] }, scene: 's_odalys_after' }], 'veil'),
      npc('cass', 'Cass Inkwell', 'Scrivener', 'e_goblin', 'A short, ink-stained figure with a quill behind each ear and a very bad cough.', ['“Write it down. Anything. It does not matter. Someone will read it eventually.”']),
      npc('moll', 'Moll Lanternhand', 'Lamp-Tender', 'e_hermit', 'An old woman with one hand wrapped in a lamp-glove, humming to a very small flame.', ['“I light a lamp, I read a name. It takes a year to do them all, and then it starts again.”']),
    ],
  }),
  town({
    id: 'inkwell', name: 'Inkwell', kind: 'village', subtitle: 'The Bindery', region: UD, pos: [3, 3], icon: 'm_town', art: 'inkwell', tier: 8,
    desc: 'A cluster of workshops around a still black pool. The binders here stitch books from the cave’s own hide, and pour ink from the pool, and never ask where it came from.',
    theme: tt('#03080c', '#80f0ff', '#e0ffff'), shopTags: ['tome', 'potion', 'staff'],
    rumors: ['The black pool never ripples. It is the only thing in the Underdeep that does not listen.', 'The Binder keeps a ledger of every ring she has ever made, and every promise they held.'],
    npcs: [npc('polly', 'Polly Marginalia', 'Binder', 'e_witch', 'A thin woman in an apron stained to the elbows, who holds a bone folder like a scalpel.', ['“A book is only as honest as its spine.”', '“I bind rings too. Same principle. A ring is a book you wear.”'], [{ cond: { arc: ['ledger', 5] }, scene: 's_polly_ring' }], 'veil')],
  }),
  town({
    id: 'gloamstep', name: 'Gloamstep', kind: 'village', subtitle: 'The Last Stair', region: UD, pos: [11, 9], icon: 'm_town', art: 'gloamstep', tier: 8,
    desc: 'A village on a stair that goes up into the dark and down into a darker one. Every house is a landing. Every landing has a candle. The villagers will tell you, politely, that it does not matter which way you go.',
    theme: tt('#03080a', '#a0ffe8', '#e8fff8'), shopTags: ['potion', 'bomb', 'medium'],
    rumors: ['There is a staircase in the Underdeep that goes up forever. Some people take it, and none have come back. All of them wrote ahead to say they were fine.', 'A moth the size of a cat follows the lamplighters. It is called Glimmer. It will not say who by.'],
    npcs: [npc('wenna', 'Wenna Stairwell', 'Landlady', 'e_bellkeeper', 'A short, stout woman with a candle in a jar and an expression of permanent apology.', ['“The room is nine coppers. The stairs are free. Mind the third step. It is not a step.”'], [{ cond: { arcMin: ['ledger', 3], not: 'comp_glimmer' }, scene: 's_wenna_glimmer' }])],
  }),
];

const dungeons = [
  dg({ id: 'glowcapwarrens', name: 'The Glowcap Warrens', subtitle: 'A forest of light under the stone', desc: 'A cavern of glowing fungus, ten fathoms tall, threaded with warrens and webs. The spores are beautiful. The things that harvest them are less so.', art: 'underdeep', theme: 'deep', floors: 3, lvl: 47, enemies: ['glowcap', 'cavestrider', 'lampmoth', 'blindfish'], elite: 'colophongiant', boss: 'sporeking', size: [29, 21], pos: [2, 10], icon: 'm_mushroom', secretItem: 'u_quill_lens' }),
  dg({ id: 'unlitlibrary', name: 'The Unlit Library', subtitle: 'Shelves that go down for ever', desc: 'A library where the lamps went out and the books stayed. The shelves reach into the dark in every direction, and every shelf holds a book you have not read.', art: 'underdeep', theme: 'deep', floors: 3, lvl: 47, enemies: ['archiveclerk', 'silverswarm', 'bookworm', 'shelfmimic'], elite: 'vaultwarden', boss: 'indexsilence', size: [29, 21], pos: [12, 2], cond: { arcMin: ['ledger', 2] }, clear: 's_ledger_library', icon: 'm_archive' }),
  dg({ id: 'ledgerhalls', name: 'The Ledger Halls', subtitle: 'Where every debt was entered', desc: 'Corridor after corridor of ledgers, each one the width of a door. Clerks walk the aisles, adding. They have been adding for three hundred years, and they have not yet finished the sum.', art: 'underdeep', theme: 'deep', floors: 3, lvl: 49, enemies: ['archiveclerk', 'inkwraith', 'pageflayer', 'memoryleech', 'stackguard'], elite: 'vaultwarden', boss: 'vellum', size: [31, 23], pos: [4, 7], cond: { arcMin: ['ledger', 4] }, clear: 's_ledger_halls', icon: 'm_dungeon' }),
  dg({ id: 'finalindex', name: 'The Final Index', subtitle: 'The last page of the last book', desc: 'The central stack of the Archive: a spiral of shelves going down into a dark so deep it has a texture. At the bottom, a desk, a quill, and a very old man who has not stopped writing since before the sun died.', art: 'finalindex', theme: 'deep', floors: 5, lvl: 51, enemies: ['archiveclerk', 'indexgolem', 'memoryleech', 'voidcrawler', 'stackguard'], elite: 'colophongiant', boss: 'quill', size: [33, 25], pos: [9, 1], cond: { arcMin: ['ledger', 7] }, clear: 's_quill_end', mainBoss: true, icon: 'm_castle' }),
];

const landmarks = [
  { id: 'blankpage', name: 'The Blank Page', icon: 'tablet', pos: [7, 10] as [number, number], scene: 's_ledger_page', lvl: 50, cond: { arc: ['ledger', 6] as [string, number] }, hint: 'A slab of white stone, perfectly smooth, set into the cavern floor. It seems to be waiting for someone to write on it.' },
  { id: 'inkpool', name: 'The Black Pool', icon: 'fountain', pos: [5, 1] as [number, number], event: 'ev_u_pool', once: true, lvl: 48 },
  { id: 'sealedstack', name: 'The Sealed Stack', icon: 'm_ruins', pos: [10, 8] as [number, number], event: 'ev_u_stack', once: true, lvl: 49 },
];

const enemies = [
  en('glowcap', 'Glowcap Stalker', 'e_eviltree', 'brute', 'plant deep', ['attack', 'afflict', 'heavy'], 'A mushroom the height of a house that has learned to walk, and to prefer light.', { ...aff('poison'), look: 'plant' }),
  en('cavestrider', 'Cave Strider', 'e_spider', 'skirmisher', 'beast deep', ['attack', 'heavy', 'attack'], 'A long-legged cave arachnid with a body like a coat-hanger and opinions about your lantern.', { ...aff('bleed'), look: 'crawler' }),
  en('lampmoth', 'Lamp-Moth', 'e_moth', 'caster', 'beast deep', ['dread', 'attack', 'afflict'], 'A moth the size of a cat, feeding on the glow of every lamp in the Hollow. It will not give them back.', { ...aff('weak'), dread: 2, look: 'winged' }),
  en('blindfish', 'Blindfish', 'e_piranha', 'skirmisher', 'beast deep', ['attack', 'attack', 'afflict'], 'A pale, eyeless swimmer in the underground streams. It swims through stone, too.', { ...aff('bleed'), look: 'worm' }),
  en('archiveclerk', 'Archive Clerk', 'e_hooded', 'caster', 'human deep', ['afflict', 'dread', 'attack'], 'A masked, ink-stained functionary who writes your death on a slip of paper and slides it under the door.', { ...aff('weak'), dread: 2, look: 'hood+mask' }),
  en('silverswarm', 'Silverfish Swarm', 'e_scarab', 'swarm', 'beast deep', ['attack', 'attack', 'afflict'], 'A glittering river of paper-eating insects. They are not hungry. They are thorough.', { ...aff('bleed'), look: 'swarm' }),
  en('bookworm', 'Great Bookworm', 'e_wormmouth', 'brute', 'beast deep', ['heavy', 'afflict', 'heavy'], 'A worm the size of a barge, spine-first through the shelves. It reads as it goes.', { ...aff('weak'), look: 'worm' }),
  en('shelfmimic', 'Shelf Mimic', 'e_slime', 'tank', 'deep', ['guard', 'heavy', 'afflict'], 'A bookcase with a great many teeth. The books are real. They are also, regrettably, teeth.', { ...aff('bleed'), look: 'blob' }),
  en('inkwraith', 'Ink Wraith', 'e_ghost', 'caster', 'spirit deep', ['afflict', 'dread', 'attack'], 'A creature of spilled ink, drawn in the shape of someone you loved, and smudged.', { ...aff('weak'), dread: 3, look: 'spirit' }),
  en('pageflayer', 'Page-Flayer', 'e_assassin', 'skirmisher', 'human deep', ['attack', 'heavy', 'afflict'], 'A masked figure who skins paper into blades and blades into paper, indifferently.', { ...aff('bleed'), look: 'rogue+mask' }),
  en('memoryleech', 'Memory Leech', 'e_maggot', 'caster', 'beast deep', ['afflict', 'dread', 'afflict'], 'It does not drink blood. It drinks the afternoon you spent with someone, and leaves you the evening.', { ...aff('weak'), dread: 3, look: 'blob' }),
  en('stackguard', 'Stack-Guard', 'e_knight', 'tank', 'construct deep', ['guard', 'heavy', 'attack'], 'A suit of armor made of bound volumes. Do not read it. It is reading you.', { look: 'armor' }),
  en('indexgolem', 'Index Golem', 'e_icegolem', 'tank', 'construct deep', ['guard', 'heavy', 'dread'], 'A golem of bound ledgers, with a single page of paper where a head would be. The page is your name.', { dread: 2, look: 'golem' }),
  en('voidcrawler', 'Void-Crawler', 'e_spider2', 'brute', 'beast deep', ['heavy', 'afflict', 'dread'], 'A black, soundless thing that walks on the edge of the lamp-light and eats the shadow behind you.', { ...aff('weak'), dread: 3, look: 'crawler' }),
  en('colophongiant', 'Colophon Giant', 'e_cyclops', 'brute', 'beast deep elite', ['heavy', 'attack', 'heavy', 'afflict'], 'A giant of cave-stone with a single huge lamp where an eye should be. It reads in its sleep.', { ...aff('weak'), look: 'titan' }),
  en('vaultwarden', 'Vault-Warden', 'e_blackknight', 'tank', 'construct deep elite', ['guard', 'heavy', 'dread', 'heavy'], 'A veiled sentinel with a key for every shelf and no intention of using any.', { dread: 3, look: 'armor+veil' }),
  en('sporeking', 'The Spore-King', 'e_eviltree', 'brute', 'plant deep boss', ['heavy', 'afflict', 'heavy', 'dread'], 'A cap the size of a barn, nodding in a wind that blows from inside it.', { hpMul: 4.2, ...aff('poison'), dread: 3, look: 'plant' }),
  en('indexsilence', 'The Index of Silence', 'e_icegolem', 'caster', 'construct deep boss', ['dread', 'heavy', 'afflict', 'guard'], 'A living catalogue of everything the Library has ever withheld. It speaks in headings.', { hpMul: 4.2, dread: 3, look: 'golem' }),
  en('vellum', 'Clerk-General Vellum', 'e_king', 'brute', 'human deep boss', ['heavy', 'afflict', 'dread', 'guard'], 'The master of the Halls. A tall, veiled clerk whose pen never leaves the page and whose page is never full.', { hpMul: 4.4, dread: 3, ...aff('weak'), look: 'hood+veil' }),
  en('quill', 'Quill, the Archivist', 'e_crowned', 'caster', 'human deep boss', ['dread', 'heavy', 'afflict', 'guard', 'heavy'], 'Eighth Regent of the Meridian. He ruled by the record, and could not forgive what he could not forget.', { hpMul: 5.8, dread: 4, ...aff('weak'), look: 'king' }),
];

const quests = [
  q('q_u_striders', 'lumenhollow', 'Odalys Reed', 'Legs on the Ceiling', 'Cave striders have been taking lamp-poles. Ten of them, and the Hollow sleeps tonight.', g('kill', 10, 'Fell cave striders', 'cavestrider'), { gold: 1500, xp: 1700, items: ['panacea', 'w_dagger_8'] }),
  q('q_u_clerks', 'lumenhollow', 'Odalys Reed', 'Retire the Clerks', 'Archive Clerks have been filing death notices under doors. Eight of them, filed away.', g('kill', 8, 'Retire archive clerks', 'archiveclerk'), { gold: 1600, xp: 1760, items: ['lucid', 'a_head_cloth_8'] }),
  q('q_u_worms', 'lumenhollow', 'Cass Inkwell', 'Paper Eaters', 'Great Bookworms are chewing the first editions. Five, please. Gently.', g('kill', 5, 'Slay great bookworms', 'bookworm'), { gold: 1560, xp: 1720, items: ['bloodwine', 'a_body_medium_8'] }),
  q('q_u_mimics', 'lumenhollow', 'Cass Inkwell', 'Checked Out', 'Shelf Mimics bite when you reach for a book. Seven of them, shelved.', g('kill', 7, 'Shelve shelf mimics', 'shelfmimic'), { gold: 1500, xp: 1680, items: ['quarrycharge', 'w_tome_8'] }),
  q('q_u_elite', 'lumenhollow', 'Odalys Reed', 'The Great Ones', 'The Hollow keeps a record of its giants. Three of them, struck from it.', g('elites', 3, 'Slay elite foes'), { gold: 1900, xp: 1900, items: ['recollection', 'x_gemring_8'] }),
  q('q_u_events', 'lumenhollow', 'Moll Lanternhand', 'Marginalia', 'Bring me five tales from the Underdeep. I will write them in the margins of something old.', g('events', 5, 'Survive strange encounters'), { gold: 1400, xp: 1600, items: ['folio', 'j_starskull'] }),
  q('q_u_pool', 'inkwell', 'Polly Marginalia', 'The Black Pool', 'The pool does not ripple. I want to know why. Go and look.', g('reach', 1, 'Visit the Black Pool', 'inkpool'), { gold: 1100, xp: 1400, items: ['clearwater', 'clearwater', 'cratesupply'] }),
  q('q_u_leeches', 'inkwell', 'Polly Marginalia', 'Missing Afternoons', 'Memory leeches have been taking things from the binders. Eight of them, and I might remember my own name.', g('kill', 8, 'Kill memory leeches', 'memoryleech'), { gold: 1560, xp: 1720, items: ['salts', 'salts', 'a_hands_cloth_8'] }),
  q('q_u_library', 'inkwell', 'Polly Marginalia', 'The Unlit Library', 'The Index of Silence keeps what the Library will not say. Break it, and the lamps can come on.', g('clear', 1, 'Defeat the Index of Silence', 'unlitlibrary'), { gold: 2000, xp: 1900, items: ['u_quill_lens', 'lifeblood'] }),
  q('q_u_warrens', 'gloamstep', 'Wenna Stairwell', 'The Spore-King', 'A great cap nods in the warren below my stair. It is not threatening. It is simply nodding at me.', g('clear', 1, 'Defeat the Spore-King', 'glowcapwarrens'), { gold: 2100, xp: 1980, items: ['u_quill_lens', 'lifeblood'] }),
  q('q_u_moths', 'gloamstep', 'Wenna Stairwell', 'Lamp-Moths', 'They eat the stair-lamps. Nine of them, and I will find you a better bed.', g('kill', 9, 'Fell lamp-moths', 'lampmoth'), { gold: 1500, xp: 1680, items: ['nightshade', 'nightshade', 'a_feet_cloth_8'] }),
  q('q_u_giant', 'gloamstep', 'Wenna Stairwell', 'The Giant Who Reads', 'A Colophon Giant walks the stair every dusk, reading. It is not violent. It is simply in the way.', g('kill', 1, 'Slay a Colophon Giant', 'colophongiant'), { gold: 2200, xp: 2100, items: ['set_deep_body', 'lucid'] }),
];

const events = [
  E('ev_u_pool', 'The Black Pool', 'fountain', 'wild deep', 'A pool of ink, perfectly black, perfectly still. Nothing ripples. When you lean over it, your reflection is already there, a hooded shape, writing.', [
    c('Read what it writes', 'Over your shoulder.', [lore(), san(-6), xpL(0.25)], { check: ck('will', 16), fail: [san(-12), corrupt(1)] }),
    c('Dip a quill', 'Take some ink.', [item('j_cluster'), loot('rare')]),
    c('Throw a stone', 'See if it ripples.', [goldR(140, 240), log('The stone sinks without a sound.', 'plain')])], 'pool'),
  E('ev_u_stack', 'The Sealed Stack', 'm_ruins', 'wild deep', 'A shelf behind a locked grille, ten feet high, packed with books bound in grey. Each spine is stamped with the same word: Unforgiven.', [
    c('Pick the lock', 'Take one.', [loot('epic'), corrupt(1)], { check: ck('cunning', 16), fail: [hp(-28)] }),
    c('Read the spines', 'Count them.', [lore(), san(-6)]),
    c('Leave them be', 'Some stacks should stay closed.', leave)], 'book'),
  E('ev_u_lamp', 'A Lamp Without a Name', 'o_lantern', 'wild deep', 'A single blue lamp, hanging from a hook in the middle of nowhere, burning bright. Under it, a small brass plate, blank.', [
    c('Read a name to it', 'Give it one.', [hpp(40), san(10), xpL(0.2)], { check: ck('will', 15), fail: [san(-8)] }),
    c('Take the lamp', 'Light the way.', [item('suncandle'), corrupt(1)]),
    c('Put it out', 'Dark is its own comfort.', [loot('rare'), san(-4)])], 'lantern'),
  E('ev_u_reading', 'The Reading Room', 'tablet', 'wild deep', 'A long room with a hundred desks, each with a book open to a blank page. At each desk, a veiled figure sits perfectly still, a quill in hand, not writing.', [
    c('Sit and write', 'Take the empty chair.', [lore(), san(-6), xpL(0.25)]),
    c('Read over a shoulder', 'They do not mind.', [goldR(140, 240)], { check: ck('cunning', 15), fail: [wild('elite')] }),
    c('Close the door quietly', 'Not a place to disturb.', leave)], 'figure'),
  E('ev_u_fungus', 'A Meadow of Glowcaps', 'm_mushroom', 'deep', 'A meadow of glowing mushrooms, tall as a man. Each cap pulses slowly, and each pulse is a word. Together they spell a sentence, and the sentence is a recipe.', [
    c('Harvest a cap', 'Careful. They bite back.', [item('elixir', 2), goldR(80, 140)], { check: ck('cunning', 14), fail: [hp(-18), san(-4)] }),
    c('Read the recipe', 'It makes sense.', [lore(), san(-4)]),
    c('Dim the light', 'You are not alone in the dark.', [san(6)], { cost: { supplies: 1 } })], 'tree'),
  E('ev_u_stair', 'The Stair That Goes Up', 'stairs_up', 'deep', 'A spiral staircase of black stone, leading up into a dark so complete it has weight. Someone has left a lantern at the foot, still lit, and a note: “I will be back in an hour.” The note is eighty years old.', [
    c('Climb it', 'See how high it goes.', [loot('epic'), san(-8)], { check: ck('will', 16), fail: [hp(-26), san(-8)] }),
    c('Take the lantern', 'Someone should.', [item('suncandle'), log('The flame steadies.', 'plain')]),
    c('Wait for them', 'The hour is almost up.', [san(5), xpL(0.1)])], 'arch'),
  E('ev_u_ink', 'An Overflowing Inkwell', 'c_flask', 'deep', 'A well of ink in the floor, overflowing, flooding the corridor ankle-deep. Letters float on its surface, forming, dissolving, forming again.', [
    c('Wade in', 'Read what it says.', [lore(), san(-5), xpL(0.2)], { check: ck('vigor', 15), fail: [hp(-18)] }),
    c('Fill a vial', 'Might be useful.', [item('blightjar'), item('nightshade')]),
    c('Step around it', 'Not your story.', leave)], 'vial'),
  E('ev_u_whisper', 'The Whispering Gallery', 'e_hooded', 'deep', 'A long corridor of arches. Every few paces, a veiled figure in a niche, whispering. They all whisper the same sentence. It takes a moment to realise it is a sentence you said, years ago, and have since forgotten.', [
    c('Listen to the whole thing', 'It is not a nice sentence.', [lore(), san(-10), xpL(0.25)]),
    c('Whisper it back', 'Finish it.', [san(10), loot('rare')], { check: ck('will', 16), fail: [san(-12), corrupt(1)] }),
    c('Cover your ears', 'And walk fast.', [san(-2)])], 'mask'),
];

const scenes = [
  sc('s_ledger_arrive', 'lumenhollow', [
    ['narrator', 'The tunnel opens and the Underdeep opens with it: a cavern so vast its far wall is a smudge, lit from within by ten thousand glowing caps, each a pale blue star. Terraces of stone houses climb the walls, a lamp at every door, a book on every sill. Lamplighters in veiled hoods drift between them with long poles, touching each flame in turn.'],
    ['narrator', 'The whole city is whispering, very softly, and it takes a moment to understand what it is whispering. It is reading names. Yours is among them.', { eff: [arc('ledger', 1), xpL(0.25)] }],
  ]),
  sc('s_odalys_brief', 'lumenhollow', [
    ['odalys', '“I do not need to see the key,” Odalys says. “The lamps lit when you came down the stair. They have not done that in a hundred years.” She lowers her pole. “The Archivist writes everything down. Everything that has ever happened to anyone, in the Final Index. He cannot stop. He is not cruel. He simply cannot forget, and he cannot forgive, and there is no room in a record for either.”'],
    ['odalys', '“There is a ring: the Ledger-Ring. It is a book you wear. If you take it from him, you take the ability to forgive from the Archive. Perhaps that is the right thing. Perhaps it is the worst thing. Take the Unlit Library first. Then the Ledger Halls. Then Polly Marginalia, in Inkwell, will bind your key.”', { choices: [
      ch('“What is in the Final Index?”', '3'), ch('“What is my page?”', '4'), ch('“I will begin with the Library.”', '5')] }],
    ['odalys', '“Everything. That is the horror and the point. Every moment of every person who ever lived, set down in a clerk’s hand.”', { id: '3', next: '5' }],
    ['odalys', '“I do not know. I have never read mine. I do not intend to.”', { id: '4', next: '5' }],
    ['odalys', '“Good. Take this.” She hands you a small blue lamp. “It will light itself if someone is reading you. Do not be alarmed if it is always lit.”', { id: '5', eff: [item('suncandle'), arc('ledger', 2), xpL(0.2)] }],
  ]),
  sc('s_ledger_library', 'underdeep', [
    ['narrator', 'The Index of Silence closes its last page, and every lamp in the Unlit Library flickers on at once. For the first time in three hundred years, you can see the shelves: miles of them, ranked in long spirals, every volume the same shade of grey. On the lectern in the centre, a single sheet of paper, covered with a single word, written again and again.'],
    ['narrator', 'The word is Sorry. Beneath it, pinned to the lectern by an ink-black quill, a small, bright page. It rises when you touch it, and slips into your journal.', { eff: [flag('ledger_page1'), xpL(0.3), san(-3)] }],
  ]),
  sc('s_ledger_halls', 'underdeep', [
    ['narrator', 'Clerk-General Vellum lowers his pen. The ledgers around you close, one by one, in a long, soft wave of sound. The clerks in the aisles stop adding. For a moment the Halls are silent, and in the silence, you hear a very faint voice, a long way off, reading out a sum.'],
    ['narrator', 'On the Clerk-General’s desk, a second page, thin as breath, with a single entry in a long, sad hand: Balanced. When you pick it up, the sum in the distance stops.', { eff: [flag('ledger_page2'), xpL(0.3), san(-3)] }],
  ]),
  sc('s_wenna_glimmer', 'gloamstep', [
    ['narrator', 'The moth has been at the window for three nights. Wenna keeps a saucer of honey out for it, and says nothing. Now, when you come in, the moth crosses the room in a single flutter and lands on your sleeve. Its wings glow, very softly, with a light that is not quite blue and not quite gold.'],
    ['wenna', '“Glimmer,” Wenna says. “She is called Glimmer. I do not know who named her. She was here when I took the stair.” She touches the moth’s wing with one finger, gently. “She has never landed on anyone. She is very choosy. You might want to take her, before she changes her mind.”', { eff: [recruit('Glimmer'), xpL(0.2)] }],
  ]),
  sc('s_polly_ring', 'inkwell', [
    ['polly', '“Two pages,” Polly says, with a touch of awe. “Silence and Balance. I thought the Halls would never give them up.” She spreads them on the bench, runs a bone folder along each edge, and begins to stitch them with a thread of black silk. The pages curl, fold, and wrap around a band of bone, slowly becoming a ring, plain, dark, and very heavy.'],
    ['polly', '“This is not the Ledger-Ring,” she says. “It is the key to it. The Ring itself is in the Index, on the Archivist’s hand. This will let you reach him. And it will let you read one page, just once, of the Index.” She hesitates. “Would you like to know which?”', { choices: [
      ch('“Yes.”', '3'), ch('“No. I will read it when I get there.”', '4')] }],
    ['polly', '“Your own. It is on the Blank Page. It is the only page of the Index that is still being written.”', { id: '3', next: '5' }],
    ['polly', '“Good. Wise. The page will still be there, and so will you.”', { id: '4', next: '5' }],
    ['narrator', 'You slide the bone ring onto your finger. It is warm, and a little too tight, and it hums with something like recognition.', { id: '5', eff: [flag('ledger_key'), arc('ledger', 6), xpL(0.3), unlock('finalindex')] }],
  ]),
  sc('s_ledger_page', 'underdeep', [
    ['narrator', 'The Blank Page is a slab of white stone set in the cavern floor, smooth as a sheet of paper. When you kneel, ink rises up from beneath it, slowly, and writes itself into the stone, line by line, in a hand you recognise as your own.'],
    ['narrator', 'You do not read it. You touch it, once, with the bone ring, and the writing stops. In the cavern behind you, a spiral staircase of shelves, lit with pale blue lamps, unrolls down into the dark. It ends at a desk, a quill, and a very old man.', { eff: [arc('ledger', 7), xpL(0.35), san(-3)] }],
  ]),
  sc('s_quill_end', 'finalindex', [
    ['narrator', 'Quill sets down his pen. For the first time in three hundred years, he looks up. He is a very old man, narrow, veiled, in a robe of grey parchment, and his hands, which have not stopped moving, are suddenly still.'],
    ['quill', '“There is a page in the Index that I have never been able to write,” he says. His voice is a whisper, dry as paper. “It is the last one. I have been trying for so long. I think it is meant to be forgiveness. I do not know how to spell it.” He lifts a ring from his finger, the Ledger-Ring, a band of grey bone covered in tiny script, and offers it to you across the desk.', { choices: [
      ch('Take the Ledger-Ring.', '2'), ch('“What would you write?”', '3')] }],
    ['quill', '“Something small. ‘It is all right.’ Something that a child would say. I would not know how to say it any other way.”', { id: '3', next: '2' }],
    ['narrator', 'The Ledger-Ring slides onto your finger beside the bone key. For a moment, every lamp in the Underdeep goes out. Then, one by one, they come on again, and each one, you notice, is a slightly different colour. The Archive is no longer exact. It is, at last, alive.', { id: '2', eff: [regalia('ledger'), arc('ledger', 8), xpL(0.6), gold(1200), san(-4)] }],
  ]),
  sc('s_odalys_after', 'lumenhollow', [
    ['odalys', '“The lamps are different colours,” Odalys says, and she is laughing. “Every one of them. I did not know a lamp could be orange.” She slides a small book into your hand, bound in blue. “It is blank. For when you want to remember something on your own. Lumen Hollow is yours. Come back and write.”'],
  ]),
];

const items = [
  gearItem('reg_ledger', 'The Ledger-Ring', 'r_signet', 'ring', 'mythic', 8, 'Quill’s band of grey bone, covered in tiny script. It records every debt, and sometimes, rarely, writes one off.', { damage: 12, crit: 12, critDmg: 25, will: 7, maxSanity: 30, luck: 12, xpPct: 8 }, { set: 'regalia' }),
  gearItem('u_quill_lens', 'Quill’s Monocle', 'a_eyes', 'amulet', 'epic', 7, 'A pair of lenses on a chain. Through them, everything has a footnote.', { will: 6, maxSanity: 36, crit: 10, luck: 8, xpPct: 5 }),
  ...armorSet('deep', 8, 'epic', {
    head: ['Lamplighter’s Hood', 'h_cowl', 'A dark hood with a tiny lamp sewn into the brim.'],
    body: ['Parchment Mail', 'b_chain', 'Layered ledger-leaves, lacquered and stitched. It reads you back.'],
    hands: ['Scrivener’s Gloves', 'g_cloth', 'Gloves stained to the knuckle. Everything you touch is annotated.'],
    feet: ['Silentstep Boots', 'f_cloth', 'The quietest footwear in the Underdeep.'],
  }, { head: { maxSanity: 2, will: 0 }, body: { maxHp: 3, maxSanity: 2 }, hands: { crit: 1, will: 0 }, feet: { dodge: 2, maxSanity: 1 } }),
];

export const DEEP: RegionPack = {
  id: 'deep',
  zone: { id: 'deep', name: 'The Underdeep', at: [7, 6], lvl: 49, pool: ['glowcap', 'cavestrider', 'lampmoth', 'blindfish', 'archiveclerk'], biome: 'deep', elite: 'colophongiant', bg: 'underdeep' },
  towns, dungeons, landmarks, enemies, quests, events, scenes, items,
  links: [['gravemarrow', 'lumenhollow'], ['lumenhollow', 'inkwell'], ['lumenhollow', 'gloamstep'], ['lumenhollow', 'unlitlibrary'], ['lumenhollow', 'ledgerhalls'], ['inkwell', 'finalindex'], ['gloamstep', 'glowcapwarrens']],
  speakers: {
    odalys: { name: 'Odalys Reed', title: 'Head Lamplighter-Librarian', icon: 'e_wizard', color: '#a0f0ff', look: 'veil' },
    polly: { name: 'Polly Marginalia', title: 'Binder', icon: 'e_witch', color: '#d0f0f8', look: 'veil' },
    quill: { name: 'Quill', title: 'The Archivist', icon: 'e_crowned', color: '#c0e8e0', look: 'cowl' },
    wenna: { name: 'Wenna Stairwell', title: 'Landlady', icon: 'e_bellkeeper', color: '#e8e0d0', look: 'hood' },
  },
  arc: {
    id: 'ledger', title: 'The Ledger-Ring', region: 'deep', lvl: 47, regalia: 'ledger',
    blurb: 'The eighth Regent ruled by the record. He could not forget, and so he could not forgive.',
    steps: [
      { title: 'The Lamplighter', obj: 'Speak with Odalys Reed in Lumen Hollow.', text: 'The lamps lit when you came down the stair. Odalys will tell you why.', at: 'lumenhollow' },
      { title: 'The Unlit Library', obj: 'Defeat the Index of Silence in the Unlit Library.', text: 'The first page lies on a lectern at the heart of the dark stacks.', at: 'unlitlibrary', goal: g('clear', 1, 'Defeat the Index of Silence', 'unlitlibrary') },
      { title: 'Light the Deep', obj: 'Slay fourteen creatures of the Underdeep.', text: 'The things of the dark have come out of their holes. The lamplighters cannot keep them at bay.', at: 'lumenhollow', goal: g('killTag', 14, 'Slay Underdeep creatures', 'deep') },
      { title: 'The Ledger Halls', obj: 'Defeat Clerk-General Vellum in the Ledger Halls.', text: 'The second page is balanced on a desk at the end of an endless sum.', at: 'ledgerhalls', goal: g('clear', 1, 'Defeat Clerk-General Vellum', 'ledgerhalls') },
      { title: 'The Binder', obj: 'Take both pages to Polly Marginalia in Inkwell.', text: 'Only the Binder can turn two pages into a key.', at: 'inkwell' },
      { title: 'The Blank Page', obj: 'Touch the Blank Page with the bone ring.', text: 'The only page of the Index that is still being written.', at: 'finalindex', goal: g('reach', 1, 'Reach the Blank Page', 'blankpage') },
      { title: 'The Final Index', obj: 'Enter the Final Index and face Quill, the Archivist.', text: 'Five floors of shelves, a spiral that goes down into the dark, and a man who cannot stop writing.', at: 'finalindex', goal: g('clear', 1, 'Defeat the Archivist', 'finalindex') },
    ],
  },
  triggers: [{ loc: 'lumenhollow', cond: { mainAt: 'r00' }, scene: 's_ledger_arrive' }],
  schools: { lumenhollow: ['Deep', 'Astral', 'Hex'] },
  sets: { deep: { name: 'Lamplighter’s Raiment', two: { maxSanity: 14, crit: 6 }, four: { maxSanity: 24, crit: 10, will: 5, luck: 10 }, blurb: 'Made for people who work in the dark and do not mind it.' } },
  bossLoot: { sporeking: ['u_quill_lens'], indexsilence: ['set_deep_head'], vellum: ['set_deep_feet'], quill: ['set_deep_body', 'set_deep_hands'] },
};
