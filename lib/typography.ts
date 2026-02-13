// lib/typography.ts
import {
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold
} from '@expo-google-fonts/cormorant-garamond';
import {
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold
} from '@expo-google-fonts/outfit';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

export const FONTS = {
    display: {
        regular: 'CormorantGaramond_400Regular',
        medium: 'CormorantGaramond_500Medium',
        semiBold: 'CormorantGaramond_600SemiBold',
        bold: 'CormorantGaramond_700Bold',
    },
    body: {
        light: 'Outfit_300Light',
        regular: 'Outfit_400Regular',
        medium: 'Outfit_500Medium',
        semiBold: 'Outfit_600SemiBold',
    },
    mono: {
        regular: 'JetBrainsMono_400Regular',
    },
} as const;

export const TYPE_SCALE = {
    // Display — Cormorant Garamond
    heroTitle: { fontFamily: FONTS.display.bold, fontSize: 42, lineHeight: 48, letterSpacing: -0.5 },
    screenTitle: { fontFamily: FONTS.display.semiBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.3 },
    cardTitle: { fontFamily: FONTS.display.medium, fontSize: 22, lineHeight: 28 },
    dreamTitle: { fontFamily: FONTS.display.regular, fontSize: 20, lineHeight: 26 },

    // Body — Outfit
    bodyLarge: { fontFamily: FONTS.body.regular, fontSize: 17, lineHeight: 24 },
    body: { fontFamily: FONTS.body.regular, fontSize: 15, lineHeight: 22 },
    bodySmall: { fontFamily: FONTS.body.light, fontSize: 13, lineHeight: 18 },
    button: { fontFamily: FONTS.body.semiBold, fontSize: 16, lineHeight: 20, letterSpacing: 0.5 },
    label: { fontFamily: FONTS.body.medium, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: 'uppercase' },

    // Mono — JetBrains
    stat: { fontFamily: FONTS.mono.regular, fontSize: 28, lineHeight: 34 },
    timestamp: { fontFamily: FONTS.mono.regular, fontSize: 11, lineHeight: 14 },
} as const;
