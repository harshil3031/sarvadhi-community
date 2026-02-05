/**
 * Design System Constants
 * Mobile-first, simple, and consistent across the app
 */

// Colors - Light mode (Dark mode NOT required in MVP)
export const Colors = {
  // Primary
  primary: '#2563EB',      // Blue for main actions
  primaryLight: '#e3f2fd', // Light blue for backgrounds
  
  // Neutral
  background: '#FFFFFF',
  surface: '#F9FAFB',      // Light gray for sections
  border: '#E5E7EB',       // Light gray for borders
  text: '#000000',
  textSecondary: '#6B7280', // Gray for muted text
  textTertiary: '#9CA3AF',  // Lighter gray
  
  // State
  disabled: '#D1D5DB',
  placeholder: '#9CA3AF',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Badges & Highlights
  accentRed: '#DC2626',
  accentOrange: '#EA580C',
  accentCyan: '#0891B2',
};

// Spacing - consistent increments
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Border Radius - simple
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

// Typography
export const Typography = {
  // Headings
  headingXL: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  headingLg: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  headingMd: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  headingSm: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  
  // Body Text
  bodyLg: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySm: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  
  // Labels
  labelMd: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
};

// Shadows - simple, subtle
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Component Sizes
export const Sizes = {
  buttonHeight: 44,      // Minimum touch target
  inputHeight: 44,
  iconSmall: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  avatarSmall: 32,
  avatarMd: 48,
  avatarLg: 64,
};

// Animations
export const Duration = {
  fast: 100,
  normal: 200,
  slow: 300,
};
