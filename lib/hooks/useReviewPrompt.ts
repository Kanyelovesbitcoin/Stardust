import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DREAM_COUNT_KEY = 'droplett_dream_count';
const REVIEW_PROMPTED_KEY = 'droplett_review_prompted';

/**
 * Increment dream count and trigger App Store review on the 2nd saved dream.
 * Once prompted, never prompts again.
 */
async function checkAndPromptReview(): Promise<void> {
  try {
    const alreadyPrompted = await AsyncStorage.getItem(REVIEW_PROMPTED_KEY);
    if (alreadyPrompted === 'true') return;

    const countStr = await AsyncStorage.getItem(DREAM_COUNT_KEY);
    const count = countStr ? parseInt(countStr, 10) : 0;

    const newCount = count + 1;
    await AsyncStorage.setItem(DREAM_COUNT_KEY, newCount.toString());

    if (newCount === 2) {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        setTimeout(async () => {
          await StoreReview.requestReview();
          await AsyncStorage.setItem(REVIEW_PROMPTED_KEY, 'true');
        }, 1500);
      }
    }
  } catch (error) {
    console.log('Rating prompt error:', error);
  }
}

export { checkAndPromptReview };
