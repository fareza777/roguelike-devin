# Dreadmarch: The Black Meridian

A dark-fantasy roguelike RPG: grid exploration, telegraphed turn-based combat, sanity, corruption and a three-part chronicle
(about 25 hours of pure main path, 30-40 hours with shopping, backtracking and retries). Secular world: no religion, no faces. Every figure is
masked, veiled or hooded. Offline-first; Capacitor Android wrapper with optional AdMob ads.

## Run

```bash
npm install
npm run dev
npm test && npm run lint && npm run build
```

## Story structure

- **Part I** (L1-24): Veyrgard, four Wardens, seven prep dungeons, the Reveal.
- **Part II** (L24-50): the six Regalia. Glasswastes, Thornwick, the Tidal Archipelago (ferry-only islands), the Orrery, Aurora Reach and the Underdeep. Each is a 7-step arc with a hub city, villages, four dungeons, ~20 creatures, 12 contracts, events and a Regent boss.
- **Part III** (L50-60): Solenne, the Mirror Court, the Gilded Gardens, the Undercity and the Meridian. Six endings, including the Common Dawn (all six Regalia and four mercies).
- Systems: level cap 60, 10 item tiers, ~100 skills in 13 schools with 5 ranks, 60 talents, 12 ascensions, 9 companions, generated bounties, set bonuses, ferries.

## Art (no image files)

All scenes, portraits, enemies, event art and battle effects are drawn procedurally on canvas (`src/art`, `src/render/battle.ts`). Nothing has a face:
figures use hoods, veils, masks and helms. `dev/art-lab.html` previews everything (`?mode=scenes|creatures|personas`).
`node tools/export-android-art.mjs <dev-url>` regenerates the Android splash and icons from the same art.

## Cinematic and voice-over

The intro (`src/cinematic`, `src/data/cinematic.ts`) is ten camera-moved shots with word-by-word subtitles. Voice-over is optional:

```bash
ELEVENLABS_API_KEY=... npm run vo        # renders public/audio/vo/*.mp3 and manifest.json
```

The key is read from the environment only. Pick voices with `ELEVENLABS_VOICE_NARRATOR / _SEER / _REGENT` (a voice_id) or leave them unset to match by name. Without mp3 files the game plays with subtitles and a synthesized score.

## Ads (AdMob)

`ads.config.json` ships with Google's TEST ids and `testMode: true`. Before publishing create the app and three ad units (banner, interstitial, rewarded), paste the ids, set `testMode` to false, then:

```bash
npm run android:sync     # build, cap sync, patch AndroidManifest (app id, AD_ID, network permissions)
```

Banner on calm screens, interstitials at natural breaks only (after 15 minutes of play, 5 minute spacing, daily cap), rewarded ads always optional
(revive in place, double gold, supply cache, 30 minute fortune boost) with daily caps. UMP consent and the privacy-options button are wired in.

## Balance and playtime

```bash
npx tsx tools/sim.ts combat   # scripted hero vs every dungeon's creature, elite and boss
npx tsx tools/sim.ts time     # main-path playtime estimate from the real dungeon generator and map
```

Latest estimate (no optional contracts; the model assumes 0.32 s per step, 4.4 s per combat turn, real floor/entity counts):

```
== MAIN-PATH PLAYTIME ESTIMATE (no optional contracts, one run) ==
Part I   (Veyrgard to the Reveal):   5.3 h
Part II  (the six Regalia):          14.8 h
Part III (Solenne to the Meridian):  5.8 h
+ story scenes read:                 0.5 h
TOTAL 26.4 h   (travel 0.8 h, dungeons 21.1 h, grind 2.4 h, talk/chores 2.2 h, ~1551 fights)
Level reached at the end of the main path: 60 (cap 60)
```

## Android

```bash
npm run android:apk
```
