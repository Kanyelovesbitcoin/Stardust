import { useCallback } from 'react';
import { usePaywall } from './usePaywall';

export function usePeriodicPaywall() {
  const { isPremium } = usePaywall();

  const trackConfigAttributesEvent = useCallback(
    async (_source: 'screen_view' | 'dream_saved') => {
      // Automatic paywall/config-attribute triggers are disabled for launch stability.
    },
    []
  );

  /** Call on every app session start (in _layout.tsx) */
  const trackSession = useCallback(async () => {
    // Automatic session paywalls are disabled for launch stability.
  }, []);

  /** Call after each dream is saved */
  const trackDreamSaved = useCallback(async () => {
    // Automatic dream-save paywalls are disabled for launch stability.
  }, []);

  /** Call when a free user browses the gallery (soft upsell) */
  const trackGalleryBrowse = useCallback(async () => {
    // Automatic gallery upsells are disabled for launch stability.
  }, []);

  return {
    trackConfigAttributesEvent,
    trackSession,
    trackDreamSaved,
    trackGalleryBrowse,
    isPremium,
  };
}
