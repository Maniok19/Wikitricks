import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const lightTheme = {
  // Updated light theme colors - no orange
  colors: {
    primary: '#2563eb', // Blue
    secondary: '#7c3aed', // Purple
    accent: '#059669', // Green
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundDark: '#e9ecef',
    backgroundDarker: '#dee2e6',
    backgroundLight: '#ffffff',
    textPrimary: '#2c3e50',
    textSecondary: '#34495e',
    textMuted: '#6c757d',
    textLight: '#ffffff',
    textWhite: '#ffffff',
    textNeon: '#2563eb',
    btnPrimary: '#2563eb',
    btnPrimaryHover: '#1d4ed8',
    btnSecondary: '#6c757d',
    btnSecondaryHover: '#5a6268',
    btnDanger: '#dc3545',
    btnDangerHover: '#c82333',
    btnSuccess: '#059669',
    btnSuccessHover: '#047857',
    borderLight: '#dee2e6',
    borderMedium: '#ced4da',
    borderDark: '#adb5bd',
    shadowLight: 'rgba(0, 0, 0, 0.1)',
    shadowMedium: 'rgba(0, 0, 0, 0.15)',
    shadowHeavy: 'rgba(0, 0, 0, 0.25)',
    shadowNeon: '0 2px 4px rgba(37, 99, 235, 0.2)',
    dirtyRed: '#dc3545',
    fadedBlue: '#2563eb',
    grittyYellow: '#eab308',
    wornOrange: '#059669', // Changed from orange to green
    streetGreen: '#059669'
  },
  fonts: {
    primary: "'Oswald', sans-serif", // Same as dark theme
    secondary: "'Roboto', sans-serif", // Same as dark theme
    accent: "'Permanent Marker', cursive" // Same as dark theme
  }
};

export const darkTheme = {
  // Dark neon street theme colors
  colors: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    accent: '#00ff00',
    background: '#0a0a0a',
    backgroundSecondary: '#1a1a1a',
    backgroundDark: '#2a2a2a',
    backgroundDarker: '#0a0a0a',
    backgroundLight: '#4a4a4a',
    textPrimary: '#ffffff',
    textSecondary: '#e0e0e0',
    textMuted: '#b0b0b0',
    textLight: '#f5f5f5',
    textWhite: '#ffffff',
    textNeon: '#00ffff',
    btnPrimary: '#00ffff',
    btnPrimaryHover: '#ff00ff',
    btnSecondary: '#4a4a4a',
    btnSecondaryHover: '#00ff00',
    btnDanger: '#ff0040',
    btnDangerHover: '#ff4060',
    btnSuccess: '#00ff00',
    btnSuccessHover: '#20ff20',
    borderLight: '#3a3a3a',
    borderMedium: '#4a4a4a',
    borderDark: '#2a2a2a',
    shadowLight: 'rgba(0, 255, 255, 0.2)',
    shadowMedium: 'rgba(0, 255, 255, 0.3)',
    shadowHeavy: 'rgba(0, 255, 255, 0.5)',
    shadowNeon: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
    dirtyRed: '#ff0040',
    fadedBlue: '#00ffff',
    grittyYellow: '#ffff00',
    wornOrange: '#ff6600',
    streetGreen: '#00ff00'
  },
  fonts: {
    primary: "'Oswald', sans-serif",
    secondary: "'Roboto', sans-serif",
    accent: "'Permanent Marker', cursive"
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('wikitricks-theme');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('wikitricks-theme', JSON.stringify(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    // Update CSS custom properties when theme changes
    const root = document.documentElement;
    const colors = theme.colors;
    
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });

    // Set font variables
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-secondary', theme.fonts.secondary);
    root.style.setProperty('--font-accent', theme.fonts.accent);

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDarkMode, 
      toggleTheme,
      themeName: isDarkMode ? 'Street Neon' : 'Classic' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};