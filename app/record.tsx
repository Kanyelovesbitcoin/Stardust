import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useMutation } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { api } from '../convex/_generated/api';
import ScreenContainer from '../components/ui/ScreenContainer';
import MoodSelector from '../components/journal/MoodSelector';
import VoiceRecorder from '../components/journal/VoiceRecorder';
import { DropletButton } from '../components/ui/DropletButton';
import { StardustText } from '../components/ui/StardustText';
import { usePeriodicPaywall } from '../lib/hooks/usePeriodicPaywall';
import { useReviewPrompt } from '../lib/hooks/useReviewPrompt';
import { onDreamSaved as notifyDreamSaved } from '../lib/notifications';
import { STARDUST_THEME } from '../lib/theme';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../lib/constants';

type Mode = 'voice' | 'text';

export default function RecordScreen() {
  const createDream = useMutation(api.dreams.createDream);
  const generateUploadUrl = useMutation(api.dreams.generateUploadUrl);
  const { trackDreamSaved } = usePeriodicPaywall();
  const { trackDreamForReview } = useReviewPrompt();

  const [mode, setMode] = useState<Mode>('voice');
  const [transcript, setTranscript] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Voice mode state
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleRecordingComplete = (uri: string, durationMs: number) => {
    setRecordingUri(uri);
    setRecordingDuration(durationMs);
  };

  const handleReRecord = () => {
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setRecordingUri(null);
    setRecordingDuration(0);
    setIsPlaying(false);
  };

  const handlePlayPause = async () => {
    if (!recordingUri) return;

    if (isPlaying && soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            sound.setPositionAsync(0);
          }
        });
      }
      setIsPlaying(true);
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSave = async () => {
    if (mode === 'text' && !transcript.trim()) {
      Alert.alert('Empty Dream', 'Write something about your dream first.');
      return;
    }
    if (mode === 'voice' && !recordingUri) {
      Alert.alert('No Recording', 'Record your dream first.');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'voice' && recordingUri) {
        // Upload audio to Convex storage
        const uploadUrl = await generateUploadUrl();

        const response = await fetch(recordingUri);
        const blob = await response.blob();

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type || 'audio/m4a' },
          body: blob,
        });

        const { storageId } = (await uploadResponse.json()) as { storageId: string };

        await createDream({
          audioStorageId: storageId as any,
          mood: mood ?? undefined,
          tags,
        });
      } else {
        await createDream({
          transcript: transcript.trim(),
          mood: mood ?? undefined,
          tags,
        });
      }

      // Clean up sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Track for periodic paywall
      await trackDreamSaved();

      // Track for App Store review prompt (shows after 3rd dream)
      await trackDreamForReview();

      // Reset notification inactivity timer
      await notifyDreamSaved();

      router.back();
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save dream.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = mode === 'voice' ? !!recordingUri : !!transcript.trim();

  const recordBg = mode === 'voice'
    ? require('../assets/bg-voice-recording.png')
    : require('../assets/bg-type-mode.png');

  return (
    <ScreenContainer backgroundSource={recordBg}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
          >
            <StardustText variant="body" color={STARDUST_THEME.text.secondary}>Cancel</StardustText>
          </Pressable>
          <StardustText variant="cardTitle" color={STARDUST_THEME.text.primary}>New Dream</StardustText>
          <DropletButton
            onPress={handleSave}
            title={saving ? 'Saving...' : 'Save'}
            variant="gold"
            size="sm"
            loading={saving}
            disabled={!canSave}
          />
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeTab, mode === 'voice' && styles.modeTabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('voice'); }}
          >
            <Ionicons
              name="mic"
              size={18}
              color={mode === 'voice' ? STARDUST_THEME.bg.primary : STARDUST_THEME.text.secondary}
            />
            <StardustText
              variant="label"
              color={mode === 'voice' ? STARDUST_THEME.bg.primary : STARDUST_THEME.text.secondary}
            >
              Voice
            </StardustText>
          </Pressable>
          <Pressable
            style={[styles.modeTab, mode === 'text' && styles.modeTabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('text'); }}
          >
            <Ionicons
              name="pencil"
              size={18}
              color={mode === 'text' ? STARDUST_THEME.bg.primary : STARDUST_THEME.text.secondary}
            />
            <StardustText
              variant="label"
              color={mode === 'text' ? STARDUST_THEME.bg.primary : STARDUST_THEME.text.secondary}
            >
              Type
            </StardustText>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Voice Mode */}
          {mode === 'voice' && !recordingUri && (
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          )}

          {/* Voice Preview */}
          {mode === 'voice' && recordingUri && (
            <View style={styles.previewCard}>
              <View style={styles.previewTop}>
                <Pressable
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={28}
                    color={STARDUST_THEME.gold.warm}
                  />
                </Pressable>
                <View style={styles.previewInfo}>
                  <StardustText variant="body" color={STARDUST_THEME.text.primary}>Dream Recording</StardustText>
                  <StardustText variant="timestamp" color={STARDUST_THEME.text.secondary}>
                    {formatDuration(recordingDuration)}
                  </StardustText>
                </View>
              </View>
              <Pressable
                style={styles.reRecordButton}
                onPress={handleReRecord}
              >
                <Ionicons name="refresh" size={16} color={STARDUST_THEME.mood.scared} />
                <StardustText variant="label" color={STARDUST_THEME.mood.scared}>Re-record</StardustText>
              </Pressable>
            </View>
          )}

          {/* Text Mode */}
          {mode === 'text' && (
            <View style={styles.contentContainer}>
              <TextInput
                style={styles.contentInput}
                placeholder="What did you dream last night? Describe everything you remember..."
                placeholderTextColor={COLORS.textTertiary}
                value={transcript}
                onChangeText={setTranscript}
                multiline
                textAlignVertical="top"
                autoFocus
              />
            </View>
          )}

          {/* Mood Selector */}
          <MoodSelector selected={mood} onSelect={setMood} />

          {/* Tags */}
          <View style={styles.tagsSection}>
            <StardustText variant="label" color={STARDUST_THEME.text.secondary} style={styles.sectionLabel}>Dream Tags</StardustText>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  style={styles.tagPill}
                  onPress={() => removeTag(tag)}
                >
                  <StardustText variant="timestamp" color={STARDUST_THEME.text.primary}>{tag}</StardustText>
                  <Ionicons
                    name="close-circle"
                    size={14}
                    color={STARDUST_THEME.gold.muted}
                  />
                </Pressable>
              ))}
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="+ tag"
                  placeholderTextColor={COLORS.textTertiary}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                  maxLength={30}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  modeTabActive: {
    backgroundColor: STARDUST_THEME.gold.warm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: 2,
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  contentContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    minHeight: 220,
  },
  contentInput: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    minHeight: 200,
    lineHeight: 26,
  },
  tagsSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    marginBottom: SPACING.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
  },
  tagInputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
  },
  tagInput: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 12,
    minWidth: 50,
    paddingVertical: 0,
  },
});
