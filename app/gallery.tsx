import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../convex/_generated/api';
import BottomTabBar from '../components/ui/BottomTabBar';
import { STARDUST_THEME } from '../lib/theme';
import { RADIUS, SPACING } from '../lib/layout';
import { StardustText } from '../components/ui/StardustText';
import ScreenContainer from '../components/ui/ScreenContainer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const COLUMN_WIDTH = (SCREEN_WIDTH - SPACING.screenPadding * 2 - GRID_GAP) / 2;
const IMAGE_HEIGHT = COLUMN_WIDTH * (4 / 3);
const TAB_BAR_CLEARANCE = 100;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function GalleryScreen() {
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const galleryDreams = useQuery(api.dreams.listGalleryDreams) ?? [];

  const visualizedCount = galleryDreams.filter((d) => d.sceneUrl).length;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (highlight && flatListRef.current && galleryDreams.length > 0) {
      const index = galleryDreams.findIndex((d) => d._id === highlight);
      if (index >= 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: Math.floor(index / 2),
            animated: true,
            viewOffset: SPACING.md,
          });
        }, 300);
      }
    }
  }, [highlight, galleryDreams.length]);

  const renderItem = useCallback(({ item }: { item: (typeof galleryDreams)[number] }) => {
    const isHighlighted = highlight === item._id;

    if (item.isGeneratingVisual && !item.sceneUrl) {
      return (
        <Pressable
          style={[styles.cell, isHighlighted && styles.cellHighlighted]}
          onPress={() => router.push(`/dream/${item._id}`)}
        >
          <View style={styles.shimmerContainer}>
            <ActivityIndicator size="small" color={STARDUST_THEME.gold.muted} />
            <Ionicons name="brush-outline" size={24} color={STARDUST_THEME.gold.muted} style={{ marginTop: 6 }} />
            <StardustText variant="label" color={STARDUST_THEME.gold.muted} style={{ marginTop: 8 }}>
              Painting...
            </StardustText>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        style={[styles.cell, isHighlighted && styles.cellHighlighted]}
        onPress={() => router.push(`/dream/${item._id}`)}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.sceneUrl! }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            recyclingKey={item._id}
          />

          {/* Date badge — top-left */}
          <View style={styles.dateBadge}>
            <StardustText variant="timestamp" color={STARDUST_THEME.text.primary} style={{ fontSize: 10 }}>
              {formatDate(item.createdAt)}
            </StardustText>
          </View>

          {item.visualStyle && (
            <View style={styles.styleBadge}>
              <StardustText variant="timestamp" color={STARDUST_THEME.gold.warm} style={{ fontSize: 9 }}>
                {item.visualStyle.toUpperCase()}
              </StardustText>
            </View>
          )}

          {/* Caption overlay — bottom */}
          {item.titlePreview && (
            <View style={styles.captionOverlay}>
              <StardustText variant="bodySmall" color="#F5E6C8" numberOfLines={1} style={{ fontSize: 11 }}>
                {item.titlePreview}
              </StardustText>
            </View>
          )}
        </View>
      </Pressable>
    );
  }, [highlight]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={48} color="#2A2A35" style={{ marginBottom: SPACING.md }} />
      <StardustText variant="screenTitle" color="#0A0A0F" style={{ marginBottom: SPACING.sm, textAlign: 'center' }}>
        Your dream gallery awaits
      </StardustText>
      <StardustText variant="body" color="#2A2A35" align="center" style={{ maxWidth: 280 }}>
        Visualize your dreams with AI to fill this space with your subconscious art.
      </StardustText>
    </View>
  ), []);

  const keyExtractor = useCallback((item: any) => item._id, []);

  return (
    <ScreenContainer backgroundSource={require('../assets/bg-gallery.png')}>
      <View style={styles.header}>
        <View>
          <StardustText variant="screenTitle" color="#0A0A0F">
            Gallery
          </StardustText>
          <StardustText variant="bodySmall" color="#2A2A35">
            {visualizedCount} {visualizedCount === 1 ? 'creation' : 'creations'}
          </StardustText>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={galleryDreams}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={5}
      />

      <BottomTabBar activeTab="gallery" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.lg,
  },
  listContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE,
    flexGrow: 1,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  cell: {
    width: COLUMN_WIDTH,
    marginBottom: SPACING.xs,
  },
  cellHighlighted: {
    borderColor: STARDUST_THEME.gold.bright,
    borderWidth: 1,
    borderRadius: RADIUS.md,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: COLUMN_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: RADIUS.md,
    backgroundColor: STARDUST_THEME.bg.secondary,
    borderWidth: 1,
    borderColor: STARDUST_THEME.gold.muted + '40',
  },
  shimmerContainer: {
    width: COLUMN_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: STARDUST_THEME.bg.secondary,
    borderWidth: 1,
    borderColor: STARDUST_THEME.border,
    borderStyle: 'dashed',
  },
  dateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  styleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
});
