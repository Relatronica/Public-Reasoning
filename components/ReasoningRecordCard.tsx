'use client';

import React, { useState } from 'react';
import { ReasoningRecord } from '@/types';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MapPin, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Bookmark, 
  Quote, 
  ExternalLink,
  Calendar,
  UserCheck
} from 'lucide-react';
import VerbatimVsInterpretationViewer from './VerbatimVsInterpretationViewer';

interface Props {
  record: ReasoningRecord;
}

export default function ReasoningRecordCard({ record }: Props) {
  const [upvotes, setUpvotes] = useState(record.upvotes || 12);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVote = (direction: 'up' | 'down') => {
    if (voteState === direction) {
      setVoteState(null);
      setUpvotes(prev => direction === 'up' ? prev - 1 : prev + 1);
    } else {
      const diff = voteState === null ? 1 : 2;
      setVoteState(direction);
      setUpvotes(prev => direction === 'up' ? prev + diff : prev - diff);
    }
  };

  const getUncertaintyBadge = (level: string) => {
    switch (level) {
      case 'basso':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Incertezza Bassa</span>;
      case 'medio':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Incertezza Media</span>;
      case 'alto':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Incertezza Alta</span>;
      default:
        return null;
    }
  };

  return (
    <article className="reddit-card overflow-hidden">
      <div className="flex">
        
        {/* Reddit-style Upvote Sidebar */}
        <div className="w-11 bg-gray-50/80 p-2 border-r border-gray-100 flex flex-col items-center pt-3 flex-shrink-0">
          <button 
            onClick={() => handleVote('up')}
            className={`p-1 rounded hover:bg-gray-200/60 transition-colors ${voteState === 'up' ? 'text-blue-600' : 'text-gray-400'}`}
            title="Utile / Rilevante"
          >
            <ArrowBigUp className={`w-6 h-6 ${voteState === 'up' ? 'fill-blue-600' : ''}`} />
          </button>
          
          <span className={`text-xs font-bold my-0.5 ${voteState === 'up' ? 'text-blue-600' : voteState === 'down' ? 'text-rose-600' : 'text-gray-700'}`}>
            {upvotes}
          </span>

          <button 
            onClick={() => handleVote('down')}
            className={`p-1 rounded hover:bg-gray-200/60 transition-colors ${voteState === 'down' ? 'text-rose-600' : 'text-gray-400'}`}
            title="Non rilevante"
          >
            <ArrowBigDown className={`w-6 h-6 ${voteState === 'down' ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-5">
          
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="font-bold text-gray-900 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {record.publicAct?.entity?.city || 'Cormano (MI)'}
            </span>

            {record.category && (
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {record.category}
              </span>
            )}

            <span>•</span>

            <span className="font-medium text-gray-700">
              {record.publicAct?.actNumber}
            </span>

            <span>•</span>

            <span>Compilato da <strong className="text-gray-800">{record.compiler.name}</strong></span>

            <span className="ml-auto">{getUncertaintyBadge(record.uncertaintyLevel)}</span>
          </div>

          {/* 1. LA DOMANDA REALE (Titolo Principale) */}
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>La Domanda Reale</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {record.realQuestion}
            </h2>
          </div>

          {/* 2. LA DECISIONE PRESA */}
          <div className="mb-4 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-1">
              La Decisione Presa
            </div>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">
              {record.decision}
            </p>
          </div>

          {/* 3. OPZIONI SCARTATE (Grid/Pills) */}
          {record.discardedOptions && record.discardedOptions.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Opzioni Scartate e Motivazioni ({record.discardedOptions.length})</span>
              </div>

              <div className="space-y-2">
                {record.discardedOptions.map((opt) => (
                  <div key={opt.id} className="p-3 bg-gray-50 border border-gray-200/80 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-semibold text-gray-900 mb-1">
                      <span>❌ {opt.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${opt.evidenceType === 'verbatim' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                        {opt.evidenceType === 'verbatim' ? 'Da Verbale' : 'Interpretata'}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{opt.reasonDiscarded}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. CONDIZIONI DI FALSIFICABILITÀ */}
          {record.mindChangingConditions && record.mindChangingConditions.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl text-xs">
              <div className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Condizioni di Falsificabilità (Cosa farebbe cambiare idea)</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-gray-700">
                {record.mindChangingConditions.map((cond, idx) => (
                  <li key={idx}>{cond}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. VERIFICA A POSTERIORI STATUS */}
          {record.outcomeReviews && record.outcomeReviews.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {record.outcomeReviews.map(rev => (
                <div key={rev.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border ${rev.status === 'verified_true' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${rev.status === 'verified_true' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>Verifica {rev.timeframe.replace('_', ' ')}: {rev.status === 'verified_true' ? 'Confermata con Dati' : 'In Attesa'}</span>
                </div>
              ))}
            </div>
          )}

          {/* EXPANDABLE SECTION (Citazioni Letterali & Sintesi Interpretativa) */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <VerbatimVsInterpretationViewer 
                quotes={record.verbatimQuotes}
                interpretativeSummary={record.interpretativeSummary}
                officialUrl={record.publicAct?.officialUrl}
              />
            </div>
          )}

          {/* BOTTOM TOOLBAR */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>{isExpanded ? 'Nascondi Citazioni Ufficiali & Analisi' : 'Vedi Citazioni Ufficiali & Analisi Dettagliata'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3">
              <a
                href={record.publicAct?.officialUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                title="Atto originale Albo Pretorio"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Atto Ufficiale</span>
              </a>

              <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Condividi</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}
