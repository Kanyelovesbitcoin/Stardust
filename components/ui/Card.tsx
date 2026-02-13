import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
}

export default function Card({ children, elevated = false, style }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  elevated: {
    backgroundColor: COLORS.surfaceElevated,
  },
});
