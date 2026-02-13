import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { STARDUST_THEME } from '../../lib/theme';
import { SPACING, RADIUS } from '../../lib/layout';
import { StardustText } from './StardustText';
import { StardustButton } from './StardustButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DevPaywallModalProps {
  visible: boolean;
  onDismiss: () => void;
  onUnlock: () => void;
  placement?: string;
}

const FEATURES = [
  { icon: 'infinite-outline' as const, label: 'Unlimited AI dream visualizations' },
  { icon: 'sparkles-outline' as const, label: 'Unlimited dream interpretations' },
  { icon: 'mic-outline' as const, label: 'Unlimited voice recordings' },
  { icon: 'images-outline' as const, label: 'Full dream gallery access' },
  { icon: 'moon-outline' as const, label: 'All sleep sounds & rituals' },
];

export function DevPaywallModal({ visible, onDismiss, onUnlock, placement }: DevPaywallModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, speed: 10, bounciness: 4, useNativeDriver: true }),
      ]).start();

      // Subtle pulse on the CTA
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(60);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Close button */}
          <Pressable onPress={onDismiss} style={styles.closeBtn} hitSlop={16}>
            <Ionicons name="close" size={24} color={STARDUST_THEME.text.tertiary} />
          </Pressable>

          {/* Crown icon */}
          <View style={styles.crownContainer}>
            <Ionicons name="diamond-outline" size={44} color={STARDUST_THEME.gold.bright} />
          </View>

          {/* Title */}
          <StardustText variant="heroTitle" color={STARDUST_THEME.gold.pale} align="center" style={{ fontSize: 34 }}>
            Stardust Pro
          </StardustText>

          <StardustText
            variant="bodyLarge"
            color={STARDUST_THEME.text.secondary}
            align="center"
            style={{ marginTop: SPACING.sm, marginBottom: SPACING.lg, paddingHorizontal: SPACING.md, opacity: 0.85 }}
          >
            Unlock the full power of your dream journal
          </StardustText>

          {/* Feature list */}
          <View style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name={f.icon} size={18} color={STARDUST_THEME.gold.warm} />
                <StardustText variant="body" color={STARDUST_THEME.text.primary} style={{ flex: 1, fontSize: 14 }}>
                  {f.label}
                </StardustText>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <View style={styles.priceContainer}>
            <StardustText variant="heroTitle" color={STARDUST_THEME.gold.bright} align="center" style={{ fontSize: 36 }}>
              $29.99
            </StardustText>
            <StardustText variant="bodySmall" color={STARDUST_THEME.text.secondary} align="center" style={{ marginTop: 2, opacity: 0.8 }}>
              per year — that's less than $2.50/month
            </StardustText>
          </View>

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
            <StardustButton onPress={onUnlock} variant="primary" fullWidth>
              Start Free Trial
            </StardustButton>
          </Animated.View>

          <Pressable onPress={onDismiss} style={styles.notNow}>
            <StardustText variant="bodySmall" color={STARDUST_THEME.text.tertiary} align="center">
              Not now
            </StardustText>
          </Pressable>

          {/* Dev badge */}
          <View style={styles.devBadge}>
            <StardustText variant="timestamp" color={STARDUST_THEME.text.tertiary} align="center">
              DEV PAYWALL • {placement ?? 'unknown'}
            </StardustText>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 10, 0.92)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: STARDUST_THEME.bg.secondary,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 101, 0.15)',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    shadowColor: 'rgba(212, 175, 55, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  featureList: {
    width: '100%',
    gap: SPACING.md - 2,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceContainer: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    width: '100%',
    alignItems: 'center',
  },
  notNow: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  devBadge: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
