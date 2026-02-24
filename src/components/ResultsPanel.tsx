// ============================================
// RESULTS PANEL COMPONENT
// All generated content display
// ============================================

import React, { useState, useEffect } from 'react';
import {
  BarChart3, FileText, Eye, Sparkles, Save, Plus,
  RefreshCw, CheckCircle2
} from 'lucide-react';
import type { FormData, GeneratedContent, HistoryItem, SeoAnalysis } from '../types';
import { SeoScore } from './SeoScore';
import { TitleBuilder } from './TitleBuilder';
import { TagsEditor } from './TagsEditor';
import { EtsyPreview } from './EtsyPreview';
import { MockupGenerator } from './MockupGenerator';
import { useAI } from '../hooks/useAI';
import { useClipboard } from '../hooks/useClipboard';
import { buildReanalysisPrompt } from '../config/prompts';

import type { InspirationItem } from '../hooks/useInspirations';

interface ResultsPanelProps {
  result: GeneratedContent;
  onResultChange: (result: GeneratedContent) => void;
  formData: FormData;
  seoAnalysis: SeoAnalysis;
  powerKeywords: string[];
  onSave: () => void;
  onNew: () => void;
  selectedInspiration?: InspirationItem | null;
  inspirations?: InspirationItem[];
  onSelectInspiration?: (item: InspirationItem | null) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  onResultChange,
  formData,
  seoAnalysis,
  powerKeywords,
  onSave,
  onNew,
  selectedInspiration,
  inspirations,
  onSelectInspiration,
}) => {
  const [titleParts, setTitleParts] = useState(result.titleSegments || {
    hooks: '', features: '', vibe: '', name: ''
  });
  const { copy, isCopied } = useClipboard();
  const { reanalyze, isLoading: isReanalyzing } = useAI();

  // Sync title parts with result
  useEffect(() => {
    if (result.titleSegments) {
      setTitleParts(result.titleSegments);
    }
  }, [result.titleSegments]);

  // Reconstruct title from parts
  useEffect(() => {
    const parts = [titleParts.hooks, titleParts.features, titleParts.vibe, titleParts.name]
      .filter(p => p.trim());
    const newTitle = parts.join(' | ');

    if (newTitle !== result.title) {
      onResultChange({ ...result, title: newTitle });
    }
  }, [titleParts, result.title, onResultChange]);

  const handleReanalysis = async () => {
    try {
      const prompt = buildReanalysisPrompt(result.title, result.tags, result.description);
      const jsonText = await reanalyze(prompt);

      const parsed = JSON.parse(jsonText);
      onResultChange({
        ...result,
        marketAnalysis: parsed.marketAnalysis,
        keywordStrategy: parsed.keywordStrategy
      });
    } catch (err) {
      console.error('Reanalysis error:', err);
      alert('Błąd analizy. Spróbuj ponownie.');
    }
  };

  const handleCopyTitle = () => {
    copy(result.title, 'title');
  };

  const handleCopyDescription = () => {
    copy(result.description, 'desc');
  };

  const handleCopyTags = () => {
    copy(result.tags.join(', '), 'tags');
  };

  const handleCopyAltText = () => {
    if (result.altText) {
      copy(result.altText, 'alt');
    }
  };

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <SeoScore analysis={seoAnalysis} />

      {/* Mockup Generator */}
      <MockupGenerator
        formData={formData}
        generationMode="replace"
        referenceBg={null}
        photoScore={result.photoScore}
        photoSuggestions={result.photoSuggestions}
        selectedInspiration={selectedInspiration}
        inspirations={inspirations}
        onSelectInspiration={onSelectInspiration}
      />

      {/* Etsy Preview */}
      <EtsyPreview
        title={result.title}
        mainImage={formData.images[0]}
      />

      {/* Title Builder */}
      <TitleBuilder
        title={result.title}
        segments={titleParts}
        onSegmentsChange={setTitleParts}
        onCopy={handleCopyTitle}
      />

      {/* Alt Text */}
      {result.altText && (
        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wide flex items-center gap-2">
              <Eye size={12} /> Alt Text (dla SEO)
            </h3>
            <button
              onClick={handleCopyAltText}
              className={`text-xs font-bold transition-colors ${isCopied('alt') ? 'text-green-600' : 'text-amber-600 hover:underline'
                }`}
            >
              {isCopied('alt') ? 'Skopiowano!' : 'Kopiuj'}
            </button>
          </div>
          <p className="text-sm text-stone-700 font-mono bg-white p-3 rounded border border-stone-100 italic">
            &quot;{result.altText}&quot;
          </p>
        </div>
      )}

      {/* Market Analysis */}
      <div className="bg-indigo-900 text-indigo-100 p-6 rounded-xl shadow-lg border border-indigo-700 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-serif flex items-center gap-2">
            <BarChart3 className="text-indigo-400" />
            Analiza Rynkowa
          </h3>
          <button
            onClick={handleReanalysis}
            disabled={isReanalyzing}
            className="bg-white text-indigo-900 px-3 py-1 rounded text-xs font-bold hover:bg-indigo-50 disabled:opacity-50"
          >
            {isReanalyzing ? 'Analizowanie...' : 'Sprawdź zmiany'}
          </button>
        </div>
        <div className="prose prose-invert prose-sm max-w-none font-mono text-xs whitespace-pre-wrap text-indigo-200">
          {result.marketAnalysis}
        </div>
        {result.keywordStrategy && (
          <div className="mt-4 pt-4 border-t border-indigo-700">
            <h4 className="text-xs font-bold uppercase text-indigo-300 mb-2">Strategia słów kluczowych:</h4>
            <p className="text-xs text-indigo-200 whitespace-pre-wrap">{result.keywordStrategy}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase text-stone-500">Opis</h3>
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-1 rounded ${result.description.length >= 1000
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
              }`}>
              {result.description.length} znaków
            </span>
            <button
              onClick={handleCopyDescription}
              className={`text-xs px-3 py-1 rounded font-bold transition-colors ${isCopied('desc')
                ? 'bg-green-100 text-green-700'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
            >
              {isCopied('desc') ? 'Skopiowano!' : 'KOPIUJ'}
            </button>
          </div>
        </div>
        <textarea
          className="w-full text-stone-600 text-sm bg-stone-50 p-4 rounded border border-stone-100 min-h-[400px] font-mono whitespace-pre-wrap resize-y"
          value={result.description}
          onChange={(e) => onResultChange({ ...result, description: e.target.value })}
        />
      </div>

      {/* Tags */}
      <TagsEditor
        result={result}
        onResultChange={onResultChange}
        powerKeywords={powerKeywords}
      />

      {/* Colors */}
      {result.colors && result.colors.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h3 className="text-sm font-bold uppercase text-stone-500 mb-3">Wykryte kolory</h3>
          <div className="flex flex-wrap gap-2">
            {result.colors.map((color, i) => (
              <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                {color}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onSave}
          className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={18} /> Zapisz w historii
        </button>
        <button
          onClick={onNew}
          className="flex-1 py-4 bg-white border-2 border-stone-300 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-colors"
        >
          <Plus size={18} className="inline mr-2" /> Nowy produkt
        </button>
      </div>
    </div>
  );
};
