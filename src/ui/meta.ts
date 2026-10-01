import { COMPANIONS, ORIGINS, PATHS, TIPS } from '../data/story';
import { hasLegacySave, load } from '../engine/core';
import { icon } from '../icons';
import type { GameState, Meta } from '../types';
import { UI, esc } from './common';
import { privacyOptionsRequired } from '../ads';

export const VERSION_LABEL = '4.0.0';

const eclipse = (cls = '') => `<div class="eclipse ${cls}" aria-hidden="true"><i class="corona"></i><i class="corona c2"></i><i class="disc"></i></div>`;

export function splash() {
  return `<div class="splash" data-act="skipSplash"><canvas data-scene="splash" data-res="auto"></canvas><div class="splash-shade"></div>
    <div class="splash-in splash-logo"><h1>DREADMARCH</h1><p class="sub">THE BLACK MERIDIAN</p><div class="loader"><i></i></div><small>Tap to continue</small></div></div>`;
}

export function intro() {
  return `<div class="cine-wrap"><div class="cine" id="cine" data-static></div><button class="btn cine-skip" data-act="skipIntro">Skip</button><div class="cine-hint">TAP TO ADVANCE</div></div>`;
}

export function onboarding(ui: UI) {
  const i = ui.onboardStep;
  const [ic, title, text] = TIPS[i];
  return `<div class="page bg-splash"><div class="panel card-center onboard-card">
    <small class="kicker">HOW TO SURVIVE · ${i + 1}/${TIPS.length}</small>
    <div class="onboard-icon" data-key="oi-${i}">${icon(ic)}</div>
    <h2>${title}</h2><p>${text}</p>
    <div class="dots">${TIPS.map((_, n) => `<i class="${n === i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="row-end"><button class="btn" data-act="skipOnboard">Skip</button><button class="btn primary" data-act="nextOnboard">${i === TIPS.length - 1 ? 'I am ready' : 'Next'}</button></div>
  </div></div>`;
}

export function title(meta: Meta) {
  const saved = load();
  return `<div class="title">
    <canvas class="title-art" data-scene="splash" data-res="auto"></canvas><div class="title-shade"></div>${eclipse('top')}
    <div class="title-card">
      <small class="kicker">A CHRONICLE OF THE FINAL CITY</small>
      <h1>Dreadmarch</h1>
      <p class="tag">The sun is dead. The road remembers your name.</p>
      <div class="menu-stack">
        ${saved ? `<button data-act="continue" class="btn primary big">${icon('compass')}<span>Continue<small>${esc(saved.name)} · Level ${saved.level} · Day ${saved.day}</small></span></button>` : ''}
        <button data-act="new" class="btn ${saved ? '' : 'primary'} big">${icon('quest')}<span>New Chronicle</span></button>
        <div class="menu-row"><button class="btn" data-act="openSettings">${icon('settings')}Settings</button><button class="btn" data-go="about">${icon('lore')}About</button></div>
        <div class="menu-row"><button class="btn" data-act="share">${icon('share')}Share</button><button class="btn" data-act="rate">${icon('star')}Rate</button></div>
      </div>
      ${hasLegacySave() ? '<p class="warn">A chronicle from an older version cannot be continued. Begin anew.</p>' : ''}
      <p class="muted fine">Plays offline · Optional rewarded ads · No gacha${meta.endings.length ? ` · Endings found: ${meta.endings.length}/6` : ''}</p>
    </div></div>`;
}

function toggle(id: string, label: string, on: boolean, hint: string) {
  return `<div class="setting"><div><b>${label}</b><small>${hint}</small></div><button class="switch ${on ? 'on' : ''}" data-setting="${id}" role="switch" aria-checked="${on}" aria-label="${label}"><i></i></button></div>`;
}
export function settings(meta: Meta, ui: UI, inGame: boolean) {
  const st = meta.settings;
  return `<div class="page bg-splash"><div class="panel page-card">
    <h2>${icon('settings')}Settings</h2>
    ${toggle('sfx', 'Sound effects', st.sfx, 'Combat, interface and exploration cues')}
    ${toggle('music', 'Ambient score', st.music, 'Living music that follows the road')}
    ${toggle('voice', 'Voice-over', st.voice, 'Narration in the opening and key story moments')}
    ${toggle('subs', 'Subtitles', st.subs, 'Show spoken lines as text')}
    ${toggle('haptics', 'Haptics', st.haptics, 'Vibration on hits and level ups')}
    ${toggle('motion', 'Motion & particles', st.motion, 'Embers, screen shake and cinematic pans')}
    <div class="setting"><div><b>Text size</b><small>Readability of story text</small></div><div class="seg">${(['normal', 'large'] as const).map(v => `<button class="${st.textSize === v ? 'on' : ''}" data-text="${v}">${v.toUpperCase()}</button>`).join('')}</div></div>
    <div class="setting"><div><b>Difficulty</b><small>Applies to new chronicles. Doomed: +20% enemy damage, death erases the save.</small></div><div class="seg">${(['Wayfarer', 'Doomed'] as const).map(v => `<button class="${st.difficulty === v ? 'on' : ''}" data-diff="${v}">${v.toUpperCase()}</button>`).join('')}</div></div>
    <div class="grid2 section">
      <button class="btn" data-act="replayIntro">${icon('journal')}Replay intro</button><button class="btn" data-act="replayTutorial">${icon('lore')}Replay tutorial</button>
      ${privacyOptionsRequired() ? `<button class="btn" data-act="privacy">${icon('settings')}Ad privacy options</button>` : ''}
      ${inGame ? `<button class="btn" data-act="toTitle">${icon('back')}Main menu</button>` : ''}
      <button class="btn danger" data-act="deleteSave" ${load() ? '' : 'disabled'}>${ui.confirmDelete ? 'Tap again to erase' : 'Erase save'}</button>
    </div>
    <div class="row-end"><span class="muted">v${VERSION_LABEL}</span><button class="btn primary" data-act="closeSettings">Done</button></div>
  </div></div>`;
}

export function about() {
  return `<div class="page bg-splash"><div class="panel page-card center">
    ${eclipse('small')}<h2>Dreadmarch: The Black Meridian</h2><p class="muted">Version ${VERSION_LABEL}</p>
    <p>A dark-fantasy roguelike RPG of grim choices, grid exploration, tactical combat and slow madness. Traverse a shattered continent, break the seals, and decide what morning means.</p>
    <div class="section left"><h3>Credits</h3><p>Design, writing and code: the Dreadmarch team.<br>Typefaces: Cinzel and Crimson Pro (SIL Open Font License).<br>Icons by Lorc, Delapouite, Skoll, Willdabeast, Sbed and others from game-icons.net, licensed CC BY 3.0. Painted art created for Dreadmarch.</p></div>
    <div class="section left"><h3>Privacy</h3><p>Dreadmarch plays fully offline and your chronicle is stored only on this device. There are no accounts and no analytics. The app shows Google AdMob ads (a banner, occasional full-screen ads and optional rewarded videos); AdMob may use an advertising ID according to your consent choices. Rewarded ads are always optional.</p></div>
    <div class="grid2 section"><button class="btn" data-act="share">${icon('share')}Share the game</button><button class="btn" data-act="rate">${icon('star')}Rate on Play Store</button></div>
    <div class="row-end"><span></span><button class="btn primary" data-go="title">Back</button></div>
  </div></div>`;
}

const CREATE_ICONS = [['c_bandage', 'shield', 'archive'], ['w_blade', 'burn', 'w_dagger'], ['e_hound', 'e_veiled', 'e_raven']];
export function creation(s: GameState, ui: UI, meta: Meta) {
  const sets = [ORIGINS, PATHS, COMPANIONS];
  const key = (['origin', 'path', 'companion'] as const)[ui.creationStep];
  const head = [['Choose your history', 'The past is not behind you. It is a weapon, or a wound.'], ['Choose your discipline', 'How will you answer what waits beyond the walls?'], ['Choose your companion', 'No one survives the Dreadmarch alone.']][ui.creationStep];
  return `<div class="creation">
    <div class="steps">${['History', 'Discipline', 'Companion'].map((l, i) => `<span class="${i === ui.creationStep ? 'on' : i < ui.creationStep ? 'done' : ''}"><i>${i + 1}</i>${l}</span>`).join('')}</div>
    <div class="creation-head"><h1>${head[0]}</h1><p>${head[1]}</p></div>
    ${ui.creationStep === 0 ? `<input id="heroName" maxlength="18" placeholder="Name your wayfarer" value="${esc(s.name)}" autocomplete="off"><p class="center muted fine">Difficulty: <b>${meta.settings.difficulty}</b> · change in Settings</p>` : ''}
    <div class="cards">${sets[ui.creationStep].map((x, i) => `<button class="choice-card ${s[key] === x[0] ? 'selected' : ''}" data-pick="${x[0]}"><span class="cc-ic">${icon(CREATE_ICONS[ui.creationStep][i])}</span><h3>${x[0]}</h3><p>${x[1]}</p><small>${x[2]}</small></button>`).join('')}</div>
    <div class="row-end sticky-nav"><button class="btn" data-act="creationBack">Back</button><button class="btn primary" data-act="creationNext" ${!s[key] ? 'disabled' : ''}>${ui.creationStep === 2 ? 'Begin the march' : 'Continue'}</button></div>
  </div>`;
}
