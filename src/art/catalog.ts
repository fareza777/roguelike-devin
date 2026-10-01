import type { Layer, SceneSpec } from './scene';

type Sky = SceneSpec['sky'];
const eclipse = (x = 0.5, y = 0.3, r = 0.075, c = '#ff6a3a', corona = '#ffb060'): Sky['body'] => ({ kind: 'eclipse', x, y, r, c, corona });

const PAL = {
  blood: { top: '#0a0405', mid: '#3a0f10', low: '#7a2a1c', glow: '#ff5a2a' },
  ash: { top: '#0a0707', mid: '#2a1410', low: '#6a3a22', glow: '#ff8a40' },
  night: { top: '#04060c', mid: '#0c1424', low: '#243650', glow: '#7aa8e8' },
  sea: { top: '#030a0c', mid: '#0a2228', low: '#2a5a60', glow: '#5fd6c0' },
  bone: { top: '#0a0806', mid: '#2a2218', low: '#6a5a40', glow: '#e6c88a' },
  ice: { top: '#050a14', mid: '#14263c', low: '#4a6e94', glow: '#a8d4ff' },
  noon: { top: '#1a1204', mid: '#6a4c12', low: '#d8a840', glow: '#ffe08a' },
  void: { top: '#020104', mid: '#12081c', low: '#3a1a52', glow: '#a860ff' },
  moss: { top: '#030806', mid: '#0e2418', low: '#2e5a3a', glow: '#8ee070' },
  dusk: { top: '#0a0610', mid: '#2a1428', low: '#7a3a3a', glow: '#ff9a60' },
  glass: { top: '#0a0610', mid: '#4a2a3a', low: '#e8a86a', glow: '#ffd8a0' },
  brass: { top: '#080604', mid: '#2a1c0e', low: '#8a5a22', glow: '#ffb050' },
  deep: { top: '#010204', mid: '#06121a', low: '#0e2a38', glow: '#40e0d0' },
  hall: { top: '#050304', mid: '#150c0c', low: '#2c1a14', glow: '#ffb060' },
} as const;
type PalKey = keyof typeof PAL;

function base(seed: number, p: PalKey, extra: { body?: Sky['body']; stars?: number; clouds?: Sky['clouds']; aurora?: string[]; rays?: Sky['rays']; glowAt?: [number, number] } = {}): SceneSpec {
  const c = PAL[p];
  return {
    seed,
    sky: { top: c.top, mid: c.mid, low: c.low, glow: { x: extra.glowAt?.[0] ?? 0.5, y: extra.glowAt?.[1] ?? 0.5, r: 0.7, c: c.glow, a: 0.35 }, stars: extra.stars ?? 0, clouds: extra.clouds, body: extra.body ?? null, aurora: extra.aurora, rays: extra.rays },
    grade: { vignette: 0.75, grain: 0.07 },
  };
}
const clouds = (c: string, a = 0.5): Sky['clouds'] => [{ c, a, y: 0.25, h: 0.5, scale: 1 }, { c: '#000000', a: a * 0.6, y: 0.4, h: 0.4, scale: 1.7 }];
const hero = (x: number, c: string, lantern: string, rim: string, s = 0.44, y = 0.96): Layer => ({ t: 'figure', x, y, s, look: 'hood', c, lantern, weapon: 'blade', back: true, rim });
const fig = (x: number, look: 'hood' | 'mask' | 'veil' | 'helm' | 'cowl' | 'hat' | 'crown' | 'plague' | 'bell', c: string, rim: string, o: Partial<Extract<Layer, { t: 'figure' }>> = {}): Layer => ({ t: 'figure', x, y: 0.96, s: 0.42, look, c, back: false, rim, ...o });

/** A vaulted interior: pillars, hanging lamps, a long floor. */
function hall(seed: number, p: PalKey, pillar: string, lamp: string, floor: string, extra: Layer[] = [], fogC = '#a86a40'): SceneSpec {
  return {
    ...base(seed, p),
    far: [{ t: 'columns', y: 0.62, n: 8, h: 0.5, c: pillar, style: 'arch', haze: 0.35, seed, w: 0.03 }],
    mid: [{ t: 'columns', y: 0.78, n: 4, h: 0.66, c: pillar, style: 'arch', w: 0.05, seed: seed + 3, x0: 0.1, x1: 0.9 }, { t: 'hang', n: 7, c: '#0a0808', glow: lamp, seed }],
    near: [{ t: 'ground', y: 0.78, c: floor, c2: '#040303', road: true, roadC: '#5a2a24', puddles: lamp }, { t: 'pillars', n: 4, c: '#050303', w: 0.07, seed }, ...extra],
    fog: [{ c: fogC, a: 0.2, y: 0.74, h: 0.3 }], particles: { kind: 'dust', n: 26 },
    lights: [{ x: 0.5, y: 0.34, r: 0.2, c: lamp, a: 0.28 }],
  };
}

export const SCENES: Record<string, SceneSpec> = {
  splash: {
    ...base(1, 'blood', { body: eclipse(0.5, 0.27, 0.085), stars: 40, clouds: clouds('#c0402a', 0.55) }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.1, c: '#2a1012', haze: 0.35, seed: 3 }, { t: 'skyline', y: 0.7, c: '#14090b', style: 'keep', h: 0.36, windows: '#ffb860', haze: 0.18, seed: 4, x0: 0.18, x1: 0.95 }],
    mid: [{ t: 'ridge', y: 0.8, amp: 0.1, c: '#140a0c', seed: 9 }, { t: 'columns', y: 0.82, n: 3, h: 0.34, c: '#1a0d0e', style: 'broken', seed: 3, x0: 0.02, x1: 0.2 }],
    near: [{ t: 'ground', y: 0.82, c: '#120a0a', c2: '#030202', road: true, roadC: '#2a1812' }, hero(0.34, '#2a2220', '#ffb860', '#ff7a40', 0.5, 0.95)],
    fog: [{ c: '#a05a40', a: 0.28, y: 0.74, h: 0.3, speed: 5 }, { c: '#601818', a: 0.2, y: 0.9, h: 0.25, speed: 8 }],
    particles: { kind: 'embers', n: 30 }, lights: [{ x: 0.28, y: 0.83, r: 0.13, c: '#ffb860', a: 0.5 }],
  },
  intro_sun: {
    ...base(11, 'dusk', { body: { kind: 'sun', x: 0.5, y: 0.34, r: 0.06, c: '#fff0c0', corona: '#ffd890' }, stars: 0, clouds: clouds('#e0a060', 0.4), glowAt: [0.5, 0.4] }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.1, c: '#3a2a2a', haze: 0.5, seed: 5 }, { t: 'skyline', y: 0.7, c: '#2a1c1c', style: 'town', h: 0.3, windows: '#ffd8a0', haze: 0.3, seed: 6, density: 1.2 }],
    mid: [{ t: 'ridge', y: 0.8, amp: 0.06, c: '#1c1212', seed: 3 }, { t: 'crowd', y: 0.86, n: 18, c: '#1c1414', s: 0.16, seed: 4 }],
    near: [{ t: 'ground', y: 0.84, c: '#1a1210', c2: '#050303' }, { t: 'crowd', y: 0.97, n: 9, c: '#0e0808', s: 0.3, seed: 8 }],
    fog: [{ c: '#d8905a', a: 0.2, y: 0.8, h: 0.3 }], particles: { kind: 'motes', n: 24 },
  },
  dawn: {
    ...base(17, 'glass', { body: { kind: 'sun', x: 0.5, y: 0.52, r: 0.07, c: '#fff4d0', corona: '#ffd890' }, clouds: clouds('#f0b070', 0.5), glowAt: [0.5, 0.55], rays: { x: 0.5, c: '#ffe0a0', a: 0.16 } }),
    far: [{ t: 'ridge', y: 0.66, amp: 0.08, c: '#4a2a2a', haze: 0.5, seed: 5 }, { t: 'skyline', y: 0.72, c: '#2a1a1c', style: 'keep', h: 0.3, windows: '#ffe0a0', haze: 0.3, seed: 6 }],
    mid: [{ t: 'ridge', y: 0.84, amp: 0.05, c: '#1c1212', seed: 3 }],
    near: [{ t: 'ground', y: 0.86, c: '#201614', c2: '#060303', road: true, roadC: '#6a4a30' }, hero(0.4, '#1c1614', '#ffe0a0', '#ffd890', 0.36, 0.94)],
    fog: [{ c: '#f0b070', a: 0.22, y: 0.8, h: 0.3 }], particles: { kind: 'motes', n: 30, c: '#ffe8b0' },
    lights: [{ x: 0.5, y: 0.55, r: 0.4, c: '#ffd890', a: 0.3 }],
  },
  intro_shadows: {
    ...base(12, 'ash', { body: eclipse(0.5, 0.2, 0.07, '#ff8a40', '#ffd890'), clouds: clouds('#b05a30', 0.4) }),
    far: [{ t: 'ridge', y: 0.64, amp: 0.06, c: '#2a1a14', haze: 0.4, seed: 8 }],
    mid: [{ t: 'columns', y: 0.78, n: 4, h: 0.4, c: '#1a1210', style: 'broken', seed: 2 }],
    near: [{ t: 'ground', y: 0.74, c: '#241a14', c2: '#0a0604' }, fig(0.5, 'hood', '#1c1614', '#ff9a50', { s: 0.5, y: 0.9 }), { t: 'figure', x: 0.3, y: 0.97, s: 0.46, look: 'hood', c: '#0a0706', back: false, rim: '#401a10', flip: true }, { t: 'figure', x: 0.72, y: 0.97, s: 0.46, look: 'hood', c: '#0a0706', back: false, rim: '#401a10' }],
    fog: [{ c: '#a05a30', a: 0.2, y: 0.8, h: 0.3 }], particles: { kind: 'ash', n: 40 },
  },
  intro_rift: {
    ...base(13, 'void', { body: { kind: 'void', x: 0.5, y: 0.3, r: 0.07, c: '#a860ff', corona: '#c890ff' }, stars: 70, clouds: clouds('#6a2a9a', 0.5) }),
    far: [{ t: 'ridge', y: 0.66, amp: 0.08, c: '#140a22', haze: 0.4, seed: 4 }, { t: 'spires', y: 0.7, n: 7, h: 0.5, c: '#1a0c2a', rim: '#c890ff', style: 'rock', seed: 4 }],
    mid: [{ t: 'ridge', y: 0.84, amp: 0.06, c: '#0a0612', seed: 2 }],
    near: [{ t: 'ground', y: 0.86, c: '#0e0716', c2: '#030106' }],
    fog: [{ c: '#8a4ad0', a: 0.18, y: 0.78, h: 0.3 }], particles: { kind: 'motes', n: 30, c: '#d8a8ff' }, lightning: true,
  },
  intro_march: {
    ...base(14, 'blood', { body: eclipse(0.78, 0.2, 0.05), clouds: clouds('#8a2a20', 0.45) }),
    far: [{ t: 'ridge', y: 0.58, amp: 0.1, c: '#2a1012', haze: 0.4, seed: 2 }, { t: 'skyline', y: 0.66, c: '#180a0c', style: 'keep', h: 0.4, windows: '#ffb860', x0: 0.05, x1: 0.5, seed: 4, haze: 0.2 }],
    mid: [{ t: 'ground', y: 0.74, c: '#1a0c0c', c2: '#080404' }, { t: 'crowd', y: 0.82, n: 40, c: '#0e0606', s: 0.1, seed: 7 }, { t: 'banner', x: 0.62, y: 0.55, h: 0.2, c: '#5a1414' }, { t: 'banner', x: 0.84, y: 0.58, h: 0.18, c: '#5a1414' }],
    near: [{ t: 'crowd', y: 0.96, n: 14, c: '#070303', s: 0.22, seed: 12 }],
    fog: [{ c: '#a02a20', a: 0.24, y: 0.8, h: 0.3 }], particles: { kind: 'embers', n: 40 }, lights: [{ x: 0.3, y: 0.74, r: 0.2, c: '#ff7a30', a: 0.3 }],
  },
  intro_road: {
    ...base(15, 'blood', { body: eclipse(0.5, 0.26, 0.07), stars: 30, clouds: clouds('#8a2a20', 0.45) }),
    far: [{ t: 'ridge', y: 0.64, amp: 0.12, c: '#2a1012', haze: 0.4, seed: 7 }, { t: 'skyline', y: 0.7, c: '#160a0c', style: 'lamp', h: 0.34, windows: '#ffc070', x0: 0.35, x1: 0.65, seed: 3, haze: 0.2 }],
    mid: [{ t: 'dead', y: 0.8, n: 10, h: 0.45, c: '#120808', seed: 4 }],
    near: [{ t: 'ground', y: 0.78, c: '#150b0b', c2: '#040202', road: true, roadC: '#3a2018' }, hero(0.5, '#2a2220', '#ffb860', '#ff7a40', 0.34, 0.9)],
    fog: [{ c: '#a05a40', a: 0.26, y: 0.76, h: 0.3 }], particles: { kind: 'embers', n: 30 }, lights: [{ x: 0.5, y: 0.78, r: 0.12, c: '#ffb860', a: 0.5 }],
  },
  veyrgard: {
    ...base(2, 'blood', { body: eclipse(0.22, 0.2, 0.06), stars: 30, clouds: clouds('#8a2a1c', 0.5) }),
    far: [{ t: 'ridge', y: 0.55, amp: 0.1, c: '#3a1414', haze: 0.45, seed: 5 }, { t: 'skyline', y: 0.64, c: '#1a0c0e', style: 'lamp', h: 0.4, windows: '#ffc070', haze: 0.12, seed: 6 }],
    mid: [{ t: 'skyline', y: 0.78, c: '#0f0708', style: 'town', h: 0.34, windows: '#ff9a50', seed: 8 }, { t: 'tower', x: 0.82, y: 0.78, w: 0.05, h: 0.4, c: '#120a0b', lit: '#ffb060', roof: 'lamp' }],
    near: [{ t: 'ground', y: 0.8, c: '#140b0c', c2: '#050303', road: true, roadC: '#3a2018' }, { t: 'banner', x: 0.1, y: 0.52, h: 0.3, c: '#7a1c1c' }, fig(0.62, 'helm', '#2c2826', '#ff8a50', { weapon: 'banner', back: true, accent: '#7a1c1c' })],
    fog: [{ c: '#a03a28', a: 0.22, y: 0.72, h: 0.3 }], particles: { kind: 'ash', n: 40 }, lights: [{ x: 0.8, y: 0.34, r: 0.12, c: '#ffb060', a: 0.45 }],
  },
  siege: {
    ...base(16, 'blood', { body: eclipse(0.2, 0.2, 0.06), clouds: clouds('#a02a1c', 0.55) }),
    far: [{ t: 'skyline', y: 0.62, c: '#1a0a0c', style: 'lamp', h: 0.4, windows: '#ffb060', x0: 0, x1: 0.55, seed: 7, haze: 0.15 }],
    mid: [{ t: 'ground', y: 0.7, c: '#1a0c0c', c2: '#070303' }, { t: 'crowd', y: 0.82, n: 50, c: '#0c0505', s: 0.1, seed: 3 }, { t: 'tower', x: 0.62, y: 0.78, w: 0.09, h: 0.4, c: '#140a0a', roof: 'flat' }, { t: 'tower', x: 0.86, y: 0.78, w: 0.08, h: 0.46, c: '#140a0a', roof: 'flat' }],
    near: [{ t: 'ground', y: 0.88, c: '#0e0606', c2: '#030101' }, fig(0.22, 'helm', '#1a1412', '#ff7a40', { s: 0.5, back: true, weapon: 'blade' })],
    fog: [{ c: '#601818', a: 0.3, y: 0.8, h: 0.35 }], particles: { kind: 'embers', n: 60 }, lights: [{ x: 0.65, y: 0.72, r: 0.18, c: '#ff6a20', a: 0.5 }, { x: 0.9, y: 0.75, r: 0.14, c: '#ff6a20', a: 0.45 }],
  },
  heartland: {
    ...base(21, 'dusk', { body: eclipse(0.7, 0.2, 0.05), stars: 20, clouds: clouds('#8a3a2a', 0.4) }),
    far: [{ t: 'ridge', y: 0.6, amp: 0.12, c: '#2a1a1c', haze: 0.45, seed: 4 }], mid: [{ t: 'pines', y: 0.8, n: 14, h: 0.3, c: '#140d0e', seed: 3 }, { t: 'dead', y: 0.82, n: 4, h: 0.5, c: '#0e0809', seed: 5 }],
    near: [{ t: 'ground', y: 0.8, c: '#1a1210', c2: '#050303', road: true, roadC: '#3a2a20' }, hero(0.4, '#2a2220', '#ffb860', '#ffa060', 0.36, 0.92)], fog: [{ c: '#a0604a', a: 0.2, y: 0.78, h: 0.3 }], particles: { kind: 'dust', n: 24 },
  },
  hangedman: {
    ...base(22, 'night', { stars: 80, body: { kind: 'moon', x: 0.74, y: 0.2, r: 0.04, c: '#c8c0d8', corona: '#8a90c0' } }),
    far: [{ t: 'ridge', y: 0.66, amp: 0.1, c: '#141a2a', haze: 0.4, seed: 6 }], mid: [{ t: 'dead', y: 0.8, n: 3, h: 0.7, c: '#080a12', seed: 3 }, { t: 'tower', x: 0.3, y: 0.82, w: 0.16, h: 0.22, c: '#10101a', lit: '#ffb860', roof: 'cone' }],
    near: [{ t: 'ground', y: 0.82, c: '#10121a', c2: '#030307', road: true, roadC: '#262836' }], fog: [{ c: '#4a5a8a', a: 0.22, y: 0.8, h: 0.3 }], lights: [{ x: 0.32, y: 0.74, r: 0.12, c: '#ffb860', a: 0.5 }], particles: { kind: 'dust', n: 14 },
  },
  lantern_hall: hall(31, 'hall', '#241410', '#ffb060', '#1a0e0c', [{ t: 'throne', x: 0.5, y: 0.8, s: 0.2, c: '#0c0706', glow: '#ffb060' }, fig(0.5, 'veil', '#d8d0c0', '#ffd8a0', { s: 0.26, y: 0.79, accent: '#101010' })]),
  bellhouse: {
    ...base(3, 'sea'),
    far: [{ t: 'columns', y: 0.6, n: 9, h: 0.5, c: '#10282a', style: 'arch', haze: 0.35, seed: 3, w: 0.03 }],
    mid: [{ t: 'columns', y: 0.78, n: 5, h: 0.62, c: '#0a1a1c', style: 'arch', w: 0.05, seed: 8, x0: 0.05, x1: 0.95 }, { t: 'hang', n: 6, c: '#0a1416', glow: '#ffb860', seed: 4 }],
    near: [{ t: 'columns', y: 1, n: 2, h: 0.95, c: '#050c0e', w: 0.1, seed: 2, x0: 0.04, x1: 0.96, style: 'colonnade' }],
    water: { y: 0.72, c1: '#1c5a5c', c2: '#041014', reflect: 0.45 }, fog: [{ c: '#4a9a90', a: 0.3, y: 0.7, h: 0.3 }], particles: { kind: 'drips', n: 24 },
    lights: [{ x: 0.3, y: 0.3, r: 0.14, c: '#ffb860', a: 0.35 }, { x: 0.72, y: 0.34, r: 0.12, c: '#7aeed0', a: 0.3 }],
  },
  saltmere: {
    ...base(41, 'sea', { body: { kind: 'moon', x: 0.2, y: 0.2, r: 0.04, c: '#c8e0e0', corona: '#5fd6c0' }, stars: 60, clouds: clouds('#2a5a60', 0.4) }),
    far: [{ t: 'skyline', y: 0.62, c: '#0c1c20', style: 'harbor', h: 0.34, windows: '#ffc880', haze: 0.2, seed: 5, density: 1.1 }, { t: 'ship', x: 0.8, y: 0.62, s: 0.2, c: '#0a1618', ghost: true }],
    mid: [{ t: 'skyline', y: 0.72, c: '#08121a', style: 'harbor', h: 0.2, windows: '#ff9a50', seed: 9, x0: 0.05, x1: 0.6 }, { t: 'ship', x: 0.3, y: 0.72, s: 0.16, c: '#050c10' }],
    near: [{ t: 'pillars', n: 2, c: '#050a0c', w: 0.03, seed: 2 }, fig(0.72, 'hat', '#1a1c1e', '#5fd6c0', { s: 0.34, y: 0.98, back: true })],
    water: { y: 0.72, c1: '#1c5a5c', c2: '#041014', reflect: 0.5 }, fog: [{ c: '#4a9a90', a: 0.25, y: 0.7, h: 0.3 }], particles: { kind: 'rain', n: 60 },
    lights: [{ x: 0.5, y: 0.6, r: 0.15, c: '#ffc880', a: 0.3 }],
  },
  wickhaven: {
    ...base(42, 'sea', { stars: 40, clouds: clouds('#2a5a60', 0.4), body: { kind: 'moon', x: 0.7, y: 0.22, r: 0.04, c: '#d0e8e8', corona: '#5fd6c0' } }),
    far: [{ t: 'ridge', y: 0.58, amp: 0.2, c: '#0c1c22', haze: 0.4, seed: 8 }], mid: [{ t: 'skyline', y: 0.78, c: '#07121a', style: 'stilt', h: 0.2, windows: '#ffb860', seed: 8, density: 1.4 }],
    near: [{ t: 'kelp', y: 1, n: 6, h: 0.3, c: '#041014', seed: 3 }], water: { y: 0.78, c1: '#1c5a5c', c2: '#041014', reflect: 0.5 }, fog: [{ c: '#4a9a90', a: 0.22, y: 0.76, h: 0.3 }], particles: { kind: 'rain', n: 40 }, lights: [{ x: 0.5, y: 0.7, r: 0.12, c: '#ffb860', a: 0.3 }],
  },
  seacaves: {
    ...base(43, 'sea'), far: [{ t: 'stalactites', n: 18, h: 0.4, c: '#0a1a1c', seed: 4 }, { t: 'spires', y: 0.7, n: 8, h: 0.4, c: '#0e2428', rim: '#5fd6c0', style: 'rock', seed: 4 }],
    mid: [{ t: 'kelp', y: 0.8, n: 10, h: 0.35, c: '#05161a', seed: 2 }], near: [{ t: 'stalactites', n: 7, h: 0.55, c: '#020a0c', seed: 8 }], water: { y: 0.7, c1: '#1c6a6c', c2: '#031014', reflect: 0.4 },
    fog: [{ c: '#4a9a90', a: 0.25, y: 0.7, h: 0.3 }], particles: { kind: 'drips', n: 30 }, lights: [{ x: 0.5, y: 0.5, r: 0.25, c: '#5fd6c0', a: 0.2 }],
  },
  emberhollow: {
    ...base(51, 'ash', { body: eclipse(0.8, 0.2, 0.05), clouds: clouds('#b05a22', 0.5), stars: 14 }),
    far: [{ t: 'ridge', y: 0.58, amp: 0.1, c: '#2a1208', haze: 0.4, seed: 9 }, { t: 'pines', y: 0.66, n: 22, h: 0.3, c: '#140806', haze: 0.2, seed: 3 }],
    mid: [{ t: 'skyline', y: 0.8, c: '#140a06', style: 'town', h: 0.34, windows: '#ffa050', seed: 7 }], near: [{ t: 'ground', y: 0.84, c: '#1a0e08', c2: '#050202', road: true, roadC: '#3a2214' }],
    fog: [{ c: '#a05a28', a: 0.24, y: 0.78, h: 0.3 }], particles: { kind: 'embers', n: 44 }, lights: [{ x: 0.5, y: 0.7, r: 0.2, c: '#ff8a40', a: 0.35 }],
  },
  ashwood: {
    ...base(4, 'ash', { body: eclipse(0.7, 0.22, 0.06), clouds: clouds('#b44a22', 0.55), stars: 14 }),
    far: [{ t: 'ridge', y: 0.6, amp: 0.1, c: '#3a1a10', haze: 0.4, seed: 2 }, { t: 'dead', y: 0.66, n: 22, h: 0.4, c: '#2a120a', haze: 0.3, seed: 2, glow: '#ff8a40' }],
    mid: [{ t: 'dead', y: 0.82, n: 12, h: 0.7, c: '#140806', seed: 3, glow: '#ff6a2a' }], near: [{ t: 'ground', y: 0.82, c: '#1a0e08', c2: '#050202', seed: 4 }, { t: 'dead', y: 1.0, n: 3, h: 0.95, c: '#050303', seed: 5 }],
    fog: [{ c: '#a04a28', a: 0.25, y: 0.76, h: 0.3 }], particles: { kind: 'embers', n: 50 }, lights: [{ x: 0.5, y: 0.86, r: 0.2, c: '#ff7a30', a: 0.3 }],
  },
  cinder_hall: hall(52, 'ash', '#2a1608', '#ff8a40', '#1c0e08', [{ t: 'ground', y: 0.9, c: '#1a0c06', c2: '#050302' }], '#a05a28'),
  hearthcrypt: {
    ...base(53, 'ash'), far: [{ t: 'columns', y: 0.62, n: 10, h: 0.45, c: '#2a1208', style: 'broken', haze: 0.3, seed: 4, w: 0.03 }], mid: [{ t: 'columns', y: 0.8, n: 5, h: 0.6, c: '#1a0b06', style: 'arch', seed: 6, w: 0.05 }, { t: 'hang', n: 5, c: '#0a0504', glow: '#ff7a30' }],
    near: [{ t: 'ground', y: 0.8, c: '#1a0c06', c2: '#040201', puddles: '#ff7a30' }, { t: 'pillars', n: 4, c: '#050202', w: 0.07 }], fog: [{ c: '#a04a20', a: 0.25, y: 0.76, h: 0.3 }], particles: { kind: 'embers', n: 40 }, lights: [{ x: 0.5, y: 0.7, r: 0.2, c: '#ff7a30', a: 0.3 }],
  },
  hollowhill: {
    ...base(54, 'moss', { stars: 50, body: { kind: 'moon', x: 0.3, y: 0.2, r: 0.045, c: '#d0e8c0', corona: '#8ee070' } }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.1, c: '#0c1c12', haze: 0.4, seed: 6 }], mid: [{ t: 'dead', y: 0.8, n: 9, h: 0.55, c: '#06100a', seed: 4 }, { t: 'shrooms', y: 0.82, n: 6, h: 0.14, c: '#2a5a3a', glow: '#8ee070', seed: 5 }],
    near: [{ t: 'ground', y: 0.82, c: '#0c1a10', c2: '#020604', puddles: '#8ee070' }, { t: 'thorns', y: 1, n: 5, h: 0.4, c: '#030a05', seed: 4 }], fog: [{ c: '#4a8a5a', a: 0.28, y: 0.78, h: 0.3 }], particles: { kind: 'spores', n: 50 },
  },
  archive: {
    ...base(55, 'ash'), far: [{ t: 'columns', y: 0.6, n: 12, h: 0.55, c: '#241410', style: 'broken', haze: 0.3, seed: 8, w: 0.03 }], mid: [],
    near: [{ t: 'ground', y: 0.8, c: '#1a0e0a', c2: '#040201', puddles: '#ff8a40' }, { t: 'pillars', n: 4, c: '#050302', w: 0.06 }, { t: 'columns', y: 0.86, n: 6, h: 0.42, c: '#120a08', style: 'broken', seed: 3 }],
    fog: [{ c: '#6a3a28', a: 0.28, y: 0.76, h: 0.3 }], particles: { kind: 'ash', n: 50 }, lights: [{ x: 0.5, y: 0.6, r: 0.2, c: '#ff8a40', a: 0.28 }],
  },
  gravemarrow: {
    ...base(61, 'bone', { stars: 20, clouds: clouds('#8a7a58', 0.35) }), far: [{ t: 'ribs', y: 0.8, n: 6, h: 0.9, c: '#4a4030', haze: 0.35, seed: 4 }, { t: 'skyline', y: 0.8, c: '#1a1610', style: 'town', h: 0.2, windows: '#ffd890', seed: 6, haze: 0.2 }],
    mid: [{ t: 'ribs', y: 0.9, n: 4, h: 0.7, c: '#2a2418', seed: 8 }], near: [{ t: 'ground', y: 0.86, c: '#1c1710', c2: '#050403', road: true, roadC: '#3a3020' }], fog: [{ c: '#a09070', a: 0.2, y: 0.8, h: 0.3 }], particles: { kind: 'dust', n: 40 }, lights: [{ x: 0.5, y: 0.8, r: 0.15, c: '#ffd890', a: 0.3 }],
  },
  quarry: {
    ...base(62, 'bone', { stars: 10, clouds: clouds('#8a7a58', 0.3) }), far: [{ t: 'ridge', y: 0.55, amp: 0.25, c: '#2a2418', haze: 0.4, seed: 5 }, { t: 'ribs', y: 0.78, n: 7, h: 0.8, c: '#4a4030', haze: 0.3, seed: 9 }],
    mid: [{ t: 'ribs', y: 0.88, n: 4, h: 0.6, c: '#2a2418', seed: 2 }, { t: 'columns', y: 0.88, n: 5, h: 0.3, c: '#181410', style: 'broken', seed: 8 }], near: [{ t: 'ground', y: 0.86, c: '#1c1710', c2: '#050403' }, fig(0.7, 'hat', '#1a1612', '#e6c88a', { s: 0.34, y: 0.96, back: true })],
    fog: [{ c: '#a09070', a: 0.26, y: 0.8, h: 0.3 }], particles: { kind: 'dust', n: 50 }, lights: [{ x: 0.7, y: 0.86, r: 0.12, c: '#ffd890', a: 0.4 }],
  },
  ribcage: { ...base(63, 'bone'), far: [{ t: 'ribs', y: 0.9, n: 9, h: 1.1, c: '#3a3224', haze: 0.3, seed: 6 }], mid: [{ t: 'ribs', y: 0.92, n: 5, h: 0.9, c: '#241e14', seed: 4 }], near: [{ t: 'ground', y: 0.88, c: '#14100a', c2: '#030302', puddles: '#e6c88a' }], fog: [{ c: '#a09070', a: 0.3, y: 0.7, h: 0.4 }], particles: { kind: 'motes', n: 30 }, lights: [{ x: 0.5, y: 0.5, r: 0.3, c: '#ffd890', a: 0.18 }] },
  foundry: {
    ...base(64, 'brass'), far: [{ t: 'skyline', y: 0.7, c: '#1a1008', style: 'cog', h: 0.5, windows: '#ff9a40', seed: 3, haze: 0.2 }, { t: 'cogs', y: 0.4, n: 4, r: 0.28, c: '#120a06', seed: 3 }], mid: [{ t: 'skyline', y: 0.84, c: '#0e0804', style: 'cog', h: 0.34, windows: '#ff7a30', seed: 8 }],
    near: [{ t: 'ground', y: 0.84, c: '#140c06', c2: '#030201', puddles: '#ff7a30' }, { t: 'cogs', y: 1, n: 2, r: 0.3, c: '#040201', seed: 9 }], fog: [{ c: '#a0602a', a: 0.28, y: 0.76, h: 0.3 }], particles: { kind: 'sparks', n: 40 }, lights: [{ x: 0.3, y: 0.8, r: 0.2, c: '#ff7a30', a: 0.35 }, { x: 0.75, y: 0.8, r: 0.2, c: '#ff7a30', a: 0.3 }],
  },
  hollowreach: {
    ...base(71, 'ice', { stars: 60, aurora: ['#4af0a0'], clouds: clouds('#6a8ab0', 0.3) }), far: [{ t: 'ridge', y: 0.6, amp: 0.2, c: '#2a3c58', haze: 0.35, seed: 3, snow: true }, { t: 'skyline', y: 0.72, c: '#0c1422', style: 'keep', h: 0.34, windows: '#ffd8a0', seed: 5, x0: 0.2, x1: 0.8, haze: 0.1 }],
    mid: [{ t: 'pines', y: 0.84, n: 16, h: 0.3, c: '#0a1220', snow: true, seed: 4 }], near: [{ t: 'ground', y: 0.86, c: '#aebed0', c2: '#2a3a52' }, fig(0.2, 'helm', '#1c2434', '#a8d4ff', { s: 0.34, back: true, weapon: 'banner', accent: '#3a4a6a' })], fog: [{ c: '#bcd4ee', a: 0.26, y: 0.8, h: 0.3 }], particles: { kind: 'snow', n: 70 },
  },
  pass: {
    ...base(5, 'ice', { stars: 60, aurora: ['#4af0a0', '#6aa8ff'], clouds: clouds('#6a8ab0', 0.3) }), far: [{ t: 'ridge', y: 0.62, amp: 0.2, c: '#2a3c58', haze: 0.35, seed: 3, snow: true }, { t: 'ridge', y: 0.7, amp: 0.14, c: '#1c2a42', haze: 0.2, seed: 5, snow: true }],
    mid: [{ t: 'pines', y: 0.82, n: 20, h: 0.34, c: '#0d1826', snow: true, seed: 4 }, { t: 'crowd', y: 0.86, n: 26, c: '#162036', s: 0.2, seed: 7 }], near: [{ t: 'ground', y: 0.84, c: '#aebed0', c2: '#2a3a52', seed: 7 }, { t: 'banner', x: 0.15, y: 0.5, h: 0.34, c: '#3a4a6a' }, hero(0.7, '#202838', '#ffd8a0', '#a8d4ff', 0.46, 0.97)],
    fog: [{ c: '#bcd4ee', a: 0.28, y: 0.8, h: 0.3 }], particles: { kind: 'snow', n: 70 }, lights: [{ x: 0.66, y: 0.82, r: 0.1, c: '#ffd8a0', a: 0.5 }],
  },
  barrows: { ...base(72, 'ice', { stars: 40 }), far: [{ t: 'ridge', y: 0.7, amp: 0.1, c: '#1c2a42', haze: 0.3, seed: 6, snow: true }], mid: [{ t: 'columns', y: 0.82, n: 6, h: 0.4, c: '#101a2a', style: 'broken', seed: 4 }, { t: 'banner', x: 0.5, y: 0.5, h: 0.3, c: '#3a4a6a' }], near: [{ t: 'ground', y: 0.82, c: '#8a9ab0', c2: '#1a2a40' }], fog: [{ c: '#a8c4e0', a: 0.3, y: 0.78, h: 0.3 }], particles: { kind: 'snow', n: 50 } },
  rimeglass: { ...base(73, 'ice'), far: [{ t: 'stalactites', n: 16, h: 0.5, c: '#1a2c44', seed: 3 }, { t: 'spires', y: 0.72, n: 9, h: 0.5, c: '#2a4a6a', rim: '#d8f0ff', style: 'ice', seed: 3 }], mid: [{ t: 'spires', y: 0.86, n: 6, h: 0.4, c: '#14243a', rim: '#a8d4ff', style: 'ice', seed: 8 }], near: [{ t: 'ground', y: 0.86, c: '#6a8aa8', c2: '#0a1424' }], fog: [{ c: '#a8c4e0', a: 0.26, y: 0.74, h: 0.3 }], particles: { kind: 'snow', n: 40 }, lights: [{ x: 0.5, y: 0.5, r: 0.3, c: '#a8d4ff', a: 0.2 }] },
  solenne: {
    ...base(81, 'noon', { body: { kind: 'sun', x: 0.5, y: 0.2, r: 0.07, c: '#fff4c8', corona: '#ffe08a' }, clouds: clouds('#f0d080', 0.3), glowAt: [0.5, 0.3] }), far: [{ t: 'skyline', y: 0.66, c: '#8a6a2a', style: 'noon', h: 0.42, windows: '#fff0b0', haze: 0.25, seed: 4, density: 1.1 }],
    mid: [{ t: 'skyline', y: 0.8, c: '#4a3812', style: 'noon', h: 0.34, windows: '#ffe090', seed: 9 }], near: [{ t: 'ground', y: 0.82, c: '#6a5222', c2: '#1a1204', road: true, roadC: '#c8a050' }, fig(0.3, 'mask', '#d8b860', '#fff0b0', { s: 0.4, accent: '#8a6a22' }), fig(0.7, 'veil', '#e8d8a0', '#fff0b0', { s: 0.38 })],
    fog: [{ c: '#ffe8a0', a: 0.2, y: 0.76, h: 0.3 }], particles: { kind: 'motes', n: 40 },
  },
  undercity: {
    ...base(82, 'noon', { glowAt: [0.5, 0.5] }), far: [{ t: 'skyline', y: 0.64, c: '#5a4412', style: 'noon', h: 0.4, windows: '#ffe090', haze: 0.3, seed: 5 }], mid: [{ t: 'columns', y: 0.8, n: 6, h: 0.5, c: '#3a2a0c', style: 'colonnade', seed: 3, w: 0.04 }],
    near: [{ t: 'ground', y: 0.8, c: '#6a5222', c2: '#1a1204', puddles: '#fff0b0' }], water: { y: 0.8, c1: '#c8a050', c2: '#2a1a06', reflect: 0.55 }, fog: [{ c: '#ffe8a0', a: 0.18, y: 0.74, h: 0.3 }], particles: { kind: 'motes', n: 50 },
  },
  meridian: {
    ...base(83, 'void', { body: { kind: 'void', x: 0.5, y: 0.3, r: 0.09, c: '#a860ff', corona: '#e8c0ff' }, stars: 90, clouds: clouds('#6a2a9a', 0.5) }), far: [{ t: 'spires', y: 0.7, n: 8, h: 0.55, c: '#160a26', rim: '#c890ff', style: 'rock', seed: 6 }],
    mid: [{ t: 'stairs', x: 0.5, y: 0.96, w: 0.7, steps: 14, c: '#201030' }, { t: 'throne', x: 0.5, y: 0.66, s: 0.2, c: '#0a0412', glow: '#c890ff' }], near: [hero(0.5, '#120818', '#e8c0ff', '#c890ff', 0.3, 0.98)],
    fog: [{ c: '#8a4ad0', a: 0.22, y: 0.76, h: 0.35 }], particles: { kind: 'motes', n: 50, c: '#d8a8ff' }, lightning: true,
  },
  graves: {
    ...base(91, 'dusk', { body: eclipse(0.2, 0.2, 0.05), stars: 30 }), far: [{ t: 'ridge', y: 0.7, amp: 0.1, c: '#241418', haze: 0.4, seed: 3 }], mid: [{ t: 'dead', y: 0.84, n: 4, h: 0.45, c: '#0e0808', seed: 5 }],
    near: [{ t: 'ground', y: 0.8, c: '#140e10', c2: '#040203' }, { t: 'columns', y: 0.94, n: 5, h: 0.2, c: '#1a1214', style: 'broken', seed: 7, x0: 0.2, x1: 0.8 }, hero(0.2, '#2a2220', '#ffb860', '#ff8a50', 0.3, 0.97)], fog: [{ c: '#6a4a5a', a: 0.26, y: 0.8, h: 0.3 }], particles: { kind: 'ash', n: 30 },
  },
  study: hall(92, 'night', '#14182a', '#ffd8a0', '#10121c', [{ t: 'cogs', y: 0.3, n: 2, r: 0.16, c: '#080a14', seed: 4 }], '#4a5a8a'),
  forge: { ...hall(93, 'brass', '#2a1a0c', '#ff7a30', '#140c06', [{ t: 'cogs', y: 0.5, n: 1, r: 0.2, c: '#080402', seed: 5 }], '#a0602a'), particles: { kind: 'sparks', n: 40 } },
  tavern: hall(94, 'hall', '#2a1a10', '#ffb060', '#1a100a', [fig(0.3, 'hat', '#1a1412', '#ffb060', { s: 0.3, y: 0.9, back: true }), fig(0.68, 'hood', '#1a1412', '#ffb060', { s: 0.3, y: 0.9, back: true })]),
  road: {
    ...base(95, 'dusk', { stars: 20, clouds: clouds('#8a3a2a', 0.4) }), far: [{ t: 'ridge', y: 0.6, amp: 0.12, c: '#2a1a1c', haze: 0.45, seed: 9 }], mid: [{ t: 'pines', y: 0.8, n: 12, h: 0.3, c: '#140d0e', seed: 3 }],
    near: [{ t: 'ground', y: 0.8, c: '#1a1210', c2: '#050303', road: true, roadC: '#3a2a20' }], fog: [{ c: '#a0604a', a: 0.2, y: 0.78, h: 0.3 }], particles: { kind: 'dust', n: 20 },
  },
};

const THEME_SCENE: Record<string, string> = { crypt: 'hearthcrypt', flooded: 'bellhouse', forest: 'ashwood', ember: 'hearthcrypt', bone: 'quarry', mine: 'foundry', ice: 'rimeglass', noon: 'undercity', cave: 'seacaves', ruin: 'heartland', swamp: 'hollowhill', archive: 'archive' };
const cache = new Map<string, SceneSpec>();
/** Resolve an art key: a named preset, `dg:<theme>`, or fall back to the roadside. */
export function sceneSpec(key: string): SceneSpec {
  const hit = cache.get(key);
  if (hit) return hit;
  let spec = SCENES[key];
  if (!spec && key.startsWith('dg:')) spec = SCENES[THEME_SCENE[key.slice(3)] ?? 'road'];
  if (!spec && key.startsWith('ev:')) {
    // ev:<motif>|<background scene>|<accent colour>
    const [motif, bg, accent] = key.slice(3).split('|');
    const b = SCENES[bg] ?? SCENES.road;
    spec = { ...b, seed: b.seed + motif.length * 7, near: [...(b.near ?? []).filter(l => l.t !== 'figure' && l.t !== 'crowd'), { t: 'motif', key: motif as never, accent: accent || b.sky.glow?.c || '#ffb860', dark: '#0c0808' }], lights: [...(b.lights ?? []).slice(0, 1)] };
  }
  spec ??= SCENES.road;
  cache.set(key, spec);
  return spec;
}
/** Which backdrop an event gets, by its first matching tag. */
export const EVENT_BG: Record<string, string> = { crypt: 'hearthcrypt', sea: 'bellhouse', flooded: 'bellhouse', forest: 'ashwood', fire: 'ashwood', bone: 'quarry', ice: 'pass', noon: 'solenne', swamp: 'hollowhill', mine: 'foundry', wild: 'heartland', any: 'heartland' };
export function eventArtKey(tags: string[] | undefined, motif: string, art?: string): string {
  if (art) return art;
  const bg = (tags ?? ['any']).map(t => EVENT_BG[t]).find(Boolean) ?? 'heartland';
  const glow = SCENES[bg]?.sky.glow?.c ?? '#ffb860';
  return `ev:${motif}|${bg}|${glow}`;
}
export const sceneKeys = () => Object.keys(SCENES);
export const registerScenes = (list: Record<string, SceneSpec>) => { Object.assign(SCENES, list); cache.clear() };
export { base as baseScene, hall as hallScene, hero as heroLayer, fig as figLayer, clouds as cloudLayer, eclipse as eclipseBody, PAL };
export type { Layer };
