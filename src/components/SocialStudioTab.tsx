// ============================================
// STANDALONE SOCIAL STUDIO TAB v7
// Complete Marketing Command Center with Visual Planner
// ============================================

import React, { useState } from 'react';
import {
    Share2, Image as ImageIcon, Sparkles,
    Upload, Info, Layout, PenTool,
    Wand2, Copy, Check, Trash2, Clock,
    Calendar as CalendarIcon, Edit3, Grid3X3,
    ArrowRight, Zap
} from 'lucide-react';
import { CanvasEditor } from './CanvasEditor';
import { SocialCalendar } from './SocialCalendar';
import { InstagramGridPlanner } from './InstagramGridPlanner';
import { PLATFORM_DIMENSIONS } from '../config/brandKit';
import { useAI } from '../hooks/useAI';
import { useSocialDatabase } from '../hooks/useSocialDatabase';

interface SocialStudioTabProps {
    currentImages?: string[];
    currentProductName?: string;
    currentPrice?: string;
}

type PlatformId = keyof typeof PLATFORM_DIMENSIONS;

export const SocialStudioTab: React.FC<SocialStudioTabProps> = ({
    currentImages = [],
    currentProductName = 'Nowa Kolekcja Lale',
    currentPrice = 'od 249 zł'
}) => {
    const { generateSocialContent, isLoading: isAiLoading } = useAI();
    const { posts, savePost, removePost } = useSocialDatabase();

    const [subTab, setSubTab] = useState<'editor' | 'planner' | 'calendar'>('editor');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [productName, setProductName] = useState(currentProductName);
    const [price, setPrice] = useState(currentPrice);
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('PINTEREST');

    const [aiResult, setAiResult] = useState<{ caption: string, hashtags: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAiGenerate = async () => {
        try {
            const raw = await generateSocialContent(`${productName}. Materiał: ${price}`, selectedPlatform);
            const parts = raw.split(/Hashtags:|Hashtagi:/i);
            setAiResult({
                caption: parts[0].replace(/Caption:|Opis:/i, '').trim(),
                hashtags: parts[1]?.trim() || ''
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveToLibrary = async (dataUrl: string) => {
        await savePost({
            platform: selectedPlatform,
            caption: aiResult?.caption || '',
            hashtags: aiResult?.hashtags || '',
            imageUrl: dataUrl
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentDim = PLATFORM_DIMENSIONS[selectedPlatform];

    return (
        <div className="animate-fade-in space-y-10 pb-32">
            {/* Main Navigation Sub-tabs - PREMIUM STYLE */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-stone-200 pb-8">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-stone-900 font-serif lowercase tracking-tighter">Lale Social Pro</h2>
                    <p className="text-stone-500 text-sm italic">Twoje rzemiosło w cyfrowym świecie.</p>
                </div>

                <div className="flex items-center p-1.5 bg-stone-100 rounded-3xl border border-stone-200 shadow-inner">
                    <button
                        onClick={() => setSubTab('editor')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${subTab === 'editor' ? 'bg-white text-stone-900 shadow-xl shadow-stone-200' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <Edit3 size={16} /> <span className="hidden sm:inline">Studio Kreatywne</span>
                    </button>
                    <button
                        onClick={() => setSubTab('planner')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${subTab === 'planner' ? 'bg-white text-stone-900 shadow-xl shadow-stone-200' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <Grid3X3 size={16} /> <span className="hidden sm:inline">Planner IG</span>
                    </button>
                    <button
                        onClick={() => setSubTab('calendar')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${subTab === 'calendar' ? 'bg-white text-stone-900 shadow-xl shadow-stone-200' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <CalendarIcon size={16} /> <span className="hidden sm:inline">Harmonogram</span>
                    </button>
                </div>
            </div>

            {subTab === 'planner' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between bg-stone-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-3xl rounded-full" />
                        <div className="relative z-10 space-y-2">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                                <Grid3X3 size={24} className="text-rose-400" />
                            </div>
                            <h3 className="text-3xl font-bold font-serif italic">Wizualna Harmonia Marki</h3>
                            <p className="text-stone-400 max-w-md">Planner siatki pobrał Twoje ostatnie posty z Instagrama i umożliwi Ci idealne dopasowanie nowych projektów zanim zostaną opublikowane.</p>
                        </div>
                        <div className="hidden lg:flex items-center gap-4 relative z-10">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Status połączenia</p>
                                <p className="text-xs font-bold text-green-400">Live @lalestudio</p>
                            </div>
                            <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 flex items-center justify-center">
                                <Zap className="text-rose-400 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <InstagramGridPlanner posts={posts} />
                </div>
            )}

            {subTab === 'calendar' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <SocialCalendar posts={posts} />
                </div>
            )}

            {subTab === 'editor' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(PLATFORM_DIMENSIONS) as PlatformId[]).map(id => (
                                <button
                                    key={id}
                                    onClick={() => setSelectedPlatform(id)}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedPlatform === id
                                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-105'
                                        : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'
                                        }`}
                                >
                                    {id.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Side: Controls & AI */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-[32px] p-8 border border-stone-200 shadow-sm space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                        <Upload size={14} /> 01. Baza Wizualna
                                    </p>

                                    <div className="relative group">
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="aspect-video rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center group-hover:bg-stone-100 group-hover:border-stone-400 transition-all overflow-hidden border-rose-100">
                                            {uploadedImage ? (
                                                <img src={uploadedImage} className="w-full h-full object-cover" alt="Source" />
                                            ) : (
                                                <>
                                                    <ImageIcon size={32} className="text-stone-300 mb-2" />
                                                    <span className="text-xs font-bold text-stone-500">Dodaj zdjęcie</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {currentImages.length > 0 && (
                                    <div className="space-y-4 pt-6 border-t border-stone-100">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest uppercase">Pobierz z projektu:</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {currentImages.slice(0, 8).map((img, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setUploadedImage(img)}
                                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${uploadedImage === img ? 'border-rose-500 scale-95 shadow-md' : 'border-transparent hover:border-stone-300'}`}
                                                >
                                                    <img src={img} className="w-full h-full object-cover" alt="Product" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-stone-900 rounded-[32px] p-8 border border-stone-800 shadow-2xl space-y-6 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                                <div className="relative space-y-4">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                        <PenTool size={14} /> 02. AI Social Editor
                                    </p>
                                    <div className="space-y-3">
                                        <input
                                            type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                                            className="w-full p-4 bg-stone-800 border border-stone-700 rounded-2xl text-xs font-bold focus:border-rose-500 outline-none transition-all placeholder:text-stone-600 text-white shadow-inner"
                                            placeholder="Nazwa na post..."
                                        />
                                        <button
                                            onClick={handleAiGenerate}
                                            disabled={isAiLoading}
                                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
                                        >
                                            {isAiLoading ? <Wand2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                            {isAiLoading ? 'AI Myśli...' : 'Napisz Post'}
                                        </button>
                                    </div>

                                    {aiResult && (
                                        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[9px] font-black text-stone-500 uppercase">Propozycja Treści</label>
                                                    <button onClick={() => copyToClipboard(aiResult.caption)} className="text-rose-400 hover:text-white transition-colors">
                                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div className="p-4 bg-stone-800/50 rounded-xl text-[11px] leading-relaxed text-stone-300 font-medium italic border border-stone-700/50">
                                                    "{aiResult.caption}"
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <p className="text-[10px] text-rose-300/80 font-mono break-words">
                                                    {aiResult.hashtags}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Editor Panel */}
                        <div className="lg:col-span-8">
                            {uploadedImage ? (
                                <div className="h-[750px] sticky top-8">
                                    <CanvasEditor
                                        key={`${selectedPlatform}-${uploadedImage}`}
                                        initialImage={uploadedImage}
                                        width={currentDim.width > currentDim.height ? 600 : 400}
                                        height={currentDim.width > currentDim.height ? (600 / (currentDim.width / currentDim.height)) : 600}
                                        productName={productName}
                                        price={price}
                                        onSave={handleSaveToLibrary}
                                    />
                                </div>
                            ) : (
                                <div className="h-full min-h-[600px] border-4 border-dashed border-stone-200/60 rounded-[40px] bg-white flex flex-col items-center justify-center text-center p-12 shadow-sm">
                                    <div className="w-24 h-24 bg-stone-50 rounded-[32px] shadow-sm flex items-center justify-center mb-6">
                                        <ImageIcon size={40} className="text-stone-200 animate-pulse" />
                                    </div>
                                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2 italic tracking-tighter">Czekam na Twoje rzemiosło...</h2>
                                    <p className="text-stone-400 max-w-sm">Wgraj zdjęcie lub wybierz gobelin z projektu, aby otworzyć Studio Kreatywne.</p>
                                    <div className="mt-8 flex gap-4">
                                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3">
                                            <Zap size={16} className="text-rose-500" />
                                            <span className="text-[10px] font-black text-stone-500 uppercase">Eksport 4K</span>
                                        </div>
                                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3">
                                            <Grid3X3 size={16} className="text-rose-500" />
                                            <span className="text-[10px] font-black text-stone-500 uppercase">Automatyczne Kadrowanie</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Media Library Section */}
                    <div className="pt-20 border-t border-stone-200 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-stone-900 font-serif lowercase tracking-tighter">biblioteka projektów</h3>
                                <p className="text-stone-500 text-xs italic">Twoje archiwum wizualne.</p>
                            </div>
                            <div className="px-4 py-2 bg-stone-100 rounded-full text-[10px] font-bold text-stone-500 flex items-center gap-2">
                                <Clock size={12} /> Ostatnio dodane
                            </div>
                        </div>

                        {posts.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-[32px] border border-stone-100 italic text-stone-300">
                                Tu pojawią się Twoje gotowe projekty.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
                                {posts.map(post => (
                                    <div key={post.id} className="group relative bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                                        <div className="aspect-[4/5] relative overflow-hidden">
                                            <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Draft" />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    onClick={() => removePost(post.id)}
                                                    className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-stone-400 hover:text-red-500 transition-colors shadow-sm"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <p className="text-[10px] text-white font-bold opacity-80 mb-1">{post.platform}</p>
                                                <p className="text-[10px] text-white/60 font-mono text-xs">{post.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
