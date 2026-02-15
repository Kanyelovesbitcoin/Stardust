import React, { useRef, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export default React.memo(function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Ionicons name="add" size={30} color={COLORS.background} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 28,
    right: 24,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
