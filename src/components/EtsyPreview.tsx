// ============================================
// ETSY PREVIEW COMPONENT
// Visual preview of how listing looks on Etsy
// ============================================

import React from 'react';
import { Monitor, Smartphone, Eye } from 'lucide-react';
import type { GeneratedContent } from '../types';

interface EtsyPreviewProps {
  title: string;
  mainImage: string;
}

export const EtsyPreview: React.FC<EtsyPreviewProps> = ({ title, mainImage }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
      <h3 className="text-sm font-bold uppercase text-stone-500 tracking-wide mb-4 flex items-center gap-2">
        <Eye size={16} /> Podgląd na Etsy
      </h3>

      {/* Desktop Preview */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
          <Monitor size={14} /> Desktop
        </div>
        <div className="flex gap-4 p-3 border border-stone-100 rounded-lg hover:shadow-md transition-shadow">
          <div className="w-32 h-24 bg-stone-100 rounded overflow-hidden flex-shrink-0">
            {mainImage ? (
              <img src={mainImage} className="w-full h-full object-cover" alt="Product" />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-stone-800 font-serif text-sm leading-snug mb-1 line-clamp-2">
              {title}
            </h4>
            <p className="text-stone-500 text-xs mb-1">LaleStudio • ⭐⭐⭐⭐⭐ (482)</p>
            <p className="text-stone-900 font-bold text-sm">
              USD 145.00 <span className="text-green-600 text-[10px] font-normal">FREE shipping</span>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
          <Smartphone size={14} /> Mobile (tytuł ucięty!)
        </div>
        <div className="w-48 border border-stone-200 rounded-lg overflow-hidden shadow-sm mx-auto">
          <div className="w-full h-40 bg-stone-100 relative">
            {mainImage ? (
              <img src={mainImage} className="w-full h-full object-cover" alt="Product" />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
              <Eye size={12} />
            </div>
          </div>
          <div className="p-2">
            <h4 className="text-stone-800 font-serif text-xs leading-snug mb-1 h-8 overflow-hidden" title={title}>
              {title.substring(0, 45)}...
            </h4>
            <p className="text-stone-900 font-bold text-xs">USD 145.00</p>
            <p className="text-green-600 text-[10px]">FREE shipping</p>
          </div>
        </div>
      </div>
    </div>
  );
};
