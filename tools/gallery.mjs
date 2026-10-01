// Scripted screenshots of game screens through the dev hooks: node tools/gallery.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
const [url, dir, w = '412', h = '860'] = process.argv.slice(2);
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('console', m => { if (m.type() === 'error') console.log('[page]', m.text()) });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(600);
const shot = async (name, wait = 900) => { await p.waitForTimeout(wait); await p.screenshot({ path: `${dir}/${name}.png` }) };
const run = (fn, arg) => p.evaluate(fn, arg);
await run(() => { const d = window.__dm; d.meta.introSeen = true; d.meta.onboarded = true; });
await run(() => {
  const d = window.__dm; const s = d.G.fresh('Wayfarer'); s.name = 'Ash'; s.origin = 'Grave Warden'; s.path = 'Vanguard'; s.companion = 'Moth'; d.G.setup(s); d.s = s;
  d.setScreen('town'); d.show('town');
});
await shot('01_town');
for (const [name, fn] of [
  ['02_world', () => { const d = window.__dm; d.G.leaveTown(d.s); d.show('world'); }],
  ['03_map', () => { const d = window.__dm; d.show('map'); }],
  ['04_character_path', () => { const d = window.__dm; d.s.level = 22; d.ui.charTab = 'path'; d.show('character'); }],
  ['05_journal_crowns', () => { const d = window.__dm; d.s.main = d.G.MAIN_INDEX?.get?.('r00') ?? d.s.main; d.ui.journalTab = 'crowns'; d.show('journal'); }],
  ['06_dialogue', () => { const d = window.__dm; d.G.startScene(d.s, 's_ilse_intro'); d.render(); }],
  ['07_combat', () => { const d = window.__dm; d.s.level = 28; d.s.hp = 400; d.s.maxHp = 400; d.G.startFight(d.s, 'dunewyrm', 'normal'); d.render(); }],
  ['08_combat_boss', () => { const d = window.__dm; d.s.enemy = null; d.s.screen = 'world'; d.G.startFight(d.s, 'maridel', 'boss'); d.s.enemy.status = { burn: 3, chill: 2, bleed: 2 }; d.s.status = { poison: 2, ward: 2 }; d.render(); }],
  ['09_event', () => { const d = window.__dm; d.s.enemy = null; d.s.fight = null; d.s.screen = 'world'; d.G.openEventById(d.s, 'ev_g_cairn'); d.render(); }],
  ['10_brasshaven', () => { const d = window.__dm; d.s.event = null; d.s.enemy = null; d.G.enterTown(d.s, 'brasshaven'); d.show('town'); }],
  ['11_harbor', () => { const d = window.__dm; d.s.main = 25; d.G.enterTown(d.s, 'saltmere'); d.show('harbor'); }],
  ['12_dungeon', () => { const d = window.__dm; d.s.flags.arc_glass = 2; d.s.town = null; d.s.screen = 'world'; d.G.enterDungeon(d.s, 'orangery'); d.show('dungeon'); }],
]) { await run(fn); await shot(name, 1100); }
await b.close();
