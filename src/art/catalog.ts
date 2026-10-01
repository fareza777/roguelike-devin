import type { Layer, SceneSpec } from './scene';

type Sky = SceneSpec['sky'];
const eclipse = (x = 0.5, y = 0.3, r = 0.075, c = '#ff6a3a', corona = '#ffb060'): Sky['body'] => ({ kind: 'eclipse', x, y, r, c, corona });

/** Builds the sky + base grade for the common dark-fantasy palettes. */
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
} as const;

function base(seed: number, p: keyof typeof PAL, extra: Partial<SceneSpec> & { body?: Sky['body']; stars?: number; clouds?: Sky['clouds']; aurora?: string[]; rays?: Sky['rays'] } = {}): SceneSpec {
  const c = PAL[p];
  return {
    seed,
    sky: { top: c.top, mid: c.mid, low: c.low, glow: { x: 0.5, y: 0.5, r: 0.7, c: c.glow, a: 0.35 }, stars: extra.stars ?? 0, clouds: extra.clouds, body: extra.body ?? null, aurora: extra.aurora, rays: extra.rays },
    grade: { vignette: 0.75, grain: 0.07 },
    ...extra,
  } as SceneSpec;
}
const clouds = (c: string, a = 0.5): Sky['clouds'] => [{ c, a, y: 0.25, h: 0.5, scale: 1 }, { c: '#000000', a: a * 0.6, y: 0.4, h: 0.4, scale: 1.7 }];

export const SCENES: Record<string, SceneSpec> = {
  splash: {
    ...base(1, 'blood', { body: eclipse(0.5, 0.27, 0.085), stars: 40, clouds: clouds('#c0402a', 0.55) }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.1, c: '#2a1012', haze: 0.35, seed: 3 }, { t: 'skyline', y: 0.7, c: '#14090b', style: 'keep', h: 0.36, windows: '#ffb860', haze: 0.18, seed: 4, x0: 0.18, x1: 0.95 }],
    mid: [{ t: 'ridge', y: 0.8, amp: 0.1, c: '#140a0c', seed: 9 }, { t: 'columns', y: 0.82, n: 3, h: 0.34, c: '#1a0d0e', style: 'broken', seed: 3, x0: 0.02, x1: 0.2 }],
    near: [{ t: 'ground', y: 0.82, c: '#120a0a', c2: '#030202', road: true, puddles: '#ff7a40', roadC: '#2a1812' }, { t: 'figure', x: 0.34, y: 0.95, s: 0.5, look: 'hood', c: '#2a2220', lantern: '#ffb860', weapon: 'blade', back: true, rim: '#ff7a40' }],
    fog: [{ c: '#a05a40', a: 0.28, y: 0.74, h: 0.3, speed: 5 }, { c: '#601818', a: 0.2, y: 0.9, h: 0.25, speed: 8 }],
    particles: { kind: 'embers', n: 30 },
    lights: [{ x: 0.28, y: 0.83, r: 0.13, c: '#ffb860', a: 0.5 }],
  },
  veyrgard: {
    ...base(2, 'blood', { body: eclipse(0.22, 0.2, 0.06), stars: 30, clouds: clouds('#8a2a1c', 0.5) }),
    far: [{ t: 'ridge', y: 0.55, amp: 0.1, c: '#3a1414', haze: 0.45, seed: 5 }, { t: 'skyline', y: 0.64, c: '#1a0c0e', style: 'lamp', h: 0.4, windows: '#ffc070', haze: 0.12, seed: 6 }],
    mid: [{ t: 'skyline', y: 0.78, c: '#0f0708', style: 'town', h: 0.34, windows: '#ff9a50', seed: 8 }, { t: 'tower', x: 0.82, y: 0.78, w: 0.05, h: 0.4, c: '#120a0b', lit: '#ffb060', roof: 'lamp' }],
    near: [{ t: 'ground', y: 0.8, c: '#140b0c', c2: '#050303', road: true, roadC: '#3a2018', puddles: '#ff8a50' }, { t: 'banner', x: 0.1, y: 0.52, h: 0.3, c: '#7a1c1c' }, { t: 'figure', x: 0.62, y: 0.96, s: 0.42, look: 'helm', c: '#2c2826', weapon: 'banner', back: true, rim: '#ff8a50', accent: '#7a1c1c' }],
    fog: [{ c: '#a03a28', a: 0.22, y: 0.72, h: 0.3 }], particles: { kind: 'ash', n: 40 },
    lights: [{ x: 0.8, y: 0.34, r: 0.12, c: '#ffb060', a: 0.45 }],
  },
  bellhouse: {
    ...base(3, 'sea', { stars: 0 }),
    far: [{ t: 'columns', y: 0.6, n: 9, h: 0.5, c: '#10282a', style: 'arch', haze: 0.35, seed: 3, w: 0.03 }],
    mid: [{ t: 'columns', y: 0.78, n: 5, h: 0.62, c: '#0a1a1c', style: 'arch', w: 0.05, seed: 8, x0: 0.05, x1: 0.95 }, { t: 'hang', n: 6, c: '#0a1416', glow: '#ffb860', seed: 4 }],
    near: [{ t: 'columns', y: 1, n: 2, h: 0.95, c: '#050c0e', w: 0.1, seed: 2, x0: 0.04, x1: 0.96, style: 'colonnade' }],
    water: { y: 0.72, c1: '#1c5a5c', c2: '#041014', reflect: 0.45 }, fog: [{ c: '#4a9a90', a: 0.3, y: 0.7, h: 0.3 }], particles: { kind: 'drips', n: 24 },
    lights: [{ x: 0.3, y: 0.3, r: 0.14, c: '#ffb860', a: 0.35 }, { x: 0.72, y: 0.34, r: 0.12, c: '#7aeed0', a: 0.3 }],
  },
  ashwood: {
    ...base(4, 'ash', { body: eclipse(0.7, 0.22, 0.06), clouds: clouds('#b44a22', 0.55), stars: 14 }),
    far: [{ t: 'ridge', y: 0.6, amp: 0.1, c: '#3a1a10', haze: 0.4, seed: 2 }, { t: 'dead', y: 0.66, n: 22, h: 0.4, c: '#2a120a', haze: 0.3, seed: 2, glow: '#ff8a40' }],
    mid: [{ t: 'dead', y: 0.82, n: 12, h: 0.7, c: '#140806', seed: 3, glow: '#ff6a2a' }],
    near: [{ t: 'ground', y: 0.82, c: '#1a0e08', c2: '#050202', seed: 4 }, { t: 'dead', y: 1.0, n: 3, h: 0.95, c: '#050303', seed: 5 }],
    fog: [{ c: '#a04a28', a: 0.25, y: 0.76, h: 0.3 }], particles: { kind: 'embers', n: 50 },
    lights: [{ x: 0.5, y: 0.86, r: 0.2, c: '#ff7a30', a: 0.3 }],
  },
  pass: {
    ...base(5, 'ice', { stars: 60, aurora: ['#4af0a0', '#6aa8ff'], clouds: clouds('#6a8ab0', 0.3) }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.2, c: '#2a3c58', haze: 0.35, seed: 3, snow: true }, { t: 'ridge', y: 0.7, amp: 0.14, c: '#1c2a42', haze: 0.2, seed: 5, snow: true }],
    mid: [{ t: 'pines', y: 0.82, n: 20, h: 0.34, c: '#0d1826', snow: true, seed: 4 }, { t: 'crowd', y: 0.86, n: 26, c: '#162036', s: 0.2, seed: 7 }],
    near: [{ t: 'ground', y: 0.84, c: '#aebed0', c2: '#2a3a52', seed: 7 }, { t: 'banner', x: 0.15, y: 0.5, h: 0.34, c: '#3a4a6a' }, { t: 'figure', x: 0.7, y: 0.97, s: 0.46, look: 'cowl', c: '#202838', lantern: '#ffd8a0', back: true, rim: '#a8d4ff' }],
    fog: [{ c: '#bcd4ee', a: 0.28, y: 0.8, h: 0.3 }], particles: { kind: 'snow', n: 70 },
    lights: [{ x: 0.66, y: 0.82, r: 0.1, c: '#ffd8a0', a: 0.5 }],
  },
};

export type { Layer };
