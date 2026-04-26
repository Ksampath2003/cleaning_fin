// Searchable client list with debounced fuzzy match on name + address.

import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';
import { theme } from '../theme';
import ClientRow from '../components/ClientRow';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';

const matches = (client, q) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    (client.name || '').toLowerCase().includes(needle) ||
    (client.address || '').toLowerCase().includes(needle)
  );
};

export default function ClientsScreen({ navigation }) {
  const { clients } = useStore();
  const [rawQuery, setRawQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(rawQuery), 150);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const visible = useMemo(
    () =>
      clients
        .filter((c) => !c.deleted)
        .filter((c) => matches(c, debounced))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [clients, debounced],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={theme.muted} />
        <TextInput
          value={rawQuery}
          onChangeText={setRawQuery}
          style={styles.searchInput}
          placeholder="Search name or address"
          placeholderTextColor={theme.muted}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      <FlatList
        data={visible}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <ClientRow
            client={item}
            onPress={() =>
              navigation.navigate('ClientDetail', { clientId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={debounced ? 'No matches' : 'No clients yet'}
            subtitle={debounced ? 'Try a different search.' : 'Tap the plus button to add one.'}
          />
        }
        ListFooterComponent={
          <Pressable
            style={styles.manageLink}
            onPress={() => navigation.navigate('Employees')}
          >
            <Ionicons name="people-circle-outline" size={20} color={theme.primary} />
            <Text style={styles.manageText}>Manage Employees</Text>
          </Pressable>
        }
        contentContainerStyle={{ paddingVertical: theme.space(2), paddingBottom: theme.space(16) }}
      />
      <FloatingActionButton onPress={() => navigation.navigate('ClientForm', {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.space(4),
    marginTop: theme.space(3),
    marginBottom: theme.space(2),
    paddingHorizontal: theme.space(3),
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    paddingLeft: theme.space(2),
    ...theme.font.body,
    color: theme.text,
  },
  manageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space(4),
    marginTop: theme.space(4),
  },
  manageText: {
    color: theme.primary,
    fontWeight: '600',
    marginLeft: theme.space(2),
    ...theme.font.body,
  },
});
