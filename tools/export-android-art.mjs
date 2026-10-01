// Renders the procedural splash and icon art to Android resources and public icons.
// Usage: (vite dev server running) node tools/export-android-art.mjs http://127.0.0.1:5174
import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const res = 'android/app/src/main/res';
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-gpu'] });
const p = await b.newPage();
await p.goto(`${base}/dev/art-export.html`);
await p.waitForFunction(() => window.ready);
const save = (path, dataUrl) => writeFileSync(path, Buffer.from(dataUrl.split(',')[1], 'base64'));
const dims = (f) => execSync(`python3 -c "import struct;d=open('${f}','rb').read(24);print(*struct.unpack('>II',d[16:24]))"`).toString().trim().split(' ').map(Number);
for (const dir of ['drawable', 'drawable-land-mdpi', 'drawable-land-hdpi', 'drawable-land-xhdpi', 'drawable-land-xxhdpi', 'drawable-land-xxxhdpi', 'drawable-port-mdpi', 'drawable-port-hdpi', 'drawable-port-xhdpi', 'drawable-port-xxhdpi', 'drawable-port-xxxhdpi']) {
  const f = `${res}/${dir}/splash.png`;
  const [w, h] = dims(f);
  save(f, await p.evaluate(([w, h]) => window.splash(w, h), [w, h]));
}
const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [d, s] of Object.entries(sizes)) {
  save(`${res}/mipmap-${d}/ic_launcher.png`, await p.evaluate(s => window.icon(s, false, false), s));
  save(`${res}/mipmap-${d}/ic_launcher_round.png`, await p.evaluate(s => window.icon(s, false, true), s));
  save(`${res}/mipmap-${d}/ic_launcher_foreground.png`, await p.evaluate(s => window.icon(s, true, false), Math.round(s * 2.25)));
}
for (const [f, s] of [['public/icon.png', 64], ['public/icons/icon-192.png', 192], ['public/icons/icon-512.png', 512], ['public/icons/apple-touch-icon.png', 180]]) save(f, await p.evaluate(s => window.icon(s, false, false), s));
await b.close();
console.log('Android splash, launcher icons and public icons regenerated from the procedural art.');
