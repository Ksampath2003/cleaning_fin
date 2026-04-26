// Design tokens — single source of truth for colors, spacing, and typography.
// All screens must reference these values instead of inlining hex codes.

export const theme = {
  primary: '#0F9D8E',
  primaryDark: '#0B7A6F',
  accent: '#F4A261',
  success: '#2E9E5F',
  danger: '#D64545',
  info: '#2F80ED',
  text: '#1A1F1E',
  muted: '#6B7570',
  bg: '#F6FAF9',
  card: '#FFFFFF',
  border: '#E3EBE8',
  overlay: 'rgba(0,0,0,0.45)',
  radius: 14,
  space: (n) => n * 4,
  font: {
    h1: { fontSize: 28, fontWeight: '700' },
    h2: { fontSize: 20, fontWeight: '600' },
    h3: { fontSize: 17, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    label: { fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
    small: { fontSize: 12, fontWeight: '400' },
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

// Semantic color for a job status. Used by JobCard and JobDetail.
export const statusColor = (status, startAt) => {
  if (status === 'completed') return theme.success;
  if (status === 'in_progress') return theme.info;
  if (status === 'cancelled') return theme.muted;
  if (status === 'scheduled') {
    if (typeof startAt === 'number' && startAt - Date.now() < 2 * 60 * 60 * 1000) {
      return theme.accent;
    }
    return theme.primary;
  }
  return theme.muted;
};

export const OWNER_NAME = 'Sarah';
