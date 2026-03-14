import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DROPLETT_THEME } from '../../lib/theme';
import { SPACING } from '../../lib/layout';

export function GoldDivider() {
    return (
        <LinearGradient
            colors={['transparent', DROPLETT_THEME.gold.muted, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.divider}
        />
    );
}

const styles = StyleSheet.create({
    divider: {
        height: 1,
        width: '100%',
        marginVertical: SPACING.md,
        // Horizontal margin is handled by parent container padding usually, but prompt says: "Horizontal margin: screenPadding."
        // If I put marginHorizontal here, it will shrink the divider width inside the container. 
        // Given "Horizontal margin: screenPadding", I should probably set width to valid value or use margin.
        // If width is 100%, marginHorizontal will push it out or clip it.
        // Actually, "Horizontal margin: screenPadding" likely means it should respect the screen padding. 
        // If I put it in a container with padding, it does that automatically.
        // If the prompt implies explicit margin on the divider itself:
        marginHorizontal: SPACING.screenPadding,
    },
});
