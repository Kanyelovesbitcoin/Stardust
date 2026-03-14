import React from 'react';
import { ScrollView, View, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ui/ScreenContainer';
import { DroplettText } from '../components/ui/DroplettText';
import { GoldDivider } from '../components/ui/GoldDivider';
import { DROPLETT_THEME } from '../lib/theme';
import { SPACING } from '../lib/layout';

const PRIVACY_URL = 'https://docs.google.com/document/d/1vXd4a2_CUOf2p_xoFQWKFoEqlnTRiKk08R6IHZhPXtE/pub';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={DROPLETT_THEME.text.primary} />
        </Pressable>
        <DroplettText variant="cardTitle">Privacy Policy</DroplettText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DroplettText variant="caption" color={DROPLETT_THEME.text.tertiary} style={styles.updated}>
          Last updated: March 2026
        </DroplettText>

        <Section title="What Data We Collect">
          <Paragraph>
            Droplett collects the following data to provide its core features:
          </Paragraph>
          <BulletList items={[
            'Audio recordings — captured when you use the voice recording feature to log a dream',
            'Dream text — the transcript of your dream, either typed or generated from your audio recording',
            'Account information — your email address and authentication credentials',
            'Usage data — feature usage counts for managing free and Pro tier limits',
          ]} />
        </Section>

        <GoldDivider style={styles.divider} />

        <Section title="How We Use Your Data">
          <Paragraph>
            Your dream data is used exclusively to power the app's AI features:
          </Paragraph>
          <BulletList items={[
            'Transcription — your audio recording is sent to Groq to convert speech to text using the Whisper model',
            'Interpretation — your dream text is sent to Google Gemini (via OpenRouter) to generate a psychological interpretation',
            'Visualization — your dream text is sent to Google Gemini (via OpenRouter) to create an image prompt, which is then sent to FLUX.2 Pro (via OpenRouter) to generate dream artwork',
          ]} />
        </Section>

        <GoldDivider style={styles.divider} />

        <Section title="Third-Party AI Services">
          <Paragraph>
            Droplett shares your personal data with the following third-party services solely to provide the features described above. No data is sent until you explicitly consent via an in-app prompt.
          </Paragraph>
          <ServiceEntry
            name="Groq, Inc. (groq.com)"
            data="Voice audio recording files"
            purpose="Speech-to-text transcription using the Whisper model"
            policy="https://groq.com/privacy-policy/"
          />
          <ServiceEntry
            name="OpenRouter, Inc. (openrouter.ai)"
            data="Dream text (typed or transcribed from audio)"
            purpose="Routes requests to Google Gemini (by Google) for dream interpretation and image prompt generation, and to FLUX.2 Pro (by Black Forest Labs) for dream artwork generation"
            policy="https://openrouter.ai/privacy"
          />
          <ServiceEntry
            name="Convex, Inc. (convex.dev)"
            data="Dreams, interpretations, and generated images"
            purpose="Cloud database that stores your dream journal data"
            policy="https://www.convex.dev/legal/privacy"
          />
          <Paragraph style={styles.note}>
            All data is transmitted securely over HTTPS. Third-party AI services process your data only to fulfill the request and do not use it to train their AI models. Your data is never sold or shared with any other parties. Each provider listed above maintains their own privacy policy, which provides the same or equal protection for your personal data.
          </Paragraph>
        </Section>

        <GoldDivider style={styles.divider} />

        <Section title="Data Retention">
          <BulletList items={[
            'Your dreams, interpretations, and images are stored in your Droplett account on Convex (our cloud database) as long as you maintain your account',
            'Third-party AI services process data transiently and do not retain it after fulfilling the request',
            'You can delete any dream at any time from the app, which removes it from our database',
          ]} />
        </Section>

        <GoldDivider style={styles.divider} />

        <Section title="Your Consent">
          <Paragraph>
            Before any personal data is sent to a third-party AI service, Droplett displays an in-app consent prompt that clearly identifies what data will be sent, which service will receive it, and why. You must explicitly agree before any data is transmitted. If you decline, no data is sent and the AI feature will not be used. You can use Droplett to manually log dreams without ever consenting to AI processing.
          </Paragraph>
        </Section>

        <GoldDivider style={styles.divider} />

        <Section title="Contact">
          <Paragraph>
            If you have questions about this privacy policy or how your data is handled, contact us at support@droplett.app.
          </Paragraph>
        </Section>

        <Pressable
          onPress={() => Linking.openURL(PRIVACY_URL)}
          style={styles.externalLink}
        >
          <DroplettText variant="bodySmall" color={DROPLETT_THEME.gold.warm}>
            View full legal privacy policy
          </DroplettText>
          <Ionicons name="open-outline" size={14} color={DROPLETT_THEME.gold.warm} style={{ marginLeft: 6 }} />
        </Pressable>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <DroplettText variant="body" color={DROPLETT_THEME.gold.warm} style={styles.sectionTitle}>
        {title}
      </DroplettText>
      {children}
    </View>
  );
}

function Paragraph({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <DroplettText variant="bodySmall" color={DROPLETT_THEME.text.secondary} style={[styles.paragraph, style]}>
      {children}
    </DroplettText>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletItem}>
          <View style={styles.bullet} />
          <DroplettText variant="caption" color={DROPLETT_THEME.text.secondary} style={{ flex: 1, lineHeight: 18 }}>
            {item}
          </DroplettText>
        </View>
      ))}
    </View>
  );
}

function ServiceEntry({ name, data, purpose, policy }: { name: string; data: string; purpose: string; policy: string }) {
  return (
    <View style={styles.serviceEntry}>
      <DroplettText variant="bodySmall" color={DROPLETT_THEME.text.primary}>
        {name}
      </DroplettText>
      <DroplettText variant="caption" color={DROPLETT_THEME.text.tertiary}>
        Data shared: {data}
      </DroplettText>
      <DroplettText variant="caption" color={DROPLETT_THEME.text.tertiary}>
        Purpose: {purpose}
      </DroplettText>
      <Pressable onPress={() => Linking.openURL(policy)}>
        <DroplettText variant="caption" color={DROPLETT_THEME.gold.warm} style={{ marginTop: 4 }}>
          View provider privacy policy
        </DroplettText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  updated: {
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  paragraph: {
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  note: {
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  bulletList: {
    marginBottom: SPACING.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: DROPLETT_THEME.gold.muted,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  serviceEntry: {
    backgroundColor: DROPLETT_THEME.bg.tertiary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: 2,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
});
