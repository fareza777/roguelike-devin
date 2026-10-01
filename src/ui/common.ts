import { icon } from '../icons';
import { SETS } from '../data/items';
import { item, setCounts, stats } from '../engine/core';
import type { Bonus, GameState, ItemDef, Screen, Slot, Status } from '../types';

export interface UI {
  creationStep: number; introPanel: number; onboardStep: number; prevScreen: Screen;
  charTab: 'attributes' | 'talents' | 'skills' | 'path'; journalTab: 'story' | 'crowns' | 'contracts' | 'lore' | 'bestiary' | 'atlas' | 'endings';
  shopTab: 'buy' | 'sell'; shopCat: 'all' | 'weapon' | 'armor' | 'trinket' | 'consumable' | 'junk';
  invFilter: 'all' | 'gear' | 'consumable' | 'junk'; sheet: { id: string; from: 'bag' | 'equip' | 'shop'; slot?: Slot } | null;
  mapSel: string | null; confirmDelete: boolean; toast: string | null; fxSeq: number; logSeq: number; tavernText: string | null; confirmLeave: boolean;
  smithTab: 'equipped' | 'bag'; typed: string; enterNote: string | null; endSlide: number;
}

/** One painted plate per place. Exact id wins; tags fall back to the nearest place. */
const PLATES = new Set([
  'armada', 'ashwood', 'aurora', 'bellhouse', 'brasshaven', 'catacombs', 'cistern', 'cogspire', 'conservatory', 'escapement',
  'finalindex', 'gildedgardens', 'glasskeep', 'glasswastes', 'gloamstep', 'grist', 'gullrest', 'hart', 'heartbriar', 'hourengine',
  'inkwell', 'intro_sun', 'kilnhold', 'lantern_hall', 'lanternatoll', 'lowmire', 'lumenhollow', 'meridian', 'mirewick', 'mirrorcourt',
  'orangery', 'orrery', 'pass', 'prismpalace', 'quarry', 'reefgrottos', 'rimewatch', 'road', 'rookery', 'shardrest', 'skerrig',
  'solenne', 'splash', 'thornwick', 'tidewatch', 'underdeep', 'unsinking', 'veyrgard', 'vhal', 'whalefall', 'widow',
]);

const NEAREST: [RegExp, string][] = [
  [/ilse|seer|lantern_hall/, 'lantern_hall'],
  [/catacomb|widow/, 'catacombs'],
  [/crypt|bellhouse|saltmere|salt/, 'bellhouse'],
  [/armada|unsink|reef|gull|tide|flood|sea|coast|corall/, 'tidewatch'],
  [/hart|ashwood|ember|forest/, 'ashwood'],
  [/thorn|mire|hedge|briar|hob/, 'thornwick'],
  [/grist|quarry|bone|marrow/, 'quarry'],
  [/cog|orrery|clock|gear|escapement/, 'cogspire'],
  [/solenne|noon|court|garden|aurelia|gilded|mirror/, 'solenne'],
  [/glass|brass|lens|shard|dune/, 'glasswastes'],
  [/frost|rime|aurora|winter|skerr|whale|snow|pass|vhal/, 'pass'],
  [/deep|lumen|ink|ledger|quill|archive|cave/, 'underdeep'],
  [/meridian|throne|king/, 'meridian'],
  [/rook/, 'rookery'],
  [/veyr|siege|eclipse|intro|city/, 'veyrgard'],
];

export function stillArt(id?: string): string {
  if (!id) return '/art/plates/road.jpg';
  const bare = id.split('/').pop()!.replace(/\.(webp|png|jpe?g)$/i, '').toLowerCase();
  if (PLATES.has(bare) || /^end-[1-6]$/.test(bare)) return `/art/plates/${bare}.jpg`;
  const k = id.toLowerCase();
  for (const [re, name] of NEAREST) if (re.test(k)) return `/art/plates/${name}.jpg`;
  const pool = [...PLATES];
  let h = 0;
  for (const c of k) h = (h + c.charCodeAt(0)) % pool.length;
  return `/art/plates/${pool[h]}.jpg`;
}

export const esc = (t: string) => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const pct = (a: number, b: number) => Math.max(0, Math.min(100, (a / Math.max(1, b)) * 100));
export const fmt = (s: GameState, t: string) => t.replace(/\{name\}/g, esc(s.name || 'Wayfarer')).replace(/\{companion\}/g, esc(s.companion || 'Companion'));

export const SLOT_ICON: Record<Slot, string> = { weapon: 'w_blade', offhand: 'o_round', head: 'h_heavy', body: 'b_heavy', hands: 'g_heavy', feet: 'f_heavy', ring: 'r_ring', amulet: 'a_gem' };
export const STATUS_ICON: Record<Status, string> = { bleed: 'bleed', burn: 'burn', stun: 'stun', ward: 'ward', weak: 'weak', marked: 'marked', poison: 'poison', chill: 'chill', regen: 'regen' };

const STAT_LABEL: Record<keyof Bonus, string> = { damage: 'Damage', armor: 'Armor', vigor: 'Vigor', will: 'Will', cunning: 'Cunning', maxHp: 'Health', maxSanity: 'Sanity', crit: 'Crit %', dodge: 'Dodge %', lifesteal: 'Lifesteal %', thorns: 'Thorns', luck: 'Luck %', flee: 'Flee %', sight: 'Sight', xpPct: 'XP %', goldPct: 'Gold %', shopPct: 'Shop %', encPct: 'Encumbrance', critDmg: 'Crit damage' };
export const STAT_KEYS = Object.keys(STAT_LABEL) as (keyof Bonus)[];

export function statChips(b: Bonus) {
  return STAT_KEYS.filter(k => b[k]).map(k => `<span class="st ${(b[k] ?? 0) > 0 ? 'pos' : 'neg'}"><b>${(b[k] ?? 0) > 0 ? '+' : ''}${b[k]}</b> ${STAT_LABEL[k]}</span>`).join('');
}

export function useText(d: ItemDef) { return d.slot === 'consumable' ? d.desc : '' }

export function compareChips(s: GameState, d: ItemDef) {
  if (!d.slot || d.slot === 'consumable' || d.slot === 'junk') return '';
  const cur = s.equipment[d.slot as Slot];
  const c = cur ? item(cur) : null;
  if (cur && c && cur === d.id) return '';
  const diff = STAT_KEYS.map(k => [k, (d.bonus[k] ?? 0) - (c?.bonus[k] ?? 0)] as const).filter(([, v]) => v !== 0);
  if (!diff.length) return '<div class="cmp"><small>Same as equipped</small></div>';
  return `<div class="cmp"><small>${c ? `vs ${esc(c.name)}` : 'vs empty slot'}</small>${diff.map(([k, v]) => `<span class="cd ${v > 0 ? 'up' : 'down'}">${v > 0 ? '▲' : '▼'} ${Math.abs(v)} ${STAT_LABEL[k]}</span>`).join('')}</div>`;
}

export const rarityName = (d: ItemDef) => d.rarity;
export const kindName = (d: ItemDef) => (d.slot === 'consumable' ? 'Consumable' : d.slot === 'junk' ? (d.unique ? 'Keepsake' : 'Valuable') : d.slot[0].toUpperCase() + d.slot.slice(1));

export function itemIcon(d: ItemDef, extra = '') {
  return `<span class="iicon r-${d.rarity} ${extra}">${icon(d.icon)}</span>`;
}

export function setInfo(s: GameState) {
  const counts = setCounts(s);
  const entries = Object.entries(counts);
  if (!entries.length) return '';
  return `<div class="panel setbox"><h3>Set Bonuses</h3>${entries.map(([k, n]) => {
    const set = SETS[k];
    return `<div class="setrow"><b>${set.name}</b> <span class="muted">${n}/4</span><div class="chips">${statChips(set.two).replace(/class="st/g, `class="st ${n >= 2 ? '' : 'off'}`)}</div><div class="chips">${statChips(set.four).replace(/class="st/g, `class="st ${n >= 4 ? '' : 'off'}`)}</div></div>`;
  }).join('')}</div>`;
}

export function barHtml(kind: 'hp' | 'san' | 'xp' | 'enemy', value: number, max: number, label: string, cls = '') {
  const p = pct(value, max);
  return `<div class="bar bar-${kind} ${cls}" data-key="bar-${kind}${cls}"><div class="ghost" style="width:${p}%"></div><div class="fill" style="width:${p}%"></div><span>${label}</span></div>`;
}

export function vitals(s: GameState) {
  const st = stats(s);
  return `${barHtml('hp', s.hp, st.maxHp, `${s.hp}<i>/${st.maxHp}</i>`)}${barHtml('san', s.sanity, st.maxSanity, `${s.sanity <= 0 ? 'UNRAVELED' : `${s.sanity}<i>/${st.maxSanity}</i>`}`, s.sanity <= 0 ? 'broken' : '')}`;
}

export function chips(list: string[]) { return list.length ? `<div class="chips">${list.join('')}</div>` : '' }
export function statusChips(st: Partial<Record<Status, number>>) {
  return (Object.keys(st) as Status[]).map(k => `<span class="chip status-${k}" title="${k}">${icon(STATUS_ICON[k])}<b>${k}</b> ${st[k]}</span>`).join('');
}

export function emptyState(iconName: string, text: string) { return `<div class="empty">${icon(iconName)}<p>${text}</p></div>` }
