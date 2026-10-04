// Google AdMob: consent (UMP), adaptive banner, interstitials and rewarded video.
// Everything degrades to a no-op in the browser and when the player is offline or has declined consent.
// In development builds (vite dev) rewarded ads are simulated so the reward flows can be tried without a device.
import cfg from '../ads.config.json';
import { ADS_POLICY, adsOf, interstitialDue } from './data/ads';
import { isNative } from './platform';
import { adsRemoved } from './purchases';
import type { GameState } from './types';

type Plugin = typeof import('@capacitor-community/admob');
interface Handle { remove: () => Promise<void> }

const S = {
  ready: false, canRequest: false, privacyRequired: false, bannerH: 0, bannerOn: false, bannerShown: false,
  interReady: false, rewardedReady: false, lastInter: 0, lastAny: 0, showing: false,
};
const listeners = new Set<() => void>();
const timers = new Set<number>();
let plugin: Plugin | null = null;
let started = false;
let rewardedTimer = 0;
let bannerTimer = 0;
let initTimer = 0;
let rewardedBusy = false;

const dev = !!(import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
const emit = () => listeners.forEach(f => f());
export const onAdsChange = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } };
export const adsSupported = () => isNative() || dev;
/** True when a rewarded ad can be offered right now. */
export const rewardedAvailable = () => !adsRemoved() && (isNative() ? S.ready && S.rewardedReady : dev);

function setBannerHeight(h: number) {
  S.bannerH = h;
  document.documentElement.style.setProperty('--ad-h', `${Math.max(0, Math.round(h))}px`);
  emit();
}

const req = (adId: string) => ({ adId, isTesting: false });

async function load(): Promise<Plugin | null> {
  if (plugin || !isNative()) return plugin;
  try { plugin = await import('@capacitor-community/admob') } catch { plugin = null }
  return plugin;
}

const retryInit = () => { clearTimeout(initTimer); initTimer = window.setTimeout(() => { if (!S.ready) void initAds() }, 8000) };

async function prepareInterstitial() {
  if (adsRemoved()) return;
  const p = await load();
  if (!p || !S.canRequest || S.interReady) return;
  try { await p.AdMob.prepareInterstitial(req(cfg.units.interstitial)); S.interReady = true } catch { S.interReady = false }
}
async function prepareRewarded() {
  if (adsRemoved()) return;
  const p = await load();
  if (!p || !S.canRequest || S.rewardedReady || rewardedBusy) return;
  rewardedBusy = true;
  clearTimeout(rewardedTimer);
  try { await p.AdMob.prepareRewardVideoAd(req(cfg.units.rewarded)); S.rewardedReady = true } catch { S.rewardedReady = false; rewardedTimer = window.setTimeout(() => void prepareRewarded(), 20000) }
  rewardedBusy = false;
  emit();
}

/** Consent first, then initialise and start loading ads. Safe to call more than once. */
export async function initAds() {
  if (started || !isNative()) return;
  started = true;
  const p = await load();
  if (!p) { started = false; retryInit(); return }
  const { AdMob: a } = p;
  let allowed = false;
  try {
    let info = await a.requestConsentInfo({ tagForUnderAgeOfConsent: false });
    if (info.status === p.AdmobConsentStatus.REQUIRED && info.isConsentFormAvailable) info = await a.showConsentForm();
    allowed = !!info.canRequestAds;
    S.privacyRequired = String(info.privacyOptionsRequirementStatus) === 'REQUIRED';
  } catch { allowed = false }
  // The sample app id has no consent message, so UMP rejects it; test ads must still load while testing.
  S.canRequest = allowed || !!cfg.testMode;
  if (!S.canRequest) { started = false; emit(); retryInit(); return }
  try {
    await a.initialize({ initializeForTesting: !!cfg.testMode, tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: false, maxAdContentRating: p.MaxAdContentRating.Teen });
  } catch { started = false; retryInit(); return }
  S.ready = true;
  const on = (ev: string, fn: (e: never) => void) => a.addListener(ev as never, fn as never).catch(() => undefined);
  await Promise.all([
    on(p.BannerAdPluginEvents.SizeChanged, ((size: { height: number }) => setBannerHeight(size.height)) as never),
    on(p.BannerAdPluginEvents.FailedToLoad, (() => { setBannerHeight(0); S.bannerShown = false; if (S.bannerOn) { clearTimeout(bannerTimer); bannerTimer = window.setTimeout(() => void showBannerNow(), 20000) } }) as never),
    on(p.InterstitialAdPluginEvents.Loaded, (() => { S.interReady = true }) as never),
    on(p.InterstitialAdPluginEvents.FailedToLoad, (() => { S.interReady = false; window.setTimeout(() => void prepareInterstitial(), 60000) }) as never),
    on(p.InterstitialAdPluginEvents.Dismissed, (() => { S.interReady = false; S.lastAny = Date.now(); void prepareInterstitial() }) as never),
    on(p.RewardAdPluginEvents.Loaded, (() => { S.rewardedReady = true; emit() }) as never),
    on(p.RewardAdPluginEvents.FailedToLoad, (() => { S.rewardedReady = false; emit(); if (!rewardedBusy) { clearTimeout(rewardedTimer); rewardedTimer = window.setTimeout(() => void prepareRewarded(), 20000) } }) as never),
    on(p.RewardAdPluginEvents.Dismissed, (() => { S.rewardedReady = false; S.lastAny = Date.now(); emit(); void prepareRewarded() }) as never),
  ]);
  void prepareInterstitial();
  void prepareRewarded();
  emit();
  if (S.bannerOn) void showBannerNow();
}

function safeBottom() {
  const n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom'));
  return Number.isFinite(n) && n > 0 ? Math.ceil(n) : 0;
}

async function showBannerNow() {
  if (adsRemoved()) return;
  const p = await load();
  if (!p || !S.ready || !S.bannerOn) return;
  try {
    if (S.bannerShown) { await p.AdMob.resumeBanner(); return }
    await p.AdMob.showBanner({ ...req(cfg.units.banner), adSize: p.BannerAdSize.ADAPTIVE_BANNER, position: p.BannerAdPosition.BOTTOM_CENTER, margin: safeBottom() });
    S.bannerShown = true;
  } catch {
    S.bannerShown = false;
    if (S.bannerOn) { clearTimeout(bannerTimer); bannerTimer = window.setTimeout(() => void showBannerNow(), 20000) }
  }
}

/** Show or hide the bottom banner (shown on the calm screens, never in combat, dialogue or cinematics). */
export async function setBanner(on: boolean) {
  if (adsRemoved()) {
    S.bannerOn = false;
    clearTimeout(bannerTimer);
    if (!isNative()) { if (S.bannerH !== 0) setBannerHeight(0); return; }
    const p = await load();
    if (p && S.bannerShown) { try { await p.AdMob.hideBanner() } catch { /* ignore */ } }
    S.bannerShown = false;
    if (S.bannerH !== 0) setBannerHeight(0);
    return;
  }
  if (S.bannerOn === on) return;
  S.bannerOn = on;
  if (!isNative()) return;
  if (on) { await showBannerNow(); return }
  const p = await load();
  if (!p || !S.bannerShown) return;
  try { await p.AdMob.hideBanner() } catch { /* ignore */ }
  setBannerHeight(0);
}

/** Show an interstitial if the policy allows, a couple of seconds after a natural break. */
export function maybeInterstitial(s: GameState, canShow: () => boolean, delayMs = 2500) {
  if (adsRemoved() || !isNative() || !S.ready) return;
  const t = window.setTimeout(async () => {
    timers.delete(t);
    const now = Date.now();
    if (document.hidden || S.showing || !S.interReady || !canShow() || !interstitialDue(s, now, S.lastInter, S.lastAny)) return;
    const p = await load();
    if (!p) return;
    S.showing = true;
    S.lastInter = now;
    adsOf(s, now).inter += 1;
    try { await p.AdMob.showInterstitial() } catch { /* ignore */ }
    S.showing = false;
    S.lastAny = Date.now();
  }, delayMs);
  timers.add(t);
}
export const cancelPendingAds = () => { timers.forEach(clearTimeout); timers.clear() };

export type RewardedResult = { ok: true } | { ok: false; reason: 'unavailable' | 'not_ready' | 'loading' | 'skipped' };

/** Watch a rewarded video. Resolves { ok: true } only when the reward was earned. */
export async function showRewarded(): Promise<RewardedResult> {
  if (adsRemoved() || !adsSupported()) return { ok: false, reason: 'unavailable' };
  if (!isNative()) { await new Promise(r => setTimeout(r, 700)); return { ok: true } } // dev simulation
  if (!S.ready) return { ok: false, reason: 'not_ready' };
  if (!S.rewardedReady) { void prepareRewarded(); return { ok: false, reason: 'loading' } }
  const p = await load();
  if (!p) return { ok: false, reason: 'unavailable' };
  let earned = false;
  const handles: Handle[] = [];
  const add = async (ev: string, fn: () => void) => { try { handles.push(await p.AdMob.addListener(ev as never, fn as never)) } catch { /* ignore */ } };
  const closed = new Promise<void>(resolve => {
    void add(p.RewardAdPluginEvents.Rewarded, () => { earned = true });
    void add(p.RewardAdPluginEvents.Dismissed, () => resolve());
    void add(p.RewardAdPluginEvents.FailedToShow, () => resolve());
  });
  S.showing = true;
  try { await Promise.race([p.AdMob.showRewardVideoAd().then(item => { if (item) earned = true }), closed]) } catch { /* earned stays as the event left it */ }
  handles.forEach(h => { try { void h.remove() } catch { /* ignore */ } });
  S.showing = false;
  S.lastAny = Date.now();
  S.rewardedReady = false;
  emit();
  return earned ? { ok: true } : { ok: false, reason: 'skipped' };
}

export const privacyOptionsRequired = () => S.privacyRequired;
export async function showPrivacyOptions() {
  const p = await load();
  if (!p) return false;
  try { await p.AdMob.showPrivacyOptionsForm(); return true } catch { return false }
}
export { ADS_POLICY };
