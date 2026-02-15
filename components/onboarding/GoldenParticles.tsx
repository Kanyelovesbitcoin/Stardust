import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { STARDUST_THEME } from '../../lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 10;

interface Particle {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: 2 + Math.random() * 3,
    duration: 3000 + Math.random() * 4000,
    delay: Math.random() * 2000,
    opacity: 0.15 + Math.random() * 0.25,
  }));
}

const ParticleDot = memo(function ParticleDot({ particle }: { particle: Particle }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20 - Math.random() * 30,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: particle.duration,
          useNativeDriver: true,
        }),
      ])
    );

    const fadeIn = Animated.timing(fadeAnim, {
      toValue: particle.opacity,
      duration: 1000,
      delay: particle.delay,
      useNativeDriver: true,
    });

    fadeIn.start(() => floatLoop.start());

    return () => {
      floatLoop.stop();
      fadeIn.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          opacity: fadeAnim,
          transform: [{ translateY: floatAnim }],
          backgroundColor: STARDUST_THEME.gold.warm,
        },
      ]}
    />
  );
});

export function GoldenParticles() {
  const particles = useRef(createParticles()).current;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <ParticleDot key={i} particle={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
});
