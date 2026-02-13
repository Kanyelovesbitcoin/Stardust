import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePaywall, PLACEMENTS } from './usePaywall';

const CONFIG = {
  SESSION_INTERVAL: 1,
  DREAM_INTERVAL: 3,
  MIN_HOURS_BETWEEN: 24,
  KEYS: {
    SESSION_COUNT: 'paywall_session_count',
    DREAM_COUNT: 'paywall_dream_count',
    LAST_SHOWN: 'paywall_last_shown_at',
    CONFIG_ATTRIBUTES_COUNT: 'paywall_config_attributes_count',
  },
};

export function usePeriodicPaywall() {
  const { showPaywall, gateFeature, setUserAttributes, isPremium } = usePaywall();

  const trackConfigAttributesEvent = useCallback(
    async (source: 'screen_view' | 'dream_saved') => {
      if (isPremium) return;

      const currentCount = parseInt(
        (await AsyncStorage.getItem(CONFIG.KEYS.CONFIG_ATTRIBUTES_COUNT)) ?? '0',
        10
      );
      const nextCount = currentCount + 1;

      await AsyncStorage.setItem(CONFIG.KEYS.CONFIG_ATTRIBUTES_COUNT, String(nextCount));

      // Important: custom attributes are user attributes (not device attributes).
      await setUserAttributes({
        appBuildString: String(nextCount),
        interactionCount: nextCount,
        interactionSource: source,
      });

      gateFeature(PLACEMENTS.CONFIG_ATTRIBUTES, () => {});
    },
    [isPremium, setUserAttributes, gateFeature]
  );

  const canShowPaywall = useCallback(async (): Promise<boolean> => {
    if (isPremium) return false;

    const lastShown = await AsyncStorage.getItem(CONFIG.KEYS.LAST_SHOWN);
    if (!lastShown) return true;

    const hoursSince = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60);
    return hoursSince >= CONFIG.MIN_HOURS_BETWEEN;
  }, [isPremium]);

  const recordPaywallShown = useCallback(async () => {
    await AsyncStorage.multiSet([
      [CONFIG.KEYS.LAST_SHOWN, String(Date.now())],
      [CONFIG.KEYS.SESSION_COUNT, '0'],
      [CONFIG.KEYS.DREAM_COUNT, '0'],
    ]);
  }, []);

  /** Call on every app session start (in _layout.tsx) */
  const trackSession = useCallback(async () => {
    if (isPremium) return;

    const count = parseInt(
      (await AsyncStorage.getItem(CONFIG.KEYS.SESSION_COUNT)) ?? '0',
      10
    );
    const newCount = count + 1;
    await AsyncStorage.setItem(CONFIG.KEYS.SESSION_COUNT, String(newCount));

    if (newCount >= CONFIG.SESSION_INTERVAL && (await canShowPaywall())) {
      await showPaywall(PLACEMENTS.SESSION_PROMPT);
      await recordPaywallShown();
    }
  }, [isPremium, showPaywall, canShowPaywall, recordPaywallShown, trackConfigAttributesEvent]);

  /** Call after each dream is saved */
  const trackDreamSaved = useCallback(async () => {
    if (isPremium) return;

    await trackConfigAttributesEvent('dream_saved');

    const count = parseInt(
      (await AsyncStorage.getItem(CONFIG.KEYS.DREAM_COUNT)) ?? '0',
      10
    );
    const newCount = count + 1;
    await AsyncStorage.setItem(CONFIG.KEYS.DREAM_COUNT, String(newCount));

    if (newCount >= CONFIG.DREAM_INTERVAL && (await canShowPaywall())) {
      await showPaywall(PLACEMENTS.SESSION_PROMPT);
      await recordPaywallShown();
    }
  }, [isPremium, showPaywall, canShowPaywall, recordPaywallShown, trackConfigAttributesEvent]);

  /** Call when a free user browses the gallery (soft upsell) */
  const trackGalleryBrowse = useCallback(async () => {
    if (isPremium) return;
    if (!(await canShowPaywall())) return;

    await showPaywall(PLACEMENTS.GALLERY_UPSELL);
    await recordPaywallShown();
  }, [isPremium, showPaywall, canShowPaywall, recordPaywallShown]);

  return {
    trackConfigAttributesEvent,
    trackSession,
    trackDreamSaved,
    trackGalleryBrowse,
    isPremium,
  };
}
