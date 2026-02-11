/**
 * Centralized color system for light and dark modes
 * Corporate SaaS internal community app color palette
 */

export const ColorPalette = {
  light: {
    // Primary colors
    primary: '#4F46E5',
    secondary: '#0EA5E9',
    primaryLight: '#EEF2FF',
    primaryDark: '#3730A3',

    // Semantic colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    text: '#0F172A',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    divider: '#E2E8F0',

    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',

    // Interaction colors
    disabled: '#CBD5E1',
    placeholder: '#94A3B8',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    // Primary colors
    primary: '#818CF8',
    secondary: '#38BDF8',
    primaryLight: '#312E81',
    primaryDark: '#4F46E5',

    // Semantic colors
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    text: '#F8FAFC',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    border: '#334155',
    divider: '#334155',

    // Status colors
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#38BDF8',

    // Interaction colors
    disabled: '#475569',
    placeholder: '#64748B',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export type ColorKey = keyof typeof ColorPalette.light;
export type ThemeMode = 'light' | 'dark';
