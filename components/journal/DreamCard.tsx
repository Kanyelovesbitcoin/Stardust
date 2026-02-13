import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, DREAM_MOODS } from '../../lib/constants';

interface Dream {
  _id: string;
  createdAt: number;
  transcript?: string;
  mood?: string;
  tags: string[];
  lucidityRating: number;
  isFavorite: boolean;
  isTranscribing: boolean;
  interpretation?: object;
  sceneUrl?: string;
}

interface DreamCardProps {
  dream: Dream;
  onPress: () => void;
}

export default function DreamCard({ dream, onPress }: DreamCardProps) {
  const moodData = dream.mood
    ? DREAM_MOODS.find((m) => m.key === dream.mood)
    : null;

  const date = new Date(dream.createdAt);
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dateLabel =
    diffDays === 0
      ? `Today · ${timeStr}`
      : diffDays === 1
        ? `Yesterday · ${timeStr}`
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
          ` · ${timeStr}`;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.topRow}>
        {moodData && <Text style={styles.moodEmoji}>{moodData.emoji}</Text>}
        <View style={styles.metaColumn}>
          <Text style={styles.dateText}>{dateLabel}</Text>
          {/* Lucidity dots */}
          {dream.lucidityRating > 0 && (
            <View style={styles.dotsRow}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <View
                  key={dot}
                  style={[
                    styles.dot,
                    dot <= dream.lucidityRating && styles.dotFilled,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
        {/* Feature badges */}
        <View style={styles.badges}>
          {!!dream.interpretation && <Text style={styles.badge}>🧿</Text>}
          {dream.sceneUrl && <Text style={styles.badge}>🎨</Text>}
        </View>
      </View>

      {/* Transcript preview */}
      {dream.isTranscribing ? (
        <Text style={styles.transcribing}>Transcribing...</Text>
      ) : (
        <Text style={styles.preview} numberOfLines={2}>
          {dream.transcript || 'No transcript'}
        </Text>
      )}

      {/* Tags */}
      {dream.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {dream.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  moodEmoji: {
    fontSize: 28,
    marginTop: -2,
  },
  metaColumn: {
    flex: 1,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 11,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.textTertiary,
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    fontSize: 14,
  },
  preview: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  transcribing: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  tagPill: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryText,
    fontWeight: '500',
    fontSize: 11,
  },
});
