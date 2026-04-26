// Thin wrapper around AsyncStorage — one JSON array per collection key,
// plus a generic migrate() hook for future schema changes.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export const KEYS = {
  clients: 'cm:clients:v1',
  jobs: 'cm:jobs:v1',
  payments: 'cm:payments:v1',
  employees: 'cm:employees:v1',
  seeded: 'seeded:v1',
  permissionBanner: 'cm:permissionBanner:v1',
  dailyOverdueId: 'cm:dailyOverdueId:v1',
};

/** Read and JSON-parse a key. Returns fallback on missing or broken data. */
export const readJson = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    logger.error('readJson failed', key, e);
    return fallback;
  }
};

/** JSON-stringify and persist value at key. Returns true on success. */
export const writeJson = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    logger.error('writeJson failed', key, e);
    return false;
  }
};

/** Delete a key — used by sign-out/reset flows (not exposed in UI today). */
export const removeKey = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    logger.error('removeKey failed', key, e);
    return false;
  }
};

/**
 * Placeholder migration hook. Invoked on app start.
 * Future versions can branch on a stored schema version and rewrite records.
 */
export const migrate = async () => {
  // Intentionally empty — v1 schema needs no migration.
  return true;
};
