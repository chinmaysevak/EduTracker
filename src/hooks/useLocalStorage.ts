// ============================================
// Custom Hook for LocalStorage Persistence
// ============================================

import React, { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to persist state in localStorage
 * @param key - localStorage key
 * @param initialValue - Default value if no data exists
 * @returns [storedValue, setValue] tuple
 */
export function useLocalStorage<T>(key: string, initialValue: T, userId?: string): [T, (value: T | ((val: T) => T)) => void] {
  // If userId is provided, prefix the key. Otherwise use raw key (for global settings or legacy)
  const scopedKey = userId ? `${userId}:${key}` : key;

  const initialValueRef = React.useRef(initialValue);
  
  // Get initial value from localStorage or use default
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(scopedKey);
      return item ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key "${scopedKey}":`, error);
      return initialValueRef.current;
    }
  }, [scopedKey]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save to state
      setStoredValue(valueToStore);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(scopedKey, JSON.stringify(valueToStore));

        // Dispatch a custom event for cross-tab sync specifically for this key
        // Standard 'storage' event only fires on OTHER tabs, but we might want local updates too if needed.
        // But for cross-tab, the standard event is fine.
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${scopedKey}":`, error);
    }
  }, [scopedKey, storedValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === scopedKey && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [scopedKey]);

  // Re-read value if key changes (e.g. user switch)
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue];
}

/**
 * Hook to clear all Edu Tracker data from localStorage
 */
export function useClearAllData(userId?: string) {
  const clearAllData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const baseKeys = [
      'edu-tracker-subjects',
      'edu-tracker-attendance',
      'edu-tracker-timetable',
      'edu-tracker-materials',
      'edu-tracker-playlists',
      'edu-tracker-tasks',
      'edu-tracker-progress',
      'edu-tracker-focus-session', // Added focus session
      'edu-tracker-user-profile'  // Added user profile
    ];

    // If userId is present, we clear specific user keys
    // We also clear base keys if they happen to exist (legacy cleanup)
    baseKeys.forEach(key => {
      window.localStorage.removeItem(key); // Clear legacy/global
      if (userId) {
        window.localStorage.removeItem(`${userId}:${key}`); // Clear scoped
      }
    });

    // Also clear auth if it's a full reset? 
    // Maybe keep auth so they don't get logged out immediately if they just wanted to clear data?
    // The previous implementation reloaded the page, which effectively resets app state.

    window.location.reload();
  }, [userId]);

  return clearAllData;
}
