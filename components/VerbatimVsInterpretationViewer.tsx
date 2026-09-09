'use client';

import React, { useState } from 'react';
import { VerbatimQuote } from '@/types';
import { Quote, BookOpen } from 'lucide-react';

interface Props {
  quotes?: VerbatimQuote[];
  interpretativeSummary?: string;
  officialUrl?: string;
  sourceLabel?: string;
}

export default function VerbatimVsInterpretationViewer({
  quotes = [],
  interpretativeSummary,
  sourceLabel = 'Fonte',
}: Props) {
  const [activeTab, setActiveTab] = useState<'split' | 'verbatim' | 'interpretation'>('split');
  const hasQuotes = quotes.length > 0;
  const hasSummary = Boolean(interpretativeSummary?.trim());

  if (!hasQuotes && !hasSummary) {
    return (
      <p className="text-xs text-gray-400 italic p-3 border border-dashed border-gray-200 rounded-xl">
        Nessuna citazione o sintesi collegata a questa scheda.
      </p>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
            Fonte vs interpretazione
          </h4>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Cosa dice il verbale e come il compilatore lo legge.
          </p>
        </div>

        <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg">
          {(
            [
              ['split', 'Entrambi'],
              ['verbatim', 'Citazioni'],
              ['interpretation', 'Analisi'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                activeTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid p-3 gap-3 ${
          activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {(activeTab === 'split' || activeTab === 'verbatim') && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[10px] uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5" />
              Citazioni
            </div>
            {hasQuotes ? (
              quotes.map((q) => (
                <figure key={q.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <blockquote className="text-xs italic text-gray-800 leading-relaxed">
                    «{q.quote}»
                  </blockquote>
                  <figcaption className="mt-2 flex items-center justify-between gap-2 text-[10px] text-gray-500">
                    <span className="font-semibold text-blue-800">{q.speaker || sourceLabel}</span>
                    {q.pageOrParagraph && <span>{q.pageOrParagraph}</span>}
                  </figcaption>
                </figure>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">Nessuna citazione letterale.</p>
            )}
          </div>
        )}

        {(activeTab === 'split' || activeTab === 'interpretation') && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-violet-700 font-bold text-[10px] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Sintesi del compilatore
            </div>
            <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-lg text-xs text-gray-800 leading-relaxed whitespace-pre-line">
              {hasSummary ? interpretativeSummary : 'Nessuna sintesi interpretativa.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
