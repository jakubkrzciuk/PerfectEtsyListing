// ============================================
// RESULTS PANEL COMPONENT
// Premium layout for 2026 Studio Experience
// ============================================

import React, { useState } from 'react';
import {
  BarChart3, FileText, Eye, Sparkles, Save, Plus,
  RefreshCw, CheckCircle2, Image as ImageIcon, Video, MessageSquare, Tags, Search, Share2
} from 'lucide-react';
import type { FormData, GeneratedContent, HistoryItem, SeoAnalysis } from '../types';
import { SeoScore } from './SeoScore';
import { TitleBuilder } from './TitleBuilder';
import { TagsEditor } from './TagsEditor';
import { EtsyPreview } from './EtsyPreview';
import { MockupGenerator } from './MockupGenerator';
import { VideoGenerator } from './VideoGenerator';
import { MarketingStudio } from './MarketingStudio';
import { PerformancePredictor } from './PerformancePredictor';
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
  onAddImage: (img: string) => void;
  isSaving: boolean;
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
  onAddImage,
  isSaving,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visuals' | 'social' | 'listing' | 'analyze' | 'market'>('visuals');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const { generateListing } = useAI();
  const { copy } = useClipboard();

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      const prompt = buildReanalysisPrompt(result.title, result.tags, result.description);
      const newListingJson = await generateListing(prompt, [], formData.name);
      const newListing: GeneratedContent = JSON.parse(newListingJson);
      onResultChange(newListing);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner: SEO Score & Quick Actions */}
      <div className="bg-white rounded-[32px] p-2 pr-6 border border-stone-200/60 shadow-sm flex items-center justify-between gap-4">
        <div className="flex-1">
          <SeoScore analysis={seoAnalysis} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNew}
            className="p-3 bg-stone-100 text-stone-900 rounded-2xl hover:bg-stone-200 transition-all font-bold text-sm flex items-center gap-2"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Nowy Projekt</span>
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="p-3 bg-amber-500 text-stone-900 rounded-2xl hover:bg-amber-600 transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Zapisywanie...' : 'Zapisz Projekt'}</span>
          </button>
        </div>
      </div>

      {/* Results Sub-Tabs */}
      <div className="flex p-1.5 bg-stone-200/50 rounded-[22px] w-fit mx-auto lg:mx-0">
        <button
          onClick={() => setActiveSubTab('visuals')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeSubTab === 'visuals' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
        >
          <ImageIcon size={18} /> Studio Wizualne
        </button>
        <button
          onClick={() => setActiveSubTab('social')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeSubTab === 'social' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
        >
          <Share2 size={18} /> Social Media
        </button>
        <button
          onClick={() => setActiveSubTab('listing')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeSubTab === 'listing' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
        >
          <FileText size={18} /> Gotowy Listing
        </button>
        <button
          onClick={() => setActiveSubTab('analyze')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeSubTab === 'analyze' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
        >
          <Search size={18} /> Warsztat Copywritingu
        </button>
        <button
          onClick={() => setActiveSubTab('market')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeSubTab === 'market' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
        >
          <BarChart3 size={18} /> Prognoza Sukcesu
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-8">
        {activeSubTab === 'visuals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in">
            <div className="space-y-6">
              <MockupGenerator
                formData={formData}
                generationMode="replace"
                referenceBg={null}
                photoScore={result.photoScore}
                photoSuggestions={result.photoSuggestions}
                selectedInspiration={selectedInspiration}
                inspirations={inspirations}
                onSelectInspiration={onSelectInspiration}
                onAddImage={onAddImage}
              />
            </div>
            <div className="space-y-6">
              <VideoGenerator 
                formData={formData} 
                onAddVideo={(video) => onAddImage(video)} 
              />

              <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-stone-700 text-sm mb-4">
                  <MessageSquare size={16} className="text-amber-500" /> AI Alt Text (SEO Zdjęć)
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed mb-4 bg-stone-50 p-4 rounded-xl border border-stone-100 italic">
                  "{result.altText || "Alt text description is missing... Generuj mockup, aby uzyskać opis."}"
                </p>
                <button
                  onClick={() => copy(result.altText || '', 'alt')}
                  className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                >
                  Kopiuj Alt Text
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'social' && (
          <div className="animate-fade-in">
            <MarketingStudio
              mainImage={formData.images[0]}
              productName={formData.name || 'Handwoven Tapestry'}
            />
          </div>
        )}

        {activeSubTab === 'listing' && (
          <div className="animate-fade-in space-y-8">
            <EtsyPreview
              title={result.title}
              description={result.description}
              tags={result.tags}
              images={formData.images}
              shop={formData.shop}
            />
          </div>
        )}

        {activeSubTab === 'analyze' && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="premium-card p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-xl font-bold text-stone-900 font-serif">Konstruktor Tytułu</h4>
                    <p className="text-sm text-stone-500">Złóż perfekcyjny tytuł z bloków słów kluczowych</p>
                  </div>
                  <button onClick={handleReanalyze} disabled={isReanalyzing} className="p-2.5 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all">
                    {isReanalyzing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  </button>
                </div>
                <TitleBuilder result={result} onUpdate={onResultChange} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="premium-card p-8">
                  <h4 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <Tags size={20} className="text-amber-500" /> Słowa Kluczowe (Meta)
                  </h4>
                  <TagsEditor
                    tags={result.tags}
                    powerKeywords={powerKeywords}
                    onUpdate={(newTags) => onResultChange({ ...result, tags: newTags })}
                  />
                </div>

                <div className="premium-card p-8">
                  <h4 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-amber-500" /> Pełny Opis Produktu
                  </h4>
                  <div className="max-h-[500px] overflow-y-auto pr-4 text-stone-600 text-sm leading-relaxed whitespace-pre-wrap select-all font-mono bg-stone-50 p-6 rounded-2xl border border-stone-100">
                    {result.description}
                  </div>
                  <button
                    onClick={() => copy(result.description, 'description')}
                    className="w-full mt-4 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3"
                  >
                    Kopiuj Opis do Etsy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeSubTab === 'market' && (
          <PerformancePredictor result={result} seoAnalysis={seoAnalysis} />
        )}
      </div>
    </div>
  );
};
