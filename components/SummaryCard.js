// Small tappable summary card used on the Dashboard metrics row.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export default function SummaryCard({ label, value, accent, alert, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, accent && { color: accent }]}>{value}</Text>
        {alert ? <View style={styles.dot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    paddingVertical: theme.space(4),
    paddingHorizontal: theme.space(4),
    marginHorizontal: theme.space(1),
    ...theme.shadow,
  },
  label: { ...theme.font.label, color: theme.muted, marginBottom: theme.space(2) },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  value: { ...theme.font.h1, color: theme.text },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.danger,
    marginLeft: theme.space(2),
  },
});
