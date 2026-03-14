import React, { useCallback, useState } from 'react';
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
import { supabase } from '../lib/supabase';
import ScreenContainer from '../components/ui/ScreenContainer';
import { DroplettText } from '../components/ui/DroplettText';
import { SPACING } from '../lib/layout';

const NAVY = '#1F4068';
const TEAL = '#3A7D82';
const SAGE = '#9BAF94';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSignUp = useCallback(async () => {
    if (isLoading) return;
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
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
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: 'droplett://',
        },
      });
      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        setSignUpSuccess(true);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, isLoading]);

  if (signUpSuccess) {
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
              Check Your Email
            </DroplettText>
            <DroplettText variant="body" color={TEAL} align="center" style={styles.subtitle}>
              We sent a confirmation link to {email}
            </DroplettText>
            <DroplettText
              variant="bodySmall"
              color={SAGE}
              align="center"
              style={{ marginTop: 16 }}
            >
              Tap the link in the email to confirm your account, then come back to sign in.
            </DroplettText>
          </View>

          <View style={styles.formArea}>
            <Pressable
              style={({ pressed }) => [styles.submitButton, pressed && styles.buttonPressed]}
              onPress={() => router.replace('/sign-in')}
            >
              <DroplettText variant="body" color="#FFF" style={styles.buttonText}>
                Back to Sign In
              </DroplettText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
            Create Account
          </DroplettText>
          <DroplettText variant="body" color={TEAL} align="center" style={styles.subtitle}>
            Start your dream journal
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
            placeholder="Password (min 8 characters)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
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
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <DroplettText variant="body" color="#FFF" style={styles.buttonText}>
                Sign Up
              </DroplettText>
            )}
          </Pressable>

          <Pressable style={styles.linkWrap} onPress={() => router.replace('/sign-in')}>
            <DroplettText variant="timestamp" color={TEAL} align="center" style={styles.linkText}>
              Already have an account? Sign In
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
