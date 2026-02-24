// ============================================
// PRODUCT FORM COMPONENT
// All form inputs for product data
// ============================================

import React from 'react';
import { Ruler, Link, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';
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

  const addPresetSize = (w: string, h: string) => {
    const exists = formData.additionalSizes.some(s => s.width === w && s.height === h);
    if (!exists) {
      onFormDataChange({
        ...formData,
        additionalSizes: [...formData.additionalSizes, { width: w, height: h }]
      });
    }
  };

  const removeSize = (index: number) => {
    onFormDataChange({
      ...formData,
      additionalSizes: formData.additionalSizes.filter((_, i) => i !== index)
    });
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

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onReferenceBgChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
        {/* Mode Switcher */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-semibold text-stone-700">
            1. Dane Produktu
          </h2>
          <div className="flex bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => onGenerationModeChange('replace')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                generationMode === 'replace'
                  ? 'bg-white shadow-sm text-stone-800'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              title="AI spróbuje wkleić produkt w nowe tło"
            >
              Tryb Edycji (AI)
            </button>
            <button
              onClick={() => onGenerationModeChange('empty_mockup')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                generationMode === 'empty_mockup'
                  ? 'bg-white shadow-sm text-stone-800'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              title="AI wygeneruje tylko puste wnętrze"
            >
              Pusty Mockup
            </button>
          </div>
        </div>

        {/* Mode Info */}
        {generationMode === 'empty_mockup' ? (
          <div className="mb-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-200">
            <strong>Tryb Pustego Mockupu:</strong> AI wygeneruje <b>tylko puste wnętrze</b> 
            (bez gobelinu). Użyj tego tła w Canvie/Photoshopie.
          </div>
        ) : (
          <div className="mb-6 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
            <strong>Tryb Edycji AI:</strong> AI spróbuje wkleić produkt w nowe tło. 
            <b>Uwaga:</b> Może utracić oryginalną fakturę wełny.
          </div>
        )}

        {/* Image Upload */}
        <ImageUploader
          images={formData.images}
          onImagesChange={(images) => onFormDataChange({ ...formData, images })}
        />

        {/* Reference Background (for replace mode) */}
        {generationMode === 'replace' && (
          <div className="mb-8 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <label className="block text-xs font-bold uppercase text-stone-500 mb-2 flex items-center gap-1">
              <ImageIcon size={14} /> Własne tło (Opcjonalnie)
            </label>
            <p className="text-[10px] text-stone-400 mb-3">
              Wgraj konkretną ścianę/wnętrze jako tło dla mockupu
            </p>

            {referenceBg ? (
              <div className="relative w-full h-32 rounded overflow-hidden border border-stone-200 group">
                <img src={referenceBg} className="w-full h-full object-cover" alt="Background" />
                <button
                  onClick={() => onReferenceBgChange(null)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 
                           opacity-0 group-hover:opacity-100 hover:bg-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => bgInputRef.current?.click()}
                className="w-full h-20 rounded border-2 border-dashed border-stone-300 flex items-center 
                         justify-center cursor-pointer hover:bg-stone-100 transition-colors bg-white"
              >
                <span className="text-xs text-stone-400 font-medium">
                  Kliknij, aby wgrać tło
                </span>
                <input
                  type="file"
                  ref={bgInputRef}
                  onChange={handleBgUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            )}
          </div>
        )}

        {/* Core Fields */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
              Nazwa produktu
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="np. Whispering Forest"
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
              Kolorystyka
            </label>
            <input
              type="text"
              name="colors"
              value={formData.colors}
              onChange={handleChange}
              placeholder="np. Beige, Terracotta, Sage"
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-sm"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-stone-500 mb-2">
            Wymiary (cm)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => onFormDataChange({ 
                  ...formData, 
                  widthCm: p.w, 
                  heightCm: p.h 
                })}
                className="px-3 py-1.5 bg-stone-100 hover:bg-amber-100 text-stone-600 
                         text-xs rounded-full border border-stone-200 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Szerokość"
              name="widthCm"
              value={formData.widthCm}
              onChange={handleChange}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-sm"
            />
            <input
              type="number"
              placeholder="Wysokość"
              name="heightCm"
              value={formData.heightCm}
              onChange={handleChange}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-sm"
            />
          </div>
        </div>

        {/* Additional Sizes */}
        <div className="mb-6 bg-stone-50 p-4 rounded-lg border border-stone-200">
          <label className="block text-xs font-bold uppercase text-stone-500 mb-3 flex items-center gap-1">
            <Ruler size={14} /> Dodatkowe Warianty
          </label>

          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => addPresetSize(p.w, p.h)}
                className="px-3 py-1.5 bg-white hover:bg-green-50 hover:text-green-700 
                         hover:border-green-300 text-stone-500 text-xs rounded-full 
                         border border-stone-200 transition-colors flex items-center gap-1"
              >
                <Plus size={10} /> {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-3">
            <input
              type="number"
              placeholder="W"
              value={tempSize.w}
              onChange={(e) => setTempSize({ ...tempSize, w: e.target.value })}
              className="w-1/3 p-2 bg-white border border-stone-300 rounded text-xs"
            />
            <input
              type="number"
              placeholder="H"
              value={tempSize.h}
              onChange={(e) => setTempSize({ ...tempSize, h: e.target.value })}
              className="w-1/3 p-2 bg-white border border-stone-300 rounded text-xs"
            />
            <button
              onClick={addSize}
              className="flex-1 bg-stone-800 text-white text-xs rounded font-bold hover:bg-stone-900"
            >
              DODAJ
            </button>
          </div>

          {formData.additionalSizes.map((s, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white px-3 py-2 rounded 
                       border border-stone-200 text-xs mb-1"
            >
              <span className="font-medium">{s.width}x{s.height}cm</span>
              <button
                onClick={() => removeSize(i)}
                className="text-stone-400 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Similar Links */}
        <div className="mb-6 bg-stone-50 p-4 rounded-lg border border-stone-200">
          <label className="block text-xs font-bold uppercase text-stone-500 mb-3 flex items-center gap-1">
            <Link size={14} /> Podobne Produkty
          </label>
          <div className="flex flex-col gap-2 mb-3">
            <input
              type="text"
              placeholder="URL"
              value={tempLink.url}
              onChange={(e) => setTempLink({ ...tempLink, url: e.target.value })}
              className="w-full p-2 bg-white border border-stone-300 rounded text-xs"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Etykieta"
                value={tempLink.label}
                onChange={(e) => setTempLink({ ...tempLink, label: e.target.value })}
                className="flex-1 p-2 bg-white border border-stone-300 rounded text-xs"
              />
              <button
                onClick={addLink}
                className="bg-stone-800 text-white text-xs px-4 rounded font-bold hover:bg-stone-900"
              >
                DODAJ
              </button>
            </div>
          </div>

          {formData.similarLinks.map((l, i) => (
            <div
              key={i}
              className="flex justify-between items-start bg-white px-3 py-2 rounded 
                       border border-stone-200 text-xs gap-3 mb-1"
            >
              <div className="overflow-hidden">
                <p className="font-bold truncate">{l.label || l.url}</p>
              </div>
              <button
                onClick={() => removeLink(i)}
                className="text-stone-400 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Material & Mounting */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
              Materiał
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
              Montaż
            </label>
            <select
              name="mounting"
              value={formData.mounting}
              onChange={handleChange}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-sm"
            >
              <option value="Bambus">Bambus</option>
              <option value="Pine Natural">Rama Sosna</option>
              <option value="Pine Walnut">Rama Orzech</option>
              <option value="Oak Natural">Rama Dąb</option>
            </select>
          </div>
        </div>

        {/* User Hints */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
            Dodatkowe wskazówki dla AI
          </label>
          <textarea
            name="userHints"
            value={formData.userHints}
            onChange={handleChange}
            placeholder="np. Styl Japandi, pastele, inspiracja naturą..."
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-sm min-h-[80px]"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={isLoading || formData.images.length === 0 || !formData.name}
          className={`w-full py-5 rounded-xl flex items-center justify-center gap-2 
                   font-bold text-xl transition-all shadow-lg ${
                     isLoading || formData.images.length === 0 || !formData.name
                       ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                       : 'bg-stone-900 text-white hover:bg-black hover:scale-[1.01]'
                   }`}
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⚡</span>
              Generowanie...
            </>
          ) : (
            <>
              ⚡ GENERUJ AUKCJĘ
            </>
          )}
        </button>
      </div>
    </div>
  );
};
