// ============================================
// LALE COLLABORATOR FOLDER
// Dedicated space for High-End Architects & Designers
// ============================================

import React, { useState } from 'react';
import {
    Folder, FileText, Send, Users,
    Download, ExternalLink, Package,
    Truck, CheckCircle2, MoreHorizontal
} from 'lucide-react';

interface MediaPack {
    id: string;
    title: string;
    description: string;
    itemCount: number;
    client: string;
    status: 'ready' | 'draft';
    thumbnail: string;
    shippingEstimate: string;
}

const MOCK_PACKS: MediaPack[] = [
    {
        id: 'p1',
        title: 'Cramer and Bell - Autumn Collection Pak',
        description: 'Pełna paczka zdjęć produktowych i mockupów dla londyńskiej galerii. Zawiera detale splotów.',
        itemCount: 12,
        client: 'Cramer and Bell',
        status: 'ready',
        thumbnail: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?auto=format&fit=crop&w=300&q=80',
        shippingEstimate: 'FedEx Priority: 145 USD'
    },
    {
        id: 'p2',
        title: 'Luxury Residence Tokyo - Visuals',
        description: 'Wizualizacje gobelinów w minimalistycznym apartamencie w Tokio. Wysoka rozdzielczość 4K.',
        itemCount: 8,
        client: 'Studio A+ (Tokio)',
        status: 'ready',
        thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80',
        shippingEstimate: 'FedEx Global: 190 USD'
    }
];

export const CollaboratorFolder: React.FC = () => {
    const [packs] = useState<MediaPack[]>(MOCK_PACKS);
    const [isSending, setIsSending] = useState<string | null>(null);

    const handleSend = (id: string) => {
        setIsSending(id);
        setTimeout(() => setIsSending(null), 2000);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-10 rounded-[40px] border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="space-y-3 relative z-10">
                    <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="text-3xl font-bold font-serif italic text-stone-900">Partnerzy i Architekci</h3>
                    <p className="text-stone-500 max-w-md">Miejsce przygotowane dla Twoich najważniejszych kolaboracji. Wysyłaj gotowe paczki ofertowe jednym kliknięciem.</p>
                </div>
                <div className="mt-8 md:mt-0 flex gap-4 relative z-10">
                    <div className="text-center p-6 bg-stone-50 rounded-3xl border border-stone-100 min-w-[120px]">
                        <p className="text-2xl font-black text-stone-900">14</p>
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Otwartych Ofert</p>
                    </div>
                    <div className="text-center p-6 bg-stone-50 rounded-3xl border border-stone-100 min-w-[120px]">
                        <p className="text-2xl font-black text-stone-900">2.4k</p>
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Wysłanych Plików</p>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 blur-3xl rounded-full" />
            </div>

            {/* Grid of Packs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {packs.map(pack => (
                    <div key={pack.id} className="group bg-white rounded-[40px] border border-stone-100 p-8 shadow-sm hover:shadow-2xl hover:border-stone-900 transition-all duration-500 relative overflow-hidden">
                        <div className="flex gap-6">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border border-stone-100 shrink-0">
                                <img src={pack.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-stone-900 text-white rounded-md text-[8px] font-black uppercase tracking-widest">Premium Pack</span>
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{pack.client}</span>
                                </div>
                                <h4 className="text-xl font-bold text-stone-900 font-serif lowercase tracking-tighter">{pack.title}</h4>
                                <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-2 italic">"{pack.description}"</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-stone-50 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-stone-50 rounded-full flex items-center justify-center text-stone-400">
                                    <Package size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Zawartość</p>
                                    <p className="text-[10px] font-bold text-stone-900">{pack.itemCount} Plików 4K</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-stone-50 rounded-full flex items-center justify-center text-stone-400">
                                    <Truck size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Estymacja FedEx</p>
                                    <p className="text-[10px] font-bold text-stone-900">{pack.shippingEstimate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => handleSend(pack.id)}
                                className="flex-1 py-4 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                            >
                                {isSending === pack.id ? <CheckCircle2 size={16} /> : <Send size={16} />}
                                {isSending === pack.id ? 'Wysłano!' : 'Wyślij do Architekta'}
                            </button>
                            <button className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-400 hover:bg-white hover:border-stone-900 hover:text-stone-900 transition-all">
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create New Pack CTA */}
                <button className="group bg-stone-50 rounded-[40px] border-4 border-dashed border-stone-200 p-8 flex flex-col items-center justify-center text-center hover:border-stone-900 hover:bg-white transition-all duration-500">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Folder className="text-stone-200 group-hover:text-stone-900" />
                    </div>
                    <h5 className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Nowa Paczka Projektowa</h5>
                    <p className="text-[10px] text-stone-400 mt-1">Przygotuj materiały dla nowego klienta.</p>
                </button>
            </div>
        </div>
    );
};
