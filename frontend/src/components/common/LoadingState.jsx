import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * Reusable Loading State Component
 * Features emerald green spinner and professional typography.
 */
export default function LoadingState({
  message = 'Loading data...',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.spinnerCard}>
        <ActivityIndicator size="large" color="#16A36A" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  spinnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
