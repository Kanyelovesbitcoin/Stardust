import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_CONSENT_KEY = 'ai_data_consent_accepted';

export async function hasAIConsent(): Promise<boolean> {
  const value = await AsyncStorage.getItem(AI_CONSENT_KEY);
  return value === 'true';
}

export async function setAIConsent(): Promise<void> {
  await AsyncStorage.setItem(AI_CONSENT_KEY, 'true');
}

export async function clearAIConsent(): Promise<void> {
  await AsyncStorage.removeItem(AI_CONSENT_KEY);
}
