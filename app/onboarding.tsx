import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StardustText } from '../components/ui/StardustText';
import { usePaywall, PLACEMENTS, type PaywallPlacement } from '../lib/hooks/usePaywall';
import { SPACING, RADIUS } from '../lib/layout';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Droplet theme (onboarding-only) ─────────────────────
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

const ONBOARDED_KEY = 'hasOnboarded';
const TOTAL_SLIDES = 5;

// Slide backgrounds — flower (index 3) and star (index 4) both use the
// lighter parchment texture from slide 1 (onboarding-bg-1.png) instead
// of their original dark/busy backgrounds.
const SLIDE_BACKGROUNDS = [
  require('../assets/onboarding-bg-1.png'), // wings  — original
  require('../assets/onboarding-bg-2.png'), // cat    — original
  require('../assets/onboarding-bg-3.png'), // jar    — original
  require('../assets/onboarding-bg-1.png'), // flower — lighter parchment (was bg-4)
  require('../assets/onboarding-bg-1.png'), // star   — lighter parchment (was bg-5)
];

// ─── Slide data ──────────────────────────────────────────

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
    heroImage: require('../assets/flying.png'),
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
      'Your subconscious is speaking. AI helps you understand what it\'s saying.',
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
    heroImage: require('../assets/ink.png'),
    title: 'Crafted Like\na Dream',
    subtitle:
      'Droplett isn\'t just a journal. It\'s a hand-painted world your dreams live inside.',
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

// ─── Droplet particles (blue, onboarding-only) ──────────

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
  }, []);

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
      {particles.map((p, i) => (
        <DropletParticleDot key={i} particle={p} />
      ))}
    </View>
  );
}

// ─── Droplet CTA button (onboarding-only) ────────────────

function DropletButton({ onPress, children }: { onPress: () => void; children: string }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 12, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: '100%' }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.ctaButton,
          isPressed && styles.ctaButtonPressed,
        ]}
      >
        <StardustText variant="button" color="#FFFFFF" align="center">
          {children}
        </StardustText>
      </Pressable>
    </Animated.View>
  );
}

// ─── Dot indicator ───────────────────────────────────────
// Total visual steps: 5 slides + 1 demo + 1 rating = 7 dots

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
        <Ionicons name={icon} size={18} color={DROPLET.blue} />
      </View>
      <StardustText variant="body" color={DROPLET.body} style={{ flex: 1, lineHeight: 22 }}>
        {text}
      </StardustText>
    </View>
  );
}

// ─── Demo video slide (slide 6 of 7) ────────────────────

function DemoSlide({ onContinue }: { onContinue: () => void }) {
  const videoRef = useRef<Video>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAdvanced = useRef(false);
  const insets = useSafeAreaInsets();

  // Fill most of the screen between the header and footer CTA.
  // 88% width lets a thin parchment border breathe on the sides.
  // Height is constrained so the Continue button never gets pushed off-screen.
  const PREVIEW_W = SCREEN_W * 0.88;
  const FOOTER_H = 80 + insets.bottom;
  const HEADER_H = 52 + insets.top;
  const AVAILABLE_H = SCREEN_H - HEADER_H - FOOTER_H - SPACING.md * 2;
  // Cap at available height so it always fits without scrolling
  const PREVIEW_H = Math.min(PREVIEW_W * (16 / 9), AVAILABLE_H);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
      <StatusBar style="dark" />

      {/* Onboarding parchment background — matches surrounding slides */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: DROPLET.paper }]} />
      <View style={[StyleSheet.absoluteFillObject, styles.waterStain1]} />
      <View style={[StyleSheet.absoluteFillObject, styles.waterStain2]} />
      <DropletParticles />

      {/* Header dots — 7 total, demo is index 5 */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.backButton} />
        <DotIndicator current={5} total={7} />
        <View style={styles.backButton} />
      </View>

      {/* Full-height centred device-frame — video dominates the screen */}
      <View style={styles.demoContent}>
        {/* Device frame fills the available vertical space */}
        <View style={[styles.deviceFrame, { width: PREVIEW_W, height: PREVIEW_H }]}>
          <Video
            ref={videoRef}
            source={require('../assets/best-demo.mp4')}
            style={{ width: PREVIEW_W, height: PREVIEW_H }}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping={false}
            isMuted={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish && !hasAdvanced.current) {
                hasAdvanced.current = true;
                onContinue();
              }
            }}
          />
        </View>
      </View>

      {/* Footer CTA — sits below the video */}
      <LinearGradient
        colors={['transparent', 'rgba(240, 238, 232, 0.85)', 'rgba(240, 238, 232, 0.95)']}
        locations={[0, 0.25, 1]}
        style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}
      >
        <DropletButton onPress={onContinue}>
          Continue
        </DropletButton>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Rating slide (slide 7 of 7, standalone) ────────────

function RatingSlide({ onRate, onSkip }: { onRate: (stars: number) => void; onSkip: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Per-star scale animations for a staggered bounce on tap
  const starScales = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(1))).current;
  const [starsLit, setStarsLit] = useState(0);
  // Guard against double-tap on Continue
  const continueInProgress = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Tapping a star just selects it (no review trigger yet)
  const handleStarPress = (index: number) => {
    setStarsLit(index + 1);

    // Staggered bounce animation across stars 0..index only
    const animations = [0, 1, 2, 3, 4]
      .filter((i) => i <= index)
      .map((i) =>
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.spring(starScales[i], {
            toValue: 1.4,
            speed: 20,
            bounciness: 8,
            useNativeDriver: true,
          }),
          Animated.spring(starScales[i], {
            toValue: 1,
            speed: 14,
            bounciness: 4,
            useNativeDriver: true,
          }),
        ])
      );
    Animated.parallel(animations).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Continue: trigger Apple review in try/finally, then paywall in finally
  const handleContinue = async () => {
    if (continueInProgress.current) return;
    continueInProgress.current = true;

    const stars = starsLit || 5; // default to 5 if they tap Continue without selecting

    try {
      const StoreReview = require('expo-store-review');
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (_e) {
      // Not available in Expo Go — silently ignore
    } finally {
      // Always fire the paywall regardless of review outcome
      onRate(stars);
    }
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
      <StatusBar style="dark" />

      {/* Lighter parchment background — same as wings / slide 1 */}
      <ImageBackground
        source={require('../assets/onboarding-bg-1.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFillObject, styles.backgroundOverlay]} />
      <View style={[StyleSheet.absoluteFillObject, styles.waterStain1]} />
      <View style={[StyleSheet.absoluteFillObject, styles.waterStain2]} />
      <DropletParticles />

      {/* Header dots — rating is index 6 (last) */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.backButton} />
        <DotIndicator current={6} total={7} />
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <View style={styles.ratingContent}>
        {/* Serif headline */}
        <StardustText
          variant="heroTitle"
          align="center"
          color={DROPLET.title}
          style={styles.ratingHeadline}
        >
          Loving Droplett?
        </StardustText>

        {/* Subtitle */}
        <StardustText
          variant="body"
          align="center"
          color={DROPLET.muted}
          style={styles.ratingSubtitle}
        >
          Your review helps other dreamers find us
        </StardustText>

        {/* Five tappable gold stars */}
        <View style={styles.starsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Pressable
              key={i}
              onPress={() => handleStarPress(i)}
              hitSlop={10}
            >
              <Animated.View style={{ transform: [{ scale: starScales[i] }] }}>
                <Ionicons
                  name={i < starsLit ? 'star' : 'star-outline'}
                  size={44}
                  color="#C4A140"
                />
              </Animated.View>
            </Pressable>
          ))}
        </View>

        {/* Navy "Continue" CTA */}
        <View style={styles.ratingCta}>
          <DropletButton onPress={handleContinue}>
            Continue
          </DropletButton>
        </View>

        {/* Soft "Maybe Later" escape hatch */}
        <Pressable onPress={onSkip} hitSlop={12} style={styles.skipButton}>
          <StardustText variant="bodySmall" color={DROPLET.muted} align="center">
            Maybe Later
          </StardustText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { showPaywall, isPremium } = usePaywall();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.8)).current;
  const heroOpacityAnim = useRef(new Animated.Value(0)).current;

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === TOTAL_SLIDES - 1;
  const canGoBack = currentSlide > 0 || showDemo;

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
    if (showDemo || showRating) return;
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
  }, [currentSlide, showDemo, showRating]);

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
      // After last value slide → show demo
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowDemo(true);
      return;
    }
    animateToSlide(currentSlide + 1);
  };

  const handleBack = () => {
    if (showDemo) {
      setShowDemo(false);
      return;
    }
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

  const handleUnlock = async (placement?: PaywallPlacement) => {
    try {
      await showPaywall(placement ?? PLACEMENTS.ONBOARDING_COMPLETE);
    } catch (e) {
      console.error('Paywall error:', e);
    }
    await completeOnboarding();
  };

  // Demo video ends or user taps Continue → show rating slide
  const handleDemoComplete = () => {
    setShowDemo(false);
    setShowRating(true);
  };

  // User rates (tapped stars) → paywall (5-star gets dedicated upsell placement)
  const handleRateComplete = (stars: number) => {
    void handleUnlock(stars === 5 ? PLACEMENTS.FIVE_STAR_UPSELL : undefined);
  };

  // User taps "Maybe Later" → skip straight to paywall
  const handleSkipRating = () => {
    void handleUnlock();
  };

  // ─── Render ──────────────────────────────────────────

  if (isHydrating) return null;

  // Rating slide (standalone, after demo)
  if (showRating) {
    return (
      <RatingSlide
        onRate={handleRateComplete}
        onSkip={handleSkipRating}
      />
    );
  }

  // Demo video overlay (shown after slide 5, before rating)
  if (showDemo) {
    return <DemoSlide onContinue={handleDemoComplete} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ImageBackground
        source={SLIDE_BACKGROUNDS[currentSlide]}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {/* Light overlay for text readability */}
      <View style={styles.backgroundOverlay} />
      {/* Blue water-stain radial gradients */}
      <View style={styles.waterStain1} />
      <View style={styles.waterStain2} />
      <DropletParticles />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        {canGoBack ? (
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={DROPLET.mutedBlue} />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        {/* 7 dots: 5 slides + 1 demo + 1 rating */}
        <DotIndicator current={currentSlide} total={7} />
        <View style={styles.backButton} />
      </View>

      {/* Slide content */}
      <Animated.View
        style={[
          styles.slideContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Hero watercolor image — raw transparent PNG, no circle/container */}
        <Animated.View
          style={[
            styles.heroImageWrap,
            {
              transform: [{ scale: heroScaleAnim }],
              opacity: heroOpacityAnim,
            },
          ]}
        >
          <Image
            source={slide.heroImage}
            style={styles.heroImage}
            contentFit="contain"
          />
        </Animated.View>

        {/* Title */}
        <StardustText
          variant="heroTitle"
          align="center"
          color={DROPLET.title}
          style={styles.title}
        >
          {slide.title}
        </StardustText>

        {/* Subtitle */}
        <StardustText
          variant="body"
          align="center"
          color={DROPLET.muted}
          style={styles.subtitle}
        >
          {slide.subtitle}
        </StardustText>

        {/* Stat card (social proof slide) */}
        {slide.stat ? (
          <View style={styles.statCard}>
            <StardustText variant="heroTitle" color={DROPLET.blue} style={styles.statValue}>
              {slide.stat.value}
            </StardustText>
            <StardustText variant="bodySmall" color={DROPLET.muted} align="center">
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
        colors={['transparent', 'rgba(240, 238, 232, 0.85)', 'rgba(240, 238, 232, 0.95)']}
        locations={[0, 0.25, 1]}
        style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}
      >
        <DropletButton onPress={handleContinue}>
          {currentSlide === 0 ? 'Get Started' : isLastSlide ? 'See It In Action' : 'Continue'}
        </DropletButton>
      </LinearGradient>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Hero image — raw transparent PNG, floats naturally, no clip/circle
  heroImageWrap: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
  // Demo slide
  demoContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPadding,
  },
  deviceFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(27, 58, 92, 0.15)',
  },
  // Rating slide
  ratingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPadding + 4,
  },
  ratingHeadline: {
    fontSize: 34,
    lineHeight: 42,
    marginBottom: SPACING.sm,
  },
  ratingSubtitle: {
    maxWidth: 280,
    lineHeight: 22,
    marginBottom: SPACING.xl + SPACING.sm,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl + SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCta: {
    width: '100%',
    maxWidth: 320,
    marginBottom: SPACING.md,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
});
