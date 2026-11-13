import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function GlassCard({ children, style, topAccent, noPadding }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          borderTopColor: topAccent || theme.border,
          borderTopWidth: topAccent ? 3 : 1,
        },
        noPadding && { padding: 0 },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  }
});
