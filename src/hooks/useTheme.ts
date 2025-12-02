import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme_mode';

export type ThemeMode = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    const initial: ThemeMode = saved || 'dark';
    applyTheme(initial);
    setTheme(initial);
  }, []);

  const toggle = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return { theme, toggle };
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (mode === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
} 