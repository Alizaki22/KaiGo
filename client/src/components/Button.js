// src/components/Button.js
// Reusable button with primary, secondary, danger, and outline variants
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  // Variants
  primary:     { backgroundColor: colors.primary },
  secondary:   { backgroundColor: colors.bgCard },
  danger:      { backgroundColor: colors.danger },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  // Disabled state
  disabled: { opacity: 0.5 },
  // Text styles
  text:          { fontSize: 16, fontWeight: '600', color: '#fff' },
  primaryText:   { color: '#fff' },
  secondaryText: { color: colors.textPrimary },
  dangerText:    { color: '#fff' },
  outlineText:   { color: colors.primary },
});

export default Button;
