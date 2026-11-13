import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function FloatingActionButton({ icon = '+', onPress, label }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.fabIcon}>{icon}</Text>
      {label ? <Text style={styles.fabLabel}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 99
  },
  fabIcon: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold'
  },
  fabLabel: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8
  }
});
