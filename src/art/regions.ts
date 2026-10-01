import { SCENES, baseScene, cloudLayer, figLayer, hallScene, heroLayer, registerScenes } from './catalog';
import type { SceneSpec } from './scene';

type Dict = Record<string, SceneSpec>;
const lamp = (x: number, y: number, r: number, c: string, a = 0.4) => ({ x, y, r, c, a });

/** Part II region backdrops. Registered on import. */
const GLASS: Dict = {
  glasswastes: {
    ...baseScene(101, 'glass', { body: { kind: 'sun', x: 0.5, y: 0.3, r: 0.06, c: '#2a1208', corona: '#ffd890' }, clouds: cloudLayer('#e8a060', 0.35), glowAt: [0.5, 0.35] }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.06, c: '#6a3a2a', haze: 0.5, seed: 4 }, { t: 'spires', y: 0.7, n: 8, h: 0.34, c: '#4a2a34', rim: '#ffd8a0', style: 'glass', seed: 3, haze: 0.25 }],
    mid: [{ t: 'dunes', y: 0.76, amp: 0.08, c: '#5a3422', haze: 0.12, seed: 2 }, { t: 'spires', y: 0.84, n: 5, h: 0.26, c: '#2a1620', rim: '#ffe0b0', style: 'glass', seed: 9 }],
    near: [{ t: 'ground', y: 0.86, c: '#3a2216', c2: '#140a08', road: true, roadC: '#6a4a2a' }, heroLayer(0.36, '#241812', '#ffd8a0', '#ffc880', 0.34, 0.95)],
    fog: [{ c: '#e8a060', a: 0.18, y: 0.78, h: 0.3 }], particles: { kind: 'dust', n: 36 }, lights: [lamp(0.5, 0.32, 0.4, '#ffd890', 0.3)],
  },
  brasshaven: {
    ...baseScene(102, 'brass', { stars: 20, body: { kind: 'sun', x: 0.75, y: 0.26, r: 0.05, c: '#2a1208', corona: '#ffc070' }, clouds: cloudLayer('#c07a30', 0.3) }),
    far: [{ t: 'ridge', y: 0.6, amp: 0.05, c: '#3a2210', haze: 0.45, seed: 7 }, { t: 'skyline', y: 0.7, c: '#2a1a0e', style: 'glass', h: 0.38, windows: '#ffd890', haze: 0.2, seed: 5 }],
    mid: [{ t: 'skyline', y: 0.82, c: '#180e08', style: 'town', h: 0.28, windows: '#ffb860', seed: 9, density: 1.1 }, { t: 'tower', x: 0.3, y: 0.82, w: 0.06, h: 0.44, c: '#1a0f08', lit: '#ffd890', roof: 'lamp' }],
    near: [{ t: 'ground', y: 0.84, c: '#2a1a0e', c2: '#0a0604', road: true, roadC: '#5a3a1e' }, figLayer(0.68, 'veil', '#2a2018', '#ffc880', { s: 0.34, y: 0.97, back: true })],
    fog: [{ c: '#d09040', a: 0.16, y: 0.8, h: 0.3 }], particles: { kind: 'dust', n: 28 }, lights: [lamp(0.3, 0.5, 0.2, '#ffd890', 0.4)],
  },
  shardrest: {
    ...baseScene(103, 'glass', { stars: 50, body: { kind: 'moon', x: 0.2, y: 0.22, r: 0.04, c: '#f0e0c8', corona: '#e8c080' } }),
    far: [{ t: 'dunes', y: 0.7, amp: 0.07, c: '#3a2218', haze: 0.35, seed: 6 }],
    mid: [{ t: 'spires', y: 0.82, n: 7, h: 0.2, c: '#2a161e', rim: '#ffd8a0', style: 'glass', seed: 4 }, { t: 'tower', x: 0.66, y: 0.82, w: 0.12, h: 0.2, c: '#1a0f0a', roof: 'cone', lit: '#ffb860' }],
    near: [{ t: 'ground', y: 0.86, c: '#2a1a12', c2: '#0a0604' }, figLayer(0.3, 'veil', '#241a12', '#ffc880', { s: 0.3, y: 0.96, back: true })],
    fog: [{ c: '#c88a50', a: 0.14, y: 0.8, h: 0.25 }], particles: { kind: 'embers', n: 16, c: '#ffb860' }, lights: [lamp(0.66, 0.74, 0.12, '#ffb860', 0.5)],
  },
  kilnhold: {
    ...baseScene(104, 'ash', { stars: 12 }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.08, c: '#2a1612', haze: 0.4, seed: 8 }],
    mid: [{ t: 'tower', x: 0.25, y: 0.84, w: 0.1, h: 0.4, c: '#140a08', lit: '#ff8a40', roof: 'flat' }, { t: 'tower', x: 0.5, y: 0.84, w: 0.1, h: 0.5, c: '#100806', lit: '#ff9a50', roof: 'flat' }, { t: 'tower', x: 0.76, y: 0.84, w: 0.1, h: 0.36, c: '#140a08', lit: '#ff8a40', roof: 'flat' }],
    near: [{ t: 'ground', y: 0.86, c: '#1c100a', c2: '#060302' }, figLayer(0.5, 'mask', '#201410', '#ff9a50', { s: 0.36, y: 0.97, back: false })],
    fog: [{ c: '#a04a20', a: 0.25, y: 0.76, h: 0.3 }], particles: { kind: 'sparks', n: 40 }, lights: [lamp(0.25, 0.7, 0.14, '#ff8a40', 0.5), lamp(0.5, 0.66, 0.16, '#ff9a50', 0.5), lamp(0.76, 0.72, 0.14, '#ff8a40', 0.5)],
  },
  orangery: {
    ...hallScene(105, 'glass', '#3a2430', '#ffd890', '#241420', [{ t: 'shrooms', y: 0.88, n: 8, h: 0.22, c: '#4a2a3a', glow: '#ffd890', seed: 4 }], '#d8a070'),
    particles: { kind: 'motes', n: 34, c: '#ffe8b0' },
  },
  cistern: {
    ...baseScene(106, 'deep', { stars: 0 }),
    far: [{ t: 'columns', y: 0.64, n: 8, h: 0.5, c: '#10242a', style: 'arch', haze: 0.35, seed: 5, w: 0.03 }],
    mid: [{ t: 'columns', y: 0.8, n: 4, h: 0.66, c: '#0a1a1e', style: 'arch', w: 0.05, seed: 9, x0: 0.1, x1: 0.9 }],
    near: [{ t: 'pillars', n: 3, c: '#04080a', w: 0.06, seed: 4 }],
    water: { y: 0.74, c1: '#2a7a88', c2: '#041218', reflect: 0.6 }, fog: [{ c: '#5ac0c8', a: 0.2, y: 0.72, h: 0.3 }], particles: { kind: 'drips', n: 22 }, lights: [lamp(0.5, 0.3, 0.22, '#9ae8f0', 0.3)],
  },
  prismpalace: {
    ...hallScene(107, 'glass', '#4a2a3a', '#fff0c8', '#2a1620', [{ t: 'throne', x: 0.5, y: 0.8, s: 0.2, c: '#120a0e', glow: '#ffe0a8' }, figLayer(0.5, 'mask', '#d8d0d8', '#fff0c8', { s: 0.26, y: 0.79, accent: '#2a2028' })], '#e8b890'),
    particles: { kind: 'motes', n: 40, c: '#fff0d0' },
  },
};

const THORN: Dict = {
  thornwick: {
    ...baseScene(111, 'moss', { stars: 10, clouds: cloudLayer('#3a6a40', 0.35) }),
    far: [{ t: 'ridge', y: 0.6, amp: 0.08, c: '#0e2414', haze: 0.45, seed: 5 }, { t: 'thorns', y: 0.78, n: 14, h: 0.34, c: '#0a1a0c', seed: 3 }],
    mid: [{ t: 'thorns', y: 0.86, n: 9, h: 0.48, c: '#07110a', seed: 8 }, { t: 'pines', y: 0.84, n: 10, h: 0.3, c: '#0a1a0e', seed: 4 }],
    near: [{ t: 'ground', y: 0.86, c: '#10200f', c2: '#030803', road: true, roadC: '#2a4a24' }, heroLayer(0.4, '#1a2a18', '#d8f8a0', '#b8e880', 0.34, 0.95)],
    fog: [{ c: '#6ac060', a: 0.2, y: 0.78, h: 0.3 }], particles: { kind: 'spores', n: 36, c: '#d8ffa0' }, lights: [lamp(0.4, 0.8, 0.12, '#d8f8a0', 0.4)],
  },
  mirewick: {
    ...baseScene(112, 'moss', { stars: 20, body: { kind: 'moon', x: 0.75, y: 0.2, r: 0.04, c: '#d8ffd0', corona: '#8ee070' } }),
    far: [{ t: 'thorns', y: 0.7, n: 18, h: 0.5, c: '#0a1c0e', seed: 4, }],
    mid: [{ t: 'skyline', y: 0.82, c: '#0a1a0c', style: 'stilt', h: 0.3, windows: '#d8f8a0', seed: 6, density: 1.2 }, { t: 'tower', x: 0.62, y: 0.82, w: 0.07, h: 0.4, c: '#0a160a', lit: '#d8f8a0', roof: 'cone' }],
    near: [{ t: 'ground', y: 0.86, c: '#122410', c2: '#030803', road: true, roadC: '#2a4a24' }, figLayer(0.3, 'hood', '#1a2a18', '#d8f8a0', { s: 0.34, y: 0.97, back: true, weapon: 'staff' })],
    fog: [{ c: '#5ab850', a: 0.2, y: 0.78, h: 0.3 }], particles: { kind: 'spores', n: 30, c: '#d8ffa0' }, lights: [lamp(0.62, 0.62, 0.16, '#d8f8a0', 0.4)],
  },
  lowmire: {
    ...baseScene(113, 'moss', { stars: 30 }),
    far: [{ t: 'ridge', y: 0.66, amp: 0.05, c: '#0a1c10', haze: 0.4, seed: 9 }],
    mid: [{ t: 'skyline', y: 0.78, c: '#07120a', style: 'stilt', h: 0.22, windows: '#8ae890', seed: 7, density: 1.3 }],
    near: [{ t: 'kelp', y: 1, n: 7, h: 0.26, c: '#050f08', seed: 5 }], water: { y: 0.78, c1: '#1a4a30', c2: '#030a06', reflect: 0.5 },
    fog: [{ c: '#5ac080', a: 0.22, y: 0.76, h: 0.3 }], particles: { kind: 'spores', n: 40, c: '#8ae890' }, lights: [lamp(0.5, 0.72, 0.14, '#8ae890', 0.5)],
  },
  conservatory: {
    ...hallScene(114, 'moss', '#142a16', '#d8f8a0', '#0c1a0c', [{ t: 'thorns', y: 0.9, n: 9, h: 0.3, c: '#07110a', seed: 6 }], '#6ac060'),
    particles: { kind: 'spores', n: 36, c: '#d8ffa0' },
  },
  heartbriar: {
    ...baseScene(115, 'moss', { stars: 0 }),
    far: [{ t: 'thorns', y: 0.7, n: 20, h: 0.6, c: '#0c2010', seed: 2 }, { t: 'columns', y: 0.7, n: 6, h: 0.6, c: '#08160a', style: 'broken', seed: 4 }],
    mid: [{ t: 'thorns', y: 0.84, n: 12, h: 0.7, c: '#060f08', seed: 9 }, { t: 'throne', x: 0.5, y: 0.82, s: 0.22, c: '#0a1a0c', glow: '#d8f8a0' }],
    near: [{ t: 'ground', y: 0.86, c: '#0e1c0e', c2: '#020602' }, figLayer(0.5, 'cowl', '#2a3a20', '#d8f8a0', { s: 0.26, y: 0.82, back: false })],
    fog: [{ c: '#4aa840', a: 0.25, y: 0.7, h: 0.4 }], particles: { kind: 'spores', n: 50, c: '#d8ffa0' }, lights: [lamp(0.5, 0.5, 0.3, '#d8f8a0', 0.3)],
  },
};

const TIDE: Dict = {
  tidewatch: {
    ...baseScene(121, 'sea', { stars: 40, body: { kind: 'moon', x: 0.3, y: 0.2, r: 0.045, c: '#e0f4f8', corona: '#ff9a70' }, clouds: cloudLayer('#2a6a70', 0.35) }),
    far: [{ t: 'skyline', y: 0.64, c: '#0a2228', style: 'stilt', h: 0.34, windows: '#ffb890', haze: 0.2, seed: 5, density: 1.3 }, { t: 'ship', x: 0.78, y: 0.66, s: 0.22, c: '#07151a', ghost: true }],
    mid: [{ t: 'skyline', y: 0.76, c: '#061218', style: 'harbor', h: 0.22, windows: '#ffa070', seed: 8 }, { t: 'tower', x: 0.22, y: 0.76, w: 0.06, h: 0.42, c: '#051014', lit: '#ffd8b0', roof: 'lamp' }],
    near: [{ t: 'pillars', n: 3, c: '#03090c', w: 0.03, seed: 2 }, figLayer(0.68, 'hat', '#1a1c1e', '#ff9a70', { s: 0.34, y: 0.98, back: true })],
    water: { y: 0.76, c1: '#1a5a60', c2: '#031014', reflect: 0.55 }, fog: [{ c: '#4aa0a0', a: 0.22, y: 0.74, h: 0.3 }], particles: { kind: 'drips', n: 20 }, lights: [lamp(0.22, 0.34, 0.18, '#ffd8b0', 0.5)],
  },
  gullrest: {
    ...baseScene(122, 'sea', { stars: 50, clouds: cloudLayer('#3a7a80', 0.4) }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.1, c: '#0c2228', haze: 0.45, seed: 6 }],
    mid: [{ t: 'skyline', y: 0.8, c: '#07141a', style: 'stilt', h: 0.2, windows: '#ffc880', seed: 4, density: 1.1 }],
    near: [{ t: 'ground', y: 0.88, c: '#1a2a2a', c2: '#050c0c' }, figLayer(0.35, 'hood', '#1a2022', '#78d8e8', { s: 0.3, y: 0.97, back: true })],
    water: { y: 0.8, c1: '#206870', c2: '#031014', reflect: 0.4 }, fog: [{ c: '#78d8e8', a: 0.18, y: 0.74, h: 0.3 }], particles: { kind: 'rain', n: 36 },
  },
  lanternatoll: {
    ...baseScene(123, 'sea', { stars: 70, body: { kind: 'moon', x: 0.7, y: 0.18, r: 0.04, c: '#f0f8f8', corona: '#ffb880' } }),
    far: [{ t: 'ridge', y: 0.7, amp: 0.03, c: '#081a20', haze: 0.4, seed: 3 }],
    mid: [{ t: 'tower', x: 0.5, y: 0.8, w: 0.08, h: 0.52, c: '#05121a', lit: '#ffd8a0', roof: 'lamp' }],
    near: [{ t: 'ground', y: 0.88, c: '#162428', c2: '#040a0c' }],
    water: { y: 0.8, c1: '#1c5a62', c2: '#031014', reflect: 0.6 }, fog: [{ c: '#4aa0a0', a: 0.15, y: 0.78, h: 0.25 }], particles: { kind: 'motes', n: 24, c: '#ffd8a0' }, lights: [lamp(0.5, 0.3, 0.3, '#ffd8a0', 0.45)],
  },
  reefgrottos: {
    ...baseScene(124, 'deep', { stars: 0 }),
    far: [{ t: 'stalactites', n: 16, h: 0.42, c: '#0a2428', seed: 3 }, { t: 'spires', y: 0.72, n: 9, h: 0.36, c: '#1a3a40', rim: '#ff9a7a', style: 'rock', seed: 6 }],
    mid: [{ t: 'kelp', y: 0.86, n: 11, h: 0.34, c: '#07191c', seed: 2 }, { t: 'shrooms', y: 0.88, n: 8, h: 0.2, c: '#2a1a1a', glow: '#ff9a7a', seed: 4 }],
    near: [{ t: 'stalactites', n: 6, h: 0.5, c: '#030c0e', seed: 8 }], water: { y: 0.74, c1: '#1a6a6a', c2: '#031014', reflect: 0.5 },
    fog: [{ c: '#40a0a0', a: 0.2, y: 0.72, h: 0.3 }], particles: { kind: 'drips', n: 24 }, lights: [lamp(0.3, 0.5, 0.2, '#ff9a7a', 0.4), lamp(0.7, 0.55, 0.18, '#7aeed0', 0.3)],
  },
  armada: {
    ...baseScene(125, 'deep', { stars: 20 }),
    far: [{ t: 'ship', x: 0.3, y: 0.7, s: 0.34, c: '#0a2228', ghost: true }, { t: 'ship', x: 0.72, y: 0.72, s: 0.28, c: '#08181e', ghost: true }],
    mid: [{ t: 'ship', x: 0.5, y: 0.82, s: 0.4, c: '#05101a' }, { t: 'kelp', y: 0.9, n: 8, h: 0.4, c: '#06161a', seed: 3 }],
    near: [{ t: 'ground', y: 0.9, c: '#0a1a1e', c2: '#020608' }], water: { y: 0.5, c1: '#1a5a60', c2: '#02080c', reflect: 0.3 },
    fog: [{ c: '#3a8a90', a: 0.28, y: 0.6, h: 0.5 }], particles: { kind: 'motes', n: 30, c: '#9ae8f0' }, lights: [lamp(0.5, 0.4, 0.3, '#7aeed0', 0.3)],
  },
  unsinking: {
    ...baseScene(126, 'night', { stars: 70, body: { kind: 'moon', x: 0.2, y: 0.2, r: 0.05, c: '#e8f0f8', corona: '#8a90c0' }, clouds: cloudLayer('#2a3a5a', 0.4) }),
    far: [{ t: 'ship', x: 0.6, y: 0.7, s: 0.5, c: '#060a14', ghost: true }],
    mid: [{ t: 'ship', x: 0.5, y: 0.84, s: 0.6, c: '#03060c' }],
    near: [{ t: 'ground', y: 0.92, c: '#0a1218', c2: '#020406' }], water: { y: 0.8, c1: '#1a3a50', c2: '#02060a', reflect: 0.55 },
    fog: [{ c: '#4a6a9a', a: 0.22, y: 0.72, h: 0.3 }], particles: { kind: 'rain', n: 44 }, lights: [lamp(0.5, 0.5, 0.25, '#8aa0e0', 0.25)], lightning: true,
  },
};

const GEAR: Dict = {
  orrery: {
    ...baseScene(131, 'brass', { stars: 30, body: { kind: 'orb', x: 0.5, y: 0.26, r: 0.05, c: '#ffd890', corona: '#ffb44a' } }),
    far: [{ t: 'cogs', y: 0.42, n: 4, r: 0.22, c: '#241608', seed: 3 }, { t: 'ridge', y: 0.7, amp: 0.05, c: '#2a1a0c', haze: 0.4, seed: 4 }],
    mid: [{ t: 'cogs', y: 0.68, n: 3, r: 0.18, c: '#180e06', seed: 6 }, { t: 'skyline', y: 0.84, c: '#120a05', style: 'cog', h: 0.32, windows: '#ffb44a', seed: 9 }],
    near: [{ t: 'ground', y: 0.88, c: '#1c1208', c2: '#050302', road: true, roadC: '#5a3a1a' }, heroLayer(0.4, '#241a10', '#ffd890', '#ffc060', 0.34, 0.96)],
    fog: [{ c: '#a06a20', a: 0.2, y: 0.78, h: 0.3 }], particles: { kind: 'sparks', n: 26, c: '#ffc060' }, lights: [lamp(0.5, 0.26, 0.4, '#ffb44a', 0.3)],
  },
  cogspire: {
    ...baseScene(132, 'brass', { stars: 20 }),
    far: [{ t: 'cogs', y: 0.44, n: 5, r: 0.2, c: '#2a1a0a', seed: 2 }, { t: 'skyline', y: 0.68, c: '#1c1208', style: 'cog', h: 0.42, windows: '#ffd890', haze: 0.2, seed: 5 }],
    mid: [{ t: 'tower', x: 0.7, y: 0.84, w: 0.08, h: 0.6, c: '#120a05', lit: '#ffd890', roof: 'lamp' }, { t: 'cogs', y: 0.86, n: 2, r: 0.14, c: '#0c0704', seed: 7 }],
    near: [{ t: 'ground', y: 0.88, c: '#1e1409', c2: '#050302', road: true, roadC: '#5a3a1a' }, figLayer(0.3, 'mask', '#201810', '#ffc060', { s: 0.34, y: 0.97, back: true })],
    fog: [{ c: '#c08a30', a: 0.18, y: 0.8, h: 0.3 }], particles: { kind: 'sparks', n: 22, c: '#ffc060' }, lights: [lamp(0.7, 0.3, 0.2, '#ffd890', 0.4)],
  },
  escapement: {
    ...baseScene(133, 'brass', { stars: 10 }),
    far: [{ t: 'cogs', y: 0.5, n: 3, r: 0.3, c: '#241608', seed: 4 }],
    mid: [{ t: 'skyline', y: 0.82, c: '#140a05', style: 'town', h: 0.26, windows: '#ffc060', seed: 6 }],
    near: [{ t: 'ground', y: 0.88, c: '#1a1008', c2: '#050302' }, figLayer(0.66, 'hat', '#201810', '#ffc060', { s: 0.32, y: 0.98, back: true })],
    fog: [{ c: '#a0702a', a: 0.15, y: 0.8, h: 0.25 }], particles: { kind: 'sparks', n: 18, c: '#ffc060' }, lights: [lamp(0.5, 0.74, 0.14, '#ffc060', 0.5)],
  },
  hourengine: {
    ...hallScene(134, 'brass', '#2a1a0c', '#ffc060', '#140c06', [{ t: 'cogs', y: 0.4, n: 3, r: 0.24, c: '#080402', seed: 5 }, figLayer(0.5, 'mask', '#6a5028', '#ffd890', { s: 0.26, y: 0.8 })], '#a0702a'),
    particles: { kind: 'sparks', n: 40, c: '#ffc060' },
  },
};

const FROST: Dict = {
  aurora: {
    ...baseScene(141, 'ice', { stars: 90, aurora: ['#4affc0', '#a07aff', '#5ad0ff'], clouds: cloudLayer('#2a4a6a', 0.3) }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.1, c: '#1a2a44', haze: 0.4, seed: 5, snow: true }, { t: 'spires', y: 0.74, n: 6, h: 0.34, c: '#1a2e48', rim: '#a8d4ff', style: 'ice', seed: 3 }],
    mid: [{ t: 'ridge', y: 0.84, amp: 0.05, c: '#0e1a2c', seed: 4, snow: true }, { t: 'pines', y: 0.86, n: 12, h: 0.26, c: '#081018', seed: 6, snow: true }],
    near: [{ t: 'ground', y: 0.88, c: '#7a9ab0', c2: '#142238' }, heroLayer(0.36, '#d8e4f0', '#a8ffe0', '#80ffd0', 0.34, 0.96)],
    fog: [{ c: '#a8d4ff', a: 0.2, y: 0.78, h: 0.3 }], particles: { kind: 'snow', n: 60 }, lights: [lamp(0.36, 0.84, 0.12, '#a8ffe0', 0.4)],
  },
  skerrig: {
    ...baseScene(142, 'ice', { stars: 70, aurora: ['#4affc0', '#a07aff'] }),
    far: [{ t: 'ridge', y: 0.58, amp: 0.12, c: '#1a2a44', haze: 0.4, seed: 3, snow: true }, { t: 'skyline', y: 0.72, c: '#101c30', style: 'harbor', h: 0.3, windows: '#a8ffe0', haze: 0.2, seed: 5 }],
    mid: [{ t: 'skyline', y: 0.84, c: '#0a1220', style: 'ice', h: 0.22, windows: '#d8fff0', seed: 7 }, { t: 'ship', x: 0.28, y: 0.84, s: 0.16, c: '#06101a' }],
    near: [{ t: 'ground', y: 0.88, c: '#6a8aa4', c2: '#10202e' }, figLayer(0.68, 'hood', '#d8e4f0', '#a8ffe0', { s: 0.34, y: 0.98, back: true, lantern: '#a8ffe0' })],
    fog: [{ c: '#a8d4ff', a: 0.18, y: 0.78, h: 0.3 }], particles: { kind: 'snow', n: 50 }, lights: [lamp(0.7, 0.8, 0.12, '#a8ffe0', 0.45)],
  },
  rimewatch: {
    ...baseScene(143, 'ice', { stars: 60, aurora: ['#a07aff', '#4affc0'] }),
    far: [{ t: 'ridge', y: 0.62, amp: 0.1, c: '#1a2a40', haze: 0.4, seed: 8, snow: true }],
    mid: [{ t: 'skyline', y: 0.84, c: '#0c1626', style: 'town', h: 0.24, windows: '#e0fff8', seed: 4 }, { t: 'banner', x: 0.3, y: 0.55, h: 0.28, c: '#4affc0' }, { t: 'banner', x: 0.7, y: 0.56, h: 0.26, c: '#a07aff' }],
    near: [{ t: 'ground', y: 0.88, c: '#7a9ab4', c2: '#10202e' }, figLayer(0.5, 'veil', '#e0e8f0', '#e0fff8', { s: 0.34, y: 0.98 })],
    fog: [{ c: '#b8d8ff', a: 0.16, y: 0.78, h: 0.3 }], particles: { kind: 'snow', n: 40 },
  },
  whalefall: {
    ...baseScene(144, 'ice', { stars: 80, aurora: ['#4affc0'] }),
    far: [{ t: 'ribs', y: 0.82, n: 9, h: 0.5, c: '#a0b8c8', haze: 0.35, seed: 3 }],
    mid: [{ t: 'ridge', y: 0.84, amp: 0.05, c: '#0e1a2c', seed: 4, snow: true }, { t: 'ship', x: 0.7, y: 0.84, s: 0.2, c: '#08121e' }],
    near: [{ t: 'ground', y: 0.88, c: '#7a9ab4', c2: '#10202e' }, figLayer(0.3, 'hood', '#2a3844', '#80f0e0', { s: 0.34, y: 0.98, back: true, weapon: 'staff' })],
    fog: [{ c: '#b8d8ff', a: 0.16, y: 0.8, h: 0.25 }], particles: { kind: 'snow', n: 44 },
  },
  glasskeep: {
    ...hallScene(145, 'ice', '#2a4a68', '#d8f8ff', '#14263a', [{ t: 'throne', x: 0.5, y: 0.8, s: 0.2, c: '#0c1a28', glow: '#a8ffe0' }, figLayer(0.5, 'crown', '#e0f0ff', '#d8f8ff', { s: 0.26, y: 0.79 })], '#a8d4ff'),
    particles: { kind: 'snow', n: 40 },
  },
};

const DEEP: Dict = {
  underdeep: {
    ...baseScene(151, 'deep', { stars: 0 }),
    far: [{ t: 'stalactites', n: 20, h: 0.5, c: '#06161a', seed: 3 }, { t: 'shrooms', y: 0.78, n: 12, h: 0.36, c: '#0a1e24', glow: '#5af0d0', seed: 5 }],
    mid: [{ t: 'shrooms', y: 0.86, n: 8, h: 0.3, c: '#07181c', glow: '#80f0ff', seed: 8 }, { t: 'columns', y: 0.86, n: 4, h: 0.5, c: '#07181c', style: 'broken', seed: 3 }],
    near: [{ t: 'ground', y: 0.88, c: '#0e2026', c2: '#020a0c' }, heroLayer(0.4, '#1a2a30', '#a0ffe8', '#5af0d0', 0.34, 0.96), { t: 'stalactites', n: 5, h: 0.4, c: '#020808', seed: 9 }],
    fog: [{ c: '#40d0b0', a: 0.18, y: 0.76, h: 0.3 }], particles: { kind: 'spores', n: 44, c: '#a0ffe8' }, lights: [lamp(0.4, 0.8, 0.14, '#5af0d0', 0.45)],
  },
  lumenhollow: {
    ...baseScene(152, 'deep', { stars: 0 }),
    far: [{ t: 'skyline', y: 0.7, c: '#0a1e24', style: 'town', h: 0.4, windows: '#80f0ff', haze: 0.2, seed: 4, density: 1.3 }, { t: 'shrooms', y: 0.72, n: 14, h: 0.3, c: '#0a1e24', glow: '#5af0d0', seed: 6 }],
    mid: [{ t: 'skyline', y: 0.84, c: '#07161a', style: 'town', h: 0.26, windows: '#a0ffe8', seed: 8 }, { t: 'tower', x: 0.74, y: 0.84, w: 0.06, h: 0.44, c: '#05121a', lit: '#80f0ff', roof: 'lamp' }],
    near: [{ t: 'ground', y: 0.88, c: '#102226', c2: '#030a0c', road: true, roadC: '#1e4a50' }, figLayer(0.3, 'veil', '#1a2a30', '#a0ffe8', { s: 0.34, y: 0.98, back: true, lantern: '#80f0ff' })],
    fog: [{ c: '#40d0b0', a: 0.16, y: 0.78, h: 0.3 }], particles: { kind: 'spores', n: 36, c: '#a0ffe8' }, lights: [lamp(0.74, 0.3, 0.2, '#80f0ff', 0.4)],
  },
  inkwell: {
    ...baseScene(153, 'deep', { stars: 0 }),
    far: [{ t: 'stalactites', n: 14, h: 0.4, c: '#04101a', seed: 5 }],
    mid: [{ t: 'skyline', y: 0.84, c: '#05121a', style: 'town', h: 0.22, windows: '#80f0ff', seed: 3 }],
    near: [{ t: 'ground', y: 0.88, c: '#0a181e', c2: '#020608', puddles: '#04080c' }, figLayer(0.68, 'veil', '#14202a', '#80f0ff', { s: 0.32, y: 0.98, back: false })],
    water: { y: 0.82, c1: '#0a1c24', c2: '#010406', reflect: 0.4 }, fog: [{ c: '#3ac0d0', a: 0.14, y: 0.78, h: 0.25 }], particles: { kind: 'motes', n: 30, c: '#80f0ff' },
  },
  gloamstep: {
    ...baseScene(154, 'deep', { stars: 0 }),
    far: [{ t: 'stalactites', n: 16, h: 0.46, c: '#04141a', seed: 4 }],
    mid: [{ t: 'stairs', x: 0.5, y: 0.84, w: 0.5, steps: 14, c: '#08181e' }],
    near: [{ t: 'ground', y: 0.9, c: '#0c1c22', c2: '#020a0c' }, figLayer(0.3, 'hood', '#1a2a30', '#a0ffe8', { s: 0.34, y: 0.98, back: true, lantern: '#ffd8a0' })],
    fog: [{ c: '#3ac0b0', a: 0.16, y: 0.78, h: 0.3 }], particles: { kind: 'spores', n: 30, c: '#a0ffe8' }, lights: [lamp(0.3, 0.8, 0.12, '#ffd8a0', 0.45)],
  },
  finalindex: {
    ...baseScene(155, 'deep', { stars: 0 }),
    far: [{ t: 'columns', y: 0.62, n: 10, h: 0.7, c: '#08202a', style: 'colonnade', haze: 0.35, seed: 4, w: 0.04 }],
    mid: [{ t: 'columns', y: 0.82, n: 6, h: 0.82, c: '#04141a', style: 'colonnade', w: 0.05, seed: 8, x0: 0.05, x1: 0.95 }, { t: 'hang', n: 8, c: '#04141a', glow: '#80f0ff', seed: 6 }],
    near: [{ t: 'ground', y: 0.86, c: '#0a1a20', c2: '#020608', road: true, roadC: '#18404a' }, { t: 'throne', x: 0.5, y: 0.84, s: 0.2, c: '#060e12', glow: '#80f0ff' }, figLayer(0.5, 'veil', '#1a2630', '#a0ffe8', { s: 0.26, y: 0.82 })],
    fog: [{ c: '#40d0e0', a: 0.18, y: 0.78, h: 0.3 }], particles: { kind: 'motes', n: 40, c: '#a0ffe8' }, lights: [lamp(0.5, 0.4, 0.3, '#80f0ff', 0.3)],
  },
};

const NOON: Dict = {
  mirrorcourt: {
    ...hallScene(161, 'glass', '#4a3a1a', '#fff0c0', '#2a2010', [{ t: 'throne', x: 0.5, y: 0.8, s: 0.2, c: '#120e06', glow: '#fff0c0' }, figLayer(0.3, 'mask', '#d8c890', '#fff0c0', { s: 0.28, y: 0.8 }), figLayer(0.7, 'mask', '#d8c890', '#fff0c0', { s: 0.28, y: 0.8, flip: true })], '#e8c870'),
    particles: { kind: 'motes', n: 40, c: '#fff0c0' },
  },
  gildedgardens: {
    ...baseScene(162, 'noon', { body: { kind: 'sun', x: 0.5, y: 0.3, r: 0.06, c: '#1a1004', corona: '#ffe08a' }, clouds: cloudLayer('#e8c060', 0.4) }),
    far: [{ t: 'ridge', y: 0.64, amp: 0.05, c: '#6a4c16', haze: 0.5, seed: 4 }, { t: 'skyline', y: 0.72, c: '#4a3410', style: 'noon', h: 0.3, windows: '#fff0c0', haze: 0.3, seed: 6 }],
    mid: [{ t: 'pines', y: 0.84, n: 12, h: 0.3, c: '#5a4012', seed: 5 }, { t: 'columns', y: 0.84, n: 4, h: 0.4, c: '#6a4c16', style: 'arch', seed: 3, x0: 0.1, x1: 0.9 }],
    near: [{ t: 'ground', y: 0.88, c: '#4a3810', c2: '#1a1204', road: true, roadC: '#8a6a24' }, figLayer(0.5, 'mask', '#d8c070', '#fff0c0', { s: 0.34, y: 0.98, back: false })],
    fog: [{ c: '#f0c860', a: 0.2, y: 0.8, h: 0.3 }], particles: { kind: 'motes', n: 36, c: '#fff0c0' }, lights: [lamp(0.5, 0.3, 0.4, '#ffe08a', 0.3)],
  },
};

const ALL: Dict = { ...GLASS, ...THORN, ...TIDE, ...GEAR, ...FROST, ...DEEP, ...NOON };

Object.keys(ALL).forEach(k => { if (SCENES[k]) delete ALL[k] });
registerScenes(ALL);
