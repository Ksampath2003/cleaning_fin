// Thin logger wrapper — no-ops when not in development.

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

export const logger = {
  info: (...args) => {
    if (isDev) console.log('[info]', ...args);
  },
  warn: (...args) => {
    if (isDev) console.warn('[warn]', ...args);
  },
  error: (...args) => {
    if (isDev) console.error('[error]', ...args);
  },
};
