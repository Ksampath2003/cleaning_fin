// Pill-style segmented control used for status pickers and list filters.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.active]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: theme.border,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: theme.card,
    ...theme.shadow,
    shadowOpacity: 0.08,
  },
  label: { ...theme.font.label, color: theme.muted },
  labelActive: { color: theme.primary, fontWeight: '600' },
});
