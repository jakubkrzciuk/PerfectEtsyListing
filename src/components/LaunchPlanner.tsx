// ============================================
// LALE PRODUCT LAUNCH PLANNER
// 14-day automated campaign strategy
// ============================================

import React, { useState } from 'react';
import {
    Rocket, Calendar, Sparkles, ArrowRight,
    CheckCircle2, Clock, Camera, MessageSquare
} from 'lucide-react';

interface CampaignStep {
    day: number;
    title: string;
    description: string;
    type: 'teaser' | 'educational' | 'behind' | 'launch';
    icon: React.ReactNode;
}

export const LaunchPlanner: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [launchDate, setLaunchDate] = useState('');
    const [steps, setSteps] = useState<CampaignStep[]>([]);

    const generateCampaign = () => {
        if (!productName || !launchDate) return;

        const strategy: CampaignStep[] = [
            { day: 14, title: 'Ziarno Ciekawości', description: `Bliskie zbliżenie na detale wełny dla ${productName}. Nie pokazuj całości.`, type: 'teaser', icon: <Camera size={14} /> },
            { day: 10, title: 'Proces Twórczy', description: 'Video Reels: Malowanie pędzlem detali na osnowie. Pokaż skupienie.', type: 'behind', icon: <Clock size={14} /> },
            { day: 7, title: 'Wybór Tekstur', description: 'Porównanie materiałów. Zapytaj w ankiecie o ulubiony odcień beżu.', type: 'educational', icon: <MessageSquare size={14} /> },
            { day: 3, title: 'Finalne Odliczanie', description: 'Mockup gobelinu w gotowym wnętrzu. "Coming Soon on Etsy".', type: 'teaser', icon: <Rocket size={14} /> },
            { day: 0, title: 'WIELKA PREMIERA', description: `Link w Bio live! ${productName} dostępny dla kolekcjonerów.`, type: 'launch', icon: <Sparkles size={14} /> }
        ];
        setSteps(strategy);
    };

    return (
        <div className="bg-stone-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden border border-stone-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full -mr-48 -mt-48" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3 space-y-6">
                    <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <Rocket size={32} />
                    </div>
                    <h3 className="text-3xl font-bold font-serif italic italic">Launch Strategist</h3>
                    <p className="text-stone-400 text-sm leading-relaxed">Zaplanuj premierę nowej kolekcji. System wygeneruje dla Ciebie 14-dniowy plan postów budujący napięcie.</p>

                    <div className="space-y-4 pt-4">
                        <input
                            type="text"
                            placeholder="Nazwa Kolekcji / Gobelinu"
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-rose-500 transition-all"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                        <input
                            type="date"
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-rose-500 transition-all text-stone-400"
                            value={launchDate}
                            onChange={(e) => setLaunchDate(e.target.value)}
                        />
                        <button
                            onClick={generateCampaign}
                            className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95"
                        >
                            Rozpisz Kampanię
                        </button>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    {steps.length === 0 ? (
                        <div className="h-full min-h-[300px] border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center text-stone-500 bg-white/5">
                            <Calendar size={48} className="mb-4 opacity-20" />
                            <p className="text-xs font-bold tracking-widest uppercase opacity-40">Czekam na dane premiery</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            {steps.map((step, i) => (
                                <div key={i} className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all flex items-center gap-6">
                                    <div className="w-14 h-14 bg-stone-800 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-white/5">
                                        <span className="text-[10px] text-stone-500 font-black uppercase">Dzień</span>
                                        <span className="text-lg font-bold">-{step.day}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-rose-400">{step.icon}</span>
                                            <h5 className="text-xs font-black uppercase tracking-widest">{step.title}</h5>
                                        </div>
                                        <p className="text-xs text-stone-400">{step.description}</p>
                                    </div>
                                    <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-4 flex items-center gap-4 text-green-400">
                                <CheckCircle2 size={20} />
                                <p className="text-xs font-bold">Plan kampanii gotowy. Zdjęcia do wszystkich postów wygenerujesz w Studio Kreatywnym.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
