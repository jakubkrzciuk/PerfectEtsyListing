// ============================================
// DESCRIPTION EDITOR COMPONENT
// Full description with copy
// ============================================

import React from 'react';
import { Copy, FileText } from 'lucide-react';
import type { GeneratedContent } from '../types';
import { SEO_REQUIREMENTS } from '../config/constants';

interface DescriptionEditorProps {
  result: GeneratedContent;
  onResultChange: (result: GeneratedContent) => void;
  onCopy: () => void;
}

export const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
  result,
  onResultChange,
  onCopy
}) => {
  const descLength = result.description?.length || 0;
  const isLongEnough = descLength >= SEO_REQUIREMENTS.DESC_MIN_LENGTH;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-stone-400" />
          <h3 className="text-sm font-bold uppercase text-stone-500">Opis</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold ${
            isLongEnough ? 'text-green-600' : 'text-red-500'
          }`}>
            {descLength} / {SEO_REQUIREMENTS.DESC_MIN_LENGTH}+ znaków
          </span>
          <button
            onClick={onCopy}
            className="text-xs bg-stone-100 px-3 py-1 rounded font-bold hover:bg-stone-200"
          >
            KOPIUJ
          </button>
        </div>
      </div>

      <textarea
        className="w-full text-stone-600 text-sm bg-stone-50 p-4 rounded border 
                 border-stone-100 min-h-[400px] font-mono whitespace-pre-wrap
                 focus:outline-none focus:border-stone-300"
        value={result.description}
        onChange={(e) => onResultChange({ ...result, description: e.target.value })}
      />
    </div>
  );
};
