import React from 'react';
import { StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { BaseInput } from '../../src/components/base/BaseInput';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  icon,
  containerStyle,
  ...props
}: InputProps) {
  return (
    <BaseInput
      label={label}
      error={error}
      containerStyle={[styles.container, containerStyle]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
});
