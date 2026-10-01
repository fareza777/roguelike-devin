import { drawFigure } from './figures';
import { clamp, glow, hashKey, lerp, mix, poly, rgba, rngOf, shade, vgrad } from './util';

/** Enemy portraits. Nothing here has a face: heads are hoods, bone plates, masks, veils, helms or simply absent. */
export type Arch = 'hood' | 'armor' | 'rogue' | 'quad' | 'crawler' | 'winged' | 'worm' | 'swarm' | 'spirit' | 'golem' | 'plant' | 'elemental' | 'blob' | 'titan' | 'king' | 'bell' | 'cart';

export interface CreatureSpec { arch: Arch; seed: number; a: string; b: string; hi: string; g: string; size: number; rank: 'normal' | 'elite' | 'boss'; crown?: boolean; horns?: boolean; chains?: boolean; banner?: boolean; veil?: boolean; mask?: boolean }

const HINTS: [RegExp, Arch][] = [
  [/bell-?widow|widow|bellthrall|bell-?ringer|ringer/, 'bell'],
  [/king|regent|general|herald|molten|rook-?king|barrow-?king|aurelia/, 'king'],
  [/wolf|hound|hart|stag|bear|yeti|boar|cat|ram|bull|horse|fawn|moth\b|nixraven/, 'quad'],
  [/crab|spider|tick|beetle|scorpion|mite|crawler|spinner|lobster/, 'crawler'],
  [/bat|moth|crow|raven|harpy|bird|wasp|dragonfly|owl|gull|magpie|vulture|butterfly/, 'winged'],
  [/worm|eel|serpent|wyrm|maw|snake|hydra|leech|kraken|tidegrasp|tentacle|maggot/, 'worm'],
  [/rat|swarm|wisp|flock|cloud|bees|gnat|marrow$/, 'swarm'],
  [/golem|sentinel|colossus|automaton|clock|gear|marionette|statue|gargoyle|iron|gilded|cast|ironmaw|warden$|regent/, 'golem'],
  [/tree|bough|thorn|stalker|root|vine|bloom|fungus|bramble|briar|scarecrow|hollow-?moth/, 'plant'],
  [/imp|elemental|flame|fire|slag|ember|cinder|spark|lava|magma/, 'elemental'],
  [/toad|frog|slime|ooze|jelly|blob|spore|mire|pudding|glass-?maw/, 'blob'],
  [/ghost|wraith|spectre|shade|echo|banshee|phantom|child|noonchild|mourner|dustwife|veil|apparition|spirit|rime/, 'spirit'],
  [/titan|ribcage|cyclops|giant|ogre|troll|wyrm|dragon/, 'titan'],
  [/archer|assassin|rogue|thief|cutthroat|bandit|stiletto|pirate|smuggler|skirmisher|dancer/, 'rogue'],
];

export function archOf(id: string, name: string, tags: string[], role: string, look?: string): Arch {
  if (look && ['hood', 'armor', 'rogue', 'quad', 'crawler', 'winged', 'worm', 'swarm', 'spirit', 'golem', 'plant', 'elemental', 'blob', 'titan', 'king', 'bell', 'cart'].includes(look.split('+')[0])) return look.split('+')[0] as Arch;
  const key = `${id} ${name}`.toLowerCase();
  for (const [re, a] of HINTS) if (re.test(key)) return a;
  const t = new Set(tags);
  if (t.has('construct')) return 'golem';
  if (t.has('plant')) return 'plant';
  if (t.has('spirit')) return 'spirit';
  if (t.has('beast')) return role === 'swarm' ? 'swarm' : 'quad';
  if (t.has('fire') && role === 'swarm') return 'elemental';
  if (t.has('human')) return role === 'brute' || role === 'tank' ? 'armor' : role === 'skirmisher' ? 'rogue' : 'hood';
  if (t.has('undead')) return role === 'caster' ? 'spirit' : 'armor';
  return role === 'caster' ? 'hood' : role === 'swarm' ? 'swarm' : role === 'tank' ? 'golem' : role === 'skirmisher' ? 'rogue' : 'armor';
}

const PALS: [string, [string, string, string]][] = [
  ['fire', ['#5a2410', '#ff7a30', '#ffc070']], ['ice', ['#2a4a68', '#8fd0ff', '#d8f0ff']], ['sea', ['#17464a', '#4fe0c4', '#b4fff0']], ['swamp', ['#2a3e22', '#9ae060', '#d8ffa8']],
  ['bone', ['#5a5038', '#e6d8a0', '#fff4c8']], ['noon', ['#6a4c16', '#ffd870', '#fff4c0']], ['hex', ['#3a2250', '#b080ff', '#e6d0ff']], ['occult', ['#3a2250', '#b080ff', '#e6d0ff']],
  ['construct', ['#4a3a24', '#ffb050', '#ffe0a0']], ['plant', ['#22381e', '#8ee070', '#d8ffa8']], ['spirit', ['#2a3440', '#9ad8e8', '#e0f8ff']], ['undead', ['#38403a', '#9ac8a0', '#dcf6e0']],
  ['beast', ['#3a2e26', '#e0a860', '#ffe0b0']], ['human', ['#2e2a30', '#d8b070', '#fff0c8']],
];
export function palOf(tags: string[]): { a: string; g: string; hi: string } {
  for (const [k, v] of PALS) if (tags.includes(k)) return { a: v[0], g: v[1], hi: v[2] };
  return { a: '#2e2a30', g: '#d8b070', hi: '#fff0c8' };
}

export function creatureSpec(def: { id: string; name: string; tags: string[]; role: string; look?: string }, rank: 'normal' | 'elite' | 'boss'): CreatureSpec {
  const seed = hashKey(def.id);
  const arch = archOf(def.id, def.name, def.tags, def.role, def.look);
  const pal = palOf(def.tags);
  const r = rngOf(seed);
  const size = (rank === 'boss' ? 1.12 : rank === 'elite' ? 0.98 : 0.84) * (arch === 'titan' ? 1.15 : arch === 'swarm' ? 0.95 : 1);
  return {
    arch, seed, a: pal.a, b: shade(pal.a, -0.55), hi: pal.hi, g: pal.g, size, rank,
    crown: rank === 'boss' && /king|regent|herald|general|lord|queen/.test(def.name.toLowerCase()),
    horns: rank !== 'normal' && r() < 0.5, chains: r() < 0.25, banner: arch === 'armor' && r() < 0.3, veil: arch === 'hood' && r() < 0.5, mask: (arch === 'hood' || arch === 'rogue') && r() < 0.5,
  };
}

export interface CreatureState { t: number; lunge: number; hit: number; die: number; enrage?: boolean }

// ------------------------------------------------------------------ helpers
function body(ctx: CanvasRenderingContext2D, c: CreatureSpec, y0: number, y1: number) {
  return vgrad(ctx, y0, y1, [[0, shade(c.a, 0.2)], [0.5, c.a], [1, c.b]]);
}
function rimLine(ctx: CanvasRenderingContext2D, c: CreatureSpec, w = 2) { ctx.strokeStyle = rgba(c.hi, 0.35); ctx.lineWidth = w; ctx.stroke() }
function cracks(ctx: CanvasRenderingContext2D, c: CreatureSpec, x: number, y: number, r: number, n: number, rnd: () => number, t: number) {
  ctx.strokeStyle = rgba(c.g, 0.5 + Math.sin(t * 3) * 0.2); ctx.lineWidth = Math.max(1, r * 0.03); ctx.shadowColor = c.g; ctx.shadowBlur = r * 0.2;
  for (let i = 0; i < n; i++) { let px = x + (rnd() - 0.5) * r, py = y + (rnd() - 0.5) * r; ctx.beginPath(); ctx.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (rnd() - 0.5) * r * 0.35; py += rnd() * r * 0.25; ctx.lineTo(px, py) } ctx.stroke() }
  ctx.shadowBlur = 0;
}
function sigil(ctx: CanvasRenderingContext2D, c: CreatureSpec, x: number, y: number, r: number, t: number) {
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y, r * 2.2, c.g, 0.55 + Math.sin(t * 2.4) * 0.12);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = rgba(c.hi, 0.9); ctx.lineWidth = Math.max(1.4, r * 0.1);
  ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2.094; ctx.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8) } ctx.closePath(); ctx.stroke();
}
function hornSet(ctx: CanvasRenderingContext2D, c: CreatureSpec, x: number, y: number, s: number) {
  ctx.fillStyle = shade(c.hi, -0.35);
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * s * 0.18, y); ctx.quadraticCurveTo(x + d * s * 0.5, y - s * 0.1, x + d * s * 0.42, y - s * 0.6); ctx.quadraticCurveTo(x + d * s * 0.3, y - s * 0.2, x + d * s * 0.1, y + s * 0.06); ctx.fill() }
}

// ---------------------------------------------------------------- archetypes
type Draw = (ctx: CanvasRenderingContext2D, c: CreatureSpec, u: number, t: number, rnd: () => number) => void;

const drawHood: Draw = (ctx, c, u, t, r) => {
  const sway = Math.sin(t * 1.6) * u * 0.02;
  drawFigure(ctx, { x: 0, y: 0, h: u * 1.0, look: c.mask ? 'mask' : c.veil ? 'veil' : c.crown ? 'crown' : 'hood', c: shade(c.a, -0.1), accent: c.g, rim: c.hi, back: false, sway: 0.5 + Math.sin(t * 1.4) * 0.5, weapon: c.rank === 'normal' ? 'none' : 'staff' });
  void sway; void r;
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.55, u * 0.35, c.g, 0.2 + Math.sin(t * 2) * 0.05); ctx.globalCompositeOperation = 'source-over';
  sigil(ctx, c, 0, -u * 0.5, u * 0.045, t);
};

const drawArmor: Draw = (ctx, c, u, t, r) => {
  const bob = Math.sin(t * 2) * u * 0.008;
  ctx.save(); ctx.translate(0, bob);
  // legs
  ctx.fillStyle = body(ctx, c, -u * 0.4, 0);
  ctx.fillRect(-u * 0.14, -u * 0.38, u * 0.11, u * 0.38); ctx.fillRect(u * 0.03, -u * 0.38, u * 0.11, u * 0.38);
  // torso
  ctx.fillStyle = body(ctx, c, -u * 0.95, -u * 0.35);
  poly(ctx, [[-u * 0.24, -u * 0.8], [-u * 0.17, -u * 0.38], [u * 0.17, -u * 0.38], [u * 0.24, -u * 0.8], [u * 0.12, -u * 0.9], [-u * 0.12, -u * 0.9]]); ctx.fill(); rimLine(ctx, c, 1.4);
  // pauldrons
  ctx.fillStyle = shade(c.a, 0.12);
  ctx.beginPath(); ctx.ellipse(-u * 0.27, -u * 0.8, u * 0.11, u * 0.075, -0.35, 0, Math.PI * 2); ctx.ellipse(u * 0.27, -u * 0.8, u * 0.11, u * 0.075, 0.35, 0, Math.PI * 2); ctx.fill();
  // arms + weapon
  ctx.fillStyle = shade(c.a, -0.1); ctx.fillRect(-u * 0.34, -u * 0.78, u * 0.075, u * 0.3); ctx.fillRect(u * 0.265, -u * 0.78, u * 0.075, u * 0.3);
  ctx.save(); ctx.translate(u * 0.3, -u * 0.5); ctx.rotate(-0.25 + Math.sin(t * 1.8) * 0.04);
  ctx.fillStyle = '#b8bcc8'; poly(ctx, [[-u * 0.015, 0], [u * 0.015, 0], [u * 0.01, u * 0.62], [0, u * 0.68], [-u * 0.01, u * 0.62]]); ctx.fill();
  ctx.fillStyle = shade(c.a, -0.3); ctx.fillRect(-u * 0.05, -u * 0.015, u * 0.1, u * 0.025); ctx.restore();
  if (c.banner) { ctx.fillStyle = '#4a1814'; ctx.fillRect(-u * 0.34, -u * 1.25, 3, u * 0.5); poly(ctx, [[-u * 0.34, -u * 1.22], [-u * 0.62, -u * 1.15 + Math.sin(t * 3) * 4], [-u * 0.34, -u * 0.95]]); ctx.fill() }
  // closed great-helm: a blank plate (no face)
  ctx.fillStyle = vgrad(ctx, -u * 1.08, -u * 0.88, [[0, shade(c.a, 0.28)], [1, shade(c.a, -0.25)]]);
  ctx.beginPath(); ctx.moveTo(-u * 0.085, -u * 0.88); ctx.lineTo(-u * 0.09, -u * 1.0); ctx.quadraticCurveTo(-u * 0.09, -u * 1.1, 0, -u * 1.11); ctx.quadraticCurveTo(u * 0.09, -u * 1.1, u * 0.09, -u * 1.0); ctx.lineTo(u * 0.085, -u * 0.88); ctx.closePath(); ctx.fill(); rimLine(ctx, c, 1.2);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(-u * 0.07, -u * 0.99, u * 0.14, u * 0.012);
  if (c.horns) hornSet(ctx, c, 0, -u * 1.07, u * 0.3);
  cracks(ctx, c, 0, -u * 0.62, u * 0.3, 4, r, t);
  sigil(ctx, c, 0, -u * 0.66, u * 0.042, t);
  ctx.restore();
};

const drawRogue: Draw = (ctx, c, u, t, r) => {
  const lean = Math.sin(t * 2.6) * 0.04;
  ctx.save(); ctx.rotate(lean);
  drawFigure(ctx, { x: 0, y: 0, h: u * 0.95, look: c.mask ? 'plague' : 'cowl', c: shade(c.a, -0.15), accent: c.g, rim: c.hi, back: false, weapon: 'blade', sway: 0.8 });
  ctx.restore();
  ctx.save(); ctx.translate(-u * 0.3, -u * 0.46); ctx.rotate(0.6); ctx.fillStyle = '#c8ccd4'; poly(ctx, [[-2, 0], [2, 0], [0, u * 0.3]]); ctx.fill(); ctx.restore();
  void r;
};

const drawQuad: Draw = (ctx, c, u, t, r) => {
  const bob = Math.sin(t * 2.4) * u * 0.012;
  const tail = Math.sin(t * 3) * u * 0.05;
  ctx.save(); ctx.translate(0, bob);
  // legs
  ctx.fillStyle = shade(c.a, -0.25);
  const legs: [number, number][] = [[-0.34, 0], [-0.22, 0.02], [0.2, 0], [0.32, 0.02]];
  legs.forEach(([lx, off], i) => { const sw = Math.sin(t * 3 + i * 1.6) * u * 0.015; ctx.beginPath(); ctx.moveTo(u * lx - u * 0.04, -u * 0.34); ctx.lineTo(u * lx + u * 0.045, -u * 0.34); ctx.lineTo(u * lx + u * 0.03 + sw, -u * off); ctx.lineTo(u * lx - u * 0.03 + sw, -u * off); ctx.fill() });
  // torso
  ctx.fillStyle = body(ctx, c, -u * 0.72, -u * 0.25);
  ctx.beginPath(); ctx.moveTo(-u * 0.5, -u * 0.36); ctx.bezierCurveTo(-u * 0.5, -u * 0.62, -u * 0.25, -u * 0.74, 0, -u * 0.7); ctx.bezierCurveTo(u * 0.25, -u * 0.66, u * 0.4, -u * 0.6, u * 0.46, -u * 0.46); ctx.bezierCurveTo(u * 0.42, -u * 0.3, u * 0.2, -u * 0.28, 0, -u * 0.3); ctx.bezierCurveTo(-u * 0.25, -u * 0.28, -u * 0.46, -u * 0.26, -u * 0.5, -u * 0.36); ctx.fill(); rimLine(ctx, c, 1.4);
  // spine plates
  ctx.fillStyle = shade(c.hi, -0.4);
  for (let i = 0; i < 7; i++) { const px = -u * 0.38 + i * u * 0.11; poly(ctx, [[px, -u * 0.68 + Math.abs(i - 3) * u * 0.01], [px + u * 0.03, -u * 0.8 + Math.abs(i - 3) * u * 0.02], [px + u * 0.06, -u * 0.67]]); ctx.fill() }
  // tail
  ctx.strokeStyle = shade(c.a, -0.1); ctx.lineWidth = u * 0.06; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-u * 0.46, -u * 0.5); ctx.quadraticCurveTo(-u * 0.7, -u * 0.6 + tail, -u * 0.74, -u * 0.8); ctx.stroke();
  // head: a smooth mass wearing a blank bone plate, no features
  ctx.fillStyle = body(ctx, c, -u * 0.78, -u * 0.5);
  ctx.beginPath(); ctx.moveTo(u * 0.34, -u * 0.62); ctx.bezierCurveTo(u * 0.4, -u * 0.8, u * 0.62, -u * 0.8, u * 0.7, -u * 0.64); ctx.bezierCurveTo(u * 0.72, -u * 0.54, u * 0.6, -u * 0.46, u * 0.48, -u * 0.48); ctx.bezierCurveTo(u * 0.4, -u * 0.5, u * 0.34, -u * 0.55, u * 0.34, -u * 0.62); ctx.fill(); rimLine(ctx, c, 1.2);
  ctx.fillStyle = vgrad(ctx, -u * 0.8, -u * 0.5, [[0, '#d8ceb8'], [1, '#8a826c']]);
  ctx.beginPath(); ctx.moveTo(u * 0.44, -u * 0.74); ctx.quadraticCurveTo(u * 0.68, -u * 0.74, u * 0.7, -u * 0.62); ctx.quadraticCurveTo(u * 0.58, -u * 0.5, u * 0.46, -u * 0.56); ctx.closePath(); ctx.fill();
  if (c.horns || c.rank !== 'normal') { ctx.strokeStyle = shade(c.hi, -0.25); ctx.lineWidth = u * 0.025; ctx.lineCap = 'round'; for (const d of [0, 1]) { ctx.beginPath(); ctx.moveTo(u * (0.44 + d * 0.1), -u * 0.78); ctx.quadraticCurveTo(u * (0.42 + d * 0.16), -u * 1.0, u * (0.5 + d * 0.2), -u * 1.1); ctx.moveTo(u * (0.47 + d * 0.1), -u * 0.9); ctx.lineTo(u * (0.58 + d * 0.1), -u * 0.94); ctx.stroke() } }
  cracks(ctx, c, 0, -u * 0.5, u * 0.4, 3, r, t);
  ctx.restore();
};

const drawCrawler: Draw = (ctx, c, u, t, r) => {
  const legN = 4;
  ctx.strokeStyle = shade(c.a, -0.2); ctx.lineWidth = u * 0.03; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of [-1, 1]) for (let i = 0; i < legN; i++) {
    const k = i / (legN - 1), sw = Math.sin(t * 3 + i * 1.3 + (s > 0 ? 1.5 : 0)) * u * 0.02;
    ctx.beginPath(); ctx.moveTo(s * u * 0.12, -u * (0.36 + k * 0.04)); ctx.lineTo(s * u * (0.42 + k * 0.08), -u * (0.62 - k * 0.1) + sw); ctx.lineTo(s * u * (0.56 + k * 0.1), -u * 0.02 + sw); ctx.stroke();
  }
  ctx.fillStyle = body(ctx, c, -u * 0.7, -u * 0.25);
  ctx.beginPath(); ctx.ellipse(0, -u * 0.4, u * 0.33, u * 0.2, 0, 0, Math.PI * 2); ctx.fill(); rimLine(ctx, c, 1.4);
  ctx.beginPath(); ctx.ellipse(0, -u * 0.52, u * 0.22, u * 0.14, 0, Math.PI, 0); ctx.fillStyle = shade(c.a, 0.12); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * u * 0.07, -u * 0.58); ctx.lineTo(i * u * 0.09, -u * 0.26); ctx.stroke() }
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * u * 0.32, -u * 0.5); ctx.rotate(s * (0.5 + Math.sin(t * 2) * 0.08)); ctx.fillStyle = shade(c.a, -0.1); poly(ctx, [[0, 0], [s * u * 0.22, -u * 0.1], [s * u * 0.36, u * 0.04], [s * u * 0.2, u * 0.08]]); ctx.fill(); ctx.restore() }
  cracks(ctx, c, 0, -u * 0.42, u * 0.3, 3, r, t);
};

const drawWinged: Draw = (ctx, c, u, t, r) => {
  const flap = Math.sin(t * 5) * 0.35;
  ctx.save(); ctx.translate(0, -u * 0.62 + Math.sin(t * 2.2) * u * 0.03);
  for (const s of [-1, 1]) {
    ctx.save(); ctx.rotate(s * (0.3 + flap));
    ctx.fillStyle = vgrad(ctx, -u * 0.3, u * 0.3, [[0, shade(c.a, 0.1)], [1, shade(c.a, -0.35)]]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(s * u * 0.3, -u * 0.5, s * u * 0.7, -u * 0.38, s * u * 0.9, -u * 0.12); ctx.lineTo(s * u * 0.74, -u * 0.04); ctx.lineTo(s * u * 0.66, u * 0.1); ctx.lineTo(s * u * 0.5, u * 0.02); ctx.lineTo(s * u * 0.36, u * 0.16); ctx.lineTo(s * u * 0.2, u * 0.08); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(c.hi, 0.22); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = body(ctx, c, -u * 0.2, u * 0.34);
  ctx.beginPath(); ctx.ellipse(0, u * 0.08, u * 0.13, u * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  // hooded head, no face
  ctx.fillStyle = shade(c.a, -0.3); ctx.beginPath(); ctx.arc(0, -u * 0.2, u * 0.095, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#050404'; ctx.beginPath(); ctx.ellipse(0, -u * 0.19, u * 0.055, u * 0.065, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = shade(c.a, -0.2); ctx.lineWidth = u * 0.03; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-u * 0.04, u * 0.3); ctx.lineTo(-u * 0.07, u * 0.5); ctx.moveTo(u * 0.04, u * 0.3); ctx.lineTo(u * 0.07, u * 0.5); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 2, u * 0.3, u * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  void r;
};

const drawWorm: Draw = (ctx, c, u, t, r) => {
  const segs = 14;
  const sx = (k: number) => Math.sin(t * 1.5 + k * 3.2) * u * 0.12 * (1 - k);
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segs; i++) { const k = i / segs; pts.push([sx(k) + (k - 0.5) * u * 0.1, -u * 0.04 - k * u * 0.9, u * (0.19 - k * 0.1)]) }
  for (let i = segs; i >= 0; i--) {
    const [x, y, rad] = pts[i];
    ctx.fillStyle = vgrad(ctx, y - rad, y + rad, [[0, shade(c.a, 0.2 - i * 0.01)], [1, c.b]]);
    ctx.beginPath(); ctx.ellipse(x, y, rad * 1.25, rad * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  const [hx, hy, hr] = pts[segs];
  // a closed bulb with a ring of pale plates: no mouth, no eyes
  ctx.fillStyle = shade(c.hi, -0.3); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(hx + Math.cos(a) * hr * 1.5, hy + Math.sin(a) * hr * 0.9, hr * 0.28, hr * 0.5, a, 0, Math.PI * 2); ctx.fill() }
  ctx.fillStyle = c.b; ctx.beginPath(); ctx.ellipse(hx, hy, hr * 1.1, hr * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, hx, hy, hr * 2, c.g, 0.35 + Math.sin(t * 2) * 0.1); ctx.globalCompositeOperation = 'source-over';
  cracks(ctx, c, 0, -u * 0.5, u * 0.5, 3, r, t);
};

const drawSwarm: Draw = (ctx, c, u, t, r) => {
  for (let i = 0; i < 38; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * u * 0.42, sp = 0.6 + r() * 1.2;
    const x = Math.cos(a + t * sp * 0.5) * d, y = -u * 0.45 + Math.sin(a * 1.3 + t * sp) * d * 0.55, s = u * (0.02 + r() * 0.035);
    ctx.fillStyle = r() < 0.2 ? c.g : shade(c.a, r() * 0.4 - 0.1);
    if (r() < 0.5) { ctx.beginPath(); ctx.ellipse(x, y, s * 1.5, s, a, 0, Math.PI * 2); ctx.fill() }
    else { ctx.globalAlpha = 0.9; poly(ctx, [[x, y - s], [x + s * 1.4, y + s * 0.5], [x - s * 1.4, y + s * 0.5]]); ctx.fill(); ctx.globalAlpha = 1 }
  }
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.45, u * 0.5, c.g, 0.16); ctx.globalCompositeOperation = 'source-over';
};

const drawSpirit: Draw = (ctx, c, u, t, r) => {
  const flo = Math.sin(t * 1.7) * u * 0.03;
  ctx.save(); ctx.translate(0, -u * 0.08 + flo);
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.55, u * 0.7, c.g, 0.22); ctx.globalCompositeOperation = 'source-over';
  const g = vgrad(ctx, -u * 1.0, u * 0.1, [[0, rgba(shade(c.g, 0.1), 0.85)], [0.6, rgba(c.a, 0.8)], [1, rgba(c.a, 0)]]);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, -u * 0.98);
  ctx.bezierCurveTo(u * 0.16, -u * 0.96, u * 0.18, -u * 0.8, u * 0.2, -u * 0.7);
  ctx.bezierCurveTo(u * 0.34, -u * 0.52, u * 0.3, -u * 0.2, u * 0.36 + Math.sin(t * 2) * 6, u * 0.1);
  for (let i = 0; i < 6; i++) ctx.lineTo(u * (0.3 - i * 0.12), u * (i % 2 ? 0.02 : 0.14) + Math.sin(t * 3 + i) * 6);
  ctx.bezierCurveTo(-u * 0.3, -u * 0.2, -u * 0.34, -u * 0.52, -u * 0.2, -u * 0.7);
  ctx.bezierCurveTo(-u * 0.18, -u * 0.8, -u * 0.16, -u * 0.96, 0, -u * 0.98);
  ctx.fill();
  // veil: a pale cloth wound over where a face would be
  ctx.fillStyle = rgba(c.hi, 0.55);
  ctx.beginPath(); ctx.moveTo(-u * 0.12, -u * 0.9); ctx.quadraticCurveTo(0, -u * 0.8, u * 0.12, -u * 0.9); ctx.lineTo(u * 0.14, -u * 0.62 + Math.sin(t * 2.4) * 4); ctx.quadraticCurveTo(0, -u * 0.55, -u * 0.14, -u * 0.62); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(c.hi, 0.25); ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-u * 0.1 + i * u * 0.07, -u * 0.86); ctx.lineTo(-u * 0.12 + i * u * 0.08, -u * 0.62); ctx.stroke() }
  ctx.restore();
  void r;
};

const drawGolem: Draw = (ctx, c, u, t, r) => {
  const bob = Math.sin(t * 1.4) * u * 0.006;
  ctx.save(); ctx.translate(0, bob);
  const block = (x: number, y: number, w: number, h: number, k = 0) => { ctx.fillStyle = vgrad(ctx, y, y + h, [[0, shade(c.a, 0.15 + k)], [1, shade(c.a, -0.3 + k)]]); ctx.fillRect(x, y, w, h); ctx.strokeStyle = rgba(c.hi, 0.2); ctx.lineWidth = 1.3; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(x + w * 0.62, y, w * 0.38, h) };
  block(-u * 0.2, -u * 0.34, u * 0.16, u * 0.34); block(u * 0.04, -u * 0.34, u * 0.16, u * 0.34);
  block(-u * 0.3, -u * 0.78, u * 0.6, u * 0.46, 0.04);
  block(-u * 0.5, -u * 0.8, u * 0.2, u * 0.18); block(u * 0.3, -u * 0.8, u * 0.2, u * 0.18);
  block(-u * 0.5, -u * 0.62, u * 0.14, u * 0.4); block(u * 0.36, -u * 0.62, u * 0.14, u * 0.4);
  // head: a smooth block with a seam, no features
  block(-u * 0.12, -u * 0.98, u * 0.24, u * 0.2, 0.08);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-u * 0.12, -u * 0.89, u * 0.24, 2);
  ctx.beginPath(); ctx.ellipse(0, -u * 0.55, u * 0.1, u * 0.1, 0, 0, Math.PI * 2); ctx.fillStyle = '#0c0806'; ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.55, u * 0.38, c.g, 0.5 + Math.sin(t * 2.2) * 0.15); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = c.hi; ctx.beginPath(); ctx.arc(0, -u * 0.55, u * 0.04, 0, Math.PI * 2); ctx.fill();
  cracks(ctx, c, 0, -u * 0.55, u * 0.6, 5, r, t);
  ctx.restore();
};

const drawPlant: Draw = (ctx, c, u, t, r) => {
  ctx.lineCap = 'round';
  const root = (x0: number, side: number) => { ctx.strokeStyle = shade(c.a, -0.35); ctx.lineWidth = u * 0.06; ctx.beginPath(); ctx.moveTo(x0, -u * 0.3); ctx.quadraticCurveTo(x0 + side * u * 0.2, -u * 0.05, x0 + side * u * 0.42, 0); ctx.stroke() };
  root(-u * 0.05, -1); root(u * 0.05, 1); root(0, -0.5); root(0, 0.6);
  ctx.fillStyle = body(ctx, c, -u * 0.9, -u * 0.2);
  ctx.beginPath(); ctx.moveTo(-u * 0.14, -u * 0.05); ctx.bezierCurveTo(-u * 0.2, -u * 0.4, -u * 0.12, -u * 0.7, -u * 0.07, -u * 0.95); ctx.lineTo(u * 0.07, -u * 0.95); ctx.bezierCurveTo(u * 0.14, -u * 0.7, u * 0.2, -u * 0.4, u * 0.14, -u * 0.05); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-u * 0.08 + i * u * 0.04, -u * 0.1); ctx.quadraticCurveTo(-u * 0.05 + i * u * 0.035, -u * 0.5, -u * 0.04 + i * u * 0.02, -u * 0.9); ctx.stroke() }
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1, by = -u * (0.45 + i * 0.09), len = u * (0.34 - i * 0.02), a0 = s * (0.5 + r() * 0.3) + Math.sin(t * 1.5 + i) * 0.08;
    ctx.strokeStyle = shade(c.a, -0.1); ctx.lineWidth = u * 0.035; ctx.beginPath(); ctx.moveTo(0, by); ctx.quadraticCurveTo(s * len * 0.6, by - len * 0.7 + Math.sin(t * 1.5 + i) * 4, s * len * Math.cos(a0) + s * len * 0.4, by - len * 1.0); ctx.stroke();
    ctx.fillStyle = c.g; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(s * len * 1.0, by - len * 1.0, u * 0.016, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
  // crown of leaves in place of a head
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.4; ctx.fillStyle = shade(c.a, 0.1 + (i % 2) * 0.1); poly(ctx, [[0, -u * 0.95], [Math.cos(a) * u * 0.2, -u * 0.95 + Math.sin(a) * u * 0.2], [Math.cos(a + 0.2) * u * 0.1, -u * 0.95 + Math.sin(a + 0.2) * u * 0.1]]); ctx.fill() }
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.6, u * 0.4, c.g, 0.2); ctx.globalCompositeOperation = 'source-over';
};

const drawElemental: Draw = (ctx, c, u, t, r) => {
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, 0, -u * 0.5, u * 0.8, c.g, 0.25 + Math.sin(t * 4) * 0.06);
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = rgba(layer === 2 ? c.hi : layer === 1 ? c.g : c.a, 0.45 - layer * 0.05);
    ctx.beginPath(); ctx.moveTo(-u * (0.3 - layer * 0.07), 0);
    const n = 10;
    for (let i = 0; i <= n; i++) { const k = i / n, x = lerp(-u * (0.3 - layer * 0.07), u * (0.3 - layer * 0.07), k), top = -u * (0.45 + Math.sin(k * Math.PI) * (0.5 - layer * 0.1)) - Math.sin(t * (5 + layer) + k * 8 + layer) * u * 0.06; ctx.lineTo(x, i % 2 ? top : top + u * 0.06) }
    ctx.lineTo(u * (0.3 - layer * 0.07), 0); ctx.closePath(); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = shade(c.b, -0.2); ctx.beginPath(); ctx.ellipse(0, -u * 0.46, u * 0.1, u * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  void r;
};

const drawBlob: Draw = (ctx, c, u, t, r) => {
  const sq = 1 + Math.sin(t * 2.2) * 0.04;
  ctx.save(); ctx.scale(1 / sq, sq);
  ctx.fillStyle = vgrad(ctx, -u * 0.7, 0, [[0, shade(c.a, 0.3)], [0.6, c.a], [1, c.b]]);
  ctx.beginPath(); ctx.moveTo(-u * 0.44, 0); ctx.bezierCurveTo(-u * 0.5, -u * 0.5, -u * 0.2, -u * 0.76, 0, -u * 0.7); ctx.bezierCurveTo(u * 0.25, -u * 0.74, u * 0.5, -u * 0.5, u * 0.44, 0); ctx.closePath(); ctx.fill(); rimLine(ctx, c, 1.5);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.ellipse(-u * 0.15, -u * 0.55, u * 0.12, u * 0.07, -0.5, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 9; i++) { ctx.fillStyle = rgba(c.g, 0.3); ctx.beginPath(); ctx.arc((r() - 0.5) * u * 0.6, -u * (0.1 + r() * 0.45), u * (0.02 + r() * 0.04), 0, Math.PI * 2); ctx.fill() }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.3, u * 0.5, c.g, 0.15); ctx.globalCompositeOperation = 'source-over';
};

const drawTitan: Draw = (ctx, c, u, t, r) => {
  // a hollow bone giant seen as ribs and shoulders: no head at all
  ctx.fillStyle = body(ctx, c, -u * 1.0, 0);
  ctx.beginPath(); ctx.moveTo(-u * 0.6, 0); ctx.lineTo(-u * 0.5, -u * 0.7); ctx.quadraticCurveTo(-u * 0.3, -u * 1.02, 0, -u * 0.98); ctx.quadraticCurveTo(u * 0.3, -u * 1.02, u * 0.5, -u * 0.7); ctx.lineTo(u * 0.6, 0); ctx.closePath(); ctx.fill(); rimLine(ctx, c, 1.5);
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.ellipse(0, -u * 0.5, u * 0.34, u * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = shade(c.hi, -0.15); ctx.lineWidth = u * 0.045; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const y = -u * (0.2 + i * 0.14); for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, y - u * 0.04); ctx.bezierCurveTo(s * u * 0.2, y - u * 0.12, s * u * 0.34, y - u * 0.02, s * u * 0.32, y + u * 0.1); ctx.stroke() } }
  ctx.strokeStyle = shade(c.hi, -0.3); ctx.lineWidth = u * 0.05; ctx.beginPath(); ctx.moveTo(0, -u * 0.95); ctx.lineTo(0, -u * 0.1); ctx.stroke();
  ctx.fillStyle = shade(c.a, 0.1); ctx.beginPath(); ctx.ellipse(-u * 0.55, -u * 0.72, u * 0.16, u * 0.1, -0.4, 0, Math.PI * 2); ctx.ellipse(u * 0.55, -u * 0.72, u * 0.16, u * 0.1, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.5, u * 0.45, c.g, 0.4 + Math.sin(t * 1.5) * 0.1); ctx.globalCompositeOperation = 'source-over';
  cracks(ctx, c, 0, -u * 0.6, u * 0.8, 6, r, t);
};

const drawKing: Draw = (ctx, c, u, t, r) => {
  // a crowned, hooded colossus on a throne; the hood is empty and the crown floats over it
  ctx.fillStyle = shade(c.b, -0.3);
  poly(ctx, [[-u * 0.46, 0], [-u * 0.46, -u * 1.0], [-u * 0.32, -u * 1.22], [-u * 0.2, -u * 1.0], [0, -u * 1.34], [u * 0.2, -u * 1.0], [u * 0.32, -u * 1.22], [u * 0.46, -u * 1.0], [u * 0.46, 0]]); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.75, u * 0.9, c.g, 0.2 + Math.sin(t * 1.4) * 0.05); ctx.globalCompositeOperation = 'source-over';
  drawFigure(ctx, { x: 0, y: -u * 0.05, h: u * 1.05, look: 'crown', c: shade(c.a, -0.15), accent: c.g, rim: c.hi, back: false, weapon: 'staff', sway: 0.2 });
  sigil(ctx, c, 0, -u * 0.55, u * 0.06, t);
  void r;
};

const drawBell: Draw = (ctx, c, u, t, r) => {
  // a great bell wearing a veil
  const sw = Math.sin(t * 1.3) * 0.05;
  ctx.save(); ctx.translate(0, -u * 0.1); ctx.rotate(sw);
  ctx.fillStyle = vgrad(ctx, -u * 0.95, u * 0.1, [[0, shade('#b79a4a', 0.15)], [0.5, '#8a7230'], [1, '#3a2f12']]);
  ctx.beginPath(); ctx.moveTo(-u * 0.13, -u * 0.93); ctx.bezierCurveTo(-u * 0.3, -u * 0.9, -u * 0.34, -u * 0.5, -u * 0.4, -u * 0.25); ctx.quadraticCurveTo(-u * 0.44, -u * 0.08, -u * 0.5, u * 0.08); ctx.lineTo(u * 0.5, u * 0.08); ctx.quadraticCurveTo(u * 0.44, -u * 0.08, u * 0.4, -u * 0.25); ctx.bezierCurveTo(u * 0.34, -u * 0.5, u * 0.3, -u * 0.9, u * 0.13, -u * 0.93); ctx.closePath(); ctx.fill(); rimLine(ctx, c, 1.4);
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-u * 0.35, -u * 0.25); ctx.lineTo(u * 0.35, -u * 0.25); ctx.moveTo(-u * 0.28, -u * 0.5); ctx.lineTo(u * 0.28, -u * 0.5); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.ellipse(0, u * 0.08, u * 0.46, u * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  // veil drape
  ctx.fillStyle = rgba('#aab8b0', 0.32);
  ctx.beginPath(); ctx.moveTo(-u * 0.1, -u * 0.96); ctx.quadraticCurveTo(-u * 0.36, -u * 0.6, -u * 0.44 + Math.sin(t * 2) * 5, u * 0.14); ctx.lineTo(-u * 0.3, u * 0.02); ctx.quadraticCurveTo(-u * 0.22, -u * 0.5, -u * 0.06, -u * 0.8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(u * 0.1, -u * 0.96); ctx.quadraticCurveTo(u * 0.36, -u * 0.6, u * 0.44 + Math.sin(t * 2.3) * 5, u * 0.14); ctx.lineTo(u * 0.3, u * 0.02); ctx.quadraticCurveTo(u * 0.22, -u * 0.5, u * 0.06, -u * 0.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6a5a22'; ctx.lineWidth = u * 0.03; ctx.beginPath(); ctx.arc(0, -u * 0.99, u * 0.07, Math.PI, 0); ctx.stroke();
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -u * 0.4, u * 0.7, c.g, 0.15); ctx.globalCompositeOperation = 'source-over';
  void r;
};

const drawCart: Draw = drawGolem;

const DRAW: Record<Arch, Draw> = { hood: drawHood, armor: drawArmor, rogue: drawRogue, quad: drawQuad, crawler: drawCrawler, winged: drawWinged, worm: drawWorm, swarm: drawSwarm, spirit: drawSpirit, golem: drawGolem, plant: drawPlant, elemental: drawElemental, blob: drawBlob, titan: drawTitan, king: drawKing, bell: drawBell, cart: drawCart };

/** Draws the creature standing on (w/2, h*0.9). */
export function drawCreature(ctx: CanvasRenderingContext2D, w: number, h: number, c: CreatureSpec, st: CreatureState) {
  const u = h * 0.74 * c.size;
  const gy = h * 0.9;
  ctx.save();
  // aura for elites and bosses
  const auraC = c.rank === 'boss' ? '#f0b850' : c.rank === 'elite' ? '#b07af0' : c.g;
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, w / 2, gy - u * 0.5, u * 0.95, auraC, c.rank === 'normal' ? 0.1 : 0.2 + Math.sin(st.t * 2) * 0.04 + (st.enrage ? 0.15 : 0));
  ctx.globalCompositeOperation = 'source-over';
  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(w / 2, gy + 3, u * 0.42, u * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  const lung = clamp(st.lunge);
  const shakeX = st.hit > 0 ? (Math.random() - 0.5) * 14 * st.hit : 0;
  const dieK = clamp(st.die);
  ctx.translate(w / 2 + shakeX, gy + lung * h * 0.1);
  const sc = 1 + lung * 0.2 + Math.sin(st.t * 1.8) * 0.008;
  ctx.scale(sc, sc * (1 - dieK * 0.35));
  ctx.globalAlpha = 1 - dieK;
  if (st.hit > 0) { ctx.filter = `brightness(${1 + st.hit * 1.8})` }
  const rnd = rngOf(c.seed);
  DRAW[c.arch](ctx, c, u, st.t, rnd);
  ctx.filter = 'none';
  if (c.rank === 'boss' && c.crown) { /* crown drawn by the archetype */ }
  ctx.restore();
  void mix;
}
