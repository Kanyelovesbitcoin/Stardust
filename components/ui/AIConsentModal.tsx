import React, { useState, useEffect } from 'react';
import { Modal, View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { DroplettText } from './DroplettText';
import { DroplettButton } from './DroplettButton';
import { hasAIConsent, setAIConsent } from '../../lib/aiConsent';

interface AIConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function AIConsentModal({ visible, onAccept, onCancel }: AIConsentModalProps) {
  const router = useRouter();

  const handleAccept = async () => {
    await setAIConsent();
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DroplettText variant="cardTitle" align="center" style={styles.title}>
              Before Using AI Features
            </DroplettText>

            <DroplettText variant="bodySmall" color={DROPLETT_THEME.text.secondary} style={styles.intro}>
              Droplett uses third-party AI services to transcribe, interpret, and visualize your dreams. Your explicit consent is required before any data is sent. Here is exactly what is shared, with whom, and why:
            </DroplettText>

            <DataFlowCard
              number="1"
              label="Voice Transcription"
              dataShared="Your voice audio recording file"
              sentTo="Groq, Inc. (groq.com)"
              purpose="Converts your spoken dream recording into text using the Whisper speech-to-text model"
              policyUrl="https://groq.com/privacy-policy/"
            />

            <DataFlowCard
              number="2"
              label="Dream Interpretation"
              dataShared="Your dream text (typed or transcribed)"
              sentTo="OpenRouter, Inc. (openrouter.ai), which routes the request to Google Gemini"
              purpose="Analyzes your dream text and generates a psychological interpretation"
              policyUrl="https://openrouter.ai/privacy"
            />

            <DataFlowCard
              number="3"
              label="Dream Artwork"
              dataShared="Your dream text (typed or transcribed)"
              sentTo="OpenRouter, Inc. (openrouter.ai), which routes the request to Google Gemini (for prompt creation) and FLUX.2 Pro by Black Forest Labs (for image generation)"
              purpose="Creates a visual artwork inspired by your dream"
              policyUrl="https://openrouter.ai/privacy"
            />

            <DataFlowCard
              number="4"
              label="Data Storage"
              dataShared="Your dreams, interpretations, and generated images"
              sentTo="Convex, Inc. (convex.dev)"
              purpose="Stores your dream journal data so you can access it across sessions"
              policyUrl="https://www.convex.dev/legal/privacy"
            />

            <View style={styles.securityBox}>
              <DroplettText variant="caption" color={DROPLETT_THEME.text.secondary} style={{ lineHeight: 18 }}>
                All data is transmitted securely over HTTPS. Third-party AI services process your data only to fulfill the request and do not use it to train their AI models. Your data is never sold or shared with any other parties.
              </DroplettText>
            </View>

            <Pressable
              onPress={() => {
                onCancel();
                router.push('/privacy');
              }}
              style={styles.learnMore}
            >
              <DroplettText variant="caption" color={DROPLETT_THEME.gold.warm}>
                Read our full Privacy Policy
              </DroplettText>
            </Pressable>
          </ScrollView>

          <View style={styles.buttons}>
            <DroplettButton onPress={handleAccept} fullWidth>
              I Agree — Send My Data to These Services
            </DroplettButton>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <DroplettText variant="bodySmall" color={DROPLETT_THEME.text.tertiary} align="center">
                No Thanks — Don't Use AI Features
              </DroplettText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DataFlowCard({ number, label, dataShared, sentTo, purpose, policyUrl }: {
  number: string;
  label: string;
  dataShared: string;
  sentTo: string;
  purpose: string;
  policyUrl: string;
}) {
  return (
    <View style={styles.dataFlowCard}>
      <View style={styles.dataFlowHeader}>
        <View style={styles.numberBadge}>
          <DroplettText variant="caption" color={DROPLETT_THEME.bg.primary} style={{ fontWeight: '700', fontSize: 11 }}>
            {number}
          </DroplettText>
        </View>
        <DroplettText variant="bodySmall" color={DROPLETT_THEME.gold.warm} style={{ fontWeight: '600' }}>
          {label}
        </DroplettText>
      </View>
      <DataRow label="Data shared" value={dataShared} />
      <DataRow label="Sent to" value={sentTo} />
      <DataRow label="Purpose" value={purpose} />
      <Pressable onPress={() => Linking.openURL(policyUrl)}>
        <DroplettText variant="caption" color={DROPLETT_THEME.gold.warm} style={{ marginTop: 4, fontSize: 11 }}>
          View provider privacy policy
        </DroplettText>
      </Pressable>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <DroplettText variant="caption" color={DROPLETT_THEME.text.tertiary} style={styles.dataLabel}>
        {label}:
      </DroplettText>
      <DroplettText variant="caption" color={DROPLETT_THEME.text.secondary} style={{ flex: 1, lineHeight: 16 }}>
        {value}
      </DroplettText>
    </View>
  );
}

/**
 * Hook to gate an action behind AI consent.
 * Returns [ensureConsent, modalElement].
 * Call ensureConsent() before any AI action — it resolves true if consent is given.
 */
export function useAIConsent(): {
  ensureConsent: () => Promise<boolean>;
  consentModal: React.ReactNode;
} {
  const [showModal, setShowModal] = useState(false);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const ensureConsent = React.useCallback(async () => {
    const consented = await hasAIConsent();
    if (consented) return true;

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setShowModal(true);
    });
  }, []);

  const consentModal = (
    <AIConsentModal
      visible={showModal}
      onAccept={() => {
        setShowModal(false);
        resolveRef.current?.(true);
        resolveRef.current = null;
      }}
      onCancel={() => {
        setShowModal(false);
        resolveRef.current?.(false);
        resolveRef.current = null;
      }}
    />
  );

  return { ensureConsent, consentModal };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: DROPLETT_THEME.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: DROPLETT_THEME.bg.secondary,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: DROPLETT_THEME.border,
    padding: SPACING.lg,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    marginBottom: SPACING.md,
  },
  intro: {
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  dataFlowCard: {
    backgroundColor: DROPLETT_THEME.bg.tertiary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: DROPLETT_THEME.border,
  },
  dataFlowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DROPLETT_THEME.gold.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  dataLabel: {
    width: 80,
    fontWeight: '600',
    fontSize: 11,
  },
  securityBox: {
    backgroundColor: DROPLETT_THEME.bg.tertiary,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: DROPLETT_THEME.gold.warm,
  },
  learnMore: {
    marginBottom: SPACING.lg,
    alignSelf: 'center',
    paddingVertical: SPACING.xs,
  },
  buttons: {
    gap: SPACING.sm,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
  },
});
