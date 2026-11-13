import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Loader({ message = 'Loading...' }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.text, { color: theme.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  text: { marginTop: 14, fontSize: 14, fontWeight: '400' },
});
