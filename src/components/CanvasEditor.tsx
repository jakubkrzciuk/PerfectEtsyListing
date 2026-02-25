// ============================================
// LALE CANVAS EDITOR (Fabric.js Engine) v3.0
// COMPLETE CANVA PRO EXPERIENCE
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import {
    Type, Move, Square, Circle,
    Trash2, Layers, Download, Undo,
    Redo, Image as ImageIcon, Palette, Settings,
    Layout, Sun, Contrast, Droplets, Maximize
} from 'lucide-react';
import { LALE_COLORS, LALE_FONTS, LALE_TEXTURES, LALE_LOGO } from '../config/brandKit';

interface CanvasEditorProps {
    initialImage?: string;
    width?: number;
    height?: number;
    productName: string;
    price: string;
    onSave?: (dataUrl: string) => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
    initialImage,
    width = 800,
    height = 1000,
    productName,
    price,
    onSave
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width,
            height,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });

        setFabricCanvas(canvas);

        // Event Listeners
        canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] || null));
        canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] || null));
        canvas.on('selection:cleared', () => setActiveObject(null));
        canvas.on('object:modified', () => saveHistory(canvas));
        canvas.on('object:added', () => saveHistory(canvas));
        canvas.on('object:removed', () => saveHistory(canvas));

        // Initial Image Load
        if (initialImage) {
            fabric.Image.fromURL(initialImage, { crossOrigin: 'anonymous' }).then((img) => {
                const scale = Math.max(canvas.width! / img.width!, canvas.height! / img.height!);
                img.scale(scale);
                canvas.centerObject(img);
                canvas.add(img);
                canvas.sendObjectToBack(img);
                img.set('selectable', true);
                img.set('name', 'bg-image');
                canvas.renderAll();
                saveHistory(canvas);
            });
        }

        return () => {
            canvas.dispose();
        };
    }, [width, height]);

    // History Management
    const saveHistory = (canvas: fabric.Canvas) => {
        const json = JSON.stringify(canvas.toJSON());
        setHistory(prev => {
            const next = prev.slice(0, historyIndex + 1);
            return [...next, json];
        });
        setHistoryIndex(prev => prev + 1);
    };

    const undoChange = () => {
        if (historyIndex <= 0 || !fabricCanvas) return;
        const targetIndex = historyIndex - 1;
        fabricCanvas.loadFromJSON(history[targetIndex]).then(() => {
            fabricCanvas.renderAll();
            setHistoryIndex(targetIndex);
        });
    };

    const redoChange = () => {
        if (historyIndex >= history.length - 1 || !fabricCanvas) return;
        const targetIndex = historyIndex + 1;
        fabricCanvas.loadFromJSON(history[targetIndex]).then(() => {
            fabricCanvas.renderAll();
            setHistoryIndex(targetIndex);
        });
    };

    // Canvas Actions
    const addText = (text: string, type: 'headline' | 'subline' | 'price' = 'headline') => {
        if (!fabricCanvas) return;
        const textObj = new fabric.IText(text, {
            left: 100, top: 100,
            fontFamily: type === 'headline' ? LALE_FONTS[0].family : LALE_FONTS[1].family,
            fontSize: type === 'headline' ? 60 : 30,
            fill: LALE_COLORS.primary,
            fontWeight: type === 'headline' ? 600 : 400
        });
        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
        saveHistory(fabricCanvas);
    };

    const addShape = (type: 'rect' | 'circle') => {
        if (!fabricCanvas) return;
        const shape = type === 'rect'
            ? new fabric.Rect({ width: 100, height: 100, fill: LALE_COLORS.accent, left: 200, top: 200 })
            : new fabric.Circle({ radius: 50, fill: LALE_COLORS.gold, left: 200, top: 200 });
        fabricCanvas.add(shape);
        fabricCanvas.setActiveObject(shape);
        saveHistory(fabricCanvas);
    };

    const addTexture = (url: string) => {
        if (!fabricCanvas) return;
        fabric.Image.fromURL(url).then(img => {
            const scale = Math.max(fabricCanvas.width! / img.width!, fabricCanvas.height! / img.height!);
            img.scale(scale);
            fabricCanvas.centerObject(img);
            img.set({ opacity: 0.4, selectable: false, evented: false });
            fabricCanvas.add(img);
            fabricCanvas.sendToBack(img);
            const bg = fabricCanvas.getObjects().find(o => o.get('name') === 'bg-image');
            if (bg) bg.sendToBack();
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        });
    };

    const addLogo = (type: 'minimal' | 'brand') => {
        if (!fabricCanvas) return;
        fabric.loadSVGFromString(LALE_LOGO[type]).then(({ objects, options }) => {
            const obj = fabric.util.groupSVGElements(objects, options);
            obj.set({ left: fabricCanvas.width! / 2, top: fabricCanvas.height! - 100, fill: LALE_COLORS.primary });
            fabricCanvas.add(obj);
            fabricCanvas.setActiveObject(obj);
            fabricCanvas.renderAll();
        });
    };

    const alignObject = (target: 'center' | 'centerX' | 'centerY' | 'top' | 'bottom' | 'left' | 'right') => {
        if (!fabricCanvas || !activeObject) return;
        switch (target) {
            case 'center': fabricCanvas.centerObject(activeObject); break;
            case 'centerX': fabricCanvas.centerObjectH(activeObject); break;
            case 'centerY': fabricCanvas.centerObjectV(activeObject); break;
            case 'top': activeObject.set('top', 0); break;
            case 'bottom': activeObject.set('top', fabricCanvas.height! - activeObject.getScaledHeight()); break;
            case 'left': activeObject.set('left', 0); break;
            case 'right': activeObject.set('left', fabricCanvas.width! - activeObject.getScaledWidth()); break;
        }
        fabricCanvas.renderAll();
        saveHistory(fabricCanvas);
    };

    const applyFilter = (filterType: string, value: any) => {
        if (!fabricCanvas || !activeObject || activeObject.get('type') !== 'image') return;
        const img = activeObject as fabric.Image;
        let filter;
        switch (filterType) {
            case 'brightness': filter = new fabric.filters.Brightness({ brightness: value }); break;
            case 'contrast': filter = new fabric.filters.Contrast({ contrast: value }); break;
            case 'saturation': filter = new fabric.filters.Saturation({ saturation: value }); break;
            case 'sepia': filter = new fabric.filters.Sepia(); break;
            case 'grayscale': filter = new fabric.filters.Grayscale(); break;
        }
        if (filter) {
            img.filters = [filter];
            img.applyFilters();
            fabricCanvas.renderAll();
            saveHistory(fabricCanvas);
        }
    };

    const updateProperty = (prop: string, val: any) => {
        if (!fabricCanvas || !activeObject) return;
        activeObject.set(prop, val);
        fabricCanvas.renderAll();
    };

    const handleExport = () => {
        if (!fabricCanvas) return;
        const dataURL = fabricCanvas.toDataURL({ format: 'jpeg', quality: 1, multiplier: 2 });
        if (onSave) onSave(dataURL);
        const link = document.createElement('a');
        link.download = `lale-design-${Date.now()}.jpg`;
        link.href = dataURL;
        link.click();
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[40px] border border-stone-200 shadow-2xl overflow-hidden">
            {/* Upper Toolbar */}
            <div className="bg-stone-900 p-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <button onClick={undoChange} disabled={historyIndex <= 0} className="tool-btn-dark disabled:opacity-20"><Undo size={18} /></button>
                    <button onClick={redoChange} disabled={historyIndex >= history.length - 1} className="tool-btn-dark disabled:opacity-20"><Redo size={18} /></button>
                    <div className="w-px h-6 bg-stone-700 mx-2" />
                    <button onClick={() => addText(productName, 'headline')} className="tool-btn-dark"><Type size={18} /></button>
                    <button onClick={() => addShape('rect')} className="tool-btn-dark"><Square size={18} /></button>
                    <button onClick={() => addShape('circle')} className="tool-btn-dark"><Circle size={18} /></button>
                    <button onClick={() => addTexture(LALE_TEXTURES[0].url)} className="tool-btn-dark"><Layers size={18} /></button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => { fabricCanvas?.remove(activeObject!); fabricCanvas?.discardActiveObject(); saveHistory(fabricCanvas!); }} disabled={!activeObject} className={`tool-btn-dark ${!activeObject ? 'opacity-30' : 'text-red-400'}`}><Trash2 size={18} /></button>
                    <div className="w-px h-6 bg-stone-700 mx-2" />
                    <button onClick={handleExport} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20">
                        <Download size={18} /> Eksportuj 4K
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Canvas Area */}
                <div className="flex-1 bg-stone-100 p-10 flex items-center justify-center relative overflow-auto custom-scrollbar">
                    <div className="canvas-wrapper shadow-2xl bg-white border border-stone-200">
                        <canvas ref={canvasRef} />
                    </div>

                    <div className="absolute bottom-6 left-10 flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200 text-[10px] font-bold text-stone-500 shadow-sm">
                        <Move size={12} className="text-rose-500" /> Układaj i grupuj elementy Lale Studio
                    </div>
                </div>

                {/* Professional Sidebar */}
                <div className="w-80 bg-stone-50 border-l border-stone-200 p-6 overflow-y-auto custom-scrollbar">
                    {activeObject ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <Settings size={12} /> Narzędzia Warstwy
                            </p>

                            <div className="space-y-6">
                                {/* Align Area */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Wyrównanie do Płótna</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button onClick={() => alignObject('left')} className="p-3 bg-white border border-stone-200 rounded-xl hover:border-rose-300 text-stone-400 flex items-center justify-center"><Layout size={14} className="-rotate-90" /></button>
                                        <button onClick={() => alignObject('centerX')} className="p-3 bg-white border border-stone-200 rounded-xl hover:border-rose-300 text-stone-400 flex items-center justify-center"><Layout size={14} /></button>
                                        <button onClick={() => alignObject('centerY')} className="p-3 bg-white border border-stone-200 rounded-xl hover:border-rose-300 text-stone-400 flex items-center justify-center"><Layout size={14} className="rotate-90" /></button>
                                        <button onClick={() => alignObject('right')} className="p-3 bg-white border border-stone-200 rounded-xl hover:border-rose-300 text-stone-400 flex items-center justify-center"><Layout size={14} className="rotate-180" /></button>
                                    </div>
                                </div>

                                {/* Effects Area */}
                                <div className="space-y-4 pt-6 border-t border-stone-200">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Przezroczystość</label>
                                        <span className="text-[10px] font-bold text-stone-900">{Math.round((activeObject.get('opacity') || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={activeObject.get('opacity') || 1}
                                        onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
                                        onMouseUp={() => saveHistory(fabricCanvas!)}
                                        className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {activeObject.get('type') === 'image' && (
                                    <div className="space-y-4 pt-6 border-t border-stone-200">
                                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Filtry Rzemieślnicze</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => applyFilter('grayscale', null)} className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-xl text-[9px] font-bold group hover:border-stone-900"><div className="w-3 h-3 rounded-full bg-stone-900" /> NOIR</button>
                                            <button onClick={() => applyFilter('sepia', null)} className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-xl text-[9px] font-bold group hover:border-rose-400"><div className="w-3 h-3 rounded-full bg-orange-400" /> WARM</button>
                                            <button onClick={() => applyFilter('brightness', 0.1)} className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-xl text-[9px] font-bold group hover:border-blue-400"><div className="w-3 h-3 rounded-full bg-blue-100 border border-stone-200" /> LIGHT</button>
                                            <button onClick={() => applyFilter('contrast', 0.2)} className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-xl text-[9px] font-bold group hover:border-stone-900"><div className="w-3 h-3 rounded-full bg-gradient-to-tr from-stone-900 to-white border border-stone-200" /> VIVID</button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-6 border-t border-stone-200">
                                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Brand Kit Lale</label>
                                    <div className="flex flex-wrap gap-2">
                                        {LALE_COLORS.palette.map(c => (
                                            <button
                                                key={c} onClick={() => { activeObject.set('fill', c); fabricCanvas?.renderAll(); saveHistory(fabricCanvas!); }}
                                                className={`w-7 h-7 rounded-full border transform hover:scale-110 transition-all ${activeObject.get('fill') === c ? 'border-rose-500 ring-4 ring-rose-50' : 'border-stone-200'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {activeObject.get('type') === 'i-text' && (
                                    <div className="space-y-2 pt-4 border-t border-stone-200">
                                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Typografia</label>
                                        <div className="flex flex-col gap-2">
                                            {LALE_FONTS.map(f => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => { activeObject.set('fontFamily', f.family); fabricCanvas?.renderAll(); saveHistory(fabricCanvas!); }}
                                                    className={`py-2 px-3 rounded-lg text-[10px] font-bold text-left transition-all ${activeObject.get('fontFamily') === f.family ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}
                                                    style={{ fontFamily: f.family }}
                                                >{f.name}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-4 border-t border-stone-200">
                                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Kolejność</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => { activeObject.bringForward(); fabricCanvas?.renderAll(); }} className="flex-1 py-2 bg-white border border-stone-200 rounded-lg text-[9px] font-bold hover:bg-stone-900 hover:text-white transition-colors">DO PRZODU</button>
                                        <button onClick={() => { activeObject.sendBackwards(); fabricCanvas?.renderAll(); }} className="flex-1 py-2 bg-white border border-stone-200 rounded-lg text-[9px] font-bold hover:bg-stone-900 hover:text-white transition-colors">DO TYŁU</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon size={12} className="text-rose-500" /> Biblioteka Elementów
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    <button onClick={() => addLogo('brand')} className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-rose-300 transition-all flex flex-col items-center gap-3 group">
                                        <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-[10px] font-black text-stone-400 group-hover:text-rose-500">L</div>
                                        <span className="text-[9px] font-black text-stone-900 uppercase">Sygnet Lale</span>
                                    </button>
                                    <button onClick={() => addTexture(LALE_TEXTURES[0].url)} className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-rose-300 transition-all flex flex-col items-center gap-3">
                                        <img src={LALE_TEXTURES[0].url} className="w-12 h-12 object-cover rounded-lg shadow-sm" alt="Len" />
                                        <span className="text-[9px] font-black text-stone-900 uppercase">Tekstura Lnu</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-10 border-t border-stone-200">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Więcej Tekstur</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {LALE_TEXTURES.map(t => (
                                        <button key={t.id} onClick={() => addTexture(t.url)} className="p-1 bg-white border border-stone-200 rounded-xl overflow-hidden group hover:border-rose-400 transition-all">
                                            <img src={t.url} className="w-full aspect-square object-cover rounded-lg group-hover:scale-110 transition-transform duration-500" alt={t.name} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .tool-btn-dark {
          @apply p-2.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-all;
        }
        .canvas-wrapper canvas {
          @apply block mx-auto;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
      `}</style>
        </div>
    );
};
