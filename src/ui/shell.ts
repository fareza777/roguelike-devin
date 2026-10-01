import { icon } from '../icons';
import { stats } from '../engine/core';
import type { GameState, Screen } from '../types';
import { UI, pct, vitals } from './common';

export const HUD_SCREENS: Screen[] = ['town', 'world', 'dungeon', 'map', 'character', 'inventory', 'journal', 'shop', 'smithy', 'skills', 'board', 'inn', 'temple', 'combat'];
export const DOCK_SCREENS: Screen[] = ['town', 'world', 'dungeon', 'map', 'character', 'inventory', 'journal', 'shop', 'smithy', 'skills', 'board', 'inn', 'temple'];

export function hud(s: GameState) {
  const st = stats(s);
  const xp = pct(s.xp, s.xpNext);
  const points = s.statPoints + s.talentPoints;
  void st;
  return `<header class="hud">
    <button class="hero-btn" data-go="character" aria-label="Hero" ${['combat'].includes(s.screen) ? 'disabled' : ''}>
      <span class="xpring" style="--p:${xp}"><span class="hero-ic">${icon('hero')}</span></span><b class="lvl">${s.level}</b>${points ? '<em class="pip"></em>' : ''}
    </button>
    <div class="vitals">${vitals(s)}</div>
    <div class="res">
      <span class="chip res-gold" title="Gold">${icon('gold')}<b>${s.gold}</b></span>
      <span class="chip res-sup ${s.supplies <= 2 ? 'low' : ''}" title="Supplies">${icon('supplies')}<b>${s.supplies}</b></span>
    </div>
    <button class="icon-btn" data-act="openSettings" aria-label="Settings">${icon('settings')}</button>
  </header>`;
}

const TABS: { key: string; go: string; ic: string; label: string }[] = [
  { key: 'explore', go: 'explore', ic: 'compass', label: 'Explore' },
  { key: 'map', go: 'map', ic: 'world', label: 'Atlas' },
  { key: 'character', go: 'character', ic: 'hero', label: 'Hero' },
  { key: 'inventory', go: 'inventory', ic: 'bag', label: 'Pack' },
  { key: 'journal', go: 'journal', ic: 'journal', label: 'Journal' },
];

export function dock(s: GameState) {
  const active = ['map', 'character', 'inventory', 'journal'].includes(s.screen) ? s.screen : 'explore';
  const ready = s.quests.filter(q => q.done).length;
  return `<nav class="dock" aria-label="Main navigation"><div class="dock-in">${TABS.map(t => {
    const badge = t.key === 'character' && s.statPoints + s.talentPoints ? `<em class="dot">${s.statPoints + s.talentPoints}</em>` : t.key === 'journal' && ready ? `<em class="dot gold">${ready}</em>` : '';
    const disabled = t.key === 'map' && s.screen === 'dungeon';
    return `<button data-go="${t.go}" class="${active === t.key ? 'on' : ''}" ${disabled ? 'disabled' : ''} aria-label="${t.label}"><span class="di">${icon(t.ic)}</span><span class="dl">${t.label}</span>${badge}</button>`;
  }).join('')}</div></nav>`;
}

export function locBar(title: string, sub: string, obj?: string) {
  return `<div class="locbar"><div class="loc-main"><b>${title}</b><small>${sub}</small></div>${obj ? `<div class="loc-obj" title="Main objective">${icon('quest')}<span>${obj}</span></div>` : ''}</div>`;
}

export function toast(ui: UI) {
  return ui.toast ? `<div class="toast" data-key="toast-${ui.toast.length}-${ui.toast.slice(0, 6)}">${ui.toast}</div>` : '';
}

