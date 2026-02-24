// ============================================
// USE AI HOOK
// Nowe SDK @google/genai (wymagane dla gemini-2.5-flash-image / Nano Banana)
// ============================================

import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
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

  const getAI = useCallback((): GoogleGenAI => {
    const apiKey =
      import.meta.env?.VITE_GEMINI_API_KEY ||
      import.meta.env?.VITE_API_KEY ||
      (typeof process !== 'undefined' && (process.env.API_KEY || process.env.GEMINI_API_KEY));

    if (!apiKey) {
      throw new Error('Brak klucza API. Dodaj VITE_GEMINI_API_KEY do pliku .env');
    }
    return new GoogleGenAI({ apiKey: String(apiKey) });
  }, []);

  // ============================================
  // GENEROWANIE LISTINGU SEO
  // ============================================
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

      const contents: any[] = images.map(img => ({
        inlineData: { mimeType: img.mimeType, data: img.data }
      }));
      contents.push({ text: `Generate Best Seller Listing for: ${productName}` });

      const result: any = await retryOperation(
        () => ai.models.generateContent({
          model: AI_MODELS.TEXT,
          contents: [{ role: 'user', parts: contents }],
          config: { systemInstruction: systemPrompt }
        }),
        {
          maxRetries: 3,
          delay: 2000,
          onRetry: (attempt) => setStatus(`Ponawianie próby ${attempt}/3...`)
        }
      );

      let jsonText: string = result.text ?? '';
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

  // ============================================
  // GENEROWANIE MOCKUPU (Nano Banana - gemini-2.5-flash-image)
  // ============================================
  const generateMockup = useCallback(async (
    systemPrompt: string,
    userPrompt: string,
    productImage: ProcessedImage,
    backgroundImage?: ProcessedImage
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Generowanie mockupu (Nano Banana)...');

    try {
      const ai = getAI();

      const parts: any[] = [
        { inlineData: { mimeType: productImage.mimeType, data: productImage.data } }
      ];
      if (backgroundImage) {
        parts.push({ inlineData: { mimeType: backgroundImage.mimeType, data: backgroundImage.data } });
      }
      parts.push({ text: `${systemPrompt}\n\n${userPrompt}` });

      const result: any = await retryOperation(
        () => ai.models.generateContent({
          model: AI_MODELS.IMAGE_GENERATION,
          contents: [{ role: 'user', parts }],
        }),
        {
          maxRetries: 3,
          delay: 2000,
          onRetry: (attempt) => setStatus(
            attempt > 3
              ? 'Przełączanie na model zapasowy...'
              : `Serwer zajęty, ponawianie (${attempt}/3)...`
          )
        }
      );

      // Wyciągnij obraz z odpowiedzi
      const candidates: any[] = result.candidates ?? [];
      let imageUrl: string | null = null;

      for (const candidate of candidates) {
        for (const part of candidate.content?.parts ?? []) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
        if (imageUrl) break;
      }

      if (!imageUrl) {
        throw new Error('Ten model nie zwrócił obrazu. Sprawdź czy masz dostęp do Nano Banana (gemini-2.5-flash-image).');
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

  // ============================================
  // GENEROWANIE PUSTEGO TŁA
  // ============================================
  const generateEmptyBackground = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Generowanie tła (Nano Banana)...');

    try {
      const ai = getAI();

      const result: any = await ai.models.generateContent({
        model: AI_MODELS.IMAGE_GENERATION,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const candidates: any[] = result.candidates ?? [];
      let imageUrl: string | null = null;

      for (const candidate of candidates) {
        for (const part of candidate.content?.parts ?? []) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
        if (imageUrl) break;
      }

      if (!imageUrl) {
        throw new Error('Nie udało się wygenerować tła.');
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

  // ============================================
  // REANALIZA
  // ============================================
  const reanalyze = useCallback(async (systemPrompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Ponowna analiza...');

    try {
      const ai = getAI();

      const result: any = await retryOperation(
        () => ai.models.generateContent({
          model: AI_MODELS.TEXT,
          contents: [{ role: 'user', parts: [{ text: 'Audit my changes.' }] }],
          config: { systemInstruction: systemPrompt }
        }),
        { maxRetries: 3, delay: 2000 }
      );

      let jsonText: string = result.text ?? '';
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

// ============================================
// OBSŁUGA BŁĘDÓW
// ============================================
function handleAIError(err: any): string {
  console.error('AI Error:', err);

  if (isBillingError(err)) {
    return 'Błąd uprawnień (403). Upewnij się, że projekt Google Cloud ma włączony billing.';
  }

  const msg = err?.message || '';

  if (msg.includes('429')) return 'Przekroczono limit zapytań. Poczekaj chwilę i spróbuj ponownie.';
  if (msg.includes('413') || msg.includes('payload')) return 'Zbyt duże zdjęcia. Użyj mniejszej liczby lub mniejszych plików.';
  if (msg.includes('404') || msg.includes('not found')) return 'Model AI nie został znaleziony. Sprawdź konfigurację modelu w src/config/constants.ts';

  return `Błąd: ${msg || 'Nieznany błąd'}`;
}
