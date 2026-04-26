// Notification helpers — all expo-notifications side effects live here.
// Keep components and screens free of direct Notifications calls.

import * as Notifications from 'expo-notifications';
import { logger } from '../utils/logger';
import { KEYS, readJson, writeJson } from '../storage/storage';

// Show banners even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Prompt for notification permission. Returns boolean granted. */
export const requestPermissions = async () => {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  } catch (e) {
    logger.error('requestPermissions failed', e);
    return false;
  }
};

/**
 * Schedule a one-shot reminder 1 hour before the job starts.
 * Returns the notification ID, or null if the window already passed.
 */
export const scheduleJobReminder = async ({ startAt, clientName, address }) => {
  const triggerMs = startAt - 60 * 60 * 1000;
  if (triggerMs <= Date.now()) return null;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming job',
        body: `Upcoming: ${clientName} at ${address || 'address not set'} in 1 hour.`,
        sound: 'default',
      },
      trigger: { date: new Date(triggerMs) },
    });
    return id;
  } catch (e) {
    logger.error('scheduleJobReminder failed', e);
    return null;
  }
};

/** Cancel a previously-scheduled job reminder by its notification ID. */
export const cancelJobReminder = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    logger.warn('cancelJobReminder failed (likely already fired)', e);
  }
};

/**
 * Reschedule the daily 9AM overdue-payment reminder.
 * Cancels any prior daily notification first. No-op when count is 0.
 */
export const scheduleDailyOverdue = async ({ count, totalDollars }) => {
  await cancelDailyOverdue();
  if (!count || count <= 0) return null;
  try {
    const formattedTotal = totalDollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Overdue payments',
        body: `You have ${count} overdue payment${count === 1 ? '' : 's'} totaling ${formattedTotal}.`,
        sound: 'default',
      },
      trigger: { hour: 9, minute: 0, repeats: true },
    });
    await writeJson(KEYS.dailyOverdueId, id);
    return id;
  } catch (e) {
    logger.error('scheduleDailyOverdue failed', e);
    return null;
  }
};

/** Cancel the persisted daily overdue notification, if any. */
export const cancelDailyOverdue = async () => {
  try {
    const id = await readJson(KEYS.dailyOverdueId, null);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await writeJson(KEYS.dailyOverdueId, null);
    }
  } catch (e) {
    logger.warn('cancelDailyOverdue failed', e);
  }
};
