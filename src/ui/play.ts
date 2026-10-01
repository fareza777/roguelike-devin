import { LOADOUT_MAX, SKILL_MAP } from '../data/skills';
import { ENDING_FRAMES, ENDING_LINES, ENDINGS } from '../data/story';
import { TOWN_MAP } from '../data/world';
import { item, stats } from '../engine/core';
import { canAfford, checkChance, checkDc, currentNode, getScene, speaker, visibleChoices } from '../engine/story';
import { icon } from '../icons';
import type { GameState, IntentKind } from '../types';
import { UI, barHtml, esc, fmt, itemIcon, statusChips, stillArt, vitals } from './common';

const INTENT_ICON: Record<IntentKind, string> = { attack: 'i_attack', heavy: 'i_heavy', dread: 'i_dread', guard: 'i_guard', afflict: 'i_afflict' };

function floats(s: GameState, ui: UI, target: 'enemy' | 'player') {
  return s.fx.filter(f => f.target === target).map((f, i) => `<span class="float ${f.kind}" data-key="fx-${ui.fxSeq}-${target}-${i}" style="animation-delay:${i * 0.16}s;left:${34 + ((i * 19) % 34)}%">${f.text}</span>`).join('');
}

export function combat(s: GameState, ui: UI) {
  const e = s.enemy!;
  const st = stats(s);
  const consumables = [...new Set(s.inventory.filter(id => item(id)?.slot === 'consumable'))];
  const hurt = s.fx.some(f => f.target === 'player' && (f.kind === 'dmg' || f.kind === 'status'));
  const hitEnemy = s.fx.some(f => f.target === 'enemy');
  const flee = e.rank === 'boss' || s.fight?.noFlee;
  const enraged = e.rank === 'boss' && e.hp < e.maxHp / 2;
  const seq = ui.fxSeq % 2 ? 'a' : 'b';
  return `<section class="combat ${hurt ? `hurt-${seq}` : ''}">
    <div class="foe rank-${e.rank} ${enraged ? 'enraged' : ''}" ${e.art ? `style="--art:url('/art/${e.art}')"` : ''}>
      <div class="foe-head"><div><small class="rank">${e.rank === 'normal' ? 'HOSTILE' : e.rank.toUpperCase()}</small><h2>${esc(e.name)}</h2></div><span class="lvl-b">Lv ${e.lvl}</span></div>
      <div class="portrait ${e.art ? 'has-art' : 'aura'} ${hitEnemy ? `hit-${seq}` : ''}">
        ${e.art ? '' : `<span class="ring"></span><span class="ring r2"></span><span class="sym">${icon(e.icon)}</span>`}
        ${floats(s, ui, 'enemy')}
      </div>
      <div class="intent intent-${e.intent.kind} ${e.status.stun ? 'stunned' : ''}" data-key="intent-${e.turn}-${e.intent.kind}">${e.status.stun ? `${icon('stun')}<b>STUNNED</b>` : `${icon(INTENT_ICON[e.intent.kind])}<b>${e.intent.label}</b>${e.intent.value ? `<i>~${e.intent.value}</i>` : ''}`}</div>
      ${barHtml('enemy', e.hp, e.maxHp, `${e.hp} / ${e.maxHp}${e.armor ? ` · ${icon('armor')}${e.armor}` : ''}`)}
      <div class="chips">${statusChips(e.status)}${enraged ? `<span class="chip status-burn">${icon('burn')}<b>enraged</b></span>` : ''}</div>
    </div>
    <div class="you"><div class="floats">${floats(s, ui, 'player')}</div>${vitals(s)}
      <div class="chips">${statusChips(s.status)}${s.sanity <= 0 ? `<span class="chip status-weak">${icon('weak')}<b>unraveled +25% dmg taken</b></span>` : ''}${s.companion && s.companion !== 'None' ? `<span class="chip comp">${icon('e_hound')}<b>${esc(s.companion)}</b>${'●'.repeat(s.companionCharge)}${'○'.repeat(3 - s.companionCharge)}</span>` : ''}</div>
    </div>
    <div class="cactions">
      <button class="cbtn primary" data-act="attack"><span>${icon('combat')}</span><b>Attack</b><small>${st.damage}–${st.damage + 3 + Math.floor(s.level / 3)} dmg</small></button>
      <button class="cbtn" data-act="defend"><span>${icon('shield')}</span><b>Defend</b><small>−60% dmg</small></button>
      <button class="cbtn" data-act="flee" ${flee ? 'disabled' : ''}><span>${icon('boot')}</span><b>Retreat</b><small>${flee ? 'Impossible' : `${st.flee}%`}</small></button>
    </div>
    <div class="skillbar">${s.loadout.slice(0, LOADOUT_MAX).map(id => {
      const k = SKILL_MAP.get(id)!;
      const cd = s.cooldowns[id] ?? 0;
      const noSan = s.sanity < k.sanityCost;
      return `<button class="skill ${cd ? 'cd' : ''}" data-skill="${id}" ${cd > 0 || noSan ? 'disabled' : ''} title="${k.desc}"><span class="si">${icon(k.icon)}</span><b>${k.name}</b><small>${cd > 0 ? `${cd} turn${cd > 1 ? 's' : ''}` : k.sanityCost ? `${k.sanityCost} sanity` : k.hpCost ? `${k.hpCost}% hp` : 'ready'}</small>${cd ? `<em class="cdn">${cd}</em>` : ''}</button>`;
    }).join('') || '<p class="muted center">No skills equipped. Visit the Hero screen.</p>'}</div>
    ${consumables.length ? `<div class="itembar">${consumables.map(id => { const d = item(id)!; const n = s.inventory.filter(v => v === id).length; return `<button class="ibtn r-${d.rarity}" data-item="${id}" title="${d.name}: ${d.desc}"><span>${icon(d.icon)}</span>${n > 1 ? `<em>${n}</em>` : ''}<small>${esc(d.name)}</small></button>` }).join('')}</div>` : ''}
    <div class="clog">${s.log.slice(0, 6).map((x, i) => `<div class="log ${x.tone}" style="opacity:${1 - i * 0.14}">${x.text}</div>`).join('')}</div>
  </section>`;
}

export function event(s: GameState) {
  const e = s.event!;
  const tag = (e.tags ?? []).filter(t => t !== 'any' && t !== 'wild' && t !== 'landmark').join(' ');
  return `<section class="event-stage"><img class="d-art" src="${stillArt(e.art || tag || e.id)}" alt=""><div class="d-shade"></div><div class="ev-card panel">
    <div class="ev-ic">${icon(e.icon)}</div><h1>${esc(e.title)}</h1><p class="story">${esc(e.text)}</p>
    <div class="choices">${e.choices.map((c, i) => {
      const ok = canAfford(s, c);
      const chance = c.check ? `<span class="chk">${c.check.stat.toUpperCase()} ${checkChance(s, c.check.stat, c.check.dc ?? checkDc(s))}%</span>` : '';
      const cost = [c.cost?.supplies ? `${icon('supplies')}${c.cost.supplies}` : '', c.cost?.gold ? `${icon('gold')}${c.cost.gold}` : '', c.cost?.hp ? `${icon('heart')}${c.cost.hp}%` : ''].filter(Boolean).join(' ');
      return `<button class="choice" data-choice="${i}" ${ok ? '' : 'disabled'}><span class="cl"><b>${c.label}</b>${chance}${cost ? `<span class="cost">${cost}</span>` : ''}</span><small>${c.text}${ok ? '' : ' — you cannot afford this.'}</small></button>`;
    }).join('')}</div></div></section>`;
}

export function reward(s: GameState, adOffer = false) {
  const r = s.reward!;
  return `<section class="overlay-page reward"><div class="rw-card panel">
    <div class="rw-ic">${icon(r.icon ?? 'trophy')}<i class="burst"></i></div><h1>${esc(r.title)}</h1>
    <div class="rw-stats">${r.gold ? `<span class="rs">${icon('gold')}<b>${r.gold > 0 ? '+' : ''}${r.gold}</b> gold</span>` : ''}${r.xp ? `<span class="rs">${icon('xp')}<b>+${r.xp}</b> XP</span>` : ''}</div>
    ${r.lines.map(l => `<p class="log ${/Level \d+!/.test(l) ? 'epic' : 'plain'}">${esc(l)}</p>`).join('')}
    ${r.items.length ? `<h3>Spoils</h3><div class="rw-items">${r.items.map((id, i) => { const d = item(id)!; return `<div class="ri r-${d.rarity}" style="animation-delay:${0.15 + i * 0.09}s" title="${esc(d.name)}">${itemIcon(d)}<b>${esc(d.name)}</b><small>${d.rarity}</small></div>` }).join('')}</div>` : ''}
    ${adOffer && !r.doubled && r.gold > 0 ? `<button class="btn ad wide" data-act="adDouble">${icon('gold')}<span>Double the gold<small>Watch a short video · optional</small></span></button>` : ''}
    <button class="btn primary wide" data-act="closeReward">Continue</button></div></section>`;
}

export function dialogue(s: GameState, ui: UI) {
  const sc = s.scene!;
  const def = getScene(sc.id);
  const node = currentNode(s);
  if (!def || !node) return '';
  const sp = speaker(node.who);
  const choices = visibleChoices(s, node);
  const narr = !node.who || node.who === 'narrator';
  const art = def.art ?? 'splash.webp';
  const key = `${sc.id}:${node.id}`;
  const name = fmt(s, sp.name);
  return `<section class="dialogue">
    <img class="d-art" src="${stillArt(art)}" alt=""><div class="d-shade"></div>
    <div class="d-stage">
      ${narr ? '' : `<div class="d-speaker" data-key="sp-${node.who}" style="--c:${sp.color ?? '#e7c98f'}"><span class="d-ic">${icon(sp.icon)}</span><div><b>${name}</b>${sp.title ? `<small>${fmt(s, sp.title)}</small>` : ''}</div></div>`}
      <div class="d-box panel ${narr ? 'narr' : ''}" data-key="dbox">
        <p class="d-text" data-static data-typed="${key}" data-full="${esc(fmt(s, node.text))}"></p>
        ${sc.log.length ? `<div class="d-eff" data-key="eff-${key}">${sc.log.map(l => `<span class="eff">${esc(l)}</span>`).join('')}</div>` : ''}
        <div class="d-choices ${ui.typed === key ? '' : 'wait'}" data-key="dch-${key}">
          ${choices.length ? choices.map((c, i) => `<button class="dchoice" data-scene-choice="${i}" style="animation-delay:${i * 0.07}s">${c.check ? `<span class="chk">${c.check.stat.toUpperCase()} ${checkChance(s, c.check.stat, c.check.dc)}%</span>` : ''}${esc(fmt(s, c.label))}</button>`).join('')
            : `<button class="btn primary dnext" data-act="sceneNext">${icon('back')}Continue</button>`}
        </div>
      </div>
      <button class="skip-typing" data-act="skipType" aria-label="Skip text"></button>
    </div>
  </section>`;
}

export function death(s: GameState, adOffer = false) {
  const doomed = s.difficulty === 'Doomed';
  return `<section class="finale death"><div class="fin-in"><div class="fin-ic">${icon('skull')}</div><h1>The March Ends</h1>
    <p class="story">${esc(s.name)} falls on day ${s.day}, after ${s.kills} horrors slain.</p>
    <p class="muted">${doomed ? 'On the Doomed path, death is final. This chronicle is erased.' : 'The Lantern Court’s runners can drag you back — but the dark keeps half your gold.'}</p>
    <div class="menu-stack">${adOffer && !doomed ? `<button class="btn ad big" data-act="adRevive">${icon('heart')}<span>Rise where you fell<small>Watch a short video · keep everything</small></span></button>` : ''}${doomed ? '' : `<button class="btn primary big" data-act="revive">${icon('heart')}<span>Rise again in Veyrgard</span></button>`}<button class="btn big" data-act="new">${icon('quest')}<span>Begin another chronicle</span></button><button class="btn" data-act="toTitle">Main menu</button></div></div></section>`;
}

export function ending(s: GameState, ui: UI) {
  const id = s.ending ?? 'return';
  const e = ENDINGS[id];
  const lines = ENDING_LINES[id] ?? [e.text, e.epilogue];
  const i = Math.max(0, Math.min(ui.endSlide, lines.length - 1));
  const last = i >= lines.length - 1;
  return `<section class="cine">
    <img class="cine-art" src="${stillArt(ENDING_FRAMES[i] ?? 'meridian')}" alt="">
    <div class="cine-shade"></div>
    <div class="cine-copy">
      <small class="kicker">ENDING · ${i + 1}/${lines.length}</small>
      <h1>${esc(e.title)}</h1>
      <p class="story">${esc(lines[i])}</p>
      ${last ? `<p class="muted fine">Day ${s.day} · Level ${s.level} · ${s.kills} horrors slain · ${s.lore.length} lore · ${s.completedQuests.length} contracts</p>
        <div class="menu-stack"><button class="btn primary big" data-act="epilogue">${icon('compass')}<span>Continue in ${esc(TOWN_MAP.get('veyrgard')!.name)}</span></button><button class="btn" data-act="share">${icon('share')}Share your ending</button><button class="btn" data-act="new">Begin another chronicle</button></div>`
        : `<div class="cine-nav"><div class="dots">${lines.map((_, n) => `<i class="${n === i ? 'on' : ''}"></i>`).join('')}</div><button class="btn primary" data-act="nextEnding">Next</button></div>`}
    </div>
  </section>`;
}

