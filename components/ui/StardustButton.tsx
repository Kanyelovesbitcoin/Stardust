import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Animated, ViewStyle } from 'react-native';
import { STARDUST_THEME } from '../../lib/theme';
import { RADIUS, SPACING } from '../../lib/layout';
import { StardustText } from './StardustText';

interface StardustButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'ghost';
    fullWidth?: boolean;
    style?: import('react-native').StyleProp<ViewStyle>;
}

export const StardustButton = React.memo(function StardustButton({
    children,
    onPress,
    variant = 'primary',
    fullWidth = false,
    style
}: StardustButtonProps) {
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
        backgroundColor: STARDUST_THEME.gold.warm,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: STARDUST_THEME.gold.muted,
    },
});
