import { COMPANION_MAP } from '../data/companions';
import { ENEMY_MAP } from '../data/enemies';
import { SKILL_MAP, rankMult } from '../data/skills';
import { DUNGEON_MAP, ZONES } from '../data/world';
import type { Anim, Eff, Enemy, EnemyDef, GameState, Intent, IntentKind, Role, Status } from '../types';
import {
  areaLevel, clampVitals, clearSave, fxAdd, hooks, item, mitigation, pick, push, rand, save, stats, zoneAt,
} from './core';
import { closeOverlay, enqueue, showOverlay } from './flow';
import { goldFor, rollDrops, xpForKill, gainXp } from './loot';
import { questEvent } from './quests';

const ROLE: Record<Role, { hp: number; dmg: number; arm: number }> = {
  brute: { hp: 1.15, dmg: 1.15, arm: 1 }, skirmisher: { hp: 0.85, dmg: 1.05, arm: 0.7 }, caster: { hp: 0.8, dmg: 0.85, arm: 0.6 },
  tank: { hp: 1.3, dmg: 0.8, arm: 1.5 }, swarm: { hp: 0.7, dmg: 0.8, arm: 0.5 },
};

export const anim = (s: GameState, a: Anim) => { s.anim.push(a) };

export function scaleEnemy(def: EnemyDef, rank: Enemy['rank'], L: number): Enemy {
  const r = ROLE[def.role];
  const hpRank = rank === 'elite' ? 2.1 : rank === 'boss' ? (def.hpMul ?? 4) : 1;
  const dmgRank = (rank === 'elite' ? 1.2 : rank === 'boss' ? 1.35 : 1) * (def.dmgMul ?? 1);
  const hp = Math.round((16 + 4.6 * L) * r.hp * hpRank + (rank === 'normal' ? rand(-2, 3) : 0));
  const lo = Math.max(1, Math.round((2 + 0.55 * L) * r.dmg * dmgRank));
  const hi = Math.max(lo + 1, Math.round((4.5 + 0.9 * L) * r.dmg * dmgRank));
  const armor = Math.round((0.5 * L + 1) * r.arm * (rank === 'boss' ? 1.25 : 1)) + (def.armorAdd ?? 0);
  const e: Enemy = {
    id: def.id, name: def.name, icon: def.icon, art: def.art, look: def.look, hp, maxHp: hp, damage: [lo, hi], armor, moves: def.moves, afflict: def.afflict, rank,
    dread: (def.dread ?? (def.role === 'caster' ? 3 : 1)) + Math.floor(L / 9), intent: { kind: 'attack', label: '', value: 0 }, status: {}, turn: 0, lvl: L, tags: def.tags,
  };
  e.intent = rollIntent(e);
  return e;
}

export function rollIntent(e: Enemy): Intent {
  const kind = Math.random() < 0.25 ? pick(e.moves) : e.moves[e.turn % e.moves.length];
  const [lo, hi] = e.damage;
  const avg = Math.round((lo + hi) / 2);
  switch (kind) {
    case 'heavy': return { kind, label: 'HEAVY BLOW', value: Math.round(avg * 1.8) };
    case 'dread': return { kind, label: 'DREAD', value: e.dread + 2 };
    case 'guard': return { kind, label: 'GUARD', value: 0 };
    case 'afflict': return { kind, label: (e.afflict ?? 'bleed').toUpperCase(), value: Math.round(avg * 0.6), status: e.afflict ?? 'bleed' };
    default: return { kind: 'attack', label: 'ATTACK', value: avg };
  }
}

type FightOpts = { entId?: number; win?: Eff[]; noFlee?: boolean; boss?: string; from?: 'dungeon' | 'world' | 'scene'; sneak?: boolean; lvl?: number };

export function resolveEnemyId(s: GameState, token: string): string {
  if (token !== '@normal' && token !== '@elite') return token;
  if (s.run) { const d = DUNGEON_MAP.get(s.run.dungeon)!; return token === '@elite' ? d.elite : pick(d.enemies) }
  const z = zoneAt(s.world.x, s.world.y) ?? ZONES[0];
  return token === '@elite' ? z.elite : pick(z.pool);
}

export function startFight(s: GameState, token: string, rank: Enemy['rank'], o: FightOpts = {}) {
  const id = resolveEnemyId(s, token);
  const def = ENEMY_MAP.get(id)!;
  const L = o.lvl ?? areaLevel(s);
  s.enemy = scaleEnemy(def, rank, L);
  s.fight = { win: o.win, from: o.from ?? (s.run ? 'dungeon' : s.screen === 'world' || s.ret === 'world' ? 'world' : 'scene'), entId: o.entId, noFlee: o.noFlee, boss: o.boss };
  s.guarding = false;
  s.cooldowns = {};
  s.companionCharge = 0;
  s.fx = [];
  s.anim = [];
  s.flags.lastbreath_used = 0;
  s.flags._opened = 0;
  if (o.sneak) s.enemy.status.marked = 2;
  s.log.unshift({ tone: rank === 'normal' ? 'bad' : 'epic', text: o.sneak ? `You catch ${s.enemy.name} unaware.` : `${s.enemy.name} ${rank === 'boss' ? 'rises to meet you' : 'blocks your path'}.` });
  showOverlay(s, 'combat');
  save(s);
}
hooks.startFight = startFight;

const has = (s: GameState, id: string) => s.talents.includes(id);
const bonusTurns = (s: GameState) => (has(s, 'hexmaster') ? 1 : 0);

function applyStatus(target: Partial<Record<Status, number>>, status: Status, turns: number) { target[status] = Math.max(target[status] ?? 0, turns) }
function afflictEnemy(s: GameState, status: Status, turns: number) {
  const e = s.enemy!;
  applyStatus(e.status, status, turns + bonusTurns(s));
  anim(s, { t: 'status', who: 'enemy', status });
  fxAdd(s, 'enemy', status.toUpperCase(), 'status');
}
function afflictSelf(s: GameState, status: Status, turns: number) {
  applyStatus(s.status, status, turns);
  anim(s, { t: 'status', who: 'player', status });
}

function heal(s: GameState, n: number, kind: 'heal' | 'sanity' = 'heal') {
  if (n <= 0) return;
  const st = stats(s);
  if (kind === 'heal') { const before = s.hp; s.hp = Math.min(st.maxHp, s.hp + n); if (s.hp > before) { fxAdd(s, 'player', `+${s.hp - before}`, 'heal'); anim(s, { t: 'heal', who: 'player', n: s.hp - before, kind: 'hp' }) } }
  else { const before = s.sanity; s.sanity = Math.min(st.maxSanity, s.sanity + n); if (s.sanity > before) { fxAdd(s, 'player', `+${s.sanity - before}◉`, 'heal'); anim(s, { t: 'heal', who: 'player', n: s.sanity - before, kind: 'sanity' }) } }
}

type HitElement = Extract<Anim, { t: 'hit' }>['element'];
type HitOpts = { pierce?: boolean; extra?: number; element?: HitElement; forceCrit?: boolean };
function playerHit(s: GameState, mult: number, o: HitOpts = {}) {
  const e = s.enemy!;
  const st = stats(s);
  let dmg = rand(st.damage, st.damage + 3 + Math.floor(s.level / 3)) * mult * (o.extra ?? 1);
  dmg *= 1 + st.corruptionBonus / 100;
  if (e.status.marked) dmg *= 1.3;
  if (e.status.burn && has(s, 'kindling')) dmg *= 1.25;
  if (s.status.weak) dmg *= 0.75;
  if (s.status.chill) dmg *= 0.8;
  if (has(s, 'executioner') && e.hp < e.maxHp * 0.3) dmg *= 1.5;
  if (has(s, 'abyss') && s.sanity < st.maxSanity * 0.3) dmg *= 1.35;
  const opener = has(s, 'opener') && !s.flags._opened;
  s.flags._opened = 1;
  const crit = !!o.forceCrit || opener || Math.random() * 100 < st.crit;
  if (crit) dmg *= 1.6 + st.critDmg / 100;
  if (!o.pierce) dmg *= 1 - mitigation(e.armor, e.lvl);
  if (e.status.ward) dmg *= 0.5;
  const final = Math.max(1, Math.round(dmg));
  e.hp = Math.max(0, e.hp - final);
  fxAdd(s, 'enemy', crit ? `${final}!` : `${final}`, crit ? 'crit' : 'dmg');
  anim(s, { t: 'hit', who: 'enemy', dmg: final, crit, element: o.element ?? (o.pierce ? 'pierce' : 'plain') });
  if (st.lifesteal) heal(s, Math.max(1, Math.round((final * st.lifesteal) / 100)));
  return { dmg: final, crit };
}

function dealDirect(s: GameState, n: number, kind: 'dmg' | 'status' | 'crit' = 'dmg', element?: HitElement) {
  const e = s.enemy!;
  e.hp = Math.max(0, e.hp - n);
  fxAdd(s, 'enemy', `${n}`, kind);
  if (kind !== 'status') anim(s, { t: 'hit', who: 'enemy', dmg: n, crit: kind === 'crit', element: element ?? 'plain' });
}

function companionAct(s: GameState) {
  const e = s.enemy;
  if (!e || e.hp <= 0 || !s.companion || s.companion === 'None') return;
  const c = COMPANION_MAP.get(s.companion);
  if (!c) return;
  s.companionCharge++;
  if (s.companionCharge < c.act.every) return;
  s.companionCharge = 0;
  const a = c.act;
  const trust = s.flags.companion_trust ? 1.3 : 1;
  const L = s.level;
  anim(s, { t: 'companion', name: c.name });
  let line = a.text.replace('{foe}', e.name);
  if (a.dmg) {
    const d = Math.round((a.dmg[0] + L * a.dmg[1]) * trust);
    dealDirect(s, d, a.crit ? 'crit' : 'dmg');
    line += ` for ${d}`;
  }
  if (a.status && (a.status.chance === undefined || Math.random() < a.status.chance)) afflictEnemy(s, a.status.status, a.status.turns);
  if (a.gold) { const g = rand(a.gold[0], a.gold[1]) + L * 2; s.gold += g; line += `, lifting ${g} gold` }
  if (a.healPct) heal(s, Math.round((stats(s).maxHp * a.healPct) / 100));
  if (a.sanityPct) heal(s, Math.round((stats(s).maxSanity * a.sanityPct) / 100), 'sanity');
  if (a.ward) afflictSelf(s, 'ward', a.ward + 1);
  push(s, `${line}.`, 'good');
}

function sanityLoss(s: GameState, amount: number) {
  let n = amount;
  if (has(s, 'voidheart')) n = Math.ceil(n / 2);
  const loss = Math.max(0, n - (has(s, 'ironwill') ? 1 : 0));
  s.sanity = Math.max(0, s.sanity - loss);
  if (loss) fxAdd(s, 'player', `−${loss}◉`, 'sanity');
  return loss;
}

function tickEnemyStatus(s: GameState) {
  const e = s.enemy!;
  const st = stats(s);
  const bleed = Math.round(3 + st.damage * 0.22);
  const burn = Math.round((3 + st.will * 0.5 + st.damage * 0.2) * (has(s, 'embertouch') ? 1.5 : 1));
  const poison = Math.round((2 + st.damage * 0.18) * (has(s, 'toxicologist') ? 1.6 : 1));
  const tick = (status: Status, n: number, text: string) => { dealDirect(s, n, 'status'); anim(s, { t: 'tick', who: 'enemy', status, dmg: n }); push(s, text, 'good') };
  if (e.status.bleed) tick('bleed', bleed, `${e.name} bleeds for ${bleed}.`);
  if (e.status.burn) tick('burn', burn, `${e.name} burns for ${burn}.`);
  if (e.status.poison) tick('poison', poison, `${e.name} is poisoned for ${poison}.`);
  (Object.keys(e.status) as Status[]).forEach(k => { e.status[k] = (e.status[k] ?? 0) - 1; if ((e.status[k] ?? 0) <= 0) delete e.status[k] });
}

function tickPlayerStatus(s: GameState, lvl: number) {
  const hit = (n: number, label: string, status: Status) => { s.hp = Math.max(0, s.hp - n); push(s, `You ${label} for ${n}.`, 'bad'); fxAdd(s, 'player', `−${n}`, 'status'); anim(s, { t: 'tick', who: 'player', status, dmg: n }) };
  if (s.status.bleed) hit(Math.round(2 + lvl * 0.4), 'bleed', 'bleed');
  if (s.status.burn) hit(Math.round(3 + lvl * 0.5), 'burn', 'burn');
  if (s.status.poison) hit(Math.round(2 + lvl * 0.35), 'are poisoned', 'poison');
  if (s.status.regen && s.hp > 0) heal(s, Math.max(2, Math.round(stats(s).maxHp * 0.05)));
  (Object.keys(s.status) as Status[]).forEach(k => { s.status[k] = (s.status[k] ?? 0) - 1; if ((s.status[k] ?? 0) <= 0) delete s.status[k] });
  Object.keys(s.cooldowns).forEach(k => { s.cooldowns[k] = Math.max(0, s.cooldowns[k] - 1) });
}

function enemyAct(s: GameState) {
  const e = s.enemy!;
  if (e.status.stun) { push(s, `${e.name} is stunned and loses its turn.`, 'good'); return }
  const st = stats(s);
  const enraged = e.rank === 'boss' && e.hp < e.maxHp / 2;
  const doom = s.difficulty === 'Doomed' ? 1.2 : 1;
  const incoming = (base: number) => {
    let d = base * doom * (enraged ? 1.2 : 1) * (e.status.weak ? 0.75 : 1) * (e.status.chill ? 0.75 : 1);
    if (s.guarding) d *= 0.4;
    if (s.status.ward) d *= 0.5;
    if (s.sanity <= 0) d *= 1.25;
    if (has(s, 'unyielding') && s.hp < st.maxHp * 0.35) d *= 0.75;
    d *= 1 - mitigation(st.armor, e.lvl);
    return Math.max(0, Math.round(d));
  };
  const hurt = (d: number, kind: IntentKind) => {
    s.hp = Math.max(0, s.hp - d);
    fxAdd(s, 'player', d ? `−${d}` : 'BLOCK', d ? 'dmg' : 'miss');
    anim(s, { t: 'enemyAct', kind, dmg: d, blocked: d === 0 });
    if (d > 0 && st.thorns) { const t = Math.round(st.thorns * (1 + s.level / 8)); dealDirect(s, t, 'status'); push(s, `Thorns bite back for ${t}.`, 'good') }
    if (s.hp <= 0 && has(s, 'lastbreath') && !s.flags.lastbreath_used) { s.hp = 1; s.flags.lastbreath_used = 1; push(s, 'Last Breath holds you together.', 'epic') }
  };
  const dodgeChance = st.dodge + (has(s, 'vanish') && s.hp < st.maxHp * 0.3 ? 25 : 0);
  const dodged = (kind: IntentKind) => {
    if (Math.random() * 100 < dodgeChance) {
      fxAdd(s, 'player', 'DODGE', 'miss'); anim(s, { t: 'dodge' }); anim(s, { t: 'enemyAct', kind, dmg: 0, dodged: true });
      push(s, `You slip ${e.name}’s attack.`, 'good');
      if (has(s, 'riposter') && s.enemy && s.enemy.hp > 0) { const r = playerHit(s, 0.6); push(s, `You riposte for ${r.dmg}.`, 'good') }
      return true;
    }
    return false;
  };
  const intent = e.intent;
  const [lo, hi] = e.damage;
  switch (intent.kind) {
    case 'attack': { if (dodged('attack')) break; const d = incoming(rand(lo, hi)); hurt(d, 'attack'); push(s, `${e.name} strikes for ${d}.`, 'bad'); break }
    case 'heavy': { if (dodged('heavy')) break; const d = incoming(rand(lo, hi) * 1.8); hurt(d, 'heavy'); if (e.rank !== 'normal' && !s.guarding) sanityLoss(s, 2 + Math.floor(e.lvl / 8)); push(s, `${e.name} lands a heavy blow for ${d}!`, 'bad'); break }
    case 'dread': { const d = incoming(rand(1, 3 + Math.floor(e.lvl / 3))); hurt(d, 'dread'); const l = sanityLoss(s, s.guarding ? Math.ceil(intent.value / 2) : intent.value); push(s, `${e.name} fills your mind with dread (−${l} sanity).`, 'bad'); break }
    case 'guard': applyStatus(e.status, 'ward', 2); e.hp = Math.min(e.maxHp, e.hp + Math.round(e.maxHp * 0.05)); anim(s, { t: 'enemyAct', kind: 'guard', dmg: 0 }); anim(s, { t: 'status', who: 'enemy', status: 'ward' }); push(s, `${e.name} braces and mends itself.`); break;
    case 'afflict': {
      if (dodged('afflict')) break;
      const d = incoming(rand(lo, hi) * 0.6); hurt(d, 'afflict');
      const status = intent.status ?? 'bleed';
      if (!s.guarding) { afflictSelf(s, status, 3); fxAdd(s, 'player', status.toUpperCase(), 'status') }
      push(s, `${e.name} hits for ${d}${s.guarding ? '' : ` and inflicts ${status}`}.`, 'bad');
      break;
    }
  }
  if (enraged && e.turn % 3 === 2 && s.hp > 0) { const d = incoming(rand(lo, hi) * 0.7); hurt(d, 'attack'); push(s, `${e.name} is enraged and strikes again for ${d}!`, 'bad') }
}

function endTurn(s: GameState) {
  const e = s.enemy;
  if (!e) return;
  companionAct(s);
  if (e.hp > 0) tickEnemyStatus(s);
  if (e.hp <= 0) { win(s); return }
  enemyAct(s);
  s.guarding = false;
  tickPlayerStatus(s, e.lvl);
  if (has(s, 'phoenixblood') && s.hp > 0) heal(s, Math.max(1, Math.round(stats(s).maxHp * 0.03)));
  if (has(s, 'phoenixwing') && s.hp > 0) heal(s, Math.max(1, Math.round(stats(s).maxHp * 0.05)));
  if (has(s, 'sanemend') && s.hp > 0) heal(s, 2, 'sanity');
  if (s.hp <= 0) { die(s); return }
  if (s.enemy && s.enemy.hp <= 0) { win(s); return }
  e.turn++;
  e.intent = rollIntent(e);
  clampVitals(s);
  save(s);
}

function beginAction(s: GameState) { s.fx = []; s.anim = []; return !!s.enemy && s.screen === 'combat' }

export function attack(s: GameState) {
  if (!beginAction(s)) return;
  const first = playerHit(s, 1);
  let text = first.crit ? `Critical strike for ${first.dmg}!` : `You strike for ${first.dmg}.`;
  if (has(s, 'reaver') && Math.random() < 0.2 && s.enemy!.hp > 0) { const r = playerHit(s, 1); text += ` Reaver: again for ${r.dmg}!` }
  push(s, text, 'good');
  endTurn(s);
}

export function defend(s: GameState) {
  if (!beginAction(s)) return;
  s.guarding = true;
  anim(s, { t: 'guard' });
  heal(s, 1 + Math.floor(s.level / 6), 'sanity');
  push(s, 'You brace against the dark.');
  endTurn(s);
}

function escape(s: GameState) {
  const ent = s.run?.floors[s.run.floor]?.ents.find(x => x.id === s.fight?.entId);
  if (ent) ent.cd = 4;
  anim(s, { t: 'flee' });
  s.enemy = null;
  s.fight = null;
  s.status = {};
  push(s, 'You escape into the dark.', 'good');
  closeOverlay(s);
  save(s);
}

export function flee(s: GameState) {
  if (!beginAction(s)) return;
  const e = s.enemy!;
  if (e.rank === 'boss' || s.fight?.noFlee) { push(s, 'There is no escape from this one.', 'bad'); save(s); return }
  if (Math.random() * 100 < stats(s).flee) escape(s);
  else { push(s, 'You fail to escape!', 'bad'); endTurn(s) }
}

export const skillRank = (s: GameState, id: string) => s.skillRanks[id] ?? 1;
export const skillCooldown = (s: GameState, id: string) => { const sk = SKILL_MAP.get(id); return sk ? Math.max(sk.cooldown > 1 ? 2 : 1, sk.cooldown - (skillRank(s, id) >= 5 ? 1 : 0)) : 0 };

export function useSkill(s: GameState, id: string) {
  if (!beginAction(s)) return;
  const sk = SKILL_MAP.get(id);
  const st = stats(s);
  const cost = Math.max(0, (sk?.sanityCost ?? 0) - (has(s, 'voidtouched') && sk?.sanityCost ? 1 : 0));
  if (!sk || !s.skills.includes(id) || (s.cooldowns[id] ?? 0) > 0 || s.sanity < cost) return;
  s.cooldowns[id] = has(s, 'echo') && Math.random() < 0.2 ? 0 : skillCooldown(s, id);
  s.sanity -= cost;
  if (sk.hpCost) { const c = Math.round((st.maxHp * sk.hpCost) / 100); s.hp = Math.max(1, s.hp - c); fxAdd(s, 'player', `−${c}`, 'dmg') }
  const ef = sk.effect ?? {};
  const e = s.enemy!;
  const mult = sk.mult * rankMult(skillRank(s, id));
  let text = sk.name;
  let anyCrit = false;
  if (ef.shred) e.armor = Math.max(0, Math.round(e.armor * (1 - ef.shred)));
  const element: HitElement = ef.status === 'burn' ? 'burn' : ef.status === 'poison' ? 'poison' : ef.status === 'bleed' ? 'bleed' : ef.status === 'chill' || ef.also?.some(x => x.status === 'chill') ? 'chill' : ef.pierce ? 'pierce' : 'plain';
  anim(s, { t: 'skill', id, school: sk.school, hits: mult > 0 ? sk.hits ?? 1 : 0, crit: false });
  if (mult > 0) {
    let bonus = ef.bonusVs && (e.status[ef.bonusVs] || (ef.bonusVs === 'marked' && e.status.stun)) ? 1 + (ef.bonusMult ?? 0) : 1;
    if (ef.bonusLow && e.hp < e.maxHp * 0.35) bonus *= 1 + ef.bonusLow;
    let total = 0, crits = 0;
    for (let i = 0; i < (sk.hits ?? 1); i++) {
      if (e.hp <= 0) break;
      const r = playerHit(s, mult, { pierce: ef.pierce, extra: bonus, element });
      total += r.dmg; if (r.crit) crits++;
      if (ef.stunChance && Math.random() < ef.stunChance && e.hp > 0) afflictEnemy(s, 'stun', 1);
    }
    anyCrit = crits > 0;
    text += ` deals ${total}${crits ? ' (critical)' : ''}`;
    if (ef.leech) { const h = Math.round(total * ef.leech); heal(s, h); text += `, draining ${h}` }
  }
  if (ef.heal || ef.healPct) { const h = (ef.heal ?? 0) + Math.round((st.maxHp * (ef.healPct ?? 0)) / 100); heal(s, h); text += ` restores ${h} health` }
  if (ef.sanity || ef.sanityPct) { const h = (ef.sanity ?? 0) + Math.round((st.maxSanity * (ef.sanityPct ?? 0)) / 100); heal(s, h, 'sanity'); text += ` restores ${h} sanity` }
  if (ef.cleanse) { delete s.status.bleed; delete s.status.burn; delete s.status.weak; delete s.status.poison; delete s.status.chill }
  const apply = (status: Status, turns: number, target: 'self' | 'enemy') => {
    if (target === 'self') afflictSelf(s, status, turns + 1);
    else if (e.hp > 0) afflictEnemy(s, status, turns);
  };
  if (ef.status) { apply(ef.status, ef.turns ?? 1, ef.target ?? 'enemy'); text += ` · ${ef.status.toUpperCase()}` }
  ef.also?.forEach(x => apply(x.status, x.turns, x.target));
  if (anyCrit) { const a = s.anim.find(x => x.t === 'skill'); if (a && a.t === 'skill') a.crit = true }
  push(s, `${text}.`, 'good');
  clampVitals(s);
  endTurn(s);
}

export function canUseOutside(id: string) {
  const u = item(id)?.use;
  return !!u && !(u.damage || u.stun || u.burn || u.poison);
}

function itemKind(u: NonNullable<ReturnType<typeof item>>['use']): Extract<Anim, { t: 'item' }>['kind'] {
  if (!u) return 'misc';
  if (u.escape) return 'smoke';
  if (u.burn) return 'fire';
  if (u.poison) return 'poison';
  if (u.stun && !u.damage) return 'stun';
  if (u.damage || u.stun) return 'bomb';
  if (u.hp || u.hpPct) return 'heal';
  if (u.sanity) return 'sanity';
  if (u.cleanse) return 'cleanse';
  if (u.ward) return 'ward';
  return 'misc';
}

export function useItem(s: GameState, id: string) {
  const idx = s.inventory.indexOf(id);
  const def = item(id);
  if (idx < 0 || !def?.use) return;
  const u = def.use;
  const inCombat = s.screen === 'combat' && !!s.enemy;
  if (!inCombat && !canUseOutside(id)) return;
  if (!inCombat && u.escape && !s.run) return;
  if (!inCombat && (u.reveal || u.light) && !s.run) return;
  s.fx = [];
  s.anim = [];
  s.inventory.splice(idx, 1);
  const st = stats(s);
  if (inCombat) anim(s, { t: 'item', id, kind: itemKind(u) });
  if (u.hp) heal(s, u.hp);
  if (u.hpPct) heal(s, Math.round((st.maxHp * u.hpPct) / 100));
  if (u.sanity) heal(s, u.sanity, 'sanity');
  if (u.cleanse) { delete s.status.bleed; delete s.status.burn; delete s.status.weak; delete s.status.poison; delete s.status.chill }
  if (u.ward) afflictSelf(s, 'ward', u.ward + 1);
  if (u.bleed) afflictSelf(s, 'bleed', u.bleed + 1);
  if (u.supplies) s.supplies += u.supplies;
  if (u.corruption && s.corruption > 0) s.corruption = Math.max(0, s.corruption - u.corruption);
  if (u.xp) gainXp(s, u.xp);
  if (u.light && s.run) s.run.torch += u.light;
  if (u.reveal && s.run) hooks.runEffects(s, [{ t: 'reveal' }]);
  if (inCombat && s.enemy) {
    if (u.damage) dealDirect(s, u.damage, 'crit', u.burn ? 'burn' : u.poison ? 'poison' : 'pierce');
    if (u.stun) afflictEnemy(s, 'stun', u.stun);
    if (u.burn) afflictEnemy(s, 'burn', u.burn);
    if (u.poison) afflictEnemy(s, 'poison', u.poison);
  }
  push(s, `Used ${def.name}.`, 'good');
  clampVitals(s);
  if (inCombat) {
    if (u.escape) { if (s.enemy!.rank === 'boss' || s.fight?.noFlee) { push(s, 'The smoke does nothing against this one.', 'bad'); endTurn(s) } else escape(s) }
    else endTurn(s);
  } else if (u.escape && s.run) hooks.runEffects(s, [{ t: 'log', text: 'You vanish in a puff of smoke.' }]);
  else save(s);
}

function win(s: GameState) {
  const e = s.enemy!;
  const fight = s.fight;
  const L = e.lvl;
  const rank = e.rank;
  const gold = goldFor(s, L, rank === 'boss' ? 6 : rank === 'elite' ? 2.5 : 1);
  const xp = xpForKill(s, L, rank === 'boss' ? 5 : rank === 'elite' ? 2.2 : 1);
  const items = rollDrops(s, rank, L, fight?.boss ?? (rank === 'boss' ? e.id : undefined));
  const lines: string[] = [];
  anim(s, { t: 'die' });
  s.kills++;
  s.bestiary[e.id] = (s.bestiary[e.id] ?? 0) + 1;
  questEvent(s, { type: 'kill', enemy: e.id, tags: e.tags });
  if (rank !== 'normal') { s.elites++; questEvent(s, { type: 'elite' }) }
  const st = stats(s);
  if (has(s, 'bloodthirst')) { const h = Math.round(st.maxHp * 0.06); s.hp += h; s.sanity += 2; lines.push(`Bloodthirst: +${h} health`) }
  if (has(s, 'rekindle')) { const h = Math.round(st.maxHp * 0.1); s.hp += h; lines.push(`Rekindle: +${h} health`) }
  if (has(s, 'wellspring')) { const h = Math.round(st.maxSanity * 0.08); s.sanity += h; lines.push(`Wellspring: +${h} sanity`) }
  if (s.companion === 'Moth' && Math.random() < 0.3) { s.supplies++; lines.push('Moth digs up a supply.') }
  s.enemy = null;
  s.status = {};
  s.guarding = false;
  s.fx = [];
  push(s, `${e.name} falls.`, 'good');
  s.gold += gold;
  s.inventory.push(...items);
  gainXp(s, xp, lines);
  let title = `${e.name} is slain`;
  let extraGold = 0, extraXp = 0;
  const extraItems: string[] = [];
  let clearScene: string | null = null;

  if (fight?.from === 'dungeon' && s.run) {
    const run = s.run;
    const floor = run.floors[run.floor];
    const ent = floor?.ents.find(x => x.id === fight.entId);
    run.kills++;
    run.gold += gold;
    if (ent) {
      ent.done = true;
      if (ent.k === 'boss') {
        const def = DUNGEON_MAP.get(run.dungeon)!;
        run.bossDown = true;
        floor!.ents.push({ id: floor!.nextId++, k: 'exit', x: ent.x, y: ent.y });
        if (rank === 'boss') {
          title = `${e.name} is defeated`;
          s.bosses.push(e.id);
          s.flags[`boss_${e.id}`] = 1;
          const first = !s.cleared.includes(def.id);
          if (first) s.cleared.push(def.id);
          questEvent(s, { type: 'clear', id: def.id });
          if (first && def.clear && !s.flags[`seen_${def.clear}`]) { s.flags[`seen_${def.clear}`] = 1; clearScene = def.clear }
          lines.push('The way out is open: an exit portal shimmers where it fell.');
        }
      }
    }
  } else if (rank === 'boss') { title = `${e.name} is defeated`; s.bosses.push(e.id); s.flags[`boss_${e.id}`] = 1 }

  if (fight?.win?.length) {
    const r = hooks.runEffects(s, fight.win);
    extraGold += r.gold; extraXp += r.xp; extraItems.push(...r.items); lines.push(...r.lines);
  }
  s.fight = null;
  s.hp = Math.max(1, s.hp);
  clampVitals(s);
  enqueue(s, { k: 'reward', reward: { title, gold: gold + extraGold, xp: xp + extraXp, items: [...items, ...extraItems], lines, icon: rank === 'boss' ? 'crown' : 'skull', boss: rank === 'boss' } }, true);
  if (clearScene) enqueue(s, { k: 'scene', id: clearScene });
  closeOverlay(s);
  save(s);
}

function die(s: GameState) {
  anim(s, { t: 'die' });
  s.lastRun = s.run ? structuredClone(s.run) : null;
  s.screen = 'death';
  s.enemy = null;
  s.fight = null;
  s.run = null;
  s.queue = [];
  s.deaths++;
  if (s.difficulty === 'Doomed') clearSave();
  else save(s);
}

export function revive(s: GameState) {
  const lost = Math.floor(s.gold / 2);
  s.gold -= lost;
  s.town = 'veyrgard';
  s.lastRun = null;
  s.hp = Math.round(stats(s).maxHp / 2);
  s.sanity = Math.round(stats(s).maxSanity / 2);
  s.status = {};
  s.day++;
  s.screen = 'town';
  s.ret = 'town';
  push(s, `The Lantern Court’s runners drag you back from the dark. You lost ${lost} gold.`, 'bad');
  save(s);
}

/** Rewarded revive: rise where you fell, with 60% health, nothing lost. */
export function reviveInPlace(s: GameState) {
  if (s.screen !== 'death') return;
  s.status = {};
  s.hp = Math.round(stats(s).maxHp * 0.6);
  s.sanity = Math.round(stats(s).maxSanity * 0.5);
  if (s.lastRun) {
    s.run = s.lastRun;
    const f = s.run.floors[s.run.floor];
    const ent = f?.ents.find(x => x.id === s.flags._ent);
    if (ent && !ent.done) ent.cd = 8;
    s.town = null;
    s.screen = 'dungeon';
    s.ret = 'dungeon';
  } else {
    s.screen = s.town ? 'town' : 'world';
    s.ret = s.screen;
  }
  s.lastRun = null;
  s.deaths = Math.max(0, s.deaths - 1);
  push(s, 'You claw your way back to your feet, right where you fell.', 'epic');
  save(s);
}

export function canUse(s: GameState, id: string) {
  const u = item(id)?.use;
  if (!u) return false;
  if (u.damage || u.stun || u.burn || u.poison || (u.escape && s.screen !== 'combat')) return false;
  if ((u.reveal || u.light || u.escape) && !s.run) return false;
  return true;
}

export function quickHeal(s: GameState) {
  const st = stats(s);
  const missing = st.maxHp - s.hp;
  const cands = [...new Set(s.inventory)].map(id => ({ id, d: item(id)! })).filter(x => x.d?.use && (x.d.use.hp || x.d.use.hpPct) && !x.d.use.damage)
    .map(x => ({ ...x, heal: (x.d.use!.hp ?? 0) + Math.round((st.maxHp * (x.d.use!.hpPct ?? 0)) / 100) })).sort((a, b) => a.heal - b.heal);
  if (!cands.length) return false;
  const pickC = cands.find(c => c.heal >= missing) ?? cands[cands.length - 1];
  useItem(s, pickC.id);
  return true;
}

export function quickLight(s: GameState) {
  const id = [...new Set(s.inventory)].find(i => item(i)?.use?.light);
  if (!id || !s.run) return false;
  useItem(s, id);
  return true;
}
