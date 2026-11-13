import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  rightIcon,
  onRightIconPress,
  error,
  hint,
  editable = true,
}) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.bgInput,
            borderColor: error
              ? theme.danger
              : focused
              ? theme.borderFocus
              : theme.border,
          },
          focused && styles.inputFocused,
          multiline && { minHeight: 80, alignItems: 'flex-start' },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={theme.textPlaceholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'sentences'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon} activeOpacity={0.7}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: theme.textDim }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputFocused: {
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  rightIcon: {
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  error: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  hint: { fontSize: 11, marginTop: 4 },
});
