/**
 * Render the voice-over script with ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... npx tsx tools/gen-vo.ts [--force] [--only intro_01,intro_02]
 *
 * Optional env: ELEVENLABS_VOICE_NARRATOR / _SEER / _REGENT (a voice_id, or leave unset to look up by name),
 *               ELEVENLABS_MODEL (default eleven_multilingual_v2).
 * The API key is read from the environment only and is never written to disk.
 * Output: public/audio/vo/<id>.mp3 and public/audio/vo/manifest.json ({ id: seconds }).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ALL_VO, VOICES, type VoiceId } from '../src/data/cinematic';

const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('Set ELEVENLABS_API_KEY in the environment.'); process.exit(1) }
const API = 'https://api.elevenlabs.io/v1';
const OUT = new URL('../public/audio/vo/', import.meta.url).pathname;
const BITRATE = 64000;
const force = process.argv.includes('--force');
const only = process.argv.find(a => a.startsWith('--only='))?.slice(7).split(',') ?? (process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1]?.split(',') : undefined);
const model = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
mkdirSync(OUT, { recursive: true });

async function api(path: string, init: RequestInit = {}) {
  const r = await fetch(`${API}${path}`, { ...init, headers: { 'xi-api-key': key!, ...(init.headers ?? {}) } });
  if (!r.ok) throw new Error(`${r.status} ${path}: ${(await r.text()).slice(0, 300)}`);
  return r;
}

async function resolveVoices(): Promise<Record<VoiceId, string>> {
  const list = ((await (await api('/voices')).json()) as { voices: { voice_id: string; name: string }[] }).voices;
  const out = {} as Record<VoiceId, string>;
  (Object.keys(VOICES) as VoiceId[]).forEach(v => {
    const env = process.env[`ELEVENLABS_VOICE_${v.toUpperCase()}`];
    const hit = env ?? list.find(x => x.name.toLowerCase().startsWith(VOICES[v].pick.toLowerCase()))?.voice_id ?? list[0]?.voice_id;
    if (!hit) throw new Error(`No voice available for ${v}`);
    out[v] = hit;
  });
  return out;
}

const manifestPath = `${OUT}manifest.json`;
const manifest: Record<string, number> = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const voices = await resolveVoices();
for (const line of ALL_VO) {
  if (only && !only.includes(line.id)) continue;
  const file = `${OUT}${line.id}.mp3`;
  if (!force && existsSync(file) && manifest[line.id]) { console.log(`skip  ${line.id}`); continue }
  const v = VOICES[line.voice];
  const r = await api(`/text-to-speech/${voices[line.voice]}?output_format=mp3_44100_64`, {
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: line.text, model_id: model, voice_settings: { stability: v.stability, similarity_boost: 0.8, style: v.style, use_speaker_boost: true } }),
  });
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(file, buf);
  manifest[line.id] = Math.round(((buf.length * 8) / BITRATE) * 100) / 100;
  console.log(`wrote ${line.id}  ${manifest[line.id]}s`);
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log('manifest updated');
