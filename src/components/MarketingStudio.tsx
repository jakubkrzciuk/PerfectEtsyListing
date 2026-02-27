// ============================================
// MARKETING STUDIO COMPONENT v2
// Zaawansowane narzędzie do social media (Pinterest, Insta, FB)
// ============================================

import React, { useState, useRef } from 'react';
import {
    Share2, Download, Instagram, Pin, Layout, Palette,
    Type, Sparkles, Facebook, Maximize, MousePointer2,
    Layers, Settings2, Image as ImageIcon
} from 'lucide-react';

interface MarketingStudioProps {
    mainImage: string;
    productName: string;
    price?: string;
}

type TemplateId = 'pinterest_classic' | 'insta_story' | 'fb_post' | 'insta_post' | 'brand_clean';

interface Template {
    id: TemplateId;
    name: string;
    aspect: string;
    platform: 'Pinterest' | 'Instagram' | 'Facebook';
    icon: React.ReactNode;
}

const TEMPLATES: Template[] = [
    { id: 'pinterest_classic', name: 'Pinterest Pin', aspect: 'aspect-[2/3]', platform: 'Pinterest', icon: <Pin size={14} /> },
    { id: 'insta_story', name: 'Insta Story', aspect: 'aspect-[9/16]', platform: 'Instagram', icon: <Instagram size={14} /> },
    { id: 'insta_post', name: 'Insta Post', aspect: 'aspect-square', platform: 'Instagram', icon: <Instagram size={14} /> },
    { id: 'fb_post', name: 'FB Landscape', aspect: 'aspect-[1.91/1]', platform: 'Facebook', icon: <Facebook size={14} /> },
    { id: 'brand_clean', name: 'Brand Focus', aspect: 'aspect-[4/5]', platform: 'Instagram', icon: <Palette size={14} /> },
];

const FONTS = [
    { id: 'serif', name: 'Premium Serif', class: 'font-serif' },
    { id: 'sans', name: 'Minimal Sans', class: 'font-sans uppercase tracking-[0.2em]' },
    { id: 'mono', name: 'Modern Mono', class: 'font-mono' },
    { id: 'italics', name: 'Elegant Italic', class: 'font-serif italic' },
];

const FILTERS = [
    { id: 'none', name: 'Original', style: {} },
    { id: 'sepia', name: 'Vintage', style: { filter: 'sepia(0.3) contrast(1.1)' } },
    { id: 'warm', name: 'Soft Warm', style: { filter: 'saturate(1.1) brightness(1.05) hue-rotate(5deg)' } },
    { id: 'noir', name: 'Noir', style: { filter: 'grayscale(1) contrast(1.2)' } },
];

export const MarketingStudio: React.FC<MarketingStudioProps> = ({ mainImage, productName, price = "od 249 zł" }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('pinterest_classic');
    const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
    const [selectedFilter, setSelectedFilter] = useState('none');
    const [headline, setHeadline] = useState('New Heritage');
    const [subline, setSubline] = useState('Handwoven Excellence');
    const [overlayOpacity, setOverlayOpacity] = useState(0.4);
    const [showPrice, setShowPrice] = useState(true);

    const studioRef = useRef<HTMLDivElement>(null);
    const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplate)!;
    const currentFont = FONTS.find(f => f.id === selectedFont)!;
    const currentFilter = FILTERS.find(f => f.id === selectedFilter)!;

    return (
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-4 sm:p-10 border border-stone-200 shadow-xl space-y-6 sm:space-y-10 animate-fade-in group/studio relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50/50 rounded-full blur-3xl -mr-48 -mt-48 transition-all group-hover/studio:bg-rose-100/50 duration-1000" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-3">
                        <Share2 className="text-rose-500" /> Lale Marketing Studio
                    </h3>
                    <p className="text-stone-400 text-[10px] sm:text-xs mt-1">Stwórz profesjonalną kampanię w kilkanaście sekund</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-stone-900 text-white text-[8px] sm:text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={10} className="text-amber-400" /> AI Creative Engine v2
                    </span>
                </div>
            </div>

            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6 sm:gap-12 relative z-10">
                {/* Right Canvas - Live Preview - MOVED TOP ON MOBILE */}
                <div className="xl:col-span-8 order-1 xl:order-2">
                    <div className="bg-stone-50 rounded-[32px] sm:rounded-[40px] p-4 sm:p-16 border border-stone-200/50 flex items-center justify-center min-h-[400px] sm:min-h-[600px] shadow-inner relative overflow-hidden group/canvas">
                        {/* Canvas Labels */}
                        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-stone-200 shadow-sm transition-all group-hover/canvas:translate-y-1 w-[90%] sm:w-auto justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-stone-600">Live 48h Preview</span>
                            </div>
                            <div className="w-px h-3 bg-stone-200" />
                            <span className="text-[8px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-widest truncate">{currentTemplate.name}</span>
                        </div>

                        {/* The Graphic Canvas */}
                        <div
                            ref={studioRef}
                            className={`relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] sm:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden bg-white max-w-[280px] sm:max-w-[340px] w-full transition-all duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)] ${currentTemplate.aspect}`}
                        >
                            {/* Main Image Layer */}
                            <div className="absolute inset-0 transition-all duration-700 overflow-hidden">
                                <img
                                    src={mainImage}
                                    className="absolute inset-0 w-full h-full object-cover scale-105 group-hover/canvas:scale-100 transition-transform duration-1000"
                                    style={currentFilter.style}
                                    alt="Base"
                                />
                                <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: overlayOpacity }} />
                            </div>

                            {/* PLATFORM DESIGNS (Rendered based on selectedTemplate) */}
                            {selectedTemplate === 'pinterest_classic' && (
                                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 text-white z-20">
                                    <div className="bg-white/10 backdrop-blur-sm border-l-2 border-amber-500 p-4 sm:p-6 transform translate-y-0 group-hover/canvas:-translate-y-2 transition-transform duration-500">
                                        <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-[0.3em] mb-2 sm:mb-4 opacity-70 font-sans tracking-[0.2em]">Lale Studio Heritage</p>
                                        <h2 className={`text-xl sm:text-3xl leading-tight mb-2 sm:mb-4 ${currentFont.class}`}>{headline}</h2>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[8px] sm:text-[10px] font-medium opacity-80 uppercase tracking-wider">{subline}</p>
                                            {showPrice && <span className="text-amber-400 font-bold text-[10px] sm:text-xs">{price}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedTemplate === 'insta_story' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-between p-8 sm:p-12 text-white z-20">
                                    <div className="text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-white/5 backdrop-blur-md">
                                            <Sparkles size={16} className="text-amber-400" />
                                        </div>
                                        <p className="text-[8px] uppercase font-black tracking-[0.4em] opacity-60">Handmade Excellence</p>
                                    </div>
                                    <div className="text-center w-full">
                                        <h2 className={`text-2xl sm:text-4xl leading-none mb-4 sm:mb-6 drop-shadow-2xl ${currentFont.class}`}>{headline}</h2>
                                        <div className="h-0.5 w-8 sm:w-12 bg-white/40 mx-auto mb-4 sm:mb-6" />
                                        <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em]">{subline}</p>
                                    </div>
                                    <div className="w-full">
                                        <button className="w-full py-3 sm:py-4 bg-white text-stone-900 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl">
                                            Shop The Collection
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedTemplate === 'insta_post' && (
                                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 z-20">
                                    <div className="bg-white p-6 sm:p-8 shadow-2xl relative group-hover/canvas:translate-y-2 transition-transform duration-700">
                                        <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-l-2 border-stone-900" />
                                        <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-r-2 border-stone-900" />
                                        <p className="text-[7px] sm:text-[8px] uppercase font-black tracking-widest text-stone-400 mb-2">Lale Studio Selection</p>
                                        <h2 className={`text-xl sm:text-2xl font-bold text-stone-900 mb-3 sm:mb-4 ${currentFont.class}`}>{headline}</h2>
                                        <p className="text-[9px] sm:text-[10px] text-stone-600 font-medium leading-relaxed mb-4 sm:mb-6 truncate">{subline}</p>
                                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-stone-100">
                                            <span className="text-[8px] sm:text-[9px] font-black text-rose-500 uppercase">Available Now</span>
                                            {showPrice && <span className="text-[10px] sm:text-[11px] font-bold text-stone-900">{price}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedTemplate === 'fb_post' && (
                                <div className="absolute inset-0 flex items-center z-20">
                                    <div className="bg-white/10 backdrop-blur-xl border-y border-white/20 w-full py-4 sm:py-6 px-6 sm:px-10 text-white">
                                        <div className="flex justify-between items-center">
                                            <div className="max-w-[140px] sm:max-w-[180px]">
                                                <h2 className={`text-lg sm:text-xl font-bold mb-1 leading-tight ${currentFont.class}`}>{headline}</h2>
                                                <p className="text-[8px] sm:text-[9px] font-medium opacity-70 translate truncate">{subline}</p>
                                            </div>
                                            <div className="text-right">
                                                {showPrice && <p className="text-xs sm:text-sm font-bold text-amber-400 mb-1">{price}</p>}
                                                <div className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-stone-900 rounded-md">Learn More</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedTemplate === 'brand_clean' && (
                                <>
                                    <div className="absolute top-6 sm:top-10 inset-x-0 flex flex-col items-center text-white z-20">
                                        <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.5em] mb-2 sm:mb-4 drop-shadow-md">Lale Studio</p>
                                        <div className="w-6 sm:w-8 h-px bg-white/50" />
                                    </div>
                                    <div className="absolute bottom-8 sm:bottom-12 left-6 sm:left-10 text-white z-20">
                                        <h2 className={`text-2xl sm:text-4xl font-bold drop-shadow-2xl leading-none mb-2 sm:mb-3 ${currentFont.class}`}>{headline}</h2>
                                        <p className="text-[10px] sm:text-xs opacity-80 uppercase tracking-widest drop-shadow-md font-medium">{subline}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Canvas Helpers Overlay */}
                        <div className="absolute bottom-6 sm:bottom-10 inset-x-0 flex justify-center gap-2 sm:gap-3">
                            <div className="bg-stone-900/5 backdrop-blur-lg border border-white/50 p-1.5 sm:p-2 rounded-2xl flex items-center gap-1 shadow-sm">
                                <button onClick={() => setOverlayOpacity(prev => Math.max(0, prev - 0.1))} className="p-1.5 sm:p-2 hover:bg-white rounded-xl transition-colors"><Maximize size={12} className="text-stone-600" /></button>
                                <button className="p-1.5 sm:p-2 hover:bg-white rounded-xl transition-colors"><MousePointer2 size={12} className="text-stone-600" /></button>
                                <button className="p-1.5 sm:p-2 hover:bg-white rounded-xl transition-colors"><Layers size={12} className="text-stone-600" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Toolbar - Controls */}
                <div className="xl:col-span-4 space-y-6 sm:space-y-8 h-full order-2 xl:order-1 px-1 sm:px-0">
                    {/* 1. Wybór Formatu */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                                <Layout size={14} className="text-amber-500" /> 01. Format Projektu
                            </h4>
                            <span className="text-[9px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full uppercase">Social Engine</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group ${selectedTemplate === t.id
                                            ? 'bg-stone-900 border-stone-900 text-white shadow-lg ring-4 ring-stone-900/5'
                                            : 'bg-white border-stone-100 text-stone-600 hover:border-stone-300'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${selectedTemplate === t.id ? 'bg-white/20' : 'bg-stone-50 group-hover:bg-amber-50 group-hover:text-amber-600'}`}>
                                        {t.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black leading-tight truncate">{t.name}</p>
                                        <p className="text-[8px] opacity-60 font-bold uppercase tracking-tighter">{t.aspect.replace('aspect-', '').replace('[', '').replace(']', '').replace('/', ':')}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Typografia */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                            <Type size={14} className="text-rose-500" /> 02. Typografia
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {FONTS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setSelectedFont(f.id)}
                                    className={`px-4 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${selectedFont === f.id
                                            ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                                            : 'bg-white border-stone-100 text-stone-600 hover:border-stone-200'
                                        } ${f.class}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Edycja Treści */}
                    <div className="space-y-4 bg-stone-50 p-6 rounded-[24px] border border-stone-100">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2 mb-4">
                            <Palette size={14} className="text-amber-500" /> 03. Personalizacja
                        </h4>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Nagłówek Główny</label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                    placeholder="Wpisz hasło..."
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Podtytuł</label>
                                <input
                                    type="text"
                                    value={subline}
                                    onChange={(e) => setSubline(e.target.value)}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                    placeholder="Opis krótki..."
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block flex items-center justify-between">
                                        Przyciemnienie <span>{Math.round(overlayOpacity * 100)}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.8"
                                        step="0.05"
                                        value={overlayOpacity}
                                        onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                                        className="w-full accent-stone-900"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-4">
                                    <span className="text-[9px] font-black text-stone-500 uppercase">Cena</span>
                                    <button 
                                        onClick={() => setShowPrice(!showPrice)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${showPrice ? 'bg-amber-500' : 'bg-stone-300'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showPrice ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 4. Filtry i Efekty */}
                        <div className="pt-6 mt-6 border-t border-stone-200">
                             <div className="flex flex-wrap gap-2">
                                {FILTERS.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setSelectedFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-black transition-all uppercase tracking-tighter ${selectedFilter === f.id
                                                ? 'bg-stone-900 border-stone-900 text-white'
                                                : 'bg-white border-stone-100 text-stone-400 hover:text-stone-600 hover:border-stone-200'
                                            }`}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button className="w-full bg-stone-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black hover:shadow-xl transition-all group">
                            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> Pobierz Kolekcję .ZIP
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Features Info */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-stone-100 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <ImageIcon size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-stone-900 mb-1">Smart Crop</h5>
                        <p className="text-[10px] text-stone-400 italic">AI automatycznie centruje produkt w każdym formacie.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                        <Type size={20} className="text-rose-500" />
                    </div>
                    <div>
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-stone-900 mb-1">Brand Fonts</h5>
                        <p className="text-[10px] text-stone-400 italic">Wyselekcjonowane czcionki premium dla rzemiosła.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={20} className="text-green-500" />
                    </div>
                    <div>
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-stone-900 mb-1">Pinterest SEO</h5>
                        <p className="text-[10px] text-stone-400 italic">Zoptymalizowane układy teksu pod algorytm Pinów.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
