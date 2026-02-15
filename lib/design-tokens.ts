import { Platform } from 'react-native';

export const DROPLET = {
  // Parchment & Backgrounds
  parchment: '#F5ECD7',
  parchmentLight: '#FAF6ED',
  parchmentDark: '#E8E0D4',
  bgWhite: '#FFFFFF',

  // Signature Accents
  gold: '#C5A55A',
  goldLight: '#E8C992',
  goldMuted: '#8B7355',
  goldGlow: 'rgba(197, 165, 90, 0.15)',

  // Indigo / Navy (watercolor wash)
  indigo: '#1A1A3E',
  indigoLight: '#2A2A5E',
  indigoWash: 'rgba(26, 26, 62, 0.08)',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textOnDark: '#F2EDE4',
  textGold: '#C5A55A',
  textMuted: '#9B9490',

  // Dream Style Colors
  nightmare: '#8B3A5C',
  vivid: '#C45B7B',
  lucid: '#C5A55A',

  // Functional
  danger: '#8B3A3A',
  success: '#4A7C59',

  // Borders (use sparingly)
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  borderGold: 'rgba(197, 165, 90, 0.15)',

  // Shadows
  shadowWarm: '#8B7355',
  shadowDark: '#000',
} as const;

export const SHADOWS = {
  parchment: {
    ...Platform.select({
      ios: {
        shadowColor: DROPLET.shadowWarm,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  soft: {
    ...Platform.select({
      ios: {
        shadowColor: DROPLET.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: DROPLET.shadowDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
} as const;
