import { Asset } from 'expo-asset';

// All local texture and background images to preload at app startup
const LOCAL_IMAGES = [
  require('../assets/bg-home.png'),
  require('../assets/bg-gallery.png'),
  require('../assets/bg-settings.png'),
  require('../assets/bg-voice-recording.png'),
  require('../assets/bg-type-mode.png'),
  require('../assets/app-background-stars.png'),
  require('../assets/record-button.png'),
  require('../assets/onboarding-bg-1.png'),
  require('../assets/onboarding-bg-2.png'),
  require('../assets/onboarding-bg-3.png'),
  require('../assets/onboarding-bg-4.png'),
  require('../assets/onboarding-bg-5.png'),
];

export async function preloadAllImages(): Promise<void> {
  const imageAssets = LOCAL_IMAGES.map((image) =>
    Asset.fromModule(image).downloadAsync()
  );
  await Promise.all(imageAssets);
}
