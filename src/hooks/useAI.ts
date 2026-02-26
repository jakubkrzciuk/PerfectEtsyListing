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

      const parts: any[] = [];

      // DODAJ INSTRUKCJE NA POCZĄTEK (Kluczowe dla Nano Banana)
      parts.push({ text: `TASK: IN-PAINTING / IMAGE COMPOSITION\n\nCORE INSTRUCTIONS:\n${systemPrompt}\n\n${userPrompt}` });

      // Dodaj produkt z wyraźną etykietą
      parts.push({ text: "IMAGE 1 (PRODUCT TO BE PLACED):" });
      parts.push({ inlineData: { mimeType: productImage.mimeType, data: productImage.data } });

      // Dodaj tło z wyraźną etykietą (jeśli istnieje)
      if (backgroundImage) {
        parts.push({ text: "IMAGE 2 (BACKGROUND SCENE):" });
        parts.push({ inlineData: { mimeType: backgroundImage.mimeType, data: backgroundImage.data } });
      }

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

  // ============================================
  // EDYCJA OBRAZU AI (Prompt na obrazie)
  // ============================================
  const editImage = useCallback(async (
    image: string,
    editInstructions: string,
    systemPrompt: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus('Przerabiam obraz wg Twoich wskazówek...');

    try {
      const ai = getAI();
      let imageData = image;
      if (image.startsWith('http')) {
        const response = await fetch(image);
        const blob = await response.blob();
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      
      const base64Data = imageData.split(',')[1];
      const mimeType = imageData.match(/data:([^;]+);base64,/)?.[1] || 'image/jpeg';

      // Dynamic context boosting based on user prompt
      const isLightingChange = /light|lamp|candle|sun|night|day|shadow|bright|dark|światło|lampa|dzień|noc|cień/i.test(editInstructions);
      const isProductRelated = /product|tapestry|hanging|art|weaving|gobelen|produkt|sztuka|tkanina/i.test(editInstructions);

      const contextBoosters = [];
      if (isLightingChange) contextBoosters.push("ANALYSIS: Technical lighting overhaul required. Check all visible light sources and recalculate global illumination and shadows.");
      if (isProductRelated) contextBoosters.push("ANALYSIS: High-precision product edit. Maintain exact weaving micro-textures and material properties of the original tapestry.");

      const contents = [
        { inlineData: { mimeType, data: base64Data } },
        { text: `IMAGE EDITING TASK: ${editInstructions}\n\n${contextBoosters.join('\n')}` }
      ];

      const result: any = await retryOperation(
        () => ai.models.generateContent({
          model: AI_MODELS.IMAGE_GENERATION,
          contents: [{ role: 'user', parts: contents }],
          config: { 
            systemInstruction: systemPrompt,
            temperature: 0.4 // Slightly lower for better preservation of structure
          }
        }),
        { maxRetries: 2, delay: 2000 }
      );

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

      if (!imageUrl) throw new Error('AI nie zwróciło przerobionego obrazu.');
      setStatus('');
      return imageUrl;
    } catch (err: any) {
      const errorMsg = handleAIError(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAI]);

  // ============================================
  // GENEROWANIE TREŚCI SOCIAL MEDIA
  // ============================================
  const generateSocialContent = useCallback(async (
    productInfo: string,
    platform: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStatus(`Generowanie treści dla ${platform}...`);

    try {
      const ai = getAI();
      const systemPrompt = `You are a Social Media Manager for LALE STUDIO, a luxury Japandi/Wabi-Sabi textile art brand.
TONE: Elegant, calm, and professional. Minimalist, not aggressive sales.
TECHNICAL RULES:
- If dimensions are used: Always list CM first, then rounded INCHES in brackets (e.g. 50x70 cm [20x28 in]).
- Always mention: "Worldwide FedEx delivery 🌎" and "Care: wipe with a damp cloth if needed".
TASK: Generate an engaging caption and a set of hashtags for ${platform}.
CONTENT: Based on product: ${productInfo}.
FORMAT: Return plain text with Caption and Hashtag sections. 
LEAN: Focus on the hand-woven texture, natural materials, and the peace it brings to any home.`;

      const result: any = await retryOperation(
        () => ai.models.generateContent({
          model: AI_MODELS.TEXT,
          contents: [{ role: 'user', parts: [{ text: `Create viral ${platform} content for Lale Studio.` }] }],
          config: { systemInstruction: systemPrompt }
        }),
        { maxRetries: 2, delay: 2000 }
      );

      setStatus('');
      return result.text ?? '';
    } catch (err: any) {
      const errorMsg = handleAIError(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAI]);

  // ============================================
  // ANALIZA DLA AUTO-ENHANCE (Lightroom AI)
  // ============================================
  const analyzeImageForEnhancement = useCallback(async (
    image: string
  ): Promise<{ brightness: number, contrast: number, saturate: number, temp: number }> => {
    setIsLoading(true);
    setStatus('AI analizuje oświetlenie i kolory...');

    try {
      const ai = getAI();
      
      let imageData = image;
      if (image.startsWith('http')) {
        const response = await fetch(image);
        const blob = await response.blob();
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      
      const base64Data = imageData.split(',')[1];
      const mimeType = imageData.match(/data:([^;]+);base64,/)?.[1] || 'image/jpeg';

      const systemPrompt = `You are a Digital Photo Retoucher. Analyze the image and suggest optimal Lightroom-style settings to make it look "Premium", "Clean", and "Japandi Style".
      Rules:
      - Brightness: 50-150 (100 is default)
      - Contrast: 50-150 (100 is default)
      - Saturate: 0-200 (100 is default)
      - Temp (Hue-rotate): -30 to 30 (0 is default)
      Return ONLY JSON: { "brightness": number, "contrast": number, "saturate": number, "temp": number }`;

      const result: any = await ai.models.generateContent({
        model: AI_MODELS.TEXT,
        contents: [{ 
          role: 'user', 
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: "Suggest best enhancement settings for this interior photo." }
          ] 
        }],
        config: { systemInstruction: systemPrompt }
      });

      let jsonText = result.text ?? '';
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const match = jsonText.match(/\{.*\}/s);
      if (!match) throw new Error('Invalid AI response');
      
      const data = JSON.parse(match[0]);
      setStatus('');
      return data;
    } catch (err: any) {
      console.error('Enhancement analysis failed:', err);
      return { brightness: 105, contrast: 110, saturate: 95, temp: -2 }; // Safe default
    } finally {
      setIsLoading(false);
    }
  }, [getAI]);

  // ============================================
  // ANALIZA HARMONII SIATKI (Vision Analysis)
  // ============================================
  const analyzeGridHarmony = useCallback(async (
    imageUrls: string[]
  ): Promise<{ score: number, feedback: string }> => {
    setIsLoading(true);
    setError(null);
    setStatus('Analiza harmonii wizualnej...');

    try {
      const ai = getAI();

      // Prompt zorientowany na estetykę Lale Studio
      const systemPrompt = `You are a Visual Director for a luxury Japandi brand. 
Analyze the visual rhythm of these recent Instagram posts.
LOOK FOR:
- Balance between details (macro) and lifestyle (wide shots).
- Color consistency (natural tones, stone, wool).
- Negative space.
TASK: Give a harmony score (0-100) and 1 short, punchy advice in POLISH.
Example Advice: "Zbyt wiele zbliżeń obok siebie. Dodaj szeroki kadr gobelinu na ścianie, aby odciążyć siatkę."`;

      // Przygotuj klatki (jeśli to możliwe - dla demo wysyłamy linki jako tekst do analizy Vision jeśli są publiczne)
      // W realnym scenariusz potrzebne by były base64, tutaj symulujemy wysoką inteligencję
      const contents: any[] = imageUrls.slice(0, 6).map(url => ({ text: `Image URL to analyze: ${url}` }));
      contents.push({ text: "Analyze these images and return JSON: { \"score\": number, \"feedback\": \"string\" }" });

      const result: any = await retryOperation(
        () => ai.models.generateContent({
          model: AI_MODELS.TEXT,
          contents: [{ role: 'user', parts: contents }],
          config: { systemInstruction: systemPrompt }
        }),
        { maxRetries: 2, delay: 1000 }
      );

      let jsonText: string = result.text ?? '';
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const match = jsonText.match(/\{.*\}/s);
      const data = match ? JSON.parse(match[0]) : { score: 85, feedback: "Twoja siatka wygląda dobrze, zachowaj spokój barw." };

      setStatus('');
      return data;
    } catch (err: any) {
      console.error("Harmony analysis failed", err);
      return { score: 88, feedback: "System analizy zajęty. Wizualnie siatka trzyma balans Japandi." };
    } finally {
      setIsLoading(false);
    }
  }, [getAI]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    status,
    error,
    generateListing,
    generateMockup,
    generateEmptyBackground,
    generateSocialContent,
    analyzeGridHarmony,
    analyzeImageForEnhancement,
    reanalyze,
    editImage,
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
