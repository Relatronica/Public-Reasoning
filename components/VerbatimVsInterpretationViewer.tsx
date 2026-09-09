'use client';

import React, { useState } from 'react';
import { VerbatimQuote } from '@/types';
import { Quote, Columns, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  quotes?: VerbatimQuote[];
  interpretativeSummary?: string;
  officialUrl?: string;
  sourceLabel?: string;
}

export default function VerbatimVsInterpretationViewer({ quotes = [], interpretativeSummary, officialUrl, sourceLabel = 'Fonte' }: Props) {
  const [activeTab, setActiveTab] = useState<'split' | 'verbatim' | 'interpretation'>('split');

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* Header Comparativo */}
      <div className="bg-gray-50 border-b border-gray-200 p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Matrice di Distinzione: {sourceLabel} vs Interpretazione
            </h4>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Separazione netta tra le citazioni letterali e l&apos;analisi sintetica del compilatore.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vista Affiancata
          </button>
          <button
            onClick={() => setActiveTab('verbatim')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'verbatim' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Solo Citazioni
          </button>
          <button
            onClick={() => setActiveTab('interpretation')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'interpretation' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Solo Analisi
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className={`grid ${activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200' : 'grid-cols-1'} p-4 gap-4 bg-white`}>
        
        {/* Left: Verbatim Quotes */}
        {(activeTab === 'split' || activeTab === 'verbatim') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-blue-100">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase">
                <Quote className="w-3.5 h-3.5" />
                <span>Citazione Letterale Verbale</span>
              </div>
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {sourceLabel} verbatim
              </span>
            </div>

            <div className="space-y-2">
              {quotes && quotes.length > 0 ? (
                quotes.map((q) => (
                  <div key={q.id} className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg text-xs space-y-1.5">
                    <p className="italic text-gray-800 font-serif leading-relaxed">
                      &ldquo;{q.quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono pt-1">
                      <span className="font-semibold text-blue-800">{q.speaker || sourceLabel}</span>
                      <span>{q.pageOrParagraph}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Nessuna citazione letterale estratta per questa fonte.</p>
              )}
            </div>
          </div>
        )}

        {/* Right: Interpretation */}
        {(activeTab === 'split' || activeTab === 'interpretation') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-purple-100">
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs uppercase">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sintesi Interpretativa (Compilatore)</span>
              </div>
              <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                Ricostruzione Analitica
              </span>
            </div>

            <div className="p-3.5 bg-purple-50/40 border border-purple-100 rounded-lg text-xs space-y-2">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {interpretativeSummary || 'Nessuna sintesi interpretativa aggiuntiva.'}
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
