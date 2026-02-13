import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { STARDUST_THEME } from '../../lib/theme';
import { SPACING, RADIUS } from '../../lib/layout';
import { StardustText } from '../ui/StardustText';

interface Feature {
  label: string;
  free: boolean;
  pro: boolean;
}

const FEATURES: Feature[] = [
  { label: 'Voice recording', free: true, pro: true },
  { label: 'AI transcription', free: true, pro: true },
  { label: 'Dream journal', free: true, pro: true },
  { label: 'AI interpretation', free: false, pro: true },
  { label: 'AI dream artwork', free: false, pro: true },
  { label: 'Unlimited generations', free: false, pro: true },
];

function CheckMark({ included }: { included: boolean }) {
  return included ? (
    <Ionicons name="checkmark-circle" size={18} color={STARDUST_THEME.gold.warm} />
  ) : (
    <Ionicons name="close-circle-outline" size={18} color={STARDUST_THEME.text.tertiary} />
  );
}

export function FeatureTable() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.labelCol} />
        <View style={styles.checkCol}>
          <StardustText variant="label" color={STARDUST_THEME.text.secondary} align="center" style={{ fontSize: 10 }}>
            FREE
          </StardustText>
        </View>
        <View style={styles.checkCol}>
          <StardustText variant="label" color={STARDUST_THEME.gold.warm} align="center" style={{ fontSize: 10 }}>
            PRO
          </StardustText>
        </View>
      </View>

      {/* Rows */}
      {FEATURES.map((f, i) => (
        <View key={i} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
          <View style={styles.labelCol}>
            <StardustText variant="body" color={STARDUST_THEME.text.primary} style={{ fontSize: 14 }}>
              {f.label}
            </StardustText>
          </View>
          <View style={styles.checkCol}>
            <CheckMark included={f.free} />
          </View>
          <View style={styles.checkCol}>
            <CheckMark included={f.pro} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: STARDUST_THEME.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: STARDUST_THEME.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  rowAlt: {
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  labelCol: {
    flex: 1,
  },
  checkCol: {
    width: 56,
    alignItems: 'center',
  },
});
