// ============================================
// IMAGE UPLOADER COMPONENT
// Drag & drop, preview, validation
// ============================================

import React, { useRef, useState } from 'react';
import { Image as ImageIcon, X, PlusCircle, Link as LinkIcon, Loader2, Search, Zap } from 'lucide-react';
import { validateImageFile, resizeImage } from '../utils/imageProcessing';
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

    // Convert and COMPRESS all files
    setIsProcessing(true);
    const readFile = (file: File): Promise<string> =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

    Promise.all(validFiles.map(readFile))
      .then(async base64Array => {
        const compressedArray = await Promise.all(
          base64Array.map(async b64 => {
            const processed = await resizeImage(b64);
            return `data:image/jpeg;base64,${processed.data}`;
          })
        );
        onImagesChange([...images, ...compressedArray]);
        setError(null);
      })
      .catch(() => setError('Błąd podczas optymalizacji zdjęć'))
      .finally(() => setIsProcessing(false));

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
      let blob: Blob | null = null;
      
      // Validation: Check if it's a known product page instead of an image
      const isProductPage = /etsy\.com\/listing|pinterest\.com\/pin|amazon\.|allegro\./i.test(url);
      if (isProductPage && !url.match(/\.(jpg|jpeg|png|webp|avif)/i)) {
        throw new Error('Wkleiłeś link do STRONY produktu, a nie do SAMEGO ZDJĘCIA. Kliknij PRAWYM PRZYCISKIEM na zdjęcie i wybierz "Kopiuj adres obrazu".');
      }

      const proxies = [
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
        (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
      ];

      // Try direct fetch
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { mode: 'cors', signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) blob = await res.blob();
      } catch (e) {
        console.log('Direct fetch blocked or timed out, trying proxies...');
      }

      // Try proxies if direct failed
      if (!blob) {
        for (const getProxyUrl of proxies) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(getProxyUrl(url), { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
              blob = await res.blob();
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }

      if (!blob) {
        throw new Error('Wszystkie próby pobrania zdjęcia zawiodły. Strona blokuje dostęp. Najlepiej zapisz zdjęcie na dysku i przeciągnij je tutaj.');
      }

      const contentType = blob.type;
      if (!contentType.startsWith('image/')) {
        throw new Error(`Podany link nie jest obrazem (typ: ${contentType}). Upewnij się, że kopiujesz "Adres obrazu".`);
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setIsProcessing(true);
        try {
          const processed = await resizeImage(base64);
          onImagesChange([...images, `data:image/jpeg;base64,${processed.data}`]);
          setUrlInput('');
        } catch {
          setError('Błąd optymalizacji zdjęcia z URL');
        } finally {
          setIsProcessing(false);
          setUrlLoading(false);
        }
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
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${images.length >= maxImages
              ? 'bg-green-100 text-green-700'
              : 'bg-stone-100 text-stone-600'
            }`}>
            {images.length}/{maxImages}
          </span>
        </div>

        <div className="flex bg-stone-100 rounded-lg p-0.5">
          <button
            onClick={() => setInputMode('file')}
            className={`px-2 py-1 text-[10px] font-bold rounded ${inputMode === 'file'
                ? 'bg-white shadow text-stone-800'
                : 'text-stone-400'
              }`}
          >
            Pliki
          </button>
          <button
            onClick={() => setInputMode('url')}
            className={`px-2 py-1 text-[10px] font-bold rounded ${inputMode === 'url'
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
              className="relative aspect-square rounded overflow-hidden border border-stone-200 group cursor-zoom-in"
              onClick={() => setPreviewImage(img)}
            >
              <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Product ${idx + 1}`} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
              </div>
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
                     hover:bg-stone-100 hover:border-amber-400 transition-colors group overflow-hidden"
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-stone-900/5 backdrop-blur-[2px] flex flex-col items-center justify-center animate-fade-in z-10">
                <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <Loader2 className="animate-spin text-amber-500" size={20} />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-stone-900">Optymalizacja...</p>
                    <p className="text-[10px] text-stone-500">Zmniejszamy wagę dla Vercel</p>
                  </div>
                </div>
              </div>
            )}
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

      {inputMode === 'url' && (
        <div className="mt-2 space-y-2">
            <p className="text-[10px] text-stone-400 italic">
                💡 Wskazówka: Kliknij prawym przyciskiem na zdjęcie w internecie i wybierz "Kopiuj adres obrazu". Link powinien kończyć się na .jpg, .png lub .webp.
            </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-red-500 text-[11px] font-bold flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
          <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          {error}
        </p>
      )}
    {/* ===== LIGHTBOX MODAL ===== */}
    {previewImage && (
      <div 
        className="fixed inset-0 z-[200] bg-stone-950/95 backdrop-blur-xl flex flex-col animate-fade-in"
        onClick={() => setPreviewImage(null)}
      >
        <button 
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-10"
          onClick={() => setPreviewImage(null)}
        >
          <X size={32} />
        </button>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-20 overflow-hidden">
          <img 
            src={previewImage} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-zoom-in"
            alt="Preview"
          />
        </div>
      </div>
    )}
    </div>
  );
};
