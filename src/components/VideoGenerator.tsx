// ============================================
// VIDEO STUDIO PRO (Mini CapCut Experience)
// Tworzy dynamiczne filmy produktowe z przejściami i presetami
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import {
    Film, Play, Download, Loader2, Sparkles, AlertCircle,
    Plus, Trash2, Clock, Settings2, Instagram, Scissors,
    MoveLeft, MoveRight, Layers, Layout, Maximize, Smartphone, CheckCircle2
} from 'lucide-react';
import type { FormData } from '../types';

interface VideoGeneratorProps {
    formData: FormData;
    onAddVideo?: (videoUrl: string) => void;
}

interface VideoFrame {
    id: string;
    url: string;
    duration: number; // ms
    transition: 'fade' | 'zoom' | 'slide' | 'none';
}

const PRESETS = [
    { id: 'reel', label: 'Etsy Video / Reel', icon: <Smartphone size={14} />, width: 1080, height: 1920, ratio: '9:16' },
    { id: 'etsy', label: 'Etsy Square', icon: <Layout size={14} />, width: 1000, height: 1000, ratio: '1:1' },
    { id: 'landscape', label: 'Desktop / HD', icon: <Maximize size={14} />, width: 1920, height: 1080, ratio: '16:9' }
];

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ formData }) => {
    const [frames, setFrames] = useState<VideoFrame[]>([]);
    const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initial frames from product images
    useEffect(() => {
        if (frames.length === 0 && formData.images.length > 0) {
            const initial = formData.images.slice(0, 5).map((img, i) => ({
                id: `frame-${Date.now()}-${i}`,
                url: img,
                duration: 2000,
                transition: 'zoom' as const
            }));
            setFrames(initial);
        }
    }, [formData.images]);

    const addFrame = (imgUrl: string) => {
        setFrames(prev => [...prev, {
            id: `frame-${Date.now()}`,
            url: imgUrl,
            duration: 2000,
            transition: 'zoom'
        }]);
    };

    const removeFrame = (id: string) => {
        setFrames(prev => prev.filter(f => f.id !== id));
    };

    const moveFrame = (index: number, direction: 'left' | 'right') => {
        const newFrames = [...frames];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newFrames.length) {
            [newFrames[index], newFrames[targetIndex]] = [newFrames[targetIndex], newFrames[index]];
            setFrames(newFrames);
        }
    };

    const updateFrame = (id: string, updates: Partial<VideoFrame>) => {
        setFrames(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const generateVideo = async () => {
        if (frames.length < 2) {
            alert('Dodaj przynajmniej 2 klatki do filmu!');
            return;
        }

        setIsGenerating(true);
        setProgress(0);
        setError(null);

        try {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error('Canvas not found');

            // Set canvas size based on preset
            canvas.width = selectedPreset.width;
            canvas.height = selectedPreset.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Context not found');

            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                    ? 'video/webm;codecs=vp9'
                    : 'video/webm'
            });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setVideoUrl(URL.createObjectURL(blob));
                setIsGenerating(false);
                setProgress(100);
            };

            recorder.start();

            // Load all images first
            const loadedImages = await Promise.all(frames.map(async (frame) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = frame.url;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue even if one fails
                });
                return { img, frame };
            }));

            const fps = 30;
            const totalDuration = frames.reduce((acc, f) => acc + f.duration, 0);
            let currentTime = 0;

            for (let i = 0; i < loadedImages.length; i++) {
                const { img, frame } = loadedImages[i];
                const next = loadedImages[i + 1];
                const frameDuration = frame.duration;
                const transitionDuration = 500; // 0.5s transition

                const frameStartTime = currentTime;

                // Animation loop for this frame
                const frameSteps = (frameDuration / 1000) * fps;
                for (let step = 0; step < frameSteps; step++) {
                    const stepProgress = step / frameSteps;
                    currentTime += (1000 / fps);
                    setProgress(Math.round((currentTime / totalDuration) * 100));

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.save();

                    // Base Layer: Current Image
                    drawProcessedImage(ctx, img, canvas, stepProgress, frame.transition);

                    // Overlay: Next Image (if in transition)
                    if (next && stepProgress > 0.8) {
                        const transProgress = (stepProgress - 0.8) / 0.2; // 0 to 1
                        ctx.globalAlpha = transProgress;
                        drawProcessedImage(ctx, next.img, canvas, transProgress * 0.1, 'fade');
                    }

                    ctx.restore();
                    // Wait for one frame
                    await new Promise(r => setTimeout(r, 1000 / fps));
                }
            }

            recorder.stop();
        } catch (err: any) {
            console.error(err);
            setError('Błąd renderowania. Upewnij się, że zdjęcia są dostępne.');
            setIsGenerating(false);
        }
    };

    const drawProcessedImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement, p: number, effect: string) => {
        let scale = 1;
        let x = 0;
        let y = 0;

        // Calculate aspect fill
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;

        let drawW, drawH;
        if (imgRatio > canvasRatio) {
            drawH = canvas.height;
            drawW = canvas.height * imgRatio;
        } else {
            drawW = canvas.width;
            drawH = canvas.width / imgRatio;
        }

        if (effect === 'zoom') {
            scale = 1 + p * 0.15;
            drawW *= scale;
            drawH *= scale;
        }

        x = (canvas.width - drawW) / 2;
        y = (canvas.height - drawH) / 2;

        if (effect === 'slide') {
            x += (1 - p) * 100;
        }

        ctx.drawImage(img, x, y, drawW, drawH);
    };

    return (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                <Scissors size={200} />
            </div>

            <div className="relative z-10 text-stone-800">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
                            <Film className="text-amber-500" /> Video Studio Pro
                        </h3>
                        <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mt-1 font-black">Lale Creative Suite 2026</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* LEFT: Video Editor Controls */}
                    <div className="space-y-8">
                        {/* Format Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-stone-400 flex items-center gap-2">
                                <Settings2 size={12} /> Format Filmu (Preset)
                            </label>
                            <div className="flex gap-2">
                                {PRESETS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPreset(p)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${selectedPreset.id === p.id
                                                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-amber-200'
                                            }`}
                                    >
                                        {p.icon} {p.ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-stone-400 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Layers size={12} /> Oś Czasu (Timeline)</span>
                                <span className="text-amber-500 font-bold">{frames.length} zdjęć</span>
                            </label>

                            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                                {frames.map((frame, i) => (
                                    <div key={frame.id} className="relative shrink-0 group/frame">
                                        <div className="w-24 h-32 rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 relative shadow-sm group-hover/frame:shadow-md transition-all">
                                            <img src={frame.url} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/frame:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 backdrop-blur-[2px]">
                                                <button onClick={() => removeFrame(frame.id)} className="p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Trash2 size={12} /></button>
                                                <div className="flex gap-1">
                                                    <button onClick={() => moveFrame(i, 'left')} className="p-1.5 bg-white text-stone-900 rounded-lg disabled:opacity-30" disabled={i === 0}><MoveLeft size={10} /></button>
                                                    <button onClick={() => moveFrame(i, 'right')} className="p-1.5 bg-white text-stone-900 rounded-lg disabled:opacity-30" disabled={i === frames.length - 1}><MoveRight size={10} /></button>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-1.5 right-1.5 bg-stone-900/80 text-white px-1.5 py-0.5 rounded-lg text-[8px] font-black backdrop-blur-sm">
                                                {frame.duration / 1000}s
                                            </div>
                                        </div>
                                        <select
                                            value={frame.transition}
                                            onChange={(e) => updateFrame(frame.id, { transition: e.target.value as any })}
                                            className="mt-2 w-full bg-stone-50 border border-stone-200 rounded-xl text-[9px] p-2 font-black uppercase text-stone-600 outline-none focus:border-amber-500 transition-colors"
                                        >
                                            <option value="zoom">Wjazd (Zoom)</option>
                                            <option value="fade">Przenikanie</option>
                                            <option value="slide">Slajd</option>
                                            <option value="none">Brak</option>
                                        </select>
                                    </div>
                                ))}

                                <button
                                    onClick={() => alert('Wybierz zdjęcie z biblioteki poniżej')}
                                    className="w-24 h-32 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center gap-2 hover:border-amber-400 hover:bg-amber-50 transition-all text-stone-400 hover:text-amber-500"
                                >
                                    <Plus size={20} />
                                    <span className="text-[8px] font-black uppercase">Dodaj</span>
                                </button>
                            </div>
                        </div>

                        {/* Media Library */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-stone-400 flex items-center gap-2">
                                <Instagram size={12} /> Biblioteka Mediów (Kliknij by dodać)
                            </label>
                            <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
                                {formData.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => addFrame(img)}
                                        className="aspect-square rounded-xl overflow-hidden border border-stone-200 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all opacity-70 hover:opacity-100"
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={generateVideo}
                            disabled={isGenerating || frames.length < 2}
                            className={`w-full py-5 rounded-[24px] font-black text-xs tracking-[0.1em] flex items-center justify-center gap-3 transition-all ${isGenerating
                                    ? 'bg-stone-50 text-stone-400'
                                    : 'bg-stone-900 text-white hover:bg-black shadow-xl'
                                }`}
                        >
                            {isGenerating ? (
                                <><Loader2 className="animate-spin" size={18} /> RENDEROWANIE ({progress}%)...</>
                            ) : (
                                <><Play size={18} fill="currentColor" /> GENERUJ FILM REKLAMOWY</>
                            )}
                        </button>
                    </div>

                    {/* RIGHT: Video Display */}
                    <div className="flex flex-col items-center justify-center lg:border-l lg:border-stone-100 lg:pl-10">
                        {videoUrl ? (
                            <div className="space-y-6 w-full max-w-[320px]">
                                <div
                                    className="bg-stone-50 rounded-[48px] overflow-hidden shadow-2xl border-[12px] border-stone-900 relative group aspect-placeholder"
                                    style={{ aspectRatio: selectedPreset.ratio }}
                                >
                                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                                </div>
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setVideoUrl(null)}
                            className="py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-[10px] font-black uppercase transition-all"
                        >
                            Edytuj Projekt
                        </button>
                        <a
                            href={videoUrl}
                            download={`${formData.name || 'Lale-Studio'}-video.webm`}
                            className="py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <Download size={14} /> Pobierz 4K
                        </a>
                    </div>
                    <button
                        onClick={() => {
                            if (videoUrl) {
                                onAddVideo?.(videoUrl);
                                setAdded(true);
                            }
                        }}
                        disabled={added}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                            added 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-stone-900 text-white hover:bg-black shadow-lg shadow-stone-900/10'
                        }`}
                    >
                        {added ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                        {added ? 'Zapisano w projekcie' : 'Zapisz Film w projekcie'}
                    </button>
                </div>
            </div>
                        ) : (
                            <div
                                className="w-full max-w-[320px] rounded-[48px] border-2 border-dashed border-stone-200 bg-stone-50/30 flex flex-col items-center justify-center p-12 text-center"
                                style={{ aspectRatio: selectedPreset.ratio }}
                            >
                                <Sparkles size={48} className="text-stone-200 mb-6 animate-pulse" />
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-loose">
                                    Studio gotowe do<br />renderowania {selectedPreset.label}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] text-red-500 font-bold flex items-center gap-2">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
