// Primary filled button, with a `kind` prop for destructive/secondary variants.

import React from 'react';
import { Pressable, StyleSheet, Text, ActivityIndicator, View } from 'react-native';
import { theme } from '../theme';

export default function PrimaryButton({
  label,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  style,
}) {
  const background =
    kind === 'danger' ? theme.danger : kind === 'secondary' ? theme.card : theme.primary;
  const textColor = kind === 'secondary' ? theme.primary : '#fff';
  const border = kind === 'secondary' ? theme.primary : 'transparent';

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: background,
          borderColor: border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: theme.radius,
    borderWidth: 1,
    paddingHorizontal: theme.space(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
  label: { ...theme.font.body, fontWeight: '600' },
});
