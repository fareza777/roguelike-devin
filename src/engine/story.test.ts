import { describe, expect, it } from 'vitest';
import { DUNGEON_MAP, TOWNS } from '../data/world';
import { MAIN, MAIN_INDEX } from '../data/story';
import type { GameState } from '../types';
import {
  attack, closeReward, currentNode, drain, engage, enterDungeon, enterTown, floorOf, fresh, gotoFloor, leaveDungeon, sceneAdvance, sceneChoose, setup, stats,
  talkNpc, visibleChoices, resolveEvent, availableQuests, acceptQuest, claimQuest, questEvent, moveDungeon, onEntrance, buy, shopStock, sell, equip, upgradeItem, rest, learn,
  moveWorld, fastTravel, canFastTravel, gainXp,
} from './game';

function newGame(companion = 'Moth'): GameState {
  const s = fresh();
  s.name = 'Tester';
  s.origin = 'Grave Warden';
  s.path = 'Vanguard';
  s.companion = companion;
  setup(s);
  return s;
}

function playScene(s: GameState, choose: (labels: string[]) => number = () => 0) {
  let guard = 0;
  while (s.screen === 'dialogue' && guard++ < 300) {
    const node = currentNode(s);
    const ch = visibleChoices(s, node);
    if (ch.length) sceneChoose(s, choose(ch.map(c => c.label)));
    else sceneAdvance(s);
  }
  expect(guard).toBeLessThan(300);
}
function winFight(s: GameState) {
  let guard = 0;
  while (s.screen === 'combat' && guard++ < 50) { s.enemy!.hp = 1; s.hp = stats(s).maxHp; attack(s) }
}
function settle(s: GameState, choose?: (labels: string[]) => number) {
  let guard = 0;
  drain(s);
  while (['reward', 'dialogue', 'combat', 'event', 'ending'].includes(s.screen) && guard++ < 80) {
    if (s.screen === 'reward') closeReward(s);
    else if (s.screen === 'dialogue') playScene(s, choose);
    else if (s.screen === 'combat') winFight(s);
    else if (s.screen === 'event') resolveEvent(s, s.event!.choices.length - 1);
    else break;
  }
}
const step = (s: GameState) => MAIN[s.main].id;

function clearDungeon(s: GameState, id: string, choose?: (labels: string[]) => number) {
  const def = DUNGEON_MAP.get(id)!;
  expect(enterDungeon(s, id), `enter ${id}`).toBe(true);
  settle(s, choose);
  expect(s.run).toBeTruthy();
  gotoFloor(s, def.floors - 1, 'down');
  const boss = floorOf(s).ents.find(e => e.k === 'boss')!;
  engage(s, boss, false);
  settle(s, choose);
  expect(s.flags[`boss_${def.boss}`], `boss ${def.boss}`).toBe(1);
  leaveDungeon(s, true);
  expect(s.screen).toBe('world');
}

describe('main story playthrough', () => {
  it('runs from prologue to the true ending', () => {
    const s = newGame('Nix');
    expect(step(s)).toBe('m00');
    talkNpc(s, 'veyrgard', 'ilse'); settle(s);
    expect(step(s)).toBe('m01');
    talkNpc(s, 'veyrgard', 'roe'); settle(s);
    expect(step(s)).toBe('m02');
    enterTown(s, 'saltmere'); settle(s);
    expect(step(s)).toBe('m03');
    talkNpc(s, 'saltmere', 'osk'); settle(s);
    expect(step(s)).toBe('m04');
    clearDungeon(s, 'catacombs'); settle(s);
    expect(step(s)).toBe('m05');
    talkNpc(s, 'saltmere', 'ysolde'); settle(s);
    expect(step(s)).toBe('m06');
    enterTown(s, 'emberhollow'); settle(s);
    expect(step(s)).toBe('m07');
    talkNpc(s, 'emberhollow', 'tamsin'); settle(s);
    expect(step(s)).toBe('m08');
    talkNpc(s, 'emberhollow', 'tamsin'); settle(s, l => (l.some(x => x.includes('Cut it')) ? l.findIndex(x => x.includes('Cut it')) : 0));
    expect(s.flags.leash_cut).toBe(1);
    clearDungeon(s, 'ashwood'); settle(s);
    expect(step(s)).toBe('m09');
    talkNpc(s, 'emberhollow', 'maren'); settle(s);
    expect(step(s)).toBe('m10');
    enterTown(s, 'gravemarrow'); settle(s);
    talkNpc(s, 'gravemarrow', 'dagna'); settle(s);
    expect(step(s)).toBe('m12');
    clearDungeon(s, 'quarry');
    expect(step(s)).toBe('m13');
    talkNpc(s, 'gravemarrow', 'dagna'); settle(s);
    expect(step(s)).toBe('m14');
    enterTown(s, 'hollowreach'); settle(s);
    talkNpc(s, 'hollowreach', 'sigrun'); settle(s);
    clearDungeon(s, 'pass');
    expect(step(s)).toBe('m17');
    talkNpc(s, 'hollowreach', 'sigrun'); settle(s);
    expect(step(s)).toBe('m18');
    enterTown(s, 'veyrgard'); settle(s);
    expect(step(s)).toBe('m19');
    expect(s.flags.companion_trust).toBe(1);
    talkNpc(s, 'veyrgard', 'pell'); settle(s);
    expect(step(s)).toBe('m20');
    talkNpc(s, 'veyrgard', 'ilse'); settle(s);
    expect(step(s)).toBe('m21');
    enterTown(s, 'solenne'); settle(s);
    talkNpc(s, 'solenne', 'aurelia'); settle(s);
    expect(step(s)).toBe('m23');
    clearDungeon(s, 'undercity');
    expect(step(s)).toBe('m24');
    talkNpc(s, 'solenne', 'aurelia'); settle(s);
    expect(step(s)).toBe('m25');
    ['mercy_widow', 'mercy_hart', 'mercy_grist', 'mercy_vhal'].forEach(k => { s.flags[k] = 1 });
    const def = DUNGEON_MAP.get('meridian')!;
    expect(enterDungeon(s, 'meridian')).toBe(true);
    settle(s);
    gotoFloor(s, def.floors - 1, 'down');
    engage(s, floorOf(s).ents.find(e => e.k === 'boss')!, false);
    settle(s, labels => Math.max(0, labels.findIndex(l => l.includes('Free her'))));
    expect(s.ending).toBe('dawn');
    expect(s.screen).toBe('ending');
    expect(MAIN[s.main].id).toBe('m27');
  });

  it('has every companion secret resolve', () => {
    for (const comp of ['Moth', 'Sister Cask', 'Nix']) {
      const s = newGame(comp);
      s.main = MAIN_INDEX.get('m18')!;
      enterTown(s, 'veyrgard');
      settle(s);
      expect(step(s), comp).toBe('m19');
      expect(s.flags.companion_trust, comp).toBe(1);
    }
  });

  it('supports every ending option', () => {
    for (const [pickLabel, ending] of [['Sit upon the throne', 'crown'], ['Turn your back', 'return'], ['Shatter the eclipse', 'shatter'], ['Take Ilse', 'pact']] as const) {
      const s = newGame();
      s.main = MAIN_INDEX.get('m25')!;
      s.corruption = 5;
      const def = DUNGEON_MAP.get('meridian')!;
      enterDungeon(s, 'meridian'); settle(s);
      gotoFloor(s, def.floors - 1, 'down');
      engage(s, floorOf(s).ents.find(e => e.k === 'boss')!, false);
      settle(s, labels => Math.max(0, labels.findIndex(l => l.includes(pickLabel))));
      expect(s.ending, pickLabel).toBe(ending);
    }
  });
});

describe('systems', () => {
  it('quests can be accepted, progressed and claimed', () => {
    const s = newGame();
    s.town = 'hangedman';
    s.screen = 'town';
    const q = availableQuests(s, 'hangedman');
    expect(q.length).toBeGreaterThan(0);
    expect(acceptQuest(s, q[0].id)).toBe(true);
    for (let i = 0; i < 8; i++) questEvent(s, { type: 'kill', enemy: 'bandit', tags: ['human'] });
    expect(s.quests[0].done).toBe(true);
    claimQuest(s, q[0].id);
    settle(s);
    expect(s.completedQuests).toContain(q[0].id);
  });

  it('shop, sell, equip and upgrade work', () => {
    const s = newGame();
    s.town = 'veyrgard';
    s.gold = 5000;
    const stock = shopStock(s, 'veyrgard');
    expect(stock.length).toBeGreaterThan(20);
    const gear = stock.find(d => d.slot === 'weapon')!;
    expect(buy(s, gear.id)).toBe(true);
    equip(s, gear.id);
    expect(s.equipment.weapon).toBe(gear.id);
    const before = stats(s).damage;
    expect(upgradeItem(s, gear.id, 'weapon')).toBeTruthy();
    expect(s.equipment.weapon).toBe(`${gear.id}+1`);
    expect(stats(s).damage).toBeGreaterThan(before);
    const tonic = s.inventory.find(i => i === 'tonic')!;
    const gold = s.gold;
    sell(s, tonic);
    expect(s.gold).toBeGreaterThan(gold);
    s.hp = 1;
    rest(s);
    expect(s.hp).toBe(stats(s).maxHp);
    s.level = 10;
    s.gold = 5000;
    learn(s, 'cleave');
    expect(s.skills).toContain('cleave');
  });

  it('walks the overworld and dungeon grid', () => {
    const s = newGame();
    s.screen = 'world';
    s.town = null;
    const x = s.world.x, y = s.world.y;
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 0], [1, 0]]) { moveWorld(s, dx, dy); settle(s) }
    expect(Math.abs(s.world.x - x) + Math.abs(s.world.y - y)).toBeGreaterThan(0);
    expect(enterDungeon(s, 'undercroft')).toBe(true);
    settle(s);
    expect(onEntrance(s)).toBe(true);
    const f = floorOf(s);
    const start = `${s.run!.px},${s.run!.py}`;
    let moved = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      moveDungeon(s, dx, dy);
      if ((s.screen as string) !== 'dungeon') break;
      if (`${s.run!.px},${s.run!.py}` !== start) { moved = true; break }
    }
    expect(f.tiles.length).toBe(f.w * f.h);
    expect(moved || (s.screen as string) !== 'dungeon').toBe(true);
    leaveDungeon(s, true);
    expect(s.screen).toBe('world');
  });

  it('fast travel requires a visited town', () => {
    const s = newGame();
    s.screen = 'world';
    s.town = null;
    s.supplies = 20;
    expect(canFastTravel(s, 'saltmere')).toBe(false);
    enterTown(s, 'saltmere'); settle(s);
    s.town = null; s.screen = 'world';
    s.world.x = 32; s.world.y = 26;
    expect(canFastTravel(s, 'saltmere')).toBe(true);
    fastTravel(s, 'saltmere');
    expect(s.town).toBe('saltmere');
  });

  it('levels up to the cap', () => {
    const s = newGame();
    gainXp(s, 10_000_000);
    expect(s.level).toBe(60);
    expect(TOWNS.length).toBeGreaterThan(5);
  });
});
