// ============================================
// INSPIRATIONS TAB - Ulubione wnętrza
// Baza zdjęć przestrzeni do generowania mockupów
// ============================================

import React, { useState, useRef } from 'react';
import { Plus, Trash2, Sparkles, Upload, Heart } from 'lucide-react';
import type { InspirationItem } from '../hooks/useInspirations';

interface InspirationsTabProps {
    items: InspirationItem[];
    loading: boolean;
    onAdd: (base64: string, name: string, style: string, type: 'with_product' | 'empty', originalDimensions: string) => Promise<void>;
    onRemove: (id: string) => void;
    selectedId: string | null;
    onSelect: (item: InspirationItem | null) => void;
}

export const InspirationsTab: React.FC<InspirationsTabProps> = ({
    items, loading, onAdd, onRemove, selectedId, onSelect
}) => {
    const [showForm, setShowForm] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [style, setStyle] = useState('');
    const [type, setType] = useState<'with_product' | 'empty'>('empty');
    const [originalDimensions, setOriginalDimensions] = useState('');
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAdd = async () => {
        if (!preview || !name) return;
        setSaving(true);
        try {
            await onAdd(preview, name, style || name, type, originalDimensions);
            setPreview(null);
            setName('');
            setStyle('');
            setType('empty');
            setOriginalDimensions('');
            setShowForm(false);
        } catch {
            alert('Błąd podczas zapisywania. Spróbuj ponownie.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
                        <Heart size={22} className="text-rose-400" /> Moje Inspiracje
                    </h2>
                    <p className="text-sm text-stone-400 mt-0.5">
                        Ulubione wnętrza używane przy generowaniu mockupów
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow"
                >
                    <Plus size={16} /> Dodaj wnętrze
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-stone-700 mb-4 text-sm">Nowe wnętrze</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload */}
                        <div>
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="aspect-video bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition-colors"
                            >
                                {preview ? (
                                    <img src={preview} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <>
                                        <Upload size={28} className="text-stone-300 mb-2" />
                                        <p className="text-xs text-stone-400">Kliknij aby wgrać zdjęcie</p>
                                    </>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                        </div>

                        {/* Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5">
                                    Nazwa wnętrza
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="np. Skandynawski salon"
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5">Typ scenerii</label>
                                    <div className="flex bg-stone-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setType('empty')}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${type === 'empty' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
                                        >
                                            Pusta ściana
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('with_product')}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${type === 'with_product' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
                                        >
                                            Z gobelinem
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5">Rozmiar na foto</label>
                                    <input
                                        type="text"
                                        value={originalDimensions}
                                        onChange={e => setOriginalDimensions(e.target.value)}
                                        placeholder="np. 80x100cm"
                                        disabled={type === 'empty'}
                                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 disabled:opacity-40"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5">
                                    Opis stylu (dla AI)
                                </label>
                                <textarea
                                    value={style}
                                    onChange={e => setStyle(e.target.value)}
                                    placeholder="np. Japandi minimalist, warm whites, natural oak furniture, linen textures, soft morning light"
                                    rows={3}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none"
                                />
                                <p className="text-[10px] text-stone-400 mt-1">
                                    Ten opis będzie używany przez AI przy generowaniu mockupów
                                </p>
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={!preview || !name || saving}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <><Sparkles size={14} className="animate-spin" /> Zapisywanie...</>
                                ) : (
                                    <><Heart size={14} /> Dodaj do inspiracji</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected indicator */}
            {selectedId && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <Sparkles size={14} />
                    Wybrano inspirację — będzie użyta przy generowaniu mockupów.
                    <button onClick={() => onSelect(null)} className="ml-auto text-amber-600 hover:underline text-xs font-bold">
                        Odznacz
                    </button>
                </div>
            )}

            {/* Grid */}
            {items.length === 0 && !showForm ? (
                <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
                    <Heart size={48} className="mx-auto mb-4 text-stone-200" />
                    <p className="text-lg font-serif text-stone-400">Brak zapisanych inspiracji</p>
                    <p className="text-sm text-stone-300 mt-1">Dodaj zdjęcia wnętrz które lubisz</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer group border-2 transition-all ${selectedId === item.id
                                ? 'border-amber-400 shadow-lg shadow-amber-100'
                                : 'border-transparent hover:border-stone-300'
                                }`}
                            onClick={() => onSelect(selectedId === item.id ? null : item)}
                        >
                            {/* Image */}
                            <div className="aspect-video bg-stone-100">
                                <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Selected overlay */}
                            {selectedId === item.id && (
                                <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                                    <div className="bg-amber-400 text-white rounded-full p-2">
                                        <Sparkles size={18} />
                                    </div>
                                </div>
                            )}

                            {/* Type badge */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <div className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-white shadow-sm ${item.type === 'with_product' ? 'bg-rose-500' : 'bg-green-500'}`}>
                                    {item.type === 'with_product' ? 'Do podmiany' : 'Pusta ściana'}
                                </div>
                                {item.originalDimensions && (
                                    <div className="bg-black/60 text-white text-[8px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        Rozmiar: {item.originalDimensions}
                                    </div>
                                )}
                            </div>

                            {/* Info + delete */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <p className="text-white text-xs font-bold truncate">{item.name}</p>
                                <p className="text-white/60 text-[9px]">{item.addedAt}</p>
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                                className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
