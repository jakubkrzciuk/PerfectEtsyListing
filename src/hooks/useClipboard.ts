// ============================================
// USE CLIPBOARD HOOK
// Copy with visual feedback
// ============================================

import { useState, useCallback } from 'react';

interface CopyState {
  [key: string]: boolean;
}

export const useClipboard = (duration: number = 2000) => {
  const [copied, setCopied] = useState<CopyState>({});

  const copy = useCallback(async (text: string, id: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [id]: true }));
      
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [id]: false }));
      }, duration);
      
      return true;
    } catch (err) {
      console.error('Copy failed:', err);
      return false;
    }
  }, [duration]);

  const isCopied = useCallback((id: string): boolean => {
    return copied[id] || false;
  }, [copied]);

  return { copy, isCopied };
};
