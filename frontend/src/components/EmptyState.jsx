import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({ title, message, onRefresh }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={styles.emoji}>📭</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title || 'Nothing here yet'}</Text>
      {message ? (
        <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
      ) : null}
      {onRefresh ? (
        <TouchableOpacity
          style={[styles.btn, { borderColor: theme.primary }]}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { color: theme.primary }]}>Refresh</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji: { fontSize: 40, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 13, fontWeight: '400', textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  btn: { marginTop: 20, paddingVertical: 9, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1.5 },
  btnText: { fontSize: 13, fontWeight: '600' },
});
