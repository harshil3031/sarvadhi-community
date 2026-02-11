/**
 * Avatar - Reusable avatar component
 */

import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/radius';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends ViewProps {
  source?: { uri: string };
  initials?: string;
  size?: AvatarSize;
  backgroundColor?: string;
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  size = 'md',
  backgroundColor,
  online,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const sizeConfig = {
    xs: { width: 24, height: 24, fontSize: 10 },
    sm: { width: 32, height: 32, fontSize: 12 },
    md: { width: 40, height: 40, fontSize: 14 },
    lg: { width: 48, height: 48, fontSize: 16 },
    xl: { width: 64, height: 64, fontSize: 20 },
  };

  const config = sizeConfig[size];

  const styles = StyleSheet.create({
    container: {
      width: config.width,
      height: config.height,
      borderRadius: BorderRadius.full,
      backgroundColor: backgroundColor || colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.border,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    initialsText: {
      fontSize: config.fontSize,
      fontWeight: '600',
      color: colors.primary,
    },
    onlineBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: config.width * 0.35,
      height: config.width * 0.35,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.background,
    },
  });

  return (
    <View style={[styles.container, style]} {...props}>
      {source ? (
        <Image source={source} style={styles.image} />
      ) : (
        <Text style={styles.initialsText}>{initials || '?'}</Text>
      )}
      {online && <View style={styles.onlineBadge} />}
    </View>
  );
};
