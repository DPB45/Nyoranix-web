import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ darkMode: false, toggleDarkMode: () => {} });
const KEY = 'nyoranix-theme';

// Saved choice wins; otherwise follow the visitor's OS setting.
// (localStorage access is wrapped: it can throw in private mode / when blocked.)
const initialDark = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved === 'dark';
  } catch { /* ignore */ }
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(initialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem(KEY, darkMode ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [darkMode]);

  const value = useMemo(() => ({ darkMode, toggleDarkMode: () => setDarkMode((v) => !v) }), [darkMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeProvider;
