// ============================================
// MOCKUP GENERATOR COMPONENT
// AI-powered image generation for mockups
// ============================================

import React, { useState } from 'react';
import { Camera, Wand2, Loader2, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { FormData, GenerationMode } from '../types';
import { useAI } from '../hooks/useAI';
import { resizeImage } from '../utils/imageProcessing';
import { buildMockupSystemPrompt, buildMockupUserPrompt } from '../config/prompts';

interface MockupGeneratorProps {
  formData: FormData;
  generationMode: GenerationMode;
  referenceBg: string | null;
  photoScore: number;
  photoSuggestions: string[];
}

export const MockupGenerator: React.FC<MockupGeneratorProps> = ({
  formData,
  generationMode,
  referenceBg,
  photoScore,
  photoSuggestions
}) => {
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const { generateMockup, generateEmptyBackground, status, error } = useAI();

  const handleGenerate = async (suggestion: string) => {
    if (formData.images.length === 0 && generationMode === 'replace') {
      alert('Dodaj najpierw zdjęcie produktu!');
      return;
    }

    // Check if suggestion implies back shot
    const isBackShot = suggestion.toLowerCase().includes('tył') || 
                      suggestion.toLowerCase().includes('back') ||
                      suggestion.toLowerCase().includes('plecy');
    
    if (isBackShot && generationMode === 'replace') {
      const hasBackImage = window.confirm(
        'Czy wgrałeś zdjęcie TYŁU ramy jako wzór? Jeśli nie, anuluj i dodaj zdjęcie tyłu ramy.'
      );
      if (!hasBackImage) return;
    }

    setGeneratingFor(suggestion);

    try {
      const systemPrompt = buildMockupSystemPrompt(formData, generationMode);
      const userPrompt = buildMockupUserPrompt(suggestion, !!referenceBg);

      let imageUrl: string;

      if (generationMode === 'empty_mockup') {
        imageUrl = await generateEmptyBackground(userPrompt);
      } else {
        const productImage = await resizeImage(formData.images[0]);
        const bgImage = referenceBg ? await resizeImage(referenceBg) : undefined;
        
        imageUrl = await generateMockup(systemPrompt, userPrompt, productImage, bgImage);
      }

      setGeneratedImages(prev => ({ ...prev, [suggestion]: imageUrl }));
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setGeneratingFor(null);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Standard front shot suggestion
  const standardFrontSuggestion = 'Zdjęcie idealnie od frontu, na czystej, białej ścianie. Bardzo jasne, minimalistyczne, studyjne oświetlenie.';

  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase text-blue-800 flex items-center gap-2">
          <Camera size={20} /> Generator Mockupów AI
        </h3>
        <span className={`text-xs px-2 py-1 rounded font-bold ${
          photoScore >= 7 ? 'bg-green-100 text-green-700' :
          photoScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          Ocena zdjęć: {photoScore}/10
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Standard Front Shot */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
        <h4 className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
          <Camera size={14} /> Zdjęcie Standardowe (Front)
        </h4>
        <p className="text-[10px] text-stone-500 mb-3">
          Idealne zdjęcie od frontu na białej ścianie
        </p>
        
        <button
          onClick={() => handleGenerate(standardFrontSuggestion)}
          disabled={generatingFor === standardFrontSuggestion}
          className="w-full text-xs bg-stone-900 hover:bg-black text-white px-4 py-2 rounded 
                   flex items-center justify-center gap-2 transition-colors font-bold"
        >
          {generatingFor === standardFrontSuggestion ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              {status || 'Generowanie...'}
            </>
          ) : (
            <>
              <Wand2 size={14} /> Generuj Front (Biała Ściana)
            </>
          )}
        </button>

        {generatedImages[standardFrontSuggestion] && (
          <div className="mt-3">
            <div className="w-full h-48 bg-stone-100 rounded overflow-hidden border border-stone-200 shadow-sm mb-2">
              <img 
                src={generatedImages[standardFrontSuggestion]} 
                className="w-full h-full object-cover"
                alt="Generated front mockup"
              />
            </div>
            <button
              onClick={() => downloadImage(generatedImages[standardFrontSuggestion], 'mockup-front.png')}
              className="w-full text-xs text-green-600 hover:text-green-800 flex items-center 
                       justify-center gap-1 font-bold border border-green-200 bg-green-50 py-1.5 rounded"
            >
              <Download size={14} /> Pobierz
            </button>
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-blue-800 mb-2">
          Sugestie AI na podstawie analizy:
        </p>
        
        {photoSuggestions.map((suggestion, i) => (
          <div key={i} className="bg-white/60 p-3 rounded border border-blue-100">
            <div className="flex items-start gap-2 text-xs text-blue-800 mb-2">
              <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="font-medium line-clamp-3">{suggestion}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerate(suggestion)}
                disabled={generatingFor === suggestion}
                className="text-[10px] bg-blue-100 hover:bg-blue-600 hover:text-white 
                         text-blue-700 px-3 py-1.5 rounded flex items-center gap-1 
                         transition-colors border border-blue-200 font-bold"
              >
                {generatingFor === suggestion ? (
                  <>
                    <Loader2 className="animate-spin" size={12} />
                    {status || 'Generowanie...'}
                  </>
                ) : (
                  <>
                    <Wand2 size={12} /> Generuj
                  </>
                )}
              </button>
              
              {generatedImages[suggestion] && (
                <button
                  onClick={() => downloadImage(generatedImages[suggestion], `mockup-${i}.png`)}
                  className="text-[10px] text-green-600 hover:text-green-800 flex items-center gap-1 font-bold"
                >
                  <Download size={12} /> Pobierz
                </button>
              )}
            </div>

            {generatedImages[suggestion] && (
              <div className="mt-2 w-full h-32 bg-stone-100 rounded overflow-hidden border border-stone-200 shadow-sm">
                <img 
                  src={generatedImages[suggestion]} 
                  className="w-full h-full object-cover"
                  alt={`Generated mockup ${i + 1}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-white/50 rounded text-[10px] text-stone-500">
        <p className="font-bold mb-1">Wskazówki:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Tryb &quot;Pusty Mockup&quot; zachowuje 100% oryginalnej faktury</li>
          <li>Tryb &quot;Edycji AI&quot; może delikatnie zmienić teksturę</li>
          <li>Dla najlepszych wyników używaj zdjęć w dobrej rozdzielczości</li>
        </ul>
      </div>
    </div>
  );
};
