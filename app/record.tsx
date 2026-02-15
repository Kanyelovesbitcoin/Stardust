import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useMutation } from 'convex/react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../convex/_generated/api';
import ScreenContainer from '../components/ui/ScreenContainer';
import MoodSelector from '../components/journal/MoodSelector';
import VoiceRecorder from '../components/journal/VoiceRecorder';
import { usePeriodicPaywall } from '../lib/hooks/usePeriodicPaywall';
import { useReviewPrompt } from '../lib/hooks/useReviewPrompt';
import { onDreamSaved as notifyDreamSaved } from '../lib/notifications';
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
  const [category, setCategory] = useState<string | null>(null);
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
          category: category ?? undefined,
          tags,
        });
      } else {
        await createDream({
          transcript: transcript.trim(),
          mood: mood ?? undefined,
          category: category ?? undefined,
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
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Dream</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !canSave}
            style={[styles.saveButton, (saving || !canSave) && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'voice' && styles.modeTabActive]}
            onPress={() => setMode('voice')}
          >
            <Ionicons
              name="mic"
              size={18}
              color={mode === 'voice' ? COLORS.background : COLORS.textSecondary}
            />
            <Text
              style={[styles.modeTabText, mode === 'voice' && styles.modeTabTextActive]}
            >
              Voice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'text' && styles.modeTabActive]}
            onPress={() => setMode('text')}
          >
            <Ionicons
              name="pencil"
              size={18}
              color={mode === 'text' ? COLORS.background : COLORS.textSecondary}
            />
            <Text
              style={[styles.modeTabText, mode === 'text' && styles.modeTabTextActive]}
            >
              Type
            </Text>
          </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={28}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewTitle}>Dream Recording</Text>
                  <Text style={styles.previewDuration}>
                    {formatDuration(recordingDuration)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.reRecordButton}
                onPress={handleReRecord}
              >
                <Ionicons name="refresh" size={16} color={COLORS.recording} />
                <Text style={styles.reRecordText}>Re-record</Text>
              </TouchableOpacity>
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

          {/* Category Selector */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {([
                { key: 'ink', label: 'Ink', icon: 'document-text-outline' as const, desc: 'Written reflection' },
                { key: 'hope', label: 'Hope', icon: 'sparkles-outline' as const, desc: 'Aspirational dream' },
                { key: 'archive', label: 'Archive', icon: 'leaf-outline' as const, desc: 'Memory keeper' },
              ]).map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}
                    onPress={() => setCategory(isSelected ? null : cat.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                      {cat.label}
                    </Text>
                    <Text style={styles.categoryDesc}>{cat.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>Dream Tags</Text>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tagPill}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Ionicons
                    name="close-circle"
                    size={14}
                    color={COLORS.primaryText}
                  />
                </TouchableOpacity>
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
  cancelText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.sm + 2,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    fontWeight: '600',
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
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: COLORS.background,
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
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  previewDuration: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surfaceElevated,
  },
  reRecordText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.recording,
    fontWeight: '500',
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
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 4,
  },
  categoryButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  categoryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  categoryLabelActive: {
    color: COLORS.primaryText,
  },
  categoryDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 9,
    textAlign: 'center',
  },
  tagsSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.primaryDim,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryText,
    fontWeight: '500',
    fontSize: 12,
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
