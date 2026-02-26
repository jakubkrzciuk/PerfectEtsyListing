// ============================================
// MOCKUP GENERATOR COMPONENT
// Ultra-realistyczne mockupy z inspiracjami i placement picker
// ============================================

import React, { useState } from 'react';
import { 
  Camera, Wand2, Loader2, Download, AlertTriangle, Heart, Sparkles, 
  CheckCircle2, Plus, RefreshCw, Sun, Contrast, Palette, Thermometer, 
  Moon, Search, Sliders, Check 
} from 'lucide-react';
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
  { id: 'front_straight', emoji: '📐', label: 'Wprost z przodu', desc: 'Direct straight-on front view on a white or empty wall, perfect for documentation' },
  { id: 'wall_center', emoji: '🖼️', label: 'Na ścianie', desc: 'Centered on the main wall, eye-level, minimalist gallery-style placement' },
  { id: 'wall_above_dresser', emoji: '🪴', label: 'Nad komodą', desc: 'Hanging naturally above the wooden dresser/credenza visible in the room' },
  { id: 'bedroom', emoji: '🛏️', label: 'Sypialnia', desc: 'Centered above the headboard of the bed in the bedroom' },
  { id: 'floor_lean', emoji: '✨', label: 'Oparte o ścianę', desc: 'Leaning against the wall on the floor, next to furniture or plants' },
  { id: 'shelf', emoji: '📚', label: 'Na półce', desc: 'Planted on or above the shelf, integrated with books and decor' },
  { id: 'living_room', emoji: '🛋️', label: 'Salon', desc: 'Large scale placement above the sofa in the living room' },
];

const RATIOS = [
  { id: 'auto', label: 'Auto', icon: '✨', desc: 'Original product shape (Recommended)' },
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
  onAddImage?: (imageUrl: string) => void;
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
  onAddImage,
}) => {
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [addedToGallery, setAddedToGallery] = useState<Set<string>>(new Set());
  const [selectedPlacement, setSelectedPlacement] = useState<string>('front_straight');
  const [selectedRatio, setSelectedRatio] = useState<string>('auto');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [productContext, setProductContext] = useState<string>(formData.name || '');
  const isReplacementMode = selectedInspiration?.type === 'with_product';
  
  // POST-PRODUKCJA (Lightroom)
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [temp, setTemp] = useState(0); // Hue-rotate / Color balance surrogate
  const [sharpness, setSharpness] = useState(0); // CSS surrogate for contrast/brightness trick
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');

  const { generateMockup, generateEmptyBackground, editImage, analyzeImageForEnhancement, status, error } = useAI();

  const getPlacementDesc = () => {
    const p = PLACEMENTS.find(p => p.id === selectedPlacement);
    return p?.desc || '';
  };

  const handleGenerate = async (suggestion: string, key: string, forceNewScene: boolean = false) => {
    if (formData.images.length === 0 && generationMode === 'replace') {
      alert('Dodaj najpierw zdjęcie produktu!');
      return;
    }

    setGeneratingFor(key);
    // Wyczyść poprzedni obraz dla tego klucza, aby uniknąć efektu "przeskakiwania"
    setGeneratedImages(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    try {
      const inspirationStyle = selectedInspiration?.style;
      const inspirationUrl = !forceNewScene ? selectedInspiration?.url : undefined;
      const hasBgImage = !!referenceBg || !!inspirationUrl;

      const currentRatio = RATIOS.find(r => r.id === selectedRatio);
      const currentSize = SIZES.find(s => s.id === selectedSize);

      let promptAddon = `${selectedRatio === 'auto' ? 'MAINTAIN ORIGINAL ASPECT RATIO FROM IMAGE 1.' : `Product proportions: ${currentRatio?.desc}.`} Scale on wall: ${currentSize?.scaleHint}. Original stated dimensions: ${formData.widthCm}x${formData.heightCm}cm.`;

      if (selectedPlacement === 'front_straight') {
        promptAddon += ' COMPOSITION: Shoot directly from the front, perfectly symmetrical, eye-level. Center the product horizontally and vertically on the visible wall section.';
      }

      // Jeśli sceneria ma już gobelin, dodajemy precyzyjną informację o skali
      if (!forceNewScene && selectedInspiration?.type === 'with_product' && selectedInspiration.originalDimensions) {
        promptAddon += ` CRITICAL: The existing object on the wall (approx. ${selectedInspiration.originalDimensions}) must be completely ERASED. Overlay IMAGE 1 as a fresh, single-layer object in its place.`;
      }

      // Buduj prompty - przekazujemy informację czy mamy inspirację jako URL
      const tempFormData = { ...formData, name: productContext };
      const systemPrompt = buildMockupSystemPrompt(tempFormData, generationMode, inspirationStyle);
      const userPrompt = buildMockupUserPrompt(`${suggestion}. ${promptAddon}`, !!referenceBg && !forceNewScene || !!inspirationUrl, inspirationUrl);

      let imageUrl: string;

      if (generationMode === 'empty_mockup') {
        imageUrl = await generateEmptyBackground(userPrompt);
      } else {
        const productImage = await prepareImage(formData.images[0]);

        // WYBÓR TŁA: Najpierw inspiracja, potem referenceBg z formularza
        let bgImage: ProcessedImage | undefined = undefined;
        if (!forceNewScene) {
          if (inspirationUrl) {
            bgImage = await prepareImage(inspirationUrl);
          } else if (referenceBg) {
            bgImage = await prepareImage(referenceBg);
          }
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

  const handleAIEdit = async (key: string) => {
    const currentImage = generatedImages[key];
    if (!currentImage || !aiEditPrompt) return;

    setGeneratingFor(key);
    setIsEditingAI(true);

    try {
      const systemPrompt = `You are a professional Interior Photographer and AI Editor.
      TASK: Modify the existing scene according to user instructions.
      CRITICAL: Do NOT move or resize the product on the wall. Only change lighting, environment, time of day, or colors of walls/furniture.
      STYLE: Pinterest-ready, high-end photography.`;

      const editedUrl = await editImage(currentImage, aiEditPrompt, systemPrompt);
      setGeneratedImages(prev => ({ ...prev, [key]: editedUrl }));
      setAiEditPrompt('');
    } catch (err) {
      console.error('AI Edit failed:', err);
    } finally {
      setGeneratingFor(null);
      setIsEditingAI(false);
    }
  };

  const handleMagicEnhance = async (key: string) => {
    const currentImage = generatedImages[key];
    if (!currentImage) return;

    setIsEnhancing(true);
    try {
        const settings = await analyzeImageForEnhancement(currentImage);
        setBrightness(settings.brightness);
        setContrast(settings.contrast);
        setSaturate(settings.saturate);
        setTemp(settings.temp);
        setSharpness(10); // Auto-sharpen bit
    } catch (err) {
        console.error('Enhance failed:', err);
    } finally {
        setIsEnhancing(false);
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

  const renderEditor = (imgKey: string) => {
    if (!generatedImages[imgKey]) return null;

    return (
      <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 animate-slide-up relative overflow-hidden">
        {isEnhancing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center animate-fade-in text-[10px] font-bold text-stone-900">
                <Sparkles className="animate-pulse text-amber-500 mb-2" size={24} />
                AI ULEPSZA ZDJĘCIE...
            </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
            <Sliders size={12} /> Post-produkcja & AI Edit
          </p>
          <div className="flex items-center gap-3">
              <button 
                  onClick={() => handleMagicEnhance(imgKey)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black hover:bg-amber-200 transition-all shadow-sm"
              >
                  <Sparkles size={10} /> MAGIC ENHANCE
              </button>
              <button 
                onClick={() => { setBrightness(100); setContrast(100); setSaturate(100); setTemp(0); setSharpness(0); }}
                className="text-[9px] font-bold text-stone-400 hover:text-stone-900 border-l border-stone-200 pl-3"
              >
                Reset
              </button>
          </div>
        </div>

        {/* Lightroom Sliders */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-stone-500">
              <span className="flex items-center gap-1"><Sun size={10} /> Jasność</span>
              <span>{brightness}%</span>
            </div>
            <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-stone-500">
              <span className="flex items-center gap-1"><Contrast size={10} /> Kontrast</span>
              <span>{contrast}%</span>
            </div>
            <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-stone-500">
              <span className="flex items-center gap-1"><Palette size={10} /> Nasycenie</span>
              <span>{saturate}%</span>
            </div>
            <input type="range" min="0" max="200" value={saturate} onChange={(e) => setSaturate(Number(e.target.value))} className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-stone-500">
              <span className="flex items-center gap-1"><Thermometer size={10} /> Balans bieli</span>
              <span>{temp}°</span>
            </div>
            <input type="range" min="-30" max="30" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
          </div>
          <div className="space-y-1 col-span-2 pt-1">
            <div className="flex justify-between text-[9px] font-bold text-stone-500">
              <span className="flex items-center gap-1"><Search size={10} /> Wyostrzenie (Sharpness)</span>
              <span>{sharpness}%</span>
            </div>
            <input type="range" min="0" max="40" value={sharpness} onChange={(e) => setSharpness(Number(e.target.value))} className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
          </div>
        </div>

        {/* AI Prompt Edit */}
        <div className="pt-3 border-t border-stone-200">
            <div className="relative">
                <input 
                    type="text" 
                    value={aiEditPrompt}
                    onChange={(e) => setAiEditPrompt(e.target.value)}
                    placeholder="Wpisz np. 'Zmień na oświetlenie nocne', 'Dodaj kwiaty na komodzie'..."
                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-[11px] focus:border-stone-900 outline-none transition-all shadow-inner"
                />
                <button 
                    onClick={() => handleAIEdit(imgKey)}
                    disabled={isEditingAI || !aiEditPrompt}
                    className="absolute right-1.5 top-1.5 p-1 bg-stone-900 text-white rounded-lg hover:bg-black transition-all disabled:opacity-30 disabled:scale-95"
                >
                    {isEditingAI ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                </button>
            </div>
            <p className="text-[8px] text-stone-400 mt-1 italic flex items-center gap-1">
                <Sparkles size={8} /> AI wygeneruje nową wersję tego zdjęcia zachowując Twój produkt.
            </p>
        </div>
      </div>
    );
  };

  const placementKey = `placement_${selectedPlacement}`;
  const selectedPlacementObj = PLACEMENTS.find(p => p.id === selectedPlacement)!;

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-stone-200 space-y-8 animate-fade-in group hover:shadow-xl transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif font-bold flex items-center gap-3">
          <Camera className="text-amber-500" /> Studio Mockupów 4K
        </h3>
        <div className="flex items-center gap-2">
          {selectedInspiration && (
            <div className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-black uppercase tracking-wider">
              <Heart size={10} className="fill-amber-500" /> {selectedInspiration.name}
            </div>
          )}
          <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wider ${photoScore >= 7 ? 'bg-green-100 text-green-700' :
            photoScore >= 4 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
            Jakość Bazy: {photoScore}/10
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-2xl flex items-center gap-2 animate-shake">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ===== INSPIRATION PICKER (inline) ===== */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
        <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Heart size={12} className="text-amber-500 fill-amber-500" /> Styl & Atmosfera wnętrza
        </p>
        <div className="flex gap-3 flex-wrap">
          {/* Domyślny – brak inspiracji */}
          <button
            onClick={() => onSelectInspiration?.(null)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${!selectedInspiration
              ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20'
              : 'border-stone-200 bg-white text-stone-400 hover:border-amber-200'
              }`}
          >
            ✨ Japandi (Standard)
          </button>

          {/* Miniatury inspiracji */}
          {inspirations.map(item => (
            <button
              key={item.id}
              onClick={() => onSelectInspiration?.(selectedInspiration?.id === item.id ? null : item)}
              title={`${item.name}: ${item.style}`}
              className={`relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedInspiration?.id === item.id
                ? 'border-amber-500 shadow-lg shadow-amber-500/20 scale-105'
                : 'border-stone-200 hover:border-amber-300 hover:scale-105'
                }`}
              style={{ width: 68, height: 52 }}
            >
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              {selectedInspiration?.id === item.id && (
                <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center backdrop-blur-[1px]">
                  <CheckCircle2 size={16} className="text-white" />
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
          <div className="mt-2.5 border-t border-stone-100 pt-2 space-y-1">
            <p className="text-[9px] text-stone-400 italic flex items-center gap-1">
              <span className="text-amber-600 font-bold not-italic">Styl AI:</span> {selectedInspiration.style}
            </p>
            {selectedInspiration.type === 'with_product' && (
              <div className="bg-stone-50 text-amber-700 text-[10px] font-bold px-2 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1.5 animate-pulse">
                <Sparkles size={10} /> TRYB PODMIANY: AI precyzyjnie usunie stary produkt i wstawi Twój.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== PRODUCT CONTEXT (What is it?) ===== */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4">
        <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Sparkles size={12} className="text-amber-500" /> Co AI widzi na zdjęciu?
        </p>
        <input
          type="text"
          value={productContext}
          onChange={(e) => setProductContext(e.target.value)}
          placeholder="np. Handwoven Abstract Wool Tapestry 'Ocean Breeze'"
          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:border-amber-400 focus:bg-white transition-all outline-none"
        />
        <p className="text-[9px] text-stone-400 mt-2">Im dokładniejsza nazwa, tym lepiej AI 'zrozumie' zdjęcie gobelinu.</p>
      </div>

      {/* ===== RATIO, SIZE & PLACEMENT (Visible only in non-replacement mode) ===== */}
      {!isReplacementMode ? (
        <>
          {/* ===== RATIO & SIZE PICKER ===== */}
          <div className="grid grid-cols-2 gap-4">
            {/* Proporcje */}
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-4">📐 Kształt</p>
              <div className="flex gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRatio(r.id)}
                    className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all ${selectedRatio === r.id
                      ? 'border-amber-500 bg-white text-stone-900 shadow-sm'
                      : 'border-stone-100 bg-white/50 text-stone-400 hover:border-amber-200'
                      }`}
                  >
                    <span className="text-sm font-bold">{r.icon}</span>
                    <span className="text-[9px] uppercase font-black">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rozmiar */}
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-4">📏 Skala</p>
              <div className="flex gap-1.5 transition-all">
                {SIZES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.id)}
                    className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] transition-all ${selectedSize === s.id
                      ? 'border-amber-500 bg-white text-stone-900 shadow-sm'
                      : 'border-stone-100 bg-white/50 text-stone-400 hover:border-amber-200'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== PLACEMENT PICKER ===== */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              📍 Miejsce Akcji
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
              onClick={() => {
                const currentPlacement = PLACEMENTS.find(p => p.id === selectedPlacement);
                handleGenerate(
                  currentPlacement?.desc || 'on the wall',
                  placementKey
                );
              }}
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
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-stone-200 shadow-sm mb-2 relative">
                  <img
                    src={generatedImages[placementKey]}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{ 
                        filter: `brightness(${brightness + (sharpness/4)}%) 
                                 contrast(${contrast + sharpness}%) 
                                 saturate(${saturate}%) 
                                 hue-rotate(${temp}deg)` 
                    }}
                    alt="Generated mockup"
                  />
                  {(brightness !== 100 || contrast !== 100 || saturate !== 100 || temp !== 0) && (
                    <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[8px] px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                        <Sliders size={8} /> Filters active
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadImage(generatedImages[placementKey], `mockup-${selectedPlacement}.png`)}
                    className="flex-1 text-[10px] text-stone-600 font-bold border border-stone-200 bg-white py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-stone-50"
                  >
                    <Download size={12} /> Pobierz
                  </button>
                  <button
                    onClick={() => {
                      onAddImage?.(generatedImages[placementKey]);
                      setAddedToGallery(prev => new Set(prev).add(placementKey));
                    }}
                    disabled={addedToGallery.has(placementKey)}
                    className={`flex-1 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${addedToGallery.has(placementKey)
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-amber-500 text-stone-900 hover:bg-amber-600'
                      }`}
                  >
                    {addedToGallery.has(placementKey) ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                    {addedToGallery.has(placementKey) ? 'W galerii' : 'Dodaj do listingu'}
                  </button>
                </div>
                {renderEditor(placementKey)}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ===== REPLACEMENT MODE BUTTON (Minimalist) ===== */
        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 text-amber-500">
            <RefreshCw size={32} />
          </div>
          <h4 className="text-lg font-bold text-stone-900 font-serif">Tryb Podmiany Aktywny</h4>
          <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
            AI automatycznie wykryje gobelin na wybranym zdjęciu inspiracji i podmieni go na Twój produkt, zachowując oryginalną skalę i miejsce.
          </p>
          <button
            onClick={() => handleGenerate('exact 1:1 replacement in the original scene spot', 'replacement_mode')}
            disabled={generatingFor === 'replacement_mode'}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-stone-900 text-sm font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {generatingFor === 'replacement_mode' ? (
              <><Loader2 className="animate-spin" /> PRACUJĘ NAD PODMIANĄ...</>
            ) : (
              <><Sparkles /> Podmień Produkt w Scenie</>
            )}
          </button>

          {generatedImages['replacement_mode'] && (
            <div className="mt-6 animate-fade-in text-left">
              <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-amber-200 shadow-xl mb-4 group/img relative">
                <img
                  src={generatedImages['replacement_mode']}
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{ 
                    filter: `brightness(${brightness + (sharpness/4)}%) 
                             contrast(${contrast + sharpness}%) 
                             saturate(${saturate}%) 
                             hue-rotate(${temp}deg)` 
                  }}
                  alt="Generated replacement mockup"
                />
                <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <CheckCircle2 size={12} /> GOTOWE
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => downloadImage(generatedImages['replacement_mode'], `mockup-replaced.png`)}
                  className="flex-1 text-xs font-bold border border-stone-200 bg-white text-stone-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-50 transition-all"
                >
                  <Download size={14} /> Pobierz 4K
                </button>
                <button
                  onClick={() => {
                    onAddImage?.(generatedImages['replacement_mode']);
                    setAddedToGallery(prev => new Set(prev).add('replacement_mode'));
                  }}
                  disabled={addedToGallery.has('replacement_mode')}
                  className={`flex-1 text-xs font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${addedToGallery.has('replacement_mode')
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-stone-900 text-white hover:bg-black'
                    }`}
                >
                  {addedToGallery.has('replacement_mode') ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                  {addedToGallery.has('replacement_mode') ? 'W galerii' : 'DODAJ DO ETY'}
                </button>
              </div>
              {renderEditor('replacement_mode')}
            </div>
          )}
        </div>
      )}

      {/* ===== AI SUGGESTIONS ===== */}
      {photoSuggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} className="text-amber-500" /> Sugestie Eksperta AI:
          </p>
          <div className="space-y-3">
            {photoSuggestions.map((suggestion, i) => {
              const key = `suggestion_${i}`;
              return (
                <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 group/sug transition-all hover:bg-white hover:shadow-md">
                  <div className="flex items-start gap-3 text-[10px] text-stone-600 mb-4 font-medium leading-relaxed italic">
                    <Sparkles size={14} className="text-amber-500 mt-0.5 flex-shrink-0 opacity-50 group-hover/sug:opacity-100" />
                    <span>{suggestion}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleGenerate(
                        `${suggestion}${selectedInspiration ? `. Interior style: ${selectedInspiration.style}` : ''}`,
                        key,
                        true // Force new scene for suggestions to avoid conflicts with selected inspiration
                      )}
                      disabled={generatingFor === key}
                      className="text-[10px] bg-stone-900 hover:bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-black uppercase tracking-wider shadow-sm disabled:bg-stone-200 disabled:text-stone-400"
                    >
                      {generatingFor === key ? (
                        <><Loader2 className="animate-spin" size={12} /> TRWA GENEROWANIE...</>
                      ) : (
                        <><Wand2 size={12} className="text-amber-500" /> Generuj to ujęcie</>
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
                    <div className="mt-2 space-y-3">
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-stone-200 shadow-sm relative">
                        <img
                          src={generatedImages[key]}
                          className="w-full h-full object-cover transition-all duration-300"
                          style={{ 
                            filter: `brightness(${brightness + (sharpness/4)}%) 
                                     contrast(${contrast + sharpness}%) 
                                     saturate(${saturate}%) 
                                     hue-rotate(${temp}deg)` 
                          }}
                          alt={`Mockup ${i + 1}`}
                        />
                      </div>
                      {renderEditor(key)}
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
