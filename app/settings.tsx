import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../lib/useSupabaseAuth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePaywall, PLACEMENTS } from '../lib/hooks/usePaywall';
import { useDroplettPro } from '../lib/superwall';
import { DROPLETT_THEME } from '../lib/theme';
import { RADIUS, SPACING } from '../lib/layout';
import { DroplettText } from '../components/ui/DroplettText';
import { DroplettCard } from '../components/ui/DroplettCard';
import ScreenContainer from '../components/ui/ScreenContainer';
import { GoldDivider } from '../components/ui/GoldDivider';

const PRIVACY_URL = 'https://www.termsfeed.com/live/7b7ca102-1afe-4e05-afc9-46f4823900be';
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export default function SettingsScreen() {
  const { showPaywall, isPremium: isPro } = usePaywall();
  const { restorePurchases } = useDroplettPro();
  const entitlement = useQuery(api.entitlements.getEntitlement);
  const deleteAllUserData = useMutation(api.dreams.deleteAllUserData);
  const { isAuthenticated: isSignedIn } = useSupabaseAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleShowPaywall = () => showPaywall(PLACEMENTS.SETTINGS_UPGRADE);

  const handleRestorePurchases = () => restorePurchases();

  const clearLocalState = async () => {
    await AsyncStorage.multiRemove([
      'hasSignedIn',
      'ai_data_consent_accepted',
      'free_daily_interpret_date',
    ]).catch(() => {});
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearLocalState();
          await supabase.auth.signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your dreams and account data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All dreams, interpretations, and visualizations will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeletingAccount(true);
                    try {
                      // 1. Delete all app data from Convex
                      await deleteAllUserData();

                      // 2. Delete auth account via Edge Function
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session?.access_token) {
                        const res = await fetch(
                          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`,
                          {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${session.access_token}`,
                              'Content-Type': 'application/json',
                            },
                          }
                        );
                        if (!res.ok) {
                          console.warn('Edge function delete-user failed:', await res.text());
                          // Continue anyway — app data is already deleted
                        }
                      }

                      // 3. Clean up local state and sign out
                      await clearLocalState();
                      await supabase.auth.signOut();
                      router.replace('/sign-in');
                    } catch (e) {
                      console.error('Delete account error:', e);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer backgroundSource={require('../assets/bg-settings.png')}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={DROPLETT_THEME.gold.muted} />
        </Pressable>
        <DroplettText variant="screenTitle" color={DROPLETT_THEME.text.primary}>
          Settings
        </DroplettText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Pro Card */}
        <DroplettCard
          style={[styles.proCard, isPro && styles.proCardActive]}
          onPress={isPro ? undefined : handleShowPaywall}
        >
          <View style={styles.proContent}>
            <View>
              <DroplettText variant="heroTitle" style={{ fontSize: 28, letterSpacing: 2 }} color={DROPLETT_THEME.gold.bright}>
                DROPLETT PRO
              </DroplettText>
              <DroplettText variant="bodySmall" color={DROPLETT_THEME.text.secondary} style={{ marginTop: 4 }}>
                {isPro ? "Membership Active" : "Unlock the full power of your dreams"}
              </DroplettText>
            </View>
            {isPro ? (
              <Ionicons name="checkmark-circle" size={28} color={DROPLETT_THEME.gold.warm} />
            ) : (
              <Ionicons name="chevron-forward" size={24} color={DROPLETT_THEME.gold.muted} />
            )}
          </View>
        </DroplettCard>

        {/* Usage Stats (Pro only) */}
        {isPro && entitlement && (
          <>
            <DroplettText variant="label" color={DROPLETT_THEME.text.tertiary} style={styles.sectionHeader}>
              MONTHLY USAGE
            </DroplettText>
            <View style={styles.sectionGroup}>
              <View style={styles.usageRow}>
                <DroplettText variant="body" color={DROPLETT_THEME.text.primary}>
                  Interpretations
                </DroplettText>
                <DroplettText variant="body" color={DROPLETT_THEME.gold.warm}>
                  {entitlement.interpretationsUsed}/{entitlement.interpretationsLimit}
                </DroplettText>
              </View>
              <GoldDivider />
              <View style={styles.usageRow}>
                <DroplettText variant="body" color={DROPLETT_THEME.text.primary}>
                  Visualizations
                </DroplettText>
                <DroplettText variant="body" color={DROPLETT_THEME.gold.warm}>
                  {entitlement.visualizationsUsed}/{entitlement.visualizationsLimit}
                </DroplettText>
              </View>
            </View>
          </>
        )}

        {/* Account */}
        <DroplettText variant="label" color={DROPLETT_THEME.text.tertiary} style={styles.sectionHeader}>
          ACCOUNT
        </DroplettText>
        <View style={styles.sectionGroup}>
          {isSignedIn ? (
            <>
              <SettingRow
                icon="checkmark-circle-outline"
                label="Signed In"
                onPress={() => { }}
              />
              <GoldDivider />
              <SettingRow
                icon="log-out-outline"
                label="Sign Out"
                onPress={handleSignOut}
              />
              <GoldDivider />
              <SettingRow
                icon="trash-outline"
                label={isDeletingAccount ? "Deleting..." : "Delete Account"}
                onPress={isDeletingAccount ? undefined : handleDeleteAccount}
              />
            </>
          ) : (
            <SettingRow
              icon="log-in-outline"
              label="Sign In"
              onPress={() => router.push('/sign-in')}
            />
          )}
        </View>

        {/* Restore Purchases */}
        <View style={styles.sectionGroup}>
          <SettingRow
            icon="refresh-outline"
            label="Restore Purchases"
            onPress={handleRestorePurchases}
          />
        </View>

        {/* Legal */}
        <DroplettText variant="label" color={DROPLETT_THEME.text.tertiary} style={styles.sectionHeader}>
          ABOUT
        </DroplettText>

        <View style={styles.sectionGroup}>
          <SettingRow
            icon="shield-checkmark-outline"
            label="AI Data & Privacy"
            onPress={() => router.push('/privacy')}
          />
          <GoldDivider />
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

        <DroplettText variant="timestamp" color={DROPLETT_THEME.text.tertiary} align="center" style={styles.footer}>
          Droplett v1.0 · Sweet dreams
        </DroplettText>
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
        pressed && { backgroundColor: DROPLETT_THEME.bg.tertiary },
      ]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={DROPLETT_THEME.gold.muted} />
        <DroplettText
          variant="body"
          color={DROPLETT_THEME.text.primary}
          style={{ marginLeft: SPACING.md }}
        >
          {label}
        </DroplettText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={DROPLETT_THEME.text.tertiary} />
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
    backgroundColor: DROPLETT_THEME.bg.secondary,
    borderColor: DROPLETT_THEME.gold.muted,
    borderWidth: 1,
  },
  proCardActive: {
    borderColor: DROPLETT_THEME.gold.bright,
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
    backgroundColor: DROPLETT_THEME.bg.secondary,
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
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  footer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
