// ============================================
// USE AI HOOK
// Zarządzanie połączeniem z Google GenAI
// ============================================

import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AI_MODELS } from '../config/constants';
import { retryOperation, isBillingError } from '../utils/retry';
import type { ProcessedImage } from '../types';

// Types for Google GenAI responses
interface GenerateContentResponse {
  text?: string;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

interface UseAIOptions {
  onError?: (error: Error) => void;
}

export const useAI = (options: UseAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const getAI = useCallback((): GoogleGenAI => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Brak klucza API. Skonfiguruj GEMINI_API_KEY.');
    }
    return new GoogleGenAI({ apiKey, apiVersion: 'v1' });
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
      const ai = getAI();
      
      const contentParts: any[] = images.map(img => ({
        inlineData: { mimeType: img.mimeType, data: img.data }
      }));
      contentParts.push({ text: `Generate Best Seller Listing for: ${productName}` });

      const response = await retryOperation<GenerateContentResponse>(
        () => ai.models.generateContent({
          model: AI_MODELS.TEXT,
          contents: { parts: contentParts },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json'
          }
        }) as Promise<GenerateContentResponse>,
        {
          maxRetries: 3,
          delay: 2000,
          onRetry: (attempt) => {
            setStatus(`Ponawianie próby ${attempt}/3...`);
          },
          fallbackOperation: () => ai.models.generateContent({
            model: AI_MODELS.PRO_ANALYSIS,
            contents: { parts: contentParts },
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json'
            }
          }) as Promise<GenerateContentResponse>
        }
      );

      let jsonText = response.text || '';
      
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
   * Generate mockup image
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
      const ai = getAI();
      
      const parts: any[] = [];
      parts.push({ inlineData: { mimeType: productImage.mimeType, data: productImage.data } });
      
      if (backgroundImage) {
        parts.push({ inlineData: { mimeType: backgroundImage.mimeType, data: backgroundImage.data } });
      }
      parts.push({ text: userPrompt });

      const response = await retryOperation<GenerateContentResponse>(
        () => ai.models.generateContent({
          model: AI_MODELS.IMAGE_GENERATION,
          contents: { parts },
          config: {
            systemInstruction: systemPrompt,
            responseModalities: ['image', 'text']
          }
        }) as Promise<GenerateContentResponse>,
        {
          maxRetries: 3,
          delay: 2000,
          onRetry: (attempt) => {
            setStatus(attempt > 3 ? 'Przełączanie na model zapasowy...' : `Serwer zajęty, ponawianie (${attempt}/3)...`);
          },
          fallbackOperation: () => ai.models.generateContent({
            model: AI_MODELS.IMAGE_FALLBACK,
            contents: { parts },
            config: {
              systemInstruction: systemPrompt
            }
          }) as Promise<GenerateContentResponse>
        }
      );

      // Extract image from response
      let imageUrl: string | null = null;
      
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('Nie udało się wygenerować obrazu - brak danych w odpowiedzi');
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
      const ai = getAI();
      
      const response = await retryOperation<GenerateContentResponse>(
        () => ai.models.generateContent({
          model: AI_MODELS.TEXT,
          contents: 'Audit my changes.',
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json'
          }
        }) as Promise<GenerateContentResponse>
      );

      let jsonText = response.text || '';
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
   * Generate empty background for mockup
   */
  const generateEmptyBackground = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Generowanie tła...');

    try {
      const ai = getAI();
      
      const response = await retryOperation<GenerateContentResponse>(
        () => ai.models.generateContent({
          model: AI_MODELS.IMAGE_GENERATION,
          contents: prompt,
          config: {
            responseModalities: ['image', 'text']
          }
        }) as Promise<GenerateContentResponse>,
        {
          maxRetries: 3,
          delay: 2000,
          onRetry: (attempt) => {
            setStatus(attempt > 3 ? 'Przełączanie na model zapasowy...' : `Serwer zajęty, ponawianie (${attempt}/3)...`);
          }
        }
      );

      let imageUrl: string | null = null;
      
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('Nie udało się wygenerować tła');
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
  
  if (err?.message?.includes('429')) {
    return 'Przekroczono limit zapytań. Poczekaj chwilę i spróbuj ponownie.';
  }
  
  if (err?.message?.includes('payload') || err?.message?.includes('413')) {
    return 'Zbyt duży rozmiar zdjęć. Użyj mniejszej liczby lub mniejszych plików.';
  }
  
  return `Błąd: ${err?.message || 'Nieznany błąd'}`;
}
