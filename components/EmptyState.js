// Shared empty-state block used by every list view.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function EmptyState({ icon = 'sparkles-outline', title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={40} color={theme.muted} />
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: theme.space(10),
    paddingHorizontal: theme.space(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...theme.font.h3, color: theme.text, marginTop: theme.space(3) },
  subtitle: {
    ...theme.font.body,
    color: theme.muted,
    marginTop: theme.space(2),
    textAlign: 'center',
  },
});
