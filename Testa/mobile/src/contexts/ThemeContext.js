// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { THEME_COLORS, ROLE_THEMES } from '../constants/config';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [themeName, setThemeName] = useState('lightgreen');

  useEffect(() => {
    (async () => {
      const saved = await storage.getTheme();
      if (saved) {
        setThemeName(saved);
      } else if (user?.role) {
        setThemeName(ROLE_THEMES[user.role] || 'lightgreen');
      }
    })();
  }, [user]);

  const theme = THEME_COLORS[themeName] || THEME_COLORS.lightgreen;

  const switchTheme = async (name) => {
    setThemeName(name);
    await storage.setTheme(name);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
