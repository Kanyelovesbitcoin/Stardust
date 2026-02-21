import { LUCID_TOKENS } from './tokens';

export { LUCID_TOKENS } from './tokens';

// Deprecated STARDUST_THEME kept for backward compatibility
export const STARDUST_THEME = {
    // Backgrounds — deep, warm blacks (NOT pure #000)
    bg: {
        primary: '#0A0A0F',      // Near-black with blue undertone
        secondary: '#12121A',     // Card backgrounds
        tertiary: '#1A1A24',      // Elevated surfaces
        input: '#0F0F17',         // Input fields
    },

    // Gold spectrum — the signature
    gold: {
        muted: '#8B7355',         // Subtle text, borders
        warm: '#C4A265',          // Primary accent, buttons
        bright: '#D4AF37',        // Highlights, active states
        glow: '#E8C547',          // Sparingly — hover, focus rings
        pale: '#F5E6C8',          // Light gold for body text on dark
    },

    // Text
    text: {
        primary: '#E8E0D4',       // Warm off-white (NOT pure white)
        secondary: '#9B917F',     // Muted, captions
        tertiary: '#6B6358',      // Disabled, hints
        inverse: '#0A0A0F',       // Text on gold buttons
    },

    // Semantic
    mood: {
        calm: '#7BA7A7',          // Teal-sage
        scared: '#A75D5D',        // Dusty rose-red
        joy: '#C4A265',           // Uses gold.warm
        bizarre: '#7B6BA7',       // Muted purple
        neutral: '#8B8478',       // Warm gray
        anxious: '#C98C54',       // Muted amber/orange
        peaceful: '#6B9090',      // Muted blue/teal
        joyful: '#D4AF37',        // Soft gold
    },

    // System
    border: '#1F1F2A',
    borderActive: '#C4A265',
    shadow: 'rgba(196, 162, 101, 0.08)',  // Gold-tinted shadows
    overlay: 'rgba(10, 10, 15, 0.85)',
} as const;

// Helper to apply typography tokens as a style object
export const applyTypography = (key: keyof typeof LUCID_TOKENS.typography) => {
    return LUCID_TOKENS.typography[key];
};
