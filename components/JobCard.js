// Job card shown on Dashboard and Schedule. Left color bar mirrors job status.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme, statusColor } from '../theme';
import { formatTimeRange } from '../utils/format';
import EmployeeChip from './EmployeeChip';

export default function JobCard({ job, client, employees, onPress }) {
  const color = statusColor(job.status, job.startAt);
  const clientName = client?.name || 'Deleted client';
  const isCancelled = job.status === 'cancelled';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
    >
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text
          style={[
            styles.client,
            isCancelled && { textDecorationLine: 'line-through', color: theme.muted },
          ]}
          numberOfLines={1}
        >
          {clientName}
        </Text>
        <Text style={styles.time}>{formatTimeRange(job.startAt, job.durationMinutes)}</Text>
        <View style={styles.chipRow}>
          {employees.map((e) => (
            <EmployeeChip key={e.id} employee={e} size={24} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    marginHorizontal: theme.space(4),
    marginBottom: theme.space(3),
    overflow: 'hidden',
    ...theme.shadow,
  },
  bar: { width: 6 },
  body: { flex: 1, padding: theme.space(4) },
  client: { ...theme.font.h3, color: theme.text },
  time: { ...theme.font.body, color: theme.muted, marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.space(2) },
});
