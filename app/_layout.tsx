import React, { useEffect, useState } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { StardustProProvider } from '../lib/superwall';
import { usePeriodicPaywall } from '../lib/hooks/usePeriodicPaywall';
import { initializeNotifications } from '../lib/notifications';
import { STARDUST_THEME } from '../lib/theme';
import { preloadAllImages } from '../lib/image-cache';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold
} from '@expo-google-fonts/cormorant-garamond';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold
} from '@expo-google-fonts/outfit';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

// ─── Safely import SuperwallProvider (requires native module) ───
let SuperwallProvider: React.ComponentType<{ apiKeys: any; children: React.ReactNode }> | null = null;
try {
  SuperwallProvider = require('expo-superwall').SuperwallProvider;
} catch {
  // Native module not available (Expo Go) — StardustProProvider handles the fallback
}

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [imagesReady, setImagesReady] = useState(false);

  const [loaded, error] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    preloadAllImages()
      .catch((e) => console.warn('Image preload failed:', e))
      .finally(() => setImagesReady(true));
  }, []);

  useEffect(() => {
    if ((loaded || error) && imagesReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, imagesReady]);

  if ((!loaded && !error) || !imagesReady) {
    return null;
  }

  const appTree = (
    <ConvexProvider client={convex}>
      <StardustProProvider>
        <SessionTracker />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: STARDUST_THEME.bg.primary },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="record"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="dream/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen name="gallery" />
          <Stack.Screen name="settings" />
          <Stack.Screen
            name="onboarding"
            options={{
              animation: 'fade',
              contentStyle: { backgroundColor: '#F0EEE8' },
            }}
          />
        </Stack>
      </StardustProProvider>
    </ConvexProvider>
  );

  // Wrap in SuperwallProvider only if native module is available
  if (SuperwallProvider) {
    return (
      <SuperwallProvider
        apiKeys={{
          ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY,
          android: process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY,
        }}
      >
        {appTree}
      </SuperwallProvider>
    );
  }

  return appTree;
}

/** Tracks app sessions for periodic paywall triggers */
function SessionTracker() {
  const pathname = usePathname();
  const { trackSession, trackConfigAttributesEvent } = usePeriodicPaywall();

  useEffect(() => {
    trackSession();
    // Initialize notification system (schedules nudges, sets up channels)
    initializeNotifications();
  }, []);

  useEffect(() => {
    // Count each route transition for config_attributes campaign checks.
    trackConfigAttributesEvent('screen_view');
  }, [pathname, trackConfigAttributesEvent]);

  return null;
}
