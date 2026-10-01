import { DUNGEONS, GATE_MERIDIAN, GATE_SOLENNE, LANDMARKS, MAP_H, MAP_W, TOWNS, ZONES } from '../data/world';
import { hash2 } from '../rng';

export interface Poi { kind: 'town' | 'dungeon' | 'landmark'; id: string }
export interface WorldMap { w: number; h: number; tiles: string[]; poi: Map<number, Poi> }

const W = MAP_W;
const H = MAP_H;
const idx = (x: number, y: number) => y * W + x;
const inb = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H;

function vnoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hash2(x0, y0, seed), b = hash2(x0 + 1, y0, seed), c = hash2(x0, y0 + 1, seed), d = hash2(x0 + 1, y0 + 1, seed);
  const u = s(fx), v = s(fy);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
const fbm = (x: number, y: number, seed: number) => vnoise(x / 4, y / 4, seed) * 0.55 + vnoise(x / 2, y / 2, seed + 7) * 0.3 + vnoise(x, y, seed + 13) * 0.15;

export const IMPASSABLE = new Set(['w', 'M', 'N', 'O', 'Z']);
export const COST: Record<string, number> = { r: 0.4, B: 0.6, p: 1, a: 1.2, f: 2, F: 2.2, h: 1.6, b: 1.3, n: 1.6, x: 2.4, c: 1.5, w: 14, M: 30, N: 30, O: 30, G: 1, H: 1 };
export const ENC: Record<string, number> = { r: 0.25, B: 0.25, p: 1, a: 1.3, f: 1.4, F: 1.6, h: 1.1, b: 1.3, n: 1.4, x: 1.7, c: 1.9 };
export const TERRAIN_NAME: Record<string, string> = { r: 'Road', B: 'Bridge', p: 'Plains', a: 'Ashen Fields', f: 'Forest', F: 'Ash Forest', h: 'Hills', b: 'Bone Badlands', n: 'Snowfield', x: 'Marsh', c: 'Scorched Ground', w: 'Water', M: 'Mountains', N: 'Ice Peaks', O: 'Bone Ridge', Z: 'Noon Mist', G: 'Sealed Gate', H: 'Sealed Gate' };

function biomeAt(x: number, y: number): string {
  let best = ZONES[0], bd = Infinity;
  for (const z of ZONES) {
    const d = Math.hypot(x - z.at[0] + (hash2(x, y, 3) - 0.5) * 3, (y - z.at[1]) * 1.15 + (hash2(y, x, 5) - 0.5) * 3);
    if (d < bd) { bd = d; best = z }
  }
  return best.biome;
}

function baseTerrain(x: number, y: number): string {
  const n = fbm(x, y, 11), n2 = fbm(x + 40, y + 17, 23);
  switch (biomeAt(x, y)) {
    case 'plains': return n > 0.68 ? 'h' : n2 > 0.58 ? 'f' : 'p';
    case 'coast': return n2 > 0.66 ? 'f' : n > 0.72 ? 'h' : 'p';
    case 'swamp': return n2 > 0.7 ? 'w' : n > 0.6 ? 'f' : 'x';
    case 'ash': return n > 0.4 ? 'F' : 'a';
    case 'bone': return n2 > 0.8 ? 'O' : n > 0.66 ? 'h' : 'b';
    case 'snow': return n2 > 0.72 ? 'N' : 'n';
    case 'noon': return 'c';
    default: return 'p';
  }
}

interface Node { i: number; f: number }
function astar(tiles: string[], from: number, to: number, cost: (ch: string) => number): number[] {
  const g = new Float32Array(W * H).fill(Infinity);
  const prev = new Int32Array(W * H).fill(-1);
  const heap: Node[] = [];
  const push = (n: Node) => { heap.push(n); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p].f <= heap[i].f) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p } };
  const pop = () => {
    const top = heap[0]; const last = heap.pop()!;
    if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l].f < heap[m].f) m = l; if (r < heap.length && heap[r].f < heap[m].f) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m } }
    return top;
  };
  const tx = to % W, ty = Math.floor(to / W);
  g[from] = 0;
  push({ i: from, f: 0 });
  while (heap.length) {
    const { i } = pop();
    if (i === to) break;
    const x = i % W, y = Math.floor(i / W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!inb(nx, ny)) continue;
      const ni = idx(nx, ny);
      const c = cost(tiles[ni]);
      if (!isFinite(c)) continue;
      const ng = g[i] + c + hash2(nx, ny, 99) * 0.15;
      if (ng < g[ni]) { g[ni] = ng; prev[ni] = i; push({ i: ni, f: ng + (Math.abs(nx - tx) + Math.abs(ny - ty)) * 0.4 }) }
    }
  }
  const path: number[] = [];
  if (prev[to] < 0 && from !== to) return path;
  for (let c = to; c >= 0; c = prev[c]) { path.push(c); if (c === from) break }
  return path;
}

function build(): WorldMap {
  const tiles: string[] = new Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) tiles[idx(x, y)] = baseTerrain(x, y);

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x + 8, y - 56);
    if (d < 15 + fbm(x, y, 31) * 4) tiles[idx(x, y)] = 'w';
    if (Math.hypot(x - 26, y - 38) < 2.4 + hash2(x, y, 4) * 0.4) tiles[idx(x, y)] = 'w';
    if (y >= 10 && y <= 12 && Math.abs(x - 32) > 3 && hash2(x, y, 8) > 0.08) tiles[idx(x, y)] = 'N';
    if (x >= 14 && x <= 16 && y >= 6 && y <= 32 && !(y >= 22 && y <= 26)) tiles[idx(x, y)] = 'O';
    if (x >= 46 && x <= 48 && y >= 8 && y <= 30 && !(y >= 22 && y <= 26)) tiles[idx(x, y)] = 'M';
  }
  for (let x = 20; x <= 44; x++) tiles[idx(x, 33)] = 'Z';
  for (let y = 33; y < H; y++) { tiles[idx(20, y)] = 'Z'; tiles[idx(44, y)] = 'Z' }
  for (let x = 21; x <= 43; x++) tiles[idx(x, 42)] = 'Z';
  tiles[idx(GATE_SOLENNE[0], GATE_SOLENNE[1])] = 'G';
  tiles[idx(GATE_MERIDIAN[0], GATE_MERIDIAN[1])] = 'H';

  const poi = new Map<number, Poi>();
  const points: { x: number; y: number; id: string; kind: Poi['kind'] }[] = [];
  TOWNS.forEach(t => points.push({ x: t.pos[0], y: t.pos[1], id: t.id, kind: 'town' }));
  DUNGEONS.forEach(d => points.push({ x: d.pos[0], y: d.pos[1], id: d.id, kind: 'dungeon' }));
  LANDMARKS.forEach(l => points.push({ x: l.pos[0], y: l.pos[1], id: l.id, kind: 'landmark' }));
  const protectedTile = (x: number, y: number) => tiles[idx(x, y)] === 'Z' || tiles[idx(x, y)] === 'G' || tiles[idx(x, y)] === 'H';
  points.forEach(p => {
    poi.set(idx(p.x, p.y), { kind: p.kind, id: p.id });
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = p.x + dx, y = p.y + dy;
      if (!inb(x, y) || protectedTile(x, y)) continue;
      if (Math.abs(dx) + Math.abs(dy) <= 1 || p.kind === 'town') {
        const ch = tiles[idx(x, y)];
        if (IMPASSABLE.has(ch)) tiles[idx(x, y)] = biomeGround(biomeAt(x, y));
      }
    }
  });

  const pos = (id: string) => { const p = points.find(q => q.id === id)!; return idx(p.x, p.y) };
  const roadCost = (ch: string) => (ch === 'Z' ? Infinity : COST[ch] ?? 1);
  const links: [string, string][] = [
    ['veyrgard', 'lanternrest'], ['lanternrest', 'emberhollow'], ['veyrgard', 'hangedman'], ['hangedman', 'saltmere'], ['veyrgard', 'dunmarrow'],
    ['dunmarrow', 'gravemarrow'], ['veyrgard', 'frostgate'], ['frostgate', 'hollowreach'], ['veyrgard', 'solenne'], ['solenne', 'meridian'],
    ['saltmere', 'wickhaven'], ['veyrgard', 'undercroft'], ['veyrgard', 'rookery'], ['saltmere', 'catacombs'], ['emberhollow', 'ashwood'],
    ['emberhollow', 'hearthcrypt'], ['gravemarrow', 'quarry'], ['hollowreach', 'pass'], ['emberhollow', 'archive'], ['gravemarrow', 'foundry'],
    ['hollowreach', 'barrows'], ['hollowreach', 'rimeglass'], ['wickhaven', 'seacaves'], ['gravemarrow', 'ribcage'], ['solenne', 'undercity'],
    ['emberhollow', 'hollowhill'],
  ];
  links.forEach(([a, b]) => {
    const path = astar(tiles, pos(a), pos(b), roadCost);
    path.forEach(i => { const ch = tiles[i]; if (ch === 'w') tiles[i] = 'B'; else if (ch !== 'G' && ch !== 'H' && ch !== 'Z') tiles[i] = 'r' });
  });

  const reach = new Uint8Array(W * H);
  const queue = [pos('veyrgard')];
  reach[queue[0]] = 1;
  while (queue.length) {
    const i = queue.pop()!;
    const x = i % W, y = Math.floor(i / W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!inb(nx, ny)) continue;
      const ni = idx(nx, ny);
      if (reach[ni] || IMPASSABLE.has(tiles[ni])) continue;
      reach[ni] = 1;
      queue.push(ni);
    }
  }
  points.forEach(p => {
    if (reach[idx(p.x, p.y)]) return;
    const path = astar(tiles, idx(p.x, p.y), pos('veyrgard'), ch => (ch === 'Z' ? Infinity : ch === 'w' ? 12 : COST[ch] ?? 1));
    path.forEach(i => { const ch = tiles[i]; if (ch === 'w') tiles[i] = 'B'; else if (IMPASSABLE.has(ch) && ch !== 'Z') tiles[i] = 'r' });
  });

  return { w: W, h: H, tiles, poi };
}

function biomeGround(b: string): string {
  return ({ plains: 'p', coast: 'p', swamp: 'x', ash: 'a', bone: 'b', snow: 'n', noon: 'c' } as Record<string, string>)[b] ?? 'p';
}

let cache: WorldMap | null = null;
export function getWorld(): WorldMap { return (cache ??= build()) }
export const tileAt = (x: number, y: number) => (inb(x, y) ? getWorld().tiles[idx(x, y)] : 'Z');
export const poiAt = (x: number, y: number) => getWorld().poi.get(idx(x, y));
export const worldIdx = idx;
export const worldInBounds = inb;
