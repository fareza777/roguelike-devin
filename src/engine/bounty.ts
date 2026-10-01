import { ENEMY_MAP } from '../data/enemies';
import { DUNGEONS, TOWN_MAP } from '../data/world';
import { hashStr, mulberry32, rint, rpick } from '../rng';
import type { GameState, QuestDef } from '../types';
import { LEVEL_CAP, clamp, zoneAt } from './core';

/** Notice boards also post three procedurally generated bounties per town, refreshed every six days. */
export const BOUNTY_DAYS = 6;
const id = (town: string, week: number, slot: number) => `b:${town}:${week}:${slot}`;
export const isBounty = (qid: string) => qid.startsWith('b:');

function build(town: string, week: number, slot: number): QuestDef | null {
  const t = TOWN_MAP.get(town);
  if (!t) return null;
  const rng = mulberry32(hashStr(id(town, week, slot)));
  const zone = zoneAt(t.pos[0], t.pos[1]);
  const L = clamp(zone.lvl + rint(rng, 0, 2), 1, LEVEL_CAP);
  const giver = rpick(rng, t.npcs).name;
  const kind = slot === 2 ? 'clear' : slot === 1 && rng() < 0.5 ? 'elite' : 'kill';
  if (kind === 'clear') {
    const near = DUNGEONS.filter(d => !d.mainBoss && d.lvl <= zone.lvl + 6 && d.lvl >= zone.lvl - 10).sort((a, b) => Math.hypot(a.pos[0] - t.pos[0], a.pos[1] - t.pos[1]) - Math.hypot(b.pos[0] - t.pos[0], b.pos[1] - t.pos[1]));
    const d = near[Math.floor(rng() * Math.min(3, near.length))];
    if (d) return { id: id(town, week, slot), town, giver, title: `Bounty: Clean out ${d.name.replace(/^The /, '')}`, text: `The board pays well for anyone who will go into ${d.name} and put its warden down.`, goal: { type: 'clear', count: 1, label: `Defeat the guardian of ${d.name}`, target: d.id }, reward: { gold: Math.round(120 + d.lvl * 34), xp: Math.round(60 + d.lvl * 30) }, bounty: true };
  }
  if (kind === 'elite') {
    const n = rint(rng, 2, 4);
    return { id: id(town, week, slot), town, giver, title: 'Bounty: Named Horrors', text: 'Something large has been hunting travellers. Put down a few of the named ones and the Watch will pay.', goal: { type: 'elites', count: n, label: 'Slay elite foes' }, reward: { gold: Math.round(n * (30 + L * 6)), xp: Math.round(n * (30 + L * 5)) }, bounty: true };
  }
  const pool = zone.pool.filter(e => ENEMY_MAP.has(e));
  const foe = ENEMY_MAP.get(rpick(rng, pool))!;
  const n = rint(rng, 5, 10);
  return { id: id(town, week, slot), town, giver, title: `Bounty: ${foe.name}`, text: `The roads around ${t.name} are thick with ${foe.name.toLowerCase()}s. ${giver} is paying by the head.`, goal: { type: 'kill', count: n, label: `Slay ${foe.name}s`, target: foe.id }, reward: { gold: Math.round(n * (7 + L * 3.2)), xp: Math.round(n * (9 + L * 4.4)) }, bounty: true };
}

export function bountyBoard(s: GameState, town: string): QuestDef[] {
  const week = Math.floor(s.day / BOUNTY_DAYS);
  return [0, 1, 2].map(i => build(town, week, i)).filter((q): q is QuestDef => !!q && !s.completedQuests.includes(q.id) && !s.quests.some(a => a.id === q.id));
}

export function bountyById(qid: string): QuestDef | null {
  const [, town, week, slot] = qid.split(':');
  return build(town, Number(week), Number(slot));
}
