import { ENEMY_MAP } from '../data/enemies';
import { DUNGEON_MAP, LANDMARK_MAP, MAP_H, MAP_W, TOWN_MAP } from '../data/world';
import { floorOf, visibleSet } from '../engine/dungeon';
import { cond } from '../engine/quests';
import { gateOpen, isExplored, objectiveTarget } from '../engine/world';
import { getWorld, worldIdx } from '../engine/worldgen';
import { stats } from '../engine/core';
import { iconPath } from '../icons';
import { hash2 } from '../rng';
import type { Ent, GameState } from '../types';
import { TERRAIN, THEMES } from './palette';

interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; hue: number }
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export class MapView {
  readonly cv = document.createElement('canvas');
  private ctx = this.cv.getContext('2d')!;
  private w = 0; private h = 0; private dpr = 1; ts = 44;
  private disp = { x: 0, y: 0 };
  private camL = 0; private camT = 0;
  private key = '';
  private last = 0;
  private time = 0;
  private shake = 0; private flash = 0; private flashColor = '255,60,40';
  private parts: Particle[] = [];
  private ro: ResizeObserver | null = null;
  private raf = 0;
  path: [number, number][] = [];
  mini = true;
  showLabels = true;

  constructor(private get: () => GameState) {
    this.cv.className = 'mapcv';
    this.cv.setAttribute('aria-label', 'Game map');
  }

  attach(host: HTMLElement) {
    if (this.cv.parentElement !== host) host.appendChild(this.cv);
    this.ro?.disconnect();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    if (!this.raf) this.raf = requestAnimationFrame(t => this.loop(t));
  }

  private resize() {
    const host = this.cv.parentElement;
    if (!host) return;
    const r = host.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.round(r.width); this.h = Math.round(r.height);
    this.cv.width = Math.round(this.w * this.dpr);
    this.cv.height = Math.round(this.h * this.dpr);
    this.cv.style.width = `${this.w}px`;
    this.cv.style.height = `${this.h}px`;
    const cols = Math.max(7, Math.min(15, Math.round(this.w / 50)));
    this.ts = this.w / cols;
  }

  impulse(kind: 'hurt' | 'heal' | 'gold' | 'door') {
    if (kind === 'hurt') { this.shake = 0.35; this.flash = 0.45; this.flashColor = '255,50,40' }
    else if (kind === 'heal') { this.flash = 0.3; this.flashColor = '120,255,160' }
    else if (kind === 'gold') { this.flash = 0.22; this.flashColor = '255,215,110' }
    else this.shake = 0.08;
  }
  snap() { this.key = '' }

  private loop(now: number) {
    this.raf = requestAnimationFrame(t => this.loop(t));
    if (!this.cv.isConnected || !this.w) return;
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    this.time += dt;
    const s = this.get();
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (s.screen === 'world') this.drawWorld(s, dt);
    else if (s.screen === 'dungeon' && s.run) this.drawDungeon(s, dt);
    else return;
    this.shake = Math.max(0, this.shake - dt);
    this.flash = Math.max(0, this.flash - dt * 1.4);
    if (this.flash > 0) { c.fillStyle = `rgba(${this.flashColor},${this.flash * 0.5})`; c.fillRect(0, 0, this.w, this.h) }
  }

  private follow(tx: number, ty: number, mw: number, mh: number, dt: number, key: string) {
    if (key !== this.key) { this.key = key; this.disp.x = tx; this.disp.y = ty; this.parts = [] }
    const k = 1 - Math.exp(-dt * 13);
    this.disp.x += (tx - this.disp.x) * k;
    this.disp.y += (ty - this.disp.y) * k;
    const vw = this.w / this.ts, vh = this.h / this.ts;
    const cx = mw <= vw ? mw / 2 : Math.max(vw / 2, Math.min(mw - vw / 2, this.disp.x + 0.5));
    const cy = mh <= vh ? mh / 2 : Math.max(vh / 2, Math.min(mh - vh / 2, this.disp.y + 0.5));
    this.camL = cx - vw / 2;
    this.camT = cy - vh / 2;
  }

  tileFromPoint(px: number, py: number): [number, number] {
    return [Math.floor(px / this.ts + this.camL), Math.floor(py / this.ts + this.camT)];
  }
  screenOf(x: number, y: number): [number, number] { return [(x - this.camL) * this.ts, (y - this.camT) * this.ts] }

  private icon(name: string, cx: number, cy: number, size: number, color: string, alpha = 1) {
    const p = iconPath(name);
    if (!p) return;
    const c = this.ctx;
    c.save();
    c.translate(cx - size / 2, cy - size / 2);
    c.scale(size / 512, size / 512);
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.fill(p);
    c.restore();
  }

  private token(name: string, cx: number, cy: number, size: number, o: { bg?: string; ring?: string; glow?: string; color?: string; alpha?: number; pulse?: number } = {}) {
    const c = this.ctx;
    const pulse = o.pulse ? 1 + Math.sin(this.time * 4) * o.pulse : 1;
    c.save();
    c.globalAlpha = o.alpha ?? 1;
    if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = size * 0.5 * pulse }
    c.beginPath();
    c.arc(cx, cy, size * 0.5 * pulse, 0, Math.PI * 2);
    c.fillStyle = o.bg ?? 'rgba(10,8,8,0.82)';
    c.fill();
    c.shadowBlur = 0;
    if (o.ring) { c.lineWidth = Math.max(1.5, size * 0.06); c.strokeStyle = o.ring; c.stroke() }
    c.restore();
    this.icon(name, cx, cy, size * 0.66, o.color ?? '#f1e6d0', o.alpha ?? 1);
  }

  private text(t: string, x: number, y: number, size = 11, color = '#f0e6d2', align: CanvasTextAlign = 'center') {
    const c = this.ctx;
    c.font = `600 ${size}px Cinzel, Georgia, serif`;
    c.textAlign = align;
    c.textBaseline = 'middle';
    c.lineWidth = 3;
    c.strokeStyle = 'rgba(0,0,0,0.85)';
    c.strokeText(t, x, y);
    c.fillStyle = color;
    c.fillText(t, x, y);
  }

  private spawnParticles(kind: string, dt: number, boost = 1) {
    const rate = { dust: 5, ember: 14, snow: 26, spore: 9, mote: 9, drip: 4 }[kind] ?? 4;
    const n = Math.floor(rate * boost * dt * 4 + Math.random());
    for (let i = 0; i < n && this.parts.length < 140; i++) {
      const p: Particle = { x: Math.random() * this.w, y: 0, vx: 0, vy: 0, life: 0, max: 3 + Math.random() * 4, size: 1 + Math.random() * 2, hue: 0 };
      switch (kind) {
        case 'ember': p.y = this.h + 4; p.vx = (Math.random() - 0.3) * 18; p.vy = -20 - Math.random() * 30; p.hue = 20 + Math.random() * 20; break;
        case 'snow': p.y = -4; p.vx = 12 + Math.random() * 14; p.vy = 26 + Math.random() * 30; p.hue = 210; p.max = 6; break;
        case 'spore': p.y = this.h * Math.random(); p.vx = (Math.random() - 0.5) * 10; p.vy = -6 - Math.random() * 6; p.hue = 90; break;
        case 'mote': p.y = this.h * Math.random(); p.vx = (Math.random() - 0.5) * 8; p.vy = -4 - Math.random() * 6; p.hue = 46; p.size = 1.5 + Math.random() * 2; break;
        case 'drip': p.y = -4; p.vx = 0; p.vy = 80 + Math.random() * 40; p.hue = 180; p.max = 2; break;
        default: p.y = this.h * Math.random(); p.vx = (Math.random() - 0.5) * 6; p.vy = -2 - Math.random() * 3; p.hue = 40; p.size = 1 + Math.random() * 1.4;
      }
      this.parts.push(p);
    }
  }

  private drawParticles(dt: number, kind: string, boost = 1) {
    const c = this.ctx;
    this.spawnParticles(kind, dt, boost);
    this.parts = this.parts.filter(p => (p.life += dt) < p.max && p.y > -10 && p.y < this.h + 10 && p.x > -10 && p.x < this.w + 10);
    for (const p of this.parts) {
      p.x += p.vx * dt + Math.sin(this.time + p.max) * 0.12; p.y += p.vy * dt;
      const a = Math.min(1, p.life * 1.5, (p.max - p.life) * 0.8) * (kind === 'snow' ? 0.85 : 0.65);
      c.fillStyle = `hsla(${p.hue},${kind === 'snow' ? 30 : 90}%,${kind === 'snow' ? 92 : 62}%,${Math.max(0, a)})`;
      if (kind === 'drip') c.fillRect(p.x, p.y, 1.2, 6); else { c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill() }
    }
  }

  private vignette(strength = 0.6) {
    const c = this.ctx;
    const g = c.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.3, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
    c.fillStyle = g;
    c.fillRect(0, 0, this.w, this.h);
  }

  private sanityFx(s: GameState) {
    const st = stats(s);
    const r = s.sanity / Math.max(1, st.maxSanity);
    if (r > 0.3) return;
    const c = this.ctx;
    const a = (0.3 - r) / 0.3;
    const pulse = 0.5 + Math.sin(this.time * 2.2) * 0.5;
    const g = c.createRadialGradient(this.w / 2, this.h / 2, this.h * 0.25, this.w / 2, this.h / 2, this.h * 0.8);
    g.addColorStop(0, 'rgba(90,0,120,0)');
    g.addColorStop(1, `rgba(110,10,150,${(0.25 + pulse * 0.25) * a})`);
    c.fillStyle = g;
    c.fillRect(0, 0, this.w, this.h);
  }

  // ---------------------------------------------------------------- world

  private terrain(ch: string, i: number, j: number, sx: number, sy: number, ts: number) {
    const c = this.ctx;
    const pal = TERRAIN[ch] ?? TERRAIN.p;
    const h = hash2(i, j, 7);
    c.fillStyle = h > 0.5 ? pal.base : pal.alt;
    c.fillRect(sx, sy, ts + 0.5, ts + 0.5);
    const t = this.time;
    const px = (f: number) => sx + f * ts;
    const py = (f: number) => sy + f * ts;
    switch (ch) {
      case 'p': for (let k = 0; k < 3; k++) { const a = hash2(i, j, 20 + k), b = hash2(i, j, 30 + k); c.strokeStyle = 'rgba(20,32,14,0.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px(a), py(b)); c.lineTo(px(a) + 1, py(b) - ts * 0.12); c.stroke() } break;
      case 'a': for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(px(hash2(i, j, 20 + k)), py(hash2(i, j, 30 + k)), 2, 2) } break;
      case 'f': this.icon('m_tree', px(0.5), py(0.5), ts * 0.95, h > 0.5 ? '#182a1b' : '#1e3320'); if (h > 0.7) this.icon('m_tree', px(0.25), py(0.72), ts * 0.55, '#142315'); break;
      case 'F': this.icon('m_deadtree', px(0.5), py(0.52), ts * 0.95, '#0d0908'); if (h > 0.55) { const a = 0.4 + Math.sin(t * 3 + i * 3 + j) * 0.3; c.fillStyle = `rgba(255,120,40,${a})`; c.beginPath(); c.arc(px(hash2(i, j, 5)), py(0.75), 1.6, 0, 7); c.fill() } break;
      case 'h': c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1.5; c.beginPath(); c.arc(px(0.35), py(0.75), ts * 0.28, Math.PI, 0); c.stroke(); c.beginPath(); c.arc(px(0.68), py(0.62), ts * 0.2, Math.PI, 0); c.stroke(); break;
      case 'b': if (h > 0.55) { c.strokeStyle = 'rgba(235,225,190,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px(0.25), py(0.65)); c.lineTo(px(0.62), py(0.4)); c.stroke(); c.beginPath(); c.arc(px(0.68), py(0.38), 2.2, 0, 7); c.fillStyle = 'rgba(235,225,190,0.55)'; c.fill() } break;
      case 'n': if (h > 0.4) { const a = 0.35 + Math.sin(t * 2 + i * 7 + j * 3) * 0.3; c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(px(hash2(i, j, 5)), py(hash2(i, j, 6)), 2, 2) } break;
      case 'x': c.strokeStyle = 'rgba(12,24,14,0.7)'; c.lineWidth = 1.2; for (let k = 0; k < 3; k++) { const a = hash2(i, j, 20 + k); c.beginPath(); c.moveTo(px(a), py(0.9)); c.quadraticCurveTo(px(a) + 2, py(0.6), px(a) - 1, py(0.35)); c.stroke() } if (h > 0.6) { c.fillStyle = 'rgba(30,60,60,0.5)'; c.beginPath(); c.ellipse(px(0.5), py(0.7), ts * 0.25, ts * 0.1, 0, 0, 7); c.fill() } break;
      case 'c': c.strokeStyle = `rgba(255,205,90,${0.22 + Math.sin(t * 1.6 + i + j) * 0.1})`; c.lineWidth = 1; c.beginPath(); c.moveTo(px(0.1), py(hash2(i, j, 2))); c.lineTo(px(0.5), py(0.5)); c.lineTo(px(0.9), py(hash2(i, j, 3))); c.stroke(); break;
      case 'w': for (let k = 0; k < 2; k++) { const yy = py(0.3 + k * 0.4); c.strokeStyle = 'rgba(120,190,220,0.22)'; c.lineWidth = 1.2; c.beginPath(); for (let x = 0; x <= 6; x++) { const xx = sx + (x / 6) * ts; const y2 = yy + Math.sin(t * 1.8 + (i * 6 + x) * 0.9 + k) * 1.6; if (x) c.lineTo(xx, y2); else c.moveTo(xx, y2) } c.stroke() } break;
      case 'r': c.fillStyle = 'rgba(0,0,0,0.16)'; for (let k = 0; k < 4; k++) c.fillRect(px(hash2(i, j, 40 + k)), py(hash2(i, j, 50 + k)), 3, 2); c.strokeStyle = 'rgba(40,30,16,0.35)'; c.strokeRect(sx + 0.5, sy + 0.5, ts - 1, ts - 1); break;
      case 'B': c.strokeStyle = 'rgba(20,10,0,0.6)'; c.lineWidth = 1.2; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(sx, sy + (k / 5) * ts); c.lineTo(sx + ts, sy + (k / 5) * ts); c.stroke() } break;
      case 'M': case 'O': this.icon('m_mountain', px(0.5), py(0.52), ts * 1.05, ch === 'M' ? '#2b2b34' : '#5a5540'); break;
      case 'N': this.icon('m_mountain', px(0.5), py(0.52), ts * 1.05, '#8ea4bc'); break;
      case 'Z': {
        const g = c.createRadialGradient(px(0.5 + Math.sin(t * 0.6 + i) * 0.2), py(0.5 + Math.cos(t * 0.5 + j) * 0.2), 2, px(0.5), py(0.5), ts * 0.8);
        g.addColorStop(0, 'rgba(255,214,110,0.55)'); g.addColorStop(1, 'rgba(40,26,4,0)');
        c.fillStyle = g; c.fillRect(sx, sy, ts, ts); break;
      }
      case 'G': case 'H': {
        const s = this.get();
        const open = gateOpen(s, ch);
        const col = open ? '#ffd870' : '#c03028';
        c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(sx, sy, ts, ts);
        c.strokeStyle = col; c.lineWidth = 2.5; c.shadowColor = col; c.shadowBlur = 10;
        c.beginPath(); c.moveTo(px(0.2), py(0.92)); c.lineTo(px(0.2), py(0.4)); c.arc(px(0.5), py(0.4), ts * 0.3, Math.PI, 0); c.lineTo(px(0.8), py(0.92)); c.stroke();
        c.shadowBlur = 0;
        if (!open) this.icon('lock', px(0.5), py(0.58), ts * 0.34, col);
        break;
      }
    }
    c.strokeStyle = 'rgba(0,0,0,0.07)'; c.lineWidth = 1; c.strokeRect(sx, sy, ts, ts);
  }

  private drawWorld(s: GameState, dt: number) {
    const c = this.ctx;
    const ts = this.ts;
    const wm = getWorld();
    const { x: px0, y: py0 } = s.world;
    this.follow(px0, py0, MAP_W, MAP_H, dt, 'world');
    c.save();
    if (this.shake > 0) c.translate((Math.random() - 0.5) * this.shake * 14, (Math.random() - 0.5) * this.shake * 14);
    c.fillStyle = '#040404';
    c.fillRect(-20, -20, this.w + 40, this.h + 40);
    const i0 = Math.floor(this.camL) - 1, j0 = Math.floor(this.camT) - 1;
    const i1 = Math.ceil(this.camL + this.w / ts) + 1, j1 = Math.ceil(this.camT + this.h / ts) + 1;
    const dx = this.disp.x, dy = this.disp.y;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (i < 0 || j < 0 || i >= MAP_W || j >= MAP_H) continue;
      const sx = (i - this.camL) * ts, sy = (j - this.camT) * ts;
      if (!isExplored(s, i, j)) {
        c.fillStyle = hash2(i, j, 1) > 0.5 ? '#07080a' : '#0a0b0d';
        c.fillRect(sx, sy, ts + 0.5, ts + 0.5);
        continue;
      }
      this.terrain(wm.tiles[worldIdx(i, j)], i, j, sx, sy, ts);
      const d = Math.hypot(i - dx, j - dy);
      const a = Math.max(0, Math.min(1, (d - 3.5) / 3.5)) * 0.5;
      if (a > 0.01) { c.fillStyle = `rgba(2,3,6,${a})`; c.fillRect(sx, sy, ts + 0.5, ts + 0.5) }
    }
    const obj = objectiveTarget(s);
    wm.poi.forEach((poi, idx) => {
      const i = idx % MAP_W, j = Math.floor(idx / MAP_W);
      if (i < i0 || i > i1 || j < j0 || j > j1) return;
      const sx = (i - this.camL) * ts + ts / 2, sy = (j - this.camT) * ts + ts / 2;
      const isObj = obj && obj.id === poi.id;
      if (poi.kind === 'town') {
        if (!s.world.known.includes(poi.id)) return;
        const t = TOWN_MAP.get(poi.id)!;
        const city = t.kind === 'city';
        this.token(city ? 'm_city' : 'm_town', sx, sy, ts * (city ? 1.15 : 0.95), { ring: city ? '#f0d28a' : '#c9b48a', glow: city ? 'rgba(255,200,110,0.9)' : 'rgba(255,220,160,0.6)', bg: 'rgba(24,14,8,0.92)', color: '#f4e3bd', pulse: 0.03 });
        if (this.showLabels) this.text(t.name, sx, sy + ts * 0.82, city ? 12 : 10.5, city ? '#f6dfa4' : '#e7d6b0');
      } else if (poi.kind === 'dungeon') {
        if (!s.world.known.includes(poi.id)) return;
        const d = DUNGEON_MAP.get(poi.id)!;
        const cleared = s.cleared.includes(poi.id);
        const boss = d.mainBoss;
        this.token(d.icon ?? 'm_dungeon', sx, sy, ts * (boss ? 1.05 : 0.9), { ring: cleared ? '#7fbf7a' : boss ? '#f0b850' : '#d8584a', glow: cleared ? 'rgba(120,220,120,0.5)' : boss ? 'rgba(255,190,80,0.85)' : 'rgba(255,70,50,0.6)', bg: 'rgba(20,8,8,0.92)', color: cleared ? '#b7e6b2' : '#ffe1d0', pulse: cleared ? 0 : 0.04 });
        if (this.showLabels) this.text(d.name.replace(/^The /, ''), sx, sy + ts * 0.8, 10, cleared ? '#a6d6a2' : '#f1c8b8');
      } else {
        const lm = LANDMARK_MAP.get(poi.id)!;
        if (lm.cond && !cond(s, lm.cond)) return;
        if (lm.once && s.world.done.includes(lm.id)) return;
        if (!isExplored(s, i, j)) return;
        this.token(lm.icon, sx, sy, ts * 0.72, { ring: '#9ec4e8', glow: 'rgba(150,200,255,0.55)', bg: 'rgba(8,12,20,0.88)', color: '#dceaff', pulse: 0.06 });
      }
      if (isObj) {
        const r = ts * (0.75 + Math.sin(this.time * 3) * 0.12);
        c.strokeStyle = 'rgba(255,215,110,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.stroke();
      }
    });
    if (obj && !s.world.known.includes(obj.id)) {
      const [ox, oy] = this.screenOf(obj.pos[0] + 0.5, obj.pos[1] + 0.5);
      if (ox > 0 && oy > 0 && ox < this.w && oy < this.h) this.token('quest', ox, oy, ts * 0.9, { ring: '#ffd870', glow: 'rgba(255,215,110,0.9)', color: '#ffe9a8', pulse: 0.08 });
    }
    if (this.path.length) { c.fillStyle = 'rgba(255,225,150,0.55)'; this.path.forEach(([i, j]) => { const [sx, sy] = this.screenOf(i + 0.5, j + 0.5); c.beginPath(); c.arc(sx, sy, ts * 0.1, 0, 7); c.fill() }) }
    this.drawHero(dx + 0.5, dy + 0.5, s.world.facing, true);
    c.restore();
    const zone = s.world.y > 30 ? 'mote' : s.world.y < 13 ? 'snow' : s.world.x > 46 ? 'ember' : 'dust';
    this.drawParticles(dt, zone, 0.7);
    this.vignette(0.55);
    this.sanityFx(s);
    if (obj) this.compass(obj.pos);
  }

  private compass(target: [number, number]) {
    const [tx, ty] = this.screenOf(target[0] + 0.5, target[1] + 0.5);
    const m = 26;
    if (tx > m && ty > m && tx < this.w - m && ty < this.h - m) return;
    const c = this.ctx;
    const cx = Math.max(m, Math.min(this.w - m, tx)), cy = Math.max(m, Math.min(this.h - m, ty));
    const ang = Math.atan2(ty - this.h / 2, tx - this.w / 2);
    c.save();
    c.translate(cx, cy);
    c.shadowColor = 'rgba(255,215,110,0.9)'; c.shadowBlur = 12;
    c.fillStyle = `rgba(255,215,110,${0.75 + Math.sin(this.time * 4) * 0.2})`;
    c.rotate(ang);
    c.beginPath(); c.moveTo(14, 0); c.lineTo(-8, 9); c.lineTo(-3, 0); c.lineTo(-8, -9); c.closePath(); c.fill();
    c.restore();
  }

  private drawHero(x: number, y: number, facing: number, glow: boolean) {
    const c = this.ctx;
    const ts = this.ts;
    const [sx, sy] = this.screenOf(x, y);
    const bob = Math.sin(this.time * 3) * ts * 0.02;
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath(); c.ellipse(sx, sy + ts * 0.32, ts * 0.26, ts * 0.09, 0, 0, 7); c.fill();
    if (glow) {
      const g = c.createRadialGradient(sx, sy, 2, sx, sy, ts * 1.1);
      g.addColorStop(0, 'rgba(255,220,150,0.28)'); g.addColorStop(1, 'rgba(255,220,150,0)');
      c.fillStyle = g; c.fillRect(sx - ts * 1.2, sy - ts * 1.2, ts * 2.4, ts * 2.4);
    }
    this.token('hero', sx, sy - ts * 0.05 + bob, ts * 0.92, { bg: 'rgba(30,20,8,0.9)', ring: '#f0c870', glow: 'rgba(255,200,100,0.8)', color: '#ffe9b8' });
    const [fx, fy] = DIRS[facing] ?? DIRS[0];
    c.fillStyle = '#f0c870';
    c.beginPath(); c.arc(sx + fx * ts * 0.44, sy + fy * ts * 0.44 - ts * 0.05 + bob, ts * 0.05, 0, 7); c.fill();
  }

  // -------------------------------------------------------------- dungeon

  private drawDungeon(s: GameState, dt: number) {
    const c = this.ctx;
    const ts = this.ts;
    const run = s.run!;
    const def = DUNGEON_MAP.get(run.dungeon)!;
    const pal = THEMES[def.theme];
    const f = floorOf(s);
    this.follow(run.px, run.py, f.w, f.h, dt, `${run.dungeon}:${run.floor}`);
    const vis = visibleSet(s);
    const st = stats(s);
    const wob = s.sanity < st.maxSanity * 0.2 ? Math.sin(this.time * 7) * 1.6 : 0;
    c.save();
    c.translate(wob + (this.shake > 0 ? (Math.random() - 0.5) * this.shake * 16 : 0), this.shake > 0 ? (Math.random() - 0.5) * this.shake * 16 : 0);
    c.fillStyle = '#030303';
    c.fillRect(-20, -20, this.w + 40, this.h + 40);
    const i0 = Math.max(0, Math.floor(this.camL) - 1), j0 = Math.max(0, Math.floor(this.camT) - 1);
    const i1 = Math.min(f.w - 1, Math.ceil(this.camL + this.w / ts) + 1), j1 = Math.min(f.h - 1, Math.ceil(this.camT + this.h / ts) + 1);
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= f.w || y >= f.h ? '#' : f.tiles[y * f.w + x]);
    const isWall = (ch: string) => ch === '#' || ch === 'S';
    const dx = this.disp.x, dy = this.disp.y;
    const flick = 1 + Math.sin(this.time * 9) * 0.03 + Math.sin(this.time * 3.3) * 0.04;
    const light = (run.torch > 0 ? 8.4 : 6.6) * flick;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const idx = j * f.w + i;
      const seen = f.seen[idx] === '1';
      if (!seen) continue;
      const v = vis[idx] === 1;
      const ch = f.tiles[idx];
      const sx = (i - this.camL) * ts, sy = (j - this.camT) * ts;
      const h = hash2(i, j, 5);
      if (isWall(ch)) {
        c.fillStyle = pal.wall;
        c.fillRect(sx, sy, ts + 0.5, ts + 0.5);
        const below = at(i, j + 1);
        const above = at(i, j - 1);
        if (!isWall(below) && below !== '#') {
          const g = c.createLinearGradient(0, sy + ts * 0.55, 0, sy + ts);
          g.addColorStop(0, pal.wallFace); g.addColorStop(1, pal.wallTop);
          c.fillStyle = g; c.fillRect(sx, sy + ts * 0.5, ts + 0.5, ts * 0.5 + 0.5);
          c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(sx, sy + ts * 0.72); c.lineTo(sx + ts, sy + ts * 0.72); c.moveTo(sx + ts * (0.3 + h * 0.3), sy + ts * 0.5); c.lineTo(sx + ts * (0.3 + h * 0.3), sy + ts * 0.72); c.stroke();
          c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(sx, sy + ts * 0.5, ts + 0.5, 1.5);
        } else if (!isWall(above) && above !== '#') {
          c.fillStyle = pal.wallTop; c.fillRect(sx, sy, ts + 0.5, ts * 0.3);
        } else if (h > 0.82) { c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(sx + ts * 0.2, sy + ts * 0.3, ts * 0.5, ts * 0.2) }
      } else {
        c.fillStyle = (i + j) % 2 ? pal.floor : pal.floor2;
        c.fillRect(sx, sy, ts + 0.5, ts + 0.5);
        if (ch === '~') {
          c.fillStyle = 'rgba(40,110,140,0.4)'; c.fillRect(sx, sy, ts + 0.5, ts + 0.5);
          c.strokeStyle = 'rgba(160,220,240,0.3)'; c.lineWidth = 1.2; c.beginPath();
          for (let x = 0; x <= 5; x++) { const xx = sx + (x / 5) * ts, yy = sy + ts * 0.5 + Math.sin(this.time * 2 + (i * 5 + x) * 0.9) * 2; if (x) c.lineTo(xx, yy); else c.moveTo(xx, yy) }
          c.stroke();
        } else if (ch === ',') {
          c.fillStyle = 'rgba(0,0,0,0.28)';
          c.fillRect(sx + ts * (0.15 + h * 0.4), sy + ts * 0.5, 5, 3); c.fillRect(sx + ts * 0.55, sy + ts * (0.2 + h * 0.3), 3, 3);
        } else if (h > 0.86) { c.strokeStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.moveTo(sx + ts * 0.2, sy + ts * 0.3); c.lineTo(sx + ts * 0.5, sy + ts * 0.6); c.lineTo(sx + ts * 0.8, sy + ts * 0.5); c.stroke() }
        c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1; c.strokeRect(sx + 0.5, sy + 0.5, ts - 1, ts - 1);
        const cx = sx + ts / 2, cy = sy + ts / 2;
        if (ch === '+') { c.fillStyle = '#5b3b1e'; c.fillRect(sx + ts * 0.12, sy + ts * 0.08, ts * 0.76, ts * 0.84); c.strokeStyle = '#2a1808'; c.lineWidth = 2; c.strokeRect(sx + ts * 0.12, sy + ts * 0.08, ts * 0.76, ts * 0.84); c.fillStyle = '#d9b25c'; c.beginPath(); c.arc(sx + ts * 0.7, cy, 2.4, 0, 7); c.fill() }
        else if (ch === 'L') { c.fillStyle = '#3a2a24'; c.fillRect(sx + ts * 0.1, sy + ts * 0.06, ts * 0.8, ts * 0.88); c.strokeStyle = '#c9a45c'; c.lineWidth = 2; c.strokeRect(sx + ts * 0.1, sy + ts * 0.06, ts * 0.8, ts * 0.88); this.icon('lock', cx, cy, ts * 0.46, '#f0d28a') }
        else if (ch === '/') { c.fillStyle = 'rgba(80,50,20,0.7)'; c.fillRect(sx + ts * 0.04, sy + ts * 0.1, ts * 0.12, ts * 0.8); c.fillRect(sx + ts * 0.84, sy + ts * 0.1, ts * 0.12, ts * 0.8) }
        else if (ch === '>' || ch === '<') {
          const up = ch === '<';
          const g = c.createRadialGradient(cx, cy, 2, cx, cy, ts * 0.6);
          g.addColorStop(0, up ? 'rgba(160,200,255,0.5)' : 'rgba(255,200,120,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g; c.fillRect(sx, sy, ts, ts);
          this.icon(up ? 'stairs_up' : 'stairs', cx, cy, ts * 0.78, up ? '#bcd6ff' : '#ffd9a0');
        }
      }
      if (!v) { c.fillStyle = 'rgba(2,3,8,0.66)'; c.fillRect(sx, sy, ts + 0.5, ts + 0.5) }
      else {
        const d = Math.hypot(i - dx, j - dy);
        const a = Math.max(0, Math.min(0.78, (d / light) ** 1.6 * 0.85));
        c.fillStyle = `rgba(3,3,8,${a})`; c.fillRect(sx, sy, ts + 0.5, ts + 0.5);
      }
    }
    for (const e of f.ents) this.drawEnt(e, f, vis, pal.accent);
    if (this.path.length) { c.fillStyle = 'rgba(255,225,150,0.5)'; this.path.forEach(([i, j]) => { const [sx, sy] = this.screenOf(i + 0.5, j + 0.5); c.beginPath(); c.arc(sx, sy, ts * 0.09, 0, 7); c.fill() }) }
    const [hx, hy] = this.screenOf(dx + 0.5, dy + 0.5);
    const g = c.createRadialGradient(hx, hy, ts * 0.3, hx, hy, ts * light * 0.95);
    g.addColorStop(0, `rgba(${pal.light},0.20)`); g.addColorStop(0.45, `rgba(${pal.light},0.07)`); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, 0, this.w, this.h); c.globalCompositeOperation = 'source-over';
    this.drawHero(dx + 0.5, dy + 0.5, run.facing, false);
    c.restore();
    c.fillStyle = pal.ambient; c.fillRect(0, 0, this.w, this.h);
    this.drawParticles(dt, pal.particle, 0.8);
    this.vignette(0.7);
    this.sanityFx(s);
    if (this.mini) this.minimap(s, f, pal.accent);
  }

  private drawEnt(e: Ent, f: { w: number; seen: string }, vis: Uint8Array, accent: string) {
    if (e.done && e.k !== 'exit') { if (e.k === 'chest') { /* opened chest stays */ } else return }
    if (e.hidden) return;
    const idx = e.y * f.w + e.x;
    if (f.seen[idx] !== '1') return;
    const v = vis[idx] === 1;
    const mobile = e.k === 'enemy' || e.k === 'boss';
    if (mobile && !v) return;
    const ts = this.ts;
    const [sx, sy] = this.screenOf(e.x + 0.5, e.y + 0.5);
    const a = v ? 1 : 0.5;
    const bob = mobile ? Math.sin(this.time * 4 + e.id) * ts * 0.03 : 0;
    switch (e.k) {
      case 'enemy': {
        const def = ENEMY_MAP.get(e.enemy!)!;
        const elite = e.rank === 'elite';
        this.token(def.icon, sx, sy + bob, ts * (elite ? 0.98 : 0.86), { bg: 'rgba(26,6,6,0.92)', ring: elite ? '#b07af0' : '#d8483a', glow: elite ? 'rgba(176,122,240,0.9)' : 'rgba(255,60,40,0.65)', color: elite ? '#e6d2ff' : '#ffd8cc', pulse: e.awake ? 0.06 : 0.0, alpha: a });
        if (!e.awake) this.text('z', sx + ts * 0.36, sy - ts * 0.38 + Math.sin(this.time * 2 + e.id) * 2, 12, '#b8c4e8');
        else this.text('!', sx + ts * 0.36, sy - ts * 0.4, 13, '#ff8070');
        break;
      }
      case 'boss': {
        const def = ENEMY_MAP.get(e.enemy!)!;
        this.token(def.icon, sx, sy + bob, ts * 1.28, { bg: 'rgba(30,20,4,0.94)', ring: '#f0b850', glow: 'rgba(255,190,70,0.95)', color: '#ffe8b0', pulse: 0.07, alpha: a });
        break;
      }
      case 'chest': this.token(e.done ? 'chest_open' : 'chest', sx, sy, ts * 0.72, { bg: 'rgba(30,20,8,0.9)', ring: e.done ? '#6a5a40' : '#f0c060', glow: e.done ? undefined : 'rgba(255,200,90,0.75)', color: e.done ? '#8a7a5a' : '#ffe0a0', alpha: a, pulse: e.done ? 0 : 0.05 }); break;
      case 'trap': this.token('spikes', sx, sy, ts * 0.6, { bg: 'rgba(40,6,6,0.85)', ring: '#c03028', color: '#ff9a88', alpha: a }); break;
      case 'event': this.token('quest', sx, sy, ts * 0.66, { bg: 'rgba(24,10,36,0.9)', ring: '#b07af0', glow: 'rgba(176,122,240,0.9)', color: '#e6d2ff', alpha: a, pulse: 0.08 }); break;
      case 'waystone': this.token('plinth', sx, sy, ts * 0.78, { bg: 'rgba(30,24,6,0.9)', ring: '#ffd870', glow: 'rgba(255,215,110,0.85)', color: '#ffeab0', alpha: a, pulse: 0.05 }); break;
      case 'camp': { this.token('campfire', sx, sy, ts * 0.78, { bg: 'rgba(30,12,4,0.9)', ring: '#ff9a40', glow: `rgba(255,140,60,${0.6 + Math.sin(this.time * 9) * 0.25})`, color: '#ffc880', alpha: a }); break }
      case 'fountain': this.token('fountain', sx, sy, ts * 0.76, { bg: 'rgba(6,20,30,0.9)', ring: '#60c0e8', glow: 'rgba(90,190,240,0.8)', color: '#c0ecff', alpha: a, pulse: 0.04 }); break;
      case 'lore': this.token('lore', sx, sy, ts * 0.66, { bg: 'rgba(20,16,8,0.9)', ring: accent, glow: 'rgba(240,220,160,0.6)', color: '#f4e6c0', alpha: a }); break;
      case 'key': this.token('key', sx, sy, ts * 0.58, { bg: 'rgba(30,24,6,0.9)', ring: '#ffd870', glow: 'rgba(255,215,110,0.9)', color: '#ffe9a0', alpha: a, pulse: 0.1 }); break;
      case 'gold': this.icon('gold_pile', sx, sy, ts * 0.6, '#f0c860', a); break;
      case 'potion': this.icon('potion_pick', sx, sy, ts * 0.56, '#e86a8a', a); break;
      case 'prisoner': this.token('prisoner', sx, sy, ts * 0.7, { bg: 'rgba(20,20,24,0.9)', ring: '#a0a8b8', color: '#d8dce8', alpha: a }); break;
      case 'questitem': this.token('star', sx, sy, ts * 0.74, { bg: 'rgba(30,24,6,0.92)', ring: '#ffd870', glow: 'rgba(255,215,110,1)', color: '#fff0b0', alpha: a, pulse: 0.12 }); break;
      case 'exit': this.token('portal', sx, sy, ts * 0.98, { bg: 'rgba(24,10,40,0.92)', ring: '#c090ff', glow: 'rgba(190,140,255,1)', color: '#eadcff', alpha: a, pulse: 0.1 }); break;
    }
  }

  private minimap(s: GameState, f: { w: number; h: number; tiles: string; seen: string; ents: Ent[] }, accent: string) {
    const c = this.ctx;
    const px = Math.max(2, Math.floor(Math.min(96 / f.w, 78 / f.h)));
    const mw = f.w * px, mh = f.h * px;
    const x0 = this.w - mw - 10, y0 = 10;
    c.save();
    c.globalAlpha = 0.88;
    c.fillStyle = 'rgba(4,4,6,0.72)'; c.fillRect(x0 - 4, y0 - 4, mw + 8, mh + 8);
    c.strokeStyle = 'rgba(201,164,92,0.5)'; c.strokeRect(x0 - 3.5, y0 - 3.5, mw + 7, mh + 7);
    for (let j = 0; j < f.h; j++) for (let i = 0; i < f.w; i++) {
      if (f.seen[j * f.w + i] !== '1') continue;
      const ch = f.tiles[j * f.w + i];
      c.fillStyle = ch === '#' || ch === 'S' ? '#1c1c24' : ch === '>' ? '#ffd9a0' : ch === '<' ? '#bcd6ff' : ch === '+' || ch === 'L' ? '#9a6a30' : '#5a5a68';
      c.fillRect(x0 + i * px, y0 + j * px, px, px);
    }
    f.ents.forEach(e => { if (e.done || e.hidden || f.seen[e.y * f.w + e.x] !== '1') return; if (e.k === 'chest' || e.k === 'waystone' || e.k === 'camp' || e.k === 'exit' || e.k === 'questitem' || e.k === 'boss') { c.fillStyle = e.k === 'boss' ? '#ff5040' : accent; c.fillRect(x0 + e.x * px, y0 + e.y * px, px, px) } });
    c.fillStyle = '#ffe9a0';
    c.fillRect(x0 + s.run!.px * px - 0.5, y0 + s.run!.py * px - 0.5, px + 1, px + 1);
    c.restore();
  }
}

// ---------------------------------------------------------- full map view

export interface MapHit { id: string; kind: 'town' | 'dungeon' | 'landmark'; x: number; y: number }

export function drawFullMap(cv: HTMLCanvasElement, s: GameState, time: number): { hits: MapHit[]; scale: number; ox: number; oy: number } {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = cv.getBoundingClientRect();
  const W = Math.max(200, Math.round(r.width)), H = Math.max(200, Math.round(r.height));
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr) }
  const c = cv.getContext('2d')!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const scale = Math.min(W / MAP_W, H / MAP_H);
  const ox = (W - MAP_W * scale) / 2, oy = (H - MAP_H * scale) / 2;
  c.fillStyle = '#050506';
  c.fillRect(0, 0, W, H);
  const wm = getWorld();
  const MC: Record<string, string> = { p: '#46583a', f: '#2e4a34', F: '#3a2c26', a: '#4a3f36', h: '#5a5440', b: '#6e654c', n: '#c4d0dc', x: '#38493c', c: '#54401f', w: '#173a4c', r: '#b09a68', B: '#8a6a3a', M: '#5a5a66', N: '#e0e8f0', O: '#a09a7c', Z: '#4a3a10', G: '#c03028', H: '#8a3a8a' };
  for (let j = 0; j < MAP_H; j++) for (let i = 0; i < MAP_W; i++) {
    const ex = isExplored(s, i, j);
    c.fillStyle = ex ? MC[wm.tiles[worldIdx(i, j)]] ?? '#333' : '#0b0c0f';
    c.fillRect(ox + i * scale, oy + j * scale, scale + 0.6, scale + 0.6);
  }
  const hits: MapHit[] = [];
  const obj = objectiveTarget(s);
  const icon = (name: string, cx: number, cy: number, sz: number, color: string) => {
    const p = iconPath(name);
    if (!p) return;
    c.save(); c.translate(cx - sz / 2, cy - sz / 2); c.scale(sz / 512, sz / 512); c.fillStyle = color; c.fill(p); c.restore();
  };
  wm.poi.forEach((poi, idx) => {
    const i = idx % MAP_W, j = Math.floor(idx / MAP_W);
    const cx = ox + (i + 0.5) * scale, cy = oy + (j + 0.5) * scale;
    let show = false, name = '', ic = 'm_town', col = '#f0d28a', size = scale * 1.6;
    if (poi.kind === 'town' && s.world.known.includes(poi.id)) { const t = TOWN_MAP.get(poi.id)!; show = true; name = t.name; ic = t.kind === 'city' ? 'm_city' : 'm_town'; size = scale * (t.kind === 'city' ? 2.6 : 1.9); col = s.world.visited.includes(poi.id) ? '#ffe3a0' : '#c9b48a' }
    else if (poi.kind === 'dungeon' && s.world.known.includes(poi.id)) { const d = DUNGEON_MAP.get(poi.id)!; show = true; name = d.name; ic = d.icon ?? 'm_dungeon'; col = s.cleared.includes(poi.id) ? '#8fd68a' : '#e0604e'; size = scale * (d.mainBoss ? 2.2 : 1.7) }
    if (!show) return;
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.beginPath(); c.arc(cx, cy, size * 0.62, 0, 7); c.fill();
    icon(ic, cx, cy, size, col);
    if (poi.kind === 'town') {
      c.font = `600 ${Math.max(9, scale * 1.15)}px Cinzel, serif`; c.textAlign = 'center'; c.textBaseline = 'top';
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.9)'; c.strokeText(name, cx, cy + size * 0.6); c.fillStyle = '#f6e6c0'; c.fillText(name, cx, cy + size * 0.6);
    }
    hits.push({ id: poi.id, kind: poi.kind, x: cx, y: cy });
  });
  if (obj) {
    const cx = ox + (obj.pos[0] + 0.5) * scale, cy = oy + (obj.pos[1] + 0.5) * scale;
    c.strokeStyle = `rgba(255,215,110,${0.6 + Math.sin(time * 4) * 0.3})`; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, scale * (1.8 + Math.sin(time * 3) * 0.3), 0, 7); c.stroke();
  }
  const px = ox + (s.world.x + 0.5) * scale, py = oy + (s.world.y + 0.5) * scale;
  c.fillStyle = 'rgba(255,220,140,0.3)'; c.beginPath(); c.arc(px, py, scale * (1.6 + Math.sin(time * 5) * 0.3), 0, 7); c.fill();
  c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(px, py, scale * 0.8, 0, 7); c.fill();
  c.strokeStyle = '#000'; c.lineWidth = 1.5; c.stroke();
  return { hits, scale, ox, oy };
}
