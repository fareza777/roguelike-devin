import type { Cond, DChoice, DNode, Eff, SceneDef } from '../types';

const flag = (k: string, v = 1): Eff => ({ t: 'flag', k, v });
const main = (to: string): Eff => ({ t: 'main', to });
const gold = (n: number): Eff => ({ t: 'gold', n });
const xpL = (m: number): Eff => ({ t: 'xpL', m });
const item = (id: string, n = 1): Eff => ({ t: 'item', id, n });
const take = (id: string): Eff => ({ t: 'take', id });
const san = (n: number): Eff => ({ t: 'san', n });
const corrupt = (n: number): Eff => ({ t: 'corrupt', n });
const lore = (id?: string): Eff => ({ t: 'lore', id });
const quest = (id: string): Eff => ({ t: 'quest', id });
const unlock = (loc: string): Eff => ({ t: 'unlock', loc });
const end = (id: string): Eff => ({ t: 'end', id });
const fight = (enemy: string, win: Eff[], rank: 'normal' | 'elite' | 'boss' = 'elite'): Eff => ({ t: 'fight', enemy, rank, win, noFlee: true });
const ch = (label: string, next?: string, o: Partial<DChoice> = {}): DChoice => ({ label, next, ...o });
const go = (label = 'Continue', next?: string, cond?: Cond, eff?: Eff[]): DChoice => ({ label, next, cond, eff });

type Extra = Partial<Omit<DNode, 'who' | 'text'>>;
type Spec = [who: string, text: string, extra?: Extra];
const sc = (id: string, art: string, specs: Spec[]): SceneDef => ({ id, art, nodes: specs.map(([who, text, x], i) => ({ id: x?.id ?? String(i), who, text, ...x })) });

export const SCENES: SceneDef[] = [
  sc('s_ilse_intro', 'lantern_hall', [
    ['narrator', 'The Lantern Hall is warm the way a mouth is warm. Lanterns gutter along the hall. On the dais an old woman in white sits with her back very straight, and where her eyes should be there is a strip of black silk.'],
    ['ilse', '“You are late, Wayfarer. Or I am early. Time has been unreliable since the sun died.”'],
    ['ilse', '“There are four seals. They hold the wound in the sky shut. Each is kept by a Warden, a volunteer who chose never to die. Lately they have begun to fail: the bell in Saltmere, the fire in Ashwood, the bones in the quarry, the snow in the Pass.”', { choices: [
      ch('“You want me to kill Wardens.”', '3a'), ch('“Why me?”', '3b'), ch('“What do I get out of it?”', '3c')] }],
    ['ilse', '“The Wardens are already dead. The seals merely hold their bodies up. You would be doing them a kindness.”', { id: '3a', next: '4' }],
    ['ilse', '“You have the look of someone the road has not finished with. That is rarer than courage, and much more useful.”', { id: '3b', next: '4' }],
    ['ilse', '“A sunrise. Or the next best thing. Do not look at me like that. I have been honest with worse people than you.”', { id: '3c', next: '4' }],
    ['ilse', '“Break the four seals. Then walk into the Black Meridian and sit where no one has managed to sit. Bring back the morning.” She presses a key of pale brass into your palm. It is warm. For a moment it seems to be looking at you.', { id: '4', eff: [item('tok_key'), flag('has_key')] }],
    ['ilse', '“It will open the seals. It will also, I hope, keep you honest. Go to the Captain of the Watch. He will point you south.”'],
    ['narrator', 'The doors close behind you. Above the city the sun hangs black, ringed in cold gold. On the flagstones you cast three shadows. Then, blinking, only one.', { eff: [main('m01'), xpL(0.3), lore('The Seal-Key')] }],
  ]),

  sc('s_roe_intro', 'veyrgard', [
    ['narrator', 'Captain Roe waits at the western gate, drinking something hot out of a dented cup. He watches the key in your hand the way a man watches a snake he has been told is harmless.'],
    ['roe', '“That key. The Seer’s given out more of those than she’s given favours. Doesn’t make me feel any better about it.”'],
    ['roe', '“Saltmere first. It’s the closest seal and the loudest. You’ll hear the bell from ten miles out. Ignore it if you can.”', { choices: [
      ch('“What happened to the ones who went before me?”', '3'), ch('“I can handle a bell.”', '4')] }],
    ['roe', 'He does not answer for a moment. “The Watch keeps a list. It’s not a short list. It’s not a list I’d show a friend.”', { id: '3', next: '4b' }],
    ['roe', '“Everyone says that. Everyone I’ve buried said that.”', { id: '4', next: '4b' }],
    ['roe', 'He unbuckles a plain, well-kept sabre from his belt and hands it over hilt-first. “Mine, from when I was your age and stupid. Bring it back. And the road is honest, so stay on it. Everything else out there is lying.”', { id: '4b', eff: [item('u_roe_sabre'), main('m02'), xpL(0.15)] }],
  ]),

  sc('s_saltmere_arrive', 'bellhouse', [
    ['narrator', 'Saltmere sits on the water like a scab. The tide is out, and the streets are lined with things it left behind: nets, boots, a drowned man with a brass key clutched in his fist. Somewhere far below, a bell rings once and does not stop.'],
    ['ysolde', '“Port’s closed. Turn around. Or don’t. Everyone does what they like anyway.” A tall woman with a salt-white braid strides toward you, one hand on a knife. Her gaze drops to the key at your throat. She goes very still.'],
    ['ysolde', '“That’s one of the Seer’s keys.” She exhales slowly. “Right. Of course it is. Go and talk to Osk Tallow at the drowned bellhouse. He’s the only man who can stand to be near the bell. And if you want anything done at faster than walking pace, find Corvin Vale. Tell him I sent you. He’ll charge you double.”'],
    ['ysolde', '“One thing, Wayfarer.” She doesn’t look at you. “When you come back, come and see me. Alive, ideally. I have something I want to show you.”', { eff: [main('m03'), unlock('saltmere'), xpL(0.2)] }],
  ]),

  sc('s_corvin', 'bellhouse', [
    ['narrator', 'Corvin Vale is leaning on a crate that was not there a moment ago. He is smiling before you notice him, which is how he likes it.'],
    ['corvin', '“A Wayfarer with a Seer’s key. My favourite kind of customer: doomed, well-funded and full of questions.”'],
    ['corvin', '“Free advice, since I like the look of you: the Widow isn’t what the sailors say. Nobody ever talks about the bride. They talk about the bell. It’s always the bell.”', { choices: [
      ch('“Anything else you’ll give me for free?”', '3'), ch('“How do I get past the tide?”', '4'), ch('“I’ll pass.”', '5')] }],
    ['corvin', '“Two smoke pellets, from the bottom of a very interesting barrel. Don’t ask what was in the barrel.”', { id: '3', eff: [item('smokepellet', 2), flag('corvin_met')], next: '5' }],
    ['corvin', '“Same way everyone does: carefully, and with a plan to be somewhere else. There’s a ring the Widow lost in the sea caves at Wickhaven. Bring it to her grave, if she has one. Some debts outlive people.”', { id: '4', eff: [flag('corvin_met'), quest('q_widow_ring')], next: '5' }],
    ['corvin', '“Pleasure doing business. It’s always a pleasure. Sometimes the pleasure is mine alone.”', { id: '5' }],
  ]),

  sc('s_osk', 'bellhouse', [
    ['narrator', 'The drowned bellhouse’s hall lies under a foot of black water. Osk Tallow stands on the dais in a pair of fisherman’s waders, both hands wrapped around a bell-rope that is not connected to anything.'],
    ['osk', '“I stopped hearing it years ago, thank the tide. Now I only feel it. In the teeth. Do you feel it? Ah. You will.”'],
    ['osk', '“The bell under the harbour tolls once for every Wayfarer who drowns trying to reach the Widow. It has tolled more times this year than any year since the first.”', { choices: [
      ch('“Who is the Widow?”', '3'), ch('“Wayfarers? Plural?”', '4')] }],
    ['osk', '“Aveline Marrek. Harbormistress. Three hundred years ago the flood took the lower city, and she married the bell to stop it. The bell agreed. She has been its bride ever since. She was not a monster. She was a bride.”', { id: '3', next: '5' }],
    ['osk', '“Ah.” The rope goes still. “Ysolde didn’t tell you. Of course she didn’t. Ask her when you return.”', { id: '4', next: '5' }],
    ['osk', 'He kneels and opens a hatch in the dais. Stairs lead down into water so black it has no depth. “The Catacombs. Take a lantern and a little luck. The dead are not unfriendly. They are simply not finished.”', { id: '5', eff: [flag('osk_met'), main('m04'), xpL(0.15)] }],
  ]),

  sc('s_cata_intro', 'bellhouse', [
    ['narrator', 'Water to the ankle, then the knee, then the belly. Candles float in niches, unwavering. The corridor is lined with the drowned, standing in the current like reeds. Each one wears a brass key at the throat. Each key is warm when you pass.'],
    ['narrator', 'You count seven before you stop counting. Somewhere ahead, a woman is singing softly to a bell.', { eff: [flag('saw_pilgrim_keys'), san(-2)] }],
  ]),

  sc('s_widow', 'bellhouse', [
    ['narrator', 'The bell is silent. The bride lies against it, her veil floating around her like smoke on water. She is very old, and very light, and looking directly at you.'],
    ['widow', '“Finally. One who is still breathing when they reach me.”'],
    ['widow', '“Do you know how many came before you? Ask the water. It has counted.”', { choices: [
      ch('“Who were they?”', '3'), ch('“The seals hold the wound shut. You’re a Warden.”', '4'), ch('“Rest now.”', '5')] }],
    ['widow', '“Wayfarers. Every one of them carrying the key you carry. Sent one at a time, every few years, to break my seal. They never got past the tide. You did. That is either luck, or that is why you were sent.”', { id: '3', next: '5' }],
    ['widow', '“The seal holds something shut. I have listened to it for three hundred years. It sings. It is not a wound, Wayfarer. It is a throat.”', { id: '4', next: '5', eff: [lore('The Bell Beneath')] }],
    ['widow', 'She presses a sodden paper into your hand. The handwriting is achingly familiar. It is yours. “Do not trust Ilse. Do not sit the throne. Go home if you can. If you cannot, forgive me. — You.”', { id: '5', eff: [item('tok_letter'), flag('widow_letter'), san(-4)] }],
    ['widow', '“I lost my wedding ring in the caves at Wickhaven, when I went to marry the sea. Bring it to my grave, if I have one. I think, if I had it, I could finally… rest properly.”', { choices: [
      ch('“I will.”', '7', { eff: [flag('widow_promise')] }), ch('“I make no promises.”', '7')] }],
    ['narrator', 'She lets go of the bell. It rings once. And then the water goes still, and every key on every drowned throat goes cold at the same time.', { id: '7', eff: [flag('boss_widow'), lore('The Widow’s Vow'), main('m05'), xpL(0.5), quest('q_widow_ring')] }],
  ]),

  sc('s_ysolde_keys', 'bellhouse', [
    ['narrator', 'Ysolde’s office is a hull turned upside down. She unlocks a drawer and tilts it toward you. Eleven brass keys, each on a faded ribbon, shine in the lamplight. All of them are warm.'],
    ['ysolde', '“Your key’s twin. The last one belonged to a man named Anselm. Before him, a girl with your hair. I keep them. Somebody should.”'],
    ['ysolde', '“Aveline Marrek was my great-great-grandmother. I never told Osk. Did she suffer?”', { choices: [
      ch('“Yes. For three hundred years.”', '3', { eff: [flag('ysolde_truth')] }), ch('“She’s at peace now.”', '4', { eff: [flag('ysolde_comfort')] })] }],
    ['ysolde', 'Ysolde nods slowly. “Thank you for not lying. It’s the rarest thing anyone’s given me.” She looks at the keys. “I’ll have to tell my daughter.”', { id: '3', next: '5' }],
    ['ysolde', 'Ysolde nods, blinking. “Kind. A kind lie is still a lie. But I’ll take it.” She almost smiles. “She always hated the bell.”', { id: '4', next: '5' }],
    ['ysolde', '“Whoever’s sending you is sending you to die or to win, and I can’t tell those apart from here. East, next. The Ash Compact in Emberhollow keeps a fire that can read things. Ask them what your key really is.”', { id: '5', eff: [gold(120), main('m06'), xpL(0.4)] }],
  ]),

  sc('s_ember_arrive', 'ashwood', [
    ['narrator', 'Emberhollow is built of wood, and it does not burn. The foresters swear it is stubbornness. The trees, which have been watching you since the treeline, say nothing.'],
    ['maren', '“A traveller! Come in, child. You look exhausted. Sit, sit. The Cinder Hall keeps a bed for the Seer’s messengers.” A gentle woman with warm hands and grey, unblinking eyes sweeps you toward the fire.'],
    ['tamsin', '“Keeper. He’s mine.” A soot-stained woman in a scorched cloak appears in the doorway with a hatchet on her hip. “The Compact handles guests. You handle sermons.”'],
    ['narrator', 'The keeper smiles all the way to her eyes. It is not quite the right smile. Then she bows, and steps away.', { eff: [main('m07'), xpL(0.2)] }],
  ]),

  sc('s_tamsin', 'ashwood', [
    ['tamsin', '“Four wardens, four seals, one Seer. Do you know what Ashwood’s seal looks like? It’s a stag. A stag with a forest for antlers, and the forest is on fire. The Cinder Hart. We call him Hartwyn.”'],
    ['tamsin', '“He was a man once. My great-uncle. Ranger-Marshal of the Ash Compact. He disappeared the night the sun went black, and the Hart appeared, and the fire has been walking ever since.”', { choices: [
      ch('“You said “was a man”.”', '3'), ch('“Ilse says the Wardens volunteered.”', '4')] }],
    ['tamsin', 'Her jaw tightens. “He’s still a man. Sometimes. In the dusk, when the horn sounds. His brother Osric hunts him with it. Thirty years now. Neither of them can stop.”', { id: '3', next: '5' }],
    ['tamsin', '“Volunteered.” She laughs without any humour. “Ask that key of yours. Show it to the hearth-fire in the morning. The fire never lies. It’s the only thing in Ashwood that hasn’t learned to.”', { id: '4', next: '5' }],
    ['tamsin', 'She jerks her chin at the hearth. “Tonight. Come when the coals are red.”', { id: '5', eff: [main('m08'), xpL(0.2), lore('The Ash Compact')] }],
  ]),

  sc('s_leash', 'ashwood', [
    ['narrator', 'The hearth-fire of the Ash Compact burns with no wood at all. Tamsin nods once. You hold out the key. It shrieks. The fire leans toward it like a hungry dog, and for a moment, it bares its teeth.'],
    ['tamsin', '“That’s not a key,” she says softly. “It’s a leash. Whoever holds the other end sees what you see. Hears what you hear.”', { eff: [lore('The Seal-Key')] }],
    ['tamsin', '“Seer Ilse tore out her own eyes, Wayfarer. But there’s nothing wrong with the eyes she borrows.”', { choices: [
      ch('“Cut it.”', '3', { eff: [flag('leash_cut')] }), ch('“Leave it. I want her to see everything.”', '4', { eff: [flag('leash_kept')] }), ch('“Can you do both?”', undefined, { check: { stat: 'cunning', dc: 12, pass: '5a', fail: '5b' } })] }],
    ['narrator', 'Tamsin lays the key in the coals. Pain like a hot wire runs from your palm to your skull. When it passes, the key is dull, ashen, and cold, and for the first time in weeks you feel entirely alone. It is wonderful.', { id: '3', eff: [san(-8), corrupt(1), { t: 'stat', k: 'will', n: -1 }], next: '6' }],
    ['narrator', 'You close your hand around the warm brass. Somewhere far away, something very old and very patient is watching the hearth-fire through your eyes. You wonder if she is smiling.', { id: '4', next: '6' }],
    ['narrator', 'You feed Ilse’s eyes a very carefully chosen lie: the key is dead, the leash is cut. It works. She believes it. Somewhere very far away, a blind woman’s smile flickers, then holds. You have bought yourself something very valuable.', { id: '5a', eff: [flag('leash_feint'), flag('leash_kept')], next: '6' }],
    ['narrator', 'You try to be clever with a leash, and the leash notices. A cold voice, very gentle, very far away, murmurs, “Naughty.” You almost drop the key.', { id: '5b', eff: [flag('leash_kept'), san(-6)], next: '6' }],
    ['tamsin', '“Ashwood is east. The Hart walks at its heart. Whatever you decide at the end of that path, you decide it yourself. That’s the only advice I have, and it’s the only advice worth having.”', { id: '6', eff: [xpL(0.3)] }],
  ]),

  sc('s_ash_intro', 'ashwood', [
    ['narrator', 'The forest is silent, but not empty. Every tree is a little too tall, every shadow a little too long. Lanterns hang from branches, guttering, swaying, and every one of them holds a face.', { choices: [go('Continue', 'k', { flag: 'leash_kept' }), go('Continue', '3', { not: 'leash_kept' })] }],
    ['narrator', 'The key at your throat is warm. A voice, very soft, very kind, rises from it like smoke: “Careful, Wayfarer. I can see so much from here.”', { id: 'k', eff: [san(-2)] }],
    ['narrator', 'Ahead, the trees part. A great antlered shape, wreathed in fire, lifts its head from the ash and looks directly at you.', { id: '3', eff: [san(-2)] }],
  ]),

  sc('s_hart', 'ashwood', [
    ['narrator', 'The Hart kneels. The flames go out of its antlers one tine at a time. Where the fire fell, a very old man in the scorched remains of a ranger’s cloak leans on his hands and breathes.'],
    ['hart', '“Hartwyn Aldwyn. Ranger-Marshal. Once.” His voice is like a door that has not been opened for a very long time. “Thank you. That was very quick.”'],
    ['hart', '“Four Marshals guarded the Seer’s Court. Four of us. She ordered us to feed the lanterns with living light. We refused. She said we would be Wardens instead. She called us volunteers. We were sentenced.”', { choices: [
      ch('“Sentenced?”', '3'), ch('“Your brother still hunts you.”', '4')] }],
    ['hart', '“The seals aren’t doors, child. They’re cells. She built them from us, and she used the light we made to keep Veyrgard lit. Every lantern in that city is a little of us.”', { id: '3', next: '5', eff: [lore('On Wardens')] }],
    ['hart', 'His face crumples. “Osric. Tell him I forgave him at the second dawn. He won’t believe it. I would not.”', { id: '4', next: '5' }],
    ['hart', '“A locket of antler bone, with a lock of my wife’s hair. Osric buried it in the Hearth Crypt when I first changed. If you find it, put it on my cairn. Whatever you find at the end of this road: choose it yourself.”', { id: '5' }],
    ['narrator', 'The old man dissolves into a fall of embers, and the forest, for the first time in thirty years, is quiet. Somewhere far off, a horn sounds, and does not finish the call.', { eff: [flag('boss_hart'), lore('The Cinder Hart'), main('m09'), xpL(0.5), quest('q_hart_locket')] }],
  ]),

  sc('s_maren', 'ashwood', [
    ['narrator', 'Lamp-Keeper Maren is waiting in the empty Cinder Hall, hands folded, smiling. The candles have all gone out at once.'],
    ['maren', '“Oh, my dear. You’ve done so well.” Her voice is different. Softer, more assured. It is Ilse’s voice, laid over hers like a second layer of varnish.', { choices: [
      ch('“Maren?”', '2a', { cond: { flag: 'leash_kept' } }), ch('“Maren?”', '2b', { cond: { not: 'leash_kept' } })] }],
    ['maren', '“I’ve watched through her eyes, and yours, since the Lantern Hall. It has been so lovely to see the world again. Thank you, child.” She unfolds her hands. “Now. You’ll go west, and you’ll do exactly what I ask, and you will not be difficult about it.”', { id: '2a', next: '3' }],
    ['maren', '“I can’t see her anymore,” Maren whispers, in her own voice, gone very small. “She’s stopped talking to me. I’ve been blind for so long, and now I’m blind again. Please.”', { id: '2b', choices: [ch('Spare her.', '4', { eff: [flag('maren_spared'), gold(60)] }), ch('End it.', '5', { eff: [] })] }],
    ['maren', 'She moves. It’s not a keeper’s speed. The candles flare, and the ash-eyes glimmer in her sockets. “Last chance, child.”', { id: '3', choices: [ch('Fight.', '5'), ch('Spare her.', '4', { eff: [flag('maren_spared'), gold(60)] })] }],
    ['narrator', 'You lower your weapon. Maren sinks to her knees and weeps. When she looks up, the grey in her eyes is only grey. “West,” she says. “Gravemarrow. Be careful of Dagna. She’ll like you, and then she’ll want a great deal of you.”', { id: '4', eff: [main('m10'), xpL(0.25)], next: '99' }],
    ['narrator', 'The hall fills with light, and it is not kind.', { id: '5', eff: [fight('maren', [flag('maren_fought'), main('m10'), xpL(0.35)])], next: '99' }],
    ['narrator', 'Ash drifts down from the rafters like snow.', { id: '99' }],
  ]),

  sc('s_marrow_arrive', 'quarry', [
    ['narrator', 'Gravemarrow curves around you like a hand: a city carved into the ribcage of a creature that could not have lived. The walls hum on windless nights. From every corridor, low and constant, comes the sound of people chanting names.'],
    ['dagna', '“You’re late. You’re also the first Wayfarer who’s come by the front door.” Dagna Stonevein looks you over like a beam she is deciding whether to trust. “Good. Come to the forge. We have a problem, and it is exactly as big as the ground.”', { eff: [main('m11'), xpL(0.2)] }],
  ]),

  sc('s_dagna', 'quarry', [
    ['narrator', 'Dagna’s forge glows the colour of the inside of a heart. She holds up a small crystal shard on a pair of tongs. It is pale gold, and it trembles when the fire nears it. It flinches.'],
    ['dagna', '“Morning-glass. We dig it from the deepest shaft. Every lantern in Veyrgard burns it. I forged the first one myself. I was very proud.”'],
    ['dagna', '“Then Foreman Grist started hearing something in the wall. Singing. A child’s song. He said the glass was alive. He said it was a piece of the Morning.”', { choices: [
      ch('“The Morning?”', '3'), ch('“What did the Court say?”', '4')] }],
    ['dagna', '“The sun. Or what the sun was, before it went black. The Titans in the walls are dead suns, and the last one’s down there, still warm.”', { id: '3', next: '5', eff: [flag('glass_known')] }],
    ['dagna', '“Ilse ordered the deep shaft dug wider. Grist refused. He went down to seal it himself, and the shaft closed behind him. He’s the third seal now. He calls the walls his family.”', { id: '4', next: '5', eff: [flag('glass_known')] }],
    ['dagna', '“Go down. Find him. Bring back whatever’s left. And if he asks you to remember him, do it, even if you have to write it on your own bones.”', { id: '5', eff: [main('m12'), lore('Morning-Glass'), xpL(0.3)] }],
  ]),

  sc('s_quarry_intro', 'quarry', [
    ['narrator', 'The quarry is a wound in the world: ledges, scaffolds, rope bridges, and bones. Everywhere, bones. Skulls the size of cottages, ribs the length of viaducts. And in every wall, half-buried, half-carved, a name.'],
    ['narrator', 'They are written in chalk, in blood, in tally-marks, in things that are not paint. There are thousands. Every one of them is a miner.', { eff: [san(-2)] }],
  ]),

  sc('s_grist', 'quarry', [
    ['narrator', 'The Foreman is a skeleton standing in a wall of skeletons, holding a chalk-stub in one hand and a scythe in the other. He does not look up as you approach. He is finishing a name.'],
    ['grist', '“Sorry. One moment. It’s important to get them right.” He finishes the last stroke and lowers the chalk. “There. Seven hundred and thirteen. Thank you for waiting.”'],
    ['grist', '“I promised them they’d be remembered. Then the wall fell. I couldn’t bring them up, so I brought the wall down on us all, and built them in. Now they’re very well remembered.”', { choices: [
      ch('“What did you find, down there?”', '3'), ch('“The Court made you a Warden.”', '4')] }],
    ['grist', '“The Titans. They weren’t creatures. They were suns. This is the eleventh. Each dawn, one died, and the next rose. The last one is the Morning. She’s not dead. She’s caged, and the Meridian isn’t a wound, it’s the stump where they cut her neck.”', { id: '3', next: '5', eff: [lore('The Bone Titans'), lore('Morning-Glass')] }],
    ['grist', '“A Warden. Yes. Ilse asked if I’d stop digging. I said I’d stop when they stopped bleeding. She said, “Then bleed.” That was three hundred years ago and I am still digging.”', { id: '4', next: '5' }],
    ['grist', '“Tell Dagna I never meant it to be a tomb. There’s a lamp of mine in the Titan’s Ribcage. It has all their names inscribed on the inside. If it’s ever set on my grave, maybe I’ll finally be able to stop counting.”', { id: '5' }],
    ['narrator', 'He puts down the scythe, picks up the chalk, and slowly, carefully, adds one more name to the wall. Yours. He smiles. The bones fall silent, one by one.', { eff: [flag('boss_grist'), item('tok_glass'), main('m13'), xpL(0.5), quest('q_grist_lamp'), lore('Names in the Walls')] }],
  ]),

  sc('s_dagna_after', 'quarry', [
    ['narrator', 'Dagna turns the shard of Morning-glass in her fingers, and it flinches from her like a shy animal.'],
    ['dagna', '“Every lantern in Veyrgard is a slice of a child in a cage. I forged the first. I was proud. I was so proud.” She sets the shard down very gently. “Take it. I don’t want it in my forge.”'],
    ['narrator', 'A raven lands on the smithy’s sill with a sealed letter in its beak. It stares at you, unblinking, then drops the letter and flies.'],
    ['pell', '“Wayfarer. The Collegium’s vaults contain a ledger with eleven crossed-out names, and a blank for a twelfth. The frozen army in the Pass knows how the Regency ends. Go to Hollowreach. Please hurry. The stars are getting fewer. — Pell”', { eff: [main('m14'), xpL(0.3), gold(200)] }],
  ]),

  sc('s_reach_arrive', 'pass', [
    ['narrator', 'Hollowreach is black stone and permanent snow. Every soldier on the walls faces north. Every one of them keeps glancing south, at something you cannot see.'],
    ['sigrun', '“You’re the Wayfarer.” A woman with a general’s jaw and a daughter’s tired eyes descends from the ramparts. “I am Sigrun Vhal. Don’t salute me. I’ve seen where salutes end up.”', { eff: [main('m15'), xpL(0.2)] }],
  ]),

  sc('s_sigrun', 'pass', [
    ['sigrun', '“My father marched twelve thousand men south from this fortress sixty years ago. They reached the Pass and stopped. Every one. Frozen in an instant, facing Veyrgard. They have stood there ever since.”'],
    ['sigrun', '“The Court says it was a curse from the Meridian. But my father wrote to me the night before. He said: “Do not let them sit.” I was six. I did not know what it meant. I still don’t.”', { choices: [
      ch('“Ilse did it.”', '3'), ch('“I’ll find out.”', '4')] }],
    ['sigrun', 'She doesn’t flinch. “That’s what I’m afraid of. Because if you’re right, I have been serving her for forty years.”', { id: '3', next: '5' }],
    ['sigrun', '“Good. I’ll give you the Marshal’s seal, so the sentries don’t shoot. They’re only frozen. They’re not stupid.”', { id: '4', next: '5' }],
    ['sigrun', 'She hands you a wolf-pelt cloak. “From my father’s guard. Take it. The Pass is very cold.”', { id: '5', eff: [main('m16'), item('u_snow_cloak'), xpL(0.3), lore('The Southward Army')] }],
  ]),

  sc('s_pass_intro', 'pass', [
    ['narrator', 'The Weeping Pass is a slot in the world, ice-lined and silent. They stand along both sides, twelve thousand soldiers in perfect ranks, snow to their knees, every one facing south. Every face is wet. The tears are frozen in mid-fall.'],
    ['narrator', 'On the wind, very faintly, a voice you almost recognise is giving a single command, over and over: “Hold.”', { eff: [san(-3)] }],
  ]),

  sc('s_vhal', 'pass', [
    ['narrator', 'General Vhal falls to one knee, and the whole Pass exhales. Twelve thousand soldiers sag together. Their tears finish falling.'],
    ['vhal', '“I was the Ninth,” he says. “The ninth Regent. I sat that throne for eleven years, and on the eleventh I stood up.” He almost laughs. “They can’t forgive that. Standing up.”'],
    ['vhal', '“The throne doesn’t rule the Morning. It sedates her. Every Regent burns out in a lifetime, and the Court picks another. I gathered an army to end it. Ilse froze us here, in one night, facing her. She wanted me to watch.”', { choices: [
      ch('“What is the throne?”', '3'), ch('“How do I end it?”', '4')] }],
    ['vhal', '“A cage with a cushion. It makes you kind. It makes you patient. And every year you sit, you forget a little more of who you were. By the end, you’re only the person the Morning needs.”', { id: '3', next: '5', eff: [lore('Regent’s Rule')] }],
    ['vhal', '“There’s a way. It requires a Regent who consents to leave, and a Morning who’s been told, honestly, that she may. I never found the words. Ask the King what the first Regent’s face looked like. Ask him whose eyes she has.”', { id: '4', next: '5' }],
    ['vhal', '“My banner is in the Frozen Barrows. Set it on my grave, facing north, for once. And tell my daughter I never stopped being ashamed. Nor proud.”', { id: '5' }],
    ['narrator', 'He turns his head, slowly, for the first time in sixty years, and looks north. He dies smiling. All along the Pass, the army lowers its weapons and sits down in the snow.', { eff: [flag('boss_vhal'), item('tok_banner'), main('m17'), xpL(0.5), quest('q_banner'), lore('Letters from the Pass')] }],
  ]),

  sc('s_sigrun_after', 'pass', [
    ['narrator', 'Sigrun takes the frayed standard in both hands. For a long time she does not speak.'],
    ['sigrun', '“He turned his head,” she says at last. “Twelve thousand of them turned. I watched from the wall. I watched them sit down.” She wipes her eyes with the flat of her hand and looks up. “Thank you. I will never say that again. Remember it.”'],
    ['narrator', 'A rider staggers through the gate, half-frozen, ash on his cheeks. “Veyrgard,” he gasps. “The lanterns are going out. The Dreadmarch is at the gate. The Captain says… come home.”', { eff: [main('m18'), item('u_sigrun_axe'), xpL(0.35), gold(250)] }],
  ]),

  sc('s_siege', 'veyrgard', [
    ['narrator', 'Veyrgard is burning. The lanterns have gone out, one street at a time, and where the dark has come the dead have come with it. The walls are strung with people who have never held a weapon. Above them the sun is a black hole with a ring of fire.'],
    ['roe', '“You’re late.” Captain Roe, half of his face a mask of dried blood, grins like a man who has decided he is already dead. “Good. I have never been so glad to be disappointed. There’s a champion at the west gate, dead as a doorpost and twice as hard to get around. Can you do something about it?”', { choices: [
      ch('“Show me.”', '3'), ch('“How many are left?”', '2b')] }],
    ['roe', '“Enough. Barely. Show you? Follow the noise.”', { id: '2b', next: '3' }],
    ['narrator', 'The Legion Champion stands in the gate, seven feet of black armour and hollow pride, holding the doorposts up with his bare hands. He turns as you come. There is no face under the helm, only a sunless hollow.', { id: '3', eff: [fight('siegechamp', [flag('siege_won'), main('m19'), xpL(0.5), { t: 'scene', id: 's_after_siege' }], 'boss')] }],
  ]),

  sc('s_after_siege', 'veyrgard', [
    ['narrator', 'The Champion falls, and the Dreadmarch falls back with him, a tide going out. Dawn does not come. But the lanterns, one by one, begin to sputter back to life, thinner, paler, reluctant.'],
    ['roe', '“They’re coming back,” he breathes. “How?” He looks at you, and then at his own hand. “The city’s not out of danger. But you’ve bought it a week. Go see Pell. He’s been hoarding secrets since before I could read.”'],
    ['companion', 'Your companion has not left your side through the siege. It has, however, been watching you very carefully.', { choices: [
      go('Continue', 'c_moth', { companion: 'Moth' }), go('Continue', 'c_cask', { companion: 'Marshal Cask' }), go('Continue', 'c_nix', { companion: 'Nix' }), go('Continue', 'c_none', { companion: 'None' })], id: 'c_branch' }],
    ['companion', 'Moth stops. Its ears flatten. And then, in a voice that is a little too much like your own: “I’ve never spoken to you. I wanted to be certain. You’ve chosen a hard road.”', { id: 'c_moth', choices: [
      ch('“You can talk.”', 'c_moth2'), ch('“What are you?”', 'c_moth2')] }],
    ['companion', '“The Regent’s Hound. I guided eleven of them. Every one to the throne. I am tired of guiding. I will take you to the end. I will not take you to the throne. Unless you ask.”', { id: 'c_moth2', eff: [flag('companion_trust'), item('u_moth_fang'), xpL(0.2)], next: 'c_end' }],
    ['companion', 'Marshal Cask sets the arquebus down on the parapet, very carefully. “I have something to admit, and if you shoot me for it I will understand.”', { id: 'c_cask', choices: [ch('“Speak.”', 'c_cask2')] }],
    ['companion', '“I’m Ilse’s enforcer. My orders: if you falter, if you ask too many questions, if you refuse the throne, I shoot you. I have been asking questions for a month. I don’t like the answers.”', { id: 'c_cask2', choices: [
      ch('“I forgive you.”', 'c_cask3', { eff: [flag('companion_trust'), item('salts', 2), xpL(0.2)] }), ch('“Then do your job.”', 'c_cask4'), ch('“You’re not staying.”', 'c_cask5')] }],
    ['companion', 'Marshal Cask lowers her head. “Then I’m yours. Not hers. Yours.”', { id: 'c_cask3', next: 'c_end' }],
    ['companion', 'She raises the arquebus, aims at your heart for a long, long moment, and lowers it again, laughing bitterly. “I can’t. Damn you. I can’t.”', { id: 'c_cask4', eff: [flag('companion_trust'), xpL(0.2)], next: 'c_end' }],
    ['narrator', 'She sighs, fixes the sights, and fires.', { id: 'c_cask5', eff: [fight('cask', [flag('cask_dead'), { t: 'companion', name: 'None' }, xpL(0.4)])], next: 'c_end' }],
    ['companion', 'Nix hops to the parapet and shakes out his feathers. “I have a story,” he says, in a rusty voice, “and it isn’t a good one.”', { id: 'c_nix', choices: [ch('“You can talk?”', 'c_nix2')] }],
    ['companion', '“Sixth Regent. Sat for a day. The throne didn’t like me. It spat me out as a raven. I steal memories because I don’t have my own. I stole yours before you were born. It’s still warm.”', { id: 'c_nix2', eff: [flag('companion_trust'), lore('The Regents’ Ledger'), lore('The Morning’s Voice'), xpL(0.3)], next: 'c_end' }],
    ['narrator', 'You are, for the moment, alone with your thoughts.', { id: 'c_none' }],
    ['narrator', 'The wind changes. Above the Collegium, a single lantern flares gold. Pell is waiting.', { id: 'c_end' }],
  ]),

  sc('s_roe_gate', 'veyrgard', [
    ['roe', '“Pell’s in the Collegium. He hasn’t slept, and he keeps drawing the same star over and over. Go on. I’ll hold the wall.”'],
    ['roe', '“And Wayfarer.” He does not look up from his sabre. “Whatever it is, tell them what it was. Tell the wall. It’s earned that.”'],
  ]),

  sc('s_pell_truth', 'veyrgard', [
    ['narrator', 'The Collegium tower is a spiral of desks and star-charts. In the middle sits a sheet of vellum the size of a bed, covered in twelve circles of ink. Pell stands over it in two pairs of spectacles, gripping a pencil like a knife.'],
    ['pell', '“Twelve Veyrs. Eleven with the walls already fallen. The twelfth, in pencil.” He taps it. “That’s this one. Eleven Regents have sat the throne. Each time, a Veyr falls. Each time, the Court rebuilds it and calls it the same city.”'],
    ['pell', '“I found the ledger. Eleven names, crossed out. The twelfth line is blank, and someone has been re-inking it every year, in a hand that is not mine.” He turns the vellum. The twelfth circle bears a single word, in your handwriting. It says: “Don’t.”', { choices: [
      ch('“Who was the first?”', '3'), ch('“And the Wardens?”', '4')] }],
    ['pell', '“The first Regent was named Ilse. She hasn’t aged. She hasn’t slept. She hasn’t, to my knowledge, ever been anywhere she did not choose to be.” His pencil snaps. “She built Veyrgard on the day she left the throne.”', { id: '3', next: '5', eff: [lore('The Regents’ Ledger')] }],
    ['pell', '“Four Marshals who refused an order. Ilse’s first four sworn defenders. She locked them into the seals, and used the light to power the lanterns. Each lantern in this city is a stolen breath.”', { id: '4', next: '5' }],
    ['pell', '“Go to the Lantern Hall. Ask her. She’ll tell you. She’s been waiting three hundred years for someone to ask.”', { id: '5', eff: [main('m20'), xpL(0.3), lore('A Map of Other Veyrs')] }],
  ]),

  sc('s_ilse_reveal', 'lantern_hall', [
    ['narrator', 'The Lantern Hall is quiet. The black silk lies folded on the dais. Ilse turns, and where her eyes should be, there is a pale light, and it is looking straight at you.'],
    ['ilse', '“There you are. I have heard you coming for three hundred years.”', { choices: [
      go('Continue', '2a', { flag: 'leash_cut' }), go('Continue', '2b', { not: 'leash_cut' })] }],
    ['ilse', '“You cut it. Clever. I had to learn to be afraid again. It’s a very peculiar feeling for someone my age.”', { id: '2a', next: '3' }],
    ['ilse', '“I’ve been with you the whole way. Every drowned wanderer. Every stag. It has been so lovely to see the world again.”', { id: '2b', next: '3' }],
    ['narrator', 'You put it to her, the only question that matters.', { id: '3', choices: [
      ch('“You’re the First Regent.”', '4'), ch('“How many have you sent to die?”', '5'), ch('“What is the throne?”', '6')] }],
    ['ilse', '“Clever child. Yes. I was the first to sit. And the first to stand.”', { id: '4', next: '7' }],
    ['ilse', '“Eleven who reached the throne. Two hundred and six who did not. I remember every one. I sent them because the alternative was worse.”', { id: '5', next: '7' }],
    ['ilse', '“A chair. An oath. A cage with a very comfortable cushion. It makes you kind. It makes you patient. And it takes the rest.”', { id: '6', next: '7' }],
    ['ilse', '“When I sat, the throne divided me. The part that could not bear another day of it went to the seat and became the King. The part that could endure walked out and became Ilse. I have been looking for someone strong enough to hold both halves. I believe it is you.”', { id: '7', eff: [flag('ilse_revealed')], choices: [
      ch('“And if I refuse?”', '8'), ch('“What about the Wardens?”', '9'), ch('“What about the Morning?”', '10')] }],
    ['ilse', '“The Meridian fails. The sky closes over Veyrgard like a lid. You will have chosen it. I will not blame you. I will be unable to watch.”', { id: '8', next: '11' }],
    ['ilse', '“Volunteers. Sentenced volunteers. They served, and they were rewarded with the only kind of death that I could afford them.”', { id: '9', next: '11' }],
    ['ilse', 'For one moment, the light in her sockets flickers, and something young looks out. “She is a child, Wayfarer. A child who has been asleep for three hundred years. I do not wish to wake her. It would hurt too much.”', { id: '10', next: '11' }],
    ['ilse', '“The fifth seal is beneath Solenne. Break it, and the way opens. The mist will part for you now.” She lifts one hand, and somewhere in the south, a golden wall shudders. “One more thing, child. Whatever you decide, I love you. I do not lie about that.”', { id: '11', eff: [unlock('solenne'), main('m21'), xpL(0.5), san(-5)] }],
  ]),

  sc('s_solenne_arrive', 'solenne', [
    ['narrator', 'The mist parts like a curtain. Beyond it a golden city sits under a high, hard noon. Bells ring in unison. Flowers are in bloom. Every citizen, in every street, is smiling exactly the same smile.'],
    ['narrator', 'No one casts a shadow. Not one. Not even three.', { eff: [main('m22'), xpL(0.3), san(-2)] }],
  ]),

  sc('s_aurelia', 'solenne', [
    ['aurelia', '“Welcome to Solenne! Do stay for tea. It’s always tea time.” Lady Aurelia Sol curtseys, and then curtseys again, identically. “I’m so pleased you could come. It’s a lovely afternoon. It’s been a lovely afternoon for a very long time.”'],
    ['aurelia', '“There is a small thing, and I do hope you won’t mind.” She smiles through it. “We can’t seem to remember the night. Nobody can. It would be so kind if you could help us find it.”', { choices: [
      ch('“How long have you been here?”', '3'), ch('“Where is the Herald?”', '4')] }],
    ['aurelia', '“Since the ninth day. Do you know, I think it may have been sixty years.” She laughs, and something behind the laughter cracks. “How odd. How odd.”', { id: '3', next: '5' }],
    ['aurelia', '“Under the city. He announces the King. He’s been announcing for a very long time. The seal’s beneath him. If you break it, the noon will end, and then we’ll all remember.” She pauses. “I’m afraid, you see.”', { id: '4', next: '5' }],
    ['aurelia', '“When you do it, would you be gentle? We will wake up, and there will be sixty years of grief in us, and some of us will not be able to bear it. Would you promise to be there when we do?”', { id: '5', choices: [
      ch('“I promise.”', '6', { eff: [flag('solenne_gentle')] }), ch('“I can’t promise that.”', '7')] }],
    ['aurelia', 'Her smile does not change. But for the first time, a single tear rolls down her cheek. “Thank you. Thank you. Oh, thank you.”', { id: '6', next: '8' }],
    ['aurelia', '“Of course,” she says, and her smile is a mask that has finally become one. “Of course you can’t.”', { id: '7', next: '8' }],
    ['aurelia', '“The Undercity is below the fountain. The Herald is at the bottom. Please hurry. It has been a very long afternoon.”', { id: '8', eff: [main('m23'), xpL(0.3), lore('A Child’s Definition of Night')] }],
  ]),

  sc('s_under_intro', 'solenne', [
    ['narrator', 'The stair is gold, and goes down for a very long time. At the bottom, a mirror-city stands in perfect silence. Everywhere you look, someone is looking back at you. All of them are wearing your face.'],
    ['narrator', 'A voice, cheerful, very tired, rings out ahead: “Behold, the Eleventh. Behold, the Twelfth. Behold, the light that is not yet.”', { eff: [san(-3)] }],
  ]),

  sc('s_herald', 'solenne', [
    ['narrator', 'The Herald falls to her knees, and the announcement, at last, stops. Her voice is hoarse. She looks about a hundred years old, and about twenty.'],
    ['herald', '“The Tenth,” she says. “I sat the throne for a season. When the Eleventh came, I stayed at his side and announced him. I could not leave. I loved him.” A cracked laugh. “I was very good at loving him. I had a great deal of practice.”'],
    ['herald', '“The city is not a prison, Wayfarer. It is a dream. His dream of a perfect noon. He gave it to them so they would not remember the nine days. He is so, so kind. It is the only thing left of him.”', { choices: [
      ch('“And the Morning?”', '3'), ch('“How do I end it?”', '4')] }],
    ['herald', '“A child. A child in a cage. She hums. He has been humming with her for sixty years, because it’s the only thing that soothes her. The throne isn’t killing him. It’s… lulling them both.”', { id: '3', next: '5', eff: [lore('The Morning’s Voice')] }],
    ['herald', '“You do not end it by sitting. You do not end it by breaking the throne. You end it by asking her what she wants, and then doing that. No Regent ever asked. It was not in the oath.”', { id: '4', next: '5' }],
    ['herald', '“The seal beneath me is the fifth. Ilse will not say it is there. Break it, and the noon will end, and Solenne will wake. Be kind to them. The Steward will need someone to hold her hand.”', { id: '5' }],
    ['narrator', 'She smiles, closes her eyes, and the whole Undercity exhales. Overhead, through a hundred feet of stone, you hear the bells of Solenne begin, at last, to ring at different times.', { eff: [flag('boss_herald'), main('m24'), xpL(0.5), lore('The Fifth Seal')] }],
  ]),

  sc('s_aurelia_gate', 'solenne', [
    ['narrator', 'Solenne wakes slowly. One by one, the citizens stop smiling. Some sit down where they stand. Some weep. A few begin, cautiously, to laugh. Somewhere a child asks, “Is it dark? Is that what dark looks like?”'],
    ['aurelia', '“It is,” Aurelia says, kneeling to meet Pip’s eye. She is holding the child’s hand. Beside them, Lucan, no longer looping, watches the horizon with a soldier’s bewildered pride.', { choices: [
      go('Continue', '2a', { flag: 'solenne_gentle' }), go('Continue', '2b', { not: 'solenne_gentle' })] }],
    ['aurelia', '“You came back,” she says. “You said you would.” She looks older, and more real. “The gate to the Meridian is open. Go on. We will remember you. All of us. Every afternoon.”', { id: '2a', next: '3' }],
    ['aurelia', '“You’re here,” she says, without warmth. But she is holding a child’s hand, and she is not letting go. “The gate is open. Go. Finish it.”', { id: '2b', next: '3' }],
    ['pip', '“Are you going to see the King?” Pip asks. “Tell him I said he can stop now. Tell him it’s okay.”', { id: '3', eff: [main('m25'), xpL(0.4), gold(300)] }],
  ]),

  sc('s_meridian_intro', 'solenne', [
    ['narrator', 'The Black Meridian is a stair down into the sky. Every step is a moment of your life, and every landing is a moment you did not live. You pass yourself coming up, and you both nod.'],
    ['narrator', 'On the last landing, an empty chair has been carved into the stone, and somebody has left a candle on the arm. It is still lit. It is still warm.', { eff: [san(-3)] }],
  ]),

  sc('s_king', 'meridian', [
    ['narrator', 'The King Behind Noon falls to his knees, and the throne behind him lights up like an eye. His face, uncovered at last, is yours. Older. Tired. Relieved.'],
    ['king', '“I have waited a long time for someone angry enough to reach me.” His voice is a whisper with your cadence in it. “Thank you. I mean it.”'],
    ['king', '“I wrote to you. In the Widow’s hand. In the Hart’s cairn. In every place you found a note in your own writing. The ink writes itself, when you have sat here long enough. I am the mercy she cut out of herself. I have been asking for help ever since.”', { choices: [
      ch('“What is the Morning?”', '3'), ch('“Do you want me to take your place?”', '4')] }],
    ['king', '“A child. A very old, very frightened child. She hums. I have listened for three hundred years. I know every note.”', { id: '3', next: '5' }],
    ['king', '“No. I want someone to decide for her, whichever way, and to stop pretending it isn’t a choice. That’s all any Regent ever wanted. Nobody asked us.”', { id: '4', next: '5' }],
    ['narrator', 'The door to the throne room opens. Ilse does not knock. She stands in the doorway with the pale light in her sockets, and she is smiling.', { id: '5' }],
    ['ilse', '“Well done. Well done, both of you.” She crosses the room, lays a hand on the King’s cheek, and for one moment, they look like the same person. “The chair is empty, child. Decide.”'],
    ['narrator', 'The throne waits. The Morning hums. Your friends’ hands and your enemies’ hands are all held out toward you. There are only five things you can do.', { id: 'choice', choices: [
      ch('Sit upon the throne, and rule as Regent.', undefined, { eff: [end('crown')] }),
      ch('Take Ilse’s hand and the King’s. Rule together.', undefined, { cond: { corruption: 4, not: 'leash_cut' }, eff: [end('pact')] }),
      ch('Shatter the eclipse.', 's_shatter'),
      ch('Ask the Morning what she wants. Free her.', 's_free', { cond: { all: ['mercy_widow', 'mercy_hart', 'mercy_grist', 'mercy_vhal'] } }),
      ch('Turn your back. Walk home.', undefined, { eff: [end('return')] })] }],
    ['ilse', '“Child. Don’t.” The light in her sockets flares white. “I will stop you. I love you. I will stop you.”', { id: 's_shatter', eff: [fight('ilse', [end('shatter')], 'boss')] }],
    ['narrator', 'You kneel, place your palms on the cold arms of the throne, and, for the first time in three hundred years, somebody asks. A very small voice, deep under everything, says: “Let me go.”', { id: 's_free', next: 's_free2' }],
    ['ilse', '“NO.” It is the only time she has raised her voice. “Not after everything! I will not lose you both!”', { id: 's_free2', eff: [fight('ilse', [end('dawn')], 'boss')] }],
  ]),

  sc('s_ilse_end', 'lantern_hall', [
    ['ilse', '“It is done, Wayfarer. Whatever you chose, it is done. Sit with me a moment. I have not spoken to anyone in a very long time who was not afraid.”'],
    ['ilse', '“I was not always what you saw. Once I was a girl who wanted very much to be kind. Somewhere in the second century, I forgot how. I hope you remember.”'],
  ]),

  sc('g_widow', 'bellhouse', [
    ['narrator', 'A cairn of drowned bell-fragments stands at the tide-line. Someone has left a candle, unlit, at its foot.', { choices: [
      ch('Place the Widow’s ring on the cairn.', '1', { cond: { item: 'tok_widow' } }), ch('Leave.', '2')] }],
    ['narrator', 'The ring sinks into the stone like a stone into water. Far off, a bell rings once, softly, and the candle lights itself. Somewhere in the water a woman laughs, and it is not sad.', { id: '1', eff: [take('tok_widow'), flag('mercy_widow'), xpL(0.4), san(6), lore('The Widow’s Vow')], next: '3' }],
    ['narrator', 'You have nothing to offer. The candle stays dark.', { id: '2', next: '3' }],
    ['narrator', 'The tide comes in, and goes out.', { id: '3' }],
  ]),
  sc('g_hart', 'ashwood', [
    ['narrator', 'A cairn of antlers, and a dead tree, and an ash-grey stone. Someone has been here recently. Someone with a horn.', { choices: [
      ch('Place Hartwyn’s locket on the cairn.', '1', { cond: { item: 'tok_hart' } }), ch('Leave.', '2')] }],
    ['narrator', 'The locket clicks open. Inside, a curl of hair the colour of firelight. A horn sounds, close, and this time it finishes the call. Then it is quiet. A stag’s track leads away through the ash, and then the track is a man’s.', { id: '1', eff: [take('tok_hart'), flag('mercy_hart'), xpL(0.4), san(6)], next: '3' }],
    ['narrator', 'You have nothing to offer. The ash stirs and settles.', { id: '2', next: '3' }],
    ['narrator', 'The forest is silent.', { id: '3' }],
  ]),
  sc('g_grist', 'quarry', [
    ['narrator', 'Every stone of the cairn is scratched with a name. The chalk stub lies on top.', { choices: [
      ch('Set the Lamp of Names on the cairn.', '1', { cond: { item: 'tok_grist' } }), ch('Leave.', '2')] }],
    ['narrator', 'The lamp flares, and every name inside the glass rises like a moth toward the light, and out. Far off, in every wall of Gravemarrow, the chanting stops. In its place there is a long, warm silence.', { id: '1', eff: [take('tok_grist'), flag('mercy_grist'), xpL(0.4), san(6)], next: '3' }],
    ['narrator', 'You have nothing to offer. The wind stirs the chalk-dust, and the names blur.', { id: '2', next: '3' }],
    ['narrator', 'The quarry hums, softly, unresolved.', { id: '3' }],
  ]),
  sc('g_vhal', 'pass', [
    ['narrator', 'A frozen cairn, facing south. Somebody has scratched an arrow into the top, pointing the other way.', { choices: [
      ch('Plant Vhal’s banner, facing north.', '1', { cond: { item: 'tok_vhal' } }), ch('Leave.', '2')] }],
    ['narrator', 'The banner unfurls in a wind that was not there a moment ago. It snaps, once, north. Across the Pass, twelve thousand seated soldiers rise, salute the direction they were never allowed to face, and are, at last, snow.', { id: '1', eff: [take('tok_vhal'), flag('mercy_vhal'), xpL(0.4), san(6)], next: '3' }],
    ['narrator', 'You have nothing to offer. The snow settles, indifferent.', { id: '2', next: '3' }],
    ['narrator', 'The wind returns to its old direction.', { id: '3' }],
  ]),
];

export const SCENE_MAP = new Map(SCENES.map(s => [s.id, s]));
