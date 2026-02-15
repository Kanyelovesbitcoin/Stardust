import React, { useState } from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DROPLET } from '../../lib/design-tokens';

interface Props {
  source: ImageSourcePropType;
  fallbackColor?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  overlayColor?: string;
  overlayOpacity?: number;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ParchmentBackground({
  source,
  fallbackColor = DROPLET.parchment,
  children,
  style,
  overlayColor,
  overlayOpacity = 0,
  edges = ['top', 'left', 'right'],
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: fallbackColor }, style]}>
      <ImageBackground
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        fadeDuration={0}
      >
        {overlayColor ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: overlayColor, opacity: overlayOpacity },
            ]}
          />
        ) : null}
        <SafeAreaView style={styles.safeArea} edges={edges}>
          {children}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
