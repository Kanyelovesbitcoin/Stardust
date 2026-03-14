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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { supabase } from '../lib/supabase';
import ScreenContainer from '../components/ui/ScreenContainer';
import { DroplettText } from '../components/ui/DroplettText';
import { SPACING } from '../lib/layout';

const NAVY = '#1F4068';
const TEAL = '#3A7D82';
const SAGE = '#9BAF94';

function goHome() {
  AsyncStorage.setItem('hasSignedIn', 'true').then(() => {
    router.replace('/');
  });
}

export default function AdminSignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) goHome();
    });
  }, []);

  const handleAdminSignIn = useCallback(async () => {
    if (isLoading) return;

    const loginEmail = username.trim().toLowerCase();
    const loginPassword = password.trim();

    if (!loginEmail) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    if (!loginPassword) {
      Alert.alert('Missing password', 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInResult.error) {
        throw signInResult.error;
      }

      goHome();
    } catch (err: any) {
      Alert.alert('Sign in failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, username, password]);

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
            Admin Sign In
          </DroplettText>
          <DroplettText variant="body" color={TEAL} align="center" style={styles.subtitle}>
            Reviewer access
          </DroplettText>
        </View>

        <View style={styles.formArea}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              isLoading && { opacity: 0.5 },
            ]}
            onPress={handleAdminSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <DroplettText variant="body" color="#FFF" style={styles.buttonText}>
                Sign In
              </DroplettText>
            )}
          </Pressable>

          <Pressable style={styles.backLinkWrap} onPress={() => router.replace('/sign-in')}>
            <DroplettText variant="timestamp" color={TEAL} align="center" style={styles.backLinkText}>
              {'<- Back to email sign in'}
            </DroplettText>
          </Pressable>
        </View>

        <DroplettText variant="timestamp" color={SAGE} align="center" style={styles.footer}>
          Use reviewer credentials provided in App Store Connect notes.
        </DroplettText>
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
  backLinkWrap: {
    marginTop: 4,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backLinkText: {
    opacity: 0.92,
  },
  footer: {
    paddingHorizontal: 20,
  },
});
