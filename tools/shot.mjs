// Screenshot helper: node tools/shot.mjs <url> <out.png> [width] [height] [waitMs]
import { chromium } from 'playwright-core';
const [url, out, w = '1280', h = '800', wait = '800'] = process.argv.slice(2);
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-gpu'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.type(), m.text()) });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(+wait);
await p.screenshot({ path: out, fullPage: true });
await b.close();
