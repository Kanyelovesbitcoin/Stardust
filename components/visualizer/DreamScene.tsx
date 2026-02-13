import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { STARDUST_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { StardustText } from '../ui/StardustText';
import { StardustButton } from '../ui/StardustButton';

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

export default function DreamScene({
  sceneUrl,
  isGenerating,
  imageError,
  onRetry,
  onPress,
  aspectRatio = 1,
  borderRadius = RADIUS.lg,
  showCaption = true,
}: DreamSceneProps) {
  // Loading/shimmer state
  if (isGenerating && !sceneUrl) {
    return (
      <View style={[styles.container, { aspectRatio, borderRadius }]}>
        <View style={[styles.shimmer, { borderRadius }]}>
          <ActivityIndicator size="small" color={STARDUST_THEME.gold.muted} />
          <Ionicons
            name="brush-outline"
            size={28}
            color={STARDUST_THEME.gold.muted}
            style={{ marginTop: SPACING.sm }}
          />
          <StardustText
            variant="label"
            color={STARDUST_THEME.gold.muted}
            style={{ marginTop: SPACING.sm }}
          >
            Painting your dream...
          </StardustText>
        </View>
      </View>
    );
  }

  // Error state
  if (imageError && !sceneUrl) {
    return (
      <View style={[styles.container, { aspectRatio, borderRadius }]}>
        <View style={[styles.errorContainer, { borderRadius }]}>
          <Ionicons name="alert-circle-outline" size={32} color={STARDUST_THEME.mood.scared} />
          <StardustText
            variant="bodySmall"
            color={STARDUST_THEME.text.secondary}
            align="center"
            style={{ marginTop: SPACING.sm, maxWidth: 220 }}
          >
            {imageError}
          </StardustText>
          {onRetry && (
            <StardustButton
              onPress={onRetry}
              variant="ghost"
              style={{ marginTop: SPACING.md }}
            >
              Retry
            </StardustButton>
          )}
        </View>
      </View>
    );
  }

  // Image loaded
  if (sceneUrl) {
    return (
      <View>
        <Pressable onPress={onPress} disabled={!onPress}>
          <Image
            source={{ uri: sceneUrl }}
            style={[styles.image, { aspectRatio, borderRadius }]}
            contentFit="cover"
            transition={800}
            placeholder={{ blurhash: BLURHASH }}
          />
        </Pressable>
        {showCaption && (
          <StardustText
            variant="bodySmall"
            color={STARDUST_THEME.text.tertiary}
            align="center"
            style={{ marginTop: SPACING.sm }}
          >
            Generated based on your dream
          </StardustText>
        )}
      </View>
    );
  }

  // No image, not generating, no error — empty state
  return null;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: STARDUST_THEME.bg.secondary,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: STARDUST_THEME.border,
    borderStyle: 'dashed',
  },
  shimmer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  image: {
    width: '100%',
    borderWidth: 1,
    borderColor: STARDUST_THEME.border,
  },
});
