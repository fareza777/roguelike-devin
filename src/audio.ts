let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let musicBus: GainNode | null = null;

function ensure() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    const conv = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 2.4);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6 }
    conv.buffer = ir;
    wet = ctx.createGain();
    wet.gain.value = 0.45;
    wet.connect(conv).connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = 1;
    musicBus.connect(master);
    musicBus.connect(wet);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export type Sfx = 'click' | 'hit' | 'crit' | 'hurt' | 'heal' | 'level' | 'win' | 'death' | 'door' | 'step' | 'chest' | 'coin' | 'pickup' | 'trap' | 'stairs' | 'spell' | 'quest' | 'page' | 'bell' | 'enter' | 'error' | 'dodge' | 'equip' | 'buy';

export function sfx(kind: Sfx) {
  const c = ensure();
  const t = c.currentTime;
  const out = master!;
  const tone = (freq: number, dur: number, type: OscillatorType, vol: number, end = freq, delay = 0, dest: AudioNode = out) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t + delay);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + delay + dur);
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.exponentialRampToValueAtTime(vol, t + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
    o.connect(g).connect(dest);
    o.start(t + delay);
    o.stop(t + delay + dur + 0.05);
  };
  const noise = (dur: number, vol: number, freq: number, type: BiquadFilterType = 'lowpass', delay = 0) => {
    const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    src.buffer = b;
    f.type = type;
    f.frequency.value = freq;
    g.gain.value = vol;
    src.connect(f).connect(g).connect(out);
    src.start(t + delay);
  };
  switch (kind) {
    case 'click': tone(520, 0.05, 'triangle', 0.06, 340); break;
    case 'step': noise(0.05, 0.12, 700 + Math.random() * 300); break;
    case 'hit': noise(0.18, 0.5, 1400); tone(140, 0.15, 'square', 0.08, 60); break;
    case 'crit': noise(0.25, 0.7, 2600); tone(220, 0.3, 'sawtooth', 0.12, 55); tone(880, 0.12, 'triangle', 0.06, 1400, 0.03); break;
    case 'hurt': noise(0.25, 0.5, 600); tone(90, 0.3, 'sine', 0.2, 40); break;
    case 'dodge': noise(0.12, 0.25, 2400, 'highpass'); tone(600, 0.14, 'sine', 0.05, 1200); break;
    case 'heal': tone(520, 0.4, 'sine', 0.1, 780); tone(660, 0.5, 'sine', 0.06, 990, 0.08); break;
    case 'level': [392, 494, 587, 784, 988].forEach((f, i) => tone(f, 0.5, 'triangle', 0.09, f, i * 0.11)); break;
    case 'win': [220, 277, 330, 440].forEach((f, i) => tone(f, 0.8, 'sawtooth', 0.045, f, i * 0.09)); break;
    case 'death': tone(180, 1.6, 'sawtooth', 0.12, 30); noise(1.2, 0.3, 300); break;
    case 'door': tone(70, 0.6, 'sine', 0.2, 45); noise(0.4, 0.2, 500); break;
    case 'chest': noise(0.1, 0.25, 900); [523, 659, 784].forEach((f, i) => tone(f, 0.25, 'triangle', 0.07, f, 0.08 + i * 0.07)); break;
    case 'coin': tone(1320, 0.1, 'square', 0.04, 1320); tone(1760, 0.18, 'square', 0.04, 1760, 0.07); break;
    case 'pickup': tone(660, 0.1, 'triangle', 0.07, 990); break;
    case 'trap': noise(0.3, 0.6, 3000, 'highpass'); tone(200, 0.2, 'sawtooth', 0.14, 60); break;
    case 'stairs': [330, 294, 262, 220].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, f * 0.9, i * 0.09)); break;
    case 'spell': tone(300, 0.5, 'sawtooth', 0.06, 1200); noise(0.4, 0.15, 3200, 'bandpass'); break;
    case 'quest': [392, 523, 659].forEach((f, i) => tone(f, 0.6, 'sine', 0.08, f, i * 0.12)); break;
    case 'page': noise(0.12, 0.18, 4000, 'highpass'); break;
    case 'bell': tone(440, 1.6, 'sine', 0.12, 436); tone(880, 1.2, 'sine', 0.05, 870); tone(1320, 0.9, 'sine', 0.025, 1300); break;
    case 'enter': tone(110, 0.9, 'sine', 0.22, 70); noise(0.6, 0.2, 400); tone(220, 0.8, 'triangle', 0.06, 165, 0.1); break;
    case 'error': tone(180, 0.18, 'square', 0.06, 120); break;
    case 'equip': noise(0.09, 0.3, 1800); tone(300, 0.12, 'square', 0.05, 200); break;
    case 'buy': tone(880, 0.08, 'square', 0.04); tone(1174, 0.16, 'square', 0.04, 1174, 0.07); break;
  }
}

export type Mood = 'off' | 'title' | 'town' | 'world' | 'dungeon' | 'combat' | 'noon';
interface Layer { stop: () => void }
let layer: Layer | null = null;
let mood: Mood = 'off';
let enabled = true;
let started = false;

const MOODS: Record<Exclude<Mood, 'off'>, { root: number; chord: number[]; cut: number; type: OscillatorType; vol: number; notes: number[]; rate: number; pulse?: number }> = {
  title: { root: 55, chord: [1, 1.5, 2, 3], cut: 520, type: 'sawtooth', vol: 0.085, notes: [1, 1.2, 1.5, 1.8, 2, 2.4, 3], rate: 3.6 },
  town: { root: 73.4, chord: [1, 1.2, 1.5, 2], cut: 760, type: 'triangle', vol: 0.09, notes: [1, 1.125, 1.2, 1.5, 1.8, 2, 2.4], rate: 2.6 },
  world: { root: 65.4, chord: [1, 1.5, 2, 2.5], cut: 640, type: 'triangle', vol: 0.085, notes: [1, 1.2, 1.5, 1.8, 2.25, 3], rate: 4.4 },
  dungeon: { root: 49, chord: [1, 1.06, 1.5, 2.01], cut: 360, type: 'sawtooth', vol: 0.09, notes: [1, 1.06, 1.4, 1.5], rate: 7 },
  combat: { root: 55, chord: [1, 1.5, 1.68, 2], cut: 900, type: 'sawtooth', vol: 0.09, notes: [1, 1.5, 1.68], rate: 5, pulse: 0.5 },
  noon: { root: 82.4, chord: [1, 1.25, 1.5, 2, 2.5], cut: 1100, type: 'triangle', vol: 0.08, notes: [1, 1.25, 1.5, 2, 2.5, 3], rate: 3.2 },
};

function startLayer(m: Exclude<Mood, 'off'>): Layer {
  const c = ensure();
  const cfg = MOODS[m];
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(cfg.vol, c.currentTime + 3.5);
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = cfg.cut;
  const lfo = c.createOscillator();
  const lg = c.createGain();
  lfo.frequency.value = 0.06 + Math.random() * 0.05;
  lg.gain.value = cfg.cut * 0.4;
  lfo.connect(lg).connect(f.frequency);
  const oscs = cfg.chord.map((r, i) => {
    const o = c.createOscillator();
    o.type = i % 2 ? 'triangle' : cfg.type;
    o.frequency.value = cfg.root * r * (1 + (i % 2 ? 0.003 : 0));
    o.connect(f);
    o.start();
    return o;
  });
  f.connect(g).connect(musicBus!);
  lfo.start();
  const timers: number[] = [];
  const pluck = () => {
    if (Math.random() < 0.55) {
      const n = cfg.notes[Math.floor(Math.random() * cfg.notes.length)] * cfg.root * (Math.random() < 0.4 ? 4 : 2);
      const o = c.createOscillator();
      const pg = c.createGain();
      o.type = 'sine';
      o.frequency.value = n;
      const t = c.currentTime;
      pg.gain.setValueAtTime(0.0001, t);
      pg.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
      pg.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      o.connect(pg).connect(musicBus!);
      o.start(t);
      o.stop(t + 2.5);
    }
  };
  timers.push(window.setInterval(pluck, (cfg.rate * 1000) / 1.6));
  if (cfg.pulse) {
    timers.push(window.setInterval(() => {
      const t = c.currentTime;
      const o = c.createOscillator();
      const pg = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(90, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
      pg.gain.setValueAtTime(0.16, t);
      pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(pg).connect(musicBus!);
      o.start(t);
      o.stop(t + 0.35);
    }, (cfg.pulse ?? 0.5) * 1000));
  }
  return {
    stop: () => {
      timers.forEach(clearInterval);
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.setValueAtTime(g.gain.value, c.currentTime);
      g.gain.linearRampToValueAtTime(0, c.currentTime + 1.6);
      window.setTimeout(() => { oscs.forEach(o => o.stop()); lfo.stop() }, 1700);
    },
  };
}

function apply() {
  if (!started) return;
  if (layer) { layer.stop(); layer = null }
  if (enabled && mood !== 'off') layer = startLayer(mood);
}

export function setMusicEnabled(on: boolean) { enabled = on; if (started) apply() }
export function unlockAudio() { if (!started) { started = true; ensure(); apply() } }
export function setMood(m: Mood) {
  if (m === mood) return;
  mood = m;
  apply();
}
