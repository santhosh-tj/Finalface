import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    console.log('Initial theme from localStorage:', savedTheme);
    if (savedTheme) return savedTheme;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'dark'; // Default to dark mode for premium feel
  });

  useEffect(() => {
    console.log('Theme changed to:', theme);
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    console.log('HTML classes:', root.className);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggle theme called, current theme:', theme);
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      console.log('New theme will be:', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
