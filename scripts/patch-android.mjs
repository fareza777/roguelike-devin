// Idempotently prepares android/app/src/main/AndroidManifest.xml for AdMob:
// network permissions plus the AdMob application id from ads.config.json (Google test id until real ids are set).
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const cfg = JSON.parse(readFileSync(new URL('ads.config.json', root), 'utf8'));
const path = new URL('android/app/src/main/AndroidManifest.xml', root);
let s = readFileSync(path, 'utf8');
for (const perm of ['INTERNET', 'ACCESS_NETWORK_STATE']) {
  const tag = `<uses-permission android:name="android.permission.${perm}" />`;
  if (!s.includes(`android.permission.${perm}"`)) s = s.replace('</manifest>', `    ${tag}\n</manifest>`);
}
const adPerm = '<uses-permission android:name="com.google.android.gms.permission.AD_ID" />';
if (!s.includes('permission.AD_ID')) s = s.replace('</manifest>', `    ${adPerm}\n</manifest>`);
const meta = `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${cfg.appId}" />`;
s = s.replace(/\s*<meta-data android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"[^>]*\/>/, '');
s = s.replace('</application>', `    ${meta}\n    </application>`);
writeFileSync(path, s);
console.log(`AndroidManifest patched (app id ${cfg.appId})${cfg.testMode ? ' - WARNING: test mode, builds show Google test ads and earn nothing' : ''}`);
