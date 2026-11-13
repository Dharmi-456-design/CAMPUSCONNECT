import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const VARIANTS = {
  primary:   { bg: '#E8F5EE', text: '#16A36A' },
  indigo:    { bg: '#E8F5EE', text: '#16A36A' },
  gold:      { bg: '#FEF3C7', text: '#B45309' },
  amber:     { bg: '#FEF3C7', text: '#B45309' },
  cyan:      { bg: '#ECFEFF', text: '#0E7490' },
  success:   { bg: '#DCFCE7', text: '#15803D' },
  danger:    { bg: '#FFE4E6', text: '#BE123C' },
  rose:      { bg: '#FFE4E6', text: '#BE123C' },
  purple:    { bg: '#F3E8FF', text: '#6D28D9' },
  neutral:   { bg: '#F3F4F6', text: '#4B5563' },
};

const DARK_VARIANTS = {
  primary:   { bg: 'rgba(201, 168, 76, 0.15)', text: '#16A36A' },
  indigo:    { bg: 'rgba(201, 168, 76, 0.15)', text: '#16A36A' },
  gold:      { bg: 'rgba(201, 168, 76, 0.2)', text: '#16A36A' },
  amber:     { bg: 'rgba(201, 168, 76, 0.2)', text: '#16A36A' },
  cyan:      { bg: '#0A1F22', text: '#22D3EE' },
  success:   { bg: '#062019', text: '#34D399' },
  danger:    { bg: '#200A10', text: '#FB7185' },
  rose:      { bg: '#200A10', text: '#FB7185' },
  purple:    { bg: '#1A0F30', text: '#A78BFA' },
  neutral:   { bg: '#1E2130', text: '#9CA3AF' },
};

export default function Badge({ label, variant = 'neutral', style }) {
  const { isDark } = useTheme();
  const palette = isDark ? DARK_VARIANTS : VARIANTS;
  const colors = palette[variant] || palette.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
