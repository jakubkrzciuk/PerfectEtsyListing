// ============================================
// ETSY PREVIEW COMPONENT
// Premium 2026 visualization
// ============================================

import React, { useState } from 'react';
import { Monitor, Smartphone, Eye, ShoppingCart, Star, Heart, Share2, BadgeCheck } from 'lucide-react';
import type { GeneratedContent } from '../types';

interface EtsyPreviewProps {
  title: string;
  description: string;
  tags: string[];
  images: string[];
  shop: string;
}

export const EtsyPreview: React.FC<EtsyPreviewProps> = ({
  title,
  description,
  tags,
  images,
  shop
}) => {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const mainImage = images[0] || '';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-inner">
          <button
            onClick={() => setView('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'desktop' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'mobile' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-stone-400 tracking-widest">
          <BadgeCheck size={14} className="text-blue-500" /> Symulacja Algorytmu Etsy
        </div>
      </div>

      {view === 'desktop' ? (
        /* DESKTOP VIEW */
        <div className="bg-white rounded-[32px] border border-stone-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 flex gap-10">
            {/* Image Gallery Simulation */}
            <div className="w-[45%] space-y-4">
              <div className="aspect-[4/5] bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 shadow-inner">
                {mainImage ? (
                  <img src={mainImage} className="w-full h-full object-cover" alt="Primary" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-200"><Eye size={48} /></div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {images.slice(1, 5).map((img, i) => (
                  <div key={i} className="aspect-square bg-stone-50 rounded-lg overflow-hidden border border-stone-100">
                    <img src={img} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="" />
                  </div>
                ))}
                {images.length < 5 && Array(Math.max(0, 4 - (images.length - 1))).fill(0).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-stone-50 rounded-lg border border-dashed border-stone-200" />
                ))}
              </div>
            </div>

            {/* Content Side */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-bold text-stone-900 underline">{shop}</span>
                  <span>•</span>
                  <div className="flex text-amber-500"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
                  <span>(482 sales)</span>
                </div>
                <h1 className="text-2xl font-serif text-stone-900 leading-tight line-clamp-3">{title || 'Your Listing Title Here'}</h1>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-2xl font-bold text-stone-900 mb-1">USD 145.00+</p>
                <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                  <BadgeCheck size={12} /> FREE shipping to Poland
                </p>

                <button className="w-full mt-6 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> Add to cart
                </button>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 flex items-center justify-center gap-2 hover:bg-stone-50 transition-all">
                  <Heart size={14} /> Add to collection
                </button>
                <button className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 flex items-center justify-center gap-2 hover:bg-stone-50 transition-all">
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MOBILE VIEW */
        <div className="max-w-[340px] mx-auto bg-white rounded-[40px] border-[8px] border-stone-900 overflow-hidden shadow-2xl">
          <div className="h-6 bg-stone-900 flex justify-center items-end pb-1.5 px-6">
            <div className="w-16 h-1 bg-stone-800 rounded-full"></div>
          </div>
          <div className="overflow-y-auto h-[600px] bg-white scrollbar-hide">
            <div className="aspect-square bg-stone-50 relative">
              {mainImage && <img src={mainImage} className="w-full h-full object-cover" alt="" />}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm"><Heart size={16} /></div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{shop}</span>
                <div className="flex text-amber-500"><Star size={8} fill="currentColor" /><Star size={8} fill="currentColor" /><Star size={8} fill="currentColor" /><Star size={8} fill="currentColor" /><Star size={8} fill="currentColor" /></div>
              </div>

              <h2 className="text-sm font-bold text-stone-900 leading-snug">
                {title.substring(0, 45)}... <span className="text-blue-500 font-normal underline">Read more</span>
              </h2>

              <div className="space-y-1">
                <p className="text-lg font-bold text-stone-900">USD 145.00</p>
                <p className="text-[10px] text-green-600 font-bold">FREE shipping</p>
              </div>

              <button className="w-full py-3.5 bg-stone-900 text-white rounded-full font-bold text-xs">Add to cart</button>

              <div className="pt-6 mt-6 border-t border-stone-100">
                <h4 className="text-[10px] font-bold uppercase text-stone-400 mb-3">Item details</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">{description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
