import type { EnemyDef, IntentKind as K, Role, Status } from '../types';

const e = (id: string, name: string, icon: string, role: Role, tags: string, moves: K[], lore: string, o: Partial<EnemyDef> = {}): EnemyDef =>
  ({ id, name, icon, role, tags: tags.split(' ').filter(Boolean), moves, lore, ...o });
const aff = (s: Status) => ({ afflict: s });

export const ENEMIES: EnemyDef[] = [
  e('ratswarm', 'Cellar Rat Swarm', 'e_rat', 'swarm', 'beast', ['attack', 'attack', 'afflict'], 'A single, furious animal that happens to have four hundred mouths.', aff('poison')),
  e('bandit', 'Roadside Cutthroat', 'e_bandit', 'skirmisher', 'human', ['attack', 'attack', 'heavy'], 'Robs the dead first. It saves time.'),
  e('wolf', 'Starved Wolf', 'e_wolf', 'skirmisher', 'beast', ['attack', 'afflict', 'attack'], 'Grey ribs, gold eyes. It has learned that people are easier than deer.', aff('bleed')),
  e('scarecrow', 'Hollow Scarecrow', 'e_scarecrow', 'caster', 'undead', ['dread', 'attack', 'dread'], 'Stuffed with letters that were never delivered.', { dread: 2 }),
  e('crow', 'Carrion Crow', 'e_raven', 'skirmisher', 'beast', ['attack', 'attack', 'afflict'], 'Has eaten something that spoke.', aff('bleed')),

  e('skeleton', 'Watchtower Skeleton', 'e_skeleton', 'brute', 'undead', ['attack', 'heavy', 'attack'], 'Still on duty. Nobody told him about the relief.'),
  e('ghoul', 'Grave Ghoul', 'e_zombie', 'brute', 'undead', ['attack', 'afflict', 'heavy'], 'Hungry in a way that has nothing to do with the stomach.', aff('weak')),
  e('lanternwraith', 'Lantern Wraith', 'e_spectre', 'caster', 'undead spirit', ['dread', 'attack', 'dread'], 'It carries a light that does not belong to it.', { dread: 3 }),
  e('deadsergeant', 'Dead Sergeant', 'e_blackknight', 'tank', 'undead', ['guard', 'heavy', 'attack'], 'Barks orders at the corridor. The corridor obeys.'),
  e('oldsentinel', 'The Last Sentinel', 'e_knight', 'tank', 'undead boss', ['guard', 'heavy', 'attack', 'dread'], 'The Watch’s first captain. Has not been relieved of duty.', { hpMul: 3.4 }),

  e('rookarcher', 'Rook Archer', 'e_archer', 'skirmisher', 'human', ['attack', 'heavy', 'attack'], 'Never misses twice. Never misses the first time, either.'),
  e('hedgewitch', 'Hedge-Witch', 'e_witch', 'caster', 'human hex', ['afflict', 'dread', 'attack'], 'Curses cheap, cures expensive.', { ...aff('weak'), dread: 2 }),
  e('rookhound', 'Rook Hound', 'e_hound', 'skirmisher', 'beast', ['attack', 'attack', 'afflict'], 'Trained to bring things back. Usually in pieces.', aff('bleed')),
  e('magpie', 'Lady Magpie', 'e_assassin', 'skirmisher', 'human elite', ['afflict', 'attack', 'heavy', 'attack'], 'Steals one shiny thing from every victim. You are the shiny thing.', aff('poison')),
  e('rookking', 'The Rook-King', 'e_king', 'brute', 'human boss', ['heavy', 'attack', 'afflict', 'guard'], 'Ruler of a ruined tower and the eleven idiots who believe in him.', { hpMul: 3.4, ...aff('bleed') }),

  e('crab', 'Cave Crab', 'e_crab', 'tank', 'beast sea', ['guard', 'attack', 'heavy'], 'Carries a helmet of somebody’s ribs.'),
  e('eel', 'Crypt Eel', 'e_eel', 'skirmisher', 'beast sea', ['attack', 'afflict', 'attack'], 'Fat on grave-water. Its bite does not close.', aff('bleed')),
  e('drownedsailor', 'Drowned Sailor', 'e_drowned', 'brute', 'undead sea', ['attack', 'dread', 'heavy'], 'Still hauling a net full of hands.', { dread: 2 }),
  e('brinehag', 'Brine Hag', 'e_witch', 'caster', 'hex sea', ['afflict', 'dread', 'attack'], 'Trades in drowned names.', { ...aff('poison'), dread: 3 }),
  e('tidegrasp', 'Tidegrasp', 'e_kraken', 'brute', 'beast sea elite', ['heavy', 'afflict', 'attack'], 'A single arm of something the harbour has been feeding for years.', aff('weak')),
  e('saltbeard', 'Captain Saltbeard’s Ghost', 'e_pirate', 'brute', 'undead sea boss', ['heavy', 'attack', 'dread', 'afflict'], 'Went down with his ship, then came back for the cargo.', { hpMul: 3.5, ...aff('bleed') }),

  e('drownedwanderer', 'Drowned Wanderer', 'e_hooded', 'brute', 'undead sea', ['attack', 'attack', 'dread'], 'They walked into the flood to be closer to the bell. Some of them carried a seal-key.', { dread: 2 }),
  e('tidesinger', 'Tide-Singer', 'e_cultist', 'caster', 'human hex', ['dread', 'attack', 'guard'], 'Sings backwards to wake what sleeps below.', { dread: 3 }),
  e('bellthrall', 'Bell-Thrall', 'e_bellkeeper', 'tank', 'undead', ['guard', 'attack', 'heavy'], 'Rings when struck. Angrier every time.'),
  e('ringer', 'The Bell-Ringer', 'e_bear', 'brute', 'undead elite', ['attack', 'dread', 'heavy'], 'Deaf for three centuries. Still rings on time.', { dread: 4 }),
  e('widow', 'The Bell-Widow', 'e_veiled', 'caster', 'undead boss', ['attack', 'dread', 'heavy', 'afflict'], 'She married the bell to save the city. It kept her.', { hpMul: 4.2, dread: 4, ...aff('weak') }),

  e('ashhound', 'Ash Hound', 'e_hound', 'skirmisher', 'beast fire', ['attack', 'attack', 'afflict'], 'Hunts by the smell of fear. You smell delicious.', aff('bleed')),
  e('lanternkin', 'Lanternkin', 'e_lantern', 'caster', 'undead fire', ['afflict', 'dread', 'attack'], 'A lost traveler, now a lamp for the next one.', { ...aff('burn'), dread: 3 }),
  e('cinderghoul', 'Cinder Ghoul', 'e_zombie2', 'brute', 'undead fire', ['attack', 'heavy', 'afflict'], 'Burns from the inside, and does not mind.', aff('burn')),
  e('emberwisp', 'Ember Wisp', 'e_wisp', 'swarm', 'spirit fire', ['afflict', 'attack', 'afflict'], 'The last spark of somebody’s hearth.', aff('burn')),
  e('ashenmatron', 'The Ashen Matron', 'e_seer', 'caster', 'human fire elite', ['dread', 'afflict', 'heavy'], 'Reads out a ledger in a language of crackling.', { ...aff('burn'), dread: 4 }),
  e('huntsman', 'The Ember Huntsman', 'e_archer', 'skirmisher', 'human fire boss', ['afflict', 'attack', 'heavy', 'guard'], 'Has hunted the Hart for thirty years. Has not noticed he is the reason it runs.', { hpMul: 3.6, ...aff('burn') }),

  e('charcoal', 'Charcoal Sentinel', 'e_burning', 'tank', 'undead fire', ['guard', 'attack', 'heavy'], 'Burned where it stood. Refuses to finish burning.'),
  e('thornstalker', 'Thornstalker', 'e_eviltree', 'brute', 'plant', ['attack', 'afflict', 'heavy'], 'Walks when you look away. Roots when you look back.', aff('bleed')),
  e('emberstag', 'Emberstag', 'e_stag', 'skirmisher', 'beast fire', ['attack', 'heavy', 'afflict'], 'One of the Hart’s fawns. It has never been cold.', aff('burn')),
  e('weepingbough', 'The Weeping Bough', 'e_treeface', 'tank', 'plant elite', ['guard', 'heavy', 'afflict', 'dread'], 'Sap runs from its eyes. It is grief that grew roots.', { ...aff('weak'), dread: 3 }),
  e('hart', 'The Cinder Hart', 'e_stag', 'brute', 'beast fire boss', ['attack', 'afflict', 'heavy', 'guard'], 'Wherever it walks, the forest remembers being alive.', { hpMul: 4.2, ...aff('burn') }),

  e('mirefrog', 'Mire-Toad', 'e_frog', 'brute', 'beast swamp', ['attack', 'afflict', 'attack'], 'Swallows what it cannot understand.', aff('poison')),
  e('bogwitch', 'Bog-Witch', 'e_witch', 'caster', 'human hex', ['dread', 'afflict', 'attack'], 'Trades wishes for teeth.', { ...aff('poison'), dread: 3 }),
  e('hollowmoth', 'Hollow Moth', 'e_moth', 'swarm', 'beast spirit', ['dread', 'attack', 'dread'], 'Eats light, then eats what the light showed you.', { dread: 3 }),
  e('mothmother', 'Moth-Mother', 'e_butterfly', 'caster', 'beast spirit elite', ['dread', 'afflict', 'heavy'], 'Her wings are painted with the last thing you saw.', { ...aff('weak'), dread: 5 }),
  e('crone', 'The Lantern Crone', 'e_hermit', 'caster', 'human hex boss', ['dread', 'afflict', 'attack', 'guard'], 'Lights the way for every traveller. Eventually, they stay to keep her company.', { hpMul: 3.6, ...aff('poison'), dread: 5 }),

  e('brandbearer', 'Brand-Bearer', 'e_burning', 'brute', 'undead fire', ['attack', 'afflict', 'heavy'], 'Burns itself for a debt nobody can name.', aff('burn')),
  e('charredarchivist', 'Charred Archivist', 'e_veiled', 'caster', 'undead fire', ['dread', 'attack', 'afflict'], 'Reads to you. It is not a comfort.', { ...aff('burn'), dread: 3 }),
  e('ashwraith', 'Ash Wraith', 'e_spectre', 'skirmisher', 'spirit fire', ['attack', 'afflict', 'attack'], 'A scream that lost its throat.', aff('bleed')),
  e('fireimp', 'Cinder Imp', 'e_imp', 'swarm', 'fiend fire', ['afflict', 'attack', 'attack'], 'Chatters in the language of embers.', aff('burn')),
  e('cindermagistrate', 'Cinder Magistrate', 'e_sunhood', 'tank', 'undead fire elite', ['guard', 'heavy', 'dread', 'afflict'], 'Wears a crown of melted bells.', { ...aff('burn'), dread: 3 }),
  e('unburntkeeper', 'The Unburnt Keeper', 'e_seer', 'caster', 'undead fire boss', ['dread', 'heavy', 'afflict', 'guard'], 'The fire took the archive and left her. She has been furious ever since.', { hpMul: 3.7, ...aff('burn'), dread: 5, icon: 'e_seer' }),

  e('prospector', 'Bone Prospector', 'e_miner', 'brute', 'human undead', ['attack', 'heavy', 'attack'], 'Still searching for the marrow-gold. Will settle for yours.'),
  e('marrow', 'Marrow Crawler', 'e_maggot', 'swarm', 'beast bone', ['afflict', 'attack', 'attack'], 'Lives inside giant bones. Would like to live inside yours.', aff('weak')),
  e('dustwife', 'Dust Wife', 'e_ghost', 'caster', 'undead spirit', ['dread', 'dread', 'attack'], 'Sweeps the quarry floors of every trace of her husband.', { dread: 4 }),
  e('gravelgolem', 'Gravel Golem', 'e_ogre', 'tank', 'construct bone', ['guard', 'heavy', 'attack'], 'A heap of stone that decided to be furious.'),
  e('overseer', 'The Overseer', 'e_troll', 'tank', 'undead elite', ['guard', 'heavy', 'attack'], 'Counts the dead workers. The number is always one short.'),
  e('grist', 'Foreman Grist', 'e_skeleton', 'brute', 'undead bone boss', ['attack', 'heavy', 'guard', 'afflict'], 'He promised the miners they would be remembered. He built them into the walls.', { hpMul: 4.2, ...aff('bleed') }),

  e('marrowworm', 'Marrow Worm', 'e_earthworm', 'brute', 'beast bone', ['attack', 'heavy', 'afflict'], 'It ate a Titan’s spine and grew fat.', aff('weak')),
  e('ribspider', 'Rib-Spider', 'e_spider', 'skirmisher', 'beast bone', ['attack', 'afflict', 'attack'], 'Spins its web from ligament.', aff('poison')),
  e('titantick', 'Titan-Tick', 'e_beetle', 'tank', 'beast bone', ['guard', 'afflict', 'heavy'], 'Swollen with something that was once alive and enormous.', aff('weak')),
  e('boneharpy', 'Bone Harpy', 'e_harpy', 'skirmisher', 'beast bone', ['attack', 'attack', 'dread'], 'Sings in the voice of your mother, badly.', { dread: 3 }),
  e('ribwarden', 'Ribcage Warden', 'e_gargoyle', 'tank', 'construct bone elite', ['guard', 'heavy', 'attack'], 'Carved to keep the dead in. It has been very successful.'),
  e('hollowtitan', 'The Hollow Titan', 'e_cyclops', 'brute', 'bone boss', ['heavy', 'attack', 'guard', 'dread'], 'A sun that died standing.', { hpMul: 3.8 }),

  e('slagimp', 'Slag Imp', 'e_imp', 'swarm', 'fiend fire', ['attack', 'afflict', 'attack'], 'Made from cooled regrets.', aff('burn')),
  e('foundrywraith', 'Foundry Wraith', 'e_flamesoldier', 'brute', 'undead fire', ['attack', 'heavy', 'afflict'], 'Works a shift that ended a century ago.', aff('burn')),
  e('clockwarden', 'Clockwork Warden', 'e_gearmask', 'tank', 'construct', ['guard', 'attack', 'heavy'], 'Ticks off hours nobody asked it to keep.'),
  e('ironmaw', 'Iron-Maw', 'e_wormmouth', 'brute', 'beast construct', ['attack', 'heavy', 'attack'], 'The foundry’s drain, awake and hungry.'),
  e('castmaster', 'The Cast-Master', 'e_troll', 'tank', 'construct elite', ['guard', 'heavy', 'afflict'], 'Pours molten pity into moulds shaped like you.', aff('burn')),
  e('moltenregent', 'The Molten Regent', 'e_fireelem', 'brute', 'construct fire boss', ['heavy', 'afflict', 'attack', 'dread'], 'A Regent-in-progress, cast in iron and never finished.', { hpMul: 3.8, ...aff('burn'), dread: 4 }),

  e('deserter', 'Frozen Deserter', 'e_soldier', 'brute', 'undead ice', ['attack', 'attack', 'heavy'], 'He turned north. He was the only one who saw it.'),
  e('rime', 'Rime Wraith', 'e_spectre', 'caster', 'spirit ice', ['dread', 'afflict', 'attack'], 'The last breath of a soldier, still looking for a mouth.', { ...aff('weak'), dread: 4 }),
  e('standard', 'Standard-Bearer', 'e_knight', 'tank', 'undead ice', ['guard', 'attack', 'heavy'], 'The banner is stitched from the skin of cowards.'),
  e('frostwolf', 'Frostwolf', 'e_polar', 'skirmisher', 'beast ice', ['attack', 'afflict', 'attack'], 'Runs in the tracks of the dead army.', aff('bleed')),
  e('colonel', 'Colonel Ashgrave', 'e_blackknight', 'tank', 'undead ice elite', ['heavy', 'afflict', 'attack', 'guard'], 'Vhal’s right hand. The left hand is somewhere in the snow.', aff('bleed')),
  e('vhal', 'General Vhal', 'e_oldking', 'brute', 'undead ice boss', ['attack', 'heavy', 'dread', 'guard', 'afflict'], 'He faced south so his army would never see what was following.', { hpMul: 4.4, ...aff('weak') }),

  e('barrowdraug', 'Barrow Draug', 'e_mummy', 'brute', 'undead ice', ['attack', 'heavy', 'afflict'], 'Guards the grave gifts of soldiers no one mourned.', aff('weak')),
  e('rimeghoul', 'Rime Ghoul', 'e_zombie', 'brute', 'undead ice', ['attack', 'attack', 'afflict'], 'Cold as a lie told by a friend.', aff('bleed')),
  e('icespider', 'Ice-Spider', 'e_spider2', 'skirmisher', 'beast ice', ['attack', 'afflict', 'heavy'], 'Its web is a mirror. You do not look good in it.', aff('poison')),
  e('frostbanshee', 'Frost Banshee', 'e_reaper', 'caster', 'spirit ice', ['dread', 'dread', 'attack'], 'She wails for a war that was never declared.', { dread: 5 }),
  e('barrowlord', 'The Barrow-Lord', 'e_dwarf', 'tank', 'undead ice elite', ['guard', 'heavy', 'dread'], 'Buried with his whole household. They are all awake.', { dread: 3 }),
  e('barrowking', 'The Barrow-King', 'e_oldking', 'brute', 'undead ice boss', ['heavy', 'attack', 'dread', 'guard'], 'He knows where the banner is. He has no intention of telling.', { hpMul: 3.9, dread: 4 }),

  e('icegolem', 'Ice Golem', 'e_icegolem', 'tank', 'construct ice', ['guard', 'heavy', 'attack'], 'An avalanche with a purpose.'),
  e('frostbat', 'Frost Bat', 'e_bat', 'swarm', 'beast ice', ['attack', 'afflict', 'attack'], 'Squeaks in perfect pitch. It is the pitch of your worst memory.', aff('bleed')),
  e('glassmaw', 'Glass-Maw', 'e_wormmouth', 'brute', 'beast ice', ['attack', 'heavy', 'afflict'], 'Its teeth are cut crystal.', aff('bleed')),
  e('yeti', 'Snow Yeti', 'e_bear', 'brute', 'beast ice', ['heavy', 'attack', 'attack'], 'Nothing supernatural. Just very angry.'),
  e('crystalstag', 'The Crystal Stag', 'e_stag', 'skirmisher', 'beast ice elite', ['attack', 'afflict', 'heavy'], 'Every antler tine holds a frozen dream.', aff('weak')),
  e('glacierwyrm', 'The Glacier Wyrm', 'e_dragon', 'brute', 'beast ice boss', ['heavy', 'afflict', 'attack', 'dread'], 'It has been sleeping for so long the ice grew over its patience.', { hpMul: 4, ...aff('weak'), dread: 4 }),

  e('noonchild', 'Noonchild', 'e_sunhood', 'caster', 'spirit noon', ['afflict', 'attack', 'dread'], 'Born in the nine-day noon. Has never seen night.', { ...aff('burn'), dread: 4 }),
  e('echo', 'Meridian Echo', 'e_ghost', 'skirmisher', 'spirit noon', ['dread', 'attack', 'heavy'], 'You, from another ending. It lost.', { dread: 5 }),
  e('mourner', 'Hollow Mourner', 'e_bellkeeper', 'tank', 'undead noon', ['guard', 'heavy', 'attack'], 'Apologises for crimes it did not commit, and then commits them.'),
  e('gilded', 'Gilded Sentinel', 'e_soldier', 'brute', 'construct noon', ['attack', 'heavy', 'guard'], 'Gold-plated and hollow. The city’s idea of protection.'),
  e('shadethird', 'Third Shadow', 'e_hand', 'skirmisher', 'spirit noon', ['attack', 'afflict', 'dread'], 'Everyone cast three shadows. This is the one that walked away.', { ...aff('weak'), dread: 4 }),
  e('gildedmarshal', 'Gilded Marshal', 'e_blackknight', 'tank', 'construct noon elite', ['guard', 'heavy', 'afflict', 'attack'], 'Commands an empty city with perfect discipline.', aff('burn')),
  e('herald', 'Herald of Noon', 'e_seer', 'caster', 'human noon boss', ['dread', 'heavy', 'afflict', 'attack'], 'Announces the King. The announcement never ends.', { hpMul: 3.8, ...aff('burn'), dread: 5, icon: 'e_sunhood' }),
  e('regentshade', 'Regent’s Shade', 'e_oldking', 'brute', 'spirit noon elite', ['heavy', 'dread', 'attack', 'afflict'], 'A former sitter of the throne. They are all still sitting.', { dread: 5, ...aff('weak') }),
  e('king', 'The King Behind Noon', 'e_crowned', 'brute', 'human noon boss', ['dread', 'heavy', 'afflict', 'attack', 'guard', 'heavy'], 'He wears the face of whoever reaches him.', { hpMul: 4.6, ...aff('weak'), dread: 6 }),
  e('ilse', 'Seer Ilse, the Blind', 'e_seer', 'caster', 'human noon boss', ['dread', 'heavy', 'afflict', 'guard', 'attack'], 'She sees through your eyes, and she is not pleased with the view.', { hpMul: 4.4, ...aff('burn'), dread: 6 }),

  e('siegechamp', 'Hollow Legion Champion', 'e_barbarian', 'brute', 'undead boss', ['heavy', 'attack', 'dread', 'afflict'], 'Leads the dead against the last gate.', { hpMul: 3.4, ...aff('bleed') }),
  e('maren', 'Lamp-Keeper Maren, Ash-Eyed', 'e_veiled', 'caster', 'human elite', ['afflict', 'dread', 'heavy', 'attack'], 'She has been looking through someone else’s eyes for so long that she forgot her own.', { ...aff('burn'), dread: 4 }),
  e('cask', 'Marshal Cask, Enforcer', 'e_soldier', 'skirmisher', 'human elite', ['heavy', 'attack', 'heavy', 'afflict'], 'One shot, one chance, and no second guesses.', aff('bleed')),
  e('mothhound', 'Moth, the Regent’s Hound', 'e_hound', 'skirmisher', 'beast elite', ['attack', 'afflict', 'attack', 'heavy'], 'Older than the city, quieter than the dark.', aff('bleed')),
  e('nixraven', 'Nix, the Unlucky', 'e_raven', 'caster', 'beast elite', ['afflict', 'dread', 'attack', 'afflict'], 'Was a wayfarer once. Was a great many things once.', { ...aff('weak'), dread: 4 }),
];

export const ENEMY_MAP = new Map(ENEMIES.map(x => [x.id, x]));

export const BOSS_LOOT: Record<string, string[]> = {
  oldsentinel: ['u_roe_sabre'], rookking: ['u_corvin_knife'], saltbeard: ['u_ysolde_compass'], widow: ['u_widow_staff', 'set_drowned_head'],
  huntsman: ['u_tamsin_ring'], hart: ['u_hart_blade', 'set_ember_body'], crone: ['u_last_candle'], unburntkeeper: ['u_briar'], grist: ['u_grist_scythe', 'set_marrow_body'],
  hollowtitan: ['set_marrow_hands'], moltenregent: ['u_dagna_hammer'], vhal: ['u_vhal_blade', 'set_frost_body'], barrowking: ['set_frost_head'],
  glacierwyrm: ['u_snow_cloak'], herald: ['u_herald_spear', 'set_noon_head'], king: ['u_noonblade', 'set_noon_body'], ilse: ['u_ilse_censer', 'u_crown_fragment'],
  siegechamp: ['u_aegis'], mothhound: ['u_moth_fang'], maren: ['u_maren_eyes'],
};
