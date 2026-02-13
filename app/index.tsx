import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  SectionList,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../convex/_generated/api';
import BottomTabBar from '../components/ui/BottomTabBar';
import ProBadge from '../components/ui/ProBadge';
import { useStardustPro } from '../lib/superwall';
import { STARDUST_THEME } from '../lib/theme';
import { RADIUS, SPACING } from '../lib/layout';
import { StardustText } from '../components/ui/StardustText';
import { StardustCard } from '../components/ui/StardustCard';
import { MoodPill } from '../components/ui/MoodPill';
import ScreenContainer from '../components/ui/ScreenContainer';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return "Morning dreams";
  if (hour >= 12 && hour < 17) return "Afternoon reflection";
  if (hour >= 17 && hour < 23) return "Evening thoughts";
  return "Night visions";
};

export default function JournalHome() {
  const { isPro } = useStardustPro();
  const dreams = useQuery(api.dreams.listDreams) ?? [];
  const greeting = getGreeting();

  // FAB Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Stagger animation values - simpler to animate items on mount
  // or use a ref map if list changes dynamically. 
  // For MVP, we can just animate the container or use a simple key-based stagger.

  useEffect(() => {
    // Check onboarding
    const checkOnboarding = async () => {
      try {
        const hasOnboarded = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('hasOnboarded'));
        if (!hasOnboarded) {
          router.replace('/onboarding');
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkOnboarding();

    // Pulse animation for FAB
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      ])
    );
    pulse.start();
  }, []);

  const sections = [
    { title: 'RECENT DREAMS', data: dreams }
  ];

  const renderDreamItem = ({ item, index }: { item: any, index: number }) => {
    const title = item.transcript
      ? item.transcript.split(/\s+/).slice(0, 6).join(' ') + (item.transcript.length > 40 ? '...' : '')
      : "Untitled Dream";

    const bodyPreview = item.transcript || "No details recorded.";

    return (
      <Animated.View style={{ opacity: 1 }}>
        <StardustCard
          onPress={() => router.push(`/dream/${item._id}`)}
          style={styles.dreamCard}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.dateRow}>
                <StardustText variant="label" color={STARDUST_THEME.text.tertiary} style={{ fontSize: 11, letterSpacing: 1 }}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                </StardustText>
              </View>

              <StardustText variant="cardTitle" color={STARDUST_THEME.text.primary} numberOfLines={1} style={{ marginBottom: 4, fontSize: 18 }}>
                {title}
              </StardustText>

              <StardustText variant="bodySmall" color={STARDUST_THEME.text.secondary} numberOfLines={2} style={{ marginBottom: SPACING.md }}>
                {bodyPreview}
              </StardustText>

              <View style={styles.tagsRow}>
                {item.mood && <MoodPill mood={item.mood} />}
              </View>
            </View>

            <View style={styles.thumbnailContainer}>
              {item.sceneUrl ? (
                <Image
                  source={{ uri: item.sceneUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Ionicons name="moon-outline" size={16} color={STARDUST_THEME.text.tertiary} />
                </View>
              )}
            </View>
          </View>
        </StardustCard>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <BlurView intensity={20} tint="dark" style={styles.stickyHeader}>
      <StardustText variant="label" color={STARDUST_THEME.text.tertiary}>
        {title}
      </StardustText>
    </BlurView>
  );

  return (
    <ScreenContainer>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderItem={renderDreamItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <StardustText variant="heroTitle" color={STARDUST_THEME.gold.bright} style={{ fontSize: 28, letterSpacing: 6 }}>STARDUST</StardustText>
              <StardustText variant="body" color={STARDUST_THEME.text.secondary} style={{ letterSpacing: 0.5, marginTop: 4, opacity: 0.8 }}>
                {greeting}
              </StardustText>
            </View>
            <View style={styles.headerRight}>
              {isPro && <ProBadge />}
              <View style={{ width: SPACING.sm }} />
              <Pressable onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={24} color={STARDUST_THEME.text.tertiary} />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyRecent}>
            <Ionicons name="moon-outline" size={32} color={STARDUST_THEME.gold.muted} style={{ marginBottom: SPACING.md }} />
            <StardustText variant="dreamTitle" color={STARDUST_THEME.text.secondary} align="center">
              Your journal awaits its first story
            </StardustText>
            <StardustText variant="bodySmall" color={STARDUST_THEME.text.tertiary} align="center" style={{ marginTop: SPACING.sm }}>
              Tap the mic to record your first dream
            </StardustText>
          </View>
        }
      />

      {/* FAB - Bottom Right */}
      <Animated.View style={[
        styles.fabContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/record')}
          onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
        >
          <Ionicons name="mic" size={44} color={STARDUST_THEME.text.inverse} />
        </Pressable>
      </Animated.View>

      <BottomTabBar activeTab="journal" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 160, // Space for tab bar + FAB area
  },
  stickyHeader: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    // BlurView handles background
  },
  dreamCard: {
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(212, 175, 55, 0.4)',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  dateRow: {
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumbnailContainer: {
    justifyContent: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecent: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 120, // Adjusted for larger size
    right: 24,
    zIndex: 100,
    shadowColor: 'rgba(201, 168, 76, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  fab: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: STARDUST_THEME.gold.warm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
