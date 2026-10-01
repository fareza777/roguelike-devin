import { ARCS, ARC_MAP } from '../data/arcs';
import { ASCENSIONS } from '../data/skills';
import { QUEST_MAP, QUESTS } from '../data/quests';
import type { ArcDef, Cond, GameState, QuestDef, QuestGoal } from '../types';
import { bountyBoard, bountyById } from './bounty';
import { baseItem, flag, hooks, push } from './core';
import { enqueue } from './flow';
import { MAIN, MAIN_INDEX } from '../data/story';

export const QUEST_LIMIT = 10;

export function cond(s: GameState, c?: Cond): boolean {
  if (!c) return true;
  if (c.flag && !(s.flags[c.flag] > 0)) return false;
  if (c.not && s.flags[c.not] > 0) return false;
  if (c.min && (s.flags[c.min[0]] ?? 0) < c.min[1]) return false;
  if (c.all && !c.all.every(k => s.flags[k] > 0)) return false;
  if (c.mainAt && s.main !== MAIN_INDEX.get(c.mainAt)) return false;
  if (c.mainMin && s.main < (MAIN_INDEX.get(c.mainMin) ?? 0)) return false;
  if (c.mainBelow && s.main >= (MAIN_INDEX.get(c.mainBelow) ?? 99)) return false;
  if (c.item && !s.inventory.some(i => baseItem(i)?.id === c.item)) return false;
  if (c.gold && s.gold < c.gold) return false;
  if (c.companion && s.companion !== c.companion) return false;
  if (c.corruption && s.corruption < c.corruption) return false;
  if (c.level && s.level < c.level) return false;
  if (c.done && !s.completedQuests.includes(c.done)) return false;
  if (c.active && !s.quests.some(q => q.id === c.active)) return false;
  if (c.origin && !s.origin.includes(c.origin)) return false;
  if (c.path && s.path !== c.path) return false;
  if (c.arc && flag(s, `arc_${c.arc[0]}`) !== c.arc[1]) return false;
  if (c.arcMin && flag(s, `arc_${c.arcMin[0]}`) < c.arcMin[1]) return false;
  if (c.regalia !== undefined && regaliaCount(s) < c.regalia) return false;
  if (c.ascended !== undefined && s.ascensions.length < c.ascended) return false;
  if (c.town && s.town !== c.town) return false;
  if (c.any && !c.any.some(x => cond(s, x))) return false;
  return true;
}

export const regaliaCount = (s: GameState) => ARCS.filter(a => flag(s, `regalia_${a.regalia}`) > 0).length;
export const arcStep = (s: GameState, id: string) => flag(s, `arc_${id}`);
export const arcActive = (s: GameState, a: ArcDef) => { const n = arcStep(s, a.id); return n >= 1 && n <= a.steps.length };
export const arcDone = (s: GameState, a: ArcDef) => arcStep(s, a.id) > a.steps.length;
export const ascensionAvailable = (s: GameState) => ASCENSIONS.some(x => x.path === s.path && s.level >= x.level && !s.ascensions.some(id => ASCENSIONS.find(y => y.id === id)?.tier === x.tier));

export const hasItem = (s: GameState, id: string) => s.inventory.some(i => baseItem(i)?.id === id);

export function availableQuests(s: GameState, town: string): QuestDef[] {
  return [...QUESTS.filter(q => q.town === town && !s.completedQuests.includes(q.id) && !s.quests.some(a => a.id === q.id) && cond(s, q.cond)), ...bountyBoard(s, town)];
}

export function acceptQuest(s: GameState, id: string, silent = false): boolean {
  const def = QUEST_MAP.get(id) ?? bountyById(id) ?? undefined;
  if (!def || s.completedQuests.includes(id) || s.quests.some(q => q.id === id) || (s.quests.length >= QUEST_LIMIT && !silent)) return false;
  if (def.bounty) s.dynQuests[id] = def;
  const st = { id, progress: 0, done: false };
  if (def.goal.type === 'level') st.progress = Math.min(def.goal.count, s.level);
  if (def.goal.type === 'fetch' && def.item && hasItem(s, def.item)) st.progress = 1;
  st.done = st.progress >= def.goal.count;
  s.quests.push(st);
  push(s, `New contract: ${def.title}.`, 'epic');
  return true;
}

export type QEvent = { type: 'kill'; enemy: string; tags: string[] } | { type: 'elite' } | { type: 'clear'; id: string } | { type: 'events' } | { type: 'lore' } | { type: 'level' } | { type: 'reach'; id: string } | { type: 'talk'; id: string } | { type: 'fetch' } | { type: 'regalia' };

/** 1 when the event advances this goal by one step, 0 otherwise (level goals are handled separately). */
function goalHit(g: QuestGoal, ev: QEvent): number {
  switch (ev.type) {
    case 'kill': return (g.type === 'kill' && g.target === ev.enemy) || (g.type === 'killTag' && g.target && ev.tags.includes(g.target)) ? 1 : 0;
    case 'elite': return g.type === 'elites' ? 1 : 0;
    case 'clear': return g.type === 'clear' && g.target === ev.id ? 1 : 0;
    case 'events': return g.type === 'events' ? 1 : 0;
    case 'lore': return g.type === 'lore' ? 1 : 0;
    case 'reach': return g.type === 'reach' && g.target === ev.id ? 1 : 0;
    case 'talk': return g.type === 'talk' && g.target === ev.id ? 1 : 0;
    default: return 0;
  }
}

/** Advance a story goal (main step or arc step) stored in the flag `key`. Returns true when it just completed. */
function trackGoal(s: GameState, key: string, g: QuestGoal, ev: QEvent): boolean {
  const cur = s.flags[key] ?? 0;
  if (g.type === 'level') { s.flags[key] = Math.min(g.count, s.level); return s.level >= g.count }
  if (g.type === 'regalia') { s.flags[key] = Math.min(g.count, regaliaCount(s)); return regaliaCount(s) >= g.count }
  const next = Math.min(g.count, cur + goalHit(g, ev));
  s.flags[key] = next;
  return next >= g.count;
}

export function questEvent(s: GameState, ev: QEvent) {
  s.quests.forEach(q => {
    if (q.done) return;
    const def = QUEST_MAP.get(q.id) ?? s.dynQuests[q.id];
    if (!def) return;
    const g = def.goal;
    if (ev.type === 'level') { if (g.type === 'level') q.progress = Math.min(g.count, s.level) }
    else if (ev.type === 'fetch') { if (g.type === 'fetch' && def.item && hasItem(s, def.item)) q.progress = g.count }
    else q.progress = Math.min(g.count, q.progress + goalHit(g, ev));
    if (q.progress >= g.count) { q.done = true; push(s, `Contract ready: ${def.title}. Return to ${def.giver}.`, 'epic') }
  });
  const step = MAIN[Math.min(s.main, MAIN.length - 1)];
  if (step?.goal && trackGoal(s, '_mg', step.goal, ev)) {
    const next = MAIN[s.main + 1];
    if (next) { hooks.setMain(s, next.id); if (step.done) enqueue(s, { k: 'scene', id: step.done }) }
  }
  for (const arc of ARCS) {
    const n = arcStep(s, arc.id);
    if (n < 1 || n > arc.steps.length) continue;
    const st = arc.steps[n - 1];
    if (st.goal && trackGoal(s, `_ag_${arc.id}`, st.goal, ev)) { hooks.setArc(s, arc.id, n + 1); if (st.done) enqueue(s, { k: 'scene', id: st.done }) }
  }
}

export const questDef = (s: GameState, id: string) => QUEST_MAP.get(id) ?? s.dynQuests[id];
export { ARC_MAP };
export const claimable = (s: GameState, town: string) => s.quests.filter(q => q.done && questDef(s, q.id)?.town === town);
