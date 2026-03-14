import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Animated, ViewStyle } from 'react-native';
import { DROPLETT_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { DroplettText } from './DroplettText';

interface DroplettButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'ghost';
    fullWidth?: boolean;
    style?: import('react-native').StyleProp<ViewStyle>;
}

export const DroplettButton = React.memo(function DroplettButton({
    children,
    onPress,
    variant = 'primary',
    fullWidth = false,
    style
}: DroplettButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
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

    const isPrimary = variant === 'primary';

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.base,
                    isPrimary ? styles.primary : styles.ghost,
                    fullWidth && { width: '100%' },
                    style,
                ]}
            >
                <DroplettText
                    variant="button"
                    color={isPrimary ? DROPLETT_THEME.text.inverse : DROPLETT_THEME.gold.warm}
                    align="center"
                >
                    {children}
                </DroplettText>
            </Pressable>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    base: {
        height: 48,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    primary: {
        backgroundColor: DROPLETT_THEME.gold.warm,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: DROPLETT_THEME.gold.muted,
    },
});
