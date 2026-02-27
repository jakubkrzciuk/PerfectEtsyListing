// ============================================
// MAIN APP COMPONENT
// Lale Studio - Etsy SEO Expert & Mockup Generator
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Database, RefreshCw, Settings, Info, Layers,
  Wand2, Trash2, Plus, CheckCircle2, Circle, LogOut, User, Heart, Layout, History, Image as ImageIcon, Share2
} from 'lucide-react';
import type {
  FormData,
  GeneratedContent,
  HistoryItem,
  PlatformStatus,
  SeoAnalysis,
  GenerationMode
} from './types';
import {
  ProductForm,
  ResultsPanel,
  MockupGenerator
} from './components';
import { LoginPage } from './components/LoginPage';
import { InspirationsTab } from './components/InspirationsTab';
import { SocialStudioTab } from './components/SocialStudioTab';
import {
  useAI,
  useKeywordsStorage,
  useClipboard
} from './hooks';
import { useAuth } from './hooks/useAuth';
import { useDatabase } from './hooks/useDatabase';
import { useInspirations } from './hooks/useInspirations';
import type { InspirationItem } from './hooks/useInspirations';
import {
  processImagesForAI,
  analyzeSeo,
  formatSizesBlock,
  formatLinksBlock,
  getRandomKeywords
} from './utils';
import {
  buildListingSystemPrompt,
  DEFAULT_KEYWORDS,
  AI_MODELS
} from './config';

// ============================================
// INITIAL STATE
// ============================================

const initialFormData: FormData = {
  images: [],
  shop: 'LaleStudio',
  mounting: 'Bambus',
  name: '',
  type: 'Standardowy Gobelin',
  widthCm: '',
  heightCm: '',
  material: '100% Natural Wool',
  colors: '',
  additionalSizes: [],
  similarLinks: [],
  userHints: '',
};

const App: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'generator' | 'database' | 'inspiracje' | 'social'>('generator');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('replace');
  const [referenceBg, setReferenceBg] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);

  const { value: powerKeywords } = useKeywordsStorage(DEFAULT_KEYWORDS);
  const { items: savedItems, addItem, removeItem } = useDatabase(user?.id);
  const { items: inspirations, loading: inspirationsLoading, addInspiration, removeInspiration } = useInspirations(user?.id);
  const [selectedInspiration, setSelectedInspiration] = useState<InspirationItem | null>(null);

  const { generateListing, getPhotoSuggestions, isLoading: isGenerating, error: aiError, clearError } = useAI();
  const [isSaving, setIsSaving] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState(false);

  // Quick visual analysis on first image upload
  useEffect(() => {
    const triggerQuickAnalysis = async () => {
      if (formData.images.length === 1 && quickSuggestions.length === 0 && !isQuickAnalyzing) {
        setIsQuickAnalyzing(true);
        try {
          const processed = await processImagesForAI([formData.images[0]]);
          const suggestions = await getPhotoSuggestions(processed[0]);
          setQuickSuggestions(suggestions);
        } catch (err) {
          console.error('Quick analysis failed', err);
        } finally {
          setIsQuickAnalyzing(false);
        }
      } else if (formData.images.length === 0) {
        setQuickSuggestions([]);
      }
    };
    triggerQuickAnalysis();
  }, [formData.images, getPhotoSuggestions, quickSuggestions.length, isQuickAnalyzing]);

  if (authLoading) return null;
  if (!user) return <LoginPage onSignIn={signIn} onSignUp={signUp} />;

  const handleGenerate = async () => {
    try {
      const processedImages = await processImagesForAI(formData.images);
      const sizesBlock = formatSizesBlock(formData.widthCm, formData.heightCm, formData.additionalSizes);
      const linksBlock = formatLinksBlock(formData.similarLinks);
      const systemPrompt = buildListingSystemPrompt(formData, powerKeywords, sizesBlock, linksBlock);
      const listingJson = await generateListing(systemPrompt, processedImages, formData.name);
      const listing: GeneratedContent = JSON.parse(listingJson);

      const analysis = analyzeSeo(listing, formData.name, powerKeywords);
      setResult(listing);
      setSeoAnalysis(analysis);

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    const { images: _images, ...formDataWithoutImages } = formData;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      name: formData.name || 'Bez nazwy',
      title: result.title,
      titleSegments: result.titleSegments,
      description: result.description,
      tags: result.tags,
      altText: result.altText || '',
      thumbnails: formData.images.slice(0, 20),
      date: new Date().toLocaleDateString('pl-PL'),
      platforms: { etsyLale: true, etsyShopniki: false, shopify: false, wescover: false },
      formData: formDataWithoutImages,
    };
    try {
      setIsSaving(true);
      await addItem(newItem);
      alert('Listing zapisany pomyślnie!');
    } catch (err) {
      alert('Błąd podczas zapisywania: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    const loadedResult: GeneratedContent = {
      title: item.title,
      titleSegments: item.titleSegments,
      description: item.description || '',
      tags: item.tags,
      altText: item.altText || '',
      colors: item.colors || [],
      marketAnalysis: item.marketAnalysis || '',
      keywordStrategy: item.keywordStrategy || '',
      visualStyle: item.visualStyle || '',
      visualDescription: item.visualDescription || '',
      photoScore: item.photoScore || 8,
      photoType: item.photoType || '',
      photoCritique: item.photoCritique || '',
      photoSuggestions: item.photoSuggestions || []
    };
    setResult(loadedResult);
    if (item.formData) {
      setFormData({ ...item.formData, images: item.thumbnails || [] });
    }
    const analysis = analyzeSeo(loadedResult, item.name, powerKeywords);
    setSeoAnalysis(analysis);
    setActiveTab('generator');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f7f4]">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-stone-900 text-white hidden md:flex flex-col p-4 fixed h-full z-30 transition-all duration-300">
        <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <span className="font-bold text-xl italic">L</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold tracking-tight">LALE STUDIO</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest leading-none">AI Expert 2026</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'generator' ? 'bg-amber-500 text-stone-900 font-bold shadow-lg shadow-amber-500/10' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            <Sparkles size={20} />
            <span className="hidden lg:inline text-sm">Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('inspiracje')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'inspiracje' ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/10' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            <Heart size={20} />
            <span className="hidden lg:inline text-sm flex-1 text-left">Inspiracje</span>
            {selectedInspiration && <span className="hidden lg:block w-2 h-2 bg-white rounded-full animate-pulse"></span>}
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'database' ? 'bg-amber-500 text-stone-900 font-bold shadow-lg shadow-amber-500/10' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            <History size={20} />
            <span className="hidden lg:inline text-sm">Twoje Portfolio</span>
            <span className="hidden lg:inline ml-auto text-[10px] bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded-full">{savedItems?.length || 0}</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'social' ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/10' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            <Share2 size={20} />
            <span className="hidden lg:inline text-sm">Social Studio</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-xs border border-stone-700">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="hidden lg:block text-xs truncate max-w-[120px]">
              <p className="font-bold text-stone-300">Użytkownik</p>
              <p className="text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-stone-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm">
            <LogOut size={20} />
            <span className="hidden lg:inline">Wyloguj</span>
          </button>
        </div>
      </aside>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-stone-900 border-t border-stone-800 flex items-center justify-around px-4 z-50 md:hidden">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'generator' ? 'text-amber-500' : 'text-stone-500'}`}
        >
          <Sparkles size={22} />
          <span className="text-[10px] font-black uppercase">Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'social' ? 'text-rose-500' : 'text-stone-500'}`}
        >
          <Share2 size={22} />
          <span className="text-[10px] font-black uppercase">Social</span>
        </button>
        <button
          onClick={() => setActiveTab('inspiracje')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'inspiracje' ? 'text-rose-400' : 'text-stone-500'}`}
        >
          <Heart size={22} />
          <span className="text-[10px] font-black uppercase">Wnętrza</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'database' ? 'text-white' : 'text-stone-500'}`}
        >
          <History size={22} />
          <span className="text-[10px] font-black uppercase">Portfolio</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="flex-1 ml-0 md:ml-20 lg:ml-64 p-4 sm:p-6 lg:p-10 mb-20 md:mb-0">
        <div className="max-w-full mx-auto">
          {activeTab === 'generator' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-stone-800">Pracownia AI</h2>
                  <p className="text-stone-500">Stwórz perfekcyjny listing Etsy w kilka sekund</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => window.location.reload()} className="p-3 text-stone-400 hover:text-stone-800 transition-colors">
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 pb-20">
                {/* Form Column */}
                <div className="xl:col-span-4">
                  <div className="sticky top-8 space-y-6">
                    <ProductForm
                      formData={formData}
                      onFormDataChange={setFormData}
                      generationMode={generationMode}
                      onGenerationModeChange={setGenerationMode}
                      referenceBg={referenceBg}
                      onReferenceBgChange={setReferenceBg}
                      onSubmit={handleGenerate}
                      isLoading={isGenerating}
                    />

                    {aiError && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Błąd generatora</p>
                          <p className="opacity-80">{aiError}</p>
                          <button onClick={clearError} className="mt-2 font-bold underline">Spróbuj ponownie</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Column */}
                <div className="xl:col-span-8" id="results-section">
                  {result && seoAnalysis ? (
                    <div className="animate-fade-in">
                      <ResultsPanel
                        result={result}
                        onResultChange={setResult}
                        formData={formData}
                        generationMode={generationMode}
                        referenceBg={referenceBg}
                        seoAnalysis={seoAnalysis}
                        powerKeywords={powerKeywords}
                        onSave={handleSave}
                        isSaving={isSaving}
                        onAddImage={(img) => setFormData(prev => ({ ...prev, images: [...prev.images, img] }))}
                        onNew={() => { setResult(null); setFormData(initialFormData); setSelectedInspiration(null); setQuickSuggestions([]); }}
                        selectedInspiration={selectedInspiration}
                        inspirations={inspirations}
                        onSelectInspiration={setSelectedInspiration}
                      />
                    </div>
                  ) : formData.images.length > 0 ? (
                    <div className="space-y-8 animate-fade-in">
                      <div className="bg-white rounded-[40px] p-10 border border-stone-200 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h3 className="text-2xl font-bold text-stone-900 font-serif">Studio Wizualne</h3>
                            <p className="text-stone-500 text-sm">Wygeneruj mockupy 4K dla swojego gobelinu</p>
                          </div>
                          {isQuickAnalyzing && (
                             <div className="flex items-center gap-2 text-amber-600 font-bold text-xs animate-pulse">
                                <RefreshCw className="animate-spin" size={14} /> AI Analizuje Foto...
                             </div>
                          )}
                        </div>
                        
                        <MockupGenerator
                          formData={formData}
                          generationMode={generationMode}
                          referenceBg={referenceBg}
                          photoScore={0}
                          photoSuggestions={quickSuggestions}
                          selectedInspiration={selectedInspiration}
                          inspirations={inspirations}
                          onSelectInspiration={setSelectedInspiration}
                          onAddImage={(img) => setFormData(prev => ({ ...prev, images: [...prev.images, img] }))}
                        />
                      </div>
                      
                      {/* Hint to generate full strategy */}
                      <div className="bg-amber-50 border border-amber-200 p-8 rounded-[32px] text-center">
                        <Sparkles size={32} className="mx-auto text-amber-500 mb-4" />
                        <h4 className="text-lg font-bold text-stone-900 mb-2">Chcesz dostać tytuły, tagi i opis SEO?</h4>
                        <p className="text-stone-600 text-sm mb-6 max-w-md mx-auto">Kliknij przycisk "Generuj Strategię Etsy" po lewej stronie, aby AI przygotowało kompletny listing.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[calc(100vh-200px)] border-4 border-dashed border-stone-200/60 rounded-[32px] bg-stone-100/30 flex flex-col items-center justify-center text-center p-12">
                      <div className="w-24 h-24 bg-white rounded-[24px] shadow-sm flex items-center justify-center mb-6">
                        <ImageIcon size={40} className="text-stone-300" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-800 mb-2 font-serif">Twoje Studio Czeka</h3>
                      <p className="text-stone-500 max-w-sm leading-relaxed">Wypełnij dane gobelinu po lewej stronie, aby AI mogło wyczarować opisy, słowa kluczowe i mockupy.</p>
                      <div className="mt-10 flex gap-4 text-[10px] uppercase font-bold tracking-widest text-stone-400">
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-amber-500" /> SEO Optimization</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-amber-500" /> AI Visuals</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-amber-500" /> Market Analysis</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inspiracje' && (
            <div className="animate-fade-in h-screen pb-20">
              <div className="mb-10 text-center max-w-2xl mx-auto">
                <Heart size={48} className="mx-auto text-rose-400 mb-4" />
                <h2 className="text-4xl font-bold text-stone-900 font-serif">Galeria Wnętrz</h2>
                <p className="text-stone-500 mt-2">Zarządzaj swoimi sceneriami. AI użyje ich jako tła do Twoich mockupów z idealnym zachowaniem skali.</p>
              </div>
              <InspirationsTab
                items={inspirations}
                loading={inspirationsLoading}
                onAdd={addInspiration}
                onRemove={removeInspiration}
                selectedId={selectedInspiration?.id || null}
                onSelect={(item) => { setSelectedInspiration(item); if (item) setActiveTab('generator'); }}
              />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-stone-800">Twoje Portfolio</h2>
                  <p className="text-stone-500">Zapisane listingi i historia Twojej pracy</p>
                </div>
              </div>

              {(!savedItems || savedItems.length === 0) ? (
                <div className="py-32 text-center bg-white rounded-[32px] border border-stone-200">
                  <Database size={48} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-400">Baza jest pusta. Wygeneruj i zapisz swój pierwszy listing!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedItems?.map(item => (
                    <div key={item.id} className="premium-card group overflow-hidden">
                      <div className="aspect-video relative overflow-hidden bg-stone-100">
                        {item.thumbnails?.[0] ? (
                          <img src={item.thumbnails[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-stone-200" /></div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                          {item.date}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="font-bold text-stone-900 truncate mb-1">{item.name}</h4>
                        <p className="text-xs text-stone-400 line-clamp-2 mb-6">{item.title}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleLoadFromHistory(item)} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                            Otwórz Projekt
                          </button>
                          <button onClick={() => removeItem(item.id)} className="p-3 bg-stone-50 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <SocialStudioTab
              currentImages={formData.images}
              currentProductName={formData.name}
              currentPrice={formData.material.includes('249') ? 'od 249 zł' : 'od 349 zł'}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
