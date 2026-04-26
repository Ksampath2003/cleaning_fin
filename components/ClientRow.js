// Client row — used in the searchable Clients list.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function ClientRow({ client, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(client.name || '?').slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {client.name}
        </Text>
        {client.address ? (
          <Text style={styles.meta} numberOfLines={1}>
            {client.address}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    marginHorizontal: theme.space(4),
    marginBottom: theme.space(2),
    padding: theme.space(3),
    borderRadius: theme.radius,
    ...theme.shadow,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.space(3),
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  name: { ...theme.font.h3, color: theme.text },
  meta: { ...theme.font.label, color: theme.muted, marginTop: 2 },
});
