import type { AdsState, GameState } from '../types';

/** How often ads may appear and what rewarded ads give. Pure data and functions so it is easy to test.
 *  Rules: interstitials only at natural breaks and never to new players, rewarded ads are always optional,
 *  and every reward has a daily cap so it cannot undermine the economy. */
export const ADS_POLICY = {
  minPlaySeconds: 15 * 60,
  interstitialGapMs: 5 * 60 * 1000,
  interstitialPerDay: 12,
  afterAnyAdMs: 90 * 1000,
  boostMs: 30 * 60 * 1000,
  boostMaxMs: 2 * 3600 * 1000,
  boostMult: 1.35,
  reviveHpPct: 0.6,
};

export type RewardId = 'revive' | 'double' | 'supplies' | 'boost';

export const REWARDS: Record<RewardId, { name: string; cap: number; text: string }> = {
  revive: { name: 'Rise where you fell', cap: 6, text: 'Return to your feet at 60% health with nothing lost.' },
  double: { name: 'Double the gold', cap: 6, text: 'Doubles the gold of this reward.' },
  supplies: { name: 'Supply cache', cap: 3, text: '+6 supplies and two healing tonics.' },
  boost: { name: 'Fortune of the road', cap: 4, text: '+35% XP and gold for 30 minutes (stacks up to 2 hours).' },
};

const today = (now: number) => { const d = new Date(now); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` };

/** The ads block of a save, rolled over to today. */
export function adsOf(s: Pick<GameState, 'ads'>, now = Date.now()): AdsState {
  const a = s.ads;
  const d = today(now);
  if (a.day !== d) { a.day = d; a.counts = {}; a.inter = 0; a.open = 0 }
  return a;
}
export const watchedToday = (s: Pick<GameState, 'ads'>, id: RewardId, now = Date.now()) => adsOf(s, now).counts[id] ?? 0;
export const canWatch = (s: Pick<GameState, 'ads'>, id: RewardId, now = Date.now()) => watchedToday(s, id, now) < REWARDS[id].cap;
export const noteWatched = (s: Pick<GameState, 'ads'>, id: RewardId, now = Date.now()) => { const a = adsOf(s, now); a.counts[id] = (a.counts[id] ?? 0) + 1 };

/** May an interstitial be shown right now? */
export function interstitialDue(s: Pick<GameState, 'ads' | 'playSeconds'>, now: number, lastInter: number, lastAny: number) {
  const a = adsOf(s, now);
  if (s.playSeconds < ADS_POLICY.minPlaySeconds) return false;
  if (a.freeUntil > now) return false;
  if (a.inter >= ADS_POLICY.interstitialPerDay) return false;
  if (now - lastInter < ADS_POLICY.interstitialGapMs) return false;
  if (now - lastAny < ADS_POLICY.afterAnyAdMs) return false;
  return true;
}
