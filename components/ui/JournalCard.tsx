import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { DROPLET, SHADOWS } from '../../lib/design-tokens';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'parchment' | 'elevated' | 'dark' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
}

const PADDING_MAP = { sm: 12, md: 16, lg: 24 } as const;

export const JournalCard = React.memo(function JournalCard({
  children,
  style,
  variant = 'parchment',
  padding = 'md',
}: Props) {
  return (
    <View
      style={[
        styles.base,
        { padding: PADDING_MAP[padding] },
        variant === 'parchment' && styles.parchment,
        variant === 'elevated' && styles.elevated,
        variant === 'dark' && styles.dark,
        variant === 'flat' && styles.flat,
        style,
      ]}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  parchment: {
    backgroundColor: 'rgba(245, 236, 215, 0.85)',
    ...SHADOWS.parchment,
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.soft,
  },
  dark: {
    backgroundColor: '#1C1C1E',
  },
  flat: {
    backgroundColor: 'rgba(26, 26, 62, 0.04)',
  },
});
