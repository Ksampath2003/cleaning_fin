// Client detail — contact, notes, upcoming + past jobs, outstanding balance.

import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';
import { theme, statusColor } from '../theme';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import ConfirmDialog from '../components/ConfirmDialog';
import PrimaryButton from '../components/PrimaryButton';

export default function ClientDetailScreen({ navigation, route }) {
  const { clientId } = route.params;
  const { clients, jobs, payments, deleteClient } = useStore();
  const client = clients.find((c) => c.id === clientId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { upcoming, past, outstanding } = useMemo(() => {
    const now = Date.now();
    const clientJobs = jobs.filter((j) => j.clientId === clientId);
    const upcomingJobs = clientJobs
      .filter((j) => j.startAt >= now && j.status !== 'cancelled')
      .sort((a, b) => a.startAt - b.startAt);
    const pastJobs = clientJobs
      .filter((j) => j.startAt < now || j.status === 'completed')
      .sort((a, b) => b.startAt - a.startAt)
      .slice(0, 10);
    const unpaid = payments.filter(
      (p) => p.clientId === clientId && p.paidAt == null,
    );
    const total = unpaid.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { upcoming: upcomingJobs, past: pastJobs, outstanding: total };
  }, [jobs, payments, clientId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        client && !client.deleted ? (
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              onPress={() => navigation.navigate('ClientForm', { clientId })}
              hitSlop={10}
              style={{ marginRight: theme.space(3) }}
            >
              <Text style={{ color: theme.primary, fontWeight: '600' }}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => setConfirmOpen(true)} hitSlop={10}>
              <Text style={{ color: theme.danger, fontWeight: '600' }}>Delete</Text>
            </Pressable>
          </View>
        ) : null,
    });
  }, [navigation, client, clientId]);

  if (!client) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This client is no longer available.</Text>
      </View>
    );
  }

  const onConfirmDelete = async () => {
    setConfirmOpen(false);
    await deleteClient(clientId);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.name}>{client.name}</Text>
        {client.deleted ? (
          <Text style={styles.deletedLabel}>Deleted — history preserved</Text>
        ) : null}

        <View style={styles.card}>
          {client.phone ? (
            <Pressable
              onPress={() => Linking.openURL(`tel:${client.phone}`)}
              style={styles.row}
            >
              <Ionicons name="call-outline" size={18} color={theme.muted} />
              <Text style={styles.rowText}>{client.phone}</Text>
            </Pressable>
          ) : null}
          {client.email ? (
            <Pressable
              onPress={() => Linking.openURL(`mailto:${client.email}`)}
              style={styles.row}
            >
              <Ionicons name="mail-outline" size={18} color={theme.muted} />
              <Text style={styles.rowText}>{client.email}</Text>
            </Pressable>
          ) : null}
          {client.address ? (
            <View style={styles.row}>
              <Ionicons name="location-outline" size={18} color={theme.muted} />
              <Text style={styles.rowText}>{client.address}</Text>
            </View>
          ) : null}
        </View>

        {client.notes ? (
          <>
            <Text style={styles.section}>Notes</Text>
            <View style={styles.card}>
              <Text style={styles.body}>{client.notes}</Text>
            </View>
          </>
        ) : null}

        <Pressable
          style={[styles.card, styles.balanceCard]}
          onPress={() =>
            navigation
              .getParent()
              ?.navigate('PaymentsTab', {
                screen: 'Payments',
                params: { initialFilter: 'unpaid' },
              })
          }
        >
          <View>
            <Text style={styles.sectionInline}>Outstanding balance</Text>
            <Text style={styles.balance}>{formatCurrency(outstanding)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.muted} />
        </Pressable>

        <Text style={styles.section}>Upcoming jobs</Text>
        {upcoming.length === 0 ? (
          <Text style={styles.muted}>No upcoming jobs.</Text>
        ) : (
          upcoming.map((j) => (
            <JobLine
              key={j.id}
              job={j}
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate('ScheduleTab', {
                    screen: 'JobDetail',
                    params: { jobId: j.id },
                  })
              }
            />
          ))
        )}

        <Text style={styles.section}>Past jobs</Text>
        {past.length === 0 ? (
          <Text style={styles.muted}>No past jobs yet.</Text>
        ) : (
          past.map((j) => (
            <JobLine
              key={j.id}
              job={j}
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate('ScheduleTab', {
                    screen: 'JobDetail',
                    params: { jobId: j.id },
                  })
              }
            />
          ))
        )}

        {!client.deleted ? (
          <View style={styles.actions}>
            <PrimaryButton
              label="Add Job for this Client"
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate('ScheduleTab', {
                    screen: 'JobForm',
                    params: { clientId },
                  })
              }
            />
          </View>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title={`Delete ${client.name}?`}
        message="Their job and payment history will remain but will show 'Deleted client'."
        confirmLabel="Delete"
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}

function JobLine({ job, onPress }) {
  const color = statusColor(job.status, job.startAt);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.jobLine, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.jobDate}>{formatDate(job.startAt)}</Text>
        <Text style={styles.jobTime}>{formatTime(job.startAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: theme.space(4), paddingBottom: theme.space(12) },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { ...theme.font.body, color: theme.muted },
  name: { ...theme.font.h1, color: theme.text },
  deletedLabel: { color: theme.danger, marginTop: 4 },
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: theme.space(4),
    marginTop: theme.space(3),
    ...theme.shadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.space(2),
  },
  rowText: { ...theme.font.body, color: theme.text, marginLeft: theme.space(2), flex: 1 },
  section: {
    ...theme.font.label,
    color: theme.muted,
    marginTop: theme.space(5),
    marginBottom: theme.space(2),
  },
  sectionInline: { ...theme.font.label, color: theme.muted },
  muted: { ...theme.font.body, color: theme.muted },
  body: { ...theme.font.body, color: theme.text },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balance: { ...theme.font.h2, color: theme.text, marginTop: 2 },
  jobLine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: theme.space(3),
    marginBottom: theme.space(2),
    ...theme.shadow,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: theme.space(3) },
  jobDate: { ...theme.font.body, color: theme.text, fontWeight: '600' },
  jobTime: { ...theme.font.label, color: theme.muted, marginTop: 2 },
  actions: { marginTop: theme.space(5) },
});
