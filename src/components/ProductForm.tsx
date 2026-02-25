// ============================================
// PRODUCT FORM COMPONENT
// Premium 2026 configurator layout
// ============================================

import React from 'react';
import { Ruler, Link, Trash2, Plus, Image as ImageIcon, X, Sparkles, MapPin, Palette, Settings2, Wand2, Layers } from 'lucide-react';
import type { FormData, GenerationMode, SizeVariant, SimilarProduct } from '../types';
import { PRESETS, MOUNTING_MAP } from '../config/constants';
import { ImageUploader } from './ImageUploader';

interface ProductFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  generationMode: GenerationMode;
  onGenerationModeChange: (mode: GenerationMode) => void;
  referenceBg: string | null;
  onReferenceBgChange: (bg: string | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  onFormDataChange,
  generationMode,
  onGenerationModeChange,
  referenceBg,
  onReferenceBgChange,
  onSubmit,
  isLoading
}) => {
  const bgInputRef = React.useRef<HTMLInputElement>(null);
  const [tempSize, setTempSize] = React.useState({ w: '', h: '' });
  const [tempLink, setTempLink] = React.useState({ url: '', label: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormDataChange({ ...formData, [name]: value });
  };

  const addSize = () => {
    if (tempSize.w && tempSize.h) {
      onFormDataChange({
        ...formData,
        additionalSizes: [...formData.additionalSizes, { width: tempSize.w, height: tempSize.h }]
      });
      setTempSize({ w: '', h: '' });
    }
  };

  const removeSize = (index: number) => {
    onFormDataChange({
      ...formData,
      additionalSizes: formData.additionalSizes.filter((_, i) => i !== index)
    });
  };

  const addPresetSize = (w: string, h: string) => {
    const exists = formData.additionalSizes.some(s => s.width === w && s.height === h);
    if (!exists) {
      onFormDataChange({
        ...formData,
        additionalSizes: [...formData.additionalSizes, { width: w, height: h }]
      });
    }
  };

  const addLink = () => {
    if (tempLink.url) {
      onFormDataChange({
        ...formData,
        similarLinks: [...formData.similarLinks, { ...tempLink }]
      });
      setTempLink({ url: '', label: '' });
    }
  };

  const removeLink = (index: number) => {
    onFormDataChange({
      ...formData,
      similarLinks: formData.similarLinks.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 0. SECTION: IDENTITY */}
      <section className="premium-card p-8 bg-stone-50 border-amber-200/50">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-6 block">00. Tożsamość Projektu</label>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-2">
              <Sparkles size={12} className="text-amber-500" /> Nazwa Produktu (Dlaczego to ważne?)
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="np. Szept Lasu - Abstrakcyjny Gobelin Wełniany"
              className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-lg font-serif italic focus:border-amber-500 focus:shadow-[0_0_20px_rgba(217,119,6,0.1)] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-2">
                <Layers size={12} /> Materiał
              </label>
              <input
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="np. 100% Owcza Wełna"
                className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-2">
                <Settings2 size={12} /> Typ Produktu
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:border-amber-500 outline-none transition-all appearance-none"
              >
                <option value="Standardowy Gobelin">Standardowy Gobelin</option>
                <option value="Mini Gobelin">Mini Gobelin</option>
                <option value="Panel ścienny">Panel ścienny</option>
                <option value="Custom Order">Custom Order</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 1. SECTION: VISUAL ASSETS */}
      <section className="premium-card p-8">
        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 block">01. Baza Wizualna</label>

        <div className="space-y-6">
          <ImageUploader
            images={formData.images}
            onImagesChange={(imgs) => onFormDataChange({ ...formData, images: imgs })}
          />

          <div className="pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-stone-700">Wgraj Zdjęcie Własne</h4>
                <p className="text-[10px] text-stone-400">Opcjonalne tło (np. salon klienta)</p>
              </div>
              {referenceBg && (
                <button onClick={() => onReferenceBgChange(null)} className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1">
                  Usuń <X size={10} />
                </button>
              )}
            </div>

            <div
              onClick={() => bgInputRef.current?.click()}
              className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${referenceBg ? 'border-amber-400 bg-amber-50/30' : 'border-stone-200 hover:border-amber-300 bg-stone-50'}`}
            >
              {referenceBg ? (
                <div className="flex items-center gap-3">
                  <img src={referenceBg} className="w-12 h-12 object-cover rounded-lg border border-white shadow-sm" alt="" />
                  <span className="text-xs text-amber-700 font-bold">Zdjęcie wgrane</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon size={20} className="text-stone-300" />
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Kliknij aby wgrać tło</span>
                </div>
              )}
              <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const r = new FileReader();
                  r.onload = () => onReferenceBgChange(r.result as string);
                  r.readAsDataURL(file);
                }
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: DIMENSIONS */}
      <section className="premium-card p-8">
        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 block">02. Specyfikacja & Rozmiar</label>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5"><Ruler size={10} /> Szerokość</label>
            <input
              name="widthCm" value={formData.widthCm} onChange={handleChange} placeholder="CM"
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-500 transition-all font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5"><Ruler size={10} /> Wysokość</label>
            <input
              name="heightCm" value={formData.heightCm} onChange={handleChange} placeholder="CM"
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-500 transition-all font-bold"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-stone-500">Szybkie Wymiary (Presets)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => addPresetSize(preset.w, preset.h)}
                  className="py-2.5 px-3 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-bold text-stone-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all text-left flex flex-col"
                >
                  <span>{preset.label}</span>
                  <span className="text-[8px] opacity-60">Dodaj do listy</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-stone-500">Twoja Lista Wariantów</label>
              <div className="flex gap-1 items-center bg-stone-100 pr-1 rounded-full border border-stone-200">
                <input
                  value={tempSize.w} onChange={e => setTempSize({ ...tempSize, w: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addSize()}
                  placeholder="W" className="w-10 bg-transparent text-[10px] font-bold text-center focus:outline-none"
                />
                <span className="text-stone-300">×</span>
                <input
                  value={tempSize.h} onChange={e => setTempSize({ ...tempSize, h: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addSize()}
                  placeholder="H" className="w-10 bg-transparent text-[10px] font-bold text-center focus:outline-none"
                />
                <button onClick={addSize} className="p-1 bg-white rounded-full text-stone-900 hover:text-amber-500 shadow-sm"><Plus size={14} /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.additionalSizes.length === 0 && (
                <span className="text-[10px] text-stone-400 italic">Brak dodatkowych wymiarów...</span>
              )}
              {formData.additionalSizes.map((s, i) => (
                <span key={i} className="flex items-center gap-2 bg-stone-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {s.width}x{s.height} cm
                  <button onClick={() => removeSize(i)} className="hover:text-amber-500"><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: CHARACTERISTICS */}
      <section className="premium-card p-8">
        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 block">03. Detale Projektu</label>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5"><MapPin size={10} /> Sklep</label>
              <select
                name="shop" value={formData.shop} onChange={handleChange}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-500 transition-all font-medium appearance-none"
              >
                <option value="LaleStudio">Lale Studio</option>
                <option value="SplotyFantazji">Sploty Fantazji</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5"><Settings2 size={10} /> Montaż</label>
              <select
                name="mounting" value={formData.mounting} onChange={handleChange}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-500 transition-all font-medium appearance-none"
              >
                <option value="Bambus">Bambusowy Drążek</option>
                <option value="Ramka">Drewniana Ramka</option>
                <option value="Brak">Brak Montażu</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5"><Palette size={10} /> Kolorystyka & Styl</label>
            <input
              name="colors" value={formData.colors} onChange={handleChange}
              placeholder="np. Szałwia, ciepły dąb, ecru, słońce..."
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5"><Sparkles size={10} /> Wskazówki dla AI</label>
            <textarea
              name="userHints" value={formData.userHints} onChange={handleChange}
              placeholder="Opisz unikalny klimat tego gobelinu..."
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-500 transition-all font-medium min-h-[100px] resize-none"
            />
          </div>

          {/* SIMILAR LINKS SECTION (DODATKI) */}
          <div className="space-y-4 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-stone-500 flex items-center gap-1.5"><Link size={10} /> Podobne Produkty (Linki)</label>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={tempLink.url} onChange={e => setTempLink({ ...tempLink, url: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addLink()}
                  placeholder="Wklej URL do Etsy..."
                  className="flex-1 p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs focus:border-amber-400 outline-none"
                />
                <input
                  value={tempLink.label} onChange={e => setTempLink({ ...tempLink, label: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addLink()}
                  placeholder="Etykieta"
                  className="w-32 p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs focus:border-amber-400 outline-none"
                />
                <button onClick={addLink} className="p-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-sm"><Plus size={20} /></button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {formData.similarLinks.map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-900 text-white rounded-xl shadow-sm border border-white/10 group">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-amber-400 capitalize">{link.label || 'Produkt'}</span>
                      <span className="text-[9px] opacity-60 truncate max-w-[200px]">{link.url}</span>
                    </div>
                    <button onClick={() => removeLink(i)} className="p-2 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBMIT BUTTON */}
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full py-6 bg-stone-900 hover:bg-black text-white rounded-[24px] font-bold text-lg shadow-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 group overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors"></div>
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analizowanie Projektu...
          </>
        ) : (
          <>
            <Wand2 size={24} className="text-amber-500 group-hover:rotate-12 transition-transform" />
            <span>Generuj Strategię Etsy</span>
          </>
        )}
      </button>
    </div>
  );
};
