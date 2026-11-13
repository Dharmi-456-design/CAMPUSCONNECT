import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Reusable White Card Component
 * Uses rounded 16px borders, white background, subtle #E2E8F0 border,
 * and soft elevation shadow matching the CampusOne design system.
 */
export default function Card({
  children,
  style,
  onPress,
  activeOpacity = 0.75,
  padding = 18,
}) {
  const content = (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
