import { ENEMIES } from '../data/enemies';
import { SETS } from '../data/items';
import { QUESTS, QUEST_MAP } from '../data/quests';
import { LOADOUT_MAX, SKILL_MAP, TALENTS, TREES } from '../data/skills';
import { ACTS, ENDINGS, LORE, MAIN } from '../data/story';
import { DUNGEONS, TOWNS } from '../data/world';
import { SLOTS, SLOT_LABEL, item, stats } from '../engine/core';
import { canUse } from '../engine/combat';
import { canLearnTalent } from '../engine/town';
import { currentStep } from '../engine/story';
import { icon } from '../icons';
import type { GameState, ItemDef, Meta } from '../types';
import { UI, SLOT_ICON, barHtml, compareChips, emptyState, esc, itemIcon, kindName, pct, setInfo, statChips } from './common';

const XP_RING = (s: GameState) => `<span class="xpring big" style="--p:${pct(s.xp, s.xpNext)}"><span class="hero-ic">${icon('hero')}</span></span>`;

export function character(s: GameState, ui: UI) {
  const st = stats(s);
  const attr = (k: 'vigor' | 'will' | 'cunning', label: string, hint: string, ic: string) => `<div class="panel attr"><span class="ai">${icon(ic)}</span><h3>${label}</h3><div class="big">${st[k]}</div><small>${hint}</small>${s.statPoints ? `<button class="btn plus" data-stat="${k}" aria-label="Raise ${label}">+</button>` : ''}</div>`;
  const trees = TREES.map(tree => `<div class="tree"><h3>${tree}</h3>${TALENTS.filter(t => t.tree === tree).map((t, i) => {
    const known = s.talents.includes(t.id);
    const can = canLearnTalent(s, t.id);
    return `${i ? '<div class="tlink"></div>' : ''}<button class="talent ${known ? 'known' : can ? 'can' : ''}" data-talent="${t.id}" ${known || !can ? 'disabled' : ''}><span class="ti">${icon(t.icon)}</span><span class="tt"><b>${t.name}</b><small>${t.desc}</small></span><em>${known ? 'LEARNED' : `T${t.tier}`}</em></button>`;
  }).join('')}</div>`).join('');
  const known = s.skills.map(id => SKILL_MAP.get(id)!).filter(Boolean);
  const gridStats: [string, string | number][] = [['Damage', `${st.damage}–${st.damage + 3 + Math.floor(s.level / 3)}`], ['Armor', st.armor], ['Critical', `${st.crit}%`], ['Dodge', `${st.dodge}%`], ['Escape', `${st.flee}%`], ['Lifesteal', `${st.lifesteal}%`], ['Thorns', st.thorns], ['Luck', `${st.luck}%`], ['Corruption', s.corruption ? `${s.corruption} (+${st.corruptionBonus}% dmg)` : 0], ['Kills', s.kills], ['Elites', s.elites], ['Deaths', s.deaths]];
  return `<section class="page-in hero">
    <div class="hero-card panel">${XP_RING(s)}<div class="hc-main"><h2>${esc(s.name)}</h2><p class="muted">${esc(s.origin)} · ${esc(s.path)} · ${s.difficulty}</p>
      ${barHtml('xp', s.xp, s.xpNext, `LEVEL ${s.level} · ${s.xp} / ${s.xpNext} XP`)}
      <div class="chips"><span class="chip">${icon('e_hound')}<b>${esc(s.companion)}</b></span>${s.flags.companion_trust ? '<span class="chip gold-c"><b>Bonded</b></span>' : ''}${s.corruption ? `<span class="chip status-burn">${icon('corruption')}<b>Corrupted ${s.corruption}</b></span>` : ''}</div></div></div>
    <div class="tabs"><button class="${ui.charTab === 'attributes' ? 'on' : ''}" data-chartab="attributes">Attributes${s.statPoints ? ` <em class="dot">${s.statPoints}</em>` : ''}</button><button class="${ui.charTab === 'talents' ? 'on' : ''}" data-chartab="talents">Talents${s.talentPoints ? ` <em class="dot">${s.talentPoints}</em>` : ''}</button><button class="${ui.charTab === 'skills' ? 'on' : ''}" data-chartab="skills">Skills</button></div>
    ${ui.charTab === 'attributes' ? `${s.statPoints ? `<p class="callout">${s.statPoints} attribute point${s.statPoints > 1 ? 's' : ''} to spend.</p>` : ''}
      <div class="grid3">${attr('vigor', 'Vigor', 'Health & damage', 'heart')}${attr('will', 'Will', 'Sanity & burning', 'sanity')}${attr('cunning', 'Cunning', 'Crit, dodge, checks', 'eye')}</div>
      <div class="panel statgrid">${gridStats.map(([k, v]) => `<span><em>${k}</em><b>${v}</b></span>`).join('')}</div>${setInfo(s)}`
    : ui.charTab === 'talents' ? `<p class="muted">${s.talentPoints} talent point${s.talentPoints === 1 ? '' : 's'} available. Each tier requires the one above it.</p><div class="trees">${trees}</div>`
    : `<h3 class="sec-h">Combat loadout <small class="muted">${s.loadout.length}/${LOADOUT_MAX}</small></h3>
      <div class="loadout">${Array.from({ length: LOADOUT_MAX }, (_, i) => { const id = s.loadout[i]; const k = id ? SKILL_MAP.get(id) : null; return `<button class="slotbtn ${k ? 'on' : ''}" ${k ? `data-loadout="${id}"` : 'disabled'}>${k ? `${icon(k.icon)}<small>${k.name}</small>` : '<small>Empty</small>'}</button>` }).join('')}</div>
      <p class="muted fine">Tap a learned skill to add or remove it from your loadout. Learn more from trainers in towns.</p>
      <div class="list">${known.map(k => `<div class="irow ${s.loadout.includes(k.id) ? 'equipped' : ''}" data-loadout="${k.id}"><span class="iicon r-rare">${icon(k.icon)}</span><div class="imain"><div class="iname"><b>${k.name}</b><em class="cnt">${k.school}</em></div><small class="idesc">${k.desc}</small><div class="itag">Cooldown ${k.cooldown}${k.sanityCost ? ` · ${k.sanityCost} sanity` : ''}${k.hpCost ? ` · ${k.hpCost}% health` : ''}</div></div><div class="iact"><span class="badge ${s.loadout.includes(k.id) ? 'on' : ''}">${s.loadout.includes(k.id) ? 'EQUIPPED' : 'TAP TO EQUIP'}</span></div></div>`).join('')}</div>`}
  </section>`;
}

export function inventory(s: GameState, ui: UI) {
  const st = stats(s);
  const groups = new Map<string, number>();
  s.inventory.forEach(i => groups.set(i, (groups.get(i) ?? 0) + 1));
  const isGear = (d: ItemDef) => d.slot !== 'consumable' && d.slot !== 'junk';
  const entries = [...groups.entries()].map(([id, n]) => ({ d: item(id)!, n })).filter(g => g.d && (ui.invFilter === 'all' || (ui.invFilter === 'gear' ? isGear(g.d) : g.d.slot === ui.invFilter)))
    .sort((a, b) => (isGear(b.d) ? 1 : 0) - (isGear(a.d) ? 1 : 0) || ['common', 'rare', 'epic', 'relic', 'mythic'].indexOf(b.d.rarity) - ['common', 'rare', 'epic', 'relic', 'mythic'].indexOf(a.d.rarity) || a.d.name.localeCompare(b.d.name));
  return `<section class="page-in inv">
    <div class="doll panel">${(SLOTS).map(slot => {
      const id = s.equipment[slot];
      const d = id ? item(id) : null;
      return `<button class="slot ${d ? `r-${d.rarity}` : 'empty'}" ${d ? `data-sheet="${id}" data-from="equip" data-slot="${slot}"` : 'disabled'} aria-label="${SLOT_LABEL[slot]}"><span class="sic">${icon(d ? d.icon : SLOT_ICON[slot])}</span><small>${d ? esc(d.name) : SLOT_LABEL[slot]}</small></button>`;
    }).join('')}</div>
    <div class="panel quickstats"><span><em>Damage</em><b>${st.damage}</b></span><span><em>Armor</em><b>${st.armor}</b></span><span><em>Crit</em><b>${st.crit}%</b></span><span><em>Dodge</em><b>${st.dodge}%</b></span><span><em>Health</em><b>${st.maxHp}</b></span><span><em>Sanity</em><b>${st.maxSanity}</b></span></div>
    ${setInfo(s)}
    <div class="row-between"><h3 class="sec-h">Pack <small class="muted">${s.inventory.length} items</small></h3></div>
    <div class="chips-row">${([['all', 'All'], ['gear', 'Gear'], ['consumable', 'Supplies'], ['junk', 'Valuables']] as const).map(([k, l]) => `<button class="pill ${ui.invFilter === k ? 'on' : ''}" data-invfilter="${k}">${l}</button>`).join('')}</div>
    ${entries.length ? `<div class="bag">${entries.map(({ d, n }) => `<button class="bag-item r-${d.rarity}" data-sheet="${d.id}" data-from="bag" title="${esc(d.name)}"><span>${icon(d.icon)}</span>${n > 1 ? `<em>${n}</em>` : ''}<small>${esc(d.name)}</small></button>`).join('')}</div>` : emptyState('bag', 'Your pack is empty.')}
  </section>`;
}

export function sheet(s: GameState, ui: UI, canSellHere: boolean, sellPrice: (d: ItemDef) => number, stockPrice?: number) {
  const sh = ui.sheet;
  if (!sh) return '';
  const d = item(sh.id);
  if (!d) return '';
  const owned = sh.from === 'equip' ? s.equipment[sh.slot!] === sh.id : s.inventory.includes(sh.id);
  if (sh.from !== 'shop' && !owned) return '';
  const gear = d.slot !== 'consumable' && d.slot !== 'junk';
  let actions = '';
  if (sh.from === 'equip') actions = `<button class="btn primary" data-unequip="${sh.slot}">Unequip</button>`;
  else if (sh.from === 'bag') {
    if (gear) actions = `<button class="btn primary" data-equip="${d.id}">Equip</button>`;
    else if (d.slot === 'consumable') actions = canUse(s, d.id) ? `<button class="btn primary" data-item="${d.id}">Use</button>` : '<small class="muted">Cannot be used here.</small>';
    if (canSellHere && sellPrice(d) > 0) actions += `<button class="btn" data-sell="${d.id}">Sell · ${sellPrice(d)}${icon('gold')}</button>`;
  } else actions = `<button class="btn primary" data-buy="${d.id}" ${s.gold < d.price ? 'disabled' : ''}>Buy · ${d.price}${icon('gold')}</button>`;
  const set = d.set ? SETS[d.set] : null;
  const setOwned = d.set ? Object.values(s.equipment).filter(id => id && item(id)?.set === d.set).length : 0;
  return `<div class="sheet-back" data-act="closeSheet"></div><div class="sheet r-${d.rarity}" data-key="sheet"><button class="sheet-x" data-act="closeSheet" aria-label="Close">${icon('close')}</button>
    <div class="sh-head">${itemIcon(d, 'big')}<div><h3>${esc(d.name)}</h3><div class="itag"><span class="rar">${d.rarity}</span> · ${kindName(d)} · Tier ${d.tier + 1}</div></div></div>
    <p class="sh-desc">${d.desc}</p>${gear ? `<div class="chips">${statChips(d.bonus)}</div>${compareChips(s, d)}` : ''}
    ${set ? `<div class="setline"><b>${set.name}</b> <span class="muted">${setOwned}/4 equipped</span><small>${set.blurb}</small></div>` : ''}
    <div class="sh-actions">${actions}</div>${stockPrice ? '' : ''}</div>`;
}

export function journal(s: GameState, ui: UI, meta: Meta) {
  const tab = ui.journalTab;
  const step = currentStep(s);
  const seen = ENEMIES.filter(e => s.bestiary[e.id]);
  const acts = ACTS.map(a => {
    const steps = MAIN.filter(m => m.act === a.id);
    const idx = steps.map(m => MAIN.indexOf(m));
    const state = idx.every(i => i < s.main) ? 'done' : idx.some(i => i <= s.main) ? 'now' : 'locked';
    return `<article class="act ${state}"><h3>${state === 'locked' ? `Act ${a.id || 'I'} · ???` : a.title}</h3>${state === 'locked' ? '<p class="muted">The ink has not yet dried.</p>' : `<p class="muted">${a.blurb}</p>${steps.map(m => { const i = MAIN.indexOf(m); return i > s.main ? '' : `<div class="mstep ${i < s.main ? 'done' : 'cur'}"><span class="mi">${i < s.main ? icon('trophy') : icon('quest')}</span><div><b>${m.title}</b><p>${m.text}</p>${i === s.main ? `<p class="obj">▸ ${m.obj}</p>` : ''}</div></div>` }).join('')}`}</article>`;
  }).join('');
  const tabs: [string, string][] = [['story', 'Story'], ['contracts', 'Contracts'], ['lore', 'Lore'], ['bestiary', 'Bestiary'], ['atlas', 'Atlas'], ['endings', 'Endings']];
  return `<section class="page-in journal"><div class="page-head"><h2>${icon('journal')}The Chronicle</h2></div>
    <div class="tabs scroll">${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-jtab="${k}">${l}</button>`).join('')}</div>
    ${tab === 'story' ? `<div class="panel objective now"><span class="oi">${icon('quest')}</span><div><small>CURRENT OBJECTIVE · ${esc(ACTS[step.act].title)}</small><h3>${esc(step.title)}</h3><p>${esc(step.obj)}</p>${s.run ? '' : `<button class="btn" data-act="openMap">${icon('world')}Show on the atlas</button>`}</div></div><div class="acts">${acts}</div>` : ''}
    ${tab === 'contracts' ? `<h3 class="sec-h">Active (${s.quests.length})</h3><div class="list">${s.quests.map(q => { const d = QUEST_MAP.get(q.id)!; return `<div class="quest ${q.done ? 'ready' : ''}"><span class="qi">${icon(q.done ? 'trophy' : 'quest')}</span><div class="qm"><b>${esc(d.title)}</b><small>${esc(d.giver)} · ${esc(TOWNS.find(t => t.id === d.town)!.name)}</small><p>${esc(d.text)}</p><div class="bar bar-xp thin"><div class="fill" style="width:${(q.progress / d.goal.count) * 100}%"></div><span>${d.goal.label}: ${q.progress}/${d.goal.count}</span></div></div></div>` }).join('') || emptyState('notice', 'Visit a notice board in any town.')}</div>
      <p class="muted center">Contracts completed: ${s.completedQuests.length} / ${QUESTS.length}</p>` : ''}
    ${tab === 'lore' ? `<p class="muted">${s.lore.length} / ${LORE.length} fragments recovered</p><div class="list">${LORE.map(l => `<article class="lore ${s.lore.includes(l[0]) ? '' : 'locked'}"><h3>${s.lore.includes(l[0]) ? l[0] : 'Unrecovered fragment'}</h3><p>${s.lore.includes(l[0]) ? l[1] : 'The ink moves when you try to read it. Find this fragment in the wilds.'}</p></article>`).join('')}</div>` : ''}
    ${tab === 'bestiary' ? `<p class="muted">${seen.length} / ${ENEMIES.length} horrors catalogued</p><div class="list">${ENEMIES.map(e => s.bestiary[e.id] ? `<div class="irow"><span class="iicon r-rare">${icon(e.icon)}</span><div class="imain"><div class="iname"><b>${esc(e.name)}</b><em class="cnt">slain ×${s.bestiary[e.id]}</em></div><small class="idesc">${esc(e.lore)}</small><div class="itag">${e.role} · ${e.tags.join(' ')}</div></div></div>` : `<div class="irow locked"><span class="iicon">${icon('skull')}</span><div class="imain"><b>Unknown horror</b><small class="idesc">Slay it to learn its nature.</small></div></div>`).join('')}</div>` : ''}
    ${tab === 'atlas' ? `<h3 class="sec-h">Settlements</h3><div class="list">${TOWNS.map(t => { const v = s.world.visited.includes(t.id); return `<div class="irow ${v ? '' : 'locked'}"><span class="iicon r-${t.kind === 'city' ? 'epic' : 'common'}">${icon(t.kind === 'city' ? 'm_city' : 'm_town')}</span><div class="imain"><b>${v ? esc(t.name) : s.world.known.includes(t.id) ? esc(t.name) : '???'}</b><small class="idesc">${v ? esc(t.subtitle) : 'Not yet visited'}</small></div>${v ? '<span class="badge on">VISITED</span>' : ''}</div>` }).join('')}</div>
      <h3 class="sec-h">Dungeons</h3><div class="list">${DUNGEONS.map(d => { const k = s.world.known.includes(d.id); return `<div class="irow ${k ? '' : 'locked'}"><span class="iicon r-${d.mainBoss ? 'relic' : 'rare'}">${icon(d.icon ?? 'm_dungeon')}</span><div class="imain"><b>${k ? esc(d.name) : '???'}</b><small class="idesc">${k ? `Level ${d.lvl} · ${d.floors} floors` : 'Undiscovered'}</small></div>${s.cleared.includes(d.id) ? '<span class="badge on">CLEARED</span>' : ''}</div>` }).join('')}</div>` : ''}
    ${tab === 'endings' ? `<p class="muted">${meta.endings.length} / ${Object.keys(ENDINGS).length} endings found</p><div class="list">${Object.entries(ENDINGS).map(([k, e]) => `<article class="lore ${meta.endings.includes(k) ? '' : 'locked'}"><h3>${meta.endings.includes(k) ? e.title : 'Undiscovered ending'}</h3><p>${meta.endings.includes(k) ? esc(e.text) : 'Somewhere at the end of the road, a choice you have not yet made.'}</p></article>`).join('')}</div>` : ''}
  </section>`;
}

