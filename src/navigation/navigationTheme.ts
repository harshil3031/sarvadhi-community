/**
 * Navigation theme configuration
 */

import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { ColorPalette } from '../theme/colors';

export const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ColorPalette.light.primary,
    background: ColorPalette.light.background,
    card: ColorPalette.light.surface,
    text: ColorPalette.light.text,
    border: ColorPalette.light.border,
    notification: ColorPalette.light.primary,
  },
};

export const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ColorPalette.dark.primary,
    background: ColorPalette.dark.background,
    card: ColorPalette.dark.surface,
    text: ColorPalette.dark.text,
    border: ColorPalette.dark.border,
    notification: ColorPalette.dark.primary,
  },
};
