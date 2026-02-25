// ============================================
// TITLE BUILDER COMPONENT
// Editable title segments for Studio Experience
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { Settings, Copy, CheckCircle2, SlidersHorizontal, Eye, MessageSquare } from 'lucide-react';
import type { GeneratedContent, TitleSegments } from '../types';
import { SEO_REQUIREMENTS } from '../config/constants';
import { useClipboard } from '../hooks/useClipboard';

interface TitleBuilderProps {
  result: GeneratedContent;
  onUpdate: (updatedResult: GeneratedContent) => void;
}

type Separator = ' | ' | ' - ' | ' , ' | ' / ';

export const TitleBuilder: React.FC<TitleBuilderProps> = ({
  result,
  onUpdate
}) => {
  const { copy } = useClipboard();
  const [separator, setSeparator] = useState<Separator>(' | ');

  // Local state for segments to allow real-time editing
  const [segments, setSegments] = useState<TitleSegments>(
    result.titleSegments || { hooks: '', features: '', vibe: '', name: '' }
  );

  // Construct final title from segments using selected separator
  const title = useMemo(() => {
    const parts = [segments.hooks, segments.features, segments.vibe, segments.name]
      .filter(part => part && part.trim().length > 0);
    return parts.join(separator);
  }, [segments, separator]);

  // Sync with AI result if it changes externally
  useEffect(() => {
    if (result.titleSegments) {
      setSegments(result.titleSegments);
    }
  }, [result.titleSegments]);

  // Update parent in real-time
  useEffect(() => {
    onUpdate({
      ...result,
      title: title,
      titleSegments: segments
    });
  }, [title, segments]);

  const handleSegmentChange = (key: keyof TitleSegments, value: string) => {
    setSegments(prev => ({ ...prev, [key]: value }));
  };

  const titleLength = title.length;
  const isOptimalLength = titleLength >= SEO_REQUIREMENTS.TITLE_MIN_LENGTH &&
    titleLength <= SEO_REQUIREMENTS.TITLE_MAX_LENGTH;

  const separators: Separator[] = [' | ', ' - ', ' , ', ' / '];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      {/* Left: Input Controls (3 columns) */}
      <div className="xl:col-span-3 space-y-8">
        <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-200 w-fit">
          <label className="text-[10px] font-black uppercase text-stone-400 flex items-center gap-1.5 ml-2">
            <SlidersHorizontal size={12} /> Separator:
          </label>
          <div className="flex gap-1">
            {separators.map((sep) => (
              <button
                key={sep}
                onClick={() => setSeparator(sep)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${separator === sep
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
                  }`}
              >
                {sep === ' , ' ? ',' : sep.trim() || '|'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[8px]">1</span>
              Haczyki (Power Keywords)
            </label>
            <input
              type="text"
              value={segments.hooks}
              onChange={(e) => handleSegmentChange('hooks', e.target.value)}
              placeholder="np. Boho Wall Art, Large Tapestry"
              className="w-full p-4 bg-amber-50/30 border border-amber-100 rounded-2xl text-xs font-bold focus:border-amber-400 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-[8px]">2</span>
              Cechy (Features)
            </label>
            <input
              type="text"
              value={segments.features}
              onChange={(e) => handleSegmentChange('features', e.target.value)}
              placeholder="np. Handwoven Cotton Decor"
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl text-xs focus:border-amber-400 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-[8px]">3</span>
              Styl (Vibe)
            </label>
            <input
              type="text"
              value={segments.vibe}
              onChange={(e) => handleSegmentChange('vibe', e.target.value)}
              placeholder="np. Modern Japandi Interior"
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl text-xs focus:border-amber-400 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-[8px]">4</span>
              Nazwa Projektu (Name)
            </label>
            <input
              type="text"
              value={segments.name}
              onChange={(e) => handleSegmentChange('name', e.target.value)}
              placeholder="np. Golden Horizon"
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl text-xs focus:border-amber-400 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right: Live Preview (2 columns) */}
      <div className="xl:col-span-2 space-y-6">
        <div className="premium-card p-6 bg-stone-900 text-white min-h-full flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Eye size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Live Etsy Preview</span>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${isOptimalLength ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {titleLength} / {SEO_REQUIREMENTS.TITLE_MAX_LENGTH}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-serif leading-relaxed text-stone-100 selection:bg-amber-500">
                {title || 'Zacznij wpisywać segmenty tytułu...'}
              </h4>

              {!isOptimalLength && (
                <div className="flex items-start gap-2 text-[10px] text-amber-200/60 leading-tight">
                  <span className="mt-0.5 whitespace-nowrap">⚠️ Celuj w:</span>
                  <span>{SEO_REQUIREMENTS.TITLE_MIN_LENGTH}-{SEO_REQUIREMENTS.TITLE_MAX_LENGTH} znaków dla maksymalnego zasięgu.</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => copy(title, 'title')}
            className="mt-8 relative z-10 w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 group"
          >
            <Copy size={16} className="group-hover:scale-110 transition-transform" />
            KOPIUJ GOTOWY TYTUŁ
          </button>
        </div>
      </div>
    </div>
  );
};
