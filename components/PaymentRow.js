// Row shown on the Payments list. Wraps the content in a swipeable surface that reveals actions.

import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { PanResponder } from 'react-native';
import { theme } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';

// Internal: returns a badge color + label for a payment.
const badgeFor = (payment, todayMs) => {
  if (payment.paidAt != null) return { label: 'Paid', color: theme.success };
  if (payment.dueDate < todayMs) return { label: 'Overdue', color: theme.danger };
  return { label: 'Unpaid', color: theme.accent };
};

export default function PaymentRow({
  payment,
  clientName,
  todayMs,
  onPress,
  onToggle,
  onDelete,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const revealWidth = 180;
  const badge = badgeFor(payment, todayMs);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const next = Math.min(0, Math.max(-revealWidth, g.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const open = g.dx < -revealWidth / 2;
        Animated.spring(translateX, {
          toValue: open ? -revealWidth : 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const close = () =>
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();

  return (
    <View style={styles.wrap}>
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            close();
            onToggle?.();
          }}
          style={[styles.action, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.actionText}>
            {payment.paidAt != null ? 'Mark Unpaid' : 'Mark Paid'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            close();
            onDelete?.();
          }}
          style={[styles.action, { backgroundColor: theme.danger }]}
        >
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.rowInner, pressed && { opacity: 0.92 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.client} numberOfLines={1}>
              {clientName || 'Deleted client'}
            </Text>
            <Text style={styles.meta}>Due {formatDate(payment.dueDate)}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
            <View style={[styles.badge, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: theme.space(4),
    marginBottom: theme.space(3),
    borderRadius: theme.radius,
    overflow: 'hidden',
    backgroundColor: theme.card,
    ...theme.shadow,
  },
  actions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
  },
  action: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space(2),
  },
  actionText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  row: { backgroundColor: theme.card },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.space(4),
    minHeight: 64,
  },
  client: { ...theme.font.h3, color: theme.text },
  meta: { ...theme.font.label, color: theme.muted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { ...theme.font.h3, color: theme.text },
  badge: {
    marginTop: 4,
    paddingHorizontal: theme.space(2),
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
