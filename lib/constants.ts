// Stardust — Record it. Understand it. See it.
// Deep indigo void + sacred gold

export const COLORS = {
  // Dream void
  background: '#0C0A14',
  backgroundWarm: '#110E1A',
  surface: '#16132A',
  surfaceElevated: '#1C1835',

  // Sacred gold
  primary: '#C9A84C',
  primaryBright: '#E0C56E',
  primaryMuted: 'rgba(201,168,76,0.12)',
  primaryDim: 'rgba(201,168,76,0.06)',
  primaryText: '#D4B65E',

  // Saffron accent
  saffron: '#D4864A',
  saffronGlow: '#D4864A15',

  // Dream purple
  purple: '#6B5B95',
  purpleGlow: 'rgba(107,91,149,0.15)',
  purpleDim: 'rgba(107,91,149,0.08)',

  // Text — warm parchment
  textPrimary: '#E8E0D0',
  textSecondary: '#7B7590',
  textTertiary: '#463F5E',

  // Functional
  success: '#5B9E7E',
  error: '#D45B5B',
  recording: '#E85454',
  shield: '#4A8B6E',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  hero: { fontSize: 36, fontWeight: '700' as const, letterSpacing: -1 },
  title: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 18, fontWeight: '500' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
  wordmark: { fontSize: 28, fontWeight: '500' as const, letterSpacing: 10 },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const DREAM_MOODS = [
  { key: 'peaceful', emoji: '😌', label: 'Peaceful' },
  { key: 'anxious', emoji: '😰', label: 'Anxious' },
  { key: 'joyful', emoji: '😄', label: 'Joyful' },
  { key: 'fearful', emoji: '😨', label: 'Fearful' },
  { key: 'confused', emoji: '😵‍💫', label: 'Confused' },
  { key: 'powerful', emoji: '💪', label: 'Powerful' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
] as const;

// Watercolor stroke styles — each dream gets one
export const DREAM_TYPES = {
  nightmare: { key: 'nightmare', label: 'Nightmare', image: require('../assets/purple stroke.png') },
  lucid: { key: 'lucid', label: 'Lucid', image: require('../assets/yellow stroke.png') },
  vivid: { key: 'vivid', label: 'Vivid', image: require('../assets/redish stoke.png') },
  ocean: { key: 'ocean', label: 'Ocean', image: require('../assets/blue stroke.png') },
} as const;

export type DreamType = keyof typeof DREAM_TYPES;

// Tag icons with watercolor artwork
export const DREAM_TAGS = {
  flying: { key: 'flying', label: 'Flying', image: require('../assets/flying.png') },
  animal: { key: 'animal', label: 'Animal', image: require('../assets/animal.png') },
  fear: { key: 'fear', label: 'Fear', image: require('../assets/ink.png') },
  hope: { key: 'hope', label: 'Love/Hope', image: require('../assets/hope.png') },
  favorite: { key: 'favorite', label: 'Favorite', image: require('../assets/star.png') },
} as const;

export type DreamTagKey = keyof typeof DREAM_TAGS;
