// Modal confirmation dialog for every destructive action.

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import PrimaryButton from './PrimaryButton';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.row}>
            <PrimaryButton
              label={cancelLabel}
              kind="secondary"
              onPress={onCancel}
              style={styles.btn}
            />
            <View style={{ width: theme.space(3) }} />
            <PrimaryButton
              label={confirmLabel}
              kind={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={styles.btn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space(6),
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: theme.space(5),
    width: '100%',
    maxWidth: 420,
    ...theme.shadow,
  },
  title: { ...theme.font.h2, color: theme.text, marginBottom: theme.space(2) },
  message: { ...theme.font.body, color: theme.muted, marginBottom: theme.space(4) },
  row: { flexDirection: 'row' },
  btn: { flex: 1 },
});
