// ============================================
// USE LOCAL STORAGE HOOK
// Persisted state with typing
// ============================================

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  key: string;
  defaultValue: T;
  migrate?: (data: any) => T;
}

export const useLocalStorage = <T>(options: UseLocalStorageOptions<T>) => {
  const { key, defaultValue, migrate } = options;
  
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setValue(migrate ? migrate(parsed) : parsed);
      }
    } catch (e) {
      console.error(`Error loading ${key} from localStorage:`, e);
    }
    setIsLoaded(true);
  }, [key, migrate]);

  // Save to localStorage when value changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
      }
    }
  }, [key, value, isLoaded]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      return next;
    });
  }, []);

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return { value, setValue: updateValue, removeValue, isLoaded };
};

// Specialized hook for history items
export const useHistoryStorage = () => {
  return useLocalStorage({
    key: 'lale-seo-history-v2',
    defaultValue: [] as any[],
    migrate: (data: any) => {
      // Handle old format migration
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          ...item,
          thumbnails: item.thumbnails || (item.thumbnail ? [item.thumbnail] : [])
        }));
      }
      return [];
    }
  });
};

// Specialized hook for keywords
export const useKeywordsStorage = (defaultKeywords: string[]) => {
  return useLocalStorage({
    key: 'lale-seo-keywords-v2',
    defaultValue: defaultKeywords
  });
};
