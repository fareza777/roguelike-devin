import type { GameState, Pending, Screen } from '../types';
import { hooks, save } from './core';

export const OVERLAYS: Screen[] = ['combat', 'event', 'reward', 'dialogue', 'ending', 'death'];
export const isOverlay = (sc: Screen) => OVERLAYS.includes(sc);

export function showOverlay(s: GameState, screen: Screen) {
  if (!isOverlay(s.screen)) s.ret = s.screen;
  s.screen = screen;
}

export function fixRet(s: GameState) {
  if (s.ret === 'dungeon' && !s.run) s.ret = s.town ? 'town' : 'world';
  if (s.ret === 'town' && !s.town) s.ret = 'world';
  if (isOverlay(s.ret) || !['town', 'world', 'dungeon'].includes(s.ret)) s.ret = s.run ? 'dungeon' : s.town ? 'town' : 'world';
}

export function enqueue(s: GameState, p: Pending, front = false) {
  if (front) s.queue.unshift(p);
  else s.queue.push(p);
}

export function drain(s: GameState) {
  let guard = 0;
  while (!isOverlay(s.screen) && s.queue.length && guard++ < 20) {
    const p = s.queue.shift()!;
    if (p.k === 'reward') { s.reward = p.reward; showOverlay(s, 'reward') }
    else if (p.k === 'scene') hooks.startScene(s, p.id);
    else if (p.k === 'ending') { s.ending = p.id; showOverlay(s, 'ending') }
    else hooks.runEffects(s, p.eff);
  }
}

export function closeOverlay(s: GameState) {
  fixRet(s);
  if (s.screen === 'combat') s.enemy = null;
  s.screen = s.ret;
  drain(s);
  fixRet(s);
}

export function commit(s: GameState) {
  drain(s);
  if (s.name && s.origin && !(s.screen === 'death' && s.difficulty === 'Doomed')) save(s);
}
