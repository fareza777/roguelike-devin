import type { DungeonDef, LandmarkDef, School, TownDef } from '../types';
import { PACKS } from './regions';

export const MAP_W = 96;
export const MAP_H = 72;

const t = (sky: string, glow: string, ink: string) => ({ sky, glow, ink });

const CORE_TOWNS: TownDef[] = [
  {
    id: 'veyrgard', name: 'Veyrgard', kind: 'city', subtitle: 'The Final City', region: 'heartland', pos: [32, 24], icon: 'm_city', art: 'veyrgard',
    desc: 'The last walled city under a black sun. Lanterns burn on every corner, and no one asks where the oil comes from.',
    theme: t('#1a0d10', '#d24a3f', '#e7c98f'), services: ['inn', 'shop', 'smithy', 'wardhouse', 'tavern', 'board', 'trainer'], tier: 1, shopTags: ['blade', 'heavy', 'shield', 'potion'], innPrice: 12,
    rumors: ['They say the lanterns never go out. Nobody says why.', 'Seer Ilse hasn’t slept since the sun went dark. Or eaten. Or blinked, even before she lost her eyes.', 'The Watch is short a hundred men and has stopped counting the graves.', 'A raven has been stealing letters from the Collegium. Only the important ones.'],
    npcs: [
      { id: 'ilse', name: 'Seer Ilse', title: 'The Blind Seer', icon: 'e_seer', greeting: 'She turns her ruined eyes toward you, and somehow it feels like being seen.', idle: ['“The seals do not care what you think of them, Wayfarer.”', '“Walk lightly. The dark is listening and it has very good ears.”', '“You have my sigil. It is the only thing I have that has not been rationed.”'], talk: [{ cond: { mainAt: 'm00' }, scene: 's_ilse_intro' }, { cond: { mainAt: 'm20' }, scene: 's_ilse_reveal' }, { cond: { mainAt: 'r00' }, scene: 's_ilse_hint' }, { cond: { mainAt: 'r01' }, scene: 's_ilse_crowns' }, { cond: { mainMin: 'm26' }, scene: 's_ilse_end' }] },
      { id: 'roe', name: 'Captain Roe', title: 'Captain of the Watch', icon: 'e_soldier', greeting: 'A weary man in a coat stiff with old blood. His salute is exact and his eyes are not.', idle: ['“If you’re going out there, come back. That’s an order. I know I can’t give you one.”', '“The wall holds. That’s the whole report.”', '“I’ve buried eleven good men this month. Don’t make it twelve.”'], talk: [{ cond: { mainAt: 'm01' }, scene: 's_roe_intro' }, { cond: { mainAt: 'm19' }, scene: 's_roe_gate' }] },
      { id: 'pell', name: 'Archivist Pell', title: 'Astronomer of the Collegium', icon: 'e_wizard', greeting: 'Ink to the elbows, spectacles on his forehead and a second pair on his nose.', idle: ['“I’ve counted the stars three times. There are fewer each night. Or more. It depends on who’s counting.”', '“Never trust a map that doesn’t include you. Or one that does.”', '“Twelve Veyrs in the sky. Twelve. Do sit down, you’ve gone pale.”'], talk: [{ cond: { mainAt: 'm19' }, scene: 's_pell_truth' }] },
      { id: 'hollis', name: 'Quartermaster Hollis', title: 'Keeper of Stores', icon: 'e_bandit', greeting: 'A round man with a ledger and a frown that has been ironed flat by experience.', idle: ['“Everything costs more. Yes, everything. No, I don’t know why. Yes, I’m looking into it.”', '“Rats in the cellar, rats in the wall, and rats on the council. I know which I’d prefer.”'] },
      { id: 'venn', name: 'Cartographer Venn', title: 'Mapmaker', icon: 'e_hermit', greeting: 'She squints at you, at her map, at you. “You’re not on here. Stand there. Now you are.”', idle: ['“The roads change. I’m told it’s a matter of perspective. It’s a matter of teeth.”', '“Bring me something I haven’t seen and I’ll draw you a shortcut.”'] },
    ],
  },
  {
    id: 'saltmere', name: 'Saltmere', kind: 'city', subtitle: 'The Drowned Port', region: 'coast', pos: [14, 34], icon: 'm_city', art: 'bellhouse',
    desc: 'A harbour city built on the roofs of a flooded one. The tide brings in fish, smugglers, and sometimes things that used to be sailors.',
    theme: t('#071614', '#3fb6a0', '#a4e0d0'), services: ['inn', 'shop', 'smithy', 'wardhouse', 'tavern', 'board', 'trainer', 'harbor'], ferry: ['tidewatch', 'gullrest'], tier: 1, shopTags: ['dagger', 'medium', 'bomb', 'potion', 'pistol'], innPrice: 14,
    rumors: ['Every night the bell under the harbour rings one more time than the night before.', 'The Smugglers’ Guild sells maps of places that don’t exist. They’re usually right.', 'A ghost ship anchors in the bay at dusk. Nobody boards it twice.', 'They found a seal-key on a drowned man. Then another. Then eleven.'],
    npcs: [
      { id: 'ysolde', name: 'Ysolde Marrek', title: 'Harbormistress', icon: 'e_pirate', greeting: 'A tall woman with a salt-white braid and a knife she hasn’t bothered to hide.', idle: ['“The port’s closed to everything but bad news.”', '“Don’t ask what’s in the crates. Ask if it’s ticking.”', '“I run this harbour because someone has to, and no one else could stand the smell.”'], talk: [{ cond: { mainAt: 'm05' }, scene: 's_ysolde_keys' }] },
      { id: 'corvin', name: 'Corvin Vale', title: 'Guildmaster of the Smugglers', icon: 'e_assassin', greeting: 'He’s already smiling when you notice him, which is how he likes it.', idle: ['“I sell things. Sometimes what I sell is silence, which is cheaper than you’d think.”', '“Never pay the first price. Or the second. The third is a scam too, but it’s a good scam.”'], talk: [{ cond: { mainAt: 'm03' }, scene: 's_corvin' }] },
      { id: 'osk', name: 'Osk Tallow', title: 'Bell-Keeper of the Drowned Bellhouse', icon: 'e_bellkeeper', greeting: 'A thin man with wax in his ears and rope burns on both palms.', idle: ['“I stopped hearing it, thank the tide. Now I only feel it.”', '“Every bell has a name. This one has three.”'], talk: [{ cond: { mainAt: 'm03' }, scene: 's_osk' }] },
      { id: 'nettle', name: 'Nettle', title: 'Dock Urchin', icon: 'e_fox', greeting: 'A girl of about twelve sits on a barrel, counting your coin from thirty feet away.', idle: ['“Ask me anything. First answer’s free. The rest cost.”', '“Don’t go under the harbour. I did once. I’m not going again. Also I saw myself. I didn’t like her.”'] },
    ],
  },
  {
    id: 'emberhollow', name: 'Emberhollow', kind: 'city', subtitle: 'The Hearth in the Ash', region: 'ashwood', pos: [52, 24], icon: 'm_city', art: 'ashwood',
    desc: 'A timber city that refuses to burn. The foresters swear it is stubbornness. The Hall says it is craft. The trees say nothing, which is worse.',
    theme: t('#1a0c05', '#ff8a3a', '#ffd7a0'), services: ['inn', 'shop', 'smithy', 'wardhouse', 'tavern', 'board', 'trainer'], tier: 2, shopTags: ['axe', 'spear', 'crossbow', 'cloth', 'potion'], innPrice: 18,
    rumors: ['The Cinder Hart walks the deep woods, and wherever it walks the trees remember fire.', 'The Ash Compact swore to keep the fire alive. The forest never agreed to the terms.', 'A lamp-keeper named Maren is very kind to everyone. Everyone finds this suspicious.', 'The Huntsman’s horn sounds every dusk. No one has ever seen him.'],
    npcs: [
      { id: 'tamsin', name: 'Tamsin Aldwyn', title: 'Warden of the Ash Compact', icon: 'e_barbarian', greeting: 'Soot-stained, straight-backed and armed to the teeth with a hatchet and a grudge.', idle: ['“I’ve buried four rangers this winter. The forest ate the rest.”', '“We keep the fire because we swore to. That doesn’t mean I like it.”'], talk: [{ cond: { mainAt: 'm07' }, scene: 's_tamsin' }, { cond: { mainAt: 'm08' }, scene: 's_leash' }] },
      { id: 'maren', name: 'Lamp-Keeper Maren', title: 'Lamp-Keeper of the Cinder Hall', icon: 'e_veiled', greeting: 'A gentle woman with warm hands and grey, unblinking eyes.', idle: ['“Come in, child. You look so tired. Sit. Tell me everything.”', '“The Seer sends her love. She always does. She’s very fond of you.”'], talk: [{ cond: { mainAt: 'm09' }, scene: 's_maren' }] },
      { id: 'bram', name: 'Bram', title: 'Hearthkeeper', icon: 'e_bellkeeper', greeting: 'A giant with a poker in one hand and a kettle in the other.', idle: ['“Tea? It’s mostly smoke, but it’s warm.”', '“I’ve kept this fire lit for thirty years. It’s never once said thank you.”'] },
      { id: 'cinderwife', name: 'Old Cinderwife', title: 'Rememberer of Names', icon: 'e_hermit', greeting: 'A tiny woman knitting something that looks suspiciously like a map.', idle: ['“The Hart was a man once. I taught him to whistle.”', '“Don’t stand downwind of the Huntsman. He carries grief the way other men carry knives.”'] },
    ],
  },
  {
    id: 'gravemarrow', name: 'Gravemarrow', kind: 'city', subtitle: 'The City in the Ribs', region: 'bone', pos: [10, 20], icon: 'm_city', art: 'quarry',
    desc: 'Miners carved a city into the ribcage of something too large to have lived. The walls hum on windless nights. Nobody minds. Nobody sleeps.',
    theme: t('#12100c', '#c9b48a', '#f0e2c0'), services: ['inn', 'shop', 'smithy', 'wardhouse', 'tavern', 'board', 'trainer'], tier: 3, shopTags: ['hammer', 'mace', 'heavy', 'bomb', 'halberd'], innPrice: 22,
    rumors: ['The Foreman promised the miners they’d be remembered. The walls have been whispering names ever since.', 'A vein of glass runs through the deepest shaft. It flinches when you bring a light near.', 'Dagna Stonevein has never lost an argument. She has lost three husbands. She calls that even.', 'The Titan’s ribcage is warm on the inside. Something in there is still breathing.'],
    npcs: [
      { id: 'dagna', name: 'Dagna Stonevein', title: 'Forge-Mother of Gravemarrow', icon: 'e_dwarf', greeting: 'Arms like anvils, beard braided with iron rings, and eyes that count your teeth.', idle: ['“I forged the first lantern that ever burned in Veyrgard. I’m told it’s an honour. I’d prefer a pension.”', '“Bring ore. Or coin. Or stories. In that order.”'], talk: [{ cond: { mainAt: 'm11' }, scene: 's_dagna' }, { cond: { mainAt: 'm13' }, scene: 's_dagna_after' }] },
      { id: 'tobbin', name: 'Old Tobbin', title: 'Retired Miner', icon: 'e_miner', greeting: 'One eye, one arm, and a whole lot of opinions about the ceiling.', idle: ['“My sons went down for the wage. I stayed for the funerals.”', '“You hear the walls talking? Don’t answer.”'] },
      { id: 'grubb', name: 'Grubb the Tallyman', title: 'Keeper of the Count', icon: 'e_goblin', greeting: 'A small man with a chalk-dusted coat and a tally-slate that reaches the floor.', idle: ['“Names. I write down names. Someone should.”', '“Seven hundred and twelve on the north wall. Four hundred more are still under it.”'] },
    ],
  },
  {
    id: 'hollowreach', name: 'Hollowreach', kind: 'city', subtitle: 'The Fortress at the Edge', region: 'north', pos: [33, 8], icon: 'm_city', art: 'pass',
    desc: 'A citadel of black stone under permanent snow. The garrison mans walls built to face north. Every one of them keeps glancing south.',
    theme: t('#06101c', '#8fb8e6', '#dceaff'), services: ['inn', 'shop', 'smithy', 'wardhouse', 'tavern', 'board', 'trainer'], tier: 3, shopTags: ['halberd', 'heavy', 'shield', 'potion', 'arquebus'], innPrice: 24,
    rumors: ['The southward army has not moved in sixty years, but the snow around it keeps getting deeper.', 'Marshal Sigrun hasn’t smiled since she inherited a title she never wanted.', 'A frozen soldier was found saluting the wrong direction. Officer’s orders, they say.', 'At night the whole Pass whispers a single word. Everyone hears a different one.'],
    npcs: [
      { id: 'sigrun', name: 'Sigrun Vhal', title: 'Marshal of Hollowreach', icon: 'e_barbarian', greeting: 'A woman with a general’s jaw and a daughter’s tired eyes.', idle: ['“My father commanded an army. I command the people who watch it.”', '“Don’t salute me. I’ve seen where salutes end up.”'], talk: [{ cond: { mainAt: 'm15' }, scene: 's_sigrun' }, { cond: { mainAt: 'm17' }, scene: 's_sigrun_after' }] },
      { id: 'hask', name: 'Sergeant Hask', title: 'Wall-Warden', icon: 'e_soldier', greeting: 'A veteran with frostbitten ears and an opinion about your boots.', idle: ['“Pull your scarf up. The cold takes the nose first, then the will.”', '“Sixty years the army’s been out there. You’d think someone would’ve sent a letter.”'] },
      { id: 'ymra', name: 'Ymra', title: 'Frost-Seer', icon: 'e_witch', greeting: 'A pale woman whose breath does not fog. She is looking at something a foot behind your shoulder.', idle: ['“I dream in blue. It’s very restful. It’s also a warning.”', '“The dead don’t hate us. They’re just cold.”'] },
    ],
  },
  {
    id: 'solenne', name: 'Solenne', kind: 'city', subtitle: 'The City That Never Set', region: 'south', pos: [32, 38], icon: 'm_city', art: 'solenne',
    desc: 'A golden city frozen in the ninth day of noon. Its people repeat the same afternoon endlessly, and are very polite about it.',
    theme: t('#1c1204', '#ffd15a', '#fff0c4'), services: ['inn', 'shop', 'wardhouse', 'tavern', 'board', 'trainer'], tier: 8, shopTags: ['cloth', 'staff', 'tome', 'orb', 'relic'], innPrice: 30,
    rumors: ['The clocks in Solenne all show the same time, and it’s always time for tea.', 'Nobody in Solenne has cast a shadow in sixty years. Not one. Not even three.', 'The Herald announces the King every noon. He’s been announcing for a very long time.', 'The children play a game where the loser has to remember the night.'],
    npcs: [
      { id: 'aurelia', name: 'Lady Aurelia Sol', title: 'Steward of the Noon Court', icon: 'e_seer', greeting: 'Gowned in light, immaculate, and smiling exactly as she smiled yesterday. And the day before.', idle: ['“Do stay for tea. It’s always tea time.”', '“I don’t recall the last night. It must have been nice.”'], talk: [{ cond: { mainAt: 'm22' }, scene: 's_aurelia' }, { cond: { mainAt: 'm24' }, scene: 's_aurelia_gate' }] },
      { id: 'lucan', name: 'Lucan the Looped', title: 'Court Knight', icon: 'e_knight', greeting: 'He bows. Then he bows again, exactly the same way. Then a third time.', idle: ['“Well met. Well met. Well met.”', '“I have been guarding this door for one afternoon. I like it.”'] },
      { id: 'pip', name: 'Pip', title: 'A Child Who Remembers Night', icon: 'e_sunhood', greeting: 'The only child in the square who is not smiling.', idle: ['“I dream of stars. Mama says there are no stars. Mama says a lot of things.”', '“Are you real? You’ve got shadows. Three. Oh, no, one. Sorry.”'] },
    ],
  },
  {
    id: 'lanternrest', name: 'Lanternrest', kind: 'village', subtitle: 'A Roadside Hamlet', region: 'heartland', pos: [42, 25], icon: 'm_town', art: 'splash',
    desc: 'A dozen houses, a well, and a lantern on a pole that has burned for forty years without oil.',
    theme: t('#170e08', '#f0a05a', '#ffe0b0'), services: ['inn', 'shop', 'board'], tier: 1, shopTags: ['potion', 'medium'], innPrice: 10,
    rumors: ['The lantern on the pole never goes out. Travelers pay respects to it.', 'Two men from the Rookery came through last week. They asked for directions and left very quickly.'],
    npcs: [{ id: 'marta', name: 'Marta Lanternwick', title: 'Innkeeper', icon: 'e_hermit', greeting: 'A stout woman with a ladle in one hand and a shotgun in the other. She hasn’t decided which to use on you.', idle: ['“Stew’s hot, beds are clean, and the lantern’s been lit since before your granddad was born.”', '“Hurry up and eat. The road doesn’t wait.”'] }],
  },
  {
    id: 'wickhaven', name: 'Wickhaven', kind: 'village', subtitle: 'A Fisher’s Hamlet', region: 'coast', pos: [9, 41], icon: 'm_town', art: 'bellhouse',
    desc: 'Stilt-houses clinging to a cliff above the surf. The fishermen no longer go out past the second buoy.',
    theme: t('#071012', '#4cc1d1', '#b6ecf2'), services: ['inn', 'shop', 'board', 'harbor'], ferry: ['gullrest'], tier: 1, shopTags: ['potion', 'bomb'], innPrice: 10,
    rumors: ['Something in the caves sings to the boats at night.', 'Old Nell lost a husband to the sea. She says the sea gave him back. She won’t say in what state.'],
    npcs: [{ id: 'nell', name: 'Old Nell', title: 'Fisherwoman', icon: 'e_pirate', greeting: 'Wrinkled, wind-burned, and utterly unimpressed with you.', idle: ['“Fish are down. Ghosts are up. It’s a poor season.”', '“Don’t go in the caves without a lantern. Or a plan. Preferably both.”'] }],
  },
  {
    id: 'dunmarrow', name: 'Dunmarrow Camp', kind: 'village', subtitle: 'A Miners’ Waystation', region: 'bone', pos: [19, 24], icon: 'm_town', art: 'quarry',
    desc: 'Wagons, tents, and a smithy that never cools. Half the camp is waiting to go down. The other half is waiting to hear from the ones who did.',
    theme: t('#13110d', '#d9b47a', '#f0e0bc'), services: ['inn', 'shop', 'board'], tier: 2, shopTags: ['hammer', 'potion', 'heavy'], innPrice: 12,
    rumors: ['A cart went into the Foundry last month. Only its wheels came back. In perfect condition.', 'The quarry is louder at night. Nobody has figured out if it’s the rock or the miners.'],
    npcs: [{ id: 'gav', name: 'Foreman Gav', title: 'Camp Boss', icon: 'e_miner', greeting: 'Big, tired, and permanently hoarse from shouting at rocks.', idle: ['“Wage’s a coin a day and a coffin on the house.”', '“Careful with the west shaft. It’s been sulking.”'] }],
  },
  {
    id: 'frostgate', name: 'Frostgate Watch', kind: 'village', subtitle: 'The Northern Outpost', region: 'north', pos: [30, 14], icon: 'm_town', art: 'pass',
    desc: 'A stockade of frozen logs with a brazier at every corner. The guards stare north with the special dread of people who already know.',
    theme: t('#08111d', '#9cc6ee', '#e6f2ff'), services: ['inn', 'shop', 'board'], tier: 2, shopTags: ['halberd', 'potion', 'heavy'], innPrice: 14,
    rumors: ['The last patrol came back with more men than it left with.', 'Something in the snow keeps counting our footsteps.'],
    npcs: [{ id: 'dorn', name: 'Captain Dorn', title: 'Frostgate Commander', icon: 'e_soldier', greeting: 'A hard man with a beard full of ice and a hip flask full of something worse.', idle: ['“Cold. Coldest night in fifty years. Same as last night.”', '“If you see the army, don’t wave. They take it personally.”'] }],
  },
  {
    id: 'hangedman', name: 'The Hanged Man’s Rest', kind: 'village', subtitle: 'A Crossroads Inn', region: 'heartland', pos: [25, 30], icon: 'm_town', art: 'splash',
    desc: 'A crooked inn under a crooked tree at a crooked crossing. The sign shows a man with a happy expression, which is either a joke or a warning.',
    theme: t('#120a10', '#c78bd8', '#f0d8f4'), services: ['inn', 'shop', 'tavern', 'board'], tier: 1, shopTags: ['dagger', 'potion', 'bomb'], innPrice: 9,
    rumors: ['The rope on the tree is replaced every spring. Nobody knows by whom.', 'Bandits from the Rookery drink here. The Watch drinks here too. Nobody knows who buys the first round.'],
    npcs: [{ id: 'jo', name: 'Hangman Jo', title: 'Innkeeper', icon: 'e_bandit', greeting: 'Big smile, big knife, big ledger of debts. He seems delighted by all three.', idle: ['“Welcome to the Rest. Please don’t.”', '“Everyone leaves happier than they arrive. Mostly on their own feet.”'] }],
  },
];
export const TOWNS: TownDef[] = [...CORE_TOWNS, ...PACKS.flatMap(p => p.towns)];
export const TOWN_MAP = new Map(TOWNS.map(x => [x.id, x]));

export const TOWN_SCHOOLS: Record<string, School[]> = {
  ...Object.assign({}, ...PACKS.map(p => p.schools)),
  veyrgard: ['Steel', 'Discipline'], saltmere: ['Shadow', 'Sanguine'], emberhollow: ['Ash', 'Hex'], gravemarrow: ['Steel', 'Sanguine'],
  hollowreach: ['Discipline', 'Steel', 'Ash'], solenne: ['Astral', 'Hex', 'Discipline'],
};

const D = (d: DungeonDef): DungeonDef => d;
const CORE_DUNGEONS: DungeonDef[] = [
  D({ id: 'undercroft', name: 'Old Watchtower Undercroft', subtitle: 'The dead guard what the living forgot', desc: 'The first watchtower of Veyrgard, and beneath it the barracks of men who never left their posts.', art: 'bellhouse', theme: 'crypt', floors: 2, lvl: 2, enemies: ['skeleton', 'ghoul', 'lanternwraith', 'ratswarm'], elite: 'deadsergeant', boss: 'oldsentinel', size: [27, 21], pos: [27, 20], icon: 'm_tower' }),
  D({ id: 'rookery', name: 'The Rookery', subtitle: 'A robber’s tower of stolen rooms', desc: 'A ruined manor taken by the Rook-King and his crew. Every wall is hung with stolen portraits of people who look worried.', art: 'ashwood', theme: 'ruin', floors: 2, lvl: 3, enemies: ['bandit', 'rookarcher', 'hedgewitch', 'rookhound'], elite: 'magpie', boss: 'rookking', size: [27, 21], pos: [38, 30], icon: 'm_castle' }),
  D({ id: 'seacaves', name: 'Wickhaven Sea Caves', subtitle: 'Where the tide brings things back', desc: 'Salt-wet grottos that sing when the tide changes. The Widow’s wedding ring was lost here, a long time ago.', art: 'bellhouse', theme: 'flooded', floors: 3, lvl: 5, enemies: ['crab', 'eel', 'drownedsailor', 'brinehag'], elite: 'tidegrasp', boss: 'saltbeard', size: [29, 21], pos: [6, 44], icon: 'm_cave', secretItem: 'tok_widow' }),
  D({ id: 'catacombs', name: 'The Drowned Catacombs', subtitle: 'Where the dead refuse the tide', desc: 'Flooded crypts beneath Saltmere. The bells ring under water, and every ring is a name.', art: 'bellhouse', theme: 'flooded', floors: 3, lvl: 7, enemies: ['drownedwanderer', 'eel', 'tidesinger', 'bellthrall'], elite: 'ringer', boss: 'widow', size: [31, 23], pos: [18, 38], gate: 'm04', mainBoss: true, intro: 's_cata_intro', clear: 's_widow', icon: 'm_dungeon' }),
  D({ id: 'hearthcrypt', name: 'The Hearth Crypt', subtitle: 'Where the Compact keeps its embers', desc: 'The ash-brotherhood’s burial vault. Their fires are meant to be tended forever. Something has been tending them a bit too well.', art: 'ashwood', theme: 'ember', floors: 3, lvl: 10, enemies: ['ashhound', 'lanternkin', 'cinderghoul', 'emberwisp'], elite: 'ashenmatron', boss: 'huntsman', size: [29, 21], pos: [56, 20], icon: 'm_graveyard', secretItem: 'tok_hart' }),
  D({ id: 'ashwood', name: 'Ashwood Expanse', subtitle: 'A forest that remembers fire', desc: 'Black trees bleed embers. Lanterns lead travelers in circles until they become lanterns too.', art: 'ashwood', theme: 'forest', floors: 3, lvl: 12, enemies: ['ashhound', 'lanternkin', 'charcoal', 'thornstalker', 'emberstag'], elite: 'weepingbough', boss: 'hart', size: [33, 25], pos: [58, 28], gate: 'm08', mainBoss: true, intro: 's_ash_intro', clear: 's_hart', icon: 'm_deadtree' }),
  D({ id: 'hollowhill', name: 'Witch’s Hollow Hill', subtitle: 'The hill that hums at night', desc: 'A green mound beside the marsh, riddled with warrens and lit from the inside by a lantern no one has ever seen.', art: 'ashwood', theme: 'swamp', floors: 3, lvl: 13, enemies: ['mirefrog', 'bogwitch', 'hollowmoth', 'scarecrow'], elite: 'mothmother', boss: 'crone', size: [29, 21], pos: [48, 34], icon: 'm_mushroom' }),
  D({ id: 'archive', name: 'The Charred Archive', subtitle: 'An archive the fire refused to finish', desc: 'The old Lantern Court archive, burnt to its shelves. The fire spared exactly one person.', art: 'ashwood', theme: 'archive', floors: 3, lvl: 14, enemies: ['brandbearer', 'charredarchivist', 'ashwraith', 'fireimp'], elite: 'cindermagistrate', boss: 'unburntkeeper', size: [29, 21], pos: [50, 14], icon: 'm_archive' }),
  D({ id: 'quarry', name: 'Ossuary Quarry', subtitle: 'The old world had larger bones', desc: 'Miners carved a city through the skeletons of forgotten giants, then carved each other.', art: 'quarry', theme: 'bone', floors: 3, lvl: 16, enemies: ['prospector', 'marrow', 'dustwife', 'gravelgolem'], elite: 'overseer', boss: 'grist', size: [33, 25], pos: [6, 14], gate: 'm12', mainBoss: true, intro: 's_quarry_intro', clear: 's_grist', icon: 'm_mine' }),
  D({ id: 'ribcage', name: 'Titan’s Ribcage', subtitle: 'The hollow beneath the bones', desc: 'The interior of the great skeleton. Mist rises from between the ribs, and the mist has opinions.', art: 'quarry', theme: 'bone', floors: 3, lvl: 18, enemies: ['marrowworm', 'ribspider', 'titantick', 'boneharpy'], elite: 'ribwarden', boss: 'hollowtitan', size: [31, 23], pos: [4, 26], icon: 'm_ruins', secretItem: 'tok_grist' }),
  D({ id: 'foundry', name: 'The Sunken Foundry', subtitle: 'Where light was cast into iron', desc: 'A drowned smelter where the first lanterns were poured. The furnaces are still hot. Nobody has stoked them in a century.', art: 'quarry', theme: 'mine', floors: 3, lvl: 19, enemies: ['slagimp', 'foundrywraith', 'clockwarden', 'ironmaw'], elite: 'castmaster', boss: 'moltenregent', size: [31, 23], pos: [16, 16], icon: 'm_volcano' }),
  D({ id: 'pass', name: 'The Weeping Pass', subtitle: 'Every frozen corpse faces south', desc: 'A lost army waits beneath the snow for one final command. Some of them hear it early.', art: 'pass', theme: 'ice', floors: 3, lvl: 21, enemies: ['deserter', 'rime', 'standard', 'frostwolf'], elite: 'colonel', boss: 'vhal', size: [33, 25], pos: [34, 3], gate: 'm16', mainBoss: true, intro: 's_pass_intro', clear: 's_vhal', icon: 'm_snow' }),
  D({ id: 'barrows', name: 'The Frozen Barrows', subtitle: 'A king’s household, buried alive', desc: 'A royal burial mound. The household is still in residence. So is the banner Vhal’s army carried.', art: 'pass', theme: 'ice', floors: 3, lvl: 22, enemies: ['barrowdraug', 'rimeghoul', 'icespider', 'frostbanshee'], elite: 'barrowlord', boss: 'barrowking', size: [29, 21], pos: [24, 6], icon: 'm_graveyard', secretItem: 'tok_vhal' }),
  D({ id: 'rimeglass', name: 'Rimeglass Cavern', subtitle: 'A cave that dreams in ice', desc: 'A crystal cave where the ice preserves things that should not be preserved.', art: 'pass', theme: 'ice', floors: 3, lvl: 24, enemies: ['icegolem', 'frostbat', 'glassmaw', 'yeti'], elite: 'crystalstag', boss: 'glacierwyrm', size: [31, 23], pos: [44, 6], icon: 'm_cave' }),
  D({ id: 'undercity', name: 'The Undercity of Noon', subtitle: 'The city beneath the city that never set', desc: 'A golden mirror of Solenne beneath the streets. Here the fifth seal waits behind a Herald who never stops announcing.', art: 'solenne', theme: 'noon', floors: 4, lvl: 55, enemies: ['noonchild', 'echo', 'mourner', 'gilded', 'shadethird'], elite: 'gildedmarshal', boss: 'herald', size: [31, 23], pos: [34, 40], gate: 'm23', mainBoss: true, intro: 's_under_intro', clear: 's_herald', icon: 'm_dungeon' }),
  D({ id: 'meridian', name: 'The Black Meridian', subtitle: 'The wound at the end of the world', desc: 'Here the sky opens and every possible ending screams at once. The throne is at the bottom, and it has been waiting for you specifically.', art: 'solenne', theme: 'archive', floors: 5, lvl: 59, enemies: ['echo', 'noonchild', 'mourner', 'shadethird', 'gilded'], elite: 'regentshade', boss: 'king', size: [33, 25], pos: [32, 45], gate: 'm25', mainBoss: true, intro: 's_meridian_intro', clear: 's_king', icon: 'm_obelisk' }),
];
export const DUNGEONS: DungeonDef[] = [...CORE_DUNGEONS, ...PACKS.flatMap(p => p.dungeons)];
export const DUNGEON_MAP = new Map(DUNGEONS.map(x => [x.id, x]));

const CORE_LANDMARKS: LandmarkDef[] = [
  { id: 'roadwaystone', name: 'Wayside Waystone', icon: 'sigil', pos: [30, 27], event: 'ev_roadwaystone', once: true, lvl: 2 },
  { id: 'oldwell', name: 'The Well That Knows You', icon: 'well', pos: [22, 28], event: 'ev_oldwell', once: true, lvl: 3 },
  { id: 'headlessstatue', name: 'Headless Statue', icon: 'tombstone', pos: [18, 34], event: 'ev_headlessstatue', once: true, lvl: 6 },
  { id: 'wreck', name: 'Beached Wreck', icon: 'm_ship', pos: [11, 38], event: 'ev_wreck', once: true, lvl: 5 },
  { id: 'ashbeacon', name: 'The Ash Beacon', icon: 'campfire', pos: [46, 20], event: 'ev_ashbeacon', once: true, lvl: 10 },
  { id: 'burntfarm', name: 'Burnt Farmstead', icon: 'm_house', pos: [44, 30], event: 'ev_burntfarm', once: true, lvl: 11 },
  { id: 'obelisk', name: 'Whispering Obelisk', icon: 'm_obelisk', pos: [26, 12], event: 'ev_obelisk', once: true, lvl: 15 },
  { id: 'frozencart', name: 'Frozen Supply Cart', icon: 'm_camp', pos: [40, 8], event: 'ev_frozencart', once: true, lvl: 20 },
  { id: 'bonedais', name: 'Titan’s Dais', icon: 'plinth', pos: [8, 30], event: 'ev_bonedais', once: true, lvl: 16 },
  { id: 'cairn', name: 'Traveler’s Cairn', icon: 'm_ruins', pos: [36, 18], event: 'ev_cairn', once: true, lvl: 4 },
  { id: 'mirrorlake', name: 'Mirror Lake Shore', icon: 'fountain', pos: [24, 36], event: 'ev_mirrorlake', once: true, lvl: 8 },
  { id: 'hermit', name: 'Hermit’s Hollow', icon: 'm_camp', pos: [14, 28], event: 'ev_hermit', once: true, lvl: 9 },
  { id: 'noonpool', name: 'The Noon Pool', icon: 'fountain', pos: [28, 40], event: 'ev_noonpool', once: true, lvl: 54 },
  { id: 'grave_widow', name: 'The Widow’s Grave', icon: 'tombstone', pos: [16, 36], scene: 'g_widow', lvl: 7, cond: { flag: 'boss_widow' }, hint: 'A mourner’s cairn. It seems to be waiting for something.' },
  { id: 'grave_hart', name: 'Hartwyn’s Grave', icon: 'tombstone', pos: [56, 27], scene: 'g_hart', lvl: 12, cond: { flag: 'boss_hart' }, hint: 'A cairn of antlers.' },
  { id: 'grave_grist', name: 'Foreman Grist’s Grave', icon: 'tombstone', pos: [7, 16], scene: 'g_grist', lvl: 16, cond: { flag: 'boss_grist' }, hint: 'Names, scratched into every stone.' },
  { id: 'grave_vhal', name: 'General Vhal’s Grave', icon: 'tombstone', pos: [36, 4], scene: 'g_vhal', lvl: 21, cond: { flag: 'boss_vhal' }, hint: 'A frozen cairn, facing south.' },
];
export const LANDMARKS: LandmarkDef[] = [...CORE_LANDMARKS, ...PACKS.flatMap(p => p.landmarks)];
export const LANDMARK_MAP = new Map(LANDMARKS.map(x => [x.id, x]));

export interface Zone { id: string; at: [number, number]; lvl: number; pool: string[]; name: string; biome: string; elite: string; fx?: string; bg?: string; island?: boolean; /** Land discs carved out of a sea biome. */ islands?: { at: [number, number]; r: number }[] }
const CORE_ZONES: Zone[] = [
  { id: 'heartland', name: 'The Heartland', at: [32, 24], lvl: 2, pool: ['bandit', 'wolf', 'crow', 'scarecrow', 'ratswarm'], biome: 'plains', elite: 'deadsergeant' },
  { id: 'coast', name: 'The Drowned Coast', at: [12, 38], lvl: 6, pool: ['crab', 'eel', 'drownedsailor', 'brinehag', 'drownedwanderer'], biome: 'coast', elite: 'tidegrasp' },
  { id: 'swamp', name: 'The Hollow Marsh', at: [48, 38], lvl: 12, pool: ['mirefrog', 'bogwitch', 'hollowmoth', 'scarecrow', 'ratswarm'], biome: 'swamp', elite: 'mothmother' },
  { id: 'ashwood', name: 'Ashwood', at: [54, 24], lvl: 11, pool: ['ashhound', 'lanternkin', 'thornstalker', 'emberstag', 'charcoal'], biome: 'ash', elite: 'weepingbough' },
  { id: 'bone', name: 'The Ossuary Reach', at: [8, 20], lvl: 16, pool: ['prospector', 'marrow', 'dustwife', 'gravelgolem', 'marrowworm'], biome: 'bone', elite: 'overseer' },
  { id: 'north', name: 'The Frozen North', at: [32, 8], lvl: 21, pool: ['deserter', 'rime', 'frostwolf', 'standard', 'frostbat'], biome: 'snow', elite: 'colonel' },
  { id: 'south', name: 'The Noon Wastes', at: [32, 42], lvl: 54, pool: ['noonchild', 'echo', 'mourner', 'gilded', 'shadethird'], biome: 'noon', elite: 'gildedmarshal' },
];

export const ZONES: Zone[] = [...CORE_ZONES, ...PACKS.map(p => p.zone)];

export const GATE_SOLENNE: [number, number] = [32, 33];
export const GATE_MERIDIAN: [number, number] = [32, 42];
export const START_POS: [number, number] = [32, 25];

const CORE_TRIGGERS: { loc: string; cond: import('../types').Cond; scene: string }[] = [
  { loc: 'saltmere', cond: { mainAt: 'm02' }, scene: 's_saltmere_arrive' },
  { loc: 'catacombs', cond: { mainAt: 'm04' }, scene: 's_cata_intro' },
  { loc: 'emberhollow', cond: { mainAt: 'm06' }, scene: 's_ember_arrive' },
  { loc: 'ashwood', cond: { mainAt: 'm08' }, scene: 's_ash_intro' },
  { loc: 'gravemarrow', cond: { mainAt: 'm10' }, scene: 's_marrow_arrive' },
  { loc: 'quarry', cond: { mainAt: 'm12' }, scene: 's_quarry_intro' },
  { loc: 'hollowreach', cond: { mainAt: 'm14' }, scene: 's_reach_arrive' },
  { loc: 'pass', cond: { mainAt: 'm16' }, scene: 's_pass_intro' },
  { loc: 'veyrgard', cond: { mainAt: 'm18' }, scene: 's_siege' },
  { loc: 'solenne', cond: { mainAt: 'm21' }, scene: 's_solenne_arrive' },
  { loc: 'undercity', cond: { mainAt: 'm23' }, scene: 's_under_intro' },
  { loc: 'meridian', cond: { mainAt: 'm25' }, scene: 's_meridian_intro' },
];

export const TRIGGERS = [...CORE_TRIGGERS, ...PACKS.flatMap(p => p.triggers)];
