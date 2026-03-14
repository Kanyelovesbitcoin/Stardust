import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { DroplettText } from '../ui/DroplettText';
import { DropletButton } from '../ui/DropletButton';

interface DreamSceneProps {
  sceneUrl?: string | null;
  isGenerating: boolean;
  imageError?: string | null;
  onRetry?: () => void;
  onPress?: () => void;
  aspectRatio?: number;
  borderRadius?: number;
  showCaption?: boolean;
}

const BLURHASH = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azj19teleM{M|j[WBj[ofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7teleaya}j[ayj[j[ayofayj[oLofj[WCoeayj[j[fQj[aya}j[ayj[';

export default React.memo(function DreamScene({
  sceneUrl,
  isGenerating,
  imageError,
  onRetry,
  onPress,
  aspectRatio = 1,
  borderRadius = RADIUS.lg,
  showCaption = true,
}: DreamSceneProps) {
  if (isGenerating && !sceneUrl) {
    return (
      <View style={[styles.container, { aspectRatio, borderRadius }]}>
        <View style={[styles.shimmer, { borderRadius }]}>
          <ActivityIndicator size="small" color={DROPLETT_THEME.gold.muted} />
          <Ionicons
            name="brush-outline"
            size={28}
            color={DROPLETT_THEME.gold.muted}
            style={styles.shimmerIcon}
          />
          <DroplettText variant="label" color={DROPLETT_THEME.gold.muted} style={styles.shimmerText}>
            Painting your dream...
          </DroplettText>
        </View>
      </View>
    );
  }

  if (imageError && !sceneUrl) {
    return (
      <View style={[styles.container, { aspectRatio, borderRadius }]}>
        <View style={[styles.errorContainer, { borderRadius }]}>
          <Ionicons name="alert-circle-outline" size={32} color={DROPLETT_THEME.mood.scared} />
          <DroplettText
            variant="bodySmall"
            color={DROPLETT_THEME.text.secondary}
            align="center"
            style={styles.errorText}
          >
            {imageError}
          </DroplettText>
          {onRetry && (
            <DropletButton
              onPress={onRetry}
              title="Retry"
              variant="ghost"
              size="sm"
              style={styles.retryButton}
            />
          )}
        </View>
      </View>
    );
  }

  if (sceneUrl) {
    return (
      <View>
        <Pressable onPress={onPress} disabled={!onPress}>
          <Image
            source={{ uri: sceneUrl }}
            style={[styles.image, { aspectRatio, borderRadius }]}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: BLURHASH }}
            cachePolicy="memory-disk"
          />
        </Pressable>
        {showCaption && (
          <DroplettText
            variant="bodySmall"
            color={DROPLETT_THEME.text.tertiary}
            align="center"
            style={styles.caption}
          >
            Generated based on your dream
          </DroplettText>
        )}
      </View>
    );
  }

  return null;
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: DROPLETT_THEME.bg.secondary,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerIcon: {
    marginTop: SPACING.sm,
  },
  shimmerText: {
    marginTop: SPACING.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.sm,
    maxWidth: 220,
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  image: {
    width: '100%',
  },
  caption: {
    marginTop: SPACING.sm,
  },
});
