

// Utility to convert React Native shadow props to web-compatible boxShadow
// Use this for cross-platform shadow support in SDK 57 (react-native-web 0.21+)

import { Platform } from 'react-native';

/**
 * Creates a cross-platform shadow style.
 * On native (iOS/Android): uses shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation
 * On web: uses boxShadow (the new API for react-native-web 0.21+)
 *
 * @param {string} color - CSS/hex color string e.g. '#16A36A' or '#000'
 * @param {{ width: number, height: number }} offset - shadow offset
 * @param {number} opacity - shadow opacity 0-1
 * @param {number} radius - shadow blur radius
 * @param {number} elevation - Android elevation
 */
export function makeShadow(color, offset = { width: 0, height: 2 }, opacity = 0.2, radius = 4, elevation = 2) {
  if (Platform.OS === 'web') {
    // Parse hex color to rgba
    const rgba = hexToRgba(color, opacity);
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius * 2}px ${rgba}`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

function hexToRgba(hex, alpha) {
  try {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch {
    return `rgba(0,0,0,${alpha})`;
  }
}
