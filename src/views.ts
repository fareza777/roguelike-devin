import { CHAPTERS, COMPANIONS, ENEMIES, LORE, ORIGINS, PATHS, QUESTS, REGIONS, SKILLS, TALENTS, TIPS } from './content';
import {
  QUEST_LIMIT, SUPPLY_PRICE, availableQuests, canAfford, canLearnTalent, checkChance, cleanseCost, enemyDef, hasLegacySave, item,
  load, region, regionUnlocked, restCost, sellPrice, shopStock, skillPrice, stats,
} from './engine';
import type { GameState, ItemDef, Meta, Slot, Status } from './types';

export interface UI {
  creationStep: number; introPanel: number; onboardStep: number; back: 'title' | 'city' | 'prev';
  prevScreen: GameState['screen']; mapSel: string | null; invSel: string | null; charTab: 'attributes' | 'talents';
  journalTab: 'quests' | 'lore' | 'bestiary'; shopTab: 'buy' | 'sell'; confirmDelete: boolean; toast: string | null;
}

export const VERSION_LABEL = '2.0.0';
export const esc = (t: string) => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const pct = (a: number, b: number) => Math.max(0, Math.min(100, (a / Math.max(1, b)) * 100));
const SLOT_LABEL: Record<Slot, string> = { weapon: 'Weapon', offhand: 'Off-hand', armor: 'Armor', trinket: 'Trinket' };
const SLOT_ICON: Record<Slot, string> = { weapon: '⚔', offhand: '◍', armor: '♜', trinket: '◉' };
const STATUS_ICON: Record<Status, string> = { bleed: '🩸', burn: '♨', stun: '✶', ward: '⛨', weak: '↓', marked: '⌖' };
const INTENT_ICON = { attack: '⚔', heavy: '⚒', dread: '◉', guard: '⛨', afflict: '☣' };

const bonusText = (d: ItemDef) => {
  const b = d.bonus;
  const parts: string[] = [];
  const add = (v: number | undefined, label: string, suffix = '') => { if (v) parts.push(`${v > 0 ? '+' : ''}${v}${suffix} ${label}`) };
  add(b.damage, 'damage'); add(b.armor, 'armor'); add(b.vigor, 'Vigor'); add(b.will, 'Will'); add(b.cunning, 'Cunning');
  add(b.maxHp, 'health'); add(b.maxSanity, 'sanity'); add(b.crit, 'crit', '%');
  return parts.join(' · ') || d.desc;
};

export function embers(motion: boolean) {
  if (!motion) return '';
  return `<div class="embers" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i * 0.9) % 9}s;animation-duration:${8 + (i % 5) * 2}s"></i>`).join('')}</div>`;
}

function statusChips(st: Partial<Record<Status, number>>) {
  return (Object.keys(st) as Status[]).map(k => `<span class="chip status-${k}" title="${k}">${STATUS_ICON[k]} ${k.toUpperCase()} ${st[k]}</span>`).join('');
}

export function top(s: GameState) {
  const locked = ['combat', 'event', 'reward', 'dungeon'].includes(s.screen);
  const st = stats(s);
  return `<header class="topbar">
    <button class="icon-btn" data-go="city" ${locked ? 'disabled' : ''} aria-label="City">⌂</button>
    <div class="brand">DREADMARCH</div>
    <div class="topstats">
      <div class="stat" title="Gold">◈ <b>${s.gold}</b></div>
      <div class="stat" title="Supplies">▣ <b>${s.supplies}</b></div>
      <div class="stat hp-t" title="Health">♥ <b>${s.hp}/${st.maxHp}</b></div>
      <div class="stat san-t" title="Sanity">◉ <b>${s.sanity}/${st.maxSanity}</b></div>
      <div class="stat wide" title="Day">DAY <b>${s.day}</b></div>
    </div>
    <button class="icon-btn" data-act="openSettings" aria-label="Settings">⚙</button>
  </header>`;
}

export function bottomNav(s: GameState) {
  if (!['city', 'map', 'character', 'inventory', 'journal', 'shop', 'skills', 'board'].includes(s.screen)) return '';
  const tabs: [GameState['screen'], string, string][] = [['city', '⌂', 'City'], ['map', '◈', 'Map'], ['character', '♙', 'Hero'], ['inventory', '▦', 'Bag'], ['journal', '▤', 'Chronicle']];
  return `<nav class="bottomnav">${tabs.map(([sc, ic, l]) => `<button data-go="${sc}" class="${s.screen === sc ? 'on' : ''}"><i>${ic}</i><span>${l}</span>${sc === 'character' && (s.statPoints || s.talentPoints) ? '<em class="dot"></em>' : ''}</button>`).join('')}</nav>`;
}

export function bars(s: GameState) {
  const st = stats(s);
  return `<div class="bars">
    <div class="bar"><div class="fill hp" style="width:${pct(s.hp, st.maxHp)}%"></div><span>HEALTH ${s.hp} / ${st.maxHp}</span></div>
    <div class="bar"><div class="fill san ${s.sanity <= 0 ? 'broken' : ''}" style="width:${pct(s.sanity, st.maxSanity)}%"></div><span>${s.sanity <= 0 ? 'UNRAVELED' : 'SANITY'} ${s.sanity} / ${st.maxSanity}</span></div>
    <div class="bar thin"><div class="fill xp" style="width:${pct(s.xp, s.xpNext)}%"></div><span>LEVEL ${s.level} · ${s.xp} / ${s.xpNext} XP</span></div>
  </div>`;
}

function mainQuestCard(s: GameState) {
  const ch = CHAPTERS[Math.min(s.chapter, CHAPTERS.length - 1)];
  const done = s.chapter >= CHAPTERS.length;
  return `<div class="quest main-quest"><b>MAIN QUEST · ${done ? 'EPILOGUE' : ch.title}</b><p>${done ? 'The Meridian is quiet. Veyrgard endures — for now.' : ch.objective}</p><div class="seals">${CHAPTERS.slice(0, 4).map((_, i) => `<i class="${i < s.chapter ? 'broken' : ''}">◆</i>`).join('')}</div></div>`;
}

export function side(s: GameState) {
  const st = stats(s);
  return `<aside class="side">${bars(s)}${mainQuestCard(s)}
    <div class="section"><h3>${esc(s.name)}</h3><p class="muted">${s.origin} · ${s.path}<br>Companion: ${s.companion}</p>
      <div class="grid3 mini"><span title="Damage">⚔ ${st.damage}</span><span title="Armor">♜ ${st.armor}</span><span title="Critical">✶ ${st.crit}%</span></div></div>
    <div class="section"><h3>Latest Chronicle</h3>${s.log.slice(0, 4).map(x => `<div class="log ${x.tone}">${x.text}</div>`).join('') || '<p class="muted">The road waits.</p>'}</div>
  </aside>`;
}

export function splash() {
  return `<div class="splash" data-act="skipSplash"><div class="splash-inner"><div class="sigil big pulse">◐</div><h1>DREADMARCH</h1><p>THE BLACK MERIDIAN</p><div class="loader"><i></i></div><small>Tap to continue</small></div></div>`;
}

const INTRO = [
  { art: 'intro1.webp', lines: ['On the ninth day of the endless noon, the sun turned black.', 'Every citizen of Veyr cast three shadows. By nightfall, the shadows had begun to speak.'] },
  { art: 'intro2.webp', lines: ['From the wound in the sky poured the Dreadmarch — the dead, the changed, the hungry.', 'Kingdom after kingdom fell silent. Only Veyrgard, the Final City, still bars its gates.'] },
  { art: 'intro3.webp', lines: ['Four wardens once held the wound shut. Now they serve it.', '“Break the seals,” whispers the Blind Priestess. “Then walk into the Meridian, and bring back the morning.”'] },
];
export function intro(ui: UI) {
  const p = INTRO[ui.introPanel];
  return `<div class="intro"><div class="intro-art kenburns" style="background-image:url('/art/${p.art}')"></div><div class="intro-shade"></div>
    <div class="intro-text">${p.lines.map((l, i) => `<p class="reveal" style="animation-delay:${0.5 + i * 1.6}s">${l}</p>`).join('')}</div>
    <div class="intro-nav"><div class="dots">${INTRO.map((_, i) => `<i class="${i === ui.introPanel ? 'on' : ''}"></i>`).join('')}</div>
      <button data-act="skipIntro">SKIP</button><button class="primary" data-act="nextIntro">${ui.introPanel === INTRO.length - 1 ? 'BEGIN' : 'NEXT'}</button></div></div>`;
}
export const INTRO_LENGTH = INTRO.length;

const ONBOARD_ICONS = ['⚔', '◉', '▣', '☠', '✦'];
export function onboarding(ui: UI) {
  const i = ui.onboardStep;
  return `<div class="onboard"><div class="panel onboard-card">
    <small class="kicker">HOW TO SURVIVE · ${i + 1}/${TIPS.length}</small>
    <div class="onboard-icon">${ONBOARD_ICONS[i]}</div>
    <h2>${['Read the Enemy', 'Guard Your Mind', 'Mind Your Supplies', 'Choose Your Path', 'Grow Stronger'][i]}</h2>
    <p>${TIPS[i]}</p>
    <div class="dots">${TIPS.map((_, n) => `<i class="${n === i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="create-nav"><button data-act="skipOnboard">SKIP</button><button class="primary" data-act="nextOnboard">${i === TIPS.length - 1 ? 'I AM READY' : 'NEXT'}</button></div>
  </div></div>`;
}

export function title(meta: Meta) {
  const saved = load();
  return `<div class="title"><div class="title-card">
    <div class="sigil">◐</div><h1><span>A Chronicle of the Final City</span>Dreadmarch</h1>
    <em>The sun is dead. The road remembers your name.</em>
    <div class="menu-stack">
      ${saved ? `<button data-act="continue" class="primary">CONTINUE<small>${esc(saved.name)} · Level ${saved.level} · Day ${saved.day}</small></button>` : ''}
      <button data-act="new" class="${saved ? '' : 'primary'}">NEW CHRONICLE</button>
      <div class="menu-row"><button data-act="openSettings">⚙ SETTINGS</button><button data-go="about">✦ ABOUT</button></div>
      <div class="menu-row"><button data-act="share">➦ SHARE</button><button data-act="rate">★ RATE</button></div>
    </div>
    ${hasLegacySave() ? '<p class="warn">A chronicle from an older version cannot be continued. Begin anew.</p>' : ''}
    <p class="muted"><small>Offline · No ads · No gacha${meta.endings.length ? ` · Endings found: ${meta.endings.length}/3` : ''}</small></p>
  </div></div>`;
}

function toggle(id: string, label: string, on: boolean, hint: string) {
  return `<div class="setting"><div><b>${label}</b><small>${hint}</small></div><button class="switch ${on ? 'on' : ''}" data-setting="${id}" aria-pressed="${on}"><i></i></button></div>`;
}
export function settings(meta: Meta, ui: UI, inGame: boolean) {
  const st = meta.settings;
  return `<div class="page"><div class="panel page-card">
    <h2>Settings</h2>
    ${toggle('sfx', 'Sound effects', st.sfx, 'Combat, interface and ambience cues')}
    ${toggle('music', 'Ambient score', st.music, 'A low drone beneath the Dreadmarch')}
    ${toggle('haptics', 'Haptics', st.haptics, 'Vibration on hits and level ups')}
    ${toggle('motion', 'Motion & particles', st.motion, 'Embers, screen shake and cinematic pans')}
    <div class="setting"><div><b>Text size</b><small>Readability of story text</small></div><div class="seg">${(['normal', 'large'] as const).map(v => `<button class="${st.textSize === v ? 'on' : ''}" data-text="${v}">${v.toUpperCase()}</button>`).join('')}</div></div>
    <div class="setting"><div><b>Difficulty</b><small>Applies to new chronicles. Doomed: +20% enemy damage, death erases the save.</small></div><div class="seg">${(['Wayfarer', 'Doomed'] as const).map(v => `<button class="${st.difficulty === v ? 'on' : ''}" data-diff="${v}">${v.toUpperCase()}</button>`).join('')}</div></div>
    <div class="section grid">
      <button data-act="replayIntro">▶ REPLAY INTRO</button><button data-act="replayTutorial">? REPLAY TUTORIAL</button>
      ${inGame ? '<button data-act="toTitle">⌂ MAIN MENU</button>' : ''}
      <button class="danger" data-act="deleteSave" ${load() ? '' : 'disabled'}>${ui.confirmDelete ? 'TAP AGAIN TO ERASE' : '✖ ERASE SAVE'}</button>
    </div>
    <div class="create-nav"><span class="muted">v${VERSION_LABEL}</span><button class="primary" data-act="closeSettings">DONE</button></div>
  </div></div>`;
}

export function about() {
  return `<div class="page"><div class="panel page-card about">
    <div class="sigil">◐</div><h2>Dreadmarch: The Black Meridian</h2><p class="muted">Version ${VERSION_LABEL}</p>
    <p>A dark-fantasy roguelike RPG of grim choices, tactical turn-based combat and slow madness. Break the four seals, survive the Dreadmarch, and decide what morning means.</p>
    <div class="section"><h3>Credits</h3><p>Design, writing, code and art: the Dreadmarch team.<br>Typefaces: Cinzel and Crimson Pro (SIL Open Font License).</p></div>
    <div class="section"><h3>Privacy</h3><p>Dreadmarch runs fully offline. No accounts, ads, trackers or analytics. Your chronicle is stored only on this device.</p></div>
    <div class="section grid"><button data-act="share">➦ SHARE THE GAME</button><button data-act="rate">★ RATE ON PLAY STORE</button></div>
    <div class="create-nav"><span></span><button class="primary" data-go="title">BACK</button></div>
  </div></div>`;
}

export function creation(s: GameState, ui: UI, meta: Meta) {
  const sets = [ORIGINS, PATHS, COMPANIONS];
  const key = (['origin', 'path', 'companion'] as const)[ui.creationStep];
  const icons = [['⚕', '♜', '⌘'], ['⚔', '✦', '⟲'], ['♞', '♝', '♟']];
  return `<div class="creation">
    <div class="steps">${['History', 'Discipline', 'Companion'].map((l, i) => `<span class="${i === ui.creationStep ? 'on' : i < ui.creationStep ? 'done' : ''}">${i + 1}. ${l}</span>`).join('')}</div>
    <div class="creation-head"><div class="sigil">${['♙', '⚔', '♞'][ui.creationStep]}</div><h1>${['Choose your history', 'Choose your discipline', 'Choose your companion'][ui.creationStep]}</h1>
    <p>${['The past is not behind you. It is a weapon, or a wound.', 'How will you answer what waits beyond the walls?', 'No one survives the Dreadmarch alone.'][ui.creationStep]}</p></div>
    ${ui.creationStep === 0 ? `<input id="heroName" maxlength="18" placeholder="NAME YOUR WAYFARER" value="${esc(s.name)}"><p class="center muted">Difficulty: <b>${meta.settings.difficulty}</b> · change in Settings</p>` : ''}
    <div class="cards">${sets[ui.creationStep].map((x, i) => `<button class="choice-card ${s[key] === x[0] ? 'selected' : ''}" data-pick="${x[0]}"><div class="big-icon">${icons[ui.creationStep][i]}</div><h3>${x[0]}</h3><p>${x[1]}</p><small>${x[2]}</small></button>`).join('')}</div>
    <div class="create-nav"><button data-act="creationBack">BACK</button><button class="primary" data-act="creationNext" ${!s[key] ? 'disabled' : ''}>${ui.creationStep === 2 ? 'BEGIN THE MARCH' : 'CONTINUE'}</button></div>
  </div>`;
}

function place(go: string, icon: string, label: string, sub: string, badge = '', act = false) {
  return `<button class="menu-btn" ${act ? `data-act="${go}"` : `data-go="${go}"`}><i>${icon}</i><span>${label}<small>${sub}</small></span>${badge ? `<em class="badge-dot">${badge}</em>` : ''}</button>`;
}
export function city(s: GameState) {
  const ready = s.quests.filter(q => q.done).length;
  return `${top(s)}<div class="layout"><main class="main">
    <div class="art" style="background-image:url('/art/city.webp')"><div class="art-title"><h1>VEYRGARD — THE FINAL CITY</h1><p>Day ${s.day}. ${s.chapter >= 4 ? 'The sky over the Meridian is open.' : 'The western wall is still standing.'}</p></div></div>
    <div class="grid section">
      ${place('map', '◈', 'WORLD MAP', 'Choose an expedition')}
      ${place('board', '✉', 'NOTICE BOARD', `${s.quests.length}/${QUEST_LIMIT} quests active`, ready ? `${ready}` : '')}
      ${place('shop', '⚒', 'CARRION EXCHANGE', 'Buy, sell, supplies')}
      ${place('skills', '✦', 'FORBIDDEN ARCHIVE', 'Learn disciplines')}
      ${place('rest', '☾', 'THE LAST LANTERN', `Rest fully · ${restCost(s)} gold`, '', true)}
      ${place('cleanse', '✝', 'CHAPEL OF ASH', s.corruption ? `Purge corruption · ${cleanseCost(s)} gold` : 'You are untainted', '', true)}
      ${place('character', '♙', 'CHARACTER', 'Attributes & talents', s.statPoints || s.talentPoints ? '!' : '')}
      ${place('inventory', '▦', 'EQUIPMENT', 'Gear and belongings')}
    </div></main>${side(s)}</div>`;
}

export function map(s: GameState, ui: UI) {
  const sel = REGIONS.find(r => r.id === ui.mapSel);
  const idx = sel ? REGIONS.indexOf(sel) : -1;
  return `${top(s)}<div class="layout"><main class="main"><h2>The Shattered Continent</h2><p class="muted">Four seals hold the wound shut. Each has a warden.</p>
    <div class="map">${REGIONS.map((r, i) => {
      const locked = !regionUnlocked(s, i);
      const cleared = s.bosses.includes(r.boss);
      return `<button class="map-pin ${locked ? 'locked' : ''} ${ui.mapSel === r.id ? 'active' : ''} ${cleared ? 'cleared' : ''}" style="left:${r.pos[0]}%;top:${r.pos[1]}%" data-mapsel="${r.id}" ${locked ? 'disabled' : ''}>${locked ? '🔒' : ['☠', '♠', '♜', '❄', '◐'][i]}</button><div class="map-label" style="left:${r.pos[0]}%;top:${r.pos[1]}%">${locked ? 'SEALED' : r.name}${cleared ? '<br><small>SEAL BROKEN</small>' : ''}</div>`;
    }).join('')}</div>
    ${sel ? `<div class="panel region-card"><div class="region-thumb" style="background-image:url('/art/${sel.art}')"></div><div class="info"><h3>${sel.name}</h3><p><i>${sel.subtitle}</i></p><p>${sel.description}</p>
      <p class="muted">Danger ${'☠'.repeat(sel.danger)} · ${sel.depth} chambers · Warden: ${enemyDef(sel.boss).name}${s.bosses.includes(sel.boss) ? ' (defeated)' : ''}</p>
      <button class="primary" data-region="${sel.id}" ${regionUnlocked(s, idx) ? '' : 'disabled'}>BEGIN EXPEDITION</button></div></div>` : '<p class="center muted">Select a region on the map.</p>'}
  </main>${side(s)}</div>`;
}

export function dungeon(s: GameState) {
  const r = region(s);
  const run = s.run!;
  const blessing = { blade: 'Blessing of Blades (+2 damage)', ward: 'Blessing of Warding (+2 armor)', eye: 'Blessing of the Open Eye (+10% crit)' }[run.blessing ?? ''] ?? '';
  return `${top(s)}<div class="layout"><main class="main">
    <div class="art dungeon-art" style="background-image:url('/art/${r.art}')"><div class="art-title"><h1>${r.name}</h1><p>${r.subtitle}</p></div></div>
    <div class="progress">${Array.from({ length: run.maxDepth }, (_, i) => `<i class="${i < run.depth ? 'done' : ''} ${i === run.maxDepth - 1 ? 'boss' : ''}"></i>`).join('')}</div>
    <p class="muted center">Chamber ${run.depth + 1} of ${run.maxDepth} · each step costs 1 supply (${s.supplies} left)${blessing ? ` · ${blessing}` : ''}</p>
    ${statusChips(s.status) ? `<div class="chips center">${statusChips(s.status)}</div>` : ''}
    <h3 class="center">Choose your path</h3>
    <div class="rooms">${run.rooms.map((rm, i) => `<button class="room room-${rm.kind}" data-room="${i}"><div class="room-icon">${rm.icon}</div><b>${rm.label}</b><small>${rm.hint}</small></button>`).join('')}</div>
    <div class="actions section"><button data-act="abandon">↩ RETURN TO VEYRGARD<br><small>End the expedition and keep your loot</small></button></div>
  </main>${side(s)}</div>`;
}

export function combat(s: GameState) {
  const e = s.enemy!;
  const st = stats(s);
  const consumables = [...new Set(s.inventory.filter(id => item(id)?.slot === 'consumable'))];
  const floats = (t: 'enemy' | 'player') => s.fx.filter(f => f.target === t).map((f, i) => `<span class="float ${f.kind}" style="animation-delay:${i * 0.18}s;left:${40 + ((i * 17) % 30)}%">${f.text}</span>`).join('');
  return `${top(s)}<div class="layout"><main class="main combat ${s.fx.some(f => f.target === 'player' && f.kind === 'dmg') ? 'hurt-flash' : ''}">
    <div class="enemy rank-${e.rank}" ${e.art ? `style="--art:url('/art/${e.art}')"` : `style="--art:url('/art/${region(s).art}')"`}>
      <div class="enemy-portrait ${e.art ? 'has-art' : ''} ${s.fx.some(f => f.target === 'enemy') ? 'hit' : ''}">${e.art ? '' : `<span>${e.icon}</span>`}${floats('enemy')}</div>
      <div class="enemy-name">${e.rank !== 'normal' ? `<small>${e.rank.toUpperCase()}</small>` : ''}${e.name}</div>
      <div class="intent intent-${e.intent.kind}">${INTENT_ICON[e.intent.kind]} ${e.status.stun ? 'STUNNED' : `${e.intent.label}${e.intent.value ? ` · ~${e.intent.value}` : ''}`}</div>
      <div class="bar"><div class="fill hp" style="width:${pct(e.hp, e.maxHp)}%"></div><span>${e.hp} / ${e.maxHp}${e.armor ? ` · ♜${e.armor}` : ''}</span></div>
      <div class="chips">${statusChips(e.status)}${e.rank === 'boss' && e.hp < e.maxHp / 2 ? '<span class="chip status-burn">ENRAGED</span>' : ''}</div>
    </div>
    <div class="player-zone">${floats('player')}${bars(s)}<div class="chips">${statusChips(s.status)}${s.sanity <= 0 ? '<span class="chip status-weak">UNRAVELED +25% DMG TAKEN</span>' : ''}<span class="chip">${s.companion} ${'●'.repeat(s.companionCharge)}${'○'.repeat(3 - s.companionCharge)}</span></div></div>
    <div class="combat-actions">
      <button class="primary" data-act="attack">⚔ ATTACK<small>${st.damage}–${st.damage + 3} dmg</small></button>
      <button data-act="defend">⛨ DEFEND<small>−60% dmg · +1 sanity</small></button>
      <button data-act="flee" ${e.rank === 'boss' ? 'disabled' : ''}>➳ RETREAT<small>${e.rank === 'boss' ? 'Impossible' : `${st.flee}% chance`}</small></button>
    </div>
    <div class="skillbar">${s.skills.map(id => {
      const x = SKILLS.find(k => k.id === id)!;
      const cd = s.cooldowns[id] ?? 0;
      const noSan = s.sanity < x.sanityCost;
      return `<button data-skill="${id}" ${cd > 0 || noSan ? 'disabled' : ''} title="${x.desc}">${x.icon} ${x.name}<small>${cd > 0 ? `ready in ${cd}` : x.sanityCost ? `${x.sanityCost} sanity` : 'ready'}</small></button>`;
    }).join('')}</div>
    ${consumables.length ? `<div class="skillbar items">${consumables.map(id => { const x = item(id)!; const n = s.inventory.filter(v => v === id).length; return `<button data-item="${id}" title="${x.desc}">${x.icon} ${x.name}${n > 1 ? ` ×${n}` : ''}</button>` }).join('')}</div>` : ''}
    <div class="combat-log">${s.log.map(x => `<div class="log ${x.tone}">${x.text}</div>`).join('')}</div>
  </main>${side(s)}</div>`;
}

export function event(s: GameState) {
  const e = s.event!;
  return `${top(s)}<div class="event panel"><div class="event-icon">${e.icon}</div><h1>${e.title}</h1><p class="story">${e.text}</p><div class="section">${e.choices.map((c, i) => {
    const ok = canAfford(s, c);
    const chance = c.requires ? ` · ${c.requires.toUpperCase()} ${checkChance(s, c.requires)}%` : '';
    return `<button data-choice="${i}" ${ok ? '' : 'disabled'}><b>${c.label}${chance}</b><small>${c.text}${ok ? '' : ' — you cannot afford this.'}</small></button>`;
  }).join('')}</div></div>`;
}

function itemRow(d: ItemDef, action: string) {
  return `<div class="list-item r-${d.rarity}"><div class="big-icon">${d.icon}</div><div class="info"><b>${d.name}</b> <span class="rarity">${d.rarity}</span><p>${bonusText(d)}</p></div>${action}</div>`;
}

export function reward(s: GameState) {
  const r = s.reward!;
  return `${top(s)}<div class="event panel reward"><div class="event-icon">✦</div><h1>${r.title}</h1>
    <div class="reward-stats"><span>◈ +${r.gold} gold</span><span>✦ +${r.xp} XP</span></div>
    ${r.lines.map(l => `<p class="log epic">${l}</p>`).join('')}
    ${r.items.length ? `<h3>Spoils</h3><div class="list">${r.items.map(id => itemRow(item(id)!, '')).join('')}</div>` : ''}
    <button class="primary wide-btn" data-act="closeReward">CONTINUE</button></div>`;
}

export function character(s: GameState, ui: UI) {
  const st = stats(s);
  const attr = (k: 'vigor' | 'will' | 'cunning', label: string, hint: string) => `<div class="panel attr"><h3>${label}</h3><div class="big-icon">${st[k]}</div><small>${hint}</small>${s.statPoints ? `<button data-stat="${k}">+ RAISE</button>` : ''}</div>`;
  const trees = (['Steel', 'Occult', 'Shadow'] as const).map(tree => `<div class="tree"><h3>${tree}</h3>${TALENTS.filter(t => t.tree === tree).map(t => {
    const known = s.talents.includes(t.id);
    const can = canLearnTalent(s, t.id);
    return `<button class="talent ${known ? 'known' : ''}" data-talent="${t.id}" ${known || !can ? 'disabled' : ''}><i>${t.icon}</i><b>${t.name}</b><small>${t.desc}</small><em>${known ? 'LEARNED' : `TIER ${t.tier}`}</em></button>`;
  }).join('<div class="tree-link"></div>')}</div>`).join('');
  return `${top(s)}<div class="layout"><main class="main"><h2>${esc(s.name)}</h2><p class="muted">${s.origin} · ${s.path} · Level ${s.level} · ${s.difficulty}</p>${bars(s)}
    <div class="tabs"><button class="${ui.charTab === 'attributes' ? 'on' : ''}" data-chartab="attributes">ATTRIBUTES${s.statPoints ? ` (${s.statPoints})` : ''}</button><button class="${ui.charTab === 'talents' ? 'on' : ''}" data-chartab="talents">TALENTS${s.talentPoints ? ` (${s.talentPoints})` : ''}</button></div>
    ${ui.charTab === 'attributes' ? `
      ${s.statPoints ? `<p class="log epic">${s.statPoints} attribute point${s.statPoints > 1 ? 's' : ''} to spend.</p>` : ''}
      <div class="grid3">${attr('vigor', 'Vigor', 'Health & damage')}${attr('will', 'Will', 'Sanity & burning')}${attr('cunning', 'Cunning', 'Critical, escape, checks')}</div>
      <div class="statgrid section"><span>Damage <b>${st.damage}–${st.damage + 3}</b></span><span>Armor <b>${st.armor}</b></span><span>Critical <b>${st.crit}%</b></span><span>Escape <b>${st.flee}%</b></span><span>Corruption <b>${s.corruption}</b>${s.corruption ? ` (+${st.corruptionBonus}% dmg)` : ''}</span><span>Kills <b>${s.kills}</b></span><span>Elites <b>${s.elites}</b></span><span>Seals broken <b>${Math.min(4, s.chapter)}</b></span></div>
      <h3>Known Skills</h3><div class="list">${s.skills.map(id => { const k = SKILLS.find(x => x.id === id)!; return `<div class="list-item"><div class="big-icon">${k.icon}</div><div class="info"><b>${k.name} · ${k.school}</b><p>${k.desc} Cooldown ${k.cooldown}.</p></div></div>` }).join('')}</div>`
    : `<p class="muted">${s.talentPoints} talent point${s.talentPoints === 1 ? '' : 's'} available. Each tier requires the one above it.</p><div class="trees">${trees}</div>`}
  </main>${side(s)}</div>`;
}

function compare(s: GameState, d: ItemDef) {
  if (d.slot === 'consumable') return '';
  const cur = s.equipment[d.slot as Slot];
  if (!cur || cur === d.id) return '';
  const c = item(cur)!;
  const keys = ['damage', 'armor', 'vigor', 'will', 'cunning', 'maxHp', 'maxSanity', 'crit'] as const;
  const diff = keys.map(k => [k, (d.bonus[k] ?? 0) - (c.bonus[k] ?? 0)] as const).filter(([, v]) => v !== 0);
  return `<div class="compare"><small>vs ${c.name}:</small> ${diff.map(([k, v]) => `<span class="${v > 0 ? 'good' : 'bad'}">${v > 0 ? '▲' : '▼'}${Math.abs(v)} ${k.replace('max', '')}</span>`).join(' ') || '<span>identical</span>'}</div>`;
}

export function inventory(s: GameState, ui: UI) {
  const groups = [...new Set(s.inventory)].map(id => ({ d: item(id)!, n: s.inventory.filter(x => x === id).length })).filter(g => g.d);
  const sel = ui.invSel ? item(ui.invSel) : null;
  const owned = sel && s.inventory.includes(sel.id);
  return `${top(s)}<div class="layout"><main class="main"><h2>Equipment</h2>
    <div class="slots">${(Object.keys(SLOT_LABEL) as Slot[]).map(slot => {
      const d = s.equipment[slot] ? item(s.equipment[slot]!) : null;
      return `<div class="slot ${d ? `r-${d.rarity}` : 'empty'}"><small>${SLOT_LABEL[slot]}</small><div class="big-icon">${d ? d.icon : SLOT_ICON[slot]}</div><b>${d ? d.name : 'Empty'}</b><p>${d ? bonusText(d) : '—'}</p>${d ? `<button data-unequip="${slot}">UNEQUIP</button>` : ''}</div>`;
    }).join('')}</div>
    <h3 class="section">Belongings (${s.inventory.length})</h3>
    ${groups.length ? `<div class="bag">${groups.map(g => `<button class="bag-item r-${g.d.rarity} ${ui.invSel === g.d.id ? 'sel' : ''}" data-invsel="${g.d.id}"><span>${g.d.icon}</span>${g.n > 1 ? `<em>${g.n}</em>` : ''}</button>`).join('')}</div>` : '<p class="muted">Your pack is empty.</p>'}
    ${sel && owned ? `<div class="panel item-detail r-${sel.rarity}"><div class="big-icon">${sel.icon}</div><div class="info"><b>${sel.name}</b> <span class="rarity">${sel.rarity} ${sel.slot === 'consumable' ? 'consumable' : SLOT_LABEL[sel.slot as Slot].toLowerCase()}</span><p><i>${sel.desc}</i></p><p>${bonusText(sel)}</p>${compare(s, sel)}
      <div class="actions">${sel.slot === 'consumable' ? (sel.use?.damage ? '<small class="muted">Usable only in combat.</small>' : `<button class="primary" data-item="${sel.id}">USE</button>`) : `<button class="primary" data-equip="${sel.id}">EQUIP</button>`}</div></div></div>` : groups.length ? '<p class="muted center">Tap an item to inspect it.</p>' : ''}
  </main>${side(s)}</div>`;
}

export function shop(s: GameState, ui: UI) {
  const sellable = [...new Set(s.inventory)].map(id => item(id)!).filter(Boolean);
  return `${top(s)}<div class="layout"><main class="main"><h2>The Carrion Exchange</h2><p class="muted">“Everything here belonged to somebody brave.” New stock arrives as seals break.</p>
    <div class="tabs"><button class="${ui.shopTab === 'buy' ? 'on' : ''}" data-shoptab="buy">BUY</button><button class="${ui.shopTab === 'sell' ? 'on' : ''}" data-shoptab="sell">SELL</button></div>
    ${ui.shopTab === 'buy' ? `<div class="list"><div class="list-item"><div class="big-icon">▣</div><div class="info"><b>Supply Bundle</b><p>+2 supplies for the road. You have ${s.supplies}.</p></div><button data-act="buySupplies" ${s.gold < SUPPLY_PRICE ? 'disabled' : ''}>${SUPPLY_PRICE} ◈</button></div>
      ${shopStock(s).map(d => itemRow(d, `<button data-buy="${d.id}" ${s.gold < d.price ? 'disabled' : ''}>${d.price} ◈</button>`)).join('')}</div>`
      : sellable.length ? `<div class="list">${sellable.map(d => itemRow(d, `<button data-sell="${d.id}">+${sellPrice(d)} ◈</button>`)).join('')}</div>` : '<p class="muted">Nothing to sell. Equipped gear must be unequipped first.</p>'}
  </main>${side(s)}</div>`;
}

export function skills(s: GameState) {
  return `${top(s)}<div class="layout"><main class="main"><h2>The Forbidden Archive</h2><p class="muted">Master techniques copied from people who no longer exist.</p><div class="list">${SKILLS.map(x => `<div class="list-item"><div class="big-icon">${x.icon}</div><div class="info"><b>${x.name} · ${x.school}</b><p>${x.desc} Cooldown ${x.cooldown}${x.sanityCost ? ` · ${x.sanityCost} sanity` : ''}.</p></div>${s.skills.includes(x.id) ? '<span class="badge">KNOWN</span>' : `<button data-learn="${x.id}" ${s.gold < skillPrice(x.price) ? 'disabled' : ''}>${skillPrice(x.price)} ◈</button>`}</div>`).join('')}</div></main>${side(s)}</div>`;
}

export function board(s: GameState) {
  const avail = availableQuests(s);
  return `${top(s)}<div class="layout"><main class="main"><h2>Notice Board</h2><p class="muted">Contracts nailed over older contracts. Up to ${QUEST_LIMIT} at once.</p>
    <h3>Active (${s.quests.length}/${QUEST_LIMIT})</h3>
    ${s.quests.length ? `<div class="list">${s.quests.map(q => { const d = QUESTS.find(x => x.id === q.id)!; return `<div class="list-item quest-item ${q.done ? 'ready' : ''}"><div class="big-icon">${q.done ? '✔' : '✉'}</div><div class="info"><b>${d.title}</b><p>${d.text}</p><div class="bar thin"><div class="fill xp" style="width:${pct(q.progress, d.goal.count)}%"></div><span>${q.progress} / ${d.goal.count}</span></div></div>${q.done ? `<button class="primary" data-claim="${q.id}">CLAIM</button>` : ''}</div>` }).join('')}</div>` : '<p class="muted">No active contracts.</p>'}
    <h3 class="section">Available</h3>
    ${avail.length ? `<div class="list">${avail.map(d => `<div class="list-item"><div class="big-icon">✉</div><div class="info"><b>${d.title}</b> <span class="muted">— ${d.giver}</span><p>${d.text}</p><small class="gold">Reward: ${d.reward.gold} gold · ${d.reward.xp} XP${d.reward.item ? ` · ${item(d.reward.item)!.name}` : ''}</small></div><button data-accept="${d.id}" ${s.quests.length >= QUEST_LIMIT ? 'disabled' : ''}>ACCEPT</button></div>`).join('')}</div>` : '<p class="muted">No new contracts. Break more seals.</p>'}
  </main>${side(s)}</div>`;
}

export function journal(s: GameState, ui: UI) {
  const tab = ui.journalTab;
  const seen = ENEMIES.filter(e => s.bestiary[e.id]);
  return `${top(s)}<div class="layout"><main class="main"><h2>The Chronicle</h2>
    <div class="tabs">${(['quests', 'lore', 'bestiary'] as const).map(t => `<button class="${tab === t ? 'on' : ''}" data-jtab="${t}">${t.toUpperCase()}</button>`).join('')}</div>
    ${tab === 'quests' ? `<div class="chapters">${CHAPTERS.map((c, i) => `<article class="journal-entry ${i > s.chapter ? 'locked' : ''} ${i < s.chapter ? 'done' : ''}"><h3>${i <= s.chapter ? c.title : 'CHAPTER UNWRITTEN'}</h3><p>${i <= s.chapter ? c.text : 'The ink has not yet dried.'}</p>${i === s.chapter ? `<p class="objective">▸ ${c.objective}</p>` : i < s.chapter ? '<p class="good">✔ Completed</p>' : ''}</article>`).join('')}</div>
      <h3 class="section">Side Contracts</h3>${s.quests.map(q => { const d = QUESTS.find(x => x.id === q.id)!; return `<p>▸ ${d.title} — ${q.progress}/${d.goal.count}${q.done ? ' <span class="good">(ready)</span>' : ''}</p>` }).join('') || '<p class="muted">Visit the Notice Board in Veyrgard.</p>'}
      <p class="muted">Contracts completed: ${s.completedQuests.length}/${QUESTS.length}</p>` : ''}
    ${tab === 'lore' ? `<p class="muted">${s.lore.length}/${LORE.length} fragments recovered</p>${LORE.map(l => `<article class="journal-entry ${s.lore.includes(l[0]) ? '' : 'locked'}"><h3>${s.lore.includes(l[0]) ? l[0] : 'UNRECOVERED FRAGMENT'}</h3><p>${s.lore.includes(l[0]) ? l[1] : 'The ink moves when you try to read it. Find this fragment in the Dreadmarch.'}</p></article>`).join('')}` : ''}
    ${tab === 'bestiary' ? `<p class="muted">${seen.length}/${ENEMIES.length} horrors catalogued</p><div class="list">${ENEMIES.map(e => s.bestiary[e.id] ? `<div class="list-item"><div class="big-icon">${e.art ? `<img src="/art/${e.art}" alt="">` : e.icon}</div><div class="info"><b>${e.name}</b> <span class="muted">slain ×${s.bestiary[e.id]}</span><p>${e.lore}</p><small class="muted">HP ${e.hp} · Armor ${e.armor} · ${e.moves.join(', ')}</small></div></div>` : `<div class="list-item locked-item"><div class="big-icon">?</div><div class="info"><b>Unknown horror</b><p>Slay it to learn its nature.</p></div></div>`).join('')}</div>` : ''}
  </main>${side(s)}</div>`;
}

export function death(s: GameState) {
  const doomed = s.difficulty === 'Doomed';
  return `<div class="ending death"><div><div class="sigil">☠</div><h1>THE MARCH ENDS</h1><p>${esc(s.name)} falls on day ${s.day}, after ${s.kills} horrors slain and ${Math.min(4, s.chapter)} seals broken.</p>
    <p class="muted">${doomed ? 'On the Doomed path, death is final. This chronicle is erased.' : 'Mother Ilse can drag you back — but the dark keeps half your gold.'}</p>
    <div class="menu-stack">${doomed ? '' : '<button class="primary" data-act="revive">RISE AGAIN IN VEYRGARD</button>'}<button data-act="new">BEGIN ANOTHER CHRONICLE</button><button data-act="toTitle">MAIN MENU</button></div></div></div>`;
}

export const ENDINGS: Record<string, [string, string]> = {
  crown: ['THE NEW NOON', 'You sit upon the throne behind the eclipse. The sun rekindles — pale, obedient, yours. Veyrgard wakes to a morning that answers only to you, and never again will anyone cast three shadows. Or one.'],
  shatter: ['THE LONG NIGHT', 'You shatter the throne and the eclipse with it. No king will decide what morning means. The sky stays dark, but it is an honest dark, and the dead finally lie down. Veyrgard lights its lanterns and learns to live by them.'],
  return: ['THE WAYFARER RETURNS', 'You turn your back on the throne. The King Behind Noon, wearing your face, watches you go. In Veyrgard, the gates open for you. Somewhere, a version of you is still sitting on that throne. Perhaps it is kinder.'],
};
export function ending(s: GameState) {
  if (!s.ending || s.ending === 'pending') {
    return `<div class="ending" style="background-image:linear-gradient(#0009,#000),url('/art/boss_meridian.webp')"><div><div class="sigil">◐</div><h1>BEHIND NOON</h1><p class="story">The King falls to his knees. His face is yours — older, tired, relieved. Behind him stands an empty throne of cold light. “Someone must decide what morning means,” he whispers.</p>
      <div class="menu-stack"><button data-ending="crown">♔ TAKE THE THRONE</button><button data-ending="shatter">✹ SHATTER THE ECLIPSE</button><button data-ending="return">↩ WALK HOME</button></div></div></div>`;
  }
  const [t, text] = ENDINGS[s.ending];
  return `<div class="ending"><div><div class="sigil">✦</div><h1>${t}</h1><p class="story">${text}</p><p class="muted">Day ${s.day} · Level ${s.level} · ${s.kills} horrors slain · ${s.lore.length}/${LORE.length} lore</p>
    <div class="menu-stack"><button class="primary" data-act="epilogue">CONTINUE IN VEYRGARD</button><button data-act="share">➦ SHARE YOUR ENDING</button><button data-act="new">BEGIN ANOTHER CHRONICLE</button></div></div></div>`;
}
