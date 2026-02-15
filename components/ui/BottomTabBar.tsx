import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STARDUST_THEME } from '../../lib/theme';

interface BottomTabBarProps {
  activeTab: 'journal' | 'gallery';
}

export default React.memo(function BottomTabBar({ activeTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const navigateJournal = useCallback(() => {
    if (activeTab !== 'journal') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.navigate('/');
    }
  }, [activeTab]);

  const navigateGallery = useCallback(() => {
    if (activeTab !== 'gallery') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.navigate('/gallery');
    }
  }, [activeTab]);

  return (
    <View style={[styles.wrapper, { height: TAB_BAR_HEIGHT + insets.bottom, backgroundColor: '#1A1635' }]}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Pressable style={styles.tab} onPress={navigateJournal}>
          <Ionicons
            name={activeTab === 'journal' ? 'book' : 'book-outline'}
            size={28}
            color={activeTab === 'journal' ? STARDUST_THEME.gold.bright : 'rgba(255,255,255,0.4)'}
          />
          <Text style={[styles.tabLabel, activeTab === 'journal' && styles.tabLabelActive]}>
            Journal
          </Text>
        </Pressable>

        <Pressable style={styles.tab} onPress={navigateGallery}>
          <Ionicons
            name={activeTab === 'gallery' ? 'prism' : 'prism-outline'}
            size={28}
            color={activeTab === 'gallery' ? STARDUST_THEME.gold.bright : 'rgba(255,255,255,0.4)'}
          />
          <Text style={[styles.tabLabel, activeTab === 'gallery' && styles.tabLabelActive]}>
            Gallery
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_BAR_HEIGHT,
  },
  tabLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: STARDUST_THEME.gold.bright,
    fontWeight: '700',
  },
});
