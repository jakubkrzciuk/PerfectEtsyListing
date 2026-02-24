// ============================================
// IMAGE UPLOADER COMPONENT
// Drag & drop, preview, validation
// ============================================

import React, { useRef, useState } from 'react';
import { Image as ImageIcon, X, PlusCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import { validateImageFile } from '../utils/imageProcessing';
import { IMAGE_CONFIG } from '../config/constants';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

type InputMode = 'file' | 'url';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = IMAGE_CONFIG.MAX_PRODUCT_IMAGES
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maksymalnie ${maxImages} zdjęć!`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of Array.from(files) as File[]) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        setError(validation.error || 'Nieprawidłowy plik');
      }
    }

    // Convert to base64
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImagesChange([...images, reader.result as string]);
        setError(null);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlLoad = async () => {
    const url = urlInput.trim();
    if (!url) return;
    
    if (images.length >= maxImages) {
      setError(`Maksymalnie ${maxImages} zdjęć!`);
      return;
    }

    setUrlLoading(true);
    setError(null);

    try {
      let blob: Blob;
      
      // Try direct fetch first
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Direct fetch failed');
        blob = await response.blob();
      } catch {
        // Fallback to CORS proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy fetch failed');
        blob = await response.blob();
      }

      if (!blob.type.startsWith('image/')) {
        throw new Error('To nie jest obraz');
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onImagesChange([...images, reader.result as string]);
        setUrlLoading(false);
        setUrlInput('');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setError('Błąd pobierania obrazu. Spróbuj zapisać i wgrać jako plik.');
      setUrlLoading(false);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-stone-600">
            Zdjęcia produktu
          </label>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            images.length >= maxImages 
              ? 'bg-green-100 text-green-700' 
              : 'bg-stone-100 text-stone-600'
          }`}>
            {images.length}/{maxImages}
          </span>
        </div>
        
        <div className="flex bg-stone-100 rounded-lg p-0.5">
          <button
            onClick={() => setInputMode('file')}
            className={`px-2 py-1 text-[10px] font-bold rounded ${
              inputMode === 'file' 
                ? 'bg-white shadow text-stone-800' 
                : 'text-stone-400'
            }`}
          >
            Pliki
          </button>
          <button
            onClick={() => setInputMode('url')}
            className={`px-2 py-1 text-[10px] font-bold rounded ${
              inputMode === 'url' 
                ? 'bg-white shadow text-stone-800' 
                : 'text-stone-400'
            }`}
          >
            Link
          </button>
        </div>
      </div>

      {/* Image Grid Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative aspect-square rounded overflow-hidden border border-stone-200 group"
            >
              <img src={img} className="w-full h-full object-cover" alt={`Product ${idx + 1}`} />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-1 
                         opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
              >
                <X size={10} />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-amber-500 text-white px-1 rounded">
                  GŁÓWNE
                </span>
              )}
            </div>
          ))}
          {images.length < maxImages && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded border-2 border-dashed border-stone-200 flex items-center 
                       justify-center cursor-pointer hover:bg-stone-50 hover:border-amber-300 
                       text-stone-300 hover:text-amber-400 transition-colors"
            >
              <PlusCircle size={24} />
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      {inputMode === 'file' ? (
        images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-40 rounded-lg border-2 border-dashed border-stone-300 
                     bg-stone-50 flex flex-col items-center justify-center cursor-pointer 
                     hover:bg-stone-100 hover:border-amber-400 transition-colors"
          >
            <ImageIcon className="mx-auto mb-2 text-stone-400" size={32} />
            <span className="text-sm text-stone-500 font-medium">
              Kliknij lub przeciągnij zdjęcia
            </span>
            <span className="text-xs text-stone-400 mt-1">
              Max {maxImages} zdjęć
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
              multiple
            />
          </div>
        ) : null
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Wklej URL obrazu..."
            className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
          />
          <button
            onClick={handleUrlLoad}
            disabled={urlLoading || !urlInput.trim()}
            className="bg-stone-800 text-white px-4 py-2 rounded text-xs font-bold 
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-900"
          >
            {urlLoading ? <Loader2 size={14} className="animate-spin" /> : 'Dodaj'}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
        multiple
      />
    </div>
  );
};
