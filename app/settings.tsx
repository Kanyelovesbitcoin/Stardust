import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePaywall, PLACEMENTS } from '../lib/hooks/usePaywall';
import { useStardustPro } from '../lib/superwall';
import { STARDUST_THEME } from '../lib/theme';
import { RADIUS, SPACING } from '../lib/layout';
import { StardustText } from '../components/ui/StardustText';
import { StardustCard } from '../components/ui/StardustCard';
import ScreenContainer from '../components/ui/ScreenContainer';
import { GoldDivider } from '../components/ui/GoldDivider';

const PRIVACY_URL = 'https://droplett.app/privacy';
const TERMS_URL = 'https://droplett.app/terms';

export default function SettingsScreen() {
  const { showPaywall, isPremium: isPro } = usePaywall();
  const { restorePurchases } = useStardustPro();

  const handleShowPaywall = () => showPaywall(PLACEMENTS.SETTINGS_UPGRADE);

  const handleRestorePurchases = () => restorePurchases();

  return (
    <ScreenContainer backgroundSource={require('../assets/bg-settings.png')}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={STARDUST_THEME.gold.muted} />
        </Pressable>
        <StardustText variant="screenTitle" color={STARDUST_THEME.text.primary}>
          Settings
        </StardustText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Pro Card */}
        <StardustCard
          style={[styles.proCard, isPro && styles.proCardActive]}
          onPress={isPro ? undefined : handleShowPaywall}
        >
          <View style={styles.proContent}>
            <View>
              <StardustText variant="heroTitle" style={{ fontSize: 28, letterSpacing: 2 }} color={STARDUST_THEME.gold.bright}>
                DROPLETT PRO
              </StardustText>
              <StardustText variant="bodySmall" color={STARDUST_THEME.text.secondary} style={{ marginTop: 4 }}>
                {isPro ? "Membership Active" : "Unlock the full power of your dreams"}
              </StardustText>
            </View>
            {isPro ? (
              <Ionicons name="checkmark-circle" size={28} color={STARDUST_THEME.gold.warm} />
            ) : (
              <Ionicons name="chevron-forward" size={24} color={STARDUST_THEME.gold.muted} />
            )}
          </View>
        </StardustCard>

        {/* Restore Purchases */}
        <View style={styles.sectionGroup}>
          <SettingRow
            icon="refresh-outline"
            label="Restore Purchases"
            onPress={handleRestorePurchases}
          />
        </View>

        {/* Legal */}
        <StardustText variant="label" color={STARDUST_THEME.text.tertiary} style={styles.sectionHeader}>
          ABOUT
        </StardustText>

        <View style={styles.sectionGroup}>
          <SettingRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <GoldDivider />
          <SettingRow
            icon="document-outline"
            label="Terms of Service"
            onPress={() => Linking.openURL(TERMS_URL)}
          />
        </View>

        <StardustText variant="timestamp" color={STARDUST_THEME.text.tertiary} align="center" style={styles.footer}>
          Droplett v1.0 · Sweet dreams
        </StardustText>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        pressed && { backgroundColor: STARDUST_THEME.bg.tertiary },
      ]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={STARDUST_THEME.gold.muted} />
        <StardustText
          variant="body"
          color={STARDUST_THEME.text.primary}
          style={{ marginLeft: SPACING.md }}
        >
          {label}
        </StardustText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={STARDUST_THEME.text.tertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
  },
  proCard: {
    marginBottom: SPACING.xl,
    backgroundColor: STARDUST_THEME.bg.secondary,
    borderColor: STARDUST_THEME.gold.muted,
    borderWidth: 1,
  },
  proCardActive: {
    borderColor: STARDUST_THEME.gold.bright,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  proContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionGroup: {
    backgroundColor: STARDUST_THEME.bg.secondary,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
