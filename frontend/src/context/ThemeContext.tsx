import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme-context';

const STORAGE_KEY = 'skybooker-theme';

function getInitialTheme(): Theme {
  return 'dark';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Force dark theme on mount (clear any stale 'light' in localStorage)
  useEffect(() => {
    applyTheme('dark');
    localStorage.setItem(STORAGE_KEY, 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
