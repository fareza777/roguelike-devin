import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CHAPTERS, QUESTS, REGIONS } from './content';
import {
  SAVE_KEY, VERSION, acceptQuest, attack, canLearnTalent, claimQuest, closeReward, defend, enterRoom, equip, fresh, genRooms,
  hasLegacySave, learnTalent, load, rest, resolveEvent, save, setup, spendStat, startFight, startRun, stats, unequip, useSkill,
} from './engine';
import type { GameState } from './types';

const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v) },
  removeItem: (k: string) => { store.delete(k) },
});

function hero(path = 'Vanguard'): GameState {
  const s = fresh();
  s.name = 'Tester';
  s.origin = 'Grave Warden';
  s.path = path;
  s.companion = 'Moth';
  setup(s);
  return s;
}

beforeEach(() => { store.clear(); vi.restoreAllMocks() });

describe('state and saves', () => {
  it('creates a full-health fresh chronicle', () => {
    const s = fresh();
    expect(s.version).toBe(VERSION);
    expect(s.hp).toBe(stats(s).maxHp);
    expect(s.equipment.weapon).toBe('rustblade');
  });
  it('round-trips saves and rejects legacy versions', () => {
    const s = hero();
    save(s);
    expect(load()?.name).toBe('Tester');
    store.set(SAVE_KEY, JSON.stringify({ version: 1, name: 'Old' }));
    expect(load()).toBeNull();
    expect(hasLegacySave()).toBe(true);
  });
  it('does not duplicate skills and applies origin gear', () => {
    const s = hero();
    expect(s.skills.filter(x => x === 'sever')).toHaveLength(1);
    expect(s.equipment.offhand).toBe('buckler');
    expect(s.screen).toBe('city');
  });
});

describe('equipment', () => {
  it('equips into slots, swaps previous item to bag and changes stats', () => {
    const s = hero();
    const base = stats(s).damage;
    s.inventory.push('cleaver');
    equip(s, 'cleaver');
    expect(s.equipment.weapon).toBe('cleaver');
    expect(s.inventory).toContain('rustblade');
    expect(stats(s).damage).toBeGreaterThanOrEqual(base + 2);
    unequip(s, 'weapon');
    expect(s.equipment.weapon).toBeNull();
    expect(s.inventory).toContain('cleaver');
  });
  it('rejects equipping items not owned', () => {
    const s = hero();
    equip(s, 'noonblade');
    expect(s.equipment.weapon).toBe('rustblade');
  });
});

describe('progression', () => {
  it('spends attribute points and enforces talent tiers', () => {
    const s = hero();
    s.statPoints = 1;
    const v = s.vigor;
    spendStat(s, 'vigor');
    expect(s.vigor).toBe(v + 1);
    expect(s.statPoints).toBe(0);
    s.talentPoints = 2;
    expect(canLearnTalent(s, 'edge')).toBe(false);
    learnTalent(s, 'brawn');
    expect(canLearnTalent(s, 'edge')).toBe(true);
  });
  it('rest restores health and sanity fully', () => {
    const s = hero();
    s.gold = 500; s.hp = 3; s.sanity = 1;
    rest(s);
    expect(s.hp).toBe(stats(s).maxHp);
    expect(s.sanity).toBe(stats(s).maxSanity);
  });
});

describe('dungeon', () => {
  it('locks regions until chapters are completed', () => {
    const s = hero();
    startRun(s, 'ashwood');
    expect(s.run).toBeNull();
    startRun(s, 'catacombs');
    expect(s.run?.depth).toBe(0);
    expect(s.screen).toBe('dungeon');
  });
  it('always offers a boss room at the final chamber', () => {
    expect(genRooms(7, 8).map(r => r.kind)).toEqual(['boss']);
    expect(genRooms(0, 8)).toHaveLength(3);
  });
  it('entering a room consumes a supply and advances depth', () => {
    const s = hero();
    startRun(s, 'catacombs');
    const sup = s.supplies;
    s.run!.rooms = [{ kind: 'cache', label: '', icon: '', hint: '' }];
    enterRoom(s, 0);
    expect(s.supplies).toBeGreaterThanOrEqual(sup - 1);
    expect(s.run?.depth).toBe(1);
    expect(s.screen).toBe('reward');
    closeReward(s);
    expect(s.screen).toBe('dungeon');
  });
});

describe('combat', () => {
  it('defending reduces damage from a heavy intent', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const a = hero(); startRun(a, 'catacombs'); startFight(a, 'pilgrim', 'normal');
    const b = structuredClone(a);
    a.enemy!.intent = { kind: 'heavy', label: '', value: 10 };
    b.enemy!.intent = { kind: 'heavy', label: '', value: 10 };
    a.enemy!.hp = b.enemy!.hp = 999;
    attack(a); defend(b);
    expect(b.hp).toBeGreaterThan(a.hp);
  });
  it('skills go on cooldown and apply status', () => {
    const s = hero(); startRun(s, 'catacombs'); startFight(s, 'pilgrim', 'normal');
    s.enemy!.hp = 999;
    useSkill(s, 'sever');
    expect(s.cooldowns.sever).toBeGreaterThan(0);
    expect(s.enemy!.status.bleed).toBeGreaterThan(0);
  });
  it('killing a boss completes the chapter and unlocks the next region', () => {
    const s = hero(); startRun(s, 'catacombs'); startFight(s, REGIONS[0].boss, 'boss');
    s.enemy!.hp = 1;
    attack(s);
    expect(s.chapter).toBe(1);
    expect(s.bosses).toContain(CHAPTERS[0].boss);
    expect(s.screen).toBe('reward');
    closeReward(s);
    expect(s.screen).toBe('city');
  });
});

describe('events and quests', () => {
  it('events never push sanity over max or supplies below zero', () => {
    const s = hero();
    startRun(s, 'catacombs');
    s.supplies = 0;
    s.event = { id: 't', title: '', icon: '', text: '', choices: [{ label: '', text: '', effect: 'seal', cost: { supplies: 1 } }, { label: '', text: '', effect: 'kind' }] };
    s.screen = 'event';
    resolveEvent(s, 0);
    expect(s.screen).toBe('event');
    resolveEvent(s, 1);
    expect(s.supplies).toBe(0);
    expect(s.sanity).toBeLessThanOrEqual(stats(s).maxSanity);
  });
  it('tracks kill quests and pays out on claim', () => {
    const s = hero();
    const q = QUESTS.find(x => x.goal.type === 'kill' && x.goal.region === 'catacombs')!;
    acceptQuest(s, q.id);
    startRun(s, 'catacombs');
    for (let i = 0; i < q.goal.count; i++) { startFight(s, 'pilgrim', 'normal'); s.enemy!.hp = 1; attack(s); closeReward(s) }
    expect(s.quests[0].done).toBe(true);
    const gold = s.gold;
    claimQuest(s, q.id);
    expect(s.gold).toBe(gold + q.reward.gold);
    expect(s.completedQuests).toContain(q.id);
  });
});
