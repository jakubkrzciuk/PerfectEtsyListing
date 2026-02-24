// ============================================
// MAIN APP COMPONENT
// Lale Studio - Etsy SEO Expert & Mockup Generator
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Database, RefreshCw, Settings, Key, Info,
  Wand2, Trash2, Plus, CheckCircle2, Circle, LogOut, User, Heart
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
  ResultsPanel
} from './components';
import { LoginPage } from './components/LoginPage';
import { InspirationsTab } from './components/InspirationsTab';
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

// ============================================
// COMPONENT
// ============================================

const App: React.FC = () => {
  // Auth
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();

  // Tabs
  const [activeTab, setActiveTab] = useState<'generator' | 'database' | 'inspiracje'>('generator');

  // API Key
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);

  // Form
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('replace');
  const [referenceBg, setReferenceBg] = useState<string | null>(null);

  // Results
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);

  // Storage - keywords zostają w localStorage, listingi w Supabase
  const { value: powerKeywords, setValue: setPowerKeywords } = useKeywordsStorage(DEFAULT_KEYWORDS);
  const { items: savedItems, addItem, removeItem, updatePlatforms } = useDatabase(user?.id);

  // Inspiracji hook
  const { items: inspirations, loading: inspirationsLoading, addInspiration, removeInspiration } = useInspirations(user?.id);
  const [selectedInspiration, setSelectedInspiration] = useState<InspirationItem | null>(null);

  // AI Hook
  const {
    generateListing,
    isLoading: isGenerating,
    error: aiError,
    clearError
  } = useAI();

  // ============================================
  // EFFECTS
  // ============================================

  // Check API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setApiKeyReady(has);
      } else {
        // Dev environment - assume key is configured
        setApiKeyReady(true);
      }
    };
    checkKey();
  }, []);

  // SEO Analysis
  useEffect(() => {
    if (result) {
      const analysis = analyzeSeo(result, formData.name, powerKeywords);
      setSeoAnalysis(analysis);
    } else {
      setSeoAnalysis(null);
    }
  }, [result, formData.name, powerKeywords]);

  // Clear error when form changes
  useEffect(() => {
    clearError();
  }, [formData, clearError]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleKeySelect = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        const has = await window.aistudio.hasSelectedApiKey();
        setApiKeyReady(has || true); // Fallback
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleGenerate = async () => {
    if (formData.images.length === 0) {
      alert('Dodaj przynajmniej jedno zdjęcie produktu');
      return;
    }
    if (!formData.name || !formData.widthCm || !formData.heightCm) {
      alert('Wypełnij nazwę i wymiary');
      return;
    }

    try {
      // Prepare data
      const sizesBlock = formatSizesBlock(
        formData.widthCm,
        formData.heightCm,
        formData.additionalSizes
      );
      const linksBlock = formatLinksBlock(formData.similarLinks);
      const selectedKeywords = getRandomKeywords(powerKeywords, 4);

      // Build prompt
      const systemPrompt = buildListingSystemPrompt(
        formData,
        selectedKeywords,
        sizesBlock,
        linksBlock
      );

      // Process images
      const processedImages = await processImagesForAI(formData.images);

      // Generate
      const jsonText = await generateListing(systemPrompt, processedImages, formData.name);

      // Parse result
      const parsedResult: GeneratedContent = JSON.parse(jsonText);
      setResult(parsedResult);

      // Scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Generation error:', err);
      if (!aiError) {
        alert('Błąd generowania: ' + (err.message || 'Nieznany błąd'));
      }
    }
  };

  const handleSave = useCallback(async () => {
    if (!result || formData.images.length === 0) return;

    const initialPlatforms: PlatformStatus = {
      etsyLale: formData.shop === 'LaleStudio',
      etsyShopniki: formData.shop === 'Laleshopniki',
      shopify: false,
      wescover: false
    };

    // Zapisz pelne dane formularza (bez zdjęć — te idą do Storage)
    const { images: _images, ...formDataWithoutImages } = formData;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pl-PL'),
      thumbnails: formData.images,
      title: result.title,
      tags: result.tags,
      name: formData.name,
      colors: result.colors,
      platforms: initialPlatforms,
      description: result.description,
      marketAnalysis: result.marketAnalysis,
      keywordStrategy: result.keywordStrategy,
      visualStyle: result.visualStyle,
      visualDescription: result.visualDescription,
      photoScore: result.photoScore,
      photoType: result.photoType,
      photoCritique: result.photoCritique,
      photoSuggestions: result.photoSuggestions,
      formData: formDataWithoutImages,
    };

    try {
      await addItem(newItem);
      alert('Zapisano w bazie danych!');
    } catch (err) {
      alert('Błąd zapisu. Spróbuj ponownie.');
    }
  }, [result, formData, addItem]);

  const handleLoadFromHistory = (item: HistoryItem) => {
    const loadedResult = {
      title: item.title,
      tags: item.tags,
      altText: "",
      colors: item.colors || [],
      description: item.description || "",
      marketAnalysis: item.marketAnalysis || "Brak analizy dla tej wersji.",
      keywordStrategy: item.keywordStrategy || "Brak strategii dla tej wersji.",
      visualStyle: item.visualStyle || "Brak danych wizualnych.",
      visualDescription: item.visualDescription || "Brak szczegółowego opisu wizualnego.",
      photoScore: item.photoScore || 0,
      photoType: item.photoType || "Niezdefiniowany",
      photoCritique: item.photoCritique || "Brak oceny zdjęcia.",
      photoSuggestions: item.photoSuggestions || [],
    };

    setResult(loadedResult);

    // Przywróć pełne dane formularza
    if (item.formData) {
      setFormData({ ...item.formData, images: item.thumbnails || [] });
    } else {
      setFormData(prev => ({ ...prev, images: item.thumbnails || [], name: item.name }));
    }

    // Ustaw analizę SEO (używa już zaimportowanej funkcji)
    const analysis = analyzeSeo(loadedResult, item.name, powerKeywords);
    setSeoAnalysis(analysis);

    // Przejdź do zakładki generator i scrolluj na górę — wyniki będą od razu widoczne
    setActiveTab('generator');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };


  const handleDeleteFromHistory = (id: string) => {
    removeItem(id);
  };

  const handleNew = () => {
    setResult(null);
    setFormData(initialFormData);
    setReferenceBg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    const newItems = keyword.split(',').map(s => s.trim()).filter(Boolean);
    const updated = [...new Set([...powerKeywords, ...newItems])];
    setPowerKeywords(updated);
  };

  const handleRemoveKeyword = (keyword: string) => {
    setPowerKeywords(powerKeywords.filter(k => k !== keyword));
  };

  const togglePlatform = (id: string, platform: keyof PlatformStatus) => {
    const item = savedItems.find(i => i.id === id);
    if (!item) return;
    const newPlatforms = { ...item.platforms, [platform]: !item.platforms[platform] };
    updatePlatforms(id, newPlatforms);
  };

  // ============================================
  // RENDER - LOADING
  // ============================================
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1c1917',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid rgba(245,158,11,0.3)',
            borderTopColor: '#d97706',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Ładowanie...</p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ============================================
  // RENDER - LOGIN
  // ============================================
  if (!user) {
    return <LoginPage onSignIn={signIn} />;
  }

  // ============================================
  // RENDER - API KEY SCREEN
  // ============================================

  if (!apiKeyReady) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center text-white font-serif text-4xl mb-6 shadow-xl">
          L
        </div>
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 tracking-wide">
          LALE STUDIO
        </h1>
        <p className="text-stone-500 mb-8 max-w-md font-light text-lg">
          Etsy SEO Expert & Mockup Generator (2026 Strategy)
        </p>

        <div className="bg-white p-10 rounded-2xl shadow-xl border border-stone-200 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-50 rounded-full text-amber-600">
              <Key size={32} />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-3 text-stone-800">Wymagany Klucz API</h2>
          <p className="mb-8 text-stone-600 leading-relaxed text-sm">
            Aby korzystać z zaawansowanych modeli <strong>Gemini 2.0</strong>,
            musisz wybrać klucz API powiązany z projektem Google Cloud.
          </p>
          <button
            onClick={handleKeySelect}
            className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
          >
            <Settings size={20} /> Wybierz Klucz API
          </button>
          <p className="mt-6 text-xs text-stone-400 border-t border-stone-100 pt-4">
            <a
              href="https://ai.google.dev/gemini-api/docs/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 hover:text-stone-600 transition-colors"
            >
              <Info size={12} /> Dowiedz się więcej o billingu
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - MAIN APP
  // ============================================

  return (
    <div className="min-h-screen pb-20 bg-stone-50 font-sans text-stone-700">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center text-white font-serif text-2xl">
                L
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800 tracking-wide font-serif">
                  LALE STUDIO
                </h1>
                <p className="text-xs text-stone-500 uppercase tracking-widest">
                  Etsy Strategy 2026
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleKeySelect}
                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full"
                title="Zmień klucz API"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full"
                title="Odśwież"
              >
                <RefreshCw size={20} />
              </button>
              {/* User info + logout */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-stone-200">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <User size={14} />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Wyloguj się"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-stone-100">
            <button
              onClick={() => setActiveTab('generator')}
              className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'generator'
                ? 'border-amber-500 text-stone-800'
                : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
            >
              <Sparkles size={18} /> Generator
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'database'
                ? 'border-amber-500 text-stone-800'
                : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
            >
              <Database size={18} /> Historia ({savedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('inspiracje')}
              className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'inspiracje'
                ? 'border-rose-400 text-stone-800'
                : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
            >
              <Heart size={18} /> Inspiracje
              {selectedInspiration && (
                <span className="bg-rose-400 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">1</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'inspiracje' ? (
          <InspirationsTab
            items={inspirations}
            loading={inspirationsLoading}
            onAdd={addInspiration}
            onRemove={removeInspiration}
            selectedId={selectedInspiration?.id || null}
            onSelect={(item) => {
              setSelectedInspiration(item);
              if (item) setActiveTab('generator');
            }}
          />
        ) : activeTab === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* LEFT: Form */}
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

            {/* RIGHT: Results */}
            <div className="space-y-6">
              {result && seoAnalysis ? (
                <ResultsPanel
                  result={result}
                  onResultChange={setResult}
                  formData={formData}
                  seoAnalysis={seoAnalysis}
                  powerKeywords={powerKeywords}
                  onSave={handleSave}
                  onNew={handleNew}
                  selectedInspiration={selectedInspiration}
                  inspirations={inspirations}
                  onSelectInspiration={setSelectedInspiration}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/30 min-h-[600px] p-8">
                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                    <Wand2 size={40} className="text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-serif text-stone-700 mb-2 font-semibold">
                    {isGenerating ? 'AI pracuje...' : 'Gotowy do generowania'}
                  </h3>
                  <p className="text-center max-w-xs text-stone-400 text-sm leading-relaxed">
                    {isGenerating
                      ? 'Gemini analizuje zdjęcia i tworzy aukcję zoptymalizowaną pod algorytm Etsy 2026...'
                      : 'Wgraj zdjęcia, uzupełnij dane produktu i kliknij ⚡ GENERUJ AUKCJĘ'
                    }
                  </p>
                  {isGenerating && (
                    <div className="mt-6 flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-amber-400"
                          style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  )}
                  {aiError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm max-w-sm">
                      <strong>Błąd:</strong> {aiError}
                    </div>
                  )}
                  <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'database' ? (
          /* ===== DATABASE / HISTORIA TAB ===== */
          <div className="space-y-6">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-800">Baza Listingów</h2>
                <p className="text-sm text-stone-400 mt-0.5">{savedItems.length} zapisanych produktów w bazie danych</p>
              </div>
              {/* Keywords toggle */}
              <details className="relative">
                <summary className="cursor-pointer list-none">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-600 hover:bg-stone-50 shadow-sm">
                    <Plus size={14} /> Słowa kluczowe ({powerKeywords.length})
                  </button>
                </summary>
                <div className="absolute right-0 top-12 z-30 w-80 bg-white border border-stone-200 rounded-xl shadow-xl p-4">
                  <h3 className="font-bold text-sm mb-3 text-stone-700">Power Keywords</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      id="keyword-input"
                      type="text"
                      placeholder="Dodaj słowo..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddKeyword((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('keyword-input') as HTMLInputElement;
                        if (input) { handleAddKeyword(input.value); input.value = ''; }
                      }}
                      className="bg-stone-800 text-white px-3 rounded hover:bg-stone-900"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {powerKeywords.map((k, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 text-amber-800">
                        {k}
                        <button onClick={() => handleRemoveKeyword(k)} className="text-amber-400 hover:text-red-500">
                          <Trash2 size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>

            {/* Cards grid */}
            {savedItems.length === 0 ? (
              <div className="text-center py-24 text-stone-300 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
                <Database size={56} className="mx-auto mb-4 opacity-40" />
                <p className="text-lg font-serif text-stone-400">Brak zapisanych aukcji</p>
                <p className="text-sm text-stone-300 mt-1">Wygeneruj i zapisz pierwszy listing</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square bg-stone-100 overflow-hidden">
                      {item.thumbnails?.[0] ? (
                        <img
                          src={item.thumbnails[0]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={item.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Database size={40} />
                        </div>
                      )}
                      {/* Image count badge */}
                      {(item.thumbnails?.length || 0) > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          +{(item.thumbnails?.length || 1) - 1} zdj.
                        </div>
                      )}
                      {/* Date */}
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full">
                        {item.date}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h4 className="font-bold text-stone-900 text-sm mb-1 truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 leading-snug mb-3 line-clamp-2" title={item.title}>
                        {item.title}
                      </p>

                      {/* Tags preview */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(item.tags || []).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {(item.tags?.length || 0) > 3 && (
                          <span className="text-[9px] text-stone-400">+{(item.tags?.length || 0) - 3}</span>
                        )}
                      </div>

                      {/* Platform toggles */}
                      <div className="flex gap-2 mb-4">
                        <PlatformToggle label="Etsy Lale" active={item.platforms.etsyLale} onToggle={() => togglePlatform(item.id, 'etsyLale')} />
                        <PlatformToggle label="Shopniki" active={item.platforms.etsyShopniki} onToggle={() => togglePlatform(item.id, 'etsyShopniki')} />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadFromHistory(item)}
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          ➜ Wczytaj
                        </button>
                        <button
                          onClick={() => handleDeleteFromHistory(item.id)}
                          className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

interface PlatformToggleProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

const PlatformToggle: React.FC<PlatformToggleProps> = ({ label, active, onToggle }) => (
  <button
    onClick={onToggle}
    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${active
      ? 'bg-green-100 text-green-700'
      : 'bg-stone-200 text-stone-500'
      }`}
  >
    {active ? <CheckCircle2 size={10} /> : <Circle size={10} />}
    {label}
  </button>
);

export default App;
