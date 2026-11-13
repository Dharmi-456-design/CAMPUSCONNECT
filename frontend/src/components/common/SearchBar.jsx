import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../../context/ThemeContext';

export default function SearchBar({ value, onChangeText, placeholder, onClear, onSubmit }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
      <Icon name="search" size={16} color={theme.textDim} style={{ marginRight: 8 }} />
      <TextInput
        style={[styles.input, { color: theme.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor={theme.textPlaceholder}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} activeOpacity={0.7} style={styles.clearBtn}>
          <Icon name="x" size={15} color={theme.textDim} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  clearBtn: { padding: 2 },
});
