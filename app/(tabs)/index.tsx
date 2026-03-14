import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
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
import { api } from '../../convex/_generated/api';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { DroplettText } from '../../components/ui/DroplettText';
import { DroplettCard } from '../../components/ui/DroplettCard';
import { MoodPill } from '../../components/ui/MoodPill';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { DREAM_TYPES, DREAM_TAGS, DreamType, DreamTagKey } from '../../lib/constants';
import { useSupabaseAuth } from '../../lib/useSupabaseAuth';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return "Morning dreams";
  if (hour >= 12 && hour < 17) return "Afternoon reflection";
  if (hour >= 17 && hour < 23) return "Evening thoughts";
  return "Night visions";
};

export default function JournalHome() {
  const { isAuthenticated: isSignedIn } = useSupabaseAuth();
  const dreams = useQuery(api.dreams.listDreams) ?? [];
  const greeting = getGreeting();

  // FAB Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
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
    const shortTitle = item.title
      || (item.transcript ? item.transcript.split(/\s+/)[0] : "Dream");

    const bodyPreview = item.transcript || "No details recorded.";
    const strokeType = item.dreamType as DreamType | undefined;
    const strokeImage = strokeType && DREAM_TYPES[strokeType]?.image;

    return (
      <Pressable
        onPress={() => router.push(`/dream/${item._id}`)}
        style={styles.dreamCard}
      >
        <DroplettText variant="label" color="#8B7355" style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
        </DroplettText>

        <View style={styles.titleRow}>
          <DroplettText variant="cardTitle" color="#000000" style={styles.titleText}>
            {shortTitle}
          </DroplettText>
          {strokeImage && (
            <Image source={strokeImage} style={styles.strokeImage} contentFit="contain" />
          )}
        </View>

        <DroplettText variant="bodySmall" color="#1A1A1A" numberOfLines={2} style={styles.bodyText}>
          {bodyPreview}
        </DroplettText>

        <View style={styles.tealDivider} />

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagRow}>
            {item.tags.slice(0, 5).map((tag: string, i: number) => {
              const tagDef = DREAM_TAGS[tag as DreamTagKey];
              if (tagDef) {
                return (
                  <View key={i} style={styles.tagItem}>
                    <Image source={tagDef.image} style={styles.tagImage} contentFit="contain" />
                    <DroplettText variant="bodySmall" color="#1A1A1A" style={{ fontSize: 11 }}>
                      {tagDef.label}
                    </DroplettText>
                  </View>
                );
              }
              return (
                <DroplettText key={i} variant="bodySmall" color="#1A1A1A" style={{ fontSize: 13 }}>
                  {tag}
                </DroplettText>
              );
            })}
          </View>
        )}
      </Pressable>
    );
  }, []);

  const renderSectionHeader = useCallback(({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.stickyHeader}>
      <DroplettText variant="label" color="#8B7355">
        {title}
      </DroplettText>
    </View>
  ), []);

  const keyExtractor = useCallback((item: any) => item._id, []);

  return (
    <ScreenContainer backgroundSource={require('../../assets/bg-home.png')}>
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
              <DroplettText variant="heroTitle" color="#1A1A1A" style={{ fontSize: 36, letterSpacing: 1, fontStyle: 'italic' }}>Droplett</DroplettText>
              <DroplettText variant="body" color="#6B6358" style={{ letterSpacing: 0.5, marginTop: 2 }}>
                {greeting}
              </DroplettText>
            </View>
            <View style={styles.headerRight}>
              {isSignedIn ? (
                <DroplettText variant="label" color="#C4A265" style={{ marginRight: 12 }}>PRO</DroplettText>
              ) : (
                <Pressable onPress={() => router.push('/sign-in')} style={{ marginRight: 12 }}>
                  <DroplettText variant="label" color="#C4A265">Sign In</DroplettText>
                </Pressable>
              )}
              <Pressable onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={24} color="#1A1A1A" />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyRecent}>
            <Ionicons name="moon-outline" size={32} color="#C4A265" style={{ marginBottom: SPACING.md }} />
            {isSignedIn ? (
              <>
                <DroplettText variant="dreamTitle" color="#4A4A4A" align="center">
                  Your journal awaits its first story
                </DroplettText>
                <DroplettText variant="bodySmall" color="#6B6358" align="center" style={{ marginTop: SPACING.sm }}>
                  Tap the button to record your first dream
                </DroplettText>
              </>
            ) : (
              <>
                <DroplettText variant="dreamTitle" color="#4A4A4A" align="center">
                  Sign in to start your journal
                </DroplettText>
                <Pressable onPress={() => router.push('/sign-in')} style={{ marginTop: SPACING.md }}>
                  <DroplettText variant="label" color="#C4A265">Sign In</DroplettText>
                </Pressable>
              </>
            )}
          </View>
        }
      />

      {/* FAB - Record Dream */}
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
            source={require('../../assets/record-button.png')}
            style={styles.fab}
            contentFit="contain"
            cachePolicy="memory"
          />
        </Pressable>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 120,
  },
  stickyHeader: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dreamCard: {
    marginHorizontal: SPACING.screenPadding,
    marginBottom: 28,
    paddingVertical: 20,
    minHeight: 200,
  },
  dateText: {
    fontSize: 14,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    flex: 1,
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#1A1A1A',
    includeFontPadding: true,
  },
  strokeImage: {
    width: 300,
    height: 140,
    marginLeft: -30,
  },
  bodyText: {
    color: '#4A4A4A',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tealDivider: {
    height: 2.5,
    backgroundColor: '#7BAFD4',
    borderRadius: 2,
    marginTop: SPACING.md,
    opacity: 0.7,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: SPACING.sm,
  },
  tagItem: {
    alignItems: 'center',
    minWidth: 56,
  },
  tagImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  emptyRecent: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    zIndex: 100,
    elevation: 6,
  },
  fab: {
    width: 100,
    height: 100,
  },
});
