// ============================================
// MAIN APP COMPONENT
// Lale Studio - Etsy SEO Expert & Mockup Generator
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Database, RefreshCw, Settings, Key, Info,
  Wand2, Trash2, Plus, CheckCircle2, Circle
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
import { 
  useAI, 
  useHistoryStorage, 
  useKeywordsStorage,
  useClipboard
} from './hooks';
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
  // Tabs
  const [activeTab, setActiveTab] = useState<'generator' | 'database'>('generator');
  
  // API Key
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);
  
  // Form
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('replace');
  const [referenceBg, setReferenceBg] = useState<string | null>(null);
  
  // Results
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  
  // Storage
  const { value: savedItems, setValue: setSavedItems } = useHistoryStorage();
  const { value: powerKeywords, setValue: setPowerKeywords } = useKeywordsStorage(DEFAULT_KEYWORDS);
  
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

  const handleSave = useCallback(() => {
    if (!result || formData.images.length === 0) return;

    const initialPlatforms: PlatformStatus = {
      etsyLale: formData.shop === 'LaleStudio',
      etsyShopniki: formData.shop === 'Laleshopniki',
      shopify: false,
      wescover: false
    };

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
    };

    setSavedItems(prev => [newItem, ...prev]);
    alert('Zapisano w historii!');
  }, [result, formData, setSavedItems]);

  const handleLoadFromHistory = (item: HistoryItem) => {
    setResult({
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
    });
    setFormData(prev => ({ ...prev, images: item.thumbnails || [], name: item.name }));
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFromHistory = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
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
    setSavedItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          platforms: {
            ...item.platforms,
            [platform]: !item.platforms[platform]
          }
        };
      }
      return item;
    }));
  };

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
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-stone-100">
            <button
              onClick={() => setActiveTab('generator')}
              className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'generator'
                  ? 'border-amber-500 text-stone-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <Sparkles size={18} /> Generator
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'database'
                  ? 'border-amber-500 text-stone-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <Database size={18} /> Historia ({savedItems.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'generator' ? (
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
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50 min-h-[600px]">
                  <Wand2 size={64} className="mb-6 text-amber-300" />
                  <h3 className="text-2xl font-serif text-stone-600 mb-3">
                    {isGenerating ? 'Generowanie...' : 'Gotowy?'}
                  </h3>
                  <p className="text-center max-w-sm">
                    {isGenerating 
                      ? 'AI analizuje zdjęcia i tworzy optymalizowaną aukcję...'
                      : 'Wypełnij dane produktu po lewej i kliknij GENERUJ AUKCJĘ'
                    }
                  </p>
                  {aiError && (
                    <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm max-w-sm">
                      <strong>Błąd:</strong> {aiError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Database / History Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Keywords Management */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h2 className="text-lg font-bold mb-4">Słowa Kluczowe</h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Dodaj słowo kluczowe..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddKeyword((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Dodaj słowo kluczowe..."]') as HTMLInputElement;
                      if (input) {
                        handleAddKeyword(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-stone-800 text-white px-3 rounded hover:bg-stone-900"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                  {powerKeywords.map((k, i) => (
                    <div
                      key={i}
                      className="bg-stone-50 border border-stone-200 px-2 py-1 rounded text-xs flex gap-2 items-center"
                    >
                      {k}
                      <button
                        onClick={() => handleRemoveKeyword(k)}
                        className="text-stone-400 hover:text-red-500"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* History List */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 min-h-[400px]">
                <h2 className="text-lg font-bold mb-4">
                  Historia ({savedItems.length} zapisanych)
                </h2>
                
                {savedItems.length === 0 ? (
                  <div className="text-center py-12 text-stone-400">
                    <Database size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Brak zapisanych aukcji</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="border border-stone-100 rounded-lg p-4 bg-stone-50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <img
                            src={item.thumbnails?.[0] || ''}
                            className="w-20 h-20 object-cover rounded-lg"
                            alt={item.name}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-stone-800 truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-stone-500 mb-2">{item.date}</p>
                            
                            {/* Platform Status */}
                            <div className="flex gap-3 mb-3">
                              <PlatformToggle
                                label="Etsy Lale"
                                active={item.platforms.etsyLale}
                                onToggle={() => togglePlatform(item.id, 'etsyLale')}
                              />
                              <PlatformToggle
                                label="Etsy Shopniki"
                                active={item.platforms.etsyShopniki}
                                onToggle={() => togglePlatform(item.id, 'etsyShopniki')}
                              />
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleLoadFromHistory(item)}
                                className="text-amber-600 text-xs font-bold uppercase hover:underline"
                              >
                                Edytuj
                              </button>
                              <button
                                onClick={() => handleDeleteFromHistory(item.id)}
                                className="text-stone-400 hover:text-red-500 text-xs"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${
      active
        ? 'bg-green-100 text-green-700'
        : 'bg-stone-200 text-stone-500'
    }`}
  >
    {active ? <CheckCircle2 size={10} /> : <Circle size={10} />}
    {label}
  </button>
);

export default App;
