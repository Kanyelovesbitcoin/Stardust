import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { STARDUST_THEME } from '../../lib/theme';
import { SPACING, RADIUS } from '../../lib/layout';
import { StardustText } from '../ui/StardustText';

interface PlanCardProps {
  planName: string;
  price: string;
  perUnit: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
}

export function PlanCard({ planName, price, perUnit, badge, selected, onSelect }: PlanCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
    >
      {badge && (
        <View style={styles.badge}>
          <StardustText variant="label" color={STARDUST_THEME.text.inverse} style={{ fontSize: 10, letterSpacing: 1.5 }}>
            {badge}
          </StardustText>
        </View>
      )}

      <View style={styles.radioRow}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <StardustText variant="cardTitle" color={selected ? STARDUST_THEME.gold.pale : STARDUST_THEME.text.secondary} style={{ fontSize: 20 }}>
          {planName}
        </StardustText>
      </View>

      <View style={styles.priceRow}>
        <StardustText variant="screenTitle" color={selected ? STARDUST_THEME.gold.bright : STARDUST_THEME.text.primary} style={{ fontSize: 26 }}>
          {price}
        </StardustText>
        <StardustText variant="bodySmall" color={STARDUST_THEME.text.secondary} style={{ opacity: 0.8 }}>
          {perUnit}
        </StardustText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: STARDUST_THEME.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardSelected: {
    borderColor: STARDUST_THEME.gold.warm,
    backgroundColor: 'rgba(196, 162, 101, 0.06)',
    shadowColor: 'rgba(196, 162, 101, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: STARDUST_THEME.gold.warm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: STARDUST_THEME.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: STARDUST_THEME.gold.warm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: STARDUST_THEME.gold.warm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
    marginLeft: 36,
  },
});
