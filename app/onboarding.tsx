import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoldenParticles } from '../components/onboarding/GoldenParticles';
import { StardustButton } from '../components/ui/StardustButton';
import { StardustText } from '../components/ui/StardustText';
import { usePaywall, PLACEMENTS } from '../lib/hooks/usePaywall';
import { SPACING, RADIUS } from '../lib/layout';
import { STARDUST_THEME } from '../lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ONBOARDED_KEY = 'hasOnboarded';
const TOTAL_SLIDES = 5;

// Background texture images for each slide (light parchment → deep watercolor)
const SLIDE_BACKGROUNDS = [
  require('../assets/onboarding-bg-1.png'),
  require('../assets/onboarding-bg-2.png'),
  require('../assets/onboarding-bg-3.png'),
  require('../assets/onboarding-bg-4.png'),
  require('../assets/onboarding-bg-5.png'),
];

// ─── Slide data ──────────────────────────────────────────

type SlideData = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  highlights?: { icon: IconName; text: string }[];
  stat?: { value: string; label: string };
  kind: 'value' | 'feature' | 'social' | 'personal';
};

const SLIDES: SlideData[] = [
  {
    id: 'dreamer-type',
    kind: 'value',
    icon: 'moon-outline',
    title: 'Discover Your\nDreamer Type',
    subtitle:
      'Stardust analyzes your dream patterns and builds a personalized protocol to unlock lucid dreaming.',
    highlights: [
      { icon: 'sparkles-outline', text: 'AI-powered dream analysis' },
      { icon: 'compass-outline', text: 'Personalized dream protocol' },
      { icon: 'trending-up-outline', text: 'Track your progress over time' },
    ],
  },
  {
    id: 'journal-feature',
    kind: 'feature',
    icon: 'mic-outline',
    title: 'Capture Dreams\nEffortlessly',
    subtitle:
      'Speak or type your dreams. Our AI transcribes, interprets, and visualizes them instantly.',
    highlights: [
      { icon: 'mic-outline', text: 'Voice-to-text dream capture' },
      { icon: 'bulb-outline', text: 'AI symbol interpretation' },
      { icon: 'image-outline', text: 'AI-generated dream art' },
    ],
  },
  {
    id: 'sounds-feature',
    kind: 'feature',
    icon: 'musical-notes-outline',
    title: 'Sleep Sounds\n& Rituals',
    subtitle:
      'Curated soundscapes and guided rituals designed to improve sleep quality and dream recall.',
    highlights: [
      { icon: 'volume-medium-outline', text: 'Multi-layered sleep soundscapes' },
      { icon: 'moon-outline', text: 'Guided bedtime rituals' },
      { icon: 'timer-outline', text: 'Smart fade timer technology' },
    ],
  },
  {
    id: 'social-proof',
    kind: 'social',
    icon: 'people-outline',
    title: 'Join Thousands of\nLucid Dreamers',
    subtitle:
      'One guided workflow replaces scattered apps, ads, and random tips.',
    stat: { value: '73%', label: 'of users report improved dream recall within 2 weeks' },
    highlights: [
      { icon: 'shield-checkmark-outline', text: 'No ads, no data selling' },
      { icon: 'flash-outline', text: 'All-in-one dream system' },
      { icon: 'lock-closed-outline', text: 'End-to-end encrypted journals' },
    ],
  },
  {
    id: 'value-prop',
    kind: 'personal',
    icon: 'diamond-outline',
    title: 'Your Dream\nJourney Awaits',
    subtitle:
      'Everything you need to remember, understand, and control your dreams — in one beautiful app.',
    highlights: [
      { icon: 'infinite-outline', text: 'Unlimited AI interpretations' },
      { icon: 'images-outline', text: 'Unlimited dream artwork' },
      { icon: 'analytics-outline', text: 'Dream pattern insights' },
      { icon: 'notifications-outline', text: 'Smart ritual reminders' },
    ],
  },
];

// ─── Dot indicator ───────────────────────────────────────

function DotIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            i < current && styles.dotComplete,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Highlight row ───────────────────────────────────────

function HighlightRow({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.highlightRow}>
      <View style={styles.highlightIconWrap}>
        <Ionicons name={icon} size={18} color={STARDUST_THEME.gold.warm} />
      </View>
      <StardustText variant="body" color={STARDUST_THEME.text.primary} style={{ flex: 1 }}>
        {text}
      </StardustText>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { showPaywall, isPremium } = usePaywall();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHydrating, setIsHydrating] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.8)).current;
  const heroOpacityAnim = useRef(new Animated.Value(0)).current;

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === TOTAL_SLIDES - 1;
  const canGoBack = currentSlide > 0;

  // ─── Hydrate ─────────────────────────────────────────

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDED_KEY);
        if (!mounted) return;
        if (completed === 'true') {
          router.replace('/');
          return;
        }
      } catch (e) {
        console.error('Hydration error:', e);
      } finally {
        if (mounted) setIsHydrating(false);
      }
    };
    hydrate();
    return () => { mounted = false; };
  }, []);

  // ─── Hero entrance animation ─────────────────────────

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
  }, [currentSlide]);

  // ─── Navigation ──────────────────────────────────────

  const animateToSlide = (next: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setCurrentSlide(Math.max(0, Math.min(next, TOTAL_SLIDES - 1)));
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleContinue = () => {
    if (isLastSlide) {
      void handleUnlock();
      return;
    }
    animateToSlide(currentSlide + 1);
  };

  const handleBack = () => {
    if (!canGoBack) return;
    animateToSlide(currentSlide - 1);
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    } catch (e) {
      console.error('Failed to complete onboarding:', e);
    }
    router.replace('/');
  };

  const handleUnlock = async () => {
    try {
      const unlocked = await showPaywall(PLACEMENTS.APP_LAUNCH);
      if (unlocked || isPremium) {
        await completeOnboarding();
      } else {
        // User dismissed paywall — still complete onboarding
        await completeOnboarding();
      }
    } catch (e) {
      console.error('Paywall error:', e);
      await completeOnboarding();
    }
  };

  // ─── Render ──────────────────────────────────────────

  if (isHydrating) return null;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={SLIDE_BACKGROUNDS[currentSlide]}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {/* Dark overlay for text readability */}
      <View style={styles.backgroundOverlay} />
      <GoldenParticles />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        {canGoBack ? (
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={STARDUST_THEME.gold.muted} />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        <DotIndicator current={currentSlide} total={TOTAL_SLIDES} />
        <View style={styles.backButton} />
      </View>

      {/* Slide content */}
      <Animated.View
        style={[
          styles.slideContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Hero icon */}
        <Animated.View
          style={[
            styles.heroCircle,
            {
              transform: [{ scale: heroScaleAnim }],
              opacity: heroOpacityAnim,
            },
          ]}
        >
          <Ionicons name={slide.icon} size={40} color={STARDUST_THEME.gold.bright} />
        </Animated.View>

        {/* Title */}
        <StardustText
          variant="heroTitle"
          align="center"
          color={STARDUST_THEME.gold.pale}
          style={styles.title}
        >
          {slide.title}
        </StardustText>

        {/* Subtitle */}
        <StardustText
          variant="body"
          align="center"
          color={STARDUST_THEME.text.secondary}
          style={styles.subtitle}
        >
          {slide.subtitle}
        </StardustText>

        {/* Stat card (social proof slide) */}
        {slide.stat ? (
          <View style={styles.statCard}>
            <StardustText variant="heroTitle" color={STARDUST_THEME.gold.bright} style={styles.statValue}>
              {slide.stat.value}
            </StardustText>
            <StardustText variant="bodySmall" color={STARDUST_THEME.text.secondary} align="center">
              {slide.stat.label}
            </StardustText>
          </View>
        ) : null}

        {/* Highlight list */}
        {slide.highlights ? (
          <View style={styles.highlightList}>
            {slide.highlights.map((h) => (
              <HighlightRow key={h.text} icon={h.icon} text={h.text} />
            ))}
          </View>
        ) : null}
      </Animated.View>

      {/* Footer */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.85)', 'rgba(10, 10, 15, 0.95)']}
        locations={[0, 0.25, 1]}
        style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}
      >
        <StardustButton onPress={handleContinue} fullWidth>
          {currentSlide === 0 ? 'Get Started' : 'Continue'}
        </StardustButton>
      </LinearGradient>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STARDUST_THEME.bg.primary,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.55)',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: STARDUST_THEME.gold.warm,
  },
  dotComplete: {
    backgroundColor: STARDUST_THEME.gold.muted,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: 'rgba(212, 175, 55, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    marginBottom: SPACING.sm,
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    marginBottom: SPACING.lg,
    maxWidth: 340,
    lineHeight: 22,
  },
  statCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
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
    alignItems: 'center',
    gap: SPACING.md,
  },
  highlightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
