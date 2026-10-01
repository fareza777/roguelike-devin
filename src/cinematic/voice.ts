import { duckMusic } from '../audio';

/** Optional recorded voice-over. If the mp3s were never generated everything silently falls back to subtitles. */
let manifest: Record<string, number> | null = null;
let loading: Promise<void> | null = null;
let current: HTMLAudioElement | null = null;

const base = () => `${(import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'}audio/vo/`;

export function loadVoManifest(): Promise<void> {
  loading ??= fetch(`${base()}manifest.json`).then(r => (r.ok ? r.json() : {})).then((m: Record<string, number>) => { manifest = m }).catch(() => { manifest = {} });
  return loading;
}

/** Duration in seconds of the recorded line, or 0 when there is none. */
export const voDuration = (id: string) => manifest?.[id] ?? 0;

export function playVo(id: string, volume = 1): number {
  stopVo();
  const d = voDuration(id);
  if (!d) return 0;
  const a = new Audio(`${base()}${id}.mp3`);
  a.volume = volume;
  current = a;
  duckMusic(true);
  a.addEventListener('ended', () => { if (current === a) { current = null; duckMusic(false) } });
  a.play().catch(() => { if (current === a) { current = null; duckMusic(false) } });
  return d;
}

export function stopVo() {
  if (current) { current.pause(); current = null; duckMusic(false) }
}
