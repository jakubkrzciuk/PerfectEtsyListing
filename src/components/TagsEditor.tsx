// ============================================
// TAGS EDITOR COMPONENT
// Edit and manage tags for Etsy SEO
// ============================================

import React, { useState } from 'react';
import { X, Plus, Hash, Sparkles } from 'lucide-react';

interface TagsEditorProps {
  tags: string[];
  powerKeywords: string[];
  onUpdate: (newTags: string[]) => void;
}

export const TagsEditor: React.FC<TagsEditorProps> = ({
  tags,
  powerKeywords,
  onUpdate
}) => {
  const [newTag, setNewTag] = useState('');

  const handleRemoveTag = (index: number) => {
    onUpdate(tags.filter((_, i) => i !== index));
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;

    const updated = [...tags, trimmed].slice(0, 13);
    onUpdate(updated);
    setNewTag('');
  };

  const availableKeywords = powerKeywords.filter(k => !tags.includes(k));

  return (
    <div className="space-y-6">
      {/* Current Tags Grid */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-stone-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm group border border-white/10"
          >
            <Hash size={10} className="text-amber-400" />
            {tag}
            <button
              onClick={() => handleRemoveTag(idx)}
              className="hover:text-red-400 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {tags.length < 13 && (
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTag)}
              placeholder="Dodaj tag..."
              className="bg-transparent text-[10px] font-bold outline-none w-20"
            />
            <button onClick={() => handleAddTag(newTag)} className="text-stone-400 hover:text-stone-900">
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
        <span>Limit tagów Etsy</span>
        <span className={tags.length === 13 ? 'text-green-500' : 'text-amber-500'}>
          {tags.length} / 13
        </span>
      </div>

      {/* Suggested Keywords */}
      {availableKeywords.length > 0 && (
        <div className="pt-6 border-t border-stone-100">
          <p className="text-[10px] font-black uppercase text-stone-500 mb-4 flex items-center gap-1.5">
            <Sparkles size={10} className="text-amber-500" /> Propozycje Słów Kluczowych
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-2 scrollbar-thin">
            {availableKeywords.map((k, i) => (
              <button
                key={i}
                onClick={() => handleAddTag(k)}
                disabled={tags.length >= 13}
                className="px-2.5 py-1 bg-white border border-stone-200 text-stone-500 text-[10px] font-bold rounded-lg hover:border-amber-400 hover:text-amber-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                + {k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
