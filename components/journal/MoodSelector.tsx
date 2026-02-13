import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, DREAM_MOODS } from '../../lib/constants';

interface MoodSelectorProps {
  selected: string | null;
  onSelect: (mood: string) => void;
}

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How did the dream feel?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DREAM_MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.key}
            style={[
              styles.moodButton,
              selected === mood.key && styles.moodButtonActive,
            ]}
            activeOpacity={0.7}
            onPress={() => onSelect(mood.key)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text
              style={[
                styles.moodLabel,
                selected === mood.key && styles.moodLabelActive,
              ]}
            >
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  scrollContent: {
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  moodButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    minWidth: 72,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  moodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  moodLabelActive: {
    color: COLORS.primaryText,
  },
});
