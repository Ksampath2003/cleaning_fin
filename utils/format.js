// Formatting helpers for currency, date, and time — all date work goes through date-fns.
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addMinutes,
  differenceInMinutes,
} from 'date-fns';

/** Format a number as USD currency, always two decimals and grouped thousands. */
export const formatCurrency = (amount) => {
  const n = Number.isFinite(amount) ? amount : 0;
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/** Short date label like "Mon, Oct 13". */
export const formatDate = (ms) => format(new Date(ms), 'EEE, MMM d');

/** Long date label like "Monday, October 13, 2026". */
export const formatDateLong = (ms) => format(new Date(ms), 'EEEE, MMMM d, yyyy');

/** Time label like "9:00 AM". */
export const formatTime = (ms) => format(new Date(ms), 'h:mm a');

/** Time range given a start epoch ms and a duration in minutes. */
export const formatTimeRange = (startAt, durationMinutes) => {
  const endAt = addMinutes(new Date(startAt), durationMinutes);
  return `${format(new Date(startAt), 'h:mm a')} – ${format(endAt, 'h:mm a')}`;
};

/** Friendly relative day label: Today, Tomorrow, Yesterday, else short date. */
export const formatRelativeDay = (ms) => {
  const d = new Date(ms);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE, MMM d');
};

/** Initials for an employee chip (max 2 chars). */
export const employeeInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/** Stable color for an employee chip derived from its ID. */
const CHIP_PALETTE = ['#0F9D8E', '#2F80ED', '#9B51E0', '#E07A5F', '#2E9E5F', '#F4A261'];
export const chipColor = (id) => {
  if (!id) return CHIP_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CHIP_PALETTE[hash % CHIP_PALETTE.length];
};

export {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addMinutes,
  differenceInMinutes,
};
