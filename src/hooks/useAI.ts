// ============================================
// USE AI HOOK
// Zarządzanie połączeniem z Google Generative AI (Stabilna wersja)
// ============================================

import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_MODELS } from '../config/constants';
import { retryOperation, isBillingError } from '../utils/retry';
import type { ProcessedImage } from '../types';

interface UseAIOptions {
  onError?: (error: Error) => void;
}

export const useAI = (options: UseAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const getAI = useCallback((): GoogleGenerativeAI => {
    // Wsparcie dla Vite (import.meta.env) oraz standardowych nazw
    const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY) || 
                   (import.meta.env?.VITE_API_KEY) ||
                   process.env.API_KEY || 
                   process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Brak klucza API. Dodaj VITE_GEMINI_API_KEY do zmiennych środowiskowych (Vercel/env).');
    }
    return new GoogleGenerativeAI(apiKey);
  }, []);

  /**
   * Generate listing content (SEO)
   */
  const generateListing = useCallback(async (
    systemPrompt: string,
    images: ProcessedImage[],
    productName: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Analiza zdjęć i generowanie opisu...');

    try {
      const genAI = getAI();
      const model = genAI.getGenerativeModel({ 
        model: AI_MODELS.TEXT,
        systemInstruction: systemPrompt
      });
      
      const contentParts: any[] = images.map(img => ({
        inlineData: { mimeType: img.mimeType, data: img.data }
      }));
      contentParts.push({ text: `Generate Best Seller Listing for: ${productName}` });

      const result = await retryOperation(
        () => model.generateContent(contentParts),
        {
          maxRetries: 3,
          delay: 2000,
          onRetry: (attempt) => {
            setStatus(`Ponawianie próby ${attempt}/3...`);
          }
        }
      );

      const response = await result.response;
      let jsonText = response.text();
      
      // Clean up markdown if present
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const startIndex = jsonText.indexOf('{');
      const endIndex = jsonText.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1) {
        jsonText = jsonText.substring(startIndex, endIndex + 1);
      }

      setStatus('');
      return jsonText;
    } catch (err: any) {
      const errorMsg = handleAIError(err);
      setError(errorMsg);
      options.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAI, options]);

  /**
   * Generate mockup image (Legacy/Placeholder if not supported by model)
   */
  const generateMockup = useCallback(async (
    systemPrompt: string,
    userPrompt: string,
    productImage: ProcessedImage,
    backgroundImage?: ProcessedImage
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Generowanie mockupu...');

    try {
      const genAI = getAI();
      const model = genAI.getGenerativeModel({ 
        model: AI_MODELS.IMAGE_GENERATION,
        systemInstruction: systemPrompt
      });
      
      const parts: any[] = [];
      parts.push({ inlineData: { mimeType: productImage.mimeType, data: productImage.data } });
      
      if (backgroundImage) {
        parts.push({ inlineData: { mimeType: backgroundImage.mimeType, data: backgroundImage.data } });
      }
      parts.push({ text: userPrompt });

      const result = await retryOperation(
        () => model.generateContent(parts),
        {
          maxRetries: 3,
          delay: 2000,
          onRetry: (attempt) => {
            setStatus(attempt > 3 ? 'Przełączanie na model zapasowy...' : `Serwer zajęty, ponawianie (${attempt}/3)...`);
          }
        }
      );

      const response = await result.response;
      // Note: Standard Generative AI SDK might not support image output in the same way as Flash 2.0 Exp.
      // We will try to extract it if it's there.
      const candidate = response.candidates?.[0];
      let imageUrl: string | null = null;
      
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('Ten model nie zwrócił obrazu. Upewnij się, że używasz modelu wspierającego generowanie obrazów.');
      }

      setStatus('');
      return imageUrl;
    } catch (err: any) {
      const errorMsg = handleAIError(err);
      setError(errorMsg);
      options.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAI, options]);

  /**
   * Reanalyze existing listing
   */
  const reanalyze = useCallback(async (systemPrompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Ponowna analiza...');

    try {
      const genAI = getAI();
      const model = genAI.getGenerativeModel({ 
        model: AI_MODELS.TEXT,
        systemInstruction: systemPrompt
      });
      
      const result = await retryOperation(
        () => model.generateContent('Audit my changes.'),
        { maxRetries: 3, delay: 2000 }
      );

      const response = await result.response;
      let jsonText = response.text();
      
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const startIndex = jsonText.indexOf('{');
      const endIndex = jsonText.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1) {
        jsonText = jsonText.substring(startIndex, endIndex + 1);
      }

      setStatus('');
      return jsonText;
    } catch (err: any) {
      const errorMsg = handleAIError(err);
      setError(errorMsg);
      options.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAI, options]);

  /**
   * Generate empty background (Placeholder)
   */
  const generateEmptyBackground = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Generowanie tła...');

    try {
      const genAI = getAI();
      const model = genAI.getGenerativeModel({ model: AI_MODELS.IMAGE_GENERATION });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      let imageUrl: string | null = null;
      const candidate = response.candidates?.[0];
      
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('Nie udało się wygenerować tła tym modelem.');
      }

      setStatus('');
      return imageUrl;
    } catch (err: any) {
      const errorMsg = handleAIError(err);
      setError(errorMsg);
      options.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAI, options]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    status,
    error,
    generateListing,
    generateMockup,
    generateEmptyBackground,
    reanalyze,
    clearError
  };
};

/**
 * Handle AI errors with user-friendly messages
 */
function handleAIError(err: any): string {
  console.error('AI Error:', err);
  
  if (isBillingError(err)) {
    return 'Błąd uprawnień (403). Upewnij się, że projekt Google Cloud ma włączony billing.';
  }
  
  const msg = err?.message || '';
  
  if (msg.includes('429')) {
    return 'Przekroczono limit zapytań. Poczekaj chwilę i spróbuj ponownie.';
  }
  
  if (msg.includes('payload') || msg.includes('413')) {
    return 'Zbyt duży rozmiar zdjęć. Użyj mniejszej liczby lub mniejszych plików.';
  }

  if (msg.includes('not found') || msg.includes('404')) {
    return 'Model AI nie został znaleziony. Sprawdź konfigurację modelu w src/config/constants.ts';
  }
  
  return `Błąd: ${msg || 'Nieznany błąd'}`;
}
