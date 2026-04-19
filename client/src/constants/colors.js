// src/constants/colors.js
// Design tokens — single source of truth for the app palette

const colors = {
  // Background
  bg:           '#0F172A', // Deep navy
  bgCard:       '#1E293B', // Card surface
  bgInput:      '#1E293B', // Input background

  // Brand
  primary:      '#6366F1', // Electric indigo
  primaryDark:  '#4F46E5',
  primaryLight: '#818CF8',

  // Accent
  success:      '#10B981', // Emerald green
  successLight: '#D1FAE5',
  warning:      '#F59E0B', // Amber
  warningLight: '#FEF3C7',
  danger:       '#EF4444', // Red
  dangerLight:  '#FEE2E2',
  info:         '#3B82F6', // Blue

  // Text
  textPrimary:   '#F1F5F9', // Near white
  textSecondary: '#94A3B8', // Muted slate
  textMuted:     '#475569',

  // Borders & Dividers
  border:        '#334155',
  divider:       '#1E293B',

  // Status badge colors
  statusColors: {
    requested:   { bg: '#1D3461', text: '#60A5FA' },
    accepted:    { bg: '#1B3A4B', text: '#34D399' },
    in_progress: { bg: '#2D1B69', text: '#A78BFA' },
    completed:   { bg: '#064E3B', text: '#6EE7B7' },
    cancelled:   { bg: '#450A0A', text: '#FCA5A5' },
  },
};

export default colors;
