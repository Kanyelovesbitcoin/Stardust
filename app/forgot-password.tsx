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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetRequest = useCallback(async () => {
    if (isLoading) return;
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'droplett://reset-password',
      });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Always show success (security best practice — don't reveal if email exists)
        setSent(true);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoading]);

  if (sent) {
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
              If an account exists for {email}, we sent a password reset link.
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
            Reset Password
          </DroplettText>
          <DroplettText variant="body" color={TEAL} align="center" style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
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
            autoFocus
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              isLoading && { opacity: 0.5 },
            ]}
            onPress={handleResetRequest}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <DroplettText variant="body" color="#FFF" style={styles.buttonText}>
                Send Reset Link
              </DroplettText>
            )}
          </Pressable>

          <Pressable style={styles.linkWrap} onPress={() => router.back()}>
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
