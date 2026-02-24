// ============================================
// TITLE BUILDER COMPONENT
// Editable title segments
// ============================================

import React from 'react';
import { Settings, Copy } from 'lucide-react';
import type { TitleSegments } from '../types';
import { SEO_REQUIREMENTS } from '../config/constants';

interface TitleBuilderProps {
  title: string;
  segments: TitleSegments;
  onSegmentsChange: (segments: TitleSegments) => void;
  onCopy: () => void;
}

export const TitleBuilder: React.FC<TitleBuilderProps> = ({
  title,
  segments,
  onSegmentsChange,
  onCopy
}) => {
  const titleLength = title.length;
  const isOptimalLength = titleLength >= SEO_REQUIREMENTS.TITLE_MIN_LENGTH && 
                         titleLength <= SEO_REQUIREMENTS.TITLE_MAX_LENGTH;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-amber-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase text-stone-500 tracking-wide flex items-center gap-2">
          <Settings size={16} /> Konstruktor Tytułu
        </h3>
        <button
          onClick={onCopy}
          className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 
                   rounded-full hover:bg-stone-200 transition-colors"
        >
          KOPIUJ CAŁOŚĆ
        </button>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] font-bold uppercase text-amber-600 mb-1">
            1. Haczyki (Hook)
          </label>
          <input
            type="text"
            value={segments.hooks}
            onChange={(e) => onSegmentsChange({ ...segments, hooks: e.target.value })}
            placeholder="np. Woven Wall Art"
            className="w-full p-2 bg-amber-50 border border-amber-200 rounded text-sm font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
            2. Cechy (Features)
          </label>
          <input
            type="text"
            value={segments.features}
            onChange={(e) => onSegmentsChange({ ...segments, features: e.target.value })}
            placeholder="np. Handmade Tapestry"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
            3. Styl (Vibe)
          </label>
          <input
            type="text"
            value={segments.vibe}
            onChange={(e) => onSegmentsChange({ ...segments, vibe: e.target.value })}
            placeholder="np. Boho Decor"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
            4. Nazwa (Name)
          </label>
          <input
            type="text"
            value={segments.name}
            onChange={(e) => onSegmentsChange({ ...segments, name: e.target.value })}
            placeholder="np. Whispering Forest"
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-sm"
          />
        </div>
      </div>

      {/* Final Title */}
      <div className="relative">
        <textarea
          className="w-full text-stone-800 font-serif font-medium text-xl bg-transparent 
                   border-none resize-none min-h-[60px] focus:outline-none"
          value={title}
          readOnly
        />
        <div className={`text-right text-xs font-bold ${
          isOptimalLength ? 'text-green-600' : 'text-red-500'
        }`}>
          {titleLength} / {SEO_REQUIREMENTS.TITLE_MAX_LENGTH}
          {!isOptimalLength && (
            <span className="ml-2">
              (powinno być {SEO_REQUIREMENTS.TITLE_MIN_LENGTH}-{SEO_REQUIREMENTS.TITLE_MAX_LENGTH})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
