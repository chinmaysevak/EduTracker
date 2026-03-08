// ============================================
// Dark Mode + Accent Color Theme Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const ACCENT_PRESETS = [
  { name: 'Blue', hue: 220, color: 'hsl(220, 60%, 45%)' },
  { name: 'Violet', hue: 262, color: 'hsl(262, 60%, 50%)' },
  { name: 'Rose', hue: 350, color: 'hsl(350, 65%, 50%)' },
  { name: 'Amber', hue: 35, color: 'hsl(35, 80%, 50%)' },
  { name: 'Emerald', hue: 160, color: 'hsl(160, 50%, 40%)' },
  { name: 'Cyan', hue: 190, color: 'hsl(190, 70%, 45%)' },
  { name: 'Orange', hue: 25, color: 'hsl(25, 80%, 50%)' },
  { name: 'Pink', hue: 330, color: 'hsl(330, 65%, 50%)' },
] as const;

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyAccentHue(hue: number, isDark: boolean) {
  const root = document.documentElement;
  // Light theme accents
  if (!isDark) {
    root.style.setProperty('--primary', `${hue} 60% 45%`);
    root.style.setProperty('--ring', `${hue} 60% 45%`);
    root.style.setProperty('--accent-foreground', `${hue} 60% 35%`);
    root.style.setProperty('--accent', `${hue} 60% 95%`);
  } else {
    // Dark theme accents (lighter & more saturated)
    root.style.setProperty('--primary', `${hue} 70% 55%`);
    root.style.setProperty('--ring', `${hue} 70% 55%`);
    root.style.setProperty('--accent-foreground', `${hue} 60% 85%`);
    root.style.setProperty('--accent', `${hue} 15% 14%`);
  }
}

interface UseThemeOptions {
  /** Called when theme changes — use this to persist to MongoDB */
  onThemeChange?: (theme: Theme) => void;
}

export function useTheme(options?: UseThemeOptions) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    // Use localStorage as a fast cache to avoid flash on page load
    const stored = window.localStorage.getItem('edu-tracker-theme') as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) return stored;
    return 'system';
  });

  const [accentHue, setAccentHueState] = useState<number>(() => {
    if (typeof window === 'undefined') return 220;
    const stored = window.localStorage.getItem('edu-tracker-accent');
    return stored ? parseInt(stored, 10) : 220;
  });

  const resolved = resolveTheme(theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Keep localStorage as a fast cache for page-load (avoids flash)
    localStorage.setItem('edu-tracker-theme', theme);
    // Re-apply accent for the new mode
    applyAccentHue(accentHue, resolved === 'dark');
  }, [theme, resolved, accentHue]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setThemeState('system'); // re-trigger effect
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Sync theme across all useTheme hook instances
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'edu-tracker-theme' && e.newValue) {
        setThemeState(e.newValue as Theme);
      }
      if (e.key === 'edu-tracker-accent' && e.newValue) {
        setAccentHueState(parseInt(e.newValue, 10));
      }
    };

    const handleCustomEvent = (e: CustomEvent<Theme>) => {
      setThemeState(e.detail);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('edutracker-theme-sync', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('edutracker-theme-sync', handleCustomEvent as EventListener);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    // Keep localStorage in sync immediately
    localStorage.setItem('edu-tracker-theme', t);
    // Dispatch event to sync other useTheme instances in the same window
    window.dispatchEvent(new CustomEvent('edutracker-theme-sync', { detail: t }));
    // Persist to MongoDB via callback
    options?.onThemeChange?.(t);
  }, [options]);

  const setAccentHue = useCallback((hue: number) => {
    setAccentHueState(hue);
    localStorage.setItem('edu-tracker-accent', String(hue));
    applyAccentHue(hue, resolveTheme(theme) === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    // Current state from either our system evaluate or the explicit theme
    const isCurrentlyDark = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';

    const newTheme: Theme = isCurrentlyDark ? 'light' : 'dark';

    setThemeState(newTheme);
    // Update local storage immediately to prevent flashes
    localStorage.setItem('edu-tracker-theme', newTheme);
    // Dispatch event to sync other useTheme instances
    window.dispatchEvent(new CustomEvent('edutracker-theme-sync', { detail: newTheme }));
    // Persist to MongoDB via callback
    options?.onThemeChange?.(newTheme);
  }, [theme, options]);

  return {
    theme,        // raw value: 'light' | 'dark' | 'system'
    resolved,     // actual applied: 'light' | 'dark'
    setTheme,
    toggleTheme,
    isDark: resolved === 'dark',
    accentHue,
    setAccentHue,
  };
}

