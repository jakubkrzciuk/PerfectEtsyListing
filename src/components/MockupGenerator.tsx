// ============================================
// MOCKUP GENERATOR COMPONENT
// Ultra-realistyczne mockupy z inspiracjami i placement picker
// ============================================

import React, { useState } from 'react';
import { Camera, Wand2, Loader2, Download, AlertTriangle, Heart, Sparkles } from 'lucide-react';
import type { FormData, GenerationMode } from '../types';
import { useAI } from '../hooks/useAI';
import { buildMockupSystemPrompt, buildMockupUserPrompt } from '../config/prompts';
import type { InspirationItem } from '../hooks/useInspirations';
import type { ProcessedImage } from '../types';

// Obsługuje URL (z Supabase Storage) i base64
async function prepareImage(src: string): Promise<ProcessedImage> {
  // Import resizeImage lazily to avoid circular deps
  const { resizeImage } = await import('../utils/imageProcessing');

  if (src.startsWith('http')) {
    const response = await fetch(src);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return resizeImage(base64);
  }
  return resizeImage(src);
}

// ============================================
// PLACEMENT PRESETS
// ============================================
const PLACEMENTS = [
  { id: 'wall_center', emoji: '🖼️', label: 'Na ścianie', desc: 'Gobelin na centralnej ścianie, oko środkujące, minimalistyczne otoczenie' },
  { id: 'wall_above_dresser', emoji: '🪴', label: 'Nad komodą', desc: 'Gobelin powieszony nad drewnianą komodą, na niej roślina, świeca, ceramika' },
  { id: 'bedroom', emoji: '🛏️', label: 'Sypialnia', desc: 'Gobelin nad łóżkiem, lniana pościel w neutralnych tonach, soft morning light' },
  { id: 'floor_lean', emoji: '✨', label: 'Oparte o ścianę', desc: 'Gobelin oparte o ścianę na podłodze, przy nim roślina w donicy, artystyczny kadr' },
  { id: 'shelf', emoji: '📚', label: 'Na półce', desc: 'Mały gobelin na białej półce między książkami, ceramiką i roślinką' },
  { id: 'living_room', emoji: '🛋️', label: 'Salon', desc: 'Duży gobelin w przestronnym salonie nad sofą, luksusowy minimalistyczny vibe' },
];

const RATIOS = [
  { id: 'portrait', label: 'Pion', icon: '▯', desc: 'Prostokąt pionowy' },
  { id: 'landscape', label: 'Poziom', icon: '▭', desc: 'Prostokąt poziomy' },
  { id: 'square', label: 'Kwadrat', icon: '□', desc: 'Idealny kwadrat' },
];

const SIZES = [
  { id: 'S', label: 'S', desc: 'Mały (np. 30x40cm)', scaleHint: 'small (fills ~20% of wall width)' },
  { id: 'M', label: 'M', desc: 'Średni (np. 50x70cm)', scaleHint: 'medium (fills ~35% of wall width)' },
  { id: 'L', label: 'L', desc: 'Duży (np. 80x110cm)', scaleHint: 'large (fills ~50% of wall width)' },
  { id: 'XL', label: 'XL', desc: 'Gigant (np. 120x180cm)', scaleHint: 'extra large (fills ~70% of wall width)' },
];

interface MockupGeneratorProps {
  formData: FormData;
  generationMode: GenerationMode;
  referenceBg: string | null;
  photoScore: number;
  photoSuggestions: string[];
  selectedInspiration?: InspirationItem | null;
  inspirations?: InspirationItem[];
  onSelectInspiration?: (item: InspirationItem | null) => void;
}

export const MockupGenerator: React.FC<MockupGeneratorProps> = ({
  formData,
  generationMode,
  referenceBg,
  photoScore,
  photoSuggestions,
  selectedInspiration,
  inspirations = [],
  onSelectInspiration,
}) => {
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<string>('wall_center');
  const [selectedRatio, setSelectedRatio] = useState<string>('portrait');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const { generateMockup, generateEmptyBackground, status, error } = useAI();

  const getPlacementDesc = () => {
    const p = PLACEMENTS.find(p => p.id === selectedPlacement);
    return p?.desc || '';
  };

  const handleGenerate = async (suggestion: string, key: string) => {
    if (formData.images.length === 0 && generationMode === 'replace') {
      alert('Dodaj najpierw zdjęcie produktu!');
      return;
    }

    setGeneratingFor(key);

    try {
      const inspirationStyle = selectedInspiration?.style;
      const inspirationUrl = selectedInspiration?.url;

      const currentRatio = RATIOS.find(r => r.id === selectedRatio);
      const currentSize = SIZES.find(s => s.id === selectedSize);

      const promptAddon = `Product proportions: ${currentRatio?.desc}. Scale on wall: ${currentSize?.scaleHint}. Original stated dimensions: ${formData.widthCm}x${formData.heightCm}cm.`;

      // Buduj prompty - przekazujemy informację czy mamy inspirację jako URL
      const systemPrompt = buildMockupSystemPrompt(formData, generationMode, inspirationStyle);
      const userPrompt = buildMockupUserPrompt(`${suggestion}. ${promptAddon}`, !!referenceBg || !!inspirationUrl, inspirationUrl);

      let imageUrl: string;

      if (generationMode === 'empty_mockup') {
        imageUrl = await generateEmptyBackground(userPrompt);
      } else {
        const productImage = await prepareImage(formData.images[0]);

        // WYBÓR TŁA: Najpierw inspiracja, potem referenceBg z formularza
        let bgImage: ProcessedImage | undefined = undefined;
        if (inspirationUrl) {
          bgImage = await prepareImage(inspirationUrl);
        } else if (referenceBg) {
          bgImage = await prepareImage(referenceBg);
        }

        imageUrl = await generateMockup(systemPrompt, userPrompt, productImage, bgImage);
      }

      setGeneratedImages(prev => ({ ...prev, [key]: imageUrl }));
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

  const placementKey = `placement_${selectedPlacement}`;
  const selectedPlacementObj = PLACEMENTS.find(p => p.id === selectedPlacement)!;

  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase text-blue-800 flex items-center gap-2">
          <Camera size={20} /> Generator Mockupów AI
        </h3>
        <div className="flex items-center gap-2">
          {selectedInspiration && (
            <div className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-full">
              <Heart size={10} /> {selectedInspiration.name}
            </div>
          )}
          <span className={`text-xs px-2 py-1 rounded font-bold ${photoScore >= 7 ? 'bg-green-100 text-green-700' :
            photoScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
            Ocena: {photoScore}/10
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 text-xs rounded-lg">{error}</div>
      )}

      {/* ===== INSPIRATION PICKER (inline) ===== */}
      <div className="bg-white rounded-xl border border-blue-100 p-4">
        <p className="text-xs font-bold text-stone-600 uppercase tracking-wide mb-3 flex items-center gap-1">
          <Heart size={12} className="text-rose-400" /> Styl wnętrza
        </p>
        <div className="flex gap-2 flex-wrap">
          {/* Domyślny – brak inspiracji */}
          <button
            onClick={() => onSelectInspiration?.(null)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${!selectedInspiration
              ? 'border-stone-400 bg-stone-100 text-stone-700'
              : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-300'
              }`}
          >
            ✨ Japandi (domyślny)
          </button>

          {/* Miniatury inspiracji */}
          {inspirations.map(item => (
            <button
              key={item.id}
              onClick={() => onSelectInspiration?.(selectedInspiration?.id === item.id ? null : item)}
              title={`${item.name}: ${item.style}`}
              className={`relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedInspiration?.id === item.id
                ? 'border-rose-400 shadow-md shadow-rose-100 scale-105'
                : 'border-stone-100 hover:border-stone-300 hover:scale-105'
                }`}
              style={{ width: 68, height: 52 }}
            >
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              {selectedInspiration?.id === item.id && (
                <div className="absolute inset-0 bg-rose-400/25 flex items-center justify-center">
                  <Heart size={14} className="text-rose-600 fill-rose-500" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[8px] text-center py-0.5 truncate px-1">
                {item.name}
              </div>
            </button>
          ))}

          {inspirations.length === 0 && (
            <p className="text-[10px] text-stone-400 italic self-center">
              Dodaj wnętrza w zakładce <b>Inspiracje ❤️</b>
            </p>
          )}
        </div>

        {/* Aktywny styl */}
        {selectedInspiration && (
          <p className="mt-2.5 text-[9px] text-stone-400 italic leading-snug border-t border-stone-100 pt-2">
            <span className="text-rose-500 font-bold not-italic">Styl AI:</span> {selectedInspiration.style}
          </p>
        )}
      </div>

      {/* ===== RATIO & SIZE PICKER ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* Proporcje */}
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <p className="text-xs font-bold text-stone-600 uppercase tracking-wide mb-3">📐 Kształt</p>
          <div className="flex gap-2">
            {RATIOS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRatio(r.id)}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg border-2 transition-all ${selectedRatio === r.id ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-100 bg-stone-50 text-stone-400'
                  }`}
              >
                <span className="text-sm font-bold">{r.icon}</span>
                <span className="text-[10px] uppercase font-bold">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rozmiar */}
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <p className="text-xs font-bold text-stone-600 uppercase tracking-wide mb-3">📏 Rozmiar</p>
          <div className="flex gap-1.5 transition-all">
            {SIZES.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSize(s.id)}
                className={`flex-1 py-2 rounded-lg border-2 font-bold text-xs transition-all ${selectedSize === s.id ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-100 bg-stone-50 text-stone-400'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PLACEMENT PICKER ===== */}
      <div className="bg-white rounded-xl border border-blue-100 p-4">
        <p className="text-xs font-bold text-stone-600 uppercase tracking-wide mb-3">
          📍 Wybierz ustawienie gobelinu
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PLACEMENTS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlacement(p.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center border-2 transition-all text-xs ${selectedPlacement === p.id
                ? 'border-amber-400 bg-amber-50 text-stone-800 shadow-sm'
                : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-300'
                }`}
            >
              <span className="text-lg">{p.emoji}</span>
              <span className="font-bold leading-tight">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Preview opisu + Generuj */}
        <div className="bg-stone-50 rounded-lg p-3 mb-3">
          <p className="text-[10px] text-stone-500 italic leading-relaxed">
            {selectedPlacementObj.desc}
            {selectedInspiration && (
              <span className="text-rose-600"> • Styl: {selectedInspiration.style}</span>
            )}
          </p>
        </div>

        <button
          onClick={() => handleGenerate(
            `${getPlacementDesc()}${selectedInspiration ? `. Style: ${selectedInspiration.style}` : ''}`,
            placementKey
          )}
          disabled={generatingFor === placementKey}
          className="w-full py-3 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {generatingFor === placementKey ? (
            <><Loader2 size={16} className="animate-spin" />{status || 'Generowanie...'}</>
          ) : (
            <><Wand2 size={16} /> Generuj — {selectedPlacementObj.emoji} {selectedPlacementObj.label}</>
          )}
        </button>

        {generatedImages[placementKey] && (
          <div className="mt-3">
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-stone-200 shadow-sm mb-2">
              <img
                src={generatedImages[placementKey]}
                className="w-full h-full object-cover"
                alt="Generated mockup"
              />
            </div>
            <button
              onClick={() => downloadImage(generatedImages[placementKey], `mockup-${selectedPlacement}.png`)}
              className="w-full text-xs text-green-700 font-bold border border-green-200 bg-green-50 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-green-100"
            >
              <Download size={13} /> Pobierz mockup
            </button>
          </div>
        )}
      </div>

      {/* ===== AI SUGGESTIONS ===== */}
      {photoSuggestions.length > 0 && (
        <div>
          <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
            <Sparkles size={12} /> Sugestie AI z analizy zdjęć:
          </p>
          <div className="space-y-2">
            {photoSuggestions.map((suggestion, i) => {
              const key = `suggestion_${i}`;
              return (
                <div key={i} className="bg-white/70 p-3 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-2 text-xs text-blue-800 mb-2">
                    <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-3 leading-relaxed">{suggestion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerate(
                        `${suggestion}${selectedInspiration ? `. Interior style: ${selectedInspiration.style}` : ''}`,
                        key
                      )}
                      disabled={generatingFor === key}
                      className="text-[10px] bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-blue-200 font-bold"
                    >
                      {generatingFor === key ? (
                        <><Loader2 className="animate-spin" size={10} />{status || 'Generowanie...'}</>
                      ) : (
                        <><Wand2 size={10} /> Generuj</>
                      )}
                    </button>
                    {generatedImages[key] && (
                      <button
                        onClick={() => downloadImage(generatedImages[key], `mockup-suggestion-${i}.png`)}
                        className="text-[10px] text-green-600 hover:text-green-800 flex items-center gap-1 font-bold"
                      >
                        <Download size={10} /> Pobierz
                      </button>
                    )}
                  </div>
                  {generatedImages[key] && (
                    <div className="mt-2 w-full aspect-video rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                      <img
                        src={generatedImages[key]}
                        className="w-full h-full object-cover"
                        alt={`Mockup ${i + 1}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-3 bg-white/60 rounded-xl text-[10px] text-stone-500 space-y-0.5">
        <p className="font-bold mb-1">💡 Wskazówki:</p>
        <p>• Wybierz wnętrze z zakładki <b>Inspiracje ❤️</b> — AI dopasuje styl automatycznie</p>
        <p>• <b>Placement</b> określa gdzie gobelin będzie w scenie</p>
        <p>• Każda sugestia AI generuje inne, unikalne ujęcie</p>
      </div>
    </div>
  );
};
