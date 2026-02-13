import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Review prompt configuration ─────────────────────────
const REVIEW_CONFIG = {
  /** Number of dream entries before first review prompt */
  DREAM_THRESHOLD: 3,
  /** Minimum days between review prompts */
  MIN_DAYS_BETWEEN: 90,
  KEYS: {
    DREAM_COUNT: 'review_dream_count',
    LAST_PROMPTED: 'review_last_prompted_at',
    HAS_REVIEWED: 'review_has_reviewed',
  },
};

/**
 * Safely attempt to request an App Store / Play Store review.
 * expo-store-review may not be available in Expo Go.
 */
async function requestNativeReview(): Promise<boolean> {
  try {
    const StoreReview = require('expo-store-review');
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
      return true;
    }
    return false;
  } catch (e) {
    // expo-store-review not installed or not available on this platform
    console.log('[Review] Store review not available:', e);
    return false;
  }
}

/**
 * Hook that manages App Store review prompting.
 *
 * Call `trackDreamForReview()` after each dream is saved.
 * The native review dialog will show after the 3rd dream entry,
 * then respect a 90-day cooldown.
 */
export function useReviewPrompt() {
  const trackDreamForReview = useCallback(async () => {
    try {
      // Check if user already reviewed (or was prompted recently)
      const hasReviewed = await AsyncStorage.getItem(REVIEW_CONFIG.KEYS.HAS_REVIEWED);
      if (hasReviewed === 'true') return;

      const lastPrompted = await AsyncStorage.getItem(REVIEW_CONFIG.KEYS.LAST_PROMPTED);
      if (lastPrompted) {
        const daysSince = (Date.now() - parseInt(lastPrompted, 10)) / (1000 * 60 * 60 * 24);
        if (daysSince < REVIEW_CONFIG.MIN_DAYS_BETWEEN) return;
      }

      // Increment dream count
      const currentCount = parseInt(
        (await AsyncStorage.getItem(REVIEW_CONFIG.KEYS.DREAM_COUNT)) ?? '0',
        10
      );
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(REVIEW_CONFIG.KEYS.DREAM_COUNT, String(newCount));

      // Check threshold
      if (newCount >= REVIEW_CONFIG.DREAM_THRESHOLD) {
        const didShow = await requestNativeReview();
        if (didShow) {
          await AsyncStorage.setItem(REVIEW_CONFIG.KEYS.LAST_PROMPTED, String(Date.now()));
          // Reset count so next cycle starts fresh after cooldown
          await AsyncStorage.setItem(REVIEW_CONFIG.KEYS.DREAM_COUNT, '0');
        }
      }
    } catch (e) {
      console.error('[Review] Failed to track dream for review:', e);
    }
  }, []);

  return { trackDreamForReview };
}
