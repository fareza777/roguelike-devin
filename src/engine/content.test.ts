import { describe, expect, it } from 'vitest';
import { ICON_PATHS } from '../data/icon-paths';
import { BOSS_LOOT, ENEMIES, ENEMY_MAP } from '../data/enemies';
import { EVENTS, LANDMARK_EVENTS } from '../data/events';
import { ITEMS, ITEM_MAP } from '../data/items';
import { QUESTS } from '../data/quests';
import { SCENES, SCENE_MAP } from '../data/scenes';
import { SKILLS, TALENTS } from '../data/skills';
import { COMPANIONS, LORE, MAIN, MAIN_INDEX, ORIGINS, PATHS, SPEAKERS, TIPS } from '../data/story';
import { DUNGEONS, DUNGEON_MAP, LANDMARKS, MAP_H, MAP_W, TOWNS, TOWN_MAP, TRIGGERS } from '../data/world';
import type { Cond, Eff } from '../types';
import { genFloor } from './dungeongen';
import { IMPASSABLE, getWorld, worldIdx } from './worldgen';

const icons = new Set(Object.keys(ICON_PATHS));
const effsOf = (list: Eff[] = []): Eff[] => list.flatMap(e => (e.t === 'rand' ? [e, ...effsOf(e.eff), ...effsOf(e.else)] : e.t === 'fight' ? [e, ...effsOf(e.win)] : [e]));

describe('content integrity', () => {
  it('has at least 300 unique items across slots', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(300);
    expect(new Set(ITEMS.map(i => i.id)).size).toBe(ITEMS.length);
    const slots = new Set(ITEMS.map(i => i.slot));
    ['weapon', 'offhand', 'head', 'body', 'hands', 'feet', 'ring', 'amulet', 'consumable', 'junk'].forEach(s => expect(slots.has(s as never)).toBe(true));
  });
  it('every icon referenced exists', () => {
    const missing: string[] = [];
    const chk = (where: string, name?: string) => { if (name && !icons.has(name)) missing.push(`${where}:${name}`) };
    ITEMS.forEach(i => chk(`item ${i.id}`, i.icon));
    ENEMIES.forEach(e => chk(`enemy ${e.id}`, e.icon));
    TOWNS.forEach(t => { chk(`town ${t.id}`, t.icon); t.npcs.forEach(n => chk(`npc ${n.id}`, n.icon)) });
    DUNGEONS.forEach(d => chk(`dungeon ${d.id}`, d.icon));
    LANDMARKS.forEach(l => chk(`landmark ${l.id}`, l.icon));
    [...EVENTS, ...LANDMARK_EVENTS].forEach(e => chk(`event ${e.id}`, e.icon));
    SKILLS.forEach(k => chk(`skill ${k.id}`, k.icon));
    TALENTS.forEach(k => chk(`talent ${k.id}`, k.icon));
    Object.entries(SPEAKERS).forEach(([k, v]) => chk(`speaker ${k}`, v.icon));
    TIPS.forEach(t => chk('tip', t[0]));
    expect(missing).toEqual([]);
  });
  it('enemies, bosses and loot resolve', () => {
    DUNGEONS.forEach(d => {
      d.enemies.forEach(e => expect(ENEMY_MAP.has(e), `${d.id}:${e}`).toBe(true));
      expect(ENEMY_MAP.has(d.elite), `${d.id} elite`).toBe(true);
      expect(ENEMY_MAP.has(d.boss), `${d.id} boss`).toBe(true);
    });
    Object.entries(BOSS_LOOT).forEach(([b, ids]) => { expect(ENEMY_MAP.has(b), b).toBe(true); ids.forEach(i => expect(ITEM_MAP.has(i), i).toBe(true)) });
    expect(ENEMIES.length).toBeGreaterThanOrEqual(60);
  });
  it('has at least 5 core cities and many dungeons', () => {
    expect(TOWNS.filter(t => t.kind === 'city').length).toBeGreaterThanOrEqual(5);
    expect(TOWNS.length).toBeGreaterThanOrEqual(10);
    expect(DUNGEONS.length).toBeGreaterThanOrEqual(15);
    expect(LANDMARKS.length).toBeGreaterThanOrEqual(12);
  });
  it('quests reference valid content', () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(30);
    QUESTS.forEach(q => {
      expect(TOWN_MAP.has(q.town), q.id).toBe(true);
      (q.reward.items ?? []).forEach(i => expect(ITEM_MAP.has(i), `${q.id}:${i}`).toBe(true));
      const t = q.goal.target;
      if (q.goal.type === 'kill') expect(ENEMY_MAP.has(t!), `${q.id}:${t}`).toBe(true);
      if (q.goal.type === 'clear' || q.goal.type === 'fetch') expect(DUNGEON_MAP.has(t!), `${q.id}:${t}`).toBe(true);
      if (q.goal.type === 'fetch') expect(ITEM_MAP.has(q.item!), q.id).toBe(true);
      if (q.goal.type === 'talk') expect(TOWNS.some(x => x.npcs.some(n => n.id === t)), `${q.id}:${t}`).toBe(true);
      if (q.goal.type === 'reach') expect(LANDMARKS.some(l => l.id === t) || TOWN_MAP.has(t!) || DUNGEON_MAP.has(t!), `${q.id}:${t}`).toBe(true);
    });
  });
  it('scenes are internally consistent', () => {
    const checkCond = (c: Cond | undefined, where: string) => {
      if (!c) return;
      [c.mainAt, c.mainMin, c.mainBelow].forEach(m => m && expect(MAIN_INDEX.has(m), `${where}:${m}`).toBe(true));
      if (c.item) expect(ITEM_MAP.has(c.item), `${where}:${c.item}`).toBe(true);
      c.any?.forEach(x => checkCond(x, where));
    };
    SCENES.forEach(sc => {
      const ids = new Set(sc.nodes.map(n => n.id));
      expect(ids.size, `dup ids in ${sc.id}`).toBe(sc.nodes.length);
      sc.nodes.forEach(n => {
        expect(SPEAKERS[n.who ?? 'narrator'] || n.who?.startsWith('npc:'), `${sc.id}/${n.id} speaker ${n.who}`).toBeTruthy();
        if (n.next) expect(ids.has(n.next), `${sc.id}/${n.id}->${n.next}`).toBe(true);
        n.choices?.forEach(c => {
          if (c.next) expect(ids.has(c.next), `${sc.id}/${n.id} choice ${c.label}->${c.next}`).toBe(true);
          if (c.check) { expect(ids.has(c.check.pass)).toBe(true); expect(ids.has(c.check.fail)).toBe(true) }
          checkCond(c.cond, sc.id);
          effsOf(c.eff).forEach(e => checkEff(e, sc.id));
        });
        effsOf(n.eff).forEach(e => checkEff(e, sc.id));
      });
    });
    function checkEff(e: Eff, where: string) {
      if (e.t === 'main') expect(MAIN_INDEX.has(e.to), `${where}: main ${e.to}`).toBe(true);
      if (e.t === 'item' || e.t === 'take') expect(ITEM_MAP.has(e.id), `${where}: item ${e.id}`).toBe(true);
      if (e.t === 'quest') expect(QUESTS.some(q => q.id === e.id), `${where}: quest ${e.id}`).toBe(true);
      if (e.t === 'fight' && !e.enemy.startsWith('@')) expect(ENEMY_MAP.has(e.enemy), `${where}: enemy ${e.enemy}`).toBe(true);
      if (e.t === 'scene') expect(SCENE_MAP.has(e.id), `${where}: scene ${e.id}`).toBe(true);
      if (e.t === 'lore' && e.id) expect(LORE.some(l => l[0] === e.id), `${where}: lore ${e.id}`).toBe(true);
    }
  });
  it('story hooks all point at scenes that exist', () => {
    TRIGGERS.forEach(t => { expect(SCENE_MAP.has(t.scene), t.scene).toBe(true); expect(TOWN_MAP.has(t.loc) || DUNGEON_MAP.has(t.loc), t.loc).toBe(true) });
    TOWNS.forEach(t => t.npcs.forEach(n => n.talk?.forEach(v => expect(SCENE_MAP.has(v.scene), `${n.id}:${v.scene}`).toBe(true))));
    DUNGEONS.forEach(d => { if (d.clear) expect(SCENE_MAP.has(d.clear), d.clear).toBe(true) });
    LANDMARKS.forEach(l => { if (l.scene) expect(SCENE_MAP.has(l.scene)).toBe(true) });
    MAIN.forEach(m => { if (m.at) expect(TOWN_MAP.has(m.at) || DUNGEON_MAP.has(m.at), `${m.id}:${m.at}`).toBe(true) });
    expect(MAIN.length).toBeGreaterThanOrEqual(25);
    expect(LORE.length).toBeGreaterThanOrEqual(30);
    expect([ORIGINS.length, PATHS.length, COMPANIONS.length]).toEqual([3, 3, 3]);
  });
});

describe('world map', () => {
  const w = getWorld();
  it('reaches every point of interest from Veyrgard', () => {
    const reach = new Uint8Array(MAP_W * MAP_H);
    const start = TOWN_MAP.get('veyrgard')!.pos;
    const q = [worldIdx(start[0], start[1])];
    reach[q[0]] = 1;
    for (let i = 0; i < q.length; i++) {
      const c = q[i], x = c % MAP_W, y = Math.floor(c / MAP_W);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
        const ni = worldIdx(nx, ny);
        if (reach[ni] || IMPASSABLE.has(w.tiles[ni])) continue;
        reach[ni] = 1; q.push(ni);
      }
    }
    const unreachable: string[] = [];
    w.poi.forEach((p, idx) => { if (!reach[idx]) unreachable.push(`${p.kind}:${p.id}`) });
    expect(unreachable).toEqual([]);
    expect(w.poi.size).toBe(TOWNS.length + DUNGEONS.length + LANDMARKS.length);
  });
  it('places every POI on passable ground', () => {
    w.poi.forEach((p, idx) => expect(IMPASSABLE.has(w.tiles[idx]), `${p.id} on ${w.tiles[idx]}`).toBe(false));
  });
});

describe('dungeon generator', () => {
  DUNGEONS.forEach(d => {
    it(`generates connected floors for ${d.id}`, () => {
      for (let f = 0; f < d.floors; f++) {
        for (const seed of [1, 7, 12345]) {
          const fl = genFloor(d, f, seed, { bossRespawn: false, mainCleared: false, secretItem: d.secretItem });
          expect(fl.tiles.length).toBe(fl.w * fl.h);
          expect(fl.up).toBeTruthy();
          if (f < d.floors - 1) expect(fl.down).toBeTruthy();
          else expect(fl.ents.some(e => e.k === 'boss')).toBe(true);
          const seen = new Uint8Array(fl.w * fl.h);
          const q = [fl.up![1] * fl.w + fl.up![0]];
          seen[q[0]] = 1;
          for (let i = 0; i < q.length; i++) {
            const c = q[i], x = c % fl.w, y = Math.floor(c / fl.w);
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= fl.w || ny >= fl.h) continue;
              const ni = ny * fl.w + nx;
              if (seen[ni] || fl.tiles[ni] === '#') continue;
              seen[ni] = 1; q.push(ni);
            }
          }
          const lost = fl.ents.filter(e => !seen[e.y * fl.w + e.x]);
          expect(lost.map(e => `${e.k}@${e.x},${e.y}`)).toEqual([]);
          if (d.secretItem && f === Math.max(0, d.floors - 2)) expect(fl.ents.some(e => e.k === 'questitem'), `${d.id} keepsake`).toBe(true);
        }
      }
    });
  });
});
