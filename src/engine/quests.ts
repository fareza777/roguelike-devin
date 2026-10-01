import { QUEST_MAP, QUESTS } from '../data/quests';
import type { Cond, GameState, QuestDef } from '../types';
import { baseItem, push } from './core';
import { MAIN_INDEX } from '../data/story';

export const QUEST_LIMIT = 8;

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
  if (c.any && !c.any.some(x => cond(s, x))) return false;
  return true;
}

export const hasItem = (s: GameState, id: string) => s.inventory.some(i => baseItem(i)?.id === id);

export function availableQuests(s: GameState, town: string): QuestDef[] {
  return QUESTS.filter(q => q.town === town && !s.completedQuests.includes(q.id) && !s.quests.some(a => a.id === q.id) && cond(s, q.cond));
}

export function acceptQuest(s: GameState, id: string, silent = false): boolean {
  const def = QUEST_MAP.get(id);
  if (!def || s.completedQuests.includes(id) || s.quests.some(q => q.id === id) || (s.quests.length >= QUEST_LIMIT && !silent)) return false;
  const st = { id, progress: 0, done: false };
  if (def.goal.type === 'level') st.progress = Math.min(def.goal.count, s.level);
  if (def.goal.type === 'fetch' && def.item && hasItem(s, def.item)) st.progress = 1;
  st.done = st.progress >= def.goal.count;
  s.quests.push(st);
  push(s, `New contract: ${def.title}.`, 'epic');
  return true;
}

export type QEvent = { type: 'kill'; enemy: string; tags: string[] } | { type: 'elite' } | { type: 'clear'; id: string } | { type: 'events' } | { type: 'lore' } | { type: 'level' } | { type: 'reach'; id: string } | { type: 'talk'; id: string } | { type: 'fetch' };

export function questEvent(s: GameState, ev: QEvent) {
  s.quests.forEach(q => {
    if (q.done) return;
    const def = QUEST_MAP.get(q.id);
    if (!def) return;
    const g = def.goal;
    let hit = 0;
    switch (ev.type) {
      case 'kill': if ((g.type === 'kill' && g.target === ev.enemy) || (g.type === 'killTag' && g.target && ev.tags.includes(g.target))) hit = 1; break;
      case 'elite': if (g.type === 'elites') hit = 1; break;
      case 'clear': if (g.type === 'clear' && g.target === ev.id) hit = 1; break;
      case 'events': if (g.type === 'events') hit = 1; break;
      case 'lore': if (g.type === 'lore') hit = 1; break;
      case 'reach': if (g.type === 'reach' && g.target === ev.id) hit = 1; break;
      case 'talk': if (g.type === 'talk' && g.target === ev.id) hit = 1; break;
      case 'level': if (g.type === 'level') { q.progress = Math.min(g.count, s.level); hit = 0 } break;
      case 'fetch': if (g.type === 'fetch' && def.item && hasItem(s, def.item)) q.progress = g.count; break;
    }
    if (hit) q.progress = Math.min(g.count, q.progress + hit);
    if (q.progress >= g.count) { q.done = true; push(s, `Contract ready: ${def.title}. Return to ${def.giver}.`, 'epic') }
  });
}

export const claimable = (s: GameState, town: string) => s.quests.filter(q => q.done && QUEST_MAP.get(q.id)?.town === town);
