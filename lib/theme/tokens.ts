// Fonts are loaded in _layout.tsx, we just reference their names here


// Define Fonts locally here to centralize
export const LUCID_FONTS = {
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

export const LUCID_TOKENS = {
    // === COLORS ===
    colors: {
        // Primary palette
        gold: '#C5A55A',
        goldLight: '#D4BA7A',
        goldDark: '#A8893E',
        goldMuted: 'rgba(197, 165, 90, 0.6)',

        // Backgrounds
        parchment: '#F5ECD7',
        parchmentDark: '#E8DCC4',
        navyDark: '#1A1A3E',
        navyDeep: '#12122E',
        cardDark: '#1C1C1E',
        cardDarkAlt: '#2C2C2E',
        galleryBackground: '#000000', // User requested Black for Gallery

        // Text
        textOnDark: '#FFFFFF',
        textOnLight: '#2C2420',
        textMuted: 'rgba(197, 165, 90, 0.7)',
        textPlaceholder: 'rgba(90, 80, 65, 0.5)',
        textLabel: '#C5A55A', // gold for labels

        // Accent
        greenBadge: '#4CAF50',
        errorRed: '#C0392B',

        // Borders
        borderGold: 'rgba(197, 165, 90, 0.4)',
        borderSubtle: 'rgba(150, 140, 120, 0.3)',

        // Dream style colors
        nightmare: {
            primary: '#8B4D6B',
            secondary: '#6B3A52',
        },
        vivid: {
            primary: '#C27B8E',
            secondary: '#A85D72',
        },
        lucid: {
            primary: '#C5A55A',
            secondary: '#A8893E',
        },
        ocean: {
            primary: '#4B7Fcc',
            secondary: '#3A6Ebc',
        },
        grassy: {
            primary: '#4A8B6E',
            secondary: '#3A7B5E',
        },
        // Semantic Moods
        moods: {
            calm: '#7BA7A7',
            scared: '#A75D5D',
            joy: '#C4A265',
            bizarre: '#7B6BA7',
            neutral: '#8B8478',
            anxious: '#C98C54',
            peaceful: '#6B9090',
            joyful: '#D4AF37',
        },
    },

    // === TYPOGRAPHY ===
    typography: {
        // Section labels (ALL CAPS, letterspaced)
        label: {
            fontFamily: LUCID_FONTS.body.medium,
            fontSize: 12,
            lineHeight: 16,
            letterSpacing: 2,
            textTransform: 'uppercase' as const,
        },
        // Badge text (PRO, DREAMLIKE, E2E)
        badge: {
            fontFamily: LUCID_FONTS.body.semiBold,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase' as const,
        },
        // Body text on dark cards
        dreamText: {
            fontFamily: LUCID_FONTS.body.regular,
            fontSize: 18,
            lineHeight: 26,
        },
        // Button text
        button: {
            fontFamily: LUCID_FONTS.body.semiBold,
            fontSize: 16,
            letterSpacing: 0.5,
        },
        // Navigation tab labels
        navLabel: {
            fontFamily: LUCID_FONTS.body.medium,
            fontSize: 11,
        },
        // Gallery date stamp
        dateStamp: {
            fontFamily: LUCID_FONTS.mono.regular,
            fontSize: 13,
        },
        // Timer text (voice recorder)
        timer: {
            fontFamily: LUCID_FONTS.mono.regular,
            fontSize: 32,
            letterSpacing: 2,
        },
        // Prompt/placeholder text
        prompt: {
            fontFamily: LUCID_FONTS.body.regular,
            fontSize: 16,
        },
        // Gallery/Screen titles
        screenTitle: {
            fontFamily: LUCID_FONTS.display.semiBold,
            fontSize: 32,
        },
        // Hero Title (Droplett)
        heroTitle: {
            fontFamily: LUCID_FONTS.display.bold,
            fontSize: 42,
            lineHeight: 48,
            letterSpacing: -0.5,
        },
        // Card Title (Recent Dreams)
        cardTitle: {
            fontFamily: LUCID_FONTS.display.bold,
            fontSize: 26,
            lineHeight: 32,
        },
        // Link text (VIEW IN GALLERY →)
        link: {
            fontFamily: LUCID_FONTS.body.semiBold,
            fontSize: 13,
            letterSpacing: 1.5,
            textTransform: 'uppercase' as const,
        },
        // High contrast for Gallery
        galleryTitle: {
            fontFamily: LUCID_FONTS.display.bold,
            fontSize: 32,
            color: '#FFFFFF',
        },
        galleryText: {
            fontFamily: LUCID_FONTS.body.regular,
            fontSize: 14,
            color: '#FFFFFF', // Actually this overrides color, which tokens shouldn't usually do, but allowed here
        },
        // Legacy mapping helpers
        body: { fontFamily: LUCID_FONTS.body.regular, fontSize: 15, lineHeight: 22 },
        bodyLarge: { fontFamily: LUCID_FONTS.body.regular, fontSize: 17, lineHeight: 24 },
        bodySmall: { fontFamily: LUCID_FONTS.body.light, fontSize: 13, lineHeight: 18 },
        timestamp: { fontFamily: LUCID_FONTS.mono.regular, fontSize: 11, lineHeight: 14 },
        dreamTitle: { fontFamily: LUCID_FONTS.display.regular, fontSize: 20, lineHeight: 26 },
        stat: { fontFamily: LUCID_FONTS.mono.regular, fontSize: 28, lineHeight: 34 },
    },

    // === SPACING ===
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    // === BORDER RADIUS ===
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        pill: 999,
        circle: 9999,
    },

    // === COMPONENT-SPECIFIC ===
    components: {
        dreamCard: {
            backgroundColor: '#1C1E1E',
            borderRadius: 16,
            paddingVertical: 24,
            paddingHorizontal: 20,
        },
        actionButton: {
            borderWidth: 1,
            borderRadius: 999,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderColor: 'rgba(150, 140, 120, 0.4)',
            backgroundColor: 'transparent',
        },
        styleSelector: {
            borderRadius: 12,
            width: 100,
            height: 100,
            selectedBorderWidth: 2,
            selectedBorderColor: '#C5A55A',
        },
        voiceButton: {
            size: 100,
            backgroundColor: '#C5A55A',
            borderRadius: 9999,
        },
        inputToggle: {
            borderRadius: 999,
            height: 44,
            activeBackground: '#C5A55A',
            inactiveBackground: '#1A1A3E',
            activeText: '#1C1E1E',
            inactiveText: '#FFFFFF',
        },
        bottomNav: {
            backgroundColor: '#1A1A3E',
            height: 80,
            activeColor: '#C5A55A',
            inactiveColor: 'rgba(255, 255, 255, 0.5)',
        },
        galleryCard: {
            borderRadius: 12,
            aspectRatio: 0.85,
        },
        headerBar: {
            paddingTop: 8,
            paddingHorizontal: 16,
            iconSize: 24,
            iconColor: 'rgba(60, 50, 40, 0.7)',
        },
    },
} as const;

export type LucidTokens = typeof LUCID_TOKENS;
