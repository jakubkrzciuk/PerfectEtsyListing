// ============================================
// TAGS EDITOR COMPONENT
// Edit and manage tags
// ============================================

import React from 'react';
import { X } from 'lucide-react';
import type { GeneratedContent } from '../types';

interface TagsEditorProps {
  result: GeneratedContent;
  onResultChange: (result: GeneratedContent) => void;
  powerKeywords: string[];
}

export const TagsEditor: React.FC<TagsEditorProps> = ({
  result,
  onResultChange,
  powerKeywords
}) => {
  const handleRemoveTag = (index: number) => {
    const newTags = result.tags.filter((_, i) => i !== index);
    onResultChange({ ...result, tags: newTags });
  };

  const handleAddTag = (tag: string) => {
    if (result.tags.includes(tag)) return;
    
    let newTags = [...result.tags, tag];
    if (newTags.length > 13) {
      newTags = newTags.slice(0, 13);
    }
    onResultChange({ ...result, tags: newTags });
  };

  const availableKeywords = powerKeywords.filter(k => !result.tags.includes(k));

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase text-stone-500">Tagi</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          result.tags.length === 13 
            ? 'bg-green-100 text-green-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          {result.tags.length}/13
        </span>
      </div>

      {/* Current Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {result.tags.map((tag, idx) => (
          <div
            key={idx}
            className="bg-amber-50 text-amber-900 text-sm px-3 py-1.5 rounded 
                     border border-amber-200 flex items-center gap-2 group"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(idx)}
              className="text-amber-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {result.tags.length === 0 && (
          <span className="text-stone-400 text-sm italic">Brak tagów</span>
        )}
      </div>

      {/* Available Keywords */}
      {availableKeywords.length > 0 && (
        <>
          <p className="text-xs text-stone-400 mb-2">Dostępne słowa kluczowe:</p>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-100 max-h-40 overflow-y-auto">
            {availableKeywords.slice(0, 20).map((k, i) => (
              <button
                key={i}
                onClick={() => handleAddTag(k)}
                disabled={result.tags.length >= 13}
                className="px-3 py-1 bg-white border border-stone-200 text-stone-500 
                         text-xs rounded hover:bg-amber-50 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-colors"
              >
                + {k}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
