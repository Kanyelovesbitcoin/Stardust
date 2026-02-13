import React from 'react';
import { StyleSheet, ViewStyle, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STARDUST_THEME } from '../../lib/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  background?: boolean;
}

export default function ScreenContainer({
  children,
  style,
  edges = ['top', 'left', 'right'],
  background = true,
}: ScreenContainerProps) {

  if (background) {
    return (
      <ImageBackground
        source={require('../../assets/app-background-stars.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={[styles.containerTransparent, style]} edges={edges}>
          {children}
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: STARDUST_THEME.bg.primary, // Fallback
  },
  container: {
    flex: 1,
    backgroundColor: STARDUST_THEME.bg.primary,
  },
  containerTransparent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
