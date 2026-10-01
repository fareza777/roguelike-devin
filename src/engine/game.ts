import { LOADOUT_MAX } from '../data/skills';
import type { GameState } from '../types';
import { addItem } from './loot';
import { push, save, stats } from './core';
import { closeOverlay, commit } from './flow';

export * from './core';
export * from './combat';
export * from './dungeon';
export * from './flow';
export * from './loot';
export * from './quests';
export * from './story';
export * from './town';
export * from './world';
export { getWorld, tileAt as worldTile, poiAt, TERRAIN_NAME } from './worldgen';

export function setup(s: GameState) {
  if (s.origin.includes('Chirurgeon')) { s.will += 3; s.skills.push('mend'); addItem(s, 'tonic', 2) }
  if (s.origin.includes('Warden')) { s.vigor += 3; s.equipment.offhand = 'x_shield_0' }
  if (s.origin.includes('Scholar')) { s.cunning += 3; s.lore.push('The First Noon'); s.gold += 40 }
  if (s.path === 'Vanguard') { s.skills.push('sever'); s.talentPoints += 1; s.vigor += 2 }
  if (s.path === 'Hexer') { s.skills.push('cinder'); s.will += 3 }
  if (s.path === 'Vagrant') { s.skills.push('riposte'); s.supplies += 3; s.cunning += 2 }
  if (!s.skills.length) s.skills.push('sever');
  s.skills = [...new Set(s.skills)];
  s.loadout = s.skills.slice(0, LOADOUT_MAX);
  s.hp = stats(s).maxHp;
  s.sanity = stats(s).maxSanity;
  s.screen = 'town';
  s.ret = 'town';
  s.town = 'veyrgard';
  push(s, 'Mother Ilse’s summons found you at dawn. There was no dawn.', 'epic');
  save(s);
}

export function closeReward(s: GameState) {
  s.reward = null;
  closeOverlay(s);
  commit(s);
}
export function chooseEnding(s: GameState) { commit(s) }
export function toTown(s: GameState) { s.screen = s.town ? 'town' : 'world'; commit(s) }
