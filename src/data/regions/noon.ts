import { E, aff, gold, c, ck, dg, en, flag, g, goldR, gearItem, hp, hpp, log, loot, lore, q, san, sc, wild, xpL, corrupt, item } from '../kit';
import type { RegionPack } from './pack';

/** Part III: the three sealed courts of Solenne, before the Undercity and the Meridian. */
const dungeons = [
  dg({ id: 'mirrorcourt', name: 'The Mirror Court', subtitle: 'Where the Court bows to its reflection', desc: 'Solenne’s palace of audiences, every wall a mirror, every mirror a courtier. The masked nobles bow to their own images, and their images bow back, and nobody has risen in sixty years.', art: 'mirrorcourt', theme: 'noon', floors: 4, lvl: 53, enemies: ['veiledcourtier', 'mirrorshade', 'noonguard', 'gildedhound'], elite: 'courtmarshal', boss: 'chamberlain', size: [31, 23], pos: [37, 36], gate: 'm22', clear: 's_court_done', icon: 'm_castle' }),
  dg({ id: 'gildedgardens', name: 'The Gilded Gardens', subtitle: 'A garden in the ninth hour of noon', desc: 'Hedges clipped to gold leaf, fountains of liquid light, and statues of the citizens of Solenne caught in the middle of tea. Nothing here has grown, or died, in sixty years.', art: 'gildedgardens', theme: 'noon', floors: 4, lvl: 55, enemies: ['sunbloom', 'goldenwasp', 'noonsentinel', 'gildedhound'], elite: 'courtmarshal', boss: 'brightsteward', size: [31, 23], pos: [28, 35], gate: 'm22', clear: 's_gardens_done', icon: 'm_ruins' }),
  dg({ id: 'sunlessvault', name: 'The Vault of Unlit Hours', subtitle: 'Where Solenne hid the night', desc: 'A vault beneath the Stewards’ tower where the night was locked away, and the key thrown into the noon. If you listen, you can hear the stars.', art: 'underdeep', theme: 'noon', floors: 3, lvl: 57, enemies: ['ninthhourwraith', 'noonsentinel', 'mirrorshade', 'veiledcourtier'], elite: 'courtmarshal', boss: 'hourthief', size: [29, 21], pos: [38, 40], gate: 'm22', clear: 's_vault_done', secretItem: 'u_noon_vault', icon: 'm_dungeon' }),
];

const enemies = [
  en('noonguard', 'Noon Guard', 'e_knight', 'tank', 'construct noon', ['guard', 'heavy', 'attack'], 'A gilded sentry, smiling in a mask of gold leaf, holding the same salute it held sixty years ago.', { look: 'armor+mask' }),
  en('veiledcourtier', 'Veiled Courtier', 'e_hooded', 'caster', 'human noon', ['afflict', 'dread', 'attack'], 'A noble in a veil of gold lace. When it curtseys, something in the room is lost.', { ...aff('weak'), dread: 3, look: 'hood+veil' }),
  en('mirrorshade', 'Mirror Shade', 'e_ghost', 'caster', 'spirit noon', ['dread', 'afflict', 'dread'], 'A reflection that stepped out of its mirror and kept walking. It is wearing your hood.', { ...aff('weak'), dread: 4, look: 'spirit' }),
  en('gildedhound', 'Gilded Hound', 'e_hound', 'skirmisher', 'beast noon', ['attack', 'attack', 'afflict'], 'A hound cast in gold, with a hollow, humming chest. It tracks by the warmth of your shadow.', { ...aff('bleed'), look: 'quad' }),
  en('sunbloom', 'Sunbloom', 'e_eviltree', 'brute', 'plant noon', ['heavy', 'afflict', 'attack'], 'A huge gold flower that turns to follow the black sun, and opens its petals only to feed.', { ...aff('burn'), look: 'plant' }),
  en('goldenwasp', 'Golden Wasp', 'e_dragonfly', 'skirmisher', 'beast noon', ['attack', 'attack', 'afflict'], 'A wasp of beaten gold. The sting is a tiny sun.', { ...aff('burn'), look: 'winged' }),
  en('noonsentinel', 'Noon Sentinel', 'e_icegolem', 'tank', 'construct noon', ['guard', 'heavy', 'dread'], 'A statue of a citizen, caught mid-sip. It has finished its tea, and begun on you.', { dread: 2, look: 'golem' }),
  en('ninthhourwraith', 'Ninth-Hour Wraith', 'e_spectre', 'caster', 'spirit noon', ['afflict', 'dread', 'heavy'], 'The shadow of a person who was never allowed to have one. It wants yours.', { ...aff('weak'), dread: 4, look: 'spirit' }),
  en('courtmarshal', 'Court Marshal', 'e_blackknight', 'brute', 'human noon elite', ['heavy', 'attack', 'dread', 'guard'], 'A masked marshal in a plate of living light. It salutes before every blow.', { dread: 3, look: 'armor+mask' }),
  en('chamberlain', 'The Court Chamberlain', 'e_king', 'brute', 'human noon boss', ['heavy', 'dread', 'afflict', 'guard'], 'He announced every guest of the Noon Court for sixty years. He has been practising yours.', { hpMul: 4.2, dread: 4, ...aff('weak'), look: 'king' }),
  en('brightsteward', 'The Bright Steward', 'e_icegolem', 'tank', 'construct noon boss', ['guard', 'heavy', 'dread', 'heavy'], 'A towering gilt automaton that tends the Gardens, snipping the sun to size.', { hpMul: 4, dread: 3, look: 'golem' }),
  en('hourthief', 'The Hour-Thief', 'e_assassin', 'skirmisher', 'spirit noon boss', ['attack', 'afflict', 'heavy', 'dread'], 'It stole the night, and kept it, and it has grown fat on the dark.', { hpMul: 4, ...aff('weak'), dread: 3, look: 'rogue+mask' }),
];

const quests = [
  q('q_n_guards', 'solenne', 'Lady Aurelia Sol', 'Stand Down', 'The Noon Guard still stand at every door in Solenne. Ten of them, relieved of duty.', g('kill', 10, 'Relieve noon guards', 'noonguard'), { gold: 2400, xp: 2500, items: ['panacea', 'w_blade_8'] }),
  q('q_n_courtiers', 'solenne', 'Lady Aurelia Sol', 'The Curtsey That Never Ends', 'The Veiled Courtiers are still curtseying. Eight of them, allowed to finish.', g('kill', 8, 'Lay courtiers to rest', 'veiledcourtier'), { gold: 2500, xp: 2600, items: ['lucid', 'a_head_cloth_8'] }),
  q('q_n_shades', 'solenne', 'Lucan the Looped', 'Reflections', 'The mirror shades wear our faces. Or hoods. Or whatever it is we have now. Twelve of them, shattered.', g('kill', 12, 'Shatter mirror shades', 'mirrorshade'), { gold: 2600, xp: 2700, items: ['recollection', 'x_gemring_8'] }),
  q('q_n_hounds', 'solenne', 'Lucan the Looped', 'Gold Does Not Bark', 'The gilded hounds are tracking children. Nine of them, melted down.', g('kill', 9, 'Melt gilded hounds', 'gildedhound'), { gold: 2400, xp: 2500, items: ['nightshade', 'nightshade', 'a_feet_medium_8'] }),
  q('q_n_elite', 'solenne', 'Pip', 'The Marshals Who Salute', 'There are big shiny people in the palace who salute before they hit. Three of them. Please.', g('elites', 3, 'Slay elite foes'), { gold: 3000, xp: 3000, items: ['recollection', 'x_signet_8'] }),
  q('q_n_events', 'solenne', 'Pip', 'Things Nobody Told Me', 'Come back and tell me five things nobody told me about the night. I only remember it in dreams.', g('events', 5, 'Survive strange encounters'), { gold: 2000, xp: 2400, items: ['folio', 'j_starskull'] }),
  q('q_n_vault', 'solenne', 'Pip', 'The Night in the Vault', 'They say the night is locked in a vault under the tower. I want to see it. Just once. Please.', g('clear', 1, 'Defeat the Hour-Thief', 'sunlessvault'), { gold: 3600, xp: 3400, items: ['u_noon_vault', 'lifeblood'] }),
  q('q_n_sentinels', 'solenne', 'Lady Aurelia Sol', 'Statues With Opinions', 'The Noon Sentinels in the Gardens have started to move when nobody is looking. Six of them, turned back to stone.', g('kill', 6, 'Topple noon sentinels', 'noonsentinel'), { gold: 2500, xp: 2600, items: ['quarrycharge', 'w_hammer_8'] }),
];

const events = [
  E('ev_n_tea', 'Tea at the Ninth Hour', 'c_pot', 'wild noon', 'A table set for twelve in the middle of the road, every cup steaming, every chair empty. A card in the centre reads: “We saved you a seat.”', [
    c('Sit and drink', 'It is always tea time.', [hpp(40), san(10), corrupt(1), log('The tea tastes of afternoons that never end.', 'plain')]),
    c('Pour the tea out', 'A small rudeness.', [loot('rare'), san(-3)]),
    c('Take the card', 'Evidence.', [lore(), xpL(0.15)])], 'candles'),
  E('ev_n_stopped', 'A Parade, Stopped', 'm_camp', 'wild noon', 'A parade, frozen mid-street: drummers with drums raised, children with ribbons mid-twirl, floats in mid-turn. Every face is a blank mask of gold. The drumsticks are about to fall.', [
    c('Slip through', 'Do not touch anything.', [goldR(200, 340), xpL(0.1)], { check: ck('cunning', 16), fail: [wild('elite')] }),
    c('Remove a mask', 'See what is underneath.', [lore(), san(-8)]),
    c('Wait for it to restart', 'It will, eventually.', [san(-3)])], 'mask'),
  E('ev_n_clock', 'The Clock That Reads Noon', 'cog', 'wild noon', 'A tall-case clock stands on the road, hands pointing straight up, the pendulum motionless. It ticks once as you pass, and a drop of golden light falls from its face.', [
    c('Catch the drop', 'It is warm.', [hpp(30), san(8), xpL(0.15)]),
    c('Stop the clock', 'It is already stopped.', [loot('rare'), corrupt(1)]),
    c('Wind it', 'See what happens.', [wild(), loot('epic')], { check: ck('will', 16), fail: [hp(-24)] })], 'hourglass'),
  E('ev_n_mirror', 'The Mirror Hall', 'e_ghost', 'noon', 'A long hall of mirrors. In each one you stand, hooded, faceless, lantern raised. One of them is a half-second late, and one is a half-second early. The one in the middle is not there at all.', [
    c('Step into the empty mirror', 'Find the missing one.', [loot('epic'), san(-8)], { check: ck('will', 16), fail: [wild('elite'), san(-6)] }),
    c('Break the late one', 'Fix the timing.', [goldR(180, 300), hp(-14)]),
    c('Close your eyes and walk', 'The hall has an end.', [san(-4)])], 'mirror'),
  E('ev_n_gold', 'A Statue of Gold Leaf', 'tombstone', 'noon', 'A statue of a woman mid-curtsey, leafed in gold. Her hood is up, her face is a smooth gold plate. A key hangs from her wrist by a ribbon.', [
    c('Take the key', 'Surely no one will mind.', [loot('epic'), corrupt(1)]),
    c('Return her curtsey', 'Be polite.', [san(8), xpL(0.2)]),
    c('Polish the gold', 'A small, strange kindness.', [goldR(120, 220), san(5)])], 'statue'),
  E('ev_n_stars', 'The Night Under the Floor', 'star', 'noon', 'A grate in the floor, and below it, very faintly, something dark and vast and soft, with small cold lights in it. A draught of cool air comes up, smelling of rain.', [
    c('Kneel and listen', 'You can hear them.', [lore(), san(12), xpL(0.25)]),
    c('Drop a coin', 'See how far it falls.', [item('j_starskull'), san(-4)]),
    c('Pull the grate', 'Let the night out.', [loot('epic'), corrupt(1), hp(-10)])], 'crystal'),
];

const scenes = [
  sc('s_court_done', 'mirrorcourt', [
    ['narrator', 'The Chamberlain lowers his staff and, very quietly, forgets your name. Behind him, the mirrors of the Court shiver, and the courtiers in them, one by one, finish their bows and stand up.'],
    ['narrator', 'For the first time in sixty years, someone in Solenne has stopped repeating themselves. In the silence, a small clear voice from the Court’s gallery says: “Oh. Is it over?” It is the first thing anyone has said in the Mirror Court that was not rehearsed.', { eff: [xpL(0.35), san(-3)] }],
  ]),
  sc('s_gardens_done', 'gildedgardens', [
    ['narrator', 'The Bright Steward lowers its shears. Across the Gardens, the golden hedges lose their shine, one by one, and a pale green creeps up from the roots. In a fountain, the liquid light cools to water.'],
    ['narrator', 'On a bench, a statue in a gold plate mask of a woman at tea sets down her cup. Her hand, you see, is flesh. She looks at it, wonderingly, for a long time.', { eff: [xpL(0.35), san(-3)] }],
  ]),
  sc('s_vault_done', 'underdeep', [
    ['narrator', 'The Hour-Thief unravels, and the dark it stole pours out of it like smoke from a snuffed lamp. For a moment the Vault is full of night: velvet, cold, strewn with tiny, patient lights.'],
    ['narrator', 'It does not stay. It rises, and slides up through the grate, and out into the streets of Solenne. Somewhere above you, a child’s voice cries out, not in fear, but in joy, because it is dark.', { eff: [flag('night_returned'), xpL(0.4), gold(400), san(5)] }],
  ]),
];

const items = [
  gearItem('u_noon_vault', 'The Thief’s Night-Blade', 'w_dagger', 'weapon', 'relic', 8, 'A blade as black as the inside of a closed eye. It makes no sound, and it takes the light with it.', { damage: 88, crit: 18, dodge: 8, cunning: 5 }),
];

export const NOON: RegionPack = {
  id: 'noon',
  zone: { id: 'meridianrim', name: 'The Meridian Approach', at: [36, 46], lvl: 57, pool: ['noonguard', 'veiledcourtier', 'mirrorshade', 'gildedhound', 'ninthhourwraith'], biome: 'noon', elite: 'courtmarshal', bg: 'solenne' },
  towns: [], dungeons, landmarks: [], enemies, quests, events, scenes, items,
  links: [['solenne', 'mirrorcourt'], ['solenne', 'gildedgardens'], ['solenne', 'sunlessvault']],
  speakers: {},
  arc: { id: 'noonarc', title: 'The Courts of Noon', region: 'noon', lvl: 53, regalia: '', blurb: '', steps: [] },
  triggers: [],
  schools: {},
  sets: {},
  bossLoot: { chamberlain: ['u_noon_vault'] },
};
