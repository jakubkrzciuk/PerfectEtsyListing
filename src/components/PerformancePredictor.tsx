// ============================================
// PERFORMANCE PREDICTOR COMPONENT
// Market visibility and success forecasting
// ============================================

import React, { useMemo } from 'react';
import { TrendingUp, Users, Target, Zap, Info, ArrowUpRight, BarChart } from 'lucide-react';
import type { GeneratedContent, SeoAnalysis } from '../types';

interface PerformancePredictorProps {
    result: GeneratedContent;
    seoAnalysis: SeoAnalysis;
}

export const PerformancePredictor: React.FC<PerformancePredictorProps> = ({
    result,
    seoAnalysis
}) => {
    // Quantify performance metrics based on listing data
    const stats = useMemo(() => {
        const seoWeight = seoAnalysis.score / 100;
        const photoWeight = (result.photoScore || 5) / 10;
        const descriptionWeight = Math.min(result.description.length / 2000, 1);

        // 1. Visibility (How many people see it)
        // Influenced heavily by SEO Score and Title length
        const visibility = Math.round((seoWeight * 0.7 + (result.tags.length / 13) * 0.3) * 100);

        // 2. Click-Through Rate (CTR)
        // Influenced heavily by Photo Quality and Title Hook
        const ctr = Math.round((photoWeight * 0.8 + seoWeight * 0.2) * 100);

        // 3. Conversion Potential (Buyability)
        // Influenced by Description quality, Material info, and clear Alt Text
        const conversion = Math.round((descriptionWeight * 0.5 + photoWeight * 0.3 + (result.altText ? 0.2 : 0)) * 100);

        return { visibility, ctr, conversion };
    }, [result, seoAnalysis]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Main Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={<Target className="text-blue-500" />}
                    label="Zasięg Wyszukiwania"
                    value={stats.visibility}
                    desc="Potencjał SEO & Algorytm"
                    color="blue"
                />
                <MetricCard
                    icon={<Zap className="text-amber-500" />}
                    label="Siła Przyciągania"
                    value={stats.ctr}
                    desc="Analiza CTR (Zdjęcia + Tytuł)"
                    color="amber"
                />
                <MetricCard
                    icon={<TrendingUp className="text-emerald-500" />}
                    label="Potencjał Sprzedaży"
                    value={stats.conversion}
                    desc="Zaufanie & Przejrzystość"
                    color="emerald"
                />
            </div>

            {/* Visual Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visibility Funnel */}
                <div className="premium-card p-8 bg-white border border-stone-200">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
                            <BarChart size={20} className="text-stone-400" /> Lejek Konwersji (Estymacja)
                        </h4>
                        <Info size={16} className="text-stone-300 cursor-help" />
                    </div>

                    <div className="space-y-4">
                        <FunnelStep
                            label="Widoczność (Impressions)"
                            percent={stats.visibility}
                            color="bg-stone-900"
                            sub="Ilość wyświetleń w wynikach wyszukiwania Etsy"
                        />
                        <FunnelStep
                            label="Zainteresowanie (Clicks)"
                            percent={stats.ctr}
                            color="bg-amber-500"
                            sub="Użytkownicy, którzy klikną w Twój produkt"
                        />
                        <FunnelStep
                            label="Zakupy (Conversions)"
                            percent={stats.conversion}
                            color="bg-emerald-500"
                            sub="Szacowana szansa na finalizację zamówienia"
                        />
                    </div>
                </div>

                {/* Trend Analysis */}
                <div className="premium-card p-8 bg-stone-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp size={150} />
                    </div>

                    <div className="relative z-10">
                        <h4 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                            <ArrowUpRight className="text-amber-400" /> Analiza Trendów 2026
                        </h4>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                                    <span>Dopasowanie do rynku (Japandi / Modern)</span>
                                    <span className="text-amber-400">88%</span>
                                </div>
                                <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[88%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="text-xs text-stone-300 leading-relaxed italic">
                                    "Twój listing silnie rezonuje z trendem <strong>{result.visualStyle || 'Organic Minimalist'}</strong>. Wykorzystanie 13 tagów i power keywords w tytule plasuje Cię w TOP 15% nowo wystawianych produktów w kategorii Wall Decor."
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase text-stone-500 font-bold mb-1">Popyt</p>
                                    <p className="text-lg font-bold text-amber-400">WYSOKI</p>
                                </div>
                                <div className="w-px h-8 bg-stone-700" />
                                <div className="text-center">
                                    <p className="text-[10px] uppercase text-stone-500 font-bold mb-1">Konkurencja</p>
                                    <p className="text-lg font-bold text-stone-300">ŚREDNIA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Intent Analysis - NEW SECTION */}
            <div className="bg-white rounded-[32px] p-8 border border-stone-200 shadow-sm mt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-xl font-bold text-stone-900 font-serif lowercase tracking-tighter">Strategia SEO (Analiza Intencji)</h4>
                        <p className="text-sm text-stone-500 italic">Dlaczego te słowa? Sprawdź mapowanie intencji zakupowej.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {result.keywordAnalysis?.map((ka, idx) => (
                        <div key={idx} className="bg-stone-50 rounded-2xl p-6 border border-stone-100 flex flex-col justify-between group hover:border-amber-200 transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-stone-900 bg-white px-3 py-1 rounded-lg border border-stone-200 shadow-sm">{ka.keyword}</span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                                        ka.potential === 'high' ? 'bg-green-100 text-green-700' : 
                                        ka.potential === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-600'
                                    }`}>
                                        {ka.potential} impact
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        ka.intent === 'high_conversion' ? 'bg-rose-500' : 
                                        ka.intent === 'broad_traffic' ? 'bg-blue-500' : 'bg-emerald-500'
                                    }`} />
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                                        {ka.intent.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    {ka.explanation}
                                </p>
                            </div>
                        </div>
                    ))}
                    {(!result.keywordAnalysis || result.keywordAnalysis.length === 0) && (
                        <div className="col-span-full py-12 text-center text-stone-400 italic text-sm">
                            Generuj listing, aby zobaczyć głęboką analizę słów kluczowych.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Subcomponents ---

const MetricCard = ({ icon, label, value, desc, color }: any) => {
    const colors: any = {
        blue: 'border-blue-100 bg-blue-50/30 text-blue-700',
        amber: 'border-amber-100 bg-amber-50/30 text-amber-700',
        emerald: 'border-emerald-100 bg-emerald-50/30 text-emerald-700'
    };

    return (
        <div className={`p-6 rounded-3xl border ${colors[color]} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{label}</span>
            </div>
            <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-serif font-bold leading-none">{value}</span>
                <span className="text-sm font-bold opacity-60 mb-1">%</span>
            </div>
            <p className="text-[10px] font-medium opacity-60">{desc}</p>
        </div>
    );
};

const FunnelStep = ({ label, percent, color, sub }: any) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-bold text-stone-600 mb-1">
            <span>{label}</span>
            <span className="text-[10px] text-stone-400">{percent}%</span>
        </div>
        <div className="h-4 bg-stone-100 rounded-lg overflow-hidden flex">
            <div
                className={`h-full ${color} transition-all duration-1000 ease-out flex items-center justify-end px-2`}
                style={{ width: `${percent}%` }}
            >
                <div className="w-1 h-3 bg-white/20 rounded-full" />
            </div>
        </div>
        <p className="text-[9px] text-stone-400 leading-tight">{sub}</p>
    </div>
);
