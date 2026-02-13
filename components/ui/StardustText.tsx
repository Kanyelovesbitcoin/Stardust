import React, { ReactNode } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { STARDUST_THEME } from '../../lib/theme';
import { TYPE_SCALE } from '../../lib/typography';

interface StardustTextProps extends TextProps {
    children: ReactNode;
    variant?: keyof typeof TYPE_SCALE;
    color?: string;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function StardustText({
    children,
    variant = 'body',
    color = STARDUST_THEME.text.primary,
    align = 'left',
    style,
    ...props
}: StardustTextProps) {
    return (
        <Text
            style={[
                styles.base,
                TYPE_SCALE[variant],
                { color, textAlign: align },
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    base: {
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
});
