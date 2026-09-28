# Dreadmarch: The Black Meridian

A complete offline-first dark fantasy text roguelike inspired by classic dungeon crawlers. Explore five regions, survive tactical turn-based combat and resolve checks, uncover lore, build a character across six disciplines, and break the seals around the Black Meridian.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run lint
npm run build
```

## Android

```bash
npm run android:apk
```

The debug APK is written under `android/app/build/outputs/apk/debug/`.

## Features

- Launch flow: native splash, cinematic three-panel intro, five-step onboarding, main menu
- Settings (SFX, ambient score, haptics, motion, text size, difficulty, replay intro/tutorial, erase save), About, Share, Rate on Play Store
- Character creation: history, discipline, companion; Wayfarer or Doomed (permadeath) difficulty
- Leveling with attribute points and three talent trees (Steel, Occult, Shadow)
- Equipment page with weapon/off-hand/armor/trinket slots, rarity tiers (common → relic), stat comparison, sell/buy
- Room-choice dungeons: fights, elites, events, caches, shrine blessings, camps, and a warden boss per region
- Tactical combat: telegraphed enemy intents, Bleed/Burn/Stun/Ward/Weak/Marked, companions, sanity, corruption, boss enrage
- Five-chapter main quest with three endings, notice-board side contracts, lore fragments, bestiary
- Synthesized sound and ambience, floating combat numbers, responsive mobile layout with bottom navigation
- Fully offline, local saves, Capacitor Android wrapper; no ads, subscriptions, gacha, or energy timers

Game art was created specifically for Dreadmarch. Interface icons use Unicode glyphs.
