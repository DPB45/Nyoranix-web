import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from './ThemeProvider';

const ThemeToggle = ({ className = '' }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Light mode' : 'Dark mode'}
      className={`hover:text-nyoranixRed transition-colors ${className}`}
    >
      {darkMode ? <FaSun size={17} /> : <FaMoon size={17} />}
    </button>
  );
};

export default ThemeToggle;
