import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants/design';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  border?: boolean;
}

const getPaddingStyle = (padding: 'sm' | 'md' | 'lg' | 'none') => {
  switch (padding) {
    case 'sm':
      return { padding: Spacing.md };
    case 'lg':
      return { padding: Spacing.xl };
    case 'none':
      return { padding: 0 };
    case 'md':
    default:
      return { padding: Spacing.lg };
  }
};

const getShadowStyle = (shadow: 'sm' | 'md' | 'lg' | 'none') => {
  switch (shadow) {
    case 'sm':
      return Shadows.sm;
    case 'md':
      return Shadows.md;
    case 'lg':
      return Shadows.lg;
    case 'none':
    default:
      return {};
  }
};

export default function Card({
  children,
  style,
  padding = 'md',
  shadow = 'sm',
  border = true,
}: CardProps) {
  const paddingStyle = getPaddingStyle(padding);
  const shadowStyle = getShadowStyle(shadow);

  return (
    <View
      style={[
        styles.card,
        paddingStyle,
        border && { borderColor: Colors.border, borderWidth: 1 },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
  },
});
