import { EVENT_MAP } from '../data/events';
import { SCENE_MAP } from '../data/scenes';
import { MAIN, MAIN_INDEX, SPEAKERS } from '../data/story';
import { TOWN_MAP, TOWNS, TRIGGERS } from '../data/world';
import type { Choice, DChoice, DNode, Eff, GameState, NpcDef, SceneDef, Speaker, Stat, StoryEvent } from '../types';
import { areaLevel, clampVitals, hooks, item, pick, push, rand, save, scaleAmt, scaleSan, stats, type EffResult } from './core';
import { closeOverlay, enqueue, showOverlay } from './flow';
import { addItem, addLore, gainXp, removeItem, rollConsumable, rollGear } from './loot';
import { acceptQuest, cond, questEvent } from './quests';

export function markEntDone(s: GameState) {
  const id = s.flags._ent;
  const f = s.run?.floors[s.run.floor];
  const ent = f?.ents.find(x => x.id === id);
  if (ent) ent.done = true;
}

export const currentStep = (s: GameState) => MAIN[Math.min(s.main, MAIN.length - 1)];

export function unlockLoc(s: GameState, id: string) { if (!s.world.known.includes(id)) s.world.known.push(id) }

export function setMain(s: GameState, id: string) {
  const idx = MAIN_INDEX.get(id);
  if (idx === undefined || idx <= s.main) return;
  s.main = idx;
  const step = MAIN[idx];
  if (step.at) unlockLoc(s, step.at);
  push(s, `Main quest: ${step.title}`, 'epic');
}

const luck = (s: GameState) => 1 + stats(s).luck / 100 + (s.talents.includes('scavenger') ? 0.15 : 0);

export function runEffects(s: GameState, effs: Eff[]): EffResult {
  const r: EffResult = { gold: 0, xp: 0, items: [], lines: [], ended: false, fought: false };
  const L = Math.max(1, areaLevel(s));
  const note = (t: string) => { r.lines.push(t) };
  const run = (list: Eff[]) => {
    for (const e of list) {
      if (r.fought || r.ended) return;
      switch (e.t) {
        case 'flag': if (e.k === '__done') markEntDone(s); else s.flags[e.k] = e.v ?? 1; break;
        case 'inc': s.flags[e.k] = (s.flags[e.k] ?? 0) + (e.n ?? 1); break;
        case 'gold': s.gold += e.n; r.gold += e.n; if (e.n < 0) note(`${e.n} gold`); break;
        case 'goldR': { const n = Math.round(rand(e.lo, e.hi) * (1 + L * 0.22) * luck(s)); s.gold += n; r.gold += n; break }
        case 'xp': gainXp(s, e.n, r.lines); r.xp += e.n; break;
        case 'xpL': { const n = Math.round(s.xpNext * e.m); gainXp(s, n, r.lines); r.xp += n; break }
        case 'item': addItem(s, e.id, e.n ?? 1); for (let i = 0; i < (e.n ?? 1); i++) r.items.push(e.id); questEvent(s, { type: 'fetch' }); break;
        case 'take': removeItem(s, e.id); break;
        case 'loot': for (let i = 0; i < (e.n ?? 1); i++) { const d = rollGear(s, e.min ?? 'common', L); addItem(s, d.id); r.items.push(d.id) } break;
        case 'consumable': for (let i = 0; i < (e.n ?? 1); i++) { const d = rollConsumable(s, L); addItem(s, d.id); r.items.push(d.id) } break;
        case 'hp': { const n = scaleAmt(s, e.n); s.hp = Math.max(1, s.hp + n); note(n < 0 ? `${n} health` : `+${n} health`); break }
        case 'hpPct': { const n = Math.round((stats(s).maxHp * e.n) / 100); s.hp = Math.max(1, s.hp + n); note(n < 0 ? `${n} health` : `+${n} health`); break }
        case 'san': { const n = scaleSan(s, e.n); s.sanity += n; note(n < 0 ? `${n} sanity` : `+${n} sanity`); break }
        case 'corrupt': s.corruption = Math.max(0, s.corruption + e.n); if (e.n) note(`${e.n > 0 ? '+' : ''}${e.n} corruption`); break;
        case 'supplies': s.supplies = Math.max(0, s.supplies + e.n); note(`${e.n > 0 ? '+' : ''}${e.n} supplies`); break;
        case 'stat': s[e.k] = Math.max(1, s[e.k] + e.n); note(`${e.n > 0 ? '+' : ''}${e.n} ${e.k[0].toUpperCase() + e.k.slice(1)}`); break;
        case 'restore': s.hp = stats(s).maxHp; s.sanity = stats(s).maxSanity; s.status = {}; note('Fully restored.'); break;
        case 'main': setMain(s, e.to); break;
        case 'quest': acceptQuest(s, e.id, true); break;
        case 'lore': { const t = addLore(s, e.id); if (t) note(`Lore recovered: ${t}`); else if (!e.id) { const g = Math.round(20 * (1 + L * 0.2)); s.gold += g; r.gold += g } break }
        case 'unlock': unlockLoc(s, e.loc); break;
        case 'fight': {
          hooks.startFight(s, e.enemy, e.rank ?? 'normal', { win: e.win, noFlee: e.noFlee, from: s.run ? 'dungeon' : 'scene' });
          r.fought = true;
          break;
        }
        case 'rand': run(Math.random() < e.p ? e.eff : e.else ?? []); break;
        case 'log': push(s, e.text, e.tone ?? 'plain'); note(e.text); break;
        case 'end': s.ending = e.id; s.main = MAIN.length - 1; s.flags[`ending_${e.id}`] = 1; enqueue(s, { k: 'ending', id: e.id }, true); r.ended = true; break;
        case 'goto': r.goto = e.node; break;
        case 'sigil': if (s.run) s.run.sigil = e.k; else s.flags.pending_sigil = ['blade', 'ward', 'eye'].indexOf(e.k) + 1; note(`Sigil: ${e.k === 'blade' ? 'Blades' : e.k === 'ward' ? 'Warding' : 'the Open Eye'}`); break;
        case 'key': if (s.run) s.run.keys += e.n; note(`+${e.n} key`); break;
        case 'reveal': if (s.run) { const f = s.run.floors[s.run.floor]; if (f) f.seen = '1'.repeat(f.w * f.h); note('The floor is revealed to you.') } break;
        case 'companion': s.companion = e.name; break;
        case 'scene': enqueue(s, { k: 'scene', id: e.id }); break;
      }
    }
  };
  run(effs);
  clampVitals(s);
  return r;
}
hooks.runEffects = runEffects;

const DYN = new Map<string, SceneDef>();
export const getScene = (id: string) => SCENE_MAP.get(id) ?? DYN.get(id);

export function npcSpeaker(id: string): Speaker | undefined {
  for (const t of TOWNS) { const n = t.npcs.find(x => x.id === id); if (n) return { name: n.name, title: n.title, icon: n.icon } }
  return undefined;
}
export function speaker(who?: string): Speaker {
  if (!who) return SPEAKERS.narrator;
  if (SPEAKERS[who]) return SPEAKERS[who];
  return npcSpeaker(who.replace('npc:', '')) ?? SPEAKERS.narrator;
}

export function currentNode(s: GameState): DNode | undefined {
  const def = s.scene && getScene(s.scene.id);
  return def?.nodes.find(n => n.id === s.scene?.node);
}
export const visibleChoices = (s: GameState, n?: DNode): DChoice[] => (n?.choices ?? []).filter(c => cond(s, c.cond));

const DEFER = new Set(['fight', 'end', 'scene']);

function enterNode(s: GameState) {
  const node = currentNode(s);
  if (!node || !s.scene) return;
  s.scene.log = [];
  s.scene.pending = [];
  if (!node.eff) return;
  s.scene.pending = node.eff.filter(e => DEFER.has(e.t));
  const r = runEffects(s, node.eff.filter(e => !DEFER.has(e.t)));
  s.scene.log = r.lines;
  if (r.goto) jump(s, r.goto);
}

function jump(s: GameState, id?: string) {
  const def = s.scene && getScene(s.scene.id);
  if (!s.scene || !def) return endScene(s);
  const node = id ? def.nodes.find(n => n.id === id) : undefined;
  if (!node) return endScene(s);
  s.scene.node = node.id;
  enterNode(s);
}

export function startScene(s: GameState, id: string) {
  const def = getScene(id);
  if (!def) return;
  s.scene = { id, node: def.nodes[0].id, log: [] };
  showOverlay(s, 'dialogue');
  enterNode(s);
}
hooks.startScene = startScene;

export function endScene(s: GameState) {
  s.scene = null;
  if (s.screen === 'dialogue') closeOverlay(s);
  save(s);
}

function runPending(s: GameState): boolean {
  const pend = s.scene?.pending ?? [];
  if (s.scene) s.scene.pending = [];
  if (!pend.length) return false;
  const r = runEffects(s, pend);
  if (r.ended) { endScene(s); return true }
  if (r.fought) { s.scene = null; return true }
  return false;
}

function nextOf(s: GameState, node: DNode, override?: string): string | undefined {
  if (override) return override;
  if (node.next) return node.next;
  const def = getScene(s.scene!.id)!;
  return def.nodes[def.nodes.findIndex(n => n.id === node.id) + 1]?.id;
}

export function sceneAdvance(s: GameState) {
  const node = currentNode(s);
  if (!node || !s.scene) return;
  if (visibleChoices(s, node).length) return;
  if (runPending(s)) return;
  jump(s, nextOf(s, node));
  save(s);
}

export function sceneChoose(s: GameState, i: number) {
  const node = currentNode(s);
  if (!node || !s.scene) return;
  const ch = visibleChoices(s, node)[i];
  if (!ch) return;
  if (runPending(s)) return;
  let target = ch.next;
  if (ch.check) {
    const win = rand(1, 12) + stats(s)[ch.check.stat] >= ch.check.dc;
    target = win ? ch.check.pass : ch.check.fail;
  }
  if (ch.eff) {
    const r = runEffects(s, ch.eff);
    if (r.ended) return endScene(s);
    if (r.fought) { s.scene = null; return }
    if (r.goto) target = r.goto;
  }
  jump(s, nextOf(s, node, target));
  save(s);
}

export function locationTriggers(s: GameState, loc: string) {
  TRIGGERS.filter(t => t.loc === loc && cond(s, t.cond) && !s.flags[`seen_${t.scene}`]).forEach(t => {
    s.flags[`seen_${t.scene}`] = 1;
    enqueue(s, { k: 'scene', id: t.scene });
  });
}

export function findNpc(townId: string, npcId: string): NpcDef | undefined { return TOWN_MAP.get(townId)?.npcs.find(n => n.id === npcId) }

export function talkNpc(s: GameState, townId: string, npcId: string) {
  const npc = findNpc(townId, npcId);
  if (!npc) return;
  questEvent(s, { type: 'talk', id: npcId });
  const variant = npc.talk?.find(t => cond(s, t.cond));
  if (variant) { startScene(s, variant.scene); save(s); return }
  const first = !s.flags[`met_${npcId}`];
  s.flags[`met_${npcId}`] = 1;
  const nodes: DNode[] = [];
  if (first) nodes.push({ id: '0', who: 'narrator', text: npc.greeting });
  nodes.push({ id: String(nodes.length), who: `npc:${npcId}`, text: pick(npc.idle) });
  DYN.set(`idle:${npcId}`, { id: `idle:${npcId}`, art: TOWN_MAP.get(townId)?.art, nodes });
  startScene(s, `idle:${npcId}`);
  save(s);
}

export const checkDc = (s: GameState) => 11 + Math.floor(areaLevel(s) / 3);
export function checkChance(s: GameState, stat: Stat, dc?: number) {
  const target = dc ?? checkDc(s);
  const value = stats(s)[stat];
  let wins = 0;
  for (let roll = 1; roll <= 12; roll++) if (roll + value >= target) wins++;
  return Math.round((wins / 12) * 100);
}

export function canAfford(s: GameState, c: Choice) {
  const hpCost = c.cost?.hp ? Math.round((stats(s).maxHp * c.cost.hp) / 100) : 0;
  return (c.cost?.supplies ?? 0) <= s.supplies && (c.cost?.gold ?? 0) <= s.gold && hpCost < s.hp && cond(s, c.cond);
}

export function openEvent(s: GameState, ev: StoryEvent) {
  s.event = structuredClone(ev);
  showOverlay(s, 'event');
}
export function openEventById(s: GameState, id: string) {
  const ev = EVENT_MAP.get(id);
  if (ev) openEvent(s, ev);
}

export function resolveEvent(s: GameState, index: number) {
  const c = s.event?.choices[index];
  if (!c || s.screen !== 'event' || !canAfford(s, c)) return;
  const st = stats(s);
  s.supplies -= c.cost?.supplies ?? 0;
  s.gold -= c.cost?.gold ?? 0;
  if (c.cost?.hp) s.hp -= Math.round((st.maxHp * c.cost.hp) / 100);
  const lines: string[] = [];
  let success = true;
  if (c.check) {
    const dc = c.check.dc ?? checkDc(s);
    success = rand(1, 12) + st[c.check.stat] >= dc;
    lines.push(`${c.check.stat.toUpperCase()} check ${success ? 'succeeded' : 'failed'}.`);
  }
  const r = runEffects(s, success ? c.eff : c.fail ?? [{ t: 'log', text: 'It does not go well.', tone: 'bad' }]);
  lines.push(...r.lines);
  s.eventsSeen++;
  questEvent(s, { type: 'events' });
  s.event = null;
  s.hp = Math.max(1, s.hp);
  clampVitals(s);
  if ((s.screen as string) === 'combat') { lines.forEach(l => push(s, l, 'bad')); save(s); return }
  const base = Math.round(s.xpNext * 0.04);
  gainXp(s, base, lines);
  enqueue(s, { k: 'reward', reward: { title: 'Aftermath', gold: r.gold, xp: r.xp + base, items: r.items, lines, icon: 'quest' } }, true);
  closeOverlay(s);
  save(s);
}

export function itemName(id: string) { return item(id)?.name ?? id }
