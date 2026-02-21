import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Safely detect if expo-superwall native module is available ───
let superwallAvailable = false;
let useSuperwall: any = null;
let useUser: any = null;
let usePlacement: any = null;

try {
  const sw = require('expo-superwall');
  useSuperwall = sw.useSuperwall;
  useUser = sw.useUser;
  usePlacement = sw.usePlacement;
  superwallAvailable = true;
} catch {
  // Native module not available (Expo Go / no dev client)
}

// ─── Daily free image helpers ───────────────────────────
const FREE_IMAGE_KEY = 'free_daily_image_date';

/** Returns today as YYYY-MM-DD string */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Check if the user still has their free daily image available */
async function checkFreeImageAvailable(): Promise<boolean> {
  const lastUsed = await AsyncStorage.getItem(FREE_IMAGE_KEY);
  return lastUsed !== todayKey();
}

/** Mark the free daily image as consumed for today */
async function consumeFreeImage(): Promise<void> {
  await AsyncStorage.setItem(FREE_IMAGE_KEY, todayKey());
}

// ─── Types ──────────────────────────────────────────────
interface StardustProContextValue {
  isPro: boolean;
  isLoading: boolean;
  /** Gate a feature behind the paywall. If Pro, runs immediately. Otherwise shows paywall. */
  registerFeature: (placement: string, feature: () => void | Promise<void>) => void;
  /** Gate a feature with 1 free daily use. If free use available or Pro, runs immediately. Otherwise shows paywall. */
  registerFeatureWithDailyFree: (placement: string, feature: () => void | Promise<void>) => void;
  /** Whether the user still has their free daily image */
  hasFreeImageToday: boolean;
  /** Manually refresh the free image status */
  refreshFreeImageStatus: () => Promise<void>;
  /**
   * Presents a paywall and returns whether the user unlocked premium access.
   */
  showPaywall: (placement?: string) => Promise<boolean>;
  /**
   * Updates Superwall user attributes used in campaign filters.
   */
  setUserAttributes: (attributes: Record<string, any>) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const StardustProContext = createContext<StardustProContextValue>({
  isPro: false,
  isLoading: false,
  registerFeature: () => { },
  registerFeatureWithDailyFree: () => { },
  hasFreeImageToday: true,
  refreshFreeImageStatus: async () => { },
  showPaywall: async () => false,
  setUserAttributes: async () => { },
  restorePurchases: async () => { },
});

// ─── Provider (Superwall SDK with dev fallback) ─────────
export function StardustProProvider({ children }: { children: React.ReactNode }) {
  if (superwallAvailable) {
    return <SuperwallProProvider>{children}</SuperwallProProvider>;
  }
  return <DevFallbackProvider>{children}</DevFallbackProvider>;
}

// ─── Shared hook: free daily image state ────────────────
function useFreeImageState(isPro: boolean) {
  const [hasFreeImageToday, setHasFreeImageToday] = useState(true);

  const refreshFreeImageStatus = useCallback(async () => {
    if (isPro) {
      setHasFreeImageToday(true); // Pro users don't need free credits
      return;
    }
    const available = await checkFreeImageAvailable();
    setHasFreeImageToday(available);
  }, [isPro]);

  // Check on mount and when isPro changes
  useEffect(() => {
    refreshFreeImageStatus();
  }, [refreshFreeImageStatus]);

  return { hasFreeImageToday, setHasFreeImageToday, refreshFreeImageStatus };
}

// ─── Real Superwall Provider ────────────────────────────
function SuperwallProProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isConfigured } = useSuperwall();
  const { subscriptionStatus, update } = useUser();
  const { registerPlacement } = usePlacement();

  const isPro = subscriptionStatus?.status === 'ACTIVE';
  const { hasFreeImageToday, setHasFreeImageToday, refreshFreeImageStatus } = useFreeImageState(isPro);

  const registerFeature = useCallback(
    (placement: string, feature: () => void | Promise<void>) => {
      registerPlacement({ placement, feature });
    },
    [registerPlacement]
  );

  const registerFeatureWithDailyFree = useCallback(
    (placement: string, feature: () => void | Promise<void>) => {
      if (isPro) {
        feature();
        return;
      }

      // Check for free daily use
      checkFreeImageAvailable().then((available) => {
        if (available) {
          // Use the free credit — run feature, then mark as consumed
          consumeFreeImage().then(() => {
            setHasFreeImageToday(false);
            feature();
          });
        } else {
          // No free credit — show paywall
          registerPlacement({ placement, feature });
        }
      });
    },
    [isPro, registerPlacement, setHasFreeImageToday]
  );

  const showPaywall = useCallback(
    async (placement: string = 'settings_upgrade') => {
      if (isPro) return true;

      let unlocked = false;
      try {
        await registerPlacement({
          placement,
          // Runs when the user is entitled (already active, purchased, or restored).
          feature: () => {
            unlocked = true;
          },
        });
      } catch (error) {
        console.error('[Superwall] Failed to show paywall:', error);
      }
      return unlocked;
    },
    [isPro, registerPlacement]
  );

  const setUserAttributes = useCallback(
    async (attributes: Record<string, any>) => {
      try {
        await update((oldAttributes: Record<string, any>) => ({
          ...(oldAttributes ?? {}),
          ...attributes,
        }));
      } catch (error) {
        console.error('[Superwall] Failed to update user attributes:', error);
      }
    },
    [update]
  );

  const restorePurchases = useCallback(async () => {
    try {
      const sw = require('expo-superwall').default;
      await sw.restorePurchases();
      Alert.alert('Restore Complete', 'Your purchases have been restored successfully.');
    } catch (error: any) {
      Alert.alert('Restore Failed', error?.message || 'Unable to restore purchases. Please try again.');
    }
  }, []);

  return (
    <StardustProContext.Provider
      value={{
        isPro,
        isLoading: isLoading || !isConfigured,
        registerFeature,
        registerFeatureWithDailyFree,
        hasFreeImageToday,
        refreshFreeImageStatus,
        showPaywall,
        setUserAttributes,
        restorePurchases,
      }}
    >
      {children}
    </StardustProContext.Provider>
  );
}

// ─── Dev Fallback Provider (Alert-based, no native module) ──
function DevFallbackProvider({ children }: { children: React.ReactNode }) {
  const [devProOverride, setDevProOverride] = useState(false);

  const isPro = devProOverride;
  const { hasFreeImageToday, setHasFreeImageToday, refreshFreeImageStatus } = useFreeImageState(isPro);

  /** Show an Alert-based dev paywall. Returns a promise. */
  const presentPaywall = useCallback(
    (placement: string, feature?: () => void | Promise<void>): Promise<'unlocked' | 'dismissed'> => {
      return new Promise<'unlocked' | 'dismissed'>((resolve) => {
        if (__DEV__) {
          Alert.alert(
            'Droplett Pro (Dev)',
            `Paywall would appear here for "${placement}". Unlock in dev mode?`,
            [
              { text: 'Not now', style: 'cancel', onPress: () => resolve('dismissed') },
              {
                text: 'Unlock',
                onPress: () => {
                  setDevProOverride(true);
                  if (feature) feature();
                  resolve('unlocked');
                },
              },
            ]
          );
        } else {
          // Production fallback — don't allow free unlock
          Alert.alert(
            'Upgrade Required',
            'This feature requires Droplett Pro. Please try again later.',
            [{ text: 'OK', onPress: () => resolve('dismissed') }]
          );
        }
      });
    },
    []
  );

  const registerFeature = useCallback(
    (placement: string, feature: () => void | Promise<void>) => {
      if (isPro) {
        feature();
        return;
      }
      presentPaywall(placement, feature);
    },
    [isPro, presentPaywall]
  );

  const registerFeatureWithDailyFree = useCallback(
    (placement: string, feature: () => void | Promise<void>) => {
      if (isPro) {
        feature();
        return;
      }

      checkFreeImageAvailable().then((available) => {
        if (available) {
          consumeFreeImage().then(() => {
            setHasFreeImageToday(false);
            feature();
          });
        } else {
          presentPaywall(placement, feature);
        }
      });
    },
    [isPro, setHasFreeImageToday, presentPaywall]
  );

  const showPaywall = useCallback(
    async (placement?: string) => {
      if (isPro) return true;
      const result = await presentPaywall(placement ?? 'settings_upgrade');
      return result === 'unlocked';
    },
    [isPro, presentPaywall]
  );

  const setUserAttributes = useCallback(async (_attributes: Record<string, any>) => {
    // No-op in dev fallback mode (Expo Go / no native module).
  }, []);

  const restorePurchases = useCallback(async () => {
    if (__DEV__) {
      Alert.alert('Restore Purchases', 'Purchase restoration is not available in development mode.', [{ text: 'OK' }]);
    } else {
      Alert.alert('Restore Purchases', 'Unable to restore purchases. Please try again later.', [{ text: 'OK' }]);
    }
  }, []);

  return (
    <StardustProContext.Provider
      value={{
        isPro,
        isLoading: false,
        registerFeature,
        registerFeatureWithDailyFree,
        hasFreeImageToday,
        refreshFreeImageStatus,
        showPaywall,
        setUserAttributes,
        restorePurchases,
      }}
    >
      {children}
    </StardustProContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────
export function useStardustPro(): StardustProContextValue {
  return useContext(StardustProContext);
}
