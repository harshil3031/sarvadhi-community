/**
 * ScreenContainer - Wrapper for all screens
 */

import React from 'react';
import { View, ViewProps, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';

interface ScreenContainerProps extends ViewProps {
  noPadding?: boolean;
  noSafeArea?: boolean;
  backgroundColor?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  noPadding = false,
  noSafeArea = false,
  backgroundColor,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: backgroundColor || colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: backgroundColor || colors.background,
      paddingHorizontal: noPadding ? 0 : Spacing.md,
      paddingVertical: noPadding ? 0 : Spacing.md,
    },
  });

  const Container = noSafeArea ? View : SafeAreaView;

  return (
    <Container style={styles.safeArea}>
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    </Container>
  );
};
