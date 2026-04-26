// Dashboard: greeting, summary cards, today's jobs, next-up fallback.

import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { theme, OWNER_NAME } from '../theme';
import SummaryCard from '../components/SummaryCard';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';

export default function DashboardScreen({ navigation }) {
  const {
    clients,
    jobs,
    payments,
    employees,
    permissionGranted,
    permissionBannerDismissed,
    dismissPermissionBanner,
  } = useStore();

  const { thisWeekCount, unpaidCount, overdueCount, todays, nextUp } = useMemo(() => {
    const now = Date.now();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).getTime();
    const dayStart = startOfDay(now).getTime();
    const dayEnd = endOfDay(now).getTime();

    const weekJobs = jobs.filter(
      (j) => j.startAt >= weekStart && j.startAt <= weekEnd && j.status !== 'cancelled',
    );
    const todaysJobs = weekJobs
      .filter((j) => j.startAt >= dayStart && j.startAt <= dayEnd)
      .sort((a, b) => a.startAt - b.startAt);
    const upcoming = jobs
      .filter((j) => j.startAt > now && j.status !== 'cancelled')
      .sort((a, b) => a.startAt - b.startAt);
    const unpaid = payments.filter((p) => p.paidAt == null);
    const overdue = unpaid.filter((p) => p.dueDate < dayStart);
    return {
      thisWeekCount: weekJobs.length,
      unpaidCount: unpaid.length,
      overdueCount: overdue.length,
      todays: todaysJobs,
      nextUp: todaysJobs.length === 0 ? upcoming[0] || null : null,
    };
  }, [jobs, payments]);

  const clientFor = (id) => clients.find((c) => c.id === id);
  const employeesFor = (ids) =>
    ids.map((id) => employees.find((e) => e.id === id)).filter(Boolean);

  const showBanner = !permissionGranted && !permissionBannerDismissed;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.hello}>Good morning, {OWNER_NAME}</Text>

        {showBanner ? (
          <Pressable onPress={dismissPermissionBanner} style={styles.banner}>
            <Text style={styles.bannerText}>
              Enable notifications in Settings to receive reminders. Tap to dismiss.
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.metrics}>
          <SummaryCard label="Jobs this week" value={String(thisWeekCount)} />
          <SummaryCard label="Unpaid invoices" value={String(unpaidCount)} />
          <SummaryCard
            label="Overdue"
            value={String(overdueCount)}
            alert={overdueCount > 0}
            accent={overdueCount > 0 ? theme.danger : undefined}
          />
        </View>

        <Text style={styles.section}>Today's jobs</Text>
        {todays.length === 0 && !nextUp ? (
          <EmptyState
            icon="calendar-outline"
            title="No jobs today"
            subtitle="Tap Schedule to add one."
          />
        ) : null}

        {todays.map((job) => (
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

        {todays.length === 0 && nextUp ? (
          <>
            <Text style={styles.section}>Next up</Text>
            <JobCard
              job={nextUp}
              client={clientFor(nextUp.clientId)}
              employees={employeesFor(nextUp.employeeIds)}
              onPress={() =>
                navigation.navigate('JobDetail', { jobId: nextUp.id })
              }
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingBottom: theme.space(8) },
  hello: {
    ...theme.font.h1,
    color: theme.text,
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(4),
    paddingBottom: theme.space(3),
  },
  banner: {
    backgroundColor: theme.accent,
    marginHorizontal: theme.space(4),
    padding: theme.space(3),
    borderRadius: theme.radius,
    marginBottom: theme.space(3),
  },
  bannerText: { color: '#fff', ...theme.font.body },
  metrics: {
    flexDirection: 'row',
    paddingHorizontal: theme.space(3),
    marginBottom: theme.space(5),
  },
  section: {
    ...theme.font.h2,
    color: theme.text,
    paddingHorizontal: theme.space(4),
    marginTop: theme.space(3),
    marginBottom: theme.space(3),
  },
});
