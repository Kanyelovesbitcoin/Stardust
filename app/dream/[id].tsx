import React from 'react';
import { Image } from 'expo-image';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../convex/_generated/api';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ShieldBadge from '../../components/ui/ShieldBadge';
import ProBadge from '../../components/ui/ProBadge';
import { useStardustPro } from '../../lib/superwall';
import { STARDUST_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { StardustText } from '../../components/ui/StardustText';
import { StardustCard } from '../../components/ui/StardustCard';
import { DropletButton } from '../../components/ui/DropletButton';
import { MoodPill } from '../../components/ui/MoodPill';
import { GoldDivider } from '../../components/ui/GoldDivider';
import DreamScene from '../../components/visualizer/DreamScene';
import type { Id } from '../../convex/_generated/dataModel';
import { DREAM_TAGS, DreamTagKey } from '../../lib/constants';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dream = useQuery(api.dreams.getDream, {
    dreamId: id as Id<"dreams">,
  });
  const deleteDream = useMutation(api.dreams.deleteDream);
  const updateDream = useMutation(api.dreams.updateDream);
  const requestInterpretation = useMutation(api.dreams.requestInterpretation);
  const requestVisualization = useMutation(api.dreams.requestVisualization);
  const { isPro, registerFeature, registerFeatureWithDailyFree, hasFreeImageToday } = useStardustPro();

  if (dream === undefined) {
    return (
      <ScreenContainer backgroundSource={require('../../assets/bg-settings.png')} style={styles.centered}>
        <ActivityIndicator size="small" color={STARDUST_THEME.gold.warm} />
      </ScreenContainer>
    );
  }

  if (dream === null) {
    return (
      <ScreenContainer backgroundSource={require('../../assets/bg-settings.png')} style={styles.centered}>
        <StardustText variant="body" color={STARDUST_THEME.text.secondary}>Dream not found</StardustText>
        <Pressable onPress={() => router.back()} style={styles.goBackLink}>
          <StardustText variant="button" color={STARDUST_THEME.gold.warm}>Go Back</StardustText>
        </Pressable>
      </ScreenContainer>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Dream', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDream({ dreamId: dream._id });
          router.back();
        },
      },
    ]);
  };

  const handleToggleFavorite = () => {
    updateDream({
      dreamId: dream._id,
      isFavorite: !dream.isFavorite,
    });
  };

  const handleInterpret = () => {
    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) {
      Alert.alert('No Transcript', 'Wait for transcription to complete first.');
      return;
    }
    if (dream.isInterpreting) return;

    registerFeature('interpret_dream', async () => {
      try {
        await requestInterpretation({ dreamId: dream._id });
      } catch {
        Alert.alert('Error', 'Failed to start interpretation.');
      }
    });
  };

  const handleVisualize = () => {
    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) {
      Alert.alert('No Transcript', 'Wait for transcription to complete first.');
      return;
    }
    if (dream.isGeneratingVisual) return;

    registerFeatureWithDailyFree('visualize_dream', async () => {
      try {
        await requestVisualization({ dreamId: dream._id, isPro });
      } catch (e: any) {
        const msg = e?.message?.includes('limit reached')
          ? 'You\'ve used your free visualization for today. Upgrade to Pro for unlimited.'
          : 'Failed to start visualization.';
        Alert.alert('Error', msg);
      }
    });
  };

  const interp = dream.interpretation;
  const title = dream.transcript
    ? dream.transcript.split(/\s+/).slice(0, 5).join(' ') + (dream.transcript.length > 30 ? '...' : '')
    : "Untitled Dream";

  const interpretLabel = dream.isInterpreting ? "Interpreting..." : (interp ? "Re-interpret" : "Interpret");
  const visualizeLabel = dream.isGeneratingVisual ? "Painting..." : (dream.sceneUrl ? "Re-visualize" : "Visualize");

  return (
    <ScreenContainer backgroundSource={require('../../assets/bg-settings.png')}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={24}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#8B7355" />
          <StardustText variant="bodySmall" color="#8B7355" style={styles.backLabel}>
            BACK
          </StardustText>
        </Pressable>

        <View style={styles.headerRight}>
          <ShieldBadge />
          {isPro && <ProBadge />}
          <Pressable onPress={handleToggleFavorite} hitSlop={12}>
            <Ionicons
              name={dream.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={dream.isFavorite ? STARDUST_THEME.gold.warm : STARDUST_THEME.gold.muted}
            />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color={STARDUST_THEME.mood.scared} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 2. Title & Tags */}
        <StardustText variant="cardTitle" color="#1A1A1A" style={styles.dreamTitle}>
          {title}
        </StardustText>

        <View style={styles.moodRow}>
          {dream.tags.map((tag: string) => {
            const tagDef = DREAM_TAGS[tag as DreamTagKey];
            return (
              <View key={tag} style={styles.tagPill}>
                {tagDef && (
                  <Image source={tagDef.image} style={{ width: 18, height: 18, marginRight: 4 }} contentFit="contain" />
                )}
                <StardustText variant="bodySmall" color="#1A1A1A">
                  {tagDef?.label ?? tag}
                </StardustText>
              </View>
            );
          })}
        </View>

        {/* 4. Transcript Card */}
        <StardustCard style={styles.transcriptCard}>
          {dream.isTranscribing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={STARDUST_THEME.gold.muted} />
              <StardustText variant="bodySmall" color={STARDUST_THEME.text.secondary} style={styles.loadingText}>
                Transcribing dream...
              </StardustText>
            </View>
          ) : (
            <StardustText variant="body" color={STARDUST_THEME.text.primary} style={styles.transcriptText}>
              {dream.editedTranscript || dream.transcript || "No details recorded."}
            </StardustText>
          )}
        </StardustCard>

        {/* 5. AI Section */}
        <View style={styles.aiButtons}>
          <Pressable onPress={handleInterpret} style={styles.outlineButton}>
            <StardustText variant="button" color="#8B7355">{interpretLabel}</StardustText>
          </Pressable>

          <Pressable onPress={handleVisualize} style={styles.outlineButton}>
            <StardustText variant="button" color="#8B7355">{visualizeLabel}</StardustText>
          </Pressable>
        </View>

        {/* Free badge */}
        {!isPro && hasFreeImageToday && !dream.sceneUrl && (
          <StardustText variant="label" color={STARDUST_THEME.gold.bright} align="center" style={styles.freeBadge}>
            1 FREE VISUALIZATION TODAY
          </StardustText>
        )}

        {/* 6. Interpretation Card */}
        {interp && !dream.isInterpreting && (
          <StardustCard style={styles.interpCard}>
            <View style={styles.interpHeader}>
              <StardustText variant="cardTitle" color={STARDUST_THEME.gold.muted} style={styles.interpTitle}>
                Interpretation
              </StardustText>
              <GoldDivider />
            </View>

            <View style={styles.interpSection}>
              <StardustText variant="label" color={STARDUST_THEME.mood.bizarre} style={styles.interpLabel}>THEME</StardustText>
              <StardustText variant="body" color={STARDUST_THEME.text.primary} style={styles.interpTheme}>
                {cleanText(interp.emotionalTheme)}
              </StardustText>
            </View>

            <View style={styles.interpSection}>
              <StardustText variant="label" color={STARDUST_THEME.mood.bizarre} style={styles.interpLabel}>ANALYSIS</StardustText>
              <StardustText variant="body" color={STARDUST_THEME.text.primary}>
                {cleanText(interp.fullAnalysis)}
              </StardustText>
            </View>

            <View style={styles.insightBox}>
              <Ionicons name="bulb-outline" size={16} color={STARDUST_THEME.gold.bright} />
              <StardustText variant="bodySmall" color={STARDUST_THEME.text.primary} style={styles.insightText}>
                {cleanText(interp.practicalInsight)}
              </StardustText>
            </View>
          </StardustCard>
        )}

        {/* 7. Generated Image */}
        {(dream.sceneUrl || dream.isGeneratingVisual || dream.imageError) && (
          <View style={styles.imageSection}>
            <DreamScene
              sceneUrl={dream.sceneUrl}
              isGenerating={dream.isGeneratingVisual}
              imageError={dream.imageError}
              onRetry={handleVisualize}
            />
            {dream.sceneUrl && !dream.isGeneratingVisual && (
              <Pressable
                onPress={() => router.push(`/gallery?highlight=${dream._id}`)}
                style={styles.galleryLink}
              >
                <StardustText variant="label" color={STARDUST_THEME.gold.warm}>
                  View in Gallery
                </StardustText>
                <Ionicons name="arrow-forward" size={14} color={STARDUST_THEME.gold.warm} />
              </Pressable>
            )}
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-\u2013\u2014\u2022]\s+/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackLink: {
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backLabel: {
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: 50,
  },
  dreamTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(240, 238, 232, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  transcriptCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: '#1A1A1A',
    borderRadius: RADIUS.xl,
  },
  transcriptText: {
    lineHeight: 26,
    color: '#F0EEE8',
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  loadingText: {
    marginLeft: 8,
  },
  aiButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 115, 85, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeBadge: {
    marginBottom: SPACING.md,
    marginTop: -SPACING.md,
  },
  interpCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
  },
  interpHeader: {
    marginBottom: SPACING.md,
  },
  interpTitle: {
    marginBottom: SPACING.sm,
  },
  interpLabel: {
    marginBottom: 4,
  },
  interpTheme: {
    fontStyle: 'italic',
  },
  interpSection: {
    marginBottom: SPACING.lg,
  },
  insightBox: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: 'rgba(232, 197, 71, 0.05)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  insightText: {
    flex: 1,
  },
  imageSection: {
    marginBottom: SPACING.xl,
  },
  galleryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
});
