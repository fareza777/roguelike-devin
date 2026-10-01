/** Voice-over script. Every spoken line has a stable id; `tools/gen-vo.mjs` renders them to public/audio/vo/<id>.mp3. */
export type VoiceId = 'narrator' | 'seer' | 'regent';

export interface VoLine { id: string; voice: VoiceId; text: string }

export interface Shot {
  vo: string;
  scene: string;
  /** Minimum seconds on screen when there is no recorded voice. */
  dur: number;
  /** Camera move: zoom start/end, pan start/end (-1..1), tilt start/end. */
  cam: [number, number, number, number, number, number];
  sting?: 'boom' | 'riser' | 'whoosh' | 'sting' | 'bell';
  flash?: boolean;
}

export const VOICES: Record<VoiceId, { label: string; /** ElevenLabs voice name to look up in the account, overridable by env. */ pick: string; stability: number; style: number }> = {
  narrator: { label: 'The Chronicler', pick: 'Adam', stability: 0.45, style: 0.35 },
  seer: { label: 'The Blind Seer', pick: 'Charlotte', stability: 0.35, style: 0.5 },
  regent: { label: 'A Regent', pick: 'Clyde', stability: 0.3, style: 0.6 },
};

export const CINEMATIC: Shot[] = [
  { vo: 'intro_01', scene: 'intro_sun', dur: 5.2, cam: [1.02, 1.12, -0.2, 0.1, 0, 0] },
  { vo: 'intro_02', scene: 'intro_sun', dur: 5.4, cam: [1.12, 1.26, 0.1, 0.3, 0, 0], sting: 'sting', flash: true },
  { vo: 'intro_03', scene: 'intro_shadows', dur: 5.2, cam: [1.1, 1.0, 0.3, -0.2, 0, 0] },
  { vo: 'intro_04', scene: 'intro_rift', dur: 6, cam: [1.0, 1.2, 0, 0, 0.1, -0.1], sting: 'riser' },
  { vo: 'intro_05', scene: 'intro_march', dur: 5.4, cam: [1.05, 1.18, -0.3, 0.3, 0, 0] },
  { vo: 'intro_06', scene: 'siege', dur: 5.4, cam: [1.2, 1.04, 0.2, -0.2, 0, 0], sting: 'whoosh' },
  { vo: 'intro_07', scene: 'lantern_hall', dur: 5.4, cam: [1.0, 1.16, 0, 0, 0.1, 0] },
  { vo: 'intro_08', scene: 'lantern_hall', dur: 7, cam: [1.16, 1.3, 0, 0.05, 0, -0.1], sting: 'bell' },
  { vo: 'intro_09', scene: 'intro_road', dur: 6, cam: [1.0, 1.14, 0, 0, 0, 0] },
  { vo: 'intro_10', scene: 'dawn', dur: 6.6, cam: [1.14, 1.0, 0.1, 0, 0, 0], sting: 'boom' },
];

export const VO: VoLine[] = [
  { id: 'intro_01', voice: 'narrator', text: 'On the ninth day of the endless noon, the sun turned black.' },
  { id: 'intro_02', voice: 'narrator', text: 'Every citizen of Veyr cast three shadows.' },
  { id: 'intro_03', voice: 'narrator', text: 'By nightfall, the shadows had begun to speak.' },
  { id: 'intro_04', voice: 'narrator', text: 'From the wound in the sky poured the Dreadmarch. The dead. The changed. The hungry.' },
  { id: 'intro_05', voice: 'narrator', text: 'Kingdom after kingdom fell silent.' },
  { id: 'intro_06', voice: 'narrator', text: 'Only Veyrgard, the Final City, still bars its gates.' },
  { id: 'intro_07', voice: 'narrator', text: 'Four Wardens once held the wound shut. Now they serve it.' },
  { id: 'intro_08', voice: 'seer', text: 'Break the seals. Then walk into the Meridian, and bring back the morning.' },
  { id: 'intro_09', voice: 'narrator', text: 'You were no one. A name on a ledger, a lantern, a blade, and a long road.' },
  { id: 'intro_10', voice: 'narrator', text: 'Somewhere past the dark, the morning is still waiting.' },
  { id: 'title_tag', voice: 'narrator', text: 'The sun is dead. The road remembers your name.' },
];

/** Extra spoken lines for later story beats (rendered the same way, played by the dialogue system when present). */
export const VO_BEATS: VoLine[] = [
  { id: 'beat_regalia', voice: 'seer', text: 'Six crowns of broken rule remain. Each one still remembers its Regent.' },
  { id: 'beat_dawn', voice: 'narrator', text: 'Light crossed the Meridian, and the road finally had an end.' },
  { id: 'beat_common', voice: 'narrator', text: 'Not a throne. Not a seal. A morning that belongs to everyone.' },
  { id: 'beat_death', voice: 'narrator', text: 'The road remembers. It always remembers.' },
];

export const ALL_VO: VoLine[] = [...VO, ...VO_BEATS];
