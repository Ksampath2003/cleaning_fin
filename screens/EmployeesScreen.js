// Manage employees: add, rename, toggle active/inactive.

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import EmployeeChip from '../components/EmployeeChip';

export default function EmployeesScreen() {
  const { employees, addEmployee, updateEmployee } = useStore();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const onAdd = async () => {
    if (!newName.trim()) return;
    await addEmployee(newName);
    setNewName('');
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditingName(e.name);
  };

  const saveEdit = async () => {
    if (!editingName.trim())
      return Alert.alert('Name required', 'Enter a name or cancel.');
    await updateEmployee(editingId, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
  };

  const toggleActive = (e) => updateEmployee(e.id, { active: !e.active });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.addRow}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Add new employee"
          placeholderTextColor={theme.muted}
          style={styles.input}
        />
        <View style={{ width: theme.space(2) }} />
        <PrimaryButton label="Add" onPress={onAdd} style={{ minWidth: 80 }} />
      </View>

      <FlatList
        data={employees}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: theme.space(4), paddingBottom: theme.space(12) }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <EmployeeChip employee={item} size={36} />
            {editingId === item.id ? (
              <TextInput
                value={editingName}
                onChangeText={setEditingName}
                style={styles.editInput}
                autoFocus
                onSubmitEditing={saveEdit}
              />
            ) : (
              <Text
                style={[
                  styles.name,
                  !item.active && { color: theme.muted, textDecorationLine: 'line-through' },
                ]}
              >
                {item.name}
              </Text>
            )}
            <View style={{ flex: 1 }} />
            {editingId === item.id ? (
              <Pressable onPress={saveEdit} hitSlop={10} style={styles.iconBtn}>
                <Ionicons name="checkmark" size={20} color={theme.primary} />
              </Pressable>
            ) : (
              <Pressable onPress={() => startEdit(item)} hitSlop={10} style={styles.iconBtn}>
                <Ionicons name="pencil" size={18} color={theme.muted} />
              </Pressable>
            )}
            <Pressable
              onPress={() => toggleActive(item)}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <Ionicons
                name={item.active ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={item.active ? theme.primary : theme.muted}
              />
            </Pressable>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(4),
    paddingBottom: theme.space(2),
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    paddingHorizontal: theme.space(3),
    ...theme.font.body,
    color: theme.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: theme.space(3),
    marginBottom: theme.space(2),
    ...theme.shadow,
  },
  name: {
    ...theme.font.body,
    color: theme.text,
    marginLeft: theme.space(3),
  },
  editInput: {
    ...theme.font.body,
    marginLeft: theme.space(3),
    color: theme.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.primary,
    paddingVertical: 2,
    minWidth: 140,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
