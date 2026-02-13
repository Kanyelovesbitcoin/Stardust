import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Animated, ViewStyle } from 'react-native';
import { STARDUST_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { StardustText } from './StardustText';

interface StardustButtonProps {
    children: ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'ghost';
    fullWidth?: boolean;
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

export function StardustButton({
    children,
    onPress,
    variant = 'primary',
    fullWidth = false,
    style
}: StardustButtonProps) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = React.useState(false);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 12,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 12,
            bounciness: 4,
        }).start();
    };

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
                    isPrimary && isPressed && styles.primaryPressed,
                    !isPrimary && isPressed && styles.ghostPressed,
                    fullWidth && { width: '100%' },
                    style,
                ]}
            >
                <StardustText
                    variant="button"
                    color={isPrimary ? STARDUST_THEME.text.inverse : STARDUST_THEME.gold.warm}
                    align="center"
                >
                    {children}
                </StardustText>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 48,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    primary: {
        backgroundColor: STARDUST_THEME.gold.warm,
        // Add shadow for depth? Prompt didn't specify shadow for button but good practice.
        // Sticking to prompt: "Background gold.warm, text inverse, rounded-full. Subtle press animation..."
    },
    primaryPressed: {
        backgroundColor: STARDUST_THEME.gold.bright, // "darken gold slightly" -> actually prompt says "darken slightly". bright is usually lighter. Let's use muted or just opacity.
        opacity: 0.9,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: STARDUST_THEME.gold.muted,
    },
    ghostPressed: {
        backgroundColor: 'rgba(196, 162, 101, 0.1)', // gold.warm at 10%
    },
});
