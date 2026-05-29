// src/constants/colors.js
// These are your app's design tokens.
// Changing a color here changes it everywhere — don't hardcode colors in components.

export const Colors = {
  // Primary brand color — used for buttons, highlights
  primary: '#1B5E20',       // Deep green — trust, money
  primaryLight: '#4CAF50',  // Lighter green for hover states
  primaryDark: '#0a3d0a',   // Dark green for pressed states

  // Backgrounds
  background: '#F5F5F5',    // Main screen background
  surface: '#FFFFFF',       // Cards and panels
  surfaceAlt: '#FAFAFA',    // Alternate surface (list items)

  // Text
  textPrimary: '#1A1A1A',   // Main text — high contrast
  textSecondary: '#555555', // Labels, hints
  textMuted: '#999999',     // Disabled, placeholder

  // Semantic colors
  success: '#2E7D32',       // Positive actions, profit
  warning: '#F57C00',       // Low stock alerts
  danger: '#C62828',        // Delete, overdue dues
  info: '#1565C0',          // Info badges

  // UI elements
  border: '#E0E0E0',        // Dividers, input borders
  borderFocus: '#1B5E20',   // Input focused border
  overlay: 'rgba(0,0,0,0.5)',

  // Payment method colors
  cash: '#2E7D32',
  bkash: '#E2136E',
  nagad: '#F15A22',
};