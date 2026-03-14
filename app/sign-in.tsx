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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already signed in, go straight to app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) goHome();
    });
  }, []);

  // Sign in with email + password
  const handlePasswordSignIn = useCallback(async () => {
    if (isLoading) return;
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Missing Password', 'Please enter your password.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        Alert.alert('Sign In Failed', error.message);
      } else {
        goHome();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLoading]);

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
            Droplett
          </DroplettText>
          <DroplettText variant="body" color={TEAL} align="center" style={styles.subtitle}>
            Enter your email to continue
          </DroplettText>
        </View>

        <View style={styles.formArea}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
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
            onPress={handlePasswordSignIn}
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

          <Pressable style={styles.linkWrap} onPress={() => router.push('/forgot-password')}>
            <DroplettText variant="timestamp" color={TEAL} align="center" style={styles.linkText}>
              Forgot Password?
            </DroplettText>
          </Pressable>

          <Pressable style={styles.linkWrap} onPress={() => router.replace('/sign-up')}>
            <DroplettText variant="timestamp" color={TEAL} align="center" style={styles.linkText}>
              Don't have an account? Sign Up
            </DroplettText>
          </Pressable>

        </View>

        <DroplettText variant="timestamp" color={SAGE} align="center" style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
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
  linkWrap: {
    marginTop: 4,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    opacity: 0.92,
  },
  footer: {
    paddingHorizontal: 20,
  },
});
