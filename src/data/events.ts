import type { Choice, Eff, Stat, StoryEvent } from '../types';

const gr = (lo: number, hi: number): Eff => ({ t: 'goldR', lo, hi });
const xp = (m: number): Eff => ({ t: 'xpL', m });
const hp = (n: number): Eff => ({ t: 'hp', n });
const hpp = (n: number): Eff => ({ t: 'hpPct', n });
const san = (n: number): Eff => ({ t: 'san', n });
const cor = (n: number): Eff => ({ t: 'corrupt', n });
const sup = (n: number): Eff => ({ t: 'supplies', n });
const loot = (min: 'common' | 'rare' | 'epic' | 'relic' = 'common', n = 1): Eff => ({ t: 'loot', min, n });
const cons = (n = 1): Eff => ({ t: 'consumable', n });
const lore: Eff = { t: 'lore' };
const st = (k: Stat, n: number): Eff => ({ t: 'stat', k, n });
const log = (text: string, tone?: 'good' | 'bad' | 'plain' | 'epic'): Eff => ({ t: 'log', text, tone });
const fight = (rank: 'normal' | 'elite' = 'normal'): Eff => ({ t: 'fight', enemy: rank === 'elite' ? '@elite' : '@normal', rank });
const rand = (p: number, eff: Eff[], other?: Eff[]): Eff => ({ t: 'rand', p, eff, else: other });
const bless = (k: 'blade' | 'ward' | 'eye'): Eff => ({ t: 'bless', k });
const gld = (n: number): Eff => ({ t: 'gold', n });
const leave = [log('You move on, a little older.')];

const c = (label: string, text: string, eff: Eff[], o: Partial<Choice> = {}): Choice => ({ label, text, eff, ...o });
const ck = (stat: Stat, dc?: number) => ({ stat, dc });
const E = (id: string, title: string, icon: string, tags: string, text: string, choices: Choice[]): StoryEvent => ({ id, title, icon, text, tags: tags.split(' '), choices });

export const EVENTS: StoryEvent[] = [
  E('well', 'The Well That Knows You', 'well', 'crypt any', 'At a junction drowned ankle-deep, a stone well whispers your childhood name. A silver coin spins on its black surface without sinking.', [
    c('Take the coin', 'Reach into the water.', [gr(20, 36), rand(0.3, [san(-4), log('Something in the water grips your wrist.', 'bad')])]),
    c('Answer the voice', 'Tell it who you have become.', [san(10), xp(0.15), log('Your resolve hardens.', 'good')], { check: ck('will'), fail: [san(-6), log('The voice laughs inside you.', 'bad')] }),
    c('Seal the well', 'Spend a supply and leave it silent.', [san(6), log('Silence settles like snow.', 'good')], { cost: { supplies: 1 } })]),
  E('choir', 'The Choir Under the Water', 'c_pot', 'sea flooded', 'Beneath the surface, drowned choristers sing with open mouths. The hymn is beautiful. It is also a map.', [
    c('Dive and follow the song', 'Hold your breath and trust.', [loot('rare'), xp(0.15)], { check: ck('vigor'), fail: [hp(-8), log('The effort tears something.', 'bad')] }),
    c('Memorize the melody', 'Some songs are lore.', [lore, san(-2)]),
    c('Walk on', 'Beauty drowns people.', leave)]),
  E('waxpilgrim', 'A Pilgrim of Wax', 'e_hooded', 'any', 'A kneeling figure blocks the path. Every inch of it is candle wax, but a living eye turns within its melting face. “Carry my flame,” it begs.', [
    c('Accept the flame', 'Power has a price. (+1 Corruption)', [cor(1), san(-4), loot('rare'), log('The flame takes root in you.', 'bad')]),
    c('Extinguish it', 'End this strange mercy. (Fight)', [fight()]),
    c('Share your food', 'Kindness in a dying world.', [san(6), rand(0.5, [cons()]), log('Kindness steadies you.', 'good')], { cost: { supplies: 1 } })]),
  E('reddoor', 'The Red Door', 'door', 'any', 'A crimson door stands alone in a ruined wall. Behind it, someone hums the lullaby sung at every funeral in Veyr.', [
    c('Open it', 'There are truths behind every door.', [lore, san(-2)]),
    c('Listen closely', 'Use cunning to learn safely.', [lore, gr(15, 28), xp(0.15)], { check: ck('cunning'), fail: [hp(-6), log('You are caught listening.', 'bad')] }),
    c('Mark it and leave', 'Some doors are warnings.', leave)]),
  E('mirror', 'A Mirror Full of Teeth', 'e_hooded', 'any', 'Your reflection is a heartbeat late. It smiles when you do not. Behind its teeth, a tiny version of the city burns.', [
    c('Break the mirror', 'Suffer no impostor.', [hp(-6), san(4), gr(12, 22), log('Glass bites deep, but the impostor is gone.')]),
    c('Trade reflections', 'Become harder to kill, and less yourself.', [st('vigor', 2), st('will', -1), cor(1), log('You are harder now.', 'epic')]),
    c('Look away', 'Keep what remains of yourself.', leave)]),
  E('merchant', 'The Merchant of Last Things', 'gold', 'any', 'A man with no shadow sells from a coffin-cart. “Everything here was someone’s final possession. Very fair prices.”', [
    c('Buy a mystery (60 gold)', 'You will not know until it is yours.', [loot('rare')], { cost: { gold: 60 } }),
    c('Rob him', 'Cunning, or a fight.', [gr(60, 90), loot()], { check: ck('cunning'), fail: [log('He sees you coming.', 'bad'), fight('elite')] }),
    c('Decline politely', 'He bows until his neck cracks.', leave)]),
  E('ashlanterns', 'Lanterns in the Ash', 'e_lantern', 'fire forest', 'Three lanterns sway in the smoke, each offering a path. One of them is holding a hand.', [
    c('Follow the left lantern', 'Trust your instincts.', [rand(0.5, [loot('rare'), xp(0.15)], [log('It was a trap.', 'bad'), fight()])]),
    c('Snuff them all', 'Test your will against their pull.', [san(8), xp(0.2), cons()], { check: ck('will'), fail: [san(-7), log('They snuff you instead.', 'bad')] }),
    c('Take the hand', 'Someone needs you. (Fight)', [fight()])]),
  E('hungryaltar', 'An Altar of Hungry Stone', 'altar', 'any', 'An altar asks for blood in a language you learned in nightmares. It promises strength in exchange.', [
    c('Offer blood (8% health)', 'Gain permanent Vigor.', [st('vigor', 1), log('The stone drinks. Your arms remember.', 'epic')], { cost: { hp: 8 } }),
    c('Offer memory', 'Lose sanity, gain lore.', [san(-6), lore, xp(0.15)]),
    c('Desecrate it', 'Strength against stone.', [loot('rare'), xp(0.1)], { check: ck('vigor'), fail: [hp(-9), log('The altar bites back.', 'bad')] })]),
  E('salute', 'A Soldier Who Still Salutes', 'e_soldier', 'ice', 'A frozen soldier holds out a sealed letter. His eyes follow you. The letter is addressed to you, in your own handwriting.', [
    c('Read the letter', 'Lore at the cost of sanity.', [san(-5), lore, xp(0.15)]),
    c('Return the salute', 'Honor the dead. (Will)', [san(8), xp(0.15), bless('ward')], { check: ck('will'), fail: [san(-4), log('He does not return it.', 'bad')] }),
    c('Take his rations', 'He will not need them.', [sup(3), san(-2)])]),
  E('singingcage', 'The Singing Cage', 'e_hand', 'bone', 'A bone cage hangs over the pit. Inside, a child-shaped thing sings a miner’s work song and begs you to open it.', [
    c('Open the cage', 'Mercy, whatever it costs.', [rand(0.5, [loot('rare'), san(4)], [log('It was not a child.', 'bad'), fight()])]),
    c('Pick the lock of its jaw', 'Cunning reveals what it hides.', [lore, gr(20, 34)], { check: ck('cunning'), fail: [hp(-7), log('The jaw closes on your hand.', 'bad')] }),
    c('Cut the rope', 'Let the pit decide.', [cor(1), loot('rare'), san(-3)])]),

  E('humidol', 'The Humming Idol', 'a_tribal', 'any', 'A crude idol of knotted hair sits in a niche, humming a single note. It stops when you look at it, and resumes when you turn.', [
    c('Hum with it', 'Match the note.', [san(9), xp(0.1)], { check: ck('will'), fail: [san(-5), log('The note changes.', 'bad')] }),
    c('Take the idol', 'It will fetch a price.', [gr(20, 40), rand(0.4, [cor(1), log('It is heavier than it should be.', 'bad')])]),
    c('Leave a coin', 'Show respect.', [san(4), rand(0.5, [bless('eye')])], { cost: { gold: 15 } })]),
  E('sleeper', 'The Sleeper in the Corridor', 'e_skeleton', 'crypt', 'A fully armoured skeleton lies across the corridor, hands folded on his chest, snoring softly.', [
    c('Steal his boots', 'Quietly. Very quietly.', [loot('rare')], { check: ck('cunning'), fail: [log('He wakes up.', 'bad'), fight()] }),
    c('Walk over him', 'Someone has to.', [rand(0.35, [hp(-6), log('He grumbles and grabs your ankle.', 'bad')], [xp(0.05)])]),
    c('Strike first', 'A sleeping enemy is an opportunity. (Fight)', [fight()])]),
  E('bellfloat', 'Floating Bells', 'j_bell', 'sea flooded', 'Small brass bells hang in the air above the water, chiming in a pattern that seems almost like speech.', [
    c('Answer the pattern', 'Ring one yourself.', [lore, san(-3), xp(0.15)], { check: ck('cunning'), fail: [san(-6), log('It was not a greeting.', 'bad')] }),
    c('Take a bell', 'A small trophy.', [item0('j_bell')]),
    c('Wade past', 'Ignore the chimes.', leave)]),
  E('cocoon', 'The Cocooned Knight', 'j_cobweb', 'any', 'A knight in full armour hangs in a spider’s web, alive and very quiet. His eyes beg.', [
    c('Cut him free', 'It will take strength.', [loot('rare'), gr(30, 50), xp(0.2)], { check: ck('vigor'), fail: [hp(-8), log('Something in the web bites.', 'bad'), fight()] }),
    c('Burn the web', 'Fire solves most things.', [gr(10, 24), san(-3), log('He does not scream. That is worse.', 'bad')]),
    c('Leave him', 'You can’t save everyone.', [san(-2)])]),
  E('dicegame', 'The Ghost Dice-Game', 'j_bone', 'crypt', 'Three skeletons sit around a table, rattling bones. One of them pushes a stool toward you.', [
    c('Play (25 gold)', 'Luck is a stat like any other.', [rand(0.48, [gr(50, 90), log('You win. The skeletons applaud, silently.', 'good')], [log('You lose. Of course.', 'bad')])], { cost: { gold: 25 } }),
    c('Cheat', 'They are dead. How could they tell?', [gr(40, 70), xp(0.1)], { check: ck('cunning'), fail: [log('They could tell.', 'bad'), fight()] }),
    c('Decline', 'You have a schedule.', leave)]),
  E('lostchild', 'The Lost Child', 'e_fox', 'any', 'A small figure sits on a stair, sobbing. It looks up at you with a face that is very nearly a face.', [
    c('Comfort it', 'Even monsters cry.', [san(5), xp(0.1), rand(0.5, [cons()], [log('It vanishes, and leaves nothing.')])], { cost: { supplies: 1 } }),
    c('Follow it', 'It seems to know where it is going.', [rand(0.5, [loot('rare')], [log('It leads you to something with too many teeth.', 'bad'), fight('elite')])]),
    c('Walk on', 'Do not listen to the crying.', [san(-3), log('The crying follows you for a while.', 'bad')])]),
  E('burninglib', 'The Burning Library', 'c_burnbook', 'fire ember', 'A room of shelved books, all on fire, none consumed. The pages turn by themselves.', [
    c('Grab the nearest book', 'Fingers first.', [lore, hp(-5), xp(0.15)]),
    c('Read from a distance', 'Squint.', [lore, xp(0.1)], { check: ck('will'), fail: [san(-5), log('The words read you back.', 'bad')] }),
    c('Leave it burning', 'Some fires should be left alone.', leave)]),
  E('hollowtree', 'The Hollow Tree Hermit', 'e_hermit', 'forest', 'A hollowed oak glows from within. A tiny hermit sits inside, roasting something you would rather not identify.', [
    c('Share the meal', 'Suspicious, but warm.', [hpp(30), san(6), sup(-1)], { cost: { supplies: 1 } }),
    c('Trade stories', 'Lore for lore.', [lore, xp(0.1)]),
    c('Steal the pot', 'It smells like victory.', [cons(2)], { check: ck('cunning'), fail: [hp(-6), log('The hermit is not tiny after all.', 'bad')] })]),
  E('boneharp', 'The Harp of Ribs', 'a_rune', 'bone', 'A harp made from a rib and strung with tendon, lies on a ledge. It plays itself, softly.', [
    c('Play along', 'Join the hymn.', [san(12), xp(0.15)], { check: ck('will'), fail: [san(-6), log('The harp plays you.', 'bad')] }),
    c('Take the strings', 'A trader would pay.', [gr(25, 45)]),
    c('Silence it', 'Break the rib.', [san(-3), gr(8, 16)])]),
  E('tally', 'The Tally of the Dead', 'e_goblin', 'bone', 'A slab of stone is chiselled with tallies, thousands of them. A stone chisel lies in the dust.', [
    c('Add your mark', 'Someone should remember you.', [san(6), rand(0.4, [cor(1), log('The stone is very pleased.', 'bad')])]),
    c('Read the names', 'They are worth knowing.', [lore, san(-2), xp(0.12)]),
    c('Move on', 'You have your own list.', leave)]),
  E('frozenhorse', 'The Frozen Horse', 'e_ram', 'ice', 'A warhorse, frozen mid-rear, still saddled. Its saddlebags are unspoiled.', [
    c('Loot the saddlebags', 'It doesn’t need them.', [sup(3), gr(20, 36), cons()]),
    c('Free the horse', 'Chip the ice.', [san(6), xp(0.2), log('It is too far gone. But it seems grateful.', 'good')], { check: ck('vigor'), fail: [hp(-5)] }),
    c('Salute it', 'Honour the fallen.', [san(4)])]),
  E('blizzardcamp', 'The Abandoned Camp', 'tent', 'ice', 'A tent, a fire-pit and four bowls, all frozen solid. One still steams.', [
    c('Rest here', 'Spend a supply.', [hpp(35), san(10)], { cost: { supplies: 1 } }),
    c('Search the tent', 'There may be something useful.', [loot(), cons()], { check: ck('cunning'), fail: [san(-4), log('There is a note in your handwriting.', 'bad')] }),
    c('Press on', 'Warmth is a lie.', leave)]),
  E('noonreflect', 'Noon’s Reflection', 'e_ghost', 'noon', 'Your reflection steps out of a pane of golden glass, wearing your clothes, smiling like a favourite aunt. “Let me carry it for you,” it says.', [
    c('Let it carry', 'Ease your burden.', [san(15), cor(1), log('It is lighter. Terribly light.', 'bad')]),
    c('Refuse', 'You are you.', [san(6), xp(0.15)], { check: ck('will'), fail: [san(-8), log('It laughs your laugh.', 'bad')] }),
    c('Fight it', 'A duel with yourself.', [fight('elite')])]),
  E('goldclock', 'The Golden Clock', 'j_hourglass', 'noon', 'A great gold clock stands in the corridor, hands stopped at noon. The pendulum does not hang. It waits.', [
    c('Stop the clock', 'Hold the hands still.', [xp(0.25), san(-4)], { check: ck('will'), fail: [hp(-8), log('The clock strikes. Once.', 'bad')] }),
    c('Wind it', 'Let time move, briefly.', [hpp(25), san(8)]),
    c('Pry off the gold', 'A valuable trinket.', [gr(50, 90), san(-3)])]),
  E('toadmarket', 'The Toad Market', 'e_frog', 'swamp', 'A dozen large toads in waistcoats squat behind stalls of glittering mushrooms. They all look at you at once.', [
    c('Buy a mushroom (30 gold)', 'It might be good for you.', [rand(0.6, [hpp(40), san(10)], [san(-6), hp(-6), log('It was not good for you.', 'bad')])], { cost: { gold: 30 } }),
    c('Haggle', 'Toads like a bargain.', [cons(2)], { check: ck('cunning'), fail: [gld(-20), log('They fleece you.', 'bad')] }),
    c('Walk through', 'Smile.', leave)]),
  E('witchbargain', 'The Witch’s Bargain', 'e_witch', 'swamp', 'A green-fingered witch in a hovel offers you a bargain in exchange for something you will not miss.', [
    c('Trade sanity for gold', 'Lose sanity, gain plenty of gold.', [san(-10), gr(70, 110)]),
    c('Trade health for power', 'Lose health, gain +1 Cunning.', [hp(-12), st('cunning', 1)]),
    c('Decline', 'Never trade with witches.', leave)]),
  E('gravedigger', 'The Gravedigger', 'e_miner', 'crypt', 'A man in a long coat digs a new grave in the crypt floor, whistling. He looks up. “Yours?” he says. “Or someone you know?”', [
    c('Help dig', 'Hard work. Good pay.', [gr(30, 50), hp(-4)]),
    c('Pray over the grave', 'A blessing costs nothing.', [bless('ward'), san(3)]),
    c('Search the grave', 'The dead don’t need much.', [loot(), cor(1)], { check: ck('cunning'), fail: [fight()] })]),
  E('starmap', 'A Scrap of Star-Chart', 'compass', 'any', 'A curled fragment of vellum, star-marked by someone who was very frightened. One of the stars is circled. It has your name.', [
    c('Study it', 'Astronomy is a discipline.', [lore, xp(0.15)]),
    c('Sell it', 'Collectors pay for these.', [gr(30, 60)]),
    c('Burn it', 'Some things should not be known.', [san(4)])]),
  E('wounded', 'The Wounded Deserter', 'e_soldier', 'any', 'A man in a torn uniform clutches a wound in his side. He has a satchel he does not want you to see.', [
    c('Bind his wound', 'Use a supply.', [san(6), xp(0.15), rand(0.6, [loot('rare'), log('He gives you what was in the satchel.', 'good')])], { cost: { supplies: 1 } }),
    c('Take the satchel', 'He can’t stop you.', [gr(40, 70), san(-3)]),
    c('Put him out of his misery', 'Mercy or murder.', [san(-4), gr(10, 20)])]),
  E('whispershrine', 'The Whispering Shrine', 'holy', 'any', 'A small stone shrine murmurs prayers in a language that is not words. A bowl at its foot is empty and dry.', [
    c('Pour water', 'Spend a supply.', [bless('ward'), san(4)], { cost: { supplies: 1 } }),
    c('Offer blood', '−6% health.', [bless('blade'), san(3)], { cost: { hp: 6 } }),
    c('Offer gold (20)', 'The shrine takes it.', [bless('eye'), san(6)], { cost: { gold: 20 } })]),
  E('ratking', 'The Rat King’s Court', 'e_rat', 'any', 'A throne of bones and rags, upon which sits a great grey rat in a paper crown. Thousands of smaller rats watch you.', [
    c('Bow', 'Play the game.', [rand(0.6, [gr(30, 60), cons()], [log('The court laughs, and bites.', 'bad'), hp(-6)])]),
    c('Charge the throne', 'Kill the king. (Fight)', [fight('elite')]),
    c('Slip away', 'Rats notice.', leave, { check: ck('cunning'), fail: [fight()] })]),
  E('voicewall', 'The Voice in the Wall', 'e_dread', 'any', 'A face is pressed into the stone, moving its lips. “Ask,” it says. “I know everything that has happened. Ask.”', [
    c('Ask about the past', 'Lore, at a cost.', [lore, san(-3), xp(0.1)]),
    c('Ask about the future', 'Danger.', [san(-8), xp(0.25), gr(30, 60)]),
    c('Ask it to be quiet', 'Nothing is more valuable than silence.', [san(6)])]),
  E('ashfawn', 'The Fawn in the Embers', 'e_stag', 'forest fire', 'A fawn made of embers is trapped under a fallen branch. Its eyes are exactly the shape of the Hart’s.', [
    c('Free it', 'Mercy.', [cons(), san(6), xp(0.15)], { check: ck('vigor'), fail: [hp(-6), log('It flees, and scorches you.')] }),
    c('Hunt it', 'Meat and coin.', [sup(2), gr(15, 30), san(-3)]),
    c('Leave it', 'It is not your problem.', leave)]),
  E('cursedcoins', 'A Pile of Cursed Coins', 'j_crowncoin', 'any', 'A heap of old gold sits in a niche, gleaming. A sign in a bad hand says DO NOT. The sign is very old.', [
    c('Take a handful', '+1 corruption.', [gr(70, 120), cor(1), san(-3)]),
    c('Take one coin', 'A modest sin.', [gr(20, 35), san(-1)]),
    c('Leave it', 'Wisdom.', [san(3)])]),
];

function item0(id: string): Eff { return { t: 'item', id, n: 1 } }

const LM = (id: string, title: string, icon: string, text: string, choices: Choice[]): StoryEvent => ({ id, title, icon, text, choices, tags: ['landmark'] });
export const LANDMARK_EVENTS: StoryEvent[] = [
  LM('ev_roadshrine', 'The Wayside Shrine', 'holy', 'A shrine to a saint who has been scraped off the stone. Someone leaves fresh flowers anyway.', [
    c('Pray', 'Restore your sanity.', [san(12), hpp(15)]),
    c('Leave an offering (25 gold)', 'Be blessed.', [bless('ward'), san(6)], { cost: { gold: 25 } }),
    c('Take the flowers', 'Someone else will replace them.', [gr(5, 15)])]),
  LM('ev_oldwell', 'The Well That Knows You', 'well', 'The well recites your name, your mother’s name, and your name from a life you did not live.', [
    c('Answer', 'Say who you are.', [san(10), xp(0.2), lore], { check: ck('will'), fail: [san(-6), log('The well laughs.', 'bad')] }),
    c('Drop a coin', 'Ask a question.', [gr(30, 60), san(-2)], { cost: { gold: 10 } }),
    c('Walk away', 'Some things do not need to be known.', leave)]),
  LM('ev_headlesssaint', 'The Headless Saint', 'tombstone', 'A saint of pale stone stands in a field, hands folded in prayer. Her head is missing. Around her neck is a ring of fresh flowers.', [
    c('Kneel', 'Pray at her feet.', [san(10), st('will', 1), xp(0.15)], { check: ck('will'), fail: [san(-4)] }),
    c('Search the base', 'Pilgrims leave gifts.', [loot('rare'), cons()], { check: ck('cunning'), fail: [san(-3)] }),
    c('Leave', 'It’s watching.', leave)]),
  LM('ev_wreck', 'The Beached Wreck', 'm_ship', 'A sea-eaten hull lies across the rocks. Something is still moving in the hold.', [
    c('Search the hold', 'Salvage is honest work.', [loot('rare'), gr(30, 60)], { check: ck('cunning'), fail: [fight()] }),
    c('Search the deck', 'Safe, if dull.', [gr(20, 40), cons()]),
    c('Leave', 'Let the wreck be.', leave)]),
  LM('ev_ashbeacon', 'The Ash Beacon', 'campfire', 'A tower of black stone, still burning after a century. The Covenant tends it. Today it is unattended.', [
    c('Warm yourself', 'Heal.', [hpp(40), san(10)]),
    c('Feed it a supply', 'A blessing.', [bless('blade'), san(4)], { cost: { supplies: 1 } }),
    c('Steal a brand', 'A burning torch.', [cons(2)], { check: ck('cunning'), fail: [hp(-8)] })]),
  LM('ev_burntfarm', 'The Burnt Farmstead', 'm_house', 'A blackened farmhouse, a burnt barn and three shallow graves marked with sticks.', [
    c('Bury the dead properly', 'It takes an hour.', [san(8), xp(0.2), cons()]),
    c('Search the ashes', 'Something valuable may have survived.', [gr(30, 60), loot()]),
    c('Leave', 'It was a long time ago.', leave)]),
  LM('ev_obelisk', 'The Whispering Obelisk', 'm_obelisk', 'A black spire carved with a script you almost recognise. When you stand near it, the whispering starts.', [
    c('Listen', 'Lore at a cost.', [lore, lore, san(-8)]),
    c('Touch it', 'Feel the writing.', [st('will', 1), cor(1), san(-6)]),
    c('Move away', 'Some spires are best avoided.', leave)]),
  LM('ev_frozencart', 'The Frozen Supply Cart', 'm_camp', 'A supply wagon buried up to its axles in snow. The horses are still in the traces, upright.', [
    c('Loot the cart', 'It will not be missed.', [sup(4), cons(2), gr(30, 60)]),
    c('Break the ice', 'The wagon is full.', [loot('rare'), sup(3)], { check: ck('vigor'), fail: [hp(-8)] }),
    c('Leave', 'Some things should stay frozen.', leave)]),
  LM('ev_bonealtar', 'The Titan’s Altar', 'altar', 'A slab of bone, thick as a house. A shallow cup is carved into it, still stained.', [
    c('Offer blood (10% health)', 'Gain Vigor.', [st('vigor', 1), xp(0.15)], { cost: { hp: 10 } }),
    c('Offer memory', 'Lose sanity, gain wisdom.', [san(-8), st('will', 1)]),
    c('Leave', 'It is hungry.', leave)]),
  LM('ev_cairn', 'The Traveler’s Cairn', 'm_ruins', 'A stack of stones by the road, each one placed by a traveller who hoped to be back.', [
    c('Add a stone', 'For luck.', [san(4), bless('eye')]),
    c('Take a stone', 'It might be lucky.', [gr(10, 25)]),
    c('Pass by', 'There is no time.', leave)]),
  LM('ev_mirrorlake', 'The Mirror Lake', 'fountain', 'The lake is perfectly still. Your reflection is a different colour than you, and it is watching.', [
    c('Gaze into it', 'Look at yourself.', [san(12), xp(0.2)], { check: ck('will'), fail: [san(-8), log('It looks back too long.', 'bad')] }),
    c('Drink', 'Cold, clear water.', [hpp(25), san(4)]),
    c('Throw a stone', 'Break the illusion.', [gr(10, 20), san(-2)])]),
  LM('ev_hermit', 'The Hermit’s Hollow', 'm_camp', 'A cave with a fire and a very old man reading a very old book. He does not look up.', [
    c('Ask for lore', 'Pay 40 gold.', [lore, lore, xp(0.15)], { cost: { gold: 40 } }),
    c('Trade supplies', 'Give 2 supplies for a remedy.', [cons(2), hpp(25)], { cost: { supplies: 2 } }),
    c('Sit with him', 'Silence is a gift.', [san(10), xp(0.1)])]),
  LM('ev_noonpool', 'The Noon Pool', 'fountain', 'A pool of liquid gold lies beneath a stone lip. It reflects a sky you have never seen. It is night, and there are stars.', [
    c('Drink', 'Restore yourself completely.', [{ t: 'restore' }, xp(0.3)]),
    c('Gaze at the stars', 'Remember the night.', [lore, san(-6), xp(0.3)], { check: ck('will'), fail: [san(-10)] }),
    c('Leave it be', 'It belongs to Solenne.', leave)]),
];

export const EVENT_MAP = new Map([...EVENTS, ...LANDMARK_EVENTS].map(e => [e.id, e]));
