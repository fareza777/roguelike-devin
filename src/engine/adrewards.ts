import { ADS_POLICY, adsOf, canWatch, noteWatched, type RewardId } from '../data/ads';
import type { GameState } from '../types';
import { reviveInPlace } from './combat';
import { addItem } from './loot';
import { push } from './core';

/** Grant a rewarded-ad bonus. Returns false when the daily cap is reached or the bonus does not apply. */
export function grantAdReward(s: GameState, id: RewardId, now = Date.now()): boolean {
  if (!canWatch(s, id, now)) return false;
  switch (id) {
    case 'revive': if (s.screen !== 'death' || s.difficulty === 'Doomed') return false; reviveInPlace(s); break;
    case 'double': {
      const r = s.reward;
      if (!r || r.doubled || r.gold <= 0) return false;
      s.gold += r.gold; r.gold *= 2; r.doubled = true;
      break;
    }
    case 'supplies': {
      s.supplies += 6;
      const tonic = s.level >= 36 ? 'panacea' : s.level >= 20 ? 'restorative' : s.level >= 8 ? 'draught' : 'tonic';
      addItem(s, tonic, 2);
      push(s, 'A runner leaves a cache at your feet: supplies and two tonics.', 'good');
      break;
    }
    case 'boost': {
      const a = adsOf(s, now);
      a.boostUntil = Math.min(Math.max(a.boostUntil, now) + ADS_POLICY.boostMs, now + ADS_POLICY.boostMaxMs);
      push(s, 'Fortune favours the road for a while.', 'good');
      break;
    }
  }
  noteWatched(s, id, now);
  return true;
}
export const boostLeft = (s: GameState, now = Date.now()) => Math.max(0, s.ads.boostUntil - now);
