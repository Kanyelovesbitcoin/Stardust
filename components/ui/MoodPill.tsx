import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { DroplettText } from './DroplettText';

export type MoodType = keyof typeof DROPLETT_THEME.mood;

interface MoodPillProps {
    mood: string;
}

export function MoodPill({ mood }: MoodPillProps) {
    // Normalize mood key
    const moodKeyRaw = mood.toLowerCase();
    const isValidMood = Object.keys(DROPLETT_THEME.mood).includes(moodKeyRaw);
    const moodKey = isValidMood ? (moodKeyRaw as MoodType) : 'neutral';

    const color = DROPLETT_THEME.mood[moodKey];

    return (
        <View style={[styles.pill, { backgroundColor: `${color}1F`, borderColor: `${color}33`, borderWidth: 1 }]}>
            <DroplettText
                variant="label"
                color={color}
                style={styles.text}
            >
                {mood}
            </DroplettText>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        // textTransform: 'uppercase' handled by label variant
    },
});
