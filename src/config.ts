/**
 * Everything the host may want to change without touching a component.
 *
 * `venueText` is deliberately provisional — the venue is not decided. It must
 * never be replaced with invented placeholder text that could ship by accident.
 */
export const INVITE = {
  venueText: 'Unlocks soon · watch WhatsApp',
  venueMapUrl: '',
  whatsappNumber: '919837266622',
  whatsappDisplay: '+91 98372 66622',
  showAwaits: true,
  meteorRate: 2,

  /** Shown on the sound toggle. The file itself lives in src/assets. */
  soundtrack: 'Never stop trying',
  /** 8 Aug 2026, 20:08 IST. */
  target: Date.UTC(2026, 7, 8, 14, 38, 0),
} as const;
