import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export const APP_ID = 'com.dreadmarch.blackmeridian';
export const STORE_URL = `https://play.google.com/store/apps/details?id=${APP_ID}`;
export const isNative = () => Capacitor.isNativePlatform();

export async function nativeReady() {
  if (!isNative()) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#070606' });
  } catch { /* status bar unavailable */ }
  try { await SplashScreen.hide({ fadeOutDuration: 400 }) } catch { /* splash unavailable */ }
}

export function haptic(enabled: boolean, heavy = false) {
  if (!enabled) return;
  if (isNative()) Haptics.impact({ style: heavy ? ImpactStyle.Heavy : ImpactStyle.Light }).catch(() => undefined);
  else navigator.vibrate?.(heavy ? 40 : 12);
}

export async function shareGame(text: string): Promise<'shared' | 'copied' | 'failed'> {
  const data = { title: 'Dreadmarch: The Black Meridian', text, url: STORE_URL };
  try {
    if (navigator.share) { await navigator.share(data); return 'shared' }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return 'failed';
  }
  try { await navigator.clipboard.writeText(`${text} ${STORE_URL}`); return 'copied' } catch { return 'failed' }
}

export function rateGame() {
  const url = isNative() ? `market://details?id=${APP_ID}` : STORE_URL;
  window.open(url, '_blank');
}
