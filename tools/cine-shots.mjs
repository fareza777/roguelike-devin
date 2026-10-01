import { chromium } from 'playwright-core';
const [url, dir, w = '412', h = '860'] = process.argv.slice(2);
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('console', m => { if (m.type() === 'error') console.log('[page]', m.text()) });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(url, { waitUntil: 'load' });
const t0 = Date.now();
for (const t of [1500, 8000, 22000, 34000, 48000, 62000]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await p.screenshot({ path: `${dir}/c_${String(t).padStart(5, '0')}.png` });
}
await b.close();
