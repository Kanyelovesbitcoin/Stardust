import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DroplettText } from '../components/ui/DroplettText';
import { PLACEMENTS, usePaywall } from '../lib/hooks/usePaywall';
import { SPACING, RADIUS } from '../lib/layout';
import { ONBOARDED_KEY } from '../lib/launchRouting';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const DROPLET = {
  navy: '#1B3A5C',
  blue: '#2E6B9E',
  lightBlue: '#4A90C4',
  mutedBlue: '#7BAFD4',
  paper: '#F0EEE8',
  title: '#1A1A1A',
  body: '#3A3A3A',
  muted: '#5A5A5A',
} as const;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TOTAL_SLIDES = 5;
const TOTAL_STEPS = TOTAL_SLIDES + 1;
const FINAL_STEP_INDEX = TOTAL_STEPS - 1;

const SLIDE_BACKGROUNDS = [
  require('../assets/onboarding-bg-1.png'),
  require('../assets/onboarding-bg-2.png'),
  require('../assets/onboarding-bg-3.png'),
  require('../assets/onboarding-bg-1.png'),
  require('../assets/onboarding-bg-1.png'),
];

type SlideData = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  heroImage: ReturnType<typeof require>;
  highlights?: { icon: IconName; text: string }[];
  stat?: { value: string; label: string };
  kind: 'value' | 'feature' | 'social' | 'personal';
};

const SLIDES: SlideData[] = [
  {
    id: 'where-dreams-begin',
    kind: 'value',
    icon: 'moon-outline',
    heroImage: require('../assets/wing-3.png'),
    title: 'Where Dreams\nBegin',
    subtitle:
      'Every night your mind goes somewhere. Droplett is where you bring it back.',
    highlights: [
      { icon: 'alarm-outline', text: 'Capture dreams the moment you wake' },
      { icon: 'mic-outline', text: 'Voice or text — whatever comes naturally' },
      { icon: 'checkmark-circle-outline', text: 'Nothing gets lost again' },
    ],
  },
  {
    id: 'let-dreams-take-flight',
    kind: 'feature',
    icon: 'navigate-outline',
    heroImage: require('../assets/animal.png'),
    title: 'Let Your Dreams\nTake Flight',
    subtitle:
      "Your subconscious is speaking. AI helps you understand what it's saying.",
    highlights: [
      { icon: 'sparkles-outline', text: 'AI-powered dream interpretation' },
      { icon: 'eye-outline', text: 'Symbol and emotion analysis' },
      { icon: 'trending-up-outline', text: 'Patterns revealed over time' },
    ],
  },
  {
    id: 'crafted-like-a-dream',
    kind: 'feature',
    icon: 'color-palette-outline',
    heroImage: require('../assets/evil-eye.png'),
    title: 'Crafted Like\na Dream',
    subtitle:
      "Droplett isn't just a journal. It's a hand-painted world your dreams live inside.",
    highlights: [
      { icon: 'image-outline', text: 'Watercolor parchment textures' },
      { icon: 'brush-outline', text: 'Four ink styles: Nightmare, Lucid, Vivid, Ocean' },
      { icon: 'diamond-outline', text: 'Every dream gets its own visual identity' },
    ],
  },
  {
    id: 'dreams-in-full-bloom',
    kind: 'personal',
    icon: 'flower-outline',
    heroImage: require('../assets/hope.png'),
    title: 'Your Dreams,\nIn Full Bloom',
    subtitle:
      'Watch your dream life grow. The more you capture, the more you understand yourself.',
    highlights: [
      { icon: 'flame-outline', text: 'Dream streak tracking' },
      { icon: 'analytics-outline', text: 'Pattern insights over weeks' },
      { icon: 'person-outline', text: 'Your personal dream language emerges' },
    ],
  },
  {
    id: 'universe-inside-you',
    kind: 'value',
    icon: 'planet-outline',
    heroImage: require('../assets/star.png'),
    title: 'A Universe\nInside You',
    subtitle:
      'Everything you need to remember, explore, and understand your dreams — bottled in one beautiful app.',
    highlights: [
      { icon: 'infinite-outline', text: 'Unlimited AI interpretations' },
      { icon: 'images-outline', text: 'AI-generated dream artwork' },
      { icon: 'notifications-outline', text: 'Smart ritual reminders' },
    ],
  },
];

const FINAL_STEP = {
  badge: 'DROPLETT PRO',
  title: 'Continue\nto App',
  subtitle:
    'You will see the upgrade offer next. Close it anytime to keep using the free app and sign in.',
  heroImage: require('../assets/star.png'),
};

const PARTICLE_COUNT = 18;

interface Particle {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * SCREEN_W,
    y: Math.random() * SCREEN_H,
    size: 2 + Math.random() * 4,
    duration: 3000 + Math.random() * 4000,
    delay: Math.random() * 2000,
    opacity: 0.1 + Math.random() * 0.3,
  }));
}

function DropletParticleDot({ particle }: { particle: Particle }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20 - Math.random() * 30,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: particle.duration,
          useNativeDriver: true,
        }),
      ])
    );

    const fadeIn = Animated.timing(fadeAnim, {
      toValue: particle.opacity,
      duration: 1000,
      delay: particle.delay,
      useNativeDriver: true,
    });

    fadeIn.start(() => floatLoop.start());

    return () => {
      floatLoop.stop();
      fadeIn.stop();
    };
  }, [fadeAnim, floatAnim, particle.delay, particle.duration, particle.opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        opacity: fadeAnim,
        transform: [{ translateY: floatAnim }],
        backgroundColor: DROPLET.mutedBlue,
        shadowColor: DROPLET.lightBlue,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: particle.size * 2,
      }}
    />
  );
}

function DropletParticles() {
  const particles = useRef(createParticles()).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle, index) => (
        <DropletParticleDot key={index} particle={particle} />
      ))}
    </View>
  );
}

function DropletButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 12,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: '100%' }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.ctaButton, isPressed && styles.ctaButtonPressed]}
      >
        <DroplettText variant="button" color="#FFFFFF" align="center">
          {children}
        </DroplettText>
      </Pressable>
    </Animated.View>
  );
}

function DotIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current && styles.dotActive,
            index < current && styles.dotComplete,
          ]}
        />
      ))}
    </View>
  );
}

function HighlightRow({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.highlightRow}>
      <View style={styles.highlightIconWrap}>
        <Ionicons name={icon} size={18} color={DROPLET.blue} />
      </View>
      <DroplettText variant="body" color={DROPLET.body} style={{ flex: 1, lineHeight: 22 }}>
        {text}
      </DroplettText>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPresentingPaywall, setIsPresentingPaywall] = useState(false);
  const presentingPaywallRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const continueToSignIn = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    try {
      router.replace('/sign-in');
    } catch (error) {
      console.error('[Onboarding] Navigation failed, retrying:', error);
      hasNavigatedRef.current = false;
      // Retry once after a tick
      setTimeout(() => {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          router.replace('/sign-in');
        }
      }, 500);
    }
  }, []);

  const paywallCallbacks = useMemo(
    () => ({
      onDismiss: continueToSignIn,
      onPurchase: continueToSignIn,
      onError: () => continueToSignIn(),
    }),
    [continueToSignIn]
  );
  const { showPaywall } = usePaywall(paywallCallbacks);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.8)).current;
  const heroOpacityAnim = useRef(new Animated.Value(0)).current;

  const slide = currentStep < TOTAL_SLIDES ? SLIDES[currentStep] : null;
  const isPaywallStep = currentStep === FINAL_STEP_INDEX;
  const canGoBack = currentStep > 0;

  useEffect(() => {
    heroScaleAnim.setValue(0.8);
    heroOpacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(heroScaleAnim, {
        toValue: 1,
        speed: 8,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, heroOpacityAnim, heroScaleAnim]);

  const animateToStep = (next: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setCurrentStep(Math.max(0, Math.min(next, TOTAL_STEPS - 1)));
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 14,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleContinue = async () => {
    if (!isPaywallStep) {
      animateToStep(currentStep + 1);
      return;
    }

    if (presentingPaywallRef.current) {
      return;
    }

    presentingPaywallRef.current = true;
    setIsPresentingPaywall(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }

    // Safety timeout — if paywall hangs for 10s, navigate anyway
    const safetyTimer = setTimeout(() => {
      console.warn('[Onboarding] Paywall timed out, continuing to sign-in');
      continueToSignIn();
    }, 10000);

    try {
      await showPaywall(PLACEMENTS.ONBOARDING_COMPLETE);
    } catch (error) {
      console.error('[Onboarding] Paywall error:', error);
    } finally {
      clearTimeout(safetyTimer);
      presentingPaywallRef.current = false;
      setIsPresentingPaywall(false);
      continueToSignIn();
    }
  };

  const handleBack = () => {
    if (!canGoBack || isPresentingPaywall) {
      return;
    }

    animateToStep(currentStep - 1);
  };

  const currentBackground = SLIDE_BACKGROUNDS[Math.min(currentStep, SLIDE_BACKGROUNDS.length - 1)];

  const renderContent = () => {
    if (isPaywallStep) {
      return (
        <>
          <Animated.View
            style={[
              styles.heroImageWrap,
              {
                transform: [{ scale: heroScaleAnim }],
                opacity: heroOpacityAnim,
              },
            ]}
          >
            <Image source={FINAL_STEP.heroImage} style={styles.heroImage} contentFit="contain" />
          </Animated.View>

          <View style={styles.finalStepBadge}>
            <DroplettText variant="label" color={DROPLET.navy} align="center">
              {FINAL_STEP.badge}
            </DroplettText>
          </View>

          <DroplettText
            variant="heroTitle"
            align="center"
            color={DROPLET.title}
            style={styles.title}
          >
            {FINAL_STEP.title}
          </DroplettText>

          <DroplettText
            variant="body"
            align="center"
            color={DROPLET.muted}
            style={[styles.subtitle, styles.finalStepSubtitle]}
          >
            {FINAL_STEP.subtitle}
          </DroplettText>
        </>
      );
    }

    if (!slide) {
      return null;
    }

    return (
      <>
        <Animated.View
          style={[
            styles.heroImageWrap,
            {
              transform: [{ scale: heroScaleAnim }],
              opacity: heroOpacityAnim,
            },
          ]}
        >
          <Image source={slide.heroImage} style={styles.heroImage} contentFit="contain" />
        </Animated.View>

        <DroplettText
          variant="heroTitle"
          align="center"
          color={DROPLET.title}
          style={styles.title}
        >
          {slide.title}
        </DroplettText>

        <DroplettText
          variant="body"
          align="center"
          color={DROPLET.muted}
          style={styles.subtitle}
        >
          {slide.subtitle}
        </DroplettText>

        {slide.stat ? (
          <View style={styles.statCard}>
            <DroplettText variant="heroTitle" color={DROPLET.blue} style={styles.statValue}>
              {slide.stat.value}
            </DroplettText>
            <DroplettText variant="bodySmall" color={DROPLET.muted} align="center">
              {slide.stat.label}
            </DroplettText>
          </View>
        ) : null}

        {slide.highlights ? (
          <View style={styles.highlightList}>
            {slide.highlights.map((highlight) => (
              <HighlightRow key={highlight.text} icon={highlight.icon} text={highlight.text} />
            ))}
          </View>
        ) : null}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ImageBackground
        source={currentBackground}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View pointerEvents="none" style={styles.backgroundOverlay} />
      <View pointerEvents="none" style={styles.waterStain1} />
      <View pointerEvents="none" style={styles.waterStain2} />
      <DropletParticles />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        {canGoBack ? (
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={DROPLET.mutedBlue} />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        <DotIndicator current={currentStep} total={TOTAL_STEPS} />
        <View style={styles.backButton} />
      </View>

      <Animated.View
        style={[
          styles.slideContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {renderContent()}
      </Animated.View>

      <LinearGradient
        colors={['transparent', 'rgba(240, 238, 232, 0.85)', 'rgba(240, 238, 232, 0.95)']}
        locations={[0, 0.25, 1]}
        style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}
      >
        <DropletButton onPress={handleContinue}>
          {isPaywallStep ? 'Continue to App' : currentStep === 0 ? 'Get Started' : 'Continue'}
        </DropletButton>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DROPLET.paper,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240, 238, 232, 0.45)',
  },
  waterStain1: {
    position: 'absolute',
    borderRadius: 999,
    top: SCREEN_H * 0.05,
    left: SCREEN_W * 0.05,
    width: SCREEN_W * 0.55,
    height: SCREEN_H * 0.45,
    backgroundColor: 'rgba(27, 58, 92, 0.12)',
  },
  waterStain2: {
    position: 'absolute',
    borderRadius: 999,
    top: SCREEN_H * 0.5,
    left: SCREEN_W * 0.4,
    width: SCREEN_W * 0.55,
    height: SCREEN_H * 0.45,
    backgroundColor: 'rgba(46, 107, 158, 0.08)',
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(27, 58, 92, 0.35)',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: DROPLET.navy,
  },
  dotComplete: {
    backgroundColor: DROPLET.blue,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding + 4,
    paddingBottom: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageWrap: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  finalStepBadge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(27, 58, 92, 0.22)',
    backgroundColor: 'rgba(27, 58, 92, 0.08)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.sm,
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    marginBottom: SPACING.md,
    maxWidth: 340,
    lineHeight: 22,
    textAlign: 'center',
  },
  finalStepSubtitle: {
    maxWidth: 320,
  },
  statCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(46, 107, 158, 0.2)',
    backgroundColor: 'rgba(46, 107, 158, 0.1)',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statValue: {
    fontSize: 48,
    marginBottom: SPACING.xs,
  },
  highlightList: {
    width: '100%',
    maxWidth: 360,
    gap: SPACING.md,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  highlightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(27, 58, 92, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(27, 58, 92, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  ctaButton: {
    height: 48,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: DROPLET.navy,
    width: '100%',
  },
  ctaButtonPressed: {
    backgroundColor: '#153252',
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
  },
});
