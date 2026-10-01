import { DUNGEON_MAP, LANDMARK_MAP, TOWN_MAP, TOWN_SCHOOLS } from '../data/world';
import { SKILLS } from '../data/skills';
import { MAIN } from '../data/story';
import { personaUrl } from '../art/mount';
import { item, upgradeCost, canUpgrade, MAX_UPGRADE, splitId, SLOT_LABEL, zoneAt, baseItem } from '../engine/core';
import { onEntrance, onExit, dungeonProgress } from '../engine/dungeon';
import { QUEST_LIMIT, availableQuests, claimable, cond, questDef } from '../engine/quests';
import { currentStep } from '../engine/story';
import {
  SUPPLY_PRICE, buyPrice, rankUpCost, ownedCompanions, sigilCost, canSell, cleanseCost, innCost, roundCost, sellPrice, shopStock, schoolsHere, skillPrice,
} from '../engine/town';
import { canFastTravel, canSail, currentPoi, ferryCost, ferryTargets, objectiveTarget, travelCost } from '../engine/world';
import { TERRAIN_NAME, tileAt } from '../engine/worldgen';
import { icon } from '../icons';
import type { GameState, ItemDef, Slot } from '../types';
import { UI, compareChips, emptyState, esc, itemIcon, kindName, statChips } from './common';
import { locBar } from './shell';

const dirBtn = (d: number, cls: string, label: string) => `<button class="dbtn ${cls}" data-dir="${d}" aria-label="${label}"><svg viewBox="0 0 24 24"><path d="${['M8 4l8 8-8 8', 'M4 8l8 8 8-8', 'M16 4l-8 8 8 8', 'M4 16l8-8 8 8'][d]}"/></svg></button>`;
const dpad = (mid: string) => `<div class="dpad" role="group" aria-label="Movement">${dirBtn(3, 'up', 'Move up')}${dirBtn(2, 'left', 'Move left')}<div class="dmid">${mid}</div>${dirBtn(0, 'right', 'Move right')}${dirBtn(1, 'down', 'Move down')}</div>`;
const act = (cls: string, act: string, ic: string, label: string, sub = '', dis = false) => `<button class="abtn ${cls}" data-act="${act}" ${dis ? 'disabled' : ''}><span class="ai">${icon(ic)}</span><span class="al">${label}${sub ? `<small>${sub}</small>` : ''}</span></button>`;

function logCaption(s: GameState, ui: UI) {
  const l = s.log[0];
  return l ? `<div class="caption ${l.tone}" data-key="cap-${ui.logSeq}">${l.text}</div>` : '';
}

export function world(s: GameState, ui: UI) {
  const z = zoneAt(s.world.x, s.world.y);
  const obj = objectiveTarget(s);
  const step = currentStep(s);
  const poi = currentPoi(s);
  const tile = tileAt(s.world.x, s.world.y);
  const dist = obj ? Math.abs(obj.pos[0] - s.world.x) + Math.abs(obj.pos[1] - s.world.y) : 0;
  let enter = act('ghost', 'noop', 'compass', 'Enter', 'Stand on a place', true);
  if (poi?.kind === 'dungeon') {
    const d = DUNGEON_MAP.get(poi.id)!;
    enter = act('primary pulse', 'enterPoi', d.icon ?? 'm_dungeon', `Enter`, d.name.replace(/^The /, ''));
  } else if (poi?.kind === 'town') enter = act('primary', 'enterPoi', 'm_city', 'Enter', TOWN_MAP.get(poi.id)!.name);
  else if (poi?.kind === 'landmark') { const lm = LANDMARK_MAP.get(poi.id)!; enter = act('primary', 'enterPoi', lm.icon, 'Approach', lm.name) }
  const potion = s.inventory.some(i => { const u = item(i)?.use; return !!u && (u.hp || u.hpPct) && !u.damage });
  return `<section class="explore world">
    ${locBar(esc(z.name), `Recommended Lv ${z.lvl} · ${TERRAIN_NAME[tile] ?? ''} · Day ${s.day}`, obj ? `${esc(step.title)} <i>· ${esc(obj.name)} ${dist} tiles</i>` : esc(step.title))}
    <div class="mapwrap"><div class="canvas-host" id="mapmount" data-static></div>${logCaption(s, ui)}</div>
    <div class="deck">
      ${dpad(`<button class="dcenter" data-act="wait" aria-label="Wait">${icon('hourglass')}</button>`)}
      <div class="actions">
        ${enter}
        ${act('', 'campWorld', 'campfire', 'Camp', '1 supply', s.supplies < 1)}
        ${act('', 'quickHeal', 'c_hp', 'Potion', '', !potion)}
        ${act('', 'openMap', 'world', 'Atlas')}
      </div>
    </div>
  </section>`;
}

export function dungeon(s: GameState, ui: UI) {
  const p = dungeonProgress(s);
  const step = currentStep(s);
  const canLeave = onEntrance(s) || onExit(s);
  const potion = s.inventory.some(i => { const u = item(i)?.use; return !!u && (u.hp || u.hpPct) && !u.damage });
  const light = s.inventory.some(i => !!item(i)?.use?.light);
  return `<section class="explore dungeon">
    ${locBar(esc(p.name), `Depth ${p.floor}/${p.floors} · Recommended Lv ${p.def.lvl} · ${s.run!.keys ? `${icon('key')}×${s.run!.keys} · ` : ''}${s.run!.sigil ? `Sigil · ` : ''}${s.run!.torch > 0 ? `Torch ${s.run!.torch}` : 'Dim light'}`, p.def.mainBoss ? esc(step.title) : undefined)}
    <div class="mapwrap"><div class="canvas-host" id="mapmount" data-static></div>${logCaption(s, ui)}</div>
    <div class="deck">
      ${dpad(`<button class="dcenter" data-act="searchDungeon" aria-label="Search">${icon('secret')}</button>`)}
      <div class="actions">
        ${act('', 'searchDungeon', 'secret', 'Search', 'Find secrets')}
        ${act('', 'quickHeal', 'c_hp', 'Potion', '', !potion)}
        ${act('', 'quickLight', 'c_torch', 'Torch', '', !light)}
        ${act(canLeave ? 'primary' : 'ghost', 'leaveDungeon', 'back', 'Leave', canLeave ? 'Exit now' : 'At stairs/portal', !canLeave)}
      </div>
    </div>
  </section>`;
}

const SERVICE_META: Record<string, { ic: string; label: string; go: string }> = {
  inn: { ic: 'inn', label: 'Inn & Tavern', go: 'inn' }, shop: { ic: 'shop', label: 'Market', go: 'shop' }, smithy: { ic: 'smith', label: 'Smithy', go: 'smithy' },
  wardhouse: { ic: 'wardhouse', label: 'Wardhouse', go: 'wardhouse' }, harbor: { ic: 'm_ship', label: 'Harbor', go: 'harbor' }, board: { ic: 'notice', label: 'Notice Board', go: 'board' }, trainer: { ic: 'skills', label: 'Trainer', go: 'skills' },
};

export function town(s: GameState) {
  const t = TOWN_MAP.get(s.town!)!;
  const step = currentStep(s);
  const ready = claimable(s, t.id).length;
  const avail = availableQuests(s, t.id).length;
  const sub = (id: string) => ({
    inn: `Rest · ${innCost(s)} gold${t.services.includes('tavern') ? ' · rumors' : ''}`, shop: 'Buy, sell, supplies', smithy: 'Reinforce your gear', wardhouse: s.corruption ? `Purge corruption · ${cleanseCost(s)}g` : 'Sigils & quiet hour',
    board: ready ? `${ready} ready to claim` : avail ? `${avail} contract${avail > 1 ? 's' : ''} available` : 'No new contracts', trainer: (TOWN_TRAIN(t.id)).join(' · '), harbor: 'Ferries to distant ports',
  } as Record<string, string>)[id];
  const services = t.services.filter(x => x !== 'tavern');
  return `<section class="town" style="--sky:${t.theme.sky};--glow:${t.theme.glow};--ink:${t.theme.ink}">
    <div class="banner">
      <canvas class="banner-art" data-scene="${esc(t.art)}" data-res="card" data-key="tb-${t.id}"></canvas><div class="banner-shade"></div>
      <div class="banner-text"><small>${t.kind === 'city' ? 'CITY' : 'SETTLEMENT'}</small><h1>${esc(t.name)}</h1><p>${esc(t.subtitle)}</p></div>
    </div>
    <p class="town-desc">${esc(t.desc)}</p>
    <div class="objective panel"><span class="oi">${icon('quest')}</span><div><small>MAIN QUEST · ${esc(step.title)}</small><p>${esc(step.obj)}</p></div></div>
    <div class="svc-grid">${services.map(id => { const m = SERVICE_META[id]; const badge = id === 'board' && ready ? `<em class="dot gold">${ready}</em>` : ''; return `<button class="svc" data-go="${m.go}"><span class="si">${icon(m.ic)}</span><span class="st2"><b>${m.label}</b><small>${sub(id)}</small></span>${badge}</button>` }).join('')}</div>
    <h3 class="sec-h">People of ${esc(t.name)}</h3>
    <div class="npc-list">${t.npcs.map(n => {
      const story = n.talk?.some(v => cond(s, v.cond));
      return `<button class="npc ${story ? 'story' : ''}" data-talk="${n.id}"><span class="np"><img src="${personaUrl(n.id, undefined, n.look)}" alt=""></span><span class="nt"><b>${esc(n.name)}</b><small>${esc(n.title)}</small></span>${story ? `<em class="mark">${icon('quest')}</em>` : ''}</button>`;
    }).join('')}</div>
    <div class="row-end"><button class="btn" data-act="leaveTown">${icon('back')}Leave ${esc(t.name)}</button></div>
  </section>`;
}
const TOWN_TRAIN = (id: string) => (TOWN_SCHOOLS[id] ?? []) as string[];

const CATS: [string, string][] = [['all', 'All'], ['weapon', 'Weapons'], ['armor', 'Armor'], ['trinket', 'Trinkets'], ['consumable', 'Supplies'], ['junk', 'Valuables']];
const catOf = (d: ItemDef) => (d.slot === 'weapon' ? 'weapon' : d.slot === 'consumable' ? 'consumable' : d.slot === 'junk' ? 'junk' : d.slot === 'ring' || d.slot === 'amulet' ? 'trinket' : 'armor');

export function itemRow(s: GameState, d: ItemDef, right: string, opts: { sheet?: 'shop' | 'bag'; count?: number; compare?: boolean } = {}) {
  return `<div class="irow r-${d.rarity}" ${opts.sheet ? `data-sheet="${d.id}" data-from="${opts.sheet}"` : ''}>
    ${itemIcon(d)}<div class="imain"><div class="iname"><b>${esc(d.name)}</b>${opts.count && opts.count > 1 ? `<em class="cnt">×${opts.count}</em>` : ''}</div>
    <div class="itag"><span class="rar">${d.rarity}</span> · ${kindName(d)}${d.set ? ' · Set' : ''}</div>
    <div class="chips">${d.slot === 'consumable' || d.slot === 'junk' ? `<small class="idesc">${d.desc}</small>` : statChips(d.bonus)}</div>
    ${opts.compare ? compareChips(s, d) : ''}</div><div class="iact">${right}</div></div>`;
}

export function shop(s: GameState, ui: UI) {
  const t = TOWN_MAP.get(s.town!)!;
  const stock = shopStock(s, t.id).filter(d => ui.shopCat === 'all' || catOf(d) === ui.shopCat);
  const groups = new Map<string, number>();
  s.inventory.forEach(i => groups.set(i, (groups.get(i) ?? 0) + 1));
  const sellable = [...groups.entries()].map(([id, n]) => ({ d: item(id)!, n })).filter(g => g.d && (ui.shopCat === 'all' || catOf(g.d) === ui.shopCat));
  const valuables = s.inventory.filter(i => item(i)?.slot === 'junk' && canSell(i)).length;
  return `<section class="page-in"><div class="page-head"><h2>${icon('shop')}${esc(t.name)} Market</h2><p class="muted">“Everything here belonged to somebody brave.” Stock rotates every few days.</p></div>
    <div class="tabs"><button class="${ui.shopTab === 'buy' ? 'on' : ''}" data-shoptab="buy">Buy</button><button class="${ui.shopTab === 'sell' ? 'on' : ''}" data-shoptab="sell">Sell</button></div>
    <div class="chips-row">${CATS.filter(([k]) => ui.shopTab === 'sell' || k !== 'junk').map(([k, l]) => `<button class="pill ${ui.shopCat === k ? 'on' : ''}" data-shopcat="${k}">${l}</button>`).join('')}</div>
    ${ui.shopTab === 'buy' ? `<div class="list">
      <div class="irow"><span class="iicon r-common">${icon('supplies')}</span><div class="imain"><div class="iname"><b>Supply Bundle</b></div><small class="idesc">+2 supplies for the road. You carry ${s.supplies}.</small></div><div class="iact"><button class="btn buy" data-act="buySupplies" ${s.gold < SUPPLY_PRICE ? 'disabled' : ''}>${SUPPLY_PRICE}${icon('gold')}</button></div></div>
      ${stock.map(d => itemRow(s, d, `<button class="btn buy" data-buy="${d.id}" ${s.gold < buyPrice(s, d) ? 'disabled' : ''}>${buyPrice(s, d)}${icon('gold')}</button>`, { sheet: 'shop', compare: true })).join('') || emptyState('shop', 'Nothing in this category today.')}</div>`
      : `${valuables ? `<div class="row-end"><button class="btn" data-act="sellJunk">${icon('gold')}Sell all valuables</button></div>` : ''}<div class="list">${sellable.map(({ d, n }) => itemRow(s, d, canSell(d.id) ? `<button class="btn sell" data-sell="${d.id}">+${sellPrice(d)}${icon('gold')}</button>` : '<small class="muted">Keepsake</small>', { count: n, sheet: 'bag' })).join('') || emptyState('bag', 'Nothing to sell. Unequip gear to sell it.')}</div>`}
  </section>`;
}

export function smithy(s: GameState, ui: UI) {
  const eq = (Object.entries(s.equipment) as [Slot, string | null][]).filter(([, id]) => id && canUpgrade(id)) as [Slot, string][];
  const bag = [...new Set(s.inventory)].filter(id => canUpgrade(id));
  const row = (id: string, slot: Slot | null) => {
    const d = item(id)!;
    const [, up] = splitId(id);
    const next = item(`${splitId(id)[0]}+${up + 1}`)!;
    const cost = upgradeCost(id);
    const diff = (['damage', 'armor', 'maxHp'] as const).map(k => [k, (next.bonus[k] ?? 0) - (d.bonus[k] ?? 0)] as const).filter(([, v]) => v > 0);
    return `<div class="irow r-${d.rarity}">${itemIcon(d)}<div class="imain"><div class="iname"><b>${esc(d.name)}</b>${slot ? `<em class="cnt">${SLOT_LABEL[slot]}</em>` : ''}</div>
      <div class="itag">Reinforce to +${up + 1}</div><div class="chips">${diff.map(([k, v]) => `<span class="st pos"><b>+${v}</b> ${k === 'maxHp' ? 'Health' : k[0].toUpperCase() + k.slice(1)}</span>`).join('')}</div></div>
      <div class="iact"><button class="btn buy" data-upgrade="${id}" data-slot="${slot ?? ''}" ${s.gold < cost || up >= MAX_UPGRADE ? 'disabled' : ''}>${cost}${icon('gold')}</button></div></div>`;
  };
  const list = ui.smithTab === 'equipped' ? eq.map(([slot, id]) => row(id, slot)) : bag.map(id => row(id, null));
  return `<section class="page-in"><div class="page-head"><h2>${icon('smith')}The Smithy</h2><p class="muted">Reinforce weapons and armor up to +${MAX_UPGRADE}. Each step adds real steel.</p></div>
    <div class="tabs"><button class="${ui.smithTab === 'equipped' ? 'on' : ''}" data-smithtab="equipped">Equipped</button><button class="${ui.smithTab === 'bag' ? 'on' : ''}" data-smithtab="bag">In pack</button></div>
    <div class="list">${list.join('') || emptyState('smith', 'Nothing here can be reinforced.')}</div></section>`;
}

export function inn(s: GameState, ui: UI) {
  const t = TOWN_MAP.get(s.town!)!;
  const cost = innCost(s);
  const tavern = t.services.includes('tavern');
  return `<section class="page-in"><div class="page-head"><h2>${icon('inn')}The Inn</h2><p class="muted">A bed, a fire, and a door that locks. Rest restores health, sanity and clears ailments.</p></div>
    <div class="panel feature"><span class="fi">${icon('inn')}</span><div><h3>A warm bed</h3><p>Sleep until the world stops whispering.</p></div><button class="btn primary" data-act="rest" ${s.gold < cost ? 'disabled' : ''}>Rest · ${cost}${icon('gold')}</button></div>
    ${ownedCompanions(s).length > 1 ? `<h3 class="sec-h">Companion</h3><div class="svc-grid">${['None', ...ownedCompanions(s)].map(n => `<button class="svc ${s.companion === n ? 'on' : ''}" data-companion="${esc(n)}"><span class="si">${icon('e_hound')}</span><span class="st2"><b>${esc(n)}</b><small>${n === 'None' ? 'Walk alone' : s.companion === n ? 'Travelling with you' : 'Swap'}</small></span></button>`).join('')}</div>` : ''}
    <div id="adslot-inn"></div>
    ${tavern ? `<div class="panel feature"><span class="fi">${icon('tavern')}</span><div><h3>The tavern</h3><p>Tongues loosen for those who buy a round. Rumors may point to places you have not yet found.</p></div><button class="btn" data-act="round" ${s.gold < roundCost(s) ? 'disabled' : ''}>Buy a round · ${roundCost(s)}${icon('gold')}</button></div>
    ${ui.tavernText ? `<blockquote class="rumor" data-key="rum-${ui.tavernText.length}">“${esc(ui.tavernText)}”</blockquote>` : '<blockquote class="rumor muted">Rumors are free. Listen at the bar.<button class="btn" data-act="listen">Listen</button></blockquote>'}` : ''}
  </section>`;
}

export function wardhouse(s: GameState) {
  const cost = cleanseCost(s);
  const bc = sigilCost(s);
  const rested = s.flags[`quiet_${s.day}`];
  const pending = s.flags.pending_sigil;
  const B: [number, string, string, string][] = [[1, 'w_blade', 'Blades', 'Bonus damage on your next expedition.'], [2, 'shield', 'Warding', 'Bonus armor on your next expedition.'], [3, 'eye', 'the Open Eye', '+10% critical chance on your next expedition.']];
  return `<section class="page-in"><div class="page-head"><h2>${icon('wardhouse')}The Wardhouse</h2><p class="muted">The fire here is honest. It burns what should not be.</p></div>
    <div class="panel feature"><span class="fi">${icon('corruption')}</span><div><h3>Purge corruption</h3><p>${s.corruption ? `You carry ${s.corruption} corruption. Each point costs 3 sanity and adds 4% damage.` : 'You are untainted.'}</p></div><button class="btn primary" data-act="cleanse" ${s.corruption <= 0 || s.gold < cost ? 'disabled' : ''}>${cost}${icon('gold')}</button></div>
    <div class="panel feature"><span class="fi">${icon('sigil')}</span><div><h3>Quiet hour</h3><p>Once a day, restore a third of your sanity for free.</p></div><button class="btn" data-act="quiet" ${rested ? 'disabled' : ''}>${rested ? 'Rested today' : 'Rest the mind'}</button></div>
    <h3 class="sec-h">Sigils ${pending ? `<small class="muted">· Active: ${['', 'Blades', 'Warding', 'the Open Eye'][pending]}</small>` : ''}</h3>
    <div class="svc-grid">${B.map(([k, ic, name, desc]) => `<button class="svc ${pending === k ? 'on' : ''}" data-sigil="${k}" ${s.gold < bc ? 'disabled' : ''}><span class="si">${icon(ic)}</span><span class="st2"><b>Sigil of ${name}</b><small>${desc}</small></span><span class="price">${bc}${icon('gold')}</span></button>`).join('')}</div>
  </section>`;
}

export function trainer(s: GameState) {
  const schools = schoolsHere(s);
  const list = SKILLS.filter(k => (schools as string[]).includes(k.school) && k.price > 0);
  return `<section class="page-in"><div class="page-head"><h2>${icon('skills')}Trainer</h2><p class="muted">Techniques copied from people who no longer exist. Schools taught here: ${schools.join(', ') || 'none'}.</p></div>
    <div class="list">${list.map(k => {
      const known = s.skills.includes(k.id);
      const lock = s.level < k.level;
      const rank = s.skillRanks[k.id] ?? 1;
      const rc = rankUpCost(s, k.id);
      return `<div class="irow ${known ? 'known' : ''} ${lock ? 'locked' : ''}"><span class="iicon r-rare">${icon(k.icon)}</span><div class="imain"><div class="iname"><b>${k.name}</b><em class="cnt">${k.school}</em></div><small class="idesc">${k.desc}</small><div class="itag">Cooldown ${k.cooldown}${k.sanityCost ? ` · ${k.sanityCost} sanity` : ''}${k.hpCost ? ` · ${k.hpCost}% health` : ''} · Level ${k.level}</div></div>
        <div class="iact">${known ? `<span class="badge">RANK ${rank}</span>${rc ? `<button class="btn buy" data-rankup="${k.id}" ${s.gold < rc ? 'disabled' : ''}>${rc}${icon('gold')}</button>` : '<small class="muted">Mastered</small>'}` : `<button class="btn buy" data-learn="${k.id}" ${lock || s.gold < skillPrice(k.id) ? 'disabled' : ''}>${lock ? `Lv ${k.level}` : `${k.price}${icon('gold')}`}</button>`}</div></div>`;
    }).join('') || emptyState('skills', 'No trainer here has anything to teach you.')}</div></section>`;
}

export function board(s: GameState) {
  const t = TOWN_MAP.get(s.town!)!;
  const avail = availableQuests(s, t.id);
  const active = s.quests;
  const card = (id: string) => {
    const d = questDef(s, id)!;
    const q = s.quests.find(x => x.id === id)!;
    const here = d.town === t.id;
    return `<div class="quest ${q.done ? 'ready' : ''}"><span class="qi">${icon(q.done ? 'trophy' : 'quest')}</span><div class="qm"><b>${esc(d.title)}</b><small>${esc(d.giver)} · ${esc(TOWN_MAP.get(d.town)!.name)}${d.bounty ? ' · bounty' : ''}</small><p>${q.done ? esc(d.done ?? 'Return to the giver to claim your reward.') : esc(d.goal.label)}</p>
      <div class="bar bar-xp thin"><div class="fill" style="width:${(q.progress / d.goal.count) * 100}%"></div><span>${q.progress} / ${d.goal.count}</span></div></div>
      ${q.done ? (here ? `<button class="btn primary" data-claim="${id}">Claim</button>` : `<small class="muted">Return to ${esc(TOWN_MAP.get(d.town)!.name)}</small>`) : ''}</div>`;
  };
  return `<section class="page-in"><div class="page-head"><h2>${icon('notice')}Notice Board</h2><p class="muted">Contracts nailed over older contracts, plus fresh bounties every six days. Up to ${QUEST_LIMIT} at once.</p></div>
    <h3 class="sec-h">Active (${active.length}/${QUEST_LIMIT})</h3>
    <div class="list">${active.map(q => card(q.id)).join('') || emptyState('notice', 'No active contracts.')}</div>
    <h3 class="sec-h">Posted in ${esc(t.name)}</h3>
    <div class="list">${avail.map(d => `<div class="quest"><span class="qi">${icon('quest')}</span><div class="qm"><b>${esc(d.title)}</b><small>${esc(d.giver)}</small><p>${esc(d.text)}</p>
      <div class="chips"><span class="st pos"><b>${d.reward.gold}</b> gold</span><span class="st pos"><b>${d.reward.xp}</b> XP</span>${(d.reward.items ?? []).map(i => `<span class="st">${esc(baseItem(i)?.name ?? i)}</span>`).join('')}</div></div>
      <button class="btn" data-accept="${d.id}" ${s.quests.length >= QUEST_LIMIT ? 'disabled' : ''}>Accept</button></div>`).join('') || emptyState('notice', 'No new contracts here. Try another town.')}</div>
  </section>`;
}

export function mapScreen(s: GameState, ui: UI) {
  const sel = ui.mapSel;
  let info = '<p class="muted center">Tap a marked place to inspect it. Visited towns can be fast-travelled to.</p>';
  if (sel) {
    const t = TOWN_MAP.get(sel);
    const d = DUNGEON_MAP.get(sel);
    if (t) {
      const c = travelCost(s, sel);
      const visited = s.world.visited.includes(sel);
      const can = canFastTravel(s, sel);
      info = `<div class="mapinfo-in"><span class="mapi">${icon(t.kind === 'city' ? 'm_city' : 'm_town')}</span><div><h3>${esc(t.name)} <small>${esc(t.subtitle)}</small></h3><p>${esc(t.desc)}</p><small class="muted">${visited ? `Fast travel: ${c.supplies} supplies · ${c.days} day${c.days > 1 ? 's' : ''}` : 'Not yet visited. Walk there to unlock fast travel.'}</small></div>
        ${s.screen === 'map' && sel !== s.town ? `<button class="btn primary" data-travel="${sel}" ${can ? '' : 'disabled'}>Travel</button>` : ''}</div>`;
    } else if (d) {
      const gated = d.gate && s.main < MAIN.findIndex(m => m.id === d.gate);
      info = `<div class="mapinfo-in"><span class="mapi">${icon(d.icon ?? 'm_dungeon')}</span><div><h3>${esc(d.name)} <small>Lv ${d.lvl} · ${d.floors} floors</small></h3><p>${esc(d.desc)}</p><small class="muted">${s.cleared.includes(d.id) ? 'Warden defeated.' : gated ? 'Sealed until the story leads you here.' : `Boss: ${esc(d.boss)}`}</small></div></div>`;
    }
  }
  return `<section class="page-in mapscreen"><div class="fullmap-host" id="fullmount" data-static></div><div class="panel mapinfo">${info}</div></section>`;
}


export function harbor(s: GameState) {
  const t = TOWN_MAP.get(s.town!)!;
  const dests = ferryTargets(s, t.id);
  return `<section class="page-in"><div class="page-head"><h2>${icon('m_ship')}Harbor of ${esc(t.name)}</h2><p class="muted">Ferrymen who ask no questions, for a price. Sailing takes a day or more.</p></div>
    <div class="list">${dests.map(d => { const cost = ferryCost(t.id, d.id); return `<div class="irow"><span class="iicon r-rare">${icon(d.kind === 'city' ? 'm_city' : 'm_town')}</span><div class="imain"><div class="iname"><b>${esc(d.name)}</b><em class="cnt">${s.world.visited.includes(d.id) ? 'visited' : 'unvisited'}</em></div><small class="idesc">${esc(d.subtitle)}</small></div><div class="iact"><button class="btn buy" data-sail="${d.id}" ${canSail(s, d.id) ? '' : 'disabled'}>${cost}${icon('gold')}</button></div></div>` }).join('') || emptyState('m_ship', 'No ships sail from here yet. Ask around the docks.')}</div></section>`;
}
