/**
 * Centralized spacing system
 * Base unit: 4px
 * Specification: 4, 8, 16, 24, 32
 */

export const Spacing = {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 16,     // 16px
  lg: 24,     // 24px
  xl: 32,     // 32px
} as const;

export type SpacingKey = keyof typeof Spacing;
