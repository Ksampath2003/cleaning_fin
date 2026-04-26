// Week view of the schedule. Swipe or tap chevrons to change weeks.

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  addDays,
  addWeeks,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { useStore } from '../context/StoreContext';
import { theme } from '../theme';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';

export default function ScheduleScreen({ navigation }) {
  const { clients, jobs, employees } = useStore();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const clientFor = (id) => clients.find((c) => c.id === id);
  const employeesFor = (ids) =>
    ids.map((id) => employees.find((e) => e.id === id)).filter(Boolean);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekJobs = useMemo(() => {
    const start = startOfDay(days[0]).getTime();
    const end = endOfDay(days[6]).getTime();
    return jobs
      .filter((j) => j.startAt >= start && j.startAt <= end)
      .sort((a, b) => a.startAt - b.startAt);
  }, [jobs, days]);

  const jobsForDay = (day) =>
    weekJobs.filter((j) => isSameDay(new Date(j.startAt), day));

  const title = `${format(days[0], 'MMM d')} – ${format(days[6], 'MMM d, yyyy')}`;
  const isCurrentWeek = isSameDay(
    weekStart,
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setWeekStart(addWeeks(weekStart, -1))}
          hitSlop={10}
          style={styles.chev}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{title}</Text>
          {!isCurrentWeek ? (
            <Pressable
              onPress={() =>
                setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
              }
              hitSlop={10}
            >
              <Text style={styles.today}>Today</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => setWeekStart(addWeeks(weekStart, 1))}
          hitSlop={10}
          style={styles.chev}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {weekJobs.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No jobs this week"
            subtitle="Tap the plus button to add one."
          />
        ) : null}
        {days.map((day) => {
          const dayJobs = jobsForDay(day);
          if (dayJobs.length === 0) return null;
          return (
            <View key={day.toISOString()} style={styles.dayBlock}>
              <Text style={styles.dayLabel}>{format(day, 'EEEE, MMM d')}</Text>
              {dayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  client={clientFor(job.clientId)}
                  employees={employeesFor(job.employeeIds)}
                  onPress={() =>
                    navigation.navigate('JobDetail', { jobId: job.id })
                  }
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      <FloatingActionButton onPress={() => navigation.navigate('JobForm', {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(3),
  },
  chev: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { ...theme.font.h2, color: theme.text },
  today: { color: theme.primary, marginTop: 2, fontWeight: '600' },
  scroll: { paddingBottom: theme.space(16) },
  dayBlock: { marginBottom: theme.space(2) },
  dayLabel: {
    ...theme.font.label,
    color: theme.muted,
    paddingHorizontal: theme.space(4),
    marginTop: theme.space(3),
    marginBottom: theme.space(2),
  },
});
