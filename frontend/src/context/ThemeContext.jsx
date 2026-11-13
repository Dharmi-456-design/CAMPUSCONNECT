import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, saveStorageItem } from '../utils/secureStorage';
import { LIGHT, DARK } from '../constants/colors';

const ThemeContext = createContext({
  theme: LIGHT,
  isDark: false,
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    getStorageItem('cc_theme').then((val) => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await saveStorageItem('cc_theme', next ? 'dark' : 'light');
  };

  const theme = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
