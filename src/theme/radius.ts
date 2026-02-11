/**
 * Centralized border radius system
 * Specification: 8, 12, 16
 */

export const BorderRadius = {
  sm: 8,      // 8px - Small components
  md: 12,     // 12px - Medium components, buttons
  lg: 16,     // 16px - Cards, large components
  full: 9999, // Full (circle)
} as const;

export type BorderRadiusKey = keyof typeof BorderRadius;
