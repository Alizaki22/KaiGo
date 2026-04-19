// src/components/Input.js
// Reusable text input with label, icon support, and error state
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError, !editable && styles.inputDisabled]}>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:       { marginBottom: 16 },
  label:         { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputRow: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.bgInput,
    borderRadius:     10,
    borderWidth:      1,
    borderColor:      colors.border,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 13,
  },
  multiline:     { minHeight: 80, textAlignVertical: 'top' },
  inputError:    { borderColor: colors.danger },
  inputDisabled: { opacity: 0.6 },
  eyeBtn:        { paddingLeft: 8 },
  eyeText:       { fontSize: 18 },
  errorText:     { color: colors.danger, fontSize: 12, marginTop: 4, marginLeft: 2 },
});

export default Input;
