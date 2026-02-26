// ============================================
// PINTEREST AUTO-SCHEDULER v1
// Multiplier: 1 Image -> 10 Pins
// ============================================

import React, { useState } from 'react';
import {
    Grid, Sparkles, Pin, Layout,
    ArrowRight, CheckCircle2, Wand2,
    Clock, Smartphone
} from 'lucide-react';

interface PinVariation {
    id: string;
    type: string;
    description: string;
    scheduledFor: string;
    status: 'pending' | 'ready';
    image?: string;
}

export const PinterestScheduler: React.FC<{ sourceImage: string | null }> = ({ sourceImage }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [variations, setVariations] = useState<PinVariation[]>([]);

    const handleGeneratePool = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const pool: PinVariation[] = [
                { id: 'v1', type: 'Macro Texture', description: 'Zbliżenie na splot wełny i naturalną teksturę.', scheduledFor: '+1 Day', status: 'ready', image: sourceImage || undefined },
                { id: 'v2', type: 'Lifestyle Mockup', description: 'Gobelin w jasnym salonie Japandi.', scheduledFor: '+3 Days', status: 'ready', image: sourceImage || undefined },
                { id: 'v3', type: 'Detail & Price', description: 'Kadr 2:3 z subtelną ceną i info o FedEx.', scheduledFor: '+5 Days', status: 'ready', image: sourceImage || undefined },
                { id: 'v4', type: 'Work in Progress', description: 'Surowy kadr z krosna w czerni i bieli.', scheduledFor: '+7 Days', status: 'ready', image: sourceImage || undefined },
                { id: 'v5', type: 'Color Palette', description: 'Moodboard: zdjęcie + próbki kolorystyczne.', scheduledFor: '+10 Days', status: 'ready', image: sourceImage || undefined }
            ];
            setVariations(pool);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-[40px] border border-stone-200 p-8 shadow-sm space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between border-b border-stone-50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                        <Pin size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-stone-900 font-serif italic">Pinterest Multiplier</h4>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">1 Zdjęcie ➜ 5 Pinów Strategicznych</p>
                    </div>
                </div>
                {!variations.length && (
                    <button
                        onClick={handleGeneratePool}
                        disabled={!sourceImage || isGenerating}
                        className="px-6 py-3 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Wand2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isGenerating ? 'Generuję Warianty...' : 'Stwórz Kolejkę Pinów'}
                    </button>
                )}
            </div>

            {!sourceImage && (
                <div className="py-12 text-center text-stone-400 italic text-xs">
                    Wgraj zdjęcie główne, aby wygenerować warianty na Pinterest.
                </div>
            )}

            {variations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    {variations.map((v, i) => (
                        <div key={v.id} className="group relative bg-stone-50 rounded-3xl p-4 border border-stone-100 hover:border-rose-200 hover:bg-white transition-all shadow-sm hover:shadow-xl">
                            <div className="aspect-[2/3] rounded-2xl bg-stone-200 overflow-hidden mb-4 relative">
                                {v.image && <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button className="p-3 bg-white rounded-full text-stone-900 shadow-xl"><Layout size={18} /></button>
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-rose-600 tracking-widest shadow-sm">
                                    {v.type}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Zaplanowano</p>
                                    <Clock size={10} className="text-stone-300" />
                                </div>
                                <p className="text-[10px] font-bold text-stone-900">{v.scheduledFor}</p>
                                <p className="text-[9px] text-stone-400 italic line-clamp-2 mt-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                                    {v.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {variations.length > 0 && (
                <div className="pt-6 flex justify-center">
                    <button className="px-12 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Zatwierdź i Dodaj do Harmonogramu
                    </button>
                </div>
            )}
        </div>
    );
};
