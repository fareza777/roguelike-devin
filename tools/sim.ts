/**
 * Balance and playtime simulator.
 *   npx tsx tools/sim.ts            # both reports
 *   npx tsx tools/sim.ts combat     # combat balance only
 *   npx tsx tools/sim.ts time       # main-path playtime estimate only
 *
 * Combat: a scripted hero of level L (gear tier one step behind, 2 attribute points per level, a sensible skill kit and potions)
 * fights each dungeon's creatures, elite and boss at the dungeon's area levels.
 * Playtime: walks the main story in order (Part I, the six Regalia arcs, Part III) and adds travel, dungeon floors (counted
 * from the real generator), fights, dialogue reading and any grinding needed to reach the recommended level.
 */
import { ARCS } from '../src/data/arcs';
import { ENEMY_MAP } from '../src/data/enemies';
import { ITEM_MAP } from '../src/data/items';
import { SKILLS, TALENTS } from '../src/data/skills';
import { MAIN } from '../src/data/story';
import { SCENE_MAP } from '../src/data/scenes';
import { DUNGEONS, DUNGEON_MAP, TOWN_MAP } from '../src/data/world';
import * as G from '../src/engine/game';
import { genFloor } from '../src/engine/dungeongen';
import { getWorld } from '../src/engine/worldgen';
import type { Enemy, GameState, Slot } from '../src/types';

// quiet persistence in node
(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined, clear: () => undefined, key: () => null, length: 0 };

const SLOTS_GEAR: [Slot, (t: number) => string][] = [
  ['weapon', t => `w_blade_${t}`], ['head', t => `a_head_heavy_${t}`], ['body', t => `a_body_heavy_${t}`], ['hands', t => `a_hands_heavy_${t}`],
  ['feet', t => `a_feet_heavy_${t}`], ['offhand', t => `x_shield_${t}`], ['ring', t => `x_signet_${t}`], ['amulet', t => `x_pendant_${t}`],
];

function hero(L: number, gearLag = 3): GameState {
  const s = G.fresh('Wayfarer');
  s.name = 'Sim'; s.origin = 'Grave Warden'; s.path = 'Vanguard'; s.companion = 'Moth';
  G.setup(s);
  s.level = L; s.xpNext = G.xpFor(L);
  const pts = 2 * (L - 1);
  s.vigor += Math.round(pts * 0.5); s.cunning += Math.round(pts * 0.3); s.will += Math.round(pts * 0.2);
  const tier = G.tierForLevel(Math.max(1, L - gearLag));
  for (const [slot, id] of SLOTS_GEAR) { const key = id(tier); if (ITEM_MAP.has(key)) s.equipment[slot] = key }
  // a modest upgrade track: +1 per 6 levels inside a tier
  const kit = SKILLS.filter(k => k.school === 'Steel' && k.level <= L).sort((a, b) => b.mult * (b.hits ?? 1) - a.mult * (a.hits ?? 1));
  s.skills = [...new Set(['sever', ...kit.map(k => k.id)])]; s.loadout = s.skills.slice(0, 6);
  const heal = tier >= 4 ? 'lifeblood' : tier >= 3 ? 'panacea' : tier >= 2 ? 'restorative' : tier >= 1 ? 'draught' : 'tonic';
  const calm = tier >= 4 ? 'lucid' : tier >= 2 ? 'stillwater' : tier >= 1 ? 'lullaby' : 'tallow';
  for (let i = 0; i < 6; i++) s.inventory.push(heal);
  for (let i = 0; i < 3; i++) s.inventory.push(calm);
  s.talentPoints = L - 1;
  TALENTS.filter(t => t.tree === 'Steel').forEach(t => { try { G.learnTalent(s, t.id) } catch { /* ignore */ } });
  const st = G.stats(s);
  s.hp = st.maxHp; s.sanity = st.maxSanity;
  return s;
}

interface Result { win: boolean; turns: number; hpLost: number; potions: number }
function fight(L: number, enemyId: string, rank: Enemy['rank'], lvl: number): Result {
  const s = hero(L);
  const st = G.stats(s);
  s.screen = 'world'; s.ret = 'world'; s.town = null;
  G.startFight(s, enemyId, rank, { lvl, noFlee: true });
  let turns = 0, potions = 0;
  const heal = s.inventory.find(i => ITEM_MAP.get(i)?.use?.hp || ITEM_MAP.get(i)?.use?.hpPct) ?? '';
  const calm = s.inventory.find(i => ITEM_MAP.get(i)?.use?.sanity && !ITEM_MAP.get(i)?.use?.hp) ?? '';
  while (s.enemy && s.screen === 'combat' && turns < 120) {
    turns++;
    if (s.hp < st.maxHp * 0.38 && heal && s.inventory.includes(heal)) { G.useItem(s, heal); potions++; s.anim = []; continue }
    if (s.sanity < st.maxSanity * 0.3 && calm && s.inventory.includes(calm)) { G.useItem(s, calm); potions++; s.anim = []; continue }
    const ready = s.loadout.filter(id => (s.cooldowns[id] ?? 0) <= 0 && G.canUse(s, id));
    const sk = ready.sort((a, b) => (SKILLS.find(k => k.id === b)!.mult * (SKILLS.find(k => k.id === b)!.hits ?? 1)) - (SKILLS.find(k => k.id === a)!.mult * (SKILLS.find(k => k.id === a)!.hits ?? 1)))[0];
    if (sk && s.sanity > 12) G.useSkill(s, sk); else G.attack(s);
    s.anim = [];
  }
  const win = !s.enemy && s.screen !== 'death';
  return { win, turns, hpLost: Math.max(0, 1 - s.hp / st.maxHp), potions };
}

function batch(L: number, id: string, rank: Enemy['rank'], lvl: number, n = 24) {
  const r: Result[] = [];
  for (let i = 0; i < n; i++) r.push(fight(L, id, rank, lvl));
  const w = r.filter(x => x.win);
  return { win: w.length / n, turns: w.reduce((a, x) => a + x.turns, 0) / Math.max(1, w.length), hp: w.reduce((a, x) => a + x.hpLost, 0) / Math.max(1, w.length), pot: r.reduce((a, x) => a + x.potions, 0) / n };
}

const f = (x: number, d = 0) => x.toFixed(d);
function combatReport() {
  console.log('\n== COMBAT BALANCE (hero at the dungeon level, gear 3 levels behind, 6 heals + 3 sanity) ==');
  console.log('dungeon'.padEnd(18), 'Lv'.padStart(3), '  normal win/turns/hp%      elite win/turns/hp%       boss win/turns/hp%/pots');
  const bad: string[] = [];
  for (const d of [...DUNGEONS].sort((a, b) => a.lvl - b.lvl)) {
    const L = d.lvl + Math.min(1, d.floors - 1);
    const normal = batch(L, d.enemies[0], 'normal', L, 16);
    const elite = batch(L, d.elite, 'elite', L, 12);
    const boss = batch(L, d.boss, 'boss', L + d.floors - 1, 16);
    console.log(d.id.padEnd(18), String(L).padStart(3), `   ${f(normal.win * 100)}%/${f(normal.turns, 1)}/${f(normal.hp * 100)}%`.padEnd(26), `${f(elite.win * 100)}%/${f(elite.turns, 1)}/${f(elite.hp * 100)}%`.padEnd(24), `${f(boss.win * 100)}%/${f(boss.turns, 1)}/${f(boss.hp * 100)}%/${f(boss.pot, 1)}`);
    if (normal.win < 0.92 || elite.win < 0.8 || boss.win < 0.55) bad.push(`${d.id} (normal ${f(normal.win * 100)}, elite ${f(elite.win * 100)}, boss ${f(boss.win * 100)})`);
    if (normal.turns > 9 || boss.turns > 28) bad.push(`${d.id} drags (normal ${f(normal.turns, 1)} turns, boss ${f(boss.turns, 1)})`);
  }
  console.log(bad.length ? `\nOUT OF BAND:\n  ${bad.join('\n  ')}` : '\nAll fights inside the target band.');
}

// ------------------------------------------------------------------ playtime
const SEC = { step: 0.32, turn: 4.4, fightPad: 5, interact: 7, wordsPerSec: 4.2, townChores: 150 };
const words = (txt: string) => txt.split(/\s+/).length;
const sceneWords = (id: string) => (SCENE_MAP.get(id)?.nodes ?? []).reduce((a, n) => a + words(n.text), 0) * 0.62; // average path through branches

interface Loc { x: number; y: number }
const locOf = (id: string): Loc | null => { const t = TOWN_MAP.get(id); if (t) return { x: t.pos[0], y: t.pos[1] }; const d = DUNGEON_MAP.get(id); return d ? { x: d.pos[0], y: d.pos[1] } : null };
const dist = (a: Loc, b: Loc) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/** Seconds spent clearing a dungeon: count real entities from the generator. */
function dungeonSeconds(id: string, heroLv: number) {
  const d = DUNGEON_MAP.get(id)!;
  let total = 0, kills = 0, xp = 0, floors = 0;
  for (let fl = 0; fl < d.floors; fl++) {
    const fo = genFloor(d, fl, 4242 + fl, { bossRespawn: false, mainCleared: false });
    const walk = fo.tiles.split('').filter(c => c === '.' || c === ',').length;
    const enemies = fo.ents.filter(e => e.k === 'enemy').length;
    const boss = fo.ents.filter(e => e.k === 'boss').length;
    const other = fo.ents.filter(e => !['enemy', 'boss', 'exit'].includes(e.k)).length;
    const L = d.lvl + fl;
    const enemy = ENEMY_MAP.get(d.enemies[0])!;
    const t = Math.max(3.5, 4 + 0.07 * Math.max(0, L - heroLv) * -1 + L / 14);
    total += walk * 0.62 * SEC.step + enemies * (t * SEC.turn + SEC.fightPad) + boss * (14 * SEC.turn + 20) + other * SEC.interact + 25;
    kills += enemies + boss * 5;
    xp += enemies * (10 + 5.5 * L) + boss * (10 + 5.5 * L) * 5;
    floors++; void enemy;
  }
  return { sec: total, kills, xp, floors };
}

function timeReport() {
  const order: { name: string; at: string; kind: 'main' | 'arc'; dung?: string }[] = [];
  for (const m of MAIN) order.push({ name: `${m.id} ${m.title}`, at: m.at ?? 'veyrgard', kind: 'main' });
  // insert Part II arcs after the hub step
  const hub = order.findIndex(o => o.name.startsWith('r00'));
  const arcs = ARCS.flatMap(a => a.steps.map((st, i) => ({ name: `${a.id}.${i + 1} ${st.title}`, at: st.at ?? 'veyrgard', kind: 'arc' as const, dung: st.goal?.type === 'clear' ? st.goal.target : undefined })));
  order.splice(hub + 1, 0, ...arcs);
  let pos: Loc = locOf('veyrgard')!;
  let lvl = 1, xp = 0, seconds = 0;
  const parts: Record<string, number> = { Part1: 0, Part2: 0, Part3: 0 };
  let part = 'Part1';
  let grind = 0, travel = 0, dun = 0, talk = 0, fights = 0;
  const xpNeed = (L: number) => G.xpFor(L);
  const gain = (n: number) => { xp += n; while (lvl < 60 && xp >= xpNeed(lvl)) { xp -= xpNeed(lvl); lvl++ } };
  for (const o of order) {
    if (o.name.startsWith('r00')) part = 'Part2';
    if (o.name.startsWith('m21')) part = 'Part3';
    const loc = locOf(o.at);
    let t = 0;
    if (loc) {
      const d = dist(pos, loc);
      const walkSteps = d * 1.18;
      const enc = walkSteps * 0.045 * 1.25;
      const zoneL = Math.min(60, Math.max(1, Math.round(lvl)));
      const tf = (2.8 + zoneL / 16) * SEC.turn + SEC.fightPad;
      t += walkSteps * SEC.step + enc * tf;
      travel += walkSteps * SEC.step + enc * tf; fights += enc;
      gain(enc * (10 + 5.5 * zoneL));
      pos = loc;
    }
    const dg = DUNGEON_MAP.get(o.at) ?? (o.dung ? DUNGEON_MAP.get(o.dung) : undefined);
    if (dg && (o.name.match(/\b(Descend|Quarry|Pass|Ashwood|Catacombs|Undercity|Meridian|Orangery|Cistern|Grottos|Armada|Gear|Vaults|Engine|Halls|Library|Observatory|Mere|Keep|Palace|Unsinking|Heartbriar|Conservatory|Pruning|Index|Barrows|Whale)\b/i) || (MAIN.find(m => `${m.id} ${m.title}` === o.name)?.at === dg.id) || o.dung === dg.id)) {
      const need = Math.max(1, dg.lvl - 1);
      if (lvl < need) { // grind to the recommended level on the way
        let g = 0;
        const zL = Math.max(1, lvl);
        const perFight = 10 + 5.5 * zL, perSec = perFight / ((2.8 + zL / 16) * SEC.turn + SEC.fightPad + 9 * SEC.step);
        while (lvl < need && g < 40000) { gain(perSec * 20); g += 20 }
        seconds += g; grind += g; part && (parts[part] += g);
      }
      const r = dungeonSeconds(dg.id, lvl);
      t += r.sec; dun += r.sec; fights += r.kills;
      gain(r.xp);
    }
    // kill goals counted separately
    const arcStep = o.kind === 'arc' ? ARCS.find(a => o.name.startsWith(a.id + '.'))?.steps[Number(o.name.split(' ')[0].split('.')[1]) - 1] : undefined;
    const mainStep = o.kind === 'main' ? MAIN.find(m => `${m.id} ${m.title}` === o.name) : undefined;
    const goal = arcStep?.goal ?? mainStep?.goal;
    if (goal && (goal.type === 'killTag' || goal.type === 'kill' || goal.type === 'elites')) {
      const L = Math.max(1, lvl);
      const tf = (2.8 + L / 16) * SEC.turn + SEC.fightPad + 8 * SEC.step;
      const tt = goal.count * tf; t += tt; fights += goal.count; gain(goal.count * (10 + 5.5 * L));
    }
    // dialogue and town chores
    const chores = (o.at && TOWN_MAP.has(o.at)) ? SEC.townChores : 20;
    const scenes = [...SCENE_MAP.values()].filter(sc => sc.nodes.some(n => n.text) && (sc.id.includes(o.at) || false)).length;
    void scenes;
    t += chores; talk += chores;
    seconds += t; parts[part] += t;
  }
  // Story scenes: every scene reachable on the main path, read at reading speed
  const readSec = [...SCENE_MAP.values()].filter(sc => /^(s_|g_)/.test(sc.id)).reduce((a, sc) => a + sceneWords(sc.id) / SEC.wordsPerSec, 0);
  seconds += readSec; talk += readSec;
  console.log('\n== MAIN-PATH PLAYTIME ESTIMATE (no optional contracts, one run) ==');
  console.log(`Part I   (Veyrgard to the Reveal):   ${f(parts.Part1 / 3600, 1)} h`);
  console.log(`Part II  (the six Regalia):          ${f(parts.Part2 / 3600, 1)} h`);
  console.log(`Part III (Solenne to the Meridian):  ${f(parts.Part3 / 3600, 1)} h`);
  console.log(`+ story scenes read:                 ${f(readSec / 3600, 1)} h`);
  console.log(`TOTAL ${f(seconds / 3600, 1)} h   (travel ${f(travel / 3600, 1)} h, dungeons ${f(dun / 3600, 1)} h, grind ${f(grind / 3600, 1)} h, talk/chores ${f(talk / 3600, 1)} h, ~${Math.round(fights)} fights)`);
  console.log(`Level reached at the end of the main path: ${lvl} (cap 60)`);
  void (getWorld);
  return seconds / 3600;
}

const mode = process.argv[2] ?? 'all';
if (mode === 'all' || mode === 'combat') combatReport();
if (mode === 'all' || mode === 'time') timeReport();
