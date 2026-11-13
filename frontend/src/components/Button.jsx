import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md',         // 'sm' | 'md' | 'lg'
  style,
  textStyle,
  icon
}) {
  const { theme } = useTheme();

  const getBg = () => {
    if (disabled) return theme.textDim;
    switch (variant) {
      case 'secondary': return theme.bgSubtle;
      case 'outline':   return 'transparent';
      case 'danger':    return theme.roseLight;
      case 'ghost':     return 'transparent';
      default:          return theme.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary': return theme.textSecondary;
      case 'outline':   return theme.primary;
      case 'danger':    return theme.danger;
      case 'ghost':     return theme.textMuted;
      default:          return '#FFFFFF';
    }
  };

  const getBorder = () => {
    switch (variant) {
      case 'outline': return { borderWidth: 1.5, borderColor: theme.primary };
      case 'danger':  return { borderWidth: 1, borderColor: theme.danger };
      default:        return {};
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 7, paddingHorizontal: 14 };
      case 'lg': return { paddingVertical: 15, paddingHorizontal: 24 };
      default:   return { paddingVertical: 11, paddingHorizontal: 18 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 12;
      case 'lg': return 16;
      default:   return 14;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        getPadding(),
        getBorder(),
        { backgroundColor: getBg() },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.1,
  }
});
