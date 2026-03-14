import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabaseAuth } from '../lib/useSupabaseAuth';
import { DroplettProProvider } from '../lib/superwall';
import { initializeNotifications } from '../lib/notifications';
import { DROPLETT_THEME } from '../lib/theme';
import { preloadAllImages } from '../lib/image-cache';
import { supabase } from '../lib/supabase';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import {
  ONBOARDED_KEY,
  resolveLaunchRedirect,
  shouldRunPostLaunchTasks,
} from '../lib/launchRouting';
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
let SuperwallProvider: React.ComponentType<{ apiKeys: any; children: React.ReactNode; onConfigurationError?: (error: unknown) => void }> | null = null;
try {
  SuperwallProvider = require('expo-superwall').SuperwallProvider;
} catch {
  // Native module not available (Expo Go) — DroplettProProvider handles the fallback
}

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

// Prevent the splash screen from auto-hiding before initial launch state is ready.
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [superwallFallbackEnabled, setSuperwallFallbackEnabled] = useState(false);

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
    let isMounted = true;

    AsyncStorage.getItem(ONBOARDED_KEY)
      .then((value) => {
        if (isMounted) {
          setHasOnboarded(value === 'true');
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasOnboarded(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void preloadAllImages().catch((preloadError) => {
        console.warn('[Images] Deferred preload failed:', preloadError);
      });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Refresh auth session when app returns from background to prevent stale tokens
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        supabase.auth.getSession().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if ((loaded || error) && hasOnboarded !== null) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error, hasOnboarded]);

  if ((!loaded && !error) || hasOnboarded === null) {
    return null;
  }

  const screens = (
    <DroplettProProvider forceFallback={superwallFallbackEnabled}>
      <SessionTracker hasOnboarded={hasOnboarded} />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: DROPLETT_THEME.bg.primary },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="record" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="dream/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', contentStyle: { backgroundColor: '#F0EEE8' } }} />
        <Stack.Screen name="sign-in" options={{ animation: 'fade', contentStyle: { backgroundColor: '#F0EEE8' } }} />
        <Stack.Screen name="sign-up" options={{ animation: 'slide_from_right', contentStyle: { backgroundColor: '#F0EEE8' } }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right', contentStyle: { backgroundColor: '#F0EEE8' } }} />
        <Stack.Screen name="reset-password" options={{ animation: 'slide_from_right', contentStyle: { backgroundColor: '#F0EEE8' } }} />
        <Stack.Screen name="admin-sign-in" options={{ animation: 'slide_from_right', contentStyle: { backgroundColor: '#F0EEE8' } }} />
      </Stack>
    </DroplettProProvider>
  );

  let app: React.ReactNode = (
    <ErrorBoundary>
      <ConvexProviderWithAuth client={convex} useAuth={useSupabaseAuth}>
        <AuthGate hasOnboarded={hasOnboarded}>
          {screens}
        </AuthGate>
      </ConvexProviderWithAuth>
    </ErrorBoundary>
  );

  // Wrap in SuperwallProvider if native module is available
  if (SuperwallProvider && !superwallFallbackEnabled) {
    app = (
      <SuperwallProvider
        apiKeys={{
          ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY,
          android: process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY,
        }}
        onConfigurationError={(configurationError: unknown) => {
          console.error('[Superwall] Configuration failed, enabling safe fallback:', configurationError);
          setSuperwallFallbackEnabled(true);
        }}
      >
        {app}
      </SuperwallProvider>
    );
  }

  return app;
}

/** Guards the main app behind authentication state */
function AuthGate({
  children,
  hasOnboarded,
}: {
  children: React.ReactNode;
  hasOnboarded: boolean;
}) {
  const { isLoading, isAuthenticated } = useSupabaseAuth();
  const pathname = usePathname();
  const pendingRedirectRef = useRef<string | null>(null);

  // Debounce auth state to prevent flash-redirect on login
  // Wait a tick after isLoading becomes false before acting on auth state
  const [authSettled, setAuthSettled] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setAuthSettled(false);
      return;
    }
    const timer = setTimeout(() => setAuthSettled(true), 100);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!authSettled) return;

    const redirectTo = resolveLaunchRedirect({
      pathname,
      hasOnboarded,
      isAuthenticated,
    });

    if (!redirectTo || redirectTo === pathname || pendingRedirectRef.current === redirectTo) {
      return;
    }

    pendingRedirectRef.current = redirectTo;
    router.replace(redirectTo);

    const timeout = setTimeout(() => {
      if (pendingRedirectRef.current === redirectTo) {
        pendingRedirectRef.current = null;
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [hasOnboarded, isAuthenticated, authSettled, pathname]);

  return <>{children}</>;
}

/** Defers nonessential native startup work until the app is on a stable signed-in route. */
function SessionTracker({ hasOnboarded }: { hasOnboarded: boolean }) {
  const pathname = usePathname();
  const { isAuthenticated } = useSupabaseAuth();
  const didInitializeNotifications = useRef(false);

  useEffect(() => {
    if (didInitializeNotifications.current) {
      return;
    }

    if (!shouldRunPostLaunchTasks({ pathname, hasOnboarded, isAuthenticated })) {
      return;
    }

    didInitializeNotifications.current = true;
    const timer = setTimeout(() => {
      void initializeNotifications();
    }, 0);

    return () => clearTimeout(timer);
  }, [hasOnboarded, isAuthenticated, pathname]);

  return null;
}

