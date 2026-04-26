// Job detail view with Edit and Delete. Accessible from Dashboard and Schedule stacks.

import React, { useState, useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';
import { theme, statusColor } from '../theme';
import { formatDateLong, formatTimeRange } from '../utils/format';
import EmployeeChip from '../components/EmployeeChip';
import PrimaryButton from '../components/PrimaryButton';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_LABEL = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function JobDetailScreen({ navigation, route }) {
  const { jobId } = route.params;
  const { jobs, clients, employees, deleteJob } = useStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const job = jobs.find((j) => j.id === jobId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        job ? (
          <Pressable
            onPress={() =>
              navigation
                .getParent()
                ?.navigate('ScheduleTab', {
                  screen: 'JobForm',
                  params: { jobId: job.id },
                })
            }
            hitSlop={10}
          >
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Edit</Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, job]);

  if (!job) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This job has been deleted.</Text>
      </View>
    );
  }

  const client = clients.find((c) => c.id === job.clientId);
  const jobEmployees = job.employeeIds
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean);
  const color = statusColor(job.status, job.startAt);

  const onConfirmDelete = async () => {
    setConfirmOpen(false);
    await deleteJob(job.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.statusPill, { backgroundColor: color }]}>
          <Text style={styles.statusPillText}>{STATUS_LABEL[job.status]}</Text>
        </View>

        <Text style={styles.clientName}>{client?.name || 'Deleted client'}</Text>
        {client?.address ? (
          <Text style={styles.address}>{client.address}</Text>
        ) : null}

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} color={theme.muted} />
            <Text style={styles.rowText}>{formatDateLong(job.startAt)}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color={theme.muted} />
            <Text style={styles.rowText}>
              {formatTimeRange(job.startAt, job.durationMinutes)}
            </Text>
          </View>
        </View>

        <Text style={styles.section}>Crew</Text>
        <View style={styles.card}>
          <View style={styles.crewWrap}>
            {jobEmployees.map((e) => (
              <EmployeeChip key={e.id} employee={e} size={36} showName />
            ))}
            {jobEmployees.length === 0 ? (
              <Text style={styles.muted}>No employees assigned.</Text>
            ) : null}
          </View>
        </View>

        {job.notes ? (
          <>
            <Text style={styles.section}>Notes</Text>
            <View style={styles.card}>
              <Text style={styles.body}>{job.notes}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Delete"
            kind="danger"
            onPress={() => setConfirmOpen(true)}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete this job?"
        message="This can't be undone. The job reminder will also be cancelled."
        confirmLabel="Delete"
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: theme.space(4), paddingBottom: theme.space(12) },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { ...theme.font.body, color: theme.muted },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.space(3),
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: theme.space(3),
  },
  statusPillText: { color: '#fff', fontWeight: '600' },
  clientName: { ...theme.font.h1, color: theme.text },
  address: { ...theme.font.body, color: theme.muted, marginTop: 4 },
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
    marginBottom: theme.space(2),
  },
  rowText: { ...theme.font.body, color: theme.text, marginLeft: theme.space(2) },
  section: {
    ...theme.font.label,
    color: theme.muted,
    marginTop: theme.space(4),
  },
  crewWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  muted: { ...theme.font.body, color: theme.muted },
  body: { ...theme.font.body, color: theme.text },
  actions: { marginTop: theme.space(5) },
});
