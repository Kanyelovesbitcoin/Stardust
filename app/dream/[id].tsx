import React, { useState } from 'react';
import { Image } from 'expo-image';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../convex/_generated/api';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ShieldBadge from '../../components/ui/ShieldBadge';
import ProBadge from '../../components/ui/ProBadge';
import { useDroplettPro } from '../../lib/superwall';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { requestVisualizationWithGate } from '../../lib/visualizationGate';
import { DroplettText } from '../../components/ui/DroplettText';
import { DroplettCard } from '../../components/ui/DroplettCard';
import { DropletButton } from '../../components/ui/DropletButton';
import { MoodPill } from '../../components/ui/MoodPill';
import { GoldDivider } from '../../components/ui/GoldDivider';
import DreamScene from '../../components/visualizer/DreamScene';
import type { Id } from '../../convex/_generated/dataModel';
import { DREAM_TAGS, DreamTagKey } from '../../lib/constants';
import { useAIConsent } from '../../components/ui/AIConsentModal';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dream = useQuery(api.dreams.getDream, {
    dreamId: id as Id<"dreams">,
  });
  const deleteDream = useMutation(api.dreams.deleteDream);
  const updateDream = useMutation(api.dreams.updateDream);
  const requestInterpretation = useMutation(api.dreams.requestInterpretation);
  const requestVisualization = useMutation(api.dreams.requestVisualization);
  const { isPro, showPaywall, registerFeatureWithDailyFree, hasFreeImageToday } = useDroplettPro();
  const { ensureConsent, consentModal } = useAIConsent();

  if (dream === undefined) {
    return (
      <ScreenContainer backgroundSource={require('../../assets/bg-settings.png')} style={styles.centered}>
        <ActivityIndicator size="small" color={DROPLETT_THEME.gold.warm} />
      </ScreenContainer>
    );
  }

  if (dream === null) {
    return (
      <ScreenContainer backgroundSource={require('../../assets/bg-settings.png')} style={styles.centered}>
        <DroplettText variant="body" color={DROPLETT_THEME.text.secondary}>Dream not found</DroplettText>
        <Pressable onPress={() => router.back()} style={styles.goBackLink}>
          <DroplettText variant="button" color={DROPLETT_THEME.gold.warm}>Go Back</DroplettText>
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

  const handleInterpret = async () => {
    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) {
      Alert.alert('No Transcript', 'Wait for transcription to complete first.');
      return;
    }
    if (dream.isInterpreting) return;

    const consented = await ensureConsent();
    if (!consented) return;

    registerFeatureWithDailyFree('interpret_dream', async () => {
      try {
        await requestInterpretation({ dreamId: dream._id });
      } catch (e: any) {
        const msg = e?.message?.includes('Monthly AI limit')
          ? e.message
          : e?.message?.includes('Pro subscription required')
            ? 'This feature requires Droplett Pro.'
            : 'Failed to start interpretation.';
        Alert.alert('Error', msg);
      }
    });
  };

  const handleVisualize = async () => {
    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) {
      Alert.alert('No Transcript', 'Wait for transcription to complete first.');
      return;
    }
    if (dream.isGeneratingVisual) return;

    const consented = await ensureConsent();
    if (!consented) return;

    void requestVisualizationWithGate({
      isPro,
      showPaywall,
      startVisualization: async () => {
        await requestVisualization({ dreamId: dream._id });
      },
    }).catch((e: any) => {
        const msg = e?.message?.includes('Monthly AI limit')
          ? e.message
          : e?.message?.includes('Pro subscription required')
            ? 'This feature requires Droplett Pro.'
            : 'Failed to start visualization.';
        Alert.alert('Error', msg);
    });
  };

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const interp = dream.interpretation;
  const title = dream.transcript
    ? dream.transcript.split(/\s+/).slice(0, 5).join(' ') + (dream.transcript.length > 30 ? '...' : '')
    : "Untitled Dream";

  const interpretLabel = dream.isInterpreting ? "Interpreting..." : (interp ? "Re-interpret" : "Interpret");
  const visualizeLabel = dream.isGeneratingVisual ? "Painting..." : (dream.sceneUrl ? "Re-visualize" : "Visualize");

  return (
    <ScreenContainer backgroundSource={require('../../assets/bg-settings.png')}>
      {consentModal}
      {/* 1. Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={24}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#8B7355" />
          <DroplettText variant="bodySmall" color="#8B7355" style={styles.backLabel}>
            BACK
          </DroplettText>
        </Pressable>

        <View style={styles.headerRight}>
          <ShieldBadge />
          {isPro && <ProBadge />}
          <Pressable onPress={handleToggleFavorite} hitSlop={12}>
            <Ionicons
              name={dream.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={dream.isFavorite ? DROPLETT_THEME.gold.warm : DROPLETT_THEME.gold.muted}
            />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color={DROPLETT_THEME.mood.scared} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 2. Title & Tags */}
        <DroplettText variant="cardTitle" color="#1A1A1A" style={styles.dreamTitle}>
          {title}
        </DroplettText>

        <View style={styles.moodRow}>
          {dream.tags.map((tag: string) => {
            const tagDef = DREAM_TAGS[tag as DreamTagKey];
            return (
              <View key={tag} style={styles.tagPill}>
                {tagDef && (
                  <Image source={tagDef.image} style={{ width: 18, height: 18, marginRight: 4, borderRadius: 9, overflow: 'hidden' }} contentFit="contain" />
                )}
                <DroplettText variant="bodySmall" color="#1A1A1A">
                  {tagDef?.label ?? tag}
                </DroplettText>
              </View>
            );
          })}
        </View>

        {/* 4. Transcript Card */}
        <DroplettCard style={styles.transcriptCard}>
          {dream.isTranscribing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={DROPLETT_THEME.gold.muted} />
              <DroplettText variant="bodySmall" color={DROPLETT_THEME.text.secondary} style={styles.loadingText}>
                Transcribing dream...
              </DroplettText>
            </View>
          ) : (
            <DroplettText variant="body" color={DROPLETT_THEME.text.primary} style={styles.transcriptText}>
              {dream.editedTranscript || dream.transcript || "No details recorded."}
            </DroplettText>
          )}
        </DroplettCard>

        {/* 5. AI Section */}
        <View style={styles.aiButtons}>
          <Pressable onPress={handleInterpret} style={styles.outlineButton}>
            <DroplettText variant="button" color="#8B7355">{interpretLabel}</DroplettText>
          </Pressable>

          <Pressable onPress={handleVisualize} style={styles.outlineButton}>
            <DroplettText variant="button" color="#8B7355">{visualizeLabel}</DroplettText>
          </Pressable>
        </View>

        {/* Free badge */}
        {!isPro && hasFreeImageToday && !interp && (
          <DroplettText variant="label" color={DROPLETT_THEME.gold.bright} align="center" style={styles.freeBadge}>
            1 FREE INTERPRETATION TODAY
          </DroplettText>
        )}

        {/* 6. Interpretation Card */}
        {interp && !dream.isInterpreting && (
          <DroplettCard style={styles.interpCard}>
            <View style={styles.interpHeader}>
              <DroplettText variant="cardTitle" color={DROPLETT_THEME.gold.muted} style={styles.interpTitle}>
                Interpretation
              </DroplettText>
              <GoldDivider />
            </View>

            <View style={styles.interpSection}>
              <DroplettText variant="label" color={DROPLETT_THEME.mood.bizarre} style={styles.interpLabel}>THEME</DroplettText>
              <DroplettText variant="body" color={DROPLETT_THEME.text.primary} style={styles.interpTheme}>
                {cleanText(interp.emotionalTheme)}
              </DroplettText>
            </View>

            <View style={styles.interpSection}>
              <DroplettText variant="label" color={DROPLETT_THEME.mood.bizarre} style={styles.interpLabel}>ANALYSIS</DroplettText>
              <DroplettText variant="body" color={DROPLETT_THEME.text.primary}>
                {cleanText(interp.fullAnalysis)}
              </DroplettText>
            </View>

            <View style={styles.insightBox}>
              <Ionicons name="bulb-outline" size={16} color={DROPLETT_THEME.gold.bright} />
              <DroplettText variant="bodySmall" color={DROPLETT_THEME.text.primary} style={styles.insightText}>
                {cleanText(interp.practicalInsight)}
              </DroplettText>
            </View>
          </DroplettCard>
        )}

        {/* 7. Generated Image */}
        {(dream.sceneUrl || dream.isGeneratingVisual || dream.imageError) && (
          <View style={styles.imageSection}>
            <DreamScene
              sceneUrl={dream.sceneUrl}
              isGenerating={dream.isGeneratingVisual}
              imageError={dream.imageError}
              onRetry={handleVisualize}
              onPress={dream.sceneUrl ? () => setImageModalVisible(true) : handleVisualize}
            />
            {dream.sceneUrl && !dream.isGeneratingVisual && (
              <Pressable
                onPress={() => router.push(`/gallery?highlight=${dream._id}`)}
                style={styles.galleryLink}
              >
                <DroplettText variant="label" color={DROPLETT_THEME.gold.warm}>
                  View in Gallery
                </DroplettText>
                <Ionicons name="arrow-forward" size={14} color={DROPLETT_THEME.gold.warm} />
              </Pressable>
            )}
          </View>
        )}

      </ScrollView>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setImageModalVisible(false)}>
          <View style={styles.modalContent}>
            {dream.sceneUrl && (
              <Image
                source={{ uri: dream.sceneUrl }}
                style={styles.modalImage}
                contentFit="contain"
                transition={200}
              />
            )}
            <Pressable style={styles.modalClose} onPress={() => setImageModalVisible(false)}>
              <Ionicons name="close-circle" size={36} color="#fff" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
    paddingBottom: 150,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
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
