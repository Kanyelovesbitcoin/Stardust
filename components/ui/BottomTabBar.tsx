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
    <View style={[styles.wrapper, { height: TAB_BAR_HEIGHT + insets.bottom }]}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Pressable style={styles.tab} onPress={navigateJournal}>
          <View style={[styles.iconCircle, activeTab === 'journal' && styles.iconCircleActive]}>
            <Ionicons
              name={activeTab === 'journal' ? 'book' : 'book-outline'}
              size={24}
              color={activeTab === 'journal' ? '#F5F0E6' : '#8B7355'}
            />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'journal' && styles.tabLabelActive]}>
            Journal
          </Text>
        </Pressable>

        <Pressable style={styles.tab} onPress={navigateGallery}>
          <View style={[styles.iconCircle, activeTab === 'gallery' && styles.iconCircleActive]}>
            <Ionicons
              name={activeTab === 'gallery' ? 'image' : 'image-outline'}
              size={24}
              color={activeTab === 'gallery' ? '#F5F0E6' : '#8B7355'}
            />
          </View>
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
    backgroundColor: 'rgba(245, 240, 230, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 115, 85, 0.15)',
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: '#C4A265',
  },
  tabLabel: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
});
