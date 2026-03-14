import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import ScreenContainer from '../components/ui/ScreenContainer';
import { DroplettText } from '../components/ui/DroplettText';
import { SPACING } from '../lib/layout';

const NAVY = '#1F4068';
const TEAL = '#3A7D82';
const SAGE = '#9BAF94';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Extract tokens from deep link and set session
  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (!url.startsWith('droplett://')) return;
      if (url.includes('access_token') || url.includes('refresh_token')) {
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = url.substring(hashIndex + 1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            setSessionReady(true);
          }
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    // Also check if we already have a session (user might already be authed via the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => sub.remove();
  }, []);

  const handleUpdatePassword = useCallback(async () => {
    if (isLoading) return;
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Password Updated', 'Your password has been reset. Please sign in.', [
          { text: 'OK', onPress: () => router.replace('/sign-in') },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, isLoading]);

  if (!sessionReady) {
    return (
      <ScreenContainer backgroundSource={require('../assets/bg-settings.png')}>
        <View style={[styles.container, { alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={NAVY} />
          <DroplettText variant="body" color={TEAL} style={{ marginTop: 16 }}>
            Verifying reset link...
          </DroplettText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer backgroundSource={require('../assets/bg-settings.png')}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.logoArea}>
          <Image
            source={require('../assets/animal.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <DroplettText variant="heroTitle" color={NAVY} align="center">
            New Password
          </DroplettText>
          <DroplettText variant="body" color={TEAL} align="center" style={styles.subtitle}>
            Create a new password for your account
          </DroplettText>
        </View>

        <View style={styles.formArea}>
          <TextInput
            style={styles.input}
            placeholder="New Password (min 8 characters)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            autoFocus
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              isLoading && { opacity: 0.5 },
            ]}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <DroplettText variant="body" color="#FFF" style={styles.buttonText}>
                Update Password
              </DroplettText>
            )}
          </Pressable>

          <Pressable style={styles.linkWrap} onPress={() => router.replace('/sign-in')}>
            <DroplettText variant="timestamp" color={TEAL} align="center" style={styles.linkText}>
              Back to Sign In
            </DroplettText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 32,
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
  formArea: {
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 4,
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  linkWrap: {
    marginTop: 4,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    opacity: 0.92,
  },
});
