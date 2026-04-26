// Add or edit a client. Modal inside the Clients stack.

import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useStore } from '../context/StoreContext';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function ClientFormScreen({ navigation, route }) {
  const existingClientId = route.params?.clientId || null;
  const { clients, addClient, updateClient } = useStore();
  const existing = existingClientId
    ? clients.find((c) => c.id === existingClientId)
    : null;

  const [name, setName] = useState(existing?.name || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [address, setAddress] = useState(existing?.address || '');
  const [notes, setNotes] = useState(existing?.notes || '');

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit Client' : 'New Client' });
  }, [navigation, existing]);

  const onSave = async () => {
    if (!name.trim()) return Alert.alert('Name required', 'Enter a client name.');
    if (!address.trim())
      return Alert.alert('Address required', 'Enter an address so the crew knows where to go.');

    if (existing) {
      await updateClient(existing.id, { name: name.trim(), phone, email, address: address.trim(), notes });
    } else {
      await addClient({ name, phone, email, address, notes });
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Laura Chen"
          placeholderTextColor={theme.muted}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholder="(555) 123-4567"
          placeholderTextColor={theme.muted}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="laura@example.com"
          placeholderTextColor={theme.muted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={styles.textarea}
          multiline
          placeholder="Street, city, unit number"
          placeholderTextColor={theme.muted}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={styles.textarea}
          multiline
          placeholder="Pets, preferred products, entry instructions"
          placeholderTextColor={theme.muted}
        />

        <View style={styles.actions}>
          <PrimaryButton
            label="Cancel"
            kind="secondary"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          />
          <View style={{ width: theme.space(3) }} />
          <PrimaryButton
            label={existing ? 'Save Changes' : 'Add Client'}
            onPress={onSave}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: theme.space(4), paddingBottom: theme.space(12) },
  label: {
    ...theme.font.label,
    color: theme.muted,
    marginTop: theme.space(3),
    marginBottom: theme.space(2),
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    paddingHorizontal: theme.space(3),
    ...theme.font.body,
    color: theme.text,
  },
  textarea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    padding: theme.space(3),
    ...theme.font.body,
    color: theme.text,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', marginTop: theme.space(5) },
});
