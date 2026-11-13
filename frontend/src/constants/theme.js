import { COLORS } from './colors';

export const THEME = {
  colors: COLORS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    card: 16,    // 14-18px specified in design rules
    lg: 18,
    xl: 24,
    full: 9999,
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extraBold: '800',
    },
  },
  shadows: {
    card: {
      shadowColor: '#172B4D',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    hover: {
      shadowColor: '#16A36A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
  },
};

export default THEME;
