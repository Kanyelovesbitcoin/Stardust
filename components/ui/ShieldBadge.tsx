import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../lib/constants';

export default function ShieldBadge() {
  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark" size={12} color={COLORS.shield} />
      <Text style={styles.text}>E2E</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(74,139,110,0.12)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  text: {
    ...TYPOGRAPHY.label,
    color: COLORS.shield,
    fontSize: 8,
    letterSpacing: 0.5,
  },
});
