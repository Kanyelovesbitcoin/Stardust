import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../lib/constants';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IoniconsName;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'solid',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  style,
  textStyle,
  color,
}: ButtonProps) {
  const accentColor = color || COLORS.primary;

  const containerStyles = [
    styles.base,
    sizeStyles[size],
    variant === 'solid' && { backgroundColor: accentColor },
    variant === 'outlined' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: accentColor,
    },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const labelColor =
    variant === 'solid'
      ? COLORS.background
      : disabled
        ? COLORS.textTertiary
        : accentColor;

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 20;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={containerStyles}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={labelColor}
            style={styles.iconLeft}
          />
        )}
        <Text style={[styles.label, sizeTextStyles[size], { color: labelColor }, textStyle]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={labelColor}
            style={styles.iconRight}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

const sizeStyles: Record<string, ViewStyle> = StyleSheet.create({
  sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  lg: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 4,
    minHeight: 56,
  },
});

const sizeTextStyles: Record<string, TextStyle> = StyleSheet.create({
  sm: {
    fontSize: 14,
    fontWeight: '600',
  },
  md: {
    fontSize: 16,
    fontWeight: '600',
  },
  lg: {
    fontSize: 18,
    fontWeight: '600',
  },
});
