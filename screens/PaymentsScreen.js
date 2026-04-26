// Payments list with filter segmented control and swipe-to-act rows.

import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startOfDay } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { theme } from '../theme';
import SegmentedControl from '../components/SegmentedControl';
import PaymentRow from '../components/PaymentRow';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import ConfirmDialog from '../components/ConfirmDialog';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

export default function PaymentsScreen({ navigation, route }) {
  const { payments, clients, updatePayment, deletePayment } = useStore();
  const [filter, setFilter] = useState(route.params?.initialFilter || 'all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const todayMs = startOfDay(new Date()).getTime();

  const filtered = useMemo(() => {
    const base = [...payments].sort((a, b) => b.dueDate - a.dueDate);
    if (filter === 'paid') return base.filter((p) => p.paidAt != null);
    if (filter === 'unpaid') return base.filter((p) => p.paidAt == null);
    if (filter === 'overdue')
      return base.filter((p) => p.paidAt == null && p.dueDate < todayMs);
    return base;
  }, [payments, filter, todayMs]);

  const clientName = (id) => clients.find((c) => c.id === id)?.name || 'Deleted client';

  const onToggle = (payment) => {
    updatePayment(payment.id, {
      paidAt: payment.paidAt == null ? Date.now() : null,
    });
  };

  const onConfirmDelete = () => {
    if (pendingDelete) {
      deletePayment(pendingDelete);
      setPendingDelete(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.filter}>
        <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="card-outline"
            title="No payments here"
            subtitle="Tap the plus button to add one."
          />
        }
        renderItem={({ item }) => (
          <PaymentRow
            payment={item}
            clientName={clientName(item.clientId)}
            todayMs={todayMs}
            onPress={() => {}}
            onToggle={() => onToggle(item)}
            onDelete={() => setPendingDelete(item.id)}
          />
        )}
      />
      <FloatingActionButton
        onPress={() => navigation.navigate('PaymentForm', {})}
      />
      <ConfirmDialog
        visible={pendingDelete != null}
        title="Delete this payment?"
        message="This can't be undone."
        confirmLabel="Delete"
        onConfirm={onConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  filter: {
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(3),
    paddingBottom: theme.space(2),
  },
  list: { paddingTop: theme.space(2), paddingBottom: theme.space(16) },
});
