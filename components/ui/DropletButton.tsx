import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const BUTTON_COLORS = {
  primary: {
    bg: '#1A1A3E',
    bgPressed: '#13132E',
    text: '#F2EDE4',
  },
  secondary: {
    bg: 'transparent',
    bgPressed: 'rgba(26, 26, 62, 0.06)',
    text: '#1A1A3E',
  },
  ghost: {
    bg: 'transparent',
    bgPressed: 'rgba(0, 0, 0, 0.04)',
    text: '#8B7355',
  },
  gold: {
    bg: '#C5A55A',
    bgPressed: '#A88B42',
    text: '#1A1A1A',
  },
  danger: {
    bg: '#8B3A3A',
    bgPressed: '#6E2D2D',
    text: '#F2EDE4',
  },
} as const;

const BUTTON_SIZES = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, borderRadius: 8 },
  md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, borderRadius: 12 },
  lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18, borderRadius: 16 },
} as const;

export const DropletButton = React.memo(function DropletButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style: externalStyle,
}: Props) {
  const colors = BUTTON_COLORS[variant];
  const sizing = BUTTON_SIZES[size];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? colors.bgPressed : colors.bg,
          paddingVertical: sizing.paddingVertical,
          paddingHorizontal: sizing.paddingHorizontal,
          borderRadius: sizing.borderRadius,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'secondary' && styles.secondaryBorder,
        fullWidth && styles.fullWidth,
        externalStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: colors.text, fontSize: sizing.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: 'rgba(26, 26, 62, 0.12)',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  fullWidth: {
    width: '100%',
  },
});
