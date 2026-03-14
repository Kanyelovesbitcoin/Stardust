import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hasAIConsent } from '../../lib/aiConsent';
import { AIConsentModal } from '../../components/ui/AIConsentModal';

const GlassTabBar = React.memo(function GlassTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingWrapper, { bottom: Math.max(insets.bottom, 12) }]}>
      <BlurView intensity={65} tint="light" style={styles.blurPill}>
        <View style={styles.pillInner}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const isFocused = state.index === index;

            const iconName = route.name === 'index'
              ? (isFocused ? 'book' : 'book-outline')
              : (isFocused ? 'images' : 'images-outline');

            const onPress = () => {
              if (!isFocused) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                style={[styles.tab, isFocused && styles.tabActive]}
                onPress={onPress}
              >
                <Ionicons
                  name={iconName as any}
                  size={20}
                  color={isFocused ? '#1A1A1A' : '#8B7355'}
                  style={{ marginBottom: 2 }}
                />
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                  {label}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
});

export default function TabsLayout() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    hasAIConsent().then((consented) => {
      if (!consented) setShowConsent(true);
    });
  }, []);

  return (
    <>
      <Tabs
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{ headerShown: false, freezeOnBlur: true, lazy: true }}
      >
        <Tabs.Screen name="index" options={{ title: 'Journal' }} />
        <Tabs.Screen name="gallery" options={{ title: 'Gallery' }} />
      </Tabs>
      <AIConsentModal
        visible={showConsent}
        onAccept={() => setShowConsent(false)}
        onCancel={() => setShowConsent(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 1000,
    alignItems: 'center',
  },
  blurPill: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? 'rgba(245, 240, 230, 0.92)' : 'rgba(245, 240, 230, 0.65)',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: 'rgba(196, 162, 101, 0.12)',
  },
  tabLabel: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  activeIndicator: {
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#C4A265',
    marginTop: 4,
  },
});
