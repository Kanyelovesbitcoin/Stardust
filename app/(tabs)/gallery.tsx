import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { api } from '../../convex/_generated/api';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { DroplettText } from '../../components/ui/DroplettText';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { useSupabaseAuth } from '../../lib/useSupabaseAuth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const COLUMN_WIDTH = (SCREEN_WIDTH - SPACING.screenPadding * 2 - GRID_GAP) / 2;
const IMAGE_HEIGHT = COLUMN_WIDTH * (4 / 3);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

async function downloadToLocal(remoteUrl: string): Promise<string> {
  const filename = `dream_${Date.now()}.png`;
  const localUri = FileSystem.cacheDirectory + filename;
  const { uri } = await FileSystem.downloadAsync(remoteUrl, localUri);
  return uri;
}

async function handleShare(sceneUrl: string) {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
      return;
    }
    const localUri = await downloadToLocal(sceneUrl);
    await Sharing.shareAsync(localUri, { mimeType: 'image/png', dialogTitle: 'Share your dream' });
  } catch (err) {
    console.error('Share error:', err);
    Alert.alert('Error', 'Failed to share image.');
  }
}

async function handleSave(sceneUrl: string) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow photo library access in Settings to save dream images.'
      );
      return;
    }
    const localUri = await downloadToLocal(sceneUrl);
    await MediaLibrary.saveToLibraryAsync(localUri);
    Alert.alert('Saved', 'Dream image saved to Photos.');
  } catch (err) {
    console.error('Save error:', err);
    Alert.alert('Error', 'Failed to save image.');
  }
}

export default function GalleryScreen() {
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const { isAuthenticated: isSignedIn } = useSupabaseAuth();

  const galleryDreams = useQuery(api.dreams.listGalleryDreams) ?? [];

  const visualizedCount = useMemo(() => galleryDreams.filter((d) => d.sceneUrl).length, [galleryDreams]);
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
            <ActivityIndicator size="small" color={DROPLETT_THEME.gold.muted} />
            <Ionicons name="brush-outline" size={24} color={DROPLETT_THEME.gold.muted} style={{ marginTop: 6 }} />
            <DroplettText variant="label" color={DROPLETT_THEME.gold.muted} style={{ marginTop: 8 }}>
              Painting...
            </DroplettText>
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

          <View style={styles.dateBadge}>
            <DroplettText variant="timestamp" color={DROPLETT_THEME.text.primary} style={{ fontSize: 10 }}>
              {formatDate(item.createdAt)}
            </DroplettText>
          </View>

          {item.visualStyle && (
            <View style={styles.styleBadge}>
              <DroplettText variant="timestamp" color={DROPLETT_THEME.gold.warm} style={{ fontSize: 9 }}>
                {item.visualStyle.toUpperCase()}
              </DroplettText>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionButton}
              onPress={(e) => { e.stopPropagation(); handleShare(item.sceneUrl!); }}
              hitSlop={8}
            >
              <Ionicons name="share-outline" size={16} color="#F5E6C8" />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={(e) => { e.stopPropagation(); handleSave(item.sceneUrl!); }}
              hitSlop={8}
            >
              <Ionicons name="download-outline" size={16} color="#F5E6C8" />
            </Pressable>
          </View>

          {item.titlePreview && (
            <View style={styles.captionOverlay}>
              <DroplettText variant="bodySmall" color="#F5E6C8" numberOfLines={1} style={{ fontSize: 11 }}>
                {item.titlePreview}
              </DroplettText>
            </View>
          )}
        </View>
      </Pressable>
    );
  }, [highlight]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={48} color="#2A2A35" style={{ marginBottom: SPACING.md }} />
      {isSignedIn ? (
        <>
          <DroplettText variant="screenTitle" color="#0A0A0F" style={{ marginBottom: SPACING.sm, textAlign: 'center' }}>
            Your dream gallery awaits
          </DroplettText>
          <DroplettText variant="body" color="#2A2A35" align="center" style={{ maxWidth: 280 }}>
            Visualize your dreams with AI to fill this space with your subconscious art.
          </DroplettText>
        </>
      ) : (
        <>
          <DroplettText variant="screenTitle" color="#0A0A0F" style={{ marginBottom: SPACING.sm, textAlign: 'center' }}>
            Sign in to see your gallery
          </DroplettText>
          <Pressable onPress={() => router.push('/sign-in')} style={{ marginTop: SPACING.md }}>
            <DroplettText variant="label" color={DROPLETT_THEME.gold.bright}>
              Sign In
            </DroplettText>
          </Pressable>
        </>
      )}
    </View>
  ), [isSignedIn]);

  const keyExtractor = useCallback((item: any) => item._id, []);

  const ROW_HEIGHT = IMAGE_HEIGHT + GRID_GAP + SPACING.xs;
  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * Math.floor(index / 2),
    index,
  }), []);

  return (
    <ScreenContainer backgroundSource={require('../../assets/bg-gallery.png')}>
      <View style={styles.header}>
        <View>
          <DroplettText variant="screenTitle" color="#0A0A0F">
            Gallery
          </DroplettText>
          <DroplettText variant="bodySmall" color="#2A2A35">
            {visualizedCount} {visualizedCount === 1 ? 'creation' : 'creations'}
          </DroplettText>
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
        getItemLayout={getItemLayout}
      />
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
    paddingBottom: 40,
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
    borderColor: DROPLETT_THEME.gold.bright,
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
    backgroundColor: DROPLETT_THEME.bg.secondary,
    borderWidth: 1,
    borderColor: DROPLETT_THEME.gold.muted + '40',
  },
  shimmerContainer: {
    width: COLUMN_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DROPLETT_THEME.bg.secondary,
    borderWidth: 1,
    borderColor: DROPLETT_THEME.border,
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
  actionRow: {
    position: 'absolute',
    bottom: 32,
    right: 6,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(10, 10, 15, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
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
