import { useCallback } from 'react';
import { useStardustPro } from '../superwall';

// All placement names — must match Superwall dashboard configuration
export const PLACEMENTS = {
  APP_LAUNCH: 'app_launch',
  CONFIG_ATTRIBUTES: 'config_attributes',
  ONBOARDING_COMPLETE: 'app_launch',
  INTERPRET_LIMIT: 'interpret_limit_reached',
  VISUALIZE_LIMIT: 'visualize_limit_reached',
  SESSION_PROMPT: 'session_prompt',
  GALLERY_UPSELL: 'gallery_upsell',
  SETTINGS_UPGRADE: 'settings_upgrade',
} as const;

export type PaywallPlacement = (typeof PLACEMENTS)[keyof typeof PLACEMENTS];

interface UsePaywallOptions {
  onDismiss?: () => void;
  onPurchase?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Centralized paywall hook. Components should never import expo-superwall directly.
 * Delegates to StardustProProvider which integrates with Superwall SDK.
 */
export function usePaywall(options?: UsePaywallOptions) {
  const {
    isPro,
    showPaywall: superwallShowPaywall,
    registerFeature,
    registerFeatureWithDailyFree,
    hasFreeImageToday,
    setUserAttributes,
  } = useStardustPro();

  const showPaywall = useCallback(
    async (placement: PaywallPlacement) => {
      if (isPro) {
        options?.onPurchase?.();
        return true;
      }

      try {
        const unlocked = await superwallShowPaywall(placement);
        if (unlocked) {
          options?.onPurchase?.();
        } else {
          options?.onDismiss?.();
        }
        return unlocked;
      } catch (error) {
        console.error('[Paywall] Failed to show:', error);
        options?.onError?.(error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    },
    [isPro, superwallShowPaywall, options]
  );

  const gateFeature = useCallback(
    (placement: PaywallPlacement, feature: () => void | Promise<void>) => {
      // Delegates to StardustProProvider's registerFeature
      // If user has active subscription, feature runs immediately
      // Otherwise, Superwall paywall is shown
      registerFeature(placement, feature);
    },
    [registerFeature]
  );

  /** Gate with 1 free daily use — then paywall */
  const gateFeatureWithDailyFree = useCallback(
    (placement: PaywallPlacement, feature: () => void | Promise<void>) => {
      registerFeatureWithDailyFree(placement, feature);
    },
    [registerFeatureWithDailyFree]
  );

  return {
    showPaywall,
    gateFeature,
    gateFeatureWithDailyFree,
    setUserAttributes,
    hasFreeImageToday,
    isPremium: isPro,
    PLACEMENTS,
  };
}

