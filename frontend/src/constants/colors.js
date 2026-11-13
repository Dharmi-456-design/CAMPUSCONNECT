/**
 * CampusOne — Design System Colors
 * Primary: Emerald Green #16A36A
 * Background: Light Grey/Slate #F8FAFC
 * Surface / Card: White #FFFFFF
 * Text Primary: #172B4D
 * Text Secondary: #64748B
 * Border: #E2E8F0
 * Error: #DC2626
 */

export const COLORS = {
  // Brand Colors
  primary: '#16A36A',
  primaryLight: '#E8F5EE',
  primaryDark: '#128253',
  primaryMuted: 'rgba(22, 163, 106, 0.12)',

  // Background & Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceInput: '#FFFFFF',

  // Typography
  textPrimary: '#172B4D',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderFocus: '#16A36A',
  divider: '#EEF2F6',

  // Status & Feedback
  success: '#16A36A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // Accent Category Pills (Inspired by Alma Ata / CampusOne UI)
  accentBlue: '#2563EB',
  accentBlueLight: '#EFF6FF',
  accentPurple: '#7C3AED',
  accentPurpleLight: '#F3E8FF',
  accentAmber: '#D97706',
  accentAmberLight: '#FFFBEB',
  accentRose: '#E11D48',
  accentRoseLight: '#FFF1F2',
  accentCyan: '#0891B2',
  accentCyanLight: '#ECFEFF',
};

export const LIGHT = {
  ...COLORS,
  bg: COLORS.background,
  bgCard: COLORS.surface,
  text: COLORS.textPrimary,
};

export const DARK = {
  ...COLORS,
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  bg: '#0F172A',
  bgCard: '#1E293B',
  text: '#F8FAFC',
};

export default COLORS;
