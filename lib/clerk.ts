import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const createTokenCache = () => {
  return {
    getToken: async (key: string): Promise<string | null> => {
      try {
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch {
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, token: string): Promise<void> => {
      try {
        await SecureStore.setItemAsync(key, token);
      } catch {
        // Silently fail on save errors
      }
    },
    clearToken: async (key: string): Promise<void> => {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        // Silently fail
      }
    },
  };
};

// SecureStore is not available on web
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
