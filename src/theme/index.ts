/**
 * Central theme export
 */

export { ColorPalette, type ColorKey, type ThemeMode } from './colors';
export { Spacing, type SpacingKey } from './spacing';
export { Typography, type TypographyKey } from './typography';
export { BorderRadius, type BorderRadiusKey } from './radius';
export { Shadows, type ShadowKey } from './shadows';

export type Theme = {
  mode: 'light' | 'dark';
  colors: typeof import('./colors').ColorPalette[keyof typeof import('./colors').ColorPalette];
};

// Import theme components
import { ColorPalette } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';
import { BorderRadius } from './radius';
import { Shadows } from './shadows';

// Export combined theme object
export const theme = {
  colors: ColorPalette,
  spacing: Spacing,
  typography: Typography,
  radius: BorderRadius,
  shadows: Shadows,
};
