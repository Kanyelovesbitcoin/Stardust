import React, { ReactNode } from 'react';
import { View, Pressable, ViewStyle, StyleSheet, Animated } from 'react-native';
import { STARDUST_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';

interface StardustCardProps {
    children: ReactNode;
    onPress?: () => void;
    style?: import('react-native').StyleProp<ViewStyle>;
}

export function StardustCard({ children, onPress, style }: StardustCardProps) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = React.useState(false);

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.98,
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

    const Container = onPress ? Pressable : View;
    // If not onPress, Container is View so props like onPress/onPressIn are invalid. 
    // However, View doesn't accept onPress anyway, so TypeScript might complain if we pass onPress to View.
    // Better to conditionally render or use 'as any' carefully, or just spread props correctly.

    if (onPress) {
        return (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        styles.card,
                        isPressed && styles.pressed,
                        style,
                    ]}
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
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: STARDUST_THEME.bg.secondary,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: STARDUST_THEME.border,
        padding: SPACING.md,
        // Shadow
        shadowColor: STARDUST_THEME.gold.muted, // Using muted gold for better shadow visibility on native if rgba fails
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    pressed: {
        borderColor: STARDUST_THEME.borderActive,
    },
});
