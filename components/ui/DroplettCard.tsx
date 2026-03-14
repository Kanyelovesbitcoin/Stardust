import React, { useCallback, useRef } from 'react';
import { View, Pressable, ViewStyle, StyleSheet, Animated } from 'react-native';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';

interface DroplettCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: import('react-native').StyleProp<ViewStyle>;
}

export const DroplettCard = React.memo(function DroplettCard({ children, onPress, style }: DroplettCardProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    }, [scaleAnim]);

    if (onPress) {
        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[styles.card, style]}
                >
                    {children}
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: DROPLETT_THEME.bg.secondary,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: DROPLETT_THEME.border,
        padding: SPACING.md,
        elevation: 2,
    },
});
