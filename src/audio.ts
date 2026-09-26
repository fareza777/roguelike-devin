let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let drone: { stop: () => void } | null = null;

function ensure() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export type Sfx = 'click' | 'hit' | 'crit' | 'hurt' | 'heal' | 'level' | 'win' | 'death' | 'door';

export function sfx(kind: Sfx) {
  const c = ensure();
  const t = c.currentTime;
  const tone = (freq: number, dur: number, type: OscillatorType, vol: number, end = freq, delay = 0) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t + delay);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + delay + dur);
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.exponentialRampToValueAtTime(vol, t + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
    o.connect(g).connect(master!);
    o.start(t + delay);
    o.stop(t + delay + dur + 0.05);
  };
  const noise = (dur: number, vol: number, freq: number) => {
    const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    src.buffer = b;
    f.type = 'lowpass';
    f.frequency.value = freq;
    g.gain.value = vol;
    src.connect(f).connect(g).connect(master!);
    src.start(t);
  };
  switch (kind) {
    case 'click': tone(420, 0.06, 'triangle', 0.08, 300); break;
    case 'hit': noise(0.18, 0.5, 1400); tone(140, 0.15, 'square', 0.08, 60); break;
    case 'crit': noise(0.25, 0.7, 2600); tone(220, 0.3, 'sawtooth', 0.12, 55); break;
    case 'hurt': noise(0.25, 0.5, 600); tone(90, 0.3, 'sine', 0.2, 40); break;
    case 'heal': tone(520, 0.4, 'sine', 0.1, 780); tone(660, 0.5, 'sine', 0.06, 990, 0.08); break;
    case 'level': [392, 494, 587, 784].forEach((f, i) => tone(f, 0.45, 'triangle', 0.09, f, i * 0.11)); break;
    case 'win': [220, 277, 330].forEach((f, i) => tone(f, 0.7, 'sawtooth', 0.05, f, i * 0.09)); break;
    case 'death': tone(180, 1.6, 'sawtooth', 0.12, 30); noise(1.2, 0.3, 300); break;
    case 'door': tone(70, 0.9, 'sine', 0.22, 45); noise(0.6, 0.2, 400); break;
  }
}

export function setMusic(on: boolean) {
  if (!on) { drone?.stop(); drone = null; return }
  if (drone) return;
  const c = ensure();
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.09, c.currentTime + 3);
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 420;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain).connect(f.frequency);
  const oscs = [55, 55.4, 82.4, 110.3].map(freq => {
    const o = c.createOscillator();
    o.type = freq > 100 ? 'triangle' : 'sawtooth';
    o.frequency.value = freq;
    o.connect(f);
    o.start();
    return o;
  });
  f.connect(g).connect(master!);
  lfo.start();
  drone = { stop: () => { g.gain.linearRampToValueAtTime(0, c.currentTime + 1); setTimeout(() => { oscs.forEach(o => o.stop()); lfo.stop() }, 1100) } };
}
