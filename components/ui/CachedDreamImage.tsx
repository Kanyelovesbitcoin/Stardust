import React, { useRef } from 'react';
import { View, Animated, ImageStyle, ViewStyle } from 'react-native';
import { DROPLET } from '../../lib/design-tokens';

interface Props {
  uri: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  fallbackColor?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  borderRadius?: number;
}

export const CachedDreamImage = React.memo(function CachedDreamImage({
  uri,
  style,
  containerStyle,
  fallbackColor = DROPLET.parchmentDark,
  resizeMode = 'cover',
  borderRadius = 12,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  const handleLoad = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={[
        { backgroundColor: fallbackColor, borderRadius, overflow: 'hidden' },
        containerStyle,
      ]}
    >
      <Animated.Image
        source={{ uri }}
        style={[style, { opacity, borderRadius }]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
      />
    </View>
  );
});
