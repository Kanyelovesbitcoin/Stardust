import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import ScreenContainer from '../components/ui/ScreenContainer';
import { StardustText } from '../components/ui/StardustText';
import { STARDUST_THEME } from '../lib/theme';
import { SPACING } from '../lib/constants';

WebBrowser.maybeCompleteAuthSession();

// Safely import Clerk hooks — they require ClerkProvider in the tree
let useAuth: any = null;
let useOAuth: any = null;
try {
  const clerk = require('@clerk/clerk-expo');
  useAuth = clerk.useAuth;
  useOAuth = clerk.useOAuth;
} catch {}

const clerkAvailable = !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY && !!useAuth;

export default function SignInScreen() {
  // If Clerk isn't configured, skip auth entirely
  useEffect(() => {
    if (!clerkAvailable) {
      AsyncStorage.setItem('hasSignedIn', 'true').then(() => {
        router.replace('/');
      });
    }
  }, []);

  if (!clerkAvailable) {
    return null; // Brief flash while redirecting
  }

  return <ClerkSignIn />;
}

function ClerkSignIn() {
  const { isSignedIn } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  useEffect(() => {
    if (isSignedIn) {
      AsyncStorage.setItem('hasSignedIn', 'true').then(() => {
        router.replace('/');
      });
    }
  }, [isSignedIn]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        await AsyncStorage.setItem('hasSignedIn', 'true');
        router.replace('/');
      }
    } catch (err: any) {
      if (err?.errors?.[0]?.code === 'session_exists') {
        await AsyncStorage.setItem('hasSignedIn', 'true');
        router.replace('/');
        return;
      }
      Alert.alert('Sign In Failed', 'Unable to sign in with Google. Please try again.');
    }
  }, [startOAuthFlow]);

  return (
    <ScreenContainer backgroundSource={require('../assets/bg-settings.png')}>
      <View style={styles.container}>
        {/* Logo area */}
        <View style={styles.logoArea}>
          <Image
            source={require('../assets/star.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <StardustText variant="heroTitle" color={STARDUST_THEME.text.primary} align="center">
            Stardust
          </StardustText>
          <StardustText
            variant="body"
            color={STARDUST_THEME.text.secondary}
            align="center"
            style={styles.subtitle}
          >
            Your dream journal awaits
          </StardustText>
        </View>

        {/* Sign in buttons */}
        <View style={styles.buttonArea}>
          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGoogleSignIn}
          >
            <Ionicons name="logo-google" size={22} color="#000" />
            <StardustText variant="body" color="#000" style={styles.buttonText}>
              Continue with Google
            </StardustText>
          </Pressable>
        </View>

        <StardustText
          variant="timestamp"
          color={STARDUST_THEME.text.tertiary}
          align="center"
          style={styles.footer}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </StardustText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPadding,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  buttonArea: {
    gap: 16,
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 17,
  },
  footer: {
    paddingHorizontal: 20,
  },
});
