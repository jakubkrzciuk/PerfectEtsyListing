// ============================================
// SEO SCORE COMPONENT
// Visual SEO checklist
// ============================================

import React from 'react';
import { CheckCircle2, AlertTriangle, ListChecks } from 'lucide-react';
import type { SeoAnalysis } from '../types';

interface SeoScoreProps {
  analysis: SeoAnalysis;
}

export const SeoScore: React.FC<SeoScoreProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-900 text-green-400 border-green-700';
    return 'bg-amber-900 text-amber-400 border-amber-700';
  };

  return (
    <div className="bg-stone-900 text-white p-6 rounded-xl shadow-lg border border-stone-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-serif flex items-center gap-2">
          <ListChecks className="text-amber-400" /> 
          Checklist 2026
        </h3>
        <div className={`px-4 py-1 rounded-full text-sm font-bold border ${getScoreBadgeColor(analysis.score)}`}>
          {analysis.score}/100
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-800 rounded-full h-2.5 mb-6">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getScoreColor(analysis.score)}`}
          style={{ width: `${analysis.score}%` }}
        />
      </div>

      {/* Checks Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <CheckItem 
          passed={analysis.checks.titleLength}
          label="Tytuł (120-140 znaków)"
        />
        <CheckItem 
          passed={analysis.checks.descLength}
          label="Opis > 1000 znaków"
        />
        <CheckItem 
          passed={analysis.checks.tagCount}
          label="13 tagów"
        />
        <CheckItem 
          passed={analysis.checks.variety}
          label="Brak spamu słownego"
        />
        <CheckItem 
          passed={analysis.checks.keywordStart}
          label="Mocny start (Mobile)"
        />
        <CheckItem 
          passed={analysis.checks.uniqueTags}
          label="Ekskluzywne tagi"
        />
        <CheckItem 
          passed={analysis.checks.punctuation}
          label="Czysty tytuł (bez Caps)"
        />
        <CheckItem 
          passed={analysis.checks.nameAtEnd}
          label="Nazwa na końcu"
        />
      </div>

      {/* Warning Area */}
      <div className="mt-4 space-y-2">
        {analysis.repeatedKeywords.length > 0 && (
          <div className="p-2 bg-red-900/30 text-red-300 text-[10px] rounded flex items-start gap-2 border border-red-800/30">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>Spam (powtórzenia): {analysis.repeatedKeywords.join(', ')}</span>
          </div>
        )}
        {analysis.duplicates.length > 3 && (
          <div className="p-2 bg-amber-900/30 text-amber-300 text-[10px] rounded flex items-start gap-2 border border-amber-800/30">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>Duplikacja tagów: {analysis.duplicates.length} tagów powtórzonych w tytule.</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface CheckItemProps {
  passed: boolean;
  label: string;
}

const CheckItem: React.FC<CheckItemProps> = ({ passed, label }) => (
  <div className={`flex items-center gap-2 p-2 rounded ${
    passed 
      ? 'bg-green-900/30 text-green-300' 
      : 'bg-red-900/30 text-red-300'
  }`}>
    {passed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
    <span>{label}</span>
  </div>
);
