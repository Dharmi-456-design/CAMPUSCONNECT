import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function PrimaryButton({ title, onPress, loading, disabled, style, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        (loading || disabled) && styles.disabledBtn,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  disabledBtn: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0,
    elevation: 0
  },
  icon: {
    marginRight: 8,
    fontSize: 16
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700'
  }
});
