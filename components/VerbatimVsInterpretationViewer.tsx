'use client';

import React, { useState } from 'react';
import { VerbatimQuote } from '@/types';
import { ExternalLink } from 'lucide-react';

interface Props {
  quotes?: VerbatimQuote[];
  interpretativeSummary?: string;
  officialUrl?: string;
  sourceLabel?: string;
}

export default function VerbatimVsInterpretationViewer({
  quotes = [],
  interpretativeSummary,
  officialUrl,
  sourceLabel = 'Fonte',
}: Props) {
  const [activeTab, setActiveTab] = useState<'split' | 'verbatim' | 'interpretation'>('split');
  const hasQuotes = quotes.length > 0;
  const hasSummary = Boolean(interpretativeSummary?.trim());

  if (!hasQuotes && !hasSummary) {
    return (
      <p className="text-sm text-gray-500">
        Nessuna citazione o sintesi collegata a questa scheda.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Fonte e lettura
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Cosa dice il verbale e come il compilatore lo legge.
          </p>
        </div>

        <div className="flex items-center gap-1">
          {(
            [
              ['split', 'Entrambi'],
              ['verbatim', 'Citazioni'],
              ['interpretation', 'Analisi'],
            ] as const
          ).map(([id, label]) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-gray-900 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {officialUrl && (
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Apri documento ufficiale
        </a>
      )}

      <div
        className={`grid gap-6 ${
          activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {(activeTab === 'split' || activeTab === 'verbatim') && (
          <section className="space-y-3 min-w-0">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Citazioni
            </h5>
            {hasQuotes ? (
              <div className="space-y-3">
                {quotes.map((q) => (
                  <figure key={q.id} className="border-l-2 border-gray-200 pl-3 py-0.5">
                    <blockquote className="text-sm italic text-gray-800 leading-relaxed">
                      «{q.quote}»
                    </blockquote>
                    <figcaption className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
                      <span className="font-medium text-gray-700">{q.speaker || sourceLabel}</span>
                      {q.pageOrParagraph && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span>{q.pageOrParagraph}</span>
                        </>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nessuna citazione letterale.</p>
            )}
          </section>
        )}

        {(activeTab === 'split' || activeTab === 'interpretation') && (
          <section className="space-y-3 min-w-0">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sintesi del compilatore
            </h5>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {hasSummary ? interpretativeSummary : 'Nessuna sintesi interpretativa.'}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
