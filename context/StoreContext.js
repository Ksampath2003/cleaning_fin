// Single source of truth for persisted state.
// Exposes clients, jobs, payments, and employees plus CRUD helpers.
// Reschedules notifications automatically; screens never touch expo-notifications.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { startOfDay } from 'date-fns';
import { KEYS, readJson, writeJson, migrate } from '../storage/storage';
import { buildSeedData } from '../data/seedData';
import { generateId } from '../utils/ids';
import {
  requestPermissions,
  scheduleJobReminder,
  cancelJobReminder,
  scheduleDailyOverdue,
  cancelDailyOverdue,
} from '../notifications/notifications';
import { logger } from '../utils/logger';

const StoreContext = createContext(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
};

const toast = (msg) => Alert.alert('Something went wrong', msg);

export function StoreProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(true);

  // --- load on mount ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      await migrate();
      const seeded = await readJson(KEYS.seeded, false);
      if (!seeded) {
        const data = buildSeedData();
        await writeJson(KEYS.employees, data.employees);
        await writeJson(KEYS.clients, data.clients);
        await writeJson(KEYS.jobs, data.jobs);
        await writeJson(KEYS.payments, data.payments);
        await writeJson(KEYS.seeded, true);
      }
      const [e, c, j, p] = await Promise.all([
        readJson(KEYS.employees, []),
        readJson(KEYS.clients, []),
        readJson(KEYS.jobs, []),
        readJson(KEYS.payments, []),
      ]);
      setEmployees(e);
      setClients(c);
      setJobs(j);
      setPayments(p);
      setHydrated(true);

      const granted = await requestPermissions();
      setPermissionGranted(granted);
    })();
  }, []);

  // --- persistence helpers ---------------------------------------------------
  const persist = useCallback(async (key, value) => {
    const ok = await writeJson(key, value);
    if (!ok) toast('Save failed. Please try again.');
    return ok;
  }, []);

  // --- clients ---------------------------------------------------------------
  const addClient = useCallback(
    async (input) => {
      const record = {
        id: generateId(),
        name: input.name.trim(),
        phone: input.phone || '',
        email: input.email || '',
        address: input.address.trim(),
        notes: input.notes || '',
        createdAt: Date.now(),
        deleted: false,
      };
      const next = [...clients, record];
      setClients(next);
      await persist(KEYS.clients, next);
      return record;
    },
    [clients, persist],
  );

  const updateClient = useCallback(
    async (id, patch) => {
      const next = clients.map((c) => (c.id === id ? { ...c, ...patch } : c));
      setClients(next);
      await persist(KEYS.clients, next);
    },
    [clients, persist],
  );

  // Soft-delete: keep the row but mark deleted + rename so history renders.
  const deleteClient = useCallback(
    async (id) => {
      const next = clients.map((c) =>
        c.id === id ? { ...c, deleted: true, name: 'Deleted client' } : c,
      );
      setClients(next);
      await persist(KEYS.clients, next);
    },
    [clients, persist],
  );

  // --- jobs ------------------------------------------------------------------
  const addJob = useCallback(
    async (input) => {
      const client = clients.find((c) => c.id === input.clientId);
      const id = generateId();
      let notificationId = null;
      if (client) {
        notificationId = await scheduleJobReminder({
          startAt: input.startAt,
          clientName: client.name,
          address: client.address,
        });
      }
      const record = {
        id,
        clientId: input.clientId,
        startAt: input.startAt,
        durationMinutes: input.durationMinutes || 120,
        employeeIds: input.employeeIds || [],
        notes: input.notes || '',
        status: input.status || 'scheduled',
        notificationId,
      };
      const next = [...jobs, record];
      setJobs(next);
      await persist(KEYS.jobs, next);
      return record;
    },
    [clients, jobs, persist],
  );

  const updateJob = useCallback(
    async (id, patch) => {
      const prior = jobs.find((j) => j.id === id);
      if (!prior) return;
      const merged = { ...prior, ...patch };
      // If timing changed or client changed, reschedule the notification.
      const timingChanged =
        patch.startAt !== undefined || patch.clientId !== undefined;
      if (timingChanged) {
        await cancelJobReminder(prior.notificationId);
        const client = clients.find((c) => c.id === merged.clientId);
        if (client && merged.status !== 'cancelled' && merged.status !== 'completed') {
          merged.notificationId = await scheduleJobReminder({
            startAt: merged.startAt,
            clientName: client.name,
            address: client.address,
          });
        } else {
          merged.notificationId = null;
        }
      } else if (
        patch.status &&
        (patch.status === 'cancelled' || patch.status === 'completed') &&
        prior.notificationId
      ) {
        await cancelJobReminder(prior.notificationId);
        merged.notificationId = null;
      }
      const next = jobs.map((j) => (j.id === id ? merged : j));
      setJobs(next);
      await persist(KEYS.jobs, next);
    },
    [clients, jobs, persist],
  );

  const deleteJob = useCallback(
    async (id) => {
      const prior = jobs.find((j) => j.id === id);
      if (prior?.notificationId) await cancelJobReminder(prior.notificationId);
      const next = jobs.filter((j) => j.id !== id);
      setJobs(next);
      await persist(KEYS.jobs, next);
    },
    [jobs, persist],
  );

  // --- payments --------------------------------------------------------------
  const reconcileOverdueNotification = useCallback(async (list) => {
    const today = startOfDay(new Date()).getTime();
    const overdue = list.filter(
      (p) => p.paidAt == null && p.dueDate < today,
    );
    const total = overdue.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    if (overdue.length === 0) {
      await cancelDailyOverdue();
    } else {
      await scheduleDailyOverdue({ count: overdue.length, totalDollars: total });
    }
  }, []);

  const addPayment = useCallback(
    async (input) => {
      const record = {
        id: generateId(),
        clientId: input.clientId,
        jobId: input.jobId || null,
        amount: Number(input.amount) || 0,
        dueDate: input.dueDate,
        paidAt: input.paidAt || null,
        note: input.note || '',
      };
      const next = [...payments, record];
      setPayments(next);
      await persist(KEYS.payments, next);
      await reconcileOverdueNotification(next);
      return record;
    },
    [payments, persist, reconcileOverdueNotification],
  );

  const updatePayment = useCallback(
    async (id, patch) => {
      const next = payments.map((p) => (p.id === id ? { ...p, ...patch } : p));
      setPayments(next);
      await persist(KEYS.payments, next);
      await reconcileOverdueNotification(next);
    },
    [payments, persist, reconcileOverdueNotification],
  );

  const deletePayment = useCallback(
    async (id) => {
      const next = payments.filter((p) => p.id !== id);
      setPayments(next);
      await persist(KEYS.payments, next);
      await reconcileOverdueNotification(next);
    },
    [payments, persist, reconcileOverdueNotification],
  );

  // Reconcile the daily overdue notification once after hydration.
  useEffect(() => {
    if (hydrated) reconcileOverdueNotification(payments).catch(logger.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // --- employees -------------------------------------------------------------
  const addEmployee = useCallback(
    async (name) => {
      const record = { id: generateId(), name: name.trim(), active: true };
      const next = [...employees, record];
      setEmployees(next);
      await persist(KEYS.employees, next);
      return record;
    },
    [employees, persist],
  );

  const updateEmployee = useCallback(
    async (id, patch) => {
      const next = employees.map((e) => (e.id === id ? { ...e, ...patch } : e));
      setEmployees(next);
      await persist(KEYS.employees, next);
    },
    [employees, persist],
  );

  // --- permission banner dismissal ------------------------------------------
  const [permissionBannerDismissed, setPermissionBannerDismissed] = useState(false);
  useEffect(() => {
    (async () => {
      const dismissed = await readJson(KEYS.permissionBanner, false);
      setPermissionBannerDismissed(dismissed);
    })();
  }, []);
  const dismissPermissionBanner = useCallback(async () => {
    setPermissionBannerDismissed(true);
    await writeJson(KEYS.permissionBanner, true);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      permissionGranted,
      permissionBannerDismissed,
      dismissPermissionBanner,
      clients,
      jobs,
      payments,
      employees,
      addClient,
      updateClient,
      deleteClient,
      addJob,
      updateJob,
      deleteJob,
      addPayment,
      updatePayment,
      deletePayment,
      addEmployee,
      updateEmployee,
    }),
    [
      hydrated,
      permissionGranted,
      permissionBannerDismissed,
      dismissPermissionBanner,
      clients,
      jobs,
      payments,
      employees,
      addClient,
      updateClient,
      deleteClient,
      addJob,
      updateJob,
      deleteJob,
      addPayment,
      updatePayment,
      deletePayment,
      addEmployee,
      updateEmployee,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
