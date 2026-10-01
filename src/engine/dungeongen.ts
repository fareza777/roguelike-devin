import { EVENTS } from '../data/events';
import type { DungeonDef, Ent, EntKind, Floor } from '../types';
import { mulberry32, rint, rpick, shuffle } from '../rng';

export const BLOCK_SIGHT = new Set(['#', 'S', '+', 'L']);
export const WALKABLE = new Set(['.', ',', '~', '<', '>', '/']);
export const BLOCKING_ENTS = new Set<EntKind>(['enemy', 'boss', 'chest', 'shrine', 'altar', 'prisoner', 'camp', 'fountain', 'lore', 'npc', 'lever']);

interface Room { x: number; y: number; w: number; h: number; cx: number; cy: number }
export interface GenOpts { bossRespawn: boolean; secretItem?: string; mainCleared: boolean }

const THEME_TAGS: Record<string, string[]> = {
  crypt: ['crypt', 'any'], flooded: ['sea', 'crypt', 'any'], forest: ['forest', 'fire', 'any'], ember: ['fire', 'crypt', 'any'], bone: ['bone', 'any'],
  mine: ['bone', 'fire', 'any'], ice: ['ice', 'any'], noon: ['noon', 'any'], cave: ['any'], ruin: ['any'], swamp: ['swamp', 'any'], sanctum: ['fire', 'noon', 'crypt', 'any'],
};
export const eventPool = (theme: string) => EVENTS.filter(e => (e.tags ?? ['any']).some(t => (THEME_TAGS[theme] ?? ['any']).includes(t)));

export function genFloor(def: DungeonDef, floorIdx: number, seed: number, opts: GenOpts): Floor {
  const rng = mulberry32(seed * 31 + floorIdx * 7919 + 13);
  const w = def.size[0] | 1, h = def.size[1] | 1;
  const grid: string[][] = Array.from({ length: h }, () => Array(w).fill('#'));
  const rooms: Room[] = [];
  const target = 7 + Math.floor((w * h) / 260) + rint(rng, 0, 1);
  for (let a = 0; a < 200 && rooms.length < target; a++) {
    const rw = rint(rng, 4, 8), rh = rint(rng, 3, 6);
    const rx = rint(rng, 1, w - rw - 2), ry = rint(rng, 1, h - rh - 2);
    if (rooms.some(r => rx < r.x + r.w + 2 && rx + rw + 2 > r.x && ry < r.y + r.h + 2 && ry + rh + 2 > r.y)) continue;
    rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: rx + (rw >> 1), cy: ry + (rh >> 1) });
  }
  if (rooms.length < 4) { rooms.push({ x: 2, y: 2, w: 5, h: 4, cx: 4, cy: 4 }, { x: w - 8, y: h - 7, w: 5, h: 4, cx: w - 6, cy: h - 5 }) }
  rooms.forEach(r => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) grid[y][x] = '.' });

  const carve = (x1: number, y1: number, x2: number, y2: number) => {
    const horizFirst = rng() < 0.5;
    const seg = (ax: number, ay: number, bx: number, by: number) => {
      let x = ax, y = ay;
      while (x !== bx) { if (grid[y][x] === '#') grid[y][x] = '.'; x += Math.sign(bx - x) }
      while (y !== by) { if (grid[y][x] === '#') grid[y][x] = '.'; y += Math.sign(by - y) }
      if (grid[y][x] === '#') grid[y][x] = '.';
    };
    if (horizFirst) { seg(x1, y1, x2, y1); seg(x2, y1, x2, y2) } else { seg(x1, y1, x1, y2); seg(x1, y2, x2, y2) }
  };
  const connected = new Set<number>([0]);
  while (connected.size < rooms.length) {
    let best: [number, number] = [0, 0], bd = Infinity;
    connected.forEach(i => rooms.forEach((r, j) => { if (connected.has(j)) return; const d = Math.abs(rooms[i].cx - r.cx) + Math.abs(rooms[i].cy - r.cy); if (d < bd) { bd = d; best = [i, j] } }));
    carve(rooms[best[0]].cx, rooms[best[0]].cy, rooms[best[1]].cx, rooms[best[1]].cy);
    connected.add(best[1]);
  }
  for (let i = 0; i < 2; i++) { const a = rpick(rng, rooms), b = rpick(rng, rooms); if (a !== b) carve(a.cx, a.cy, b.cx, b.cy) }

  const inRoom = (x: number, y: number, r: Room) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
  const roomAt = (x: number, y: number) => rooms.find(r => inRoom(x, y, r));
  const wallAt = (x: number, y: number) => x < 0 || y < 0 || x >= w || y >= h || grid[y][x] === '#';

  const doors: { x: number; y: number; room: Room }[] = [];
  rooms.forEach(r => {
    for (let x = r.x; x < r.x + r.w; x++) for (const y of [r.y - 1, r.y + r.h]) if (!wallAt(x, y) && wallAt(x - 1, y) && wallAt(x + 1, y)) doors.push({ x, y, room: r });
    for (let y = r.y; y < r.y + r.h; y++) for (const x of [r.x - 1, r.x + r.w]) if (!wallAt(x, y) && wallAt(x, y - 1) && wallAt(x, y + 1)) doors.push({ x, y, room: r });
  });

  const start = rooms[0];
  const dist = bfs(grid, start.cx, start.cy, w, h);
  const ranked = [...rooms].sort((a, b) => dist[b.cy * w + b.cx] - dist[a.cy * w + a.cx]);
  const endRoom = ranked[0];
  const finalFloor = floorIdx === def.floors - 1;
  if (finalFloor) {
    for (let y = endRoom.cy - 2; y <= endRoom.cy + 2; y++) for (let x = endRoom.cx - 3; x <= endRoom.cx + 3; x++) if (x > 0 && y > 0 && x < w - 1 && y < h - 1) grid[y][x] = '.';
  }

  const ents: Ent[] = [];
  let nextId = 1;
  const taken = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;
  const add = (k: EntKind, x: number, y: number, o: Partial<Ent> = {}) => { taken.add(key(x, y)); ents.push({ id: nextId++, k, x, y, ...o }) };
  const isFree = (x: number, y: number) => grid[y][x] === '.' && !taken.has(key(x, y));

  let vault: Room | null = null;
  const cand = rooms.filter(r => r !== start && r !== endRoom && doors.filter(d => d.room === r).length === 1 && r.w * r.h >= 12);
  if (cand.length && rng() < 0.7) {
    vault = rpick(rng, cand);
    const d = doors.find(q => q.room === vault)!;
    grid[d.y][d.x] = 'L';
  }
  doors.forEach(d => { if (grid[d.y][d.x] === '.' && rng() < 0.5 && !(d.room === start)) grid[d.y][d.x] = '+' });

  const up: [number, number] = [start.cx, start.cy];
  grid[start.cy][start.cx] = '<';
  taken.add(key(...up));
  let down: [number, number] | null = null;
  if (!finalFloor) { down = [endRoom.cx, endRoom.cy]; grid[endRoom.cy][endRoom.cx] = '>'; taken.add(key(...down)) }

  const cellsIn = (r: Room) => { const out: [number, number][] = []; for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (isFree(x, y)) out.push([x, y]); return out };
  const otherRooms = rooms.filter(r => r !== start && r !== vault);
  const anyCell = (pool: Room[]): [number, number] | null => {
    for (let a = 0; a < 30; a++) { const r = rpick(rng, pool), cs = cellsIn(r); if (cs.length) return rpick(rng, cs) }
    return null;
  };
  const corridorCell = (): [number, number] | null => {
    for (let a = 0; a < 60; a++) { const x = rint(rng, 1, w - 2), y = rint(rng, 1, h - 2); if (isFree(x, y) && !roomAt(x, y)) return [x, y] }
    return null;
  };
  const far = (x: number, y: number) => dist[y * w + x] > 5;

  if (finalFloor) {
    const bossId = opts.mainCleared ? def.elite : def.boss;
    add('boss', endRoom.cx, endRoom.cy, { enemy: bossId, rank: opts.mainCleared ? 'elite' : 'boss', awake: false });
  }

  const nEnemies = 5 + floorIdx + rint(rng, 0, 2) + (w * h > 700 ? 1 : 0);
  for (let i = 0; i < nEnemies; i++) {
    const c = anyCell(otherRooms.length ? otherRooms : rooms) ?? corridorCell();
    if (!c || !far(c[0], c[1])) continue;
    add('enemy', c[0], c[1], { enemy: rpick(rng, def.enemies), rank: 'normal', awake: rng() < 0.3 });
  }
  const nElite = floorIdx >= 1 ? 1 + (floorIdx >= 3 ? 1 : 0) : rng() < 0.5 ? 1 : 0;
  for (let i = 0; i < nElite; i++) {
    const c = anyCell(otherRooms.filter(r => r !== endRoom || !finalFloor));
    if (c && far(c[0], c[1])) add('enemy', c[0], c[1], { enemy: def.elite, rank: 'elite', awake: rng() < 0.2 });
  }
  const nChest = 2 + rint(rng, 0, 2);
  for (let i = 0; i < nChest; i++) { const c = anyCell(otherRooms); if (c) add('chest', c[0], c[1], { mimic: rng() < 0.12 }) }
  if (vault) { const cs = shuffle(rng, cellsIn(vault)); cs.slice(0, 3).forEach(([x, y], i) => add('chest', x, y, { ref: i === 0 ? 'vault' : undefined })) }
  const nTrap = 3 + rint(rng, 0, 3);
  for (let i = 0; i < nTrap; i++) { const c = rng() < 0.5 ? corridorCell() : anyCell(otherRooms); if (c && far(c[0], c[1])) add('trap', c[0], c[1], { hidden: rng() < 0.6 }) }
  const evPool = eventPool(def.theme);
  const nEvent = 1 + rint(rng, 0, 2);
  const chosen = shuffle(rng, evPool).slice(0, nEvent);
  chosen.forEach(ev => { const c = anyCell(otherRooms); if (c) add('event', c[0], c[1], { ref: ev.id }) });
  if (rng() < 0.55) { const c = anyCell(otherRooms); if (c) add('shrine', c[0], c[1]) }
  if (floorIdx > 0 || rng() < 0.6) { const c = anyCell(otherRooms); if (c) add('camp', c[0], c[1]) }
  if (rng() < 0.35) { const c = anyCell(otherRooms); if (c) add('fountain', c[0], c[1]) }
  if (rng() < 0.4) { const c = anyCell(otherRooms); if (c) add('lore', c[0], c[1]) }
  if (rng() < 0.2 && floorIdx >= 1) { const c = anyCell(otherRooms); if (c) add('prisoner', c[0], c[1]) }
  const nGold = 3 + rint(rng, 0, 2);
  for (let i = 0; i < nGold; i++) { const c = rng() < 0.4 ? corridorCell() : anyCell(rooms); if (c) add('gold', c[0], c[1]) }
  for (let i = 0; i < 1 + rint(rng, 0, 1); i++) { const c = rng() < 0.5 ? corridorCell() : anyCell(rooms); if (c) add('potion', c[0], c[1]) }
  if (vault) {
    const kc = anyCell(otherRooms.filter(r => r !== endRoom || finalFloor));
    if (kc) add('key', kc[0], kc[1]);
  }

  const secretFloor = Math.max(0, def.floors - 2);
  const wantSecret = floorIdx === secretFloor || rng() < 0.5;
  if (wantSecret) {
    let placed = false;
    const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let a = 0; a < 400 && !placed; a++) {
      const fx = rint(rng, 2, w - 3), fy = rint(rng, 2, h - 3);
      if (grid[fy][fx] !== '.') continue;
      const [dx, dy] = rpick(rng, dirs);
      const nx = fx + dx, ny = fy + dy;
      if (grid[ny]?.[nx] !== '#') continue;
      const px = -dy, py = dx;
      let ok = true;
      for (let s = 1; s <= 3 && ok; s++) for (let l = -1; l <= 1; l++) { const tx = nx + dx * s + px * l, ty = ny + dy * s + py * l; if (tx < 1 || ty < 1 || tx >= w - 1 || ty >= h - 1 || grid[ty][tx] !== '#') ok = false }
      for (let l = -2; l <= 2 && ok; l++) { const tx = nx + dx * 4 + px * l, ty = ny + dy * 4 + py * l; if (tx >= 0 && ty >= 0 && tx < w && ty < h && grid[ty][tx] !== '#') ok = false }
      if (!ok) continue;
      grid[ny][nx] = 'S';
      for (let s = 1; s <= 3; s++) for (let l = -1; l <= 1; l++) grid[ny + dy * s + py * l][nx + dx * s + px * l] = '.';
      const cx = nx + dx * 2, cy = ny + dy * 2;
      if (opts.secretItem && floorIdx === secretFloor) add('questitem', cx, cy, { ref: opts.secretItem });
      else add('chest', cx, cy, { ref: 'secret' });
      add('gold', cx + px, cy + py);
      placed = true;
    }
    if (!placed && opts.secretItem && floorIdx === secretFloor) { const c = anyCell(otherRooms); if (c) add('questitem', c[0], c[1], { ref: opts.secretItem }) }
  }

  const decor = def.theme === 'flooded' || def.theme === 'swamp' ? 0.16 : 0.07;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (grid[y][x] === '.' && !taken.has(key(x, y))) {
    const r = rng();
    if (r < decor * 0.45 && (def.theme === 'flooded' || def.theme === 'swamp')) grid[y][x] = '~';
    else if (r < decor) grid[y][x] = ',';
  }

  const tiles = grid.map(r => r.join('')).join('');
  return { w, h, tiles, seen: '0'.repeat(w * h), ents, up, down, nextId };
}

function bfs(grid: string[][], sx: number, sy: number, w: number, h: number): Int32Array {
  const d = new Int32Array(w * h).fill(-1);
  const q: number[] = [sy * w + sx];
  d[q[0]] = 0;
  for (let i = 0; i < q.length; i++) {
    const c = q[i], x = c % w, y = Math.floor(c / w);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || grid[ny][nx] === '#' || d[ny * w + nx] >= 0) continue;
      d[ny * w + nx] = d[c] + 1;
      q.push(ny * w + nx);
    }
  }
  for (let i = 0; i < d.length; i++) if (d[i] < 0) d[i] = 0;
  return d;
}

export function computeFov(tiles: string, w: number, h: number, px: number, py: number, r: number): Uint8Array {
  const vis = new Uint8Array(w * h);
  vis[py * w + px] = 1;
  const cast = (tx: number, ty: number) => {
    const dx = tx - px, dy = ty - py;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(px + (dx * i) / steps), y = Math.round(py + (dy * i) / steps);
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      if ((x - px) ** 2 + (y - py) ** 2 > r * r + 1) return;
      vis[y * w + x] = 1;
      if (BLOCK_SIGHT.has(tiles[y * w + x])) return;
    }
  };
  for (let i = -r; i <= r; i++) { cast(px + i, py - r); cast(px + i, py + r); cast(px - r, py + i); cast(px + r, py + i) }
  return vis;
}
