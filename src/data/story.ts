import { PACKS } from './regions';
import type { ActDef, MainStep, Speaker } from '../types';

export const ACTS: ActDef[] = [
  { id: 0, title: 'Prologue · The Final City', blurb: 'A key, a captain, and a road south.', part: 1 },
  { id: 1, title: 'Act I · The Drowned Bell', blurb: 'Saltmere tolls for those who never came back.', part: 1 },
  { id: 2, title: 'Act II · A Forest That Remembers', blurb: 'Ashwood burns, and the fire has a leash.', part: 1 },
  { id: 3, title: 'Act III · Marrow and Stone', blurb: 'Beneath the quarry, a Titan’s bones and a Titan’s light.', part: 1 },
  { id: 4, title: 'Act IV · The Southward Army', blurb: 'Sixty years in the snow, waiting for a command.', part: 1 },
  { id: 5, title: 'Act V · The Blind Seer', blurb: 'Veyrgard falls dark. Ilse shows her face.', part: 1 },
  { id: 6, title: 'Part II · The Six Crowns', blurb: 'Six Regents ruled and failed. Each left a crown in the ruin of their realm.', part: 2 },
  { id: 7, title: 'Act VII · The City That Never Set', blurb: 'Solenne is dreaming. The dream must end.', part: 3 },
  { id: 8, title: 'Act VIII · Behind Noon', blurb: 'The throne is waiting. It has your face.', part: 3 },
];

const m = (id: string, act: number, title: string, obj: string, text: string, at?: string): MainStep => ({ id, act, title, obj, text, at });
const clearStep = (id: string, act: number, title: string, obj: string, text: string, dungeon: string, label: string, done?: string): MainStep => ({ id, act, title, obj, text, at: dungeon, goal: { type: 'clear', count: 1, label, target: dungeon }, done });
export const MAIN: MainStep[] = [
  m('m00', 0, 'The Seal-Key', 'Speak with Seer Ilse in the Lantern Hall, Veyrgard.', 'The sun turned black nine days ago. Only Veyrgard holds. Seer Ilse, the Blind Seer, has summoned you.', 'veyrgard'),
  m('m01', 0, 'The Captain’s Warning', 'Speak with Captain Roe of the Watch.', 'Ilse gave you a brass key that feels warm, and an errand to break four seals. The Watch will know the road.', 'veyrgard'),
  clearStep('p01', 0, 'Sharpen the Blade', 'Clear the Rookery of the Rook-King’s gang.', 'Captain Roe will not send a Wayfarer south with a bare blade. The Rook-King’s crew has been fencing Watch stores. Get your edge on them.', 'rookery', 'Defeat the Rook-King'),
  m('m02', 0, 'The Road to Saltmere', 'Travel south-west to the harbour city of Saltmere.', 'The first seal is a bell beneath the harbour. Follow the road south-west.', 'saltmere'),
  m('m03', 1, 'Salt and Silence', 'Speak with Osk Tallow, the bell-keeper of Saltmere. (Corvin Vale, the smuggler, may also know things.)', 'Saltmere is closed and drowned men wash ashore carrying keys like yours. Someone here knows why.', 'saltmere'),
  clearStep('p02', 1, 'The Widow’s Cave', 'Enter the Wickhaven Sea Caves and silence Saltbeard.', 'Osk Tallow says the bell’s notes begin in the sea caves, where a ghost-captain still rings a cracked bell. Learn what you can before you go under the harbour.', 'seacaves', 'Defeat Saltbeard'),
  m('m04', 1, 'Descend', 'Enter the Drowned Catacombs and silence the Bell-Widow.', 'The bell tolls beneath the harbour bellhouse. The Widow keeps the first seal.', 'catacombs'),
  m('m05', 1, 'The Widow’s Last Words', 'Return to Harbormistress Ysolde Marrek in Saltmere.', 'The Widow spoke as she died. Ysolde will want to hear it — and you will want to hear hers.', 'saltmere'),
  m('m06', 2, 'East of Everything', 'Travel east to the timber city of Emberhollow.', 'The second seal burns in Ashwood. The Ash Compact, keepers of the fire, may know what the key really is.', 'emberhollow'),
  clearStep('p03', 2, 'The Hearth Crypt', 'Enter the Hearth Crypt beneath Emberhollow and douse the Huntsman.', 'Before the Compact will speak, the Compact’s own dead must be put to rest. Their crypt burns where it should not.', 'hearthcrypt', 'Defeat the Huntsman'),
  m('m07', 2, 'The Ash Compact', 'Speak with Tamsin Aldwyn, Warden of the Compact.', 'Emberhollow refuses to burn. Its lamp-keeper is very kind. Its warden is very suspicious.', 'emberhollow'),
  m('m08', 2, 'A Leash of Light', 'Enter Ashwood Expanse and face the Cinder Hart.', 'The hearth-fire has shown you what the key really is. Now decide what to do about it, and go east.', 'ashwood'),
  m('m09', 2, 'Ashes to Report', 'Return to Emberhollow and speak with Lamp-Keeper Maren.', 'The Hart has fallen. Someone in Emberhollow has been watching you all along.', 'emberhollow'),
  clearStep('p04', 2, 'The Hum Under the Hill', 'Enter Witch’s Hollow Hill and end the Crone’s lullaby.', 'Maren’s eyes were grey and kind. Her hill is neither. Something under it hums a lullaby, and it has begun to hum your name.', 'hollowhill', 'Defeat the Crone'),
  m('m10', 3, 'West of the Wall', 'Travel west to Gravemarrow, the city in the ribs.', 'The third seal is beneath the Ossuary Quarry. Gravemarrow’s Forge-Mother has sent a plea.', 'gravemarrow'),
  m('m11', 3, 'The Forge-Mother', 'Speak with Dagna Stonevein, Forge-Mother of Gravemarrow.', 'The mines have collapsed and the miners chant names. Dagna knows what lies beneath.', 'gravemarrow'),
  clearStep('p05', 3, 'Inside the Titan', 'Enter the Titan’s Ribcage and put down the Hollow Titan.', 'Dagna wants the ribcage cleared before the miners go anywhere near the quarry. It is warm inside. Something in there is still breathing.', 'ribcage', 'Defeat the Hollow Titan'),
  m('m12', 3, 'Into the Quarry', 'Enter the Ossuary Quarry and confront Foreman Grist.', 'Beneath the bones of a dead sun, a foreman keeps a promise he could not keep.', 'quarry'),
  m('m13', 3, 'Names in the Walls', 'Return to Dagna Stonevein in Gravemarrow.', 'The Foreman is silent. What he told you changes everything about the lanterns of Veyrgard.', 'gravemarrow'),
  clearStep('p06', 3, 'The Sunken Foundry', 'Enter the Sunken Foundry and cool its Molten Regent.', 'The first lantern was cast in the Foundry. Dagna’s forges burn on its coals. To go north, you need to know what the north is afraid of; the Foundry keeps the old maps.', 'foundry', 'Defeat the Molten Regent'),
  m('m14', 4, 'North of the World', 'Travel north to the fortress of Hollowreach.', 'Archivist Pell writes: the frozen army knows how the Regency ends. Go north, quickly.', 'hollowreach'),
  m('m15', 4, 'The Marshal’s Daughter', 'Speak with Marshal Sigrun Vhal.', 'Hollowreach watches an army that has not moved in sixty years. Its commander’s daughter holds the fortress.', 'hollowreach'),
  clearStep('p07', 4, 'The Frozen Barrows', 'Enter the Frozen Barrows and break the Barrow-King’s household.', 'Sigrun cannot spare the garrison. The Barrow-King’s household has been marching at night. Break it before you face his general.', 'barrows', 'Defeat the Barrow-King'),
  m('m16', 4, 'The Weeping Pass', 'Enter the Weeping Pass and face General Vhal.', 'Every frozen corpse faces south. Someone gave them that order, and someone else made them keep it.', 'pass'),
  m('m17', 4, 'What Vhal Knew', 'Return to Marshal Sigrun in Hollowreach.', 'The General has spoken. It will be hard to say it to his daughter.', 'hollowreach'),
  m('m18', 5, 'The Lanterns Fail', 'Return to Veyrgard. The city is under siege.', 'With four Wardens gone, the lanterns of Veyrgard gutter. The Dreadmarch is at the gates.', 'veyrgard'),
  m('m19', 5, 'What the Archivist Found', 'Speak with Archivist Pell at the Collegium.', 'The siege is broken, for now. Pell has been waiting for you with a map he is afraid to show.', 'veyrgard'),
  m('m20', 5, 'The Blind Seer’s Face', 'Confront Seer Ilse in the Lantern Hall.', 'You know enough now. It is time to ask her the only question that matters.', 'veyrgard'),
  { id: 'r00', act: 6, title: 'The Six Regalia', obj: 'Recover the Regalia of the six fallen Regents.', text: 'Ilse has named six realms where a Regent ruled, and failed, and left a crown behind. Brasshaven, Mirewick, Tidewatch, Cogspire, Skerrig and Lumen Hollow each hold a thread of the story.', goal: { type: 'regalia', count: 6, label: 'Recover the six Regalia' }, done: 's_regalia_all' },
  m('r01', 6, 'The Crowns Return', 'Return to Seer Ilse in Veyrgard.', 'You carry the six Regalia. Ilse will want to see them, and you will want to see her face when she does.', 'veyrgard'),
  m('m21', 7, 'South of Noon', 'Travel to Solenne, the city that never set.', 'The mist south of Veyrgard has parted. Solenne is waiting, and it has been waiting for a very long time.', 'solenne'),
  m('m22', 7, 'The Looping City', 'Speak with Lady Aurelia Sol, Steward of the Noon Court.', 'The people of Solenne are frozen in the ninth day of noon. Their Steward will explain, politely, for the ninth-thousandth time.', 'solenne'),
  clearStep('p08', 7, 'The Mirror Court', 'Enter the Mirror Court and silence the Chamberlain.', 'Aurelia’s court does not stop bowing. Its Chamberlain announces every visitor in advance, and he has been practising yours. Break the routine at its source.', 'mirrorcourt', 'Defeat the Court Chamberlain'),
  clearStep('p09', 7, 'The Gilded Gardens', 'Enter the Gilded Gardens and stop the Bright Steward.', 'Solenne’s gardens have not grown in sixty years. The Steward that tends them cannot stop clipping. Cut the shears.', 'gildedgardens', 'Defeat the Bright Steward'),
  m('m23', 7, 'The Fifth Seal', 'Enter the Undercity of Noon and face the Herald.', 'Beneath Solenne waits the fifth seal, and the one who has announced the King for sixty years.', 'undercity'),
  m('m24', 7, 'The Open Gate', 'Return to Lady Aurelia in Solenne.', 'The Herald has fallen. Time in Solenne is beginning to move.', 'solenne'),
  m('m25', 8, 'The Black Meridian', 'Enter the Black Meridian and face the King Behind Noon.', 'The road to the wound is open. Everything you have learned will be tested by the throne.', 'meridian'),
  m('m26', 8, 'What Morning Means', 'Decide what morning means.', 'The King is on his knees. The throne is empty. Someone must decide.', 'meridian'),
  m('m27', 8, 'Epilogue', 'The chronicle is complete. Roam freely, finish your contracts, or begin another chronicle.', 'The story is told. The world goes on.', 'veyrgard'),
];
export const MAIN_INDEX = new Map(MAIN.map((x, i) => [x.id, i]));

export const SPEAKERS: Record<string, Speaker> = {
  ...Object.assign({}, ...PACKS.map(p => p.speakers)),
  narrator: { name: '', icon: 'eclipse' },
  you: { name: '{name}', icon: 'hero', color: '#e7c98f' },
  ilse: { name: 'Seer Ilse', title: 'The Blind Seer', icon: 'e_seer', color: '#f0d8a8' },
  roe: { name: 'Captain Roe', title: 'Captain of the Watch', icon: 'e_soldier', color: '#b8c8d8' },
  pell: { name: 'Archivist Pell', title: 'Astronomer', icon: 'e_wizard', color: '#c8b8e8' },
  ysolde: { name: 'Ysolde Marrek', title: 'Harbormistress', icon: 'e_pirate', color: '#8fd8c8' },
  corvin: { name: 'Corvin Vale', title: 'Smuggler', icon: 'e_assassin', color: '#d8a878' },
  osk: { name: 'Osk Tallow', title: 'Bell-Keeper', icon: 'e_bellkeeper', color: '#c8c0a8' },
  nettle: { name: 'Nettle', title: 'Dock Urchin', icon: 'e_fox', color: '#e8b088' },
  tamsin: { name: 'Tamsin Aldwyn', title: 'Warden of the Compact', icon: 'e_barbarian', color: '#ffb070' },
  maren: { name: 'Lamp-Keeper Maren', title: 'Lamp-Keeper', icon: 'e_veiled', color: '#e8e0d0' },
  dagna: { name: 'Dagna Stonevein', title: 'Forge-Mother', icon: 'e_dwarf', color: '#d8c090' },
  tobbin: { name: 'Old Tobbin', title: 'Miner', icon: 'e_miner', color: '#c8b8a0' },
  sigrun: { name: 'Sigrun Vhal', title: 'Marshal of Hollowreach', icon: 'e_barbarian', color: '#a8c8f0' },
  aurelia: { name: 'Lady Aurelia Sol', title: 'Steward of Noon', icon: 'e_seer', color: '#ffe090' },
  pip: { name: 'Pip', title: 'A Child Who Remembers Night', icon: 'e_sunhood', color: '#ffe8b0' },
  widow: { name: 'The Bell-Widow', title: 'Warden of the First Seal', icon: 'e_veiled', color: '#a0d0d0' },
  hart: { name: 'Hartwyn', title: 'Warden of the Second Seal', icon: 'e_stag', color: '#ff9a50' },
  grist: { name: 'Foreman Grist', title: 'Warden of the Third Seal', icon: 'e_skeleton', color: '#d8c8a0' },
  vhal: { name: 'General Vhal', title: 'Warden of the Fourth Seal', icon: 'e_oldking', color: '#a0c0e8' },
  herald: { name: 'The Herald', title: 'Warden of the Fifth Seal', icon: 'e_sunhood', color: '#ffd870' },
  king: { name: 'The King Behind Noon', title: 'The Eleventh Regent', icon: 'e_crowned', color: '#f0e0b0' },
  companion: { name: '{companion}', title: 'Companion', icon: 'e_hound', color: '#c8d0c0' },
  letter: { name: 'The Letter', title: 'In your own hand', icon: 'c_letter', color: '#d8d0b8' },
  voice: { name: 'A Voice', title: '', icon: 'e_dread', color: '#c8a0e0' },
};

export const ENDINGS: Record<string, { title: string; icon: string; text: string; epilogue: string }> = {
  common: {
    title: 'THE COMMON DAWN', icon: 'sun',
    text: 'You wear all six crowns at once. They do not weigh. They listen. You hold Ilse’s hand and the King’s, and you ask the Morning her question first. She answers. It is not a word. It is a color nobody has seen, and then everyone has.',
    epilogue: 'Dawn comes slowly, and it comes for everyone: the glass of the Wastes goes clear, the thorns of Mirewick bloom, the tides turn, the clocks of Cogspire stop to listen, the aurora folds into a plain pale sky, and the Underdeep learns the word for light. Veyrgard’s lanterns are carried out into the street and left burning in daylight, because nobody wants to be the one to put them out. Somewhere, a child asks what to do now. Nobody has an order for her. It turns out that is the whole point.',
  },
  crown: {
    title: 'THE NEW NOON', icon: 'crown',
    text: 'You sit. The throne is warm, and the Morning stirs beneath you like a great animal deciding whether to trust your hand. You murmur the first word that comes to you: morning. And morning obeys.',
    epilogue: 'Veyrgard wakes to a pale, obedient sunrise. The lanterns are lit for the last time, then extinguished forever, because they are no longer needed. The Dreadmarch withdraws to the edge of the map and lies down. It is a good morning. It is a very good morning. Somewhere behind it, the Morning weeps, and you, who decided what it means, do not let anyone hear.',
  },
  shatter: {
    title: 'THE LONG NIGHT', icon: 'moon',
    text: 'You break the throne. The Morning screams once, for three hundred years of pain, then falls silent. The black sun cracks like an egg, and the dark that pours out is not cruel. It is only dark.',
    epilogue: 'There is no sun after that. The dead lie down, finally, and the seals do not need keeping. Veyrgard lights its lanterns, real lanterns, with real oil, and learns to live by them. Children are born who have never seen a sunrise and do not miss it. The old ones miss it enough for all of them, and tell stories about it, which turns out to be enough.',
  },
  return: {
    title: 'THE WAYFARER RETURNS', icon: 'back',
    text: 'You turn your back on the throne. The King Behind Noon, wearing your face, watches you go. “Thank you,” he says, and means it, and does not ask you to stay.',
    epilogue: 'In Veyrgard, the gates open for you. Seer Ilse sends for another Wayfarer within the year. The lanterns stay lit, the wardens stay bound, and the sun stays black. The throne waits patiently. It is very good at waiting. Some nights, you dream of a version of yourself who sat down, and wonder whether she is kinder.',
  },
  dawn: {
    title: 'THE FIRST DAWN', icon: 'sun',
    text: 'You kneel, put both hands on the cold throne, and give the Morning what no Regent ever gave it: consent to leave. Four keepsakes glow in your pack. Four Wardens, freed, walk out of the light and stand around you. The cage opens like a hand.',
    epilogue: 'Dawn comes over Veyrgard at the wrong hour, from the wrong direction, in the wrong colour, and everyone who sees it weeps. The Morning does not rule. It does not sit on any throne. It simply rises, as it used to, and goes on rising. The Wardens are buried under an open sky. Ilse dies in the light she blinded herself against, and she is smiling. It is the first sunrise in three hundred years, and it belongs to everyone.',
  },
  pact: {
    title: 'THE SECOND THRONE', icon: 'throne',
    text: 'You take Ilse’s hand, and the King’s, and sit. There is room on the throne for two. There was always room for two. The Morning does not scream now. It is quiet, and quiet, and quiet.',
    epilogue: 'Veyrgard is safe, and it has never been so obedient. The lanterns burn brighter than they ever did. The Lantern Court spreads across the continent, gentle and unanswerable. You and Ilse rule the day and the night alike, and no one remembers what a choice looked like. Every morning you decide what it means. Every morning it means what you say.',
  },
};

/** Six stills, shared. The words change with the ending. No voice. */
export const ENDING_FRAMES = ['end-1', 'end-2', 'end-3', 'end-4', 'end-5', 'end-6'];

export const ENDING_LINES: Record<string, string[]> = {
  common: [
    'You wear all six crowns at once. They do not weigh. They listen.',
    'You hold Ilse’s hand and the King’s, and you ask the Morning her question first.',
    'She answers. It is not a word. It is a color nobody has seen, and then everyone has.',
    'Dawn comes slowly, and it comes for everyone: the glass goes clear, the thorns bloom, the tides turn, the clocks stop to listen.',
    'Veyrgard’s lanterns are carried into the street and left burning in daylight, because nobody wants to be the one to put them out.',
    'Somewhere, a child asks what to do now. Nobody has an order for her. It turns out that is the whole point.',
  ],
  crown: [
    'You sit. The throne is warm.',
    'The Morning stirs beneath you like a great animal deciding whether to trust your hand.',
    'You murmur the first word that comes to you: morning. And morning obeys.',
    'The Dreadmarch withdraws to the edge of the map and lies down.',
    'Veyrgard wakes to a pale, obedient sunrise. The lanterns are lit for the last time, then extinguished forever.',
    'It is a very good morning. Somewhere behind it, the Morning weeps, and you do not let anyone hear.',
  ],
  shatter: [
    'You break the throne.',
    'The Morning screams once, for three hundred years of pain, then falls silent.',
    'The black sun cracks like an egg, and the dark that pours out is not cruel. It is only dark.',
    'There is no sun after that. The dead lie down, finally, and the seals do not need keeping.',
    'Veyrgard lights its lanterns, real lanterns, with real oil, and learns to live by them.',
    'Children are born who have never seen a sunrise and do not miss it. The old ones tell stories about it, which turns out to be enough.',
  ],
  return: [
    'You turn your back on the throne.',
    'The King Behind Noon watches you go. “Thank you,” he says, and means it, and does not ask you to stay.',
    'The sun stays black. The throne waits patiently. It is very good at waiting.',
    'In Veyrgard, the gates open for you. Seer Ilse sends for another Wayfarer within the year.',
    'The lanterns stay lit, the wardens stay bound.',
    'Some nights, you dream of a version of yourself who sat down, and wonder whether she is kinder.',
  ],
  dawn: [
    'You kneel, put both hands on the cold throne, and give the Morning consent to leave.',
    'Four keepsakes glow in your pack. Four Wardens, freed, walk out of the light and stand around you.',
    'The cage opens like a hand.',
    'Dawn comes over Veyrgard at the wrong hour, from the wrong direction, in the wrong colour, and everyone who sees it weeps.',
    'The Morning does not rule. It simply rises, as it used to, and goes on rising.',
    'It is the first sunrise in three hundred years, and it belongs to everyone.',
  ],
  pact: [
    'You take Ilse’s hand, and the King’s, and sit. There is room on the throne for two.',
    'There was always room for two. The Morning does not scream now.',
    'It is quiet, and quiet, and quiet.',
    'The lanterns burn brighter than they ever did. The Lantern Court spreads, gentle and unanswerable.',
    'You and Ilse rule the day and the night alike, and no one remembers what a choice looked like.',
    'Every morning you decide what it means. Every morning it means what you say.',
  ],
};

export const LORE: [string, string][] = [
  ['The First Noon', 'Before the Meridian, noon lasted nine days. Crops turned white and men cast three shadows. The Court called it a marvel until the shadows began speaking.'],
  ['The Bell Beneath', 'Saltmere’s oldest bell was cast before the city. It rings only under water, tolling once for each Wayfarer who drowns trying to reach the Widow.'],
  ['Orra’s Proof', 'Orra proved the Titans could feel pain. The Court proved that engineers could be erased. Both demonstrations were thorough.'],
  ['The Bone Titans', 'The continent rests upon creatures too large to have lived. Scholars disagree whether they are fossils or architecture. The miners say they are suns.'],
  ['Letters from the Pass', 'General Vhal ordered his army to face south. “Whatever we are marching against must see we are not afraid of it.” They froze in formation.'],
  ['A Map of Other Veyrs', 'The astronomer Pell found twelve versions of the city in the night sky. In eleven, the walls had already fallen. The twelfth was drawn in pencil.'],
  ['The Ash Compact', 'The foresters of Ashwood swore to keep the fire alive after the sun died. They kept their oath. The forest did not consent.'],
  ['On Wardens', 'Each seal needed a keeper willing never to die. The Court found four volunteers. It never asked what they would become. The volunteers were never asked either.'],
  ['The Blind Seer', 'Seer Ilse tore out her eyes the day the sun went black, so she would never have to watch it again. She sees the seals instead. Some say she sees through other eyes.'],
  ['The Crown Behind Noon', 'There is a throne behind the eclipse. Whoever sits in it decides what morning means. It has been occupied for a very long time.'],
  ['The Lantern Oil', 'Veyrgard’s lanterns burn without oil. Children are taught not to ask. The Collegium’s records on the subject have all been scorched, neatly, at the margins.'],
  ['Morning-Glass', 'A crystal that forms deep beneath the Quarry. It is warm. It flinches when touched, like the skin of something alive.'],
  ['The Twelfth Hour', 'The Collegium’s clocks have twelve hours on the face. The twelfth has never once been seen to strike. It is polished daily anyway.'],
  ['Regent’s Rule', 'A Regent must not leave the throne, nor speak a true name, nor be loved. A Regent must not be remembered. The rules were written by the first, who broke all of them.'],
  ['The Widow’s Vow', 'Aveline Marrek, Harbormistress, married the bell to stop the great flood. The bell accepted. The flood did not entirely leave.'],
  ['The Huntsman’s Horn', 'Osric Aldwyn has sounded his horn every dusk for thirty years. Some say it is to draw the Hart in. Others say it is to warn it.'],
  ['Names in the Walls', 'Foreman Grist walled the drowned miners into the quarry so they would be remembered. The walls remember. The miners do too, and it is not pleasant.'],
  ['The Southward Army', 'Twelve thousand men, frozen mid-step. Their boots point south, at Veyrgard. Their eyes, where they still have eyes, point at the sky.'],
  ['A Child’s Definition of Night', '“It’s when the big light goes out and the little lights come on and everyone is very quiet.” — a student in Solenne, aged seven, sixty years ago.'],
  ['Three Shadows', 'During the First Noon, every living thing cast three shadows. The first was your own. The second belonged to who you might have been. The third was cast by something else, entirely.'],
  ['The Herald’s Announcement', '“Behold, the Eleventh. Behold, the Twelfth. Behold, the light that is not yet.” The Herald has said this at noon for sixty years. It has been changing, slowly, by one word.'],
  ['The Seal-Key', 'Made of brass and something else. It is warm. It tightens when you lie. It is not, as the Court says, a key. It is a leash with a very long reach.'],
  ['The Regents’ Ledger', 'Eleven names are written in the Collegium’s vaults, each crossed out and each rewritten in the same hand. The twelfth line is blank and has been re-inked, faintly, each year.'],
  ['Saltmere’s Drawer', 'The Harbormistress keeps a drawer of keys. Each key belonged to a Wayfarer who drowned. She polishes them on the anniversary. She has run out of room.'],
  ['The Rookery Hoard', 'The Rook-King collects portraits of people who look worried. He is not sure what he is looking for. He is fairly sure it is not gold.'],
  ['The Cinder Hart', 'Hartwyn was a man. Then a Warden. Then an antlered fire in the forest, wearing the shape of what he loved best. The forest loved him too, which is why it burns.'],
  ['The Marrow Scrolls', 'In the deep mines, a scroll of tallow-paper lists every name of every miner and every horror. The two lists are the same length.'],
  ['The Frozen Ledger', 'Every soldier in the Southward Army wrote a letter home the night before Ilse froze them. The letters were never sent. Every one says: “Do not let them sit.”'],
  ['The Morning’s Voice', 'In the deepest dreams of the caged Morning, there is one sound: a child humming a tune with no end. The Regents all claim to have heard it. None will hum it back.'],
  ['Dawn, As It Was', 'There was a sun that did not need permission. It rose because rising was what it did. The Court has a word for this. The word is “defect.”'],
  ['The Fifth Seal', 'The Herald keeps a fifth seal in Solenne. It is not on any map. Ilse pretends it does not exist. Pell calculated its position from a single misprinted star.'],
  ['The Unsent Letter', 'Found in the Charred Archive: “Please let someone else be the one to end it. Please. I know I asked for this. Please.” It is unsigned. It is in your handwriting.'],
];

export const ORIGINS: [string, string, string][] = [
  ['Exiled Chirurgeon', 'Once a battlefield surgeon, now hunted for what you learned inside the dead.', '+3 Will · Blood Mend · 2 Red Tonics'],
  ['Grave Warden', 'You guarded the city’s dead until they began guarding you.', '+3 Vigor · Dented Buckler'],
  ['Debt-Bound Scholar', 'The Collegium owns your name. The things in your books own the rest.', '+3 Cunning · Lore fragment · +40 gold'],
];
export const PATHS: [string, string, string][] = [
  ['Vanguard', 'Meet horror edge-first.', 'Sever · +1 talent point · +2 Vigor'],
  ['Hexer', 'Name the darkness and make it kneel.', 'Cinder Hex · +3 Will'],
  ['Vagrant', 'Survive through guile and quick hands.', 'Riposte · +3 supplies · +2 Cunning'],
];
export const COMPANIONS: [string, string, string][] = [
  ['Moth', 'A pale hound that growls at empty corners.', 'Bites every 3 turns · finds supplies'],
  ['Marshal Cask', 'A disgraced Lamp-Marshal with a loaded arquebus.', 'Fires a heavy shot every 3 turns'],
  ['Nix', 'A gutter raven that steals only important things.', 'Steals gold · better loot'],
];

export const TIPS: [string, string, string][] = [
  ['compass', 'Walk the Grid', 'Swipe, tap the arrows, or use WASD to move one tile at a time. Bump into enemies, chests and strangers to interact.'],
  ['i_attack', 'Read the Enemy', 'Enemies telegraph their next move above their health bar. Defend against Heavy blows and Dread.'],
  ['sanity', 'Guard Your Mind', 'Sanity is a second health bar. At zero you become Unraveled. Low sanity blurs the world and invites whispers.'],
  ['m_town', 'Towns and Roads', 'Cities offer inns, markets, smiths, temples, trainers and contracts. Roads are safe; the wilds are not.'],
  ['quest', 'Story and Contracts', 'The main quest is marked by a compass on the map. Side contracts are posted on every notice board.'],
];

export const INTRO = [
  { art: 'intro_sun', lines: ['On the ninth day of the endless noon, the sun turned black.', 'Every citizen of Veyr cast three shadows. By nightfall, the shadows had begun to speak.'] },
  { art: 'solenne', lines: ['From the wound in the sky poured the Dreadmarch — the dead, the changed, the hungry.', 'Kingdom after kingdom fell silent. Only Veyrgard, the Final City, still bars its gates.'] },
  { art: 'lantern_hall', lines: ['Four Wardens once held the wound shut. Now they serve it.', '“Break the seals,” whispers the Blind Seer. “Then walk into the Meridian, and bring back the morning.”'] },
];
