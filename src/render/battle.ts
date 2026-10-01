import { creatureSpec, drawCreature, type CreatureSpec, type CreatureState } from '../art/creatures';
import { drawFigure } from '../art/figures';
import { sceneSpec } from '../art/catalog';
import { SceneView } from '../art/scene';
import { clamp, glow, lerp, rgba, rngOf, vgrad } from '../art/util';
import type { Anim, Enemy, GameState, School, Status } from '../types';

const W = 640, H = 400;
const SCHOOL_COL: Record<School, [string, string]> = {
  Steel: ['#e8eef8', '#9aa8c0'], Hex: ['#c890ff', '#5a2a9a'], Shadow: ['#9a8ab8', '#1a1226'], Sanguine: ['#ff5a5a', '#7a0e14'], Discipline: ['#ffe9a0', '#c8a040'],
  Astral: ['#a8c8ff', '#5a6ad8'], Ash: ['#ffb060', '#e0501a'], Glass: ['#ffd8f0', '#6ac8ff'], Tide: ['#7ae0ff', '#1a6aa8'], Verdant: ['#a8f070', '#2a7a2a'],
  Gear: ['#ffd070', '#8a5a22'], Frost: ['#e0f8ff', '#6aaee8'], Deep: ['#6af0e0', '#0a3a4a'],
};
const STATUS_COL: Record<Status, string> = { bleed: '#d8202a', burn: '#ff8a30', stun: '#ffe060', ward: '#7ac8ff', weak: '#a08a70', marked: '#ff5a5a', poison: '#8ee050', chill: '#a8e0ff', regen: '#7aff9a' };

interface Fx { t0: number; dur: number; draw: (ctx: CanvasRenderingContext2D, k: number, t: number) => void }
interface Pt { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; c: string; g: number; add: boolean; shape: 'dot' | 'shard' | 'leaf' | 'cog' | 'drop' }
interface Txt { x: number; y: number; t0: number; text: string; c: string; size: number; crit: boolean; dur: number; vx: number }

const FOE: { x: number; y: number } = { x: W * 0.6, y: H * 0.9 };
const HERO: { x: number; y: number } = { x: W * 0.16, y: H * 0.98 };

export class BattleStage {
  readonly cv = document.createElement('canvas');
  private ctx = this.cv.getContext('2d')!;
  private bg: SceneView | null = null;
  private bgKey = '';
  private foe: CreatureSpec | null = null;
  private foeId = '';
  private foeS: CreatureState = { t: 0, lunge: 0, hit: 0, die: 0 };
  private heroS = { lunge: 0, hit: 0, cast: 0, guard: 0, dodge: 0, die: 0, x: 0 };
  private fx: Fx[] = [];
  private parts: Pt[] = [];
  private texts: Txt[] = [];
  private queue: { at: number; a: Anim }[] = [];
  private clock = 0;
  private last = 0;
  private raf = 0;
  private shake = 0;
  private flash: { c: string; a: number } = { c: '#fff', a: 0 };
  private zoom = 0;
  private stop = 0;
  private tint: { c: string; a: number } = { c: '#000', a: 0 };
  private path = 'Vanguard';
  private rnd = Math.random;
  enemy: Enemy | null = null;
  heroStatus: Partial<Record<Status, number>> = {};
  private ro: ResizeObserver | null = null;
  reduced = false;

  constructor(private get: () => GameState) {
    this.cv.className = 'battle-cv';
    this.cv.width = W; this.cv.height = H;
    this.cv.setAttribute('aria-label', 'Battle');
  }

  attach(host: HTMLElement) {
    if (this.cv.parentElement !== host) host.appendChild(this.cv);
    this.ro?.disconnect();
    if (!this.raf) this.raf = requestAnimationFrame(t => this.loop(t));
  }
  detach() { this.ro?.disconnect() }

  /** Begin (or continue) a fight. Safe to call every render. */
  setFoe(e: Enemy, bgKey: string, path: string) {
    this.enemy = e;
    this.path = path;
    if (this.foeId !== `${e.id}:${e.rank}:${e.lvl}:${e.maxHp}`) {
      this.foeId = `${e.id}:${e.rank}:${e.lvl}:${e.maxHp}`;
      this.foe = creatureSpec({ id: e.id, name: e.name, tags: e.tags, role: 'brute', look: e.look }, e.rank);
      this.foeS = { t: 0, lunge: 0, hit: 0, die: 0 };
      this.heroS = { lunge: 0, hit: 0, cast: 0, guard: 0, dodge: 0, die: 0, x: 0 };
      this.fx = []; this.parts = []; this.texts = []; this.queue = [];
      if (e.rank === 'boss') { this.flashScreen('#f0b850', 0.5); this.shake = 0.5 }
    }
    if (this.bgKey !== bgKey) { this.bgKey = bgKey; this.bg = new SceneView(sceneSpec(bgKey), 480, 300) }
  }

  /** Queue the presentation events produced by the engine for one action. */
  consume(anims: Anim[]) {
    let at = Math.max(this.clock, this.queue.length ? this.queue[this.queue.length - 1].at : 0) + 0.02;
    for (const a of anims) {
      this.queue.push({ at, a });
      at += a.t === 'skill' ? 0.5 : a.t === 'hit' ? (a.crit ? 0.32 : 0.16) : a.t === 'item' ? 0.5 : a.t === 'enemyAct' ? 0.42 : a.t === 'status' ? 0.12 : a.t === 'tick' ? 0.22 : a.t === 'heal' ? 0.1 : a.t === 'die' ? 0.5 : 0.18;
      if (a.t === 'enemyAct' && a.kind !== 'guard') at += 0.1;
    }
  }
  /** Seconds until everything queued has finished playing. */
  busy() { return Math.max(0, (this.queue.length ? this.queue[this.queue.length - 1].at : 0) + 0.9 - this.clock) }

  private flashScreen(c: string, a: number) { this.flash = { c, a } }
  private text(x: number, y: number, text: string, c: string, size = 26, crit = false, vx = 0) { this.texts.push({ x, y, t0: this.clock, text, c, size, crit, dur: crit ? 1.35 : 1.0, vx }) }
  private add(t0: number, dur: number, draw: Fx['draw']) { this.fx.push({ t0, dur, draw }) }
  private burst(x: number, y: number, c: string, n: number, speed = 160, o: Partial<Pt> = {}) {
    for (let i = 0; i < n; i++) {
      const a = this.rnd() * Math.PI * 2, sp = speed * (0.3 + this.rnd());
      this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: 0, max: 0.5 + this.rnd() * 0.6, s: 2 + this.rnd() * 3, c, g: 260, add: true, shape: 'dot', ...o });
    }
  }

  // --------------------------------------------------------------- playback
  private play(a: Anim) {
    const e = this.foe;
    const fx = FOE.x, fy = FOE.y - 110;
    const hx = HERO.x + 30, hy = HERO.y - 90;
    switch (a.t) {
      case 'hit': {
        const col = a.element === 'burn' ? '#ff9a40' : a.element === 'poison' ? '#9ae050' : a.element === 'bleed' ? '#e02a30' : a.element === 'chill' ? '#a8e0ff' : a.element === 'pierce' ? '#d8c8ff' : '#ffffff';
        this.foeS.hit = 1; this.foeS.lunge = Math.max(0, this.foeS.lunge - 0.2);
        this.heroS.lunge = a.crit ? 0.9 : 0.6;
        this.slash(fx, fy, col, a.crit ? 1.4 : 1, a.crit);
        this.burst(fx, fy, col, a.crit ? 26 : 10, a.crit ? 260 : 150);
        this.text(fx + (this.rnd() - 0.5) * 70, fy - 30, a.crit ? `${a.dmg}!` : `${a.dmg}`, a.crit ? '#ffd24a' : a.element === 'plain' ? '#ffffff' : col, a.crit ? 44 : 26, a.crit);
        this.shake = Math.max(this.shake, a.crit ? 0.7 : 0.25);
        if (a.crit) { this.stop = 0.1; this.zoom = 1; this.flashScreen('#fff0b0', 0.55); this.starburst(fx, fy, '#ffd24a') }
        break;
      }
      case 'skill': this.skillFx(a, fx, fy, hx, hy); break;
      case 'item': this.itemFx(a, fx, fy, hx, hy); break;
      case 'enemyAct': {
        if (a.kind === 'guard') { this.shieldRing(fx, fy + 20, '#7ac8ff'); break }
        this.foeS.lunge = a.kind === 'heavy' ? 1 : 0.7;
        if (a.dodged) { this.heroS.dodge = 1; this.text(hx + 20, hy - 40, 'DODGE', '#d8e8ff', 24); this.burst(hx, hy + 30, '#bcd4ff', 10, 120); break }
        if (a.blocked) { this.shieldRing(hx, hy + 10, '#9ad0ff'); this.text(hx + 10, hy - 40, 'BLOCK', '#9ad0ff', 22); break }
        this.heroS.hit = 1;
        if (a.kind === 'dread') { this.tint = { c: '#7a2ad0', a: 0.5 }; for (let i = 0; i < 4; i++) this.ring(hx, hy, '#b080ff', 0.1 * i, 120 + i * 20); this.shake = Math.max(this.shake, 0.3) }
        else { this.slash(hx, hy, a.kind === 'afflict' ? '#9ae050' : '#ff6a5a', a.kind === 'heavy' ? 1.5 : 1, false, true); this.shake = Math.max(this.shake, a.kind === 'heavy' ? 0.8 : 0.4); this.flashScreen('#ff2a1a', a.kind === 'heavy' ? 0.35 : 0.2) }
        if (a.kind === 'heavy') { this.ring(hx, hy + 30, '#ffb08a', 0, 150); this.stop = 0.07 }
        this.burst(hx, hy, '#ff4a3a', a.kind === 'heavy' ? 22 : 10, 170);
        this.text(hx + 10, hy - 50, `−${a.dmg}`, '#ff6a5a', a.kind === 'heavy' ? 38 : 28, a.kind === 'heavy');
        break;
      }
      case 'status': {
        const col = STATUS_COL[a.status];
        const [x, y] = a.who === 'enemy' ? [fx, fy] : [hx, hy];
        this.ring(x, y, col, 0, 90); this.burst(x, y, col, 14, 120);
        this.text(x, y - 80, a.status.toUpperCase(), col, 18);
        break;
      }
      case 'tick': {
        const col = STATUS_COL[a.status];
        const [x, y] = a.who === 'enemy' ? [fx, fy] : [hx, hy];
        this.burst(x, y, col, 8, 90);
        if (a.who === 'enemy') { this.foeS.hit = Math.max(this.foeS.hit, 0.4); this.text(x + (this.rnd() - 0.5) * 50, y - 20, `${a.dmg}`, col, 22) } else { this.heroS.hit = Math.max(this.heroS.hit, 0.4); this.text(x + 10, y - 40, `−${a.dmg}`, col, 22) }
        break;
      }
      case 'heal': {
        const col = a.kind === 'hp' ? '#6aff9a' : '#b89aff';
        for (let i = 0; i < 12; i++) this.parts.push({ x: hx + (this.rnd() - 0.5) * 50, y: hy + 50 + this.rnd() * 20, vx: (this.rnd() - 0.5) * 16, vy: -50 - this.rnd() * 50, life: 0, max: 1 + this.rnd() * 0.6, s: 2 + this.rnd() * 2.5, c: col, g: -20, add: true, shape: 'dot' });
        this.ring(hx, hy + 20, col, 0, 70);
        this.text(hx + 30, hy - 30, `+${a.n}${a.kind === 'sanity' ? '◉' : ''}`, col, 24);
        break;
      }
      case 'guard': this.heroS.guard = 1; this.shieldRing(hx, hy + 10, '#9ad0ff'); break;
      case 'dodge': this.heroS.dodge = 1; break;
      case 'companion': this.text(HERO.x + 90, HERO.y - 60, a.name, '#d8e8c0', 16); this.burst(HERO.x + 100, HERO.y - 40, '#d8e8c0', 12, 110); break;
      case 'die': {
        if (this.enemy && this.enemy.hp <= 0) {
          this.foeS.die = 0.001;
          const c = this.foe?.g ?? '#fff';
          this.burst(fx, fy + 20, c, 60, 220); this.ring(fx, fy + 20, c, 0, 200); this.flashScreen('#ffffff', 0.4); this.shake = 0.8; this.stop = 0.08;
        } else this.heroS.die = 0.001;
        break;
      }
      case 'flee': this.burst(HERO.x + 30, HERO.y - 40, '#8a8a98', 24, 120, { add: false }); break;
      case 'enrage': this.tint = { c: '#c01010', a: 0.5 }; this.shake = 0.6; break;
    }
    void e;
  }

  private slash(x: number, y: number, c: string, size: number, crit: boolean, toHero = false) {
    const ang = toHero ? -0.6 + this.rnd() * 0.3 : -2.5 + this.rnd() * 0.5;
    const len = 130 * size;
    this.add(this.clock, 0.28, (ctx, k) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.globalCompositeOperation = 'lighter';
      const w = len * (0.25 + k * 0.75);
      ctx.fillStyle = rgba(c, 0.9 * (1 - k));
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(0, -12 * size, w, 0); ctx.quadraticCurveTo(0, 5 * size, -w, 0); ctx.fill();
      if (crit) { ctx.rotate(1.1); ctx.beginPath(); ctx.moveTo(-w * 0.8, 0); ctx.quadraticCurveTo(0, -9, w * 0.8, 0); ctx.quadraticCurveTo(0, 4, -w * 0.8, 0); ctx.fill() }
      ctx.restore();
    });
  }
  private starburst(x: number, y: number, c: string) {
    this.add(this.clock, 0.45, (ctx, k) => {
      ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(c, 0.9 * (1 - k)); ctx.lineWidth = 3 * (1 - k) + 1;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r0 = 20 + k * 40, r1 = r0 + 40 + k * 120; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke() }
      ctx.restore();
    });
  }
  private ring(x: number, y: number, c: string, delay = 0, r = 100) {
    this.add(this.clock + delay, 0.5, (ctx, k) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(c, 0.8 * (1 - k)); ctx.lineWidth = 4 * (1 - k) + 1;
      ctx.beginPath(); ctx.ellipse(x, y, r * k, r * k * 0.7, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });
  }
  private shieldRing(x: number, y: number, c: string) {
    this.add(this.clock, 0.55, (ctx, k) => {
      ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(c, 0.85 * (1 - k * k)); ctx.lineWidth = 3;
      const r = 54 + k * 8;
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + k; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.15) } ctx.closePath(); ctx.stroke();
      ctx.fillStyle = rgba(c, 0.18 * (1 - k)); ctx.fill(); ctx.restore();
    });
  }

  private skillFx(a: Extract<Anim, { t: 'skill' }>, fx: number, fy: number, hx: number, hy: number) {
    const [c1, c2] = SCHOOL_COL[a.school] ?? SCHOOL_COL.Steel;
    this.heroS.cast = 1;
    const n = Math.max(1, a.hits);
    const ex = fx, ey = fy;
    const school = a.school;
    const rise = (x: number, y: number, c: string, count: number) => { for (let i = 0; i < count; i++) this.parts.push({ x: x + (this.rnd() - 0.5) * 60, y: y + 40, vx: (this.rnd() - 0.5) * 20, vy: -70 - this.rnd() * 60, life: 0, max: 1.1, s: 2 + this.rnd() * 3, c, g: -10, add: true, shape: 'dot' }) };
    switch (school) {
      case 'Steel': for (let i = 0; i < n; i++) this.add(this.clock + i * 0.08, 0.3, (ctx, k) => { ctx.save(); ctx.translate(ex, ey); ctx.rotate(-0.9 + i * 0.7); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('#fff', 0.95 * (1 - k)); ctx.lineWidth = 6 * (1 - k) + 1; ctx.beginPath(); ctx.arc(0, 0, 90, -0.5, -0.5 + 1.9 * Math.min(1, k * 1.5)); ctx.stroke(); ctx.restore() }); this.burst(ex, ey, '#ffe0a0', 14, 220); break;
      case 'Hex': this.add(this.clock, 0.7, (ctx, k) => { ctx.save(); ctx.translate(ex, ey + 60); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(c1, 0.9 * (1 - k)); ctx.lineWidth = 2.4; ctx.rotate(k * 3); ctx.beginPath(); ctx.arc(0, 0, 70 + k * 20, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); for (let i = 0; i < 3; i++) { const t = (i / 3) * Math.PI * 2; ctx.lineTo(Math.cos(t) * 66, Math.sin(t) * 66) } ctx.closePath(); ctx.stroke(); ctx.restore() }); this.burst(ex, ey, c1, 22, 150); this.tint = { c: '#5a2a9a', a: 0.3 }; break;
      case 'Shadow': for (let i = 0; i < Math.max(3, n); i++) this.add(this.clock + i * 0.06, 0.25, (ctx, k) => { const y = ey - 60 + i * 24; ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = rgba('#d8d0f0', 0.9 * (1 - k)); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(hx + 60 + (ex - hx - 60) * k, y); ctx.lineTo(hx + 20 + (ex - hx) * k, y + 10); ctx.stroke(); ctx.restore() }); this.burst(ex, ey, '#6a5a8a', 18, 120, { add: false, s: 6 }); break;
      case 'Sanguine': this.burst(ex, ey, '#d01a22', 24, 200, { add: false }); for (let i = 0; i < 14; i++) this.parts.push({ x: ex + (this.rnd() - 0.5) * 40, y: ey + 30, vx: (hx - ex) * 0.9 + (this.rnd() - 0.5) * 40, vy: (hy - ey) * 0.9 + (this.rnd() - 0.5) * 60, life: 0, max: 0.9, s: 3, c: '#ff4a52', g: 0, add: true, shape: 'dot' }); break;
      case 'Discipline': for (let i = 0; i < 4; i++) this.ring(hx, hy + 20, c1, i * 0.1, 130); rise(hx, hy, c1, 14); break;
      case 'Astral': for (let i = 0; i < 8; i++) this.parts.push({ x: ex - 80 + this.rnd() * 160, y: ey - 220 - this.rnd() * 60, vx: 40, vy: 500, life: 0, max: 0.5 + this.rnd() * 0.2, s: 3, c: '#e8f0ff', g: 0, add: true, shape: 'dot' }); this.burst(ex, ey, c1, 28, 240); this.flashScreen('#a8c8ff', 0.3); break;
      case 'Ash': this.burst(ex, ey, '#ff8a30', 40, 240); this.burst(ex, ey, '#ffd890', 16, 160); this.flashScreen('#ff7a20', 0.3); this.ring(ex, ey + 40, '#ff8a30', 0, 140); break;
      case 'Glass': for (let i = 0; i < 18; i++) this.parts.push({ x: ex, y: ey, vx: (this.rnd() - 0.5) * 420, vy: (this.rnd() - 0.7) * 320, life: 0, max: 0.8, s: 5 + this.rnd() * 6, c: ['#ffd8f0', '#6ac8ff', '#ffe08a'][i % 3], g: 400, add: true, shape: 'shard' }); this.flashScreen('#fff4ff', 0.3); break;
      case 'Tide': this.add(this.clock, 0.6, (ctx, k) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(c1, 0.8 * (1 - k)); ctx.lineWidth = 12 * (1 - k) + 2; ctx.beginPath(); ctx.moveTo(hx + 40, ey + 40); ctx.bezierCurveTo(hx + 120, ey - 60 + k * 30, ex - 60, ey + 100, ex + 30 * k, ey + 10); ctx.stroke(); ctx.restore() }); this.burst(ex, ey + 30, '#7ae0ff', 26, 160, { shape: 'drop' }); break;
      case 'Verdant': for (let i = 0; i < 20; i++) this.parts.push({ x: ex + (this.rnd() - 0.5) * 120, y: ey + 90, vx: (this.rnd() - 0.5) * 60, vy: -140 - this.rnd() * 160, life: 0, max: 0.9, s: 6, c: i % 3 ? '#8ee050' : '#2a7a2a', g: 200, add: false, shape: 'leaf' }); break;
      case 'Gear': for (let i = 0; i < 6; i++) this.parts.push({ x: ex + (this.rnd() - 0.5) * 100, y: ey + (this.rnd() - 0.5) * 80, vx: (this.rnd() - 0.5) * 120, vy: -50 - this.rnd() * 60, life: 0, max: 0.9, s: 9 + this.rnd() * 6, c: c1, g: 120, add: false, shape: 'cog' }); this.burst(ex, ey, '#ffe0a0', 20, 200); break;
      case 'Frost': for (let i = 0; i < 9; i++) this.parts.push({ x: hx + 60, y: hy + 20 + (this.rnd() - 0.5) * 60, vx: (ex - hx) * 2.4, vy: (this.rnd() - 0.5) * 30, life: 0, max: 0.38, s: 6, c: '#e0f8ff', g: 0, add: true, shape: 'shard' }); this.burst(ex, ey, '#c8f0ff', 26, 170); this.flashScreen('#d8f4ff', 0.25); break;
      case 'Deep': for (let i = 0; i < 14; i++) { const ang = (i / 14) * Math.PI * 2; this.parts.push({ x: ex + Math.cos(ang) * 150, y: ey + Math.sin(ang) * 100, vx: -Math.cos(ang) * 260, vy: -Math.sin(ang) * 170, life: 0, max: 0.55, s: 4, c: '#6af0e0', g: 0, add: true, shape: 'dot' }) } this.tint = { c: '#04141a', a: 0.45 }; break;
    }
    void c2;
    if (a.crit) this.flashScreen('#fff0b0', 0.3);
  }

  private itemFx(a: Extract<Anim, { t: 'item' }>, fx: number, fy: number, hx: number, hy: number) {
    const toFoe = a.kind === 'bomb' || a.kind === 'fire' || a.kind === 'poison' || a.kind === 'stun';
    if (toFoe) {
      const x0 = hx + 40, y0 = hy;
      this.add(this.clock, 0.4, (ctx, k) => { const x = lerp(x0, fx, k), y = lerp(y0, fy, k) - Math.sin(k * Math.PI) * 90; ctx.fillStyle = '#d8c8a0'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff9a40'; ctx.fillRect(x - 1, y - 10, 2, 5) });
      this.add(this.clock + 0.4, 0.5, (ctx, k) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, fx, fy, 120 * (0.4 + k), a.kind === 'poison' ? '#8ee050' : a.kind === 'stun' ? '#ffe060' : '#ff9a40', 0.9 * (1 - k)); ctx.restore() });
      this.burst(fx, fy, a.kind === 'poison' ? '#8ee050' : a.kind === 'stun' ? '#ffe060' : '#ffb060', 30, 260, { /* delayed visually by the arc */ });
      this.shake = Math.max(this.shake, 0.5);
    } else if (a.kind === 'smoke') this.burst(hx, hy, '#7a7a88', 40, 130, { add: false, s: 10 });
    else if (a.kind === 'heal' || a.kind === 'sanity' || a.kind === 'cleanse' || a.kind === 'ward') {
      const c = a.kind === 'heal' ? '#6aff9a' : a.kind === 'sanity' ? '#b89aff' : a.kind === 'ward' ? '#7ac8ff' : '#fff0b0';
      this.ring(hx, hy + 30, c, 0, 90); if (a.kind === 'ward') this.shieldRing(hx, hy + 10, c);
    }
  }

  // ------------------------------------------------------------------ frame
  private loop(now: number) {
    this.raf = requestAnimationFrame(t => this.loop(t));
    if (!this.cv.isConnected) { this.last = now; return }
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    this.step(dt);
    this.draw();
  }

  private step(dtRaw: number) {
    const dt = this.stop > 0 ? 0.0001 : dtRaw;
    this.stop = Math.max(0, this.stop - dtRaw);
    this.clock += dtRaw;
    while (this.queue.length && this.queue[0].at <= this.clock) this.play(this.queue.shift()!.a);
    const f = this.foeS, h = this.heroS;
    f.t += dt;
    f.lunge = Math.max(0, f.lunge - dt * 2.8);
    f.hit = Math.max(0, f.hit - dtRaw * 4);
    if (f.die > 0) f.die = Math.min(1, f.die + dtRaw * 1.1);
    h.lunge = Math.max(0, h.lunge - dtRaw * 3);
    h.hit = Math.max(0, h.hit - dtRaw * 3.5);
    h.cast = Math.max(0, h.cast - dtRaw * 2.5);
    h.guard = Math.max(0, h.guard - dtRaw * 1.6);
    h.dodge = Math.max(0, h.dodge - dtRaw * 2.2);
    if (h.die > 0) h.die = Math.min(1, h.die + dtRaw * 1.1);
    this.shake = Math.max(0, this.shake - dtRaw * 1.9);
    this.flash.a = Math.max(0, this.flash.a - dtRaw * 2.4);
    this.tint.a = Math.max(0, this.tint.a - dtRaw * 0.9);
    this.zoom = Math.max(0, this.zoom - dtRaw * 4);
    // particles
    for (const p of this.parts) { p.life += dtRaw; p.x += p.vx * dtRaw; p.y += p.vy * dtRaw; p.vy += p.g * dtRaw }
    this.parts = this.parts.filter(p => p.life < p.max);
    this.texts = this.texts.filter(t => this.clock - t.t0 < t.dur);
    this.fx = this.fx.filter(x => this.clock - x.t0 < x.dur);
    // persistent status particles
    const e = this.enemy;
    if (e && f.die === 0 && Math.random() < dtRaw * 26) {
      const fx = FOE.x + (Math.random() - 0.5) * 90, fy = FOE.y - 40 - Math.random() * 120;
      if (e.status.burn) this.parts.push({ x: fx, y: fy, vx: (Math.random() - 0.5) * 20, vy: -70 - Math.random() * 40, life: 0, max: 0.8, s: 3 + Math.random() * 3, c: Math.random() < 0.5 ? '#ff8a30' : '#ffd070', g: -60, add: true, shape: 'dot' });
      if (e.status.poison) this.parts.push({ x: fx, y: FOE.y - 20, vx: (Math.random() - 0.5) * 16, vy: -30 - Math.random() * 30, life: 0, max: 1.2, s: 3 + Math.random() * 4, c: '#8ee050', g: -10, add: false, shape: 'dot' });
      if (e.status.bleed) this.parts.push({ x: fx, y: fy, vx: 0, vy: 40, life: 0, max: 0.8, s: 2, c: '#c01820', g: 300, add: false, shape: 'drop' });
      if (e.status.chill) this.parts.push({ x: fx, y: fy, vx: (Math.random() - 0.5) * 14, vy: 20, life: 0, max: 1.1, s: 3, c: '#c8f0ff', g: 0, add: true, shape: 'shard' });
    }
    if (this.heroStatus.regen && Math.random() < dtRaw * 10) this.parts.push({ x: HERO.x + 30 + (Math.random() - 0.5) * 40, y: HERO.y - 20, vx: 0, vy: -50, life: 0, max: 1, s: 2.4, c: '#7aff9a', g: -10, add: true, shape: 'dot' });
    if (this.heroStatus.burn && Math.random() < dtRaw * 18) this.parts.push({ x: HERO.x + 30 + (Math.random() - 0.5) * 40, y: HERO.y - 40 - Math.random() * 60, vx: 0, vy: -70, life: 0, max: 0.7, s: 3, c: '#ff8a30', g: -40, add: true, shape: 'dot' });
    this.heroStatus = this.get().status;
    this.bg?.draw(dtRaw);
  }

  private draw() {
    const ctx = this.ctx;
    const e = this.enemy;
    const f = this.foeS, h = this.heroS;
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    const z = 1 + this.zoom * 0.05;
    const sx = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 18 : 0, sy = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 12 : 0;
    ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    if (this.bg) { ctx.drawImage(this.bg.cv, 0, 0, W, H); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(0, 0, W, H) }
    else { ctx.fillStyle = '#100a0a'; ctx.fillRect(0, 0, W, H) }
    // floor haze so the figures read against any background
    ctx.fillStyle = vgrad(ctx, H * 0.7, H, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.55)']]); ctx.fillRect(0, H * 0.7, W, H * 0.3);
    // foe
    if (this.foe && e) {
      const st: CreatureState = { ...f, enrage: e.rank === 'boss' && e.hp < e.maxHp / 2 };
      ctx.save();
      ctx.translate(FOE.x - W / 2 + 0, 0);
      const stunned = e.status.stun;
      if (e.status.weak) ctx.filter = 'saturate(0.45) brightness(0.85)';
      drawCreature(ctx, W, H, this.foe, st);
      ctx.filter = 'none';
      this.foeOverlays(ctx, e, stunned ?? 0);
      ctx.restore();
    }
    // hero
    this.drawHero(ctx, h);
    // fx
    this.fx.forEach(x => { if (this.clock < x.t0) return; x.draw(ctx, clamp((this.clock - x.t0) / x.dur), this.clock) });
    this.drawParts(ctx);
    ctx.restore();
    // screen-space overlays
    if (this.tint.a > 0) { ctx.fillStyle = rgba(this.tint.c, this.tint.a * 0.55); ctx.fillRect(0, 0, W, H) }
    if (this.flash.a > 0) { ctx.fillStyle = rgba(this.flash.c, this.flash.a * 0.7); ctx.fillRect(0, 0, W, H) }
    if (this.heroS.hit > 0.2) { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85); g.addColorStop(0, 'rgba(160,0,0,0)'); g.addColorStop(1, `rgba(200,10,10,${this.heroS.hit * 0.55})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H) }
    this.drawTexts(ctx);
  }

  private foeOverlays(ctx: CanvasRenderingContext2D, e: Enemy, stunned: number) {
    const cx = W / 2, cy = H * 0.9 - 130;
    if (stunned) { for (let i = 0; i < 3; i++) { const a = this.clock * 3 + (i / 3) * Math.PI * 2; ctx.fillStyle = '#ffe060'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 46, cy - 90 + Math.sin(a) * 12, 5, 0, Math.PI * 2); ctx.fill() } }
    if (e.status.ward) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('#7ac8ff', 0.5 + Math.sin(this.clock * 4) * 0.15); ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + this.clock * 0.4; ctx.lineTo(cx + Math.cos(a) * 110, cy + 20 + Math.sin(a) * 130) } ctx.closePath(); ctx.stroke(); ctx.fillStyle = rgba('#7ac8ff', 0.07); ctx.fill(); ctx.restore() }
    if (e.status.marked) { ctx.save(); ctx.translate(cx, cy + 10); ctx.rotate(this.clock * 0.6); ctx.strokeStyle = rgba('#ff5a5a', 0.85); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.moveTo(-70, 0); ctx.lineTo(-38, 0); ctx.moveTo(70, 0); ctx.lineTo(38, 0); ctx.moveTo(0, -70); ctx.lineTo(0, -38); ctx.moveTo(0, 70); ctx.lineTo(0, 38); ctx.stroke(); ctx.restore() }
    if (e.status.chill) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(cx, cy + 20, 10, cx, cy + 20, 130); g.addColorStop(0, 'rgba(150,220,255,.22)'); g.addColorStop(1, 'rgba(150,220,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + 20, 130, 150, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(210,240,255,.7)';
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + 0.4, d = 70 + (i % 3) * 18, x = cx + Math.cos(a) * d, y = cy + 30 + Math.sin(a) * d * 0.9; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 8); ctx.lineTo(x - 5, y); ctx.closePath(); ctx.fill() }
    }
  }

  private drawHero(ctx: CanvasRenderingContext2D, h: BattleStage['heroS']) {
    const lunge = Math.sin(clamp(h.lunge) * Math.PI) * 60;
    const dodge = Math.sin(clamp(h.dodge) * Math.PI) * -34;
    const recoil = h.hit * -16;
    const die = clamp(h.die);
    ctx.save();
    ctx.globalAlpha = 1 - die * 0.8;
    ctx.translate(HERO.x + lunge + dodge + recoil, HERO.y + die * 18);
    if (die > 0) ctx.rotate(-die * 1.2);
    if (h.hit > 0) ctx.filter = `brightness(${1 + h.hit * 1.3}) sepia(${h.hit * 0.8}) hue-rotate(-30deg)`;
    drawFigure(ctx, { x: 0, y: 0, h: H * 0.5, look: 'hood', c: '#2c2422', lantern: '#ffb860', weapon: this.path === 'Hexer' ? 'staff' : 'blade', back: true, rim: '#ffb860', accent: '#b080ff', sway: 0.5 + Math.sin(this.clock * 1.4) * 0.5 });
    ctx.filter = 'none';
    if (h.cast > 0) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, 40, -H * 0.3, 80 * h.cast + 30, '#ffe0a0', 0.5 * h.cast); ctx.globalCompositeOperation = 'source-over' }
    if (h.guard > 0 || this.heroStatus.ward) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('#7ac8ff', 0.5 + h.guard * 0.4); ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.lineTo(Math.cos(a) * 66, -H * 0.22 + Math.sin(a) * 78) } ctx.closePath(); ctx.stroke(); ctx.fillStyle = rgba('#7ac8ff', 0.1); ctx.fill(); ctx.globalCompositeOperation = 'source-over' }
    ctx.restore();
  }

  private drawParts(ctx: CanvasRenderingContext2D) {
    for (const p of this.parts) {
      const k = p.life / p.max, a = 1 - k * k;
      ctx.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
      ctx.fillStyle = rgba(p.c, a); ctx.strokeStyle = rgba(p.c, a);
      switch (p.shape) {
        case 'dot': ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill(); break;
        case 'drop': ctx.beginPath(); ctx.ellipse(p.x, p.y, p.s * 0.6, p.s * 1.4, 0, 0, Math.PI * 2); ctx.fill(); break;
        case 'shard': ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * 6); ctx.beginPath(); ctx.moveTo(0, -p.s * 1.4); ctx.lineTo(p.s * 0.6, 0); ctx.lineTo(0, p.s * 1.4); ctx.lineTo(-p.s * 0.6, 0); ctx.closePath(); ctx.fill(); ctx.restore(); break;
        case 'leaf': ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * 5); ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); break;
        case 'cog': ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * 4); ctx.beginPath(); for (let i = 0; i < 12; i++) { const r = i % 2 ? p.s * 0.75 : p.s; const an = (i / 12) * Math.PI * 2; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r) } ctx.closePath(); ctx.fill(); ctx.restore(); break;
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawTexts(ctx: CanvasRenderingContext2D) {
    for (const t of this.texts) {
      const k = (this.clock - t.t0) / t.dur;
      const pop = k < 0.15 ? 0.6 + (k / 0.15) * (t.crit ? 0.9 : 0.55) : 1.1 - (k - 0.15) * 0.2;
      ctx.save();
      ctx.translate(t.x + t.vx * k * 40, t.y - k * (t.crit ? 70 : 54));
      ctx.scale(pop, pop);
      ctx.globalAlpha = clamp(1.4 - k * 1.3);
      ctx.font = `800 ${t.size}px Cinzel, Georgia, serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(3, t.size * 0.18); ctx.strokeStyle = 'rgba(0,0,0,.92)'; ctx.lineJoin = 'round';
      ctx.strokeText(t.text, 0, 0);
      ctx.fillStyle = t.c; if (t.crit) { ctx.shadowColor = '#ffb020'; ctx.shadowBlur = 18 }
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
  }
}

void rngOf;
