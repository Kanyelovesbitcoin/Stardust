import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../lib/constants';

interface Stats {
  totalDreams: number;
  currentStreak: number;
  lucidCount: number;
  weeklyCount: number;
}

interface StatsStripProps {
  stats: Stats;
}

const STAT_ITEMS: { key: keyof Stats; label: string }[] = [
  { key: 'totalDreams', label: 'Dreams' },
  { key: 'currentStreak', label: 'Streak' },
  { key: 'lucidCount', label: 'Lucid' },
  { key: 'weeklyCount', label: 'This Week' },
];

export default function StatsStrip({ stats }: StatsStripProps) {
  return (
    <View style={styles.container}>
      {STAT_ITEMS.map((item, index) => (
        <React.Fragment key={item.key}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats[item.key]}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
          {index < STAT_ITEMS.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.primaryText,
    fontWeight: '600',
    marginBottom: 2,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 10,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.textTertiary,
    opacity: 0.3,
    marginVertical: 4,
  },
});
