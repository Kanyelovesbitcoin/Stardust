import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePaywall, PLACEMENTS } from '../lib/hooks/usePaywall';
import { STARDUST_THEME } from '../lib/theme';
import { RADIUS, SPACING } from '../lib/layout';
import { StardustText } from '../components/ui/StardustText';
import { StardustCard } from '../components/ui/StardustCard';
import ScreenContainer from '../components/ui/ScreenContainer';
import { GoldDivider } from '../components/ui/GoldDivider';

export default function SettingsScreen() {
  const { showPaywall, isPremium: isPro } = usePaywall();

  const handleShowPaywall = () => showPaywall(PLACEMENTS.SETTINGS_UPGRADE);

  const handleRestorePurchases = () => {
    // TODO: When Superwall is configured, replace with real restore
    Alert.alert(
      'Restore Purchases',
      'Purchase restoration is not available in development mode.',
      [{ text: 'OK' }]
    );
  };
  // const insets = useSafeAreaInsets(); // Handled by ScreenContainer

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
                STARDUST PRO
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

        {/* Privacy & Security */}
        <StardustText variant="label" color={STARDUST_THEME.text.tertiary} style={styles.sectionHeader}>
          PRIVACY & SECURITY
        </StardustText>

        <View style={styles.sectionGroup}>
          <SettingRow icon="shield-checkmark-outline" label="E2E Encryption" isPro />
          <GoldDivider />
          <SettingRow icon="finger-print-outline" label="Biometric Lock" />
          <GoldDivider />
          <SettingRow icon="cloud-offline-outline" label="Local-Only Mode" />
        </View>

        {/* Account */}
        <StardustText variant="label" color={STARDUST_THEME.text.tertiary} style={styles.sectionHeader}>
          ACCOUNT
        </StardustText>

        <View style={styles.sectionGroup}>
          <SettingRow icon="refresh-outline" label="Restore Purchases" onPress={handleRestorePurchases} />
          <GoldDivider />
          <SettingRow icon="download-outline" label="Export Dreams" isPro />
          <GoldDivider />
          <SettingRow
            icon="trash-outline"
            label="Delete All Data"
            isDestructive
            onPress={() => Alert.alert("Are you sure?", "This will wipe all data locally and on server.")}
          />
        </View>

        {/* About */}
        <StardustText variant="label" color={STARDUST_THEME.text.tertiary} style={styles.sectionHeader}>
          ABOUT
        </StardustText>

        <View style={styles.sectionGroup}>
          <SettingRow icon="document-text-outline" label="Privacy Policy" />
          <GoldDivider />
          <SettingRow icon="document-outline" label="Terms of Service" />
        </View>

        <StardustText variant="timestamp" color={STARDUST_THEME.text.tertiary} align="center" style={styles.footer}>
          Stardust v1.0 · Sweet dreams
        </StardustText>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({
  icon,
  label,
  isPro,
  isDestructive,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  isPro?: boolean;
  isDestructive?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        pressed && { backgroundColor: STARDUST_THEME.bg.tertiary } // Subtle press feedback
      ]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? STARDUST_THEME.mood.scared : STARDUST_THEME.gold.muted}
        />
        <StardustText
          variant="body"
          color={isDestructive ? STARDUST_THEME.mood.scared : STARDUST_THEME.text.primary}
          style={{ marginLeft: SPACING.md }}
        >
          {label}
        </StardustText>
      </View>

      <View style={styles.rowRight}>
        {isPro && (
          <View style={styles.proBadge}>
            <StardustText variant="label" color={STARDUST_THEME.text.inverse} style={{ fontSize: 10 }}>PRO</StardustText>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={STARDUST_THEME.text.tertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STARDUST_THEME.bg.primary,
  },
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
    backgroundColor: 'rgba(212, 175, 55, 0.1)', // Gold tint
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
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  proBadge: {
    backgroundColor: STARDUST_THEME.gold.warm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  footer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
