import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  SectionList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../convex/_generated/api';
import BottomTabBar from '../components/ui/BottomTabBar';
import { STARDUST_THEME } from '../lib/theme';
import { RADIUS, SPACING } from '../lib/layout';
import { StardustText } from '../components/ui/StardustText';
import { StardustCard } from '../components/ui/StardustCard';
import { MoodPill } from '../components/ui/MoodPill';
import ScreenContainer from '../components/ui/ScreenContainer';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return "Morning dreams";
  if (hour >= 12 && hour < 17) return "Afternoon reflection";
  if (hour >= 17 && hour < 23) return "Evening thoughts";
  return "Night visions";
};

export default function JournalHome() {
  const dreams = useQuery(api.dreams.listDreams) ?? [];
  const greeting = getGreeting();

  // FAB Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
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

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      ])
    );
    pulseRef.current = pulse;
    pulse.start();

    return () => {
      pulse.stop();
    };
  }, []);

  const sections = useMemo(() => [
    { title: 'RECENT DREAMS', data: dreams }
  ], [dreams]);

  const handleFabPressIn = useCallback(() => {
    pulseRef.current?.stop();
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  }, [scaleAnim]);

  const handleFabPressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  }, [scaleAnim]);

  const handleFabPress = useCallback(() => {
    router.push('/record');
  }, []);

  const renderDreamItem = useCallback(({ item }: { item: any }) => {
    const title = item.transcript
      ? item.transcript.split(/\s+/).slice(0, 6).join(' ') + (item.transcript.length > 40 ? '...' : '')
      : "Untitled Dream";

    const bodyPreview = item.transcript || "No details recorded.";

    return (
      <StardustCard
        onPress={() => router.push(`/dream/${item._id}`)}
        style={styles.dreamCard}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={styles.dateRow}>
              <StardustText variant="label" color={STARDUST_THEME.text.tertiary} style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
              </StardustText>
            </View>

            <StardustText variant="cardTitle" color={STARDUST_THEME.text.primary} numberOfLines={1} style={styles.titleText}>
              {title}
            </StardustText>

            <StardustText variant="bodySmall" color={STARDUST_THEME.text.secondary} numberOfLines={2} style={styles.bodyText}>
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
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={item._id}
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Ionicons name="moon-outline" size={16} color={STARDUST_THEME.text.tertiary} />
              </View>
            )}
          </View>
        </View>
      </StardustCard>
    );
  }, []);

  const renderSectionHeader = useCallback(({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.stickyHeader}>
      <StardustText variant="label" color={STARDUST_THEME.text.tertiary}>
        {title}
      </StardustText>
    </View>
  ), []);

  const keyExtractor = useCallback((item: any) => item._id, []);

  return (
    <ScreenContainer backgroundSource={require('../assets/bg-home.png')}>
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderDreamItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={8}
        windowSize={5}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <StardustText variant="heroTitle" color={STARDUST_THEME.gold.bright} style={{ fontSize: 28, letterSpacing: 6 }}>STARDUST</StardustText>
              <StardustText variant="body" color={STARDUST_THEME.text.secondary} style={{ letterSpacing: 0.5, marginTop: 4, opacity: 0.8 }}>
                {greeting}
              </StardustText>
            </View>
            <Pressable onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color={STARDUST_THEME.text.tertiary} />
            </Pressable>
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
          onPress={handleFabPress}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
        >
          <Image
            source={require('../assets/record-button.png')}
            style={styles.fab}
            contentFit="contain"
            cachePolicy="memory"
          />
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
  listContent: {
    paddingBottom: 160,
  },
  stickyHeader: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
  },
  dreamCard: {
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
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
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  titleText: {
    marginBottom: 4,
    fontSize: 18,
  },
  bodyText: {
    marginBottom: SPACING.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  iconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    bottom: 120,
    right: 24,
    zIndex: 100,
    elevation: 6,
  },
  fab: {
    width: 96,
    height: 96,
  },
});
