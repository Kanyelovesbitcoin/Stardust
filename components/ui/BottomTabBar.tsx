import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STARDUST_THEME } from '../../lib/theme';

interface BottomTabBarProps {
  activeTab: 'journal' | 'gallery';
}

export default function BottomTabBar({ activeTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const navigateJournal = () => {
    if (activeTab !== 'journal') {
      router.navigate('/');
    }
  };

  const navigateGallery = () => {
    if (activeTab !== 'gallery') {
      router.navigate('/gallery');
    }
  };

  return (
    <View style={[styles.wrapper, { height: TAB_BAR_HEIGHT + insets.bottom, backgroundColor: '#1A1635' }]}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.7}
          onPress={navigateJournal}
        >
          <Ionicons
            name={activeTab === 'journal' ? 'book' : 'book-outline'}
            size={28}
            color={activeTab === 'journal' ? STARDUST_THEME.gold.bright : 'rgba(255,255,255,0.4)'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'journal' && styles.tabLabelActive,
            ]}
          >
            Journal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.7}
          onPress={navigateGallery}
        >
          <Ionicons
            name={activeTab === 'gallery' ? 'prism' : 'prism-outline'}
            size={28}
            color={activeTab === 'gallery' ? STARDUST_THEME.gold.bright : 'rgba(255,255,255,0.4)'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'gallery' && styles.tabLabelActive,
            ]}
          >
            Gallery
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
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
