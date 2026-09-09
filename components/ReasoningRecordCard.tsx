'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Info,
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

  const getVerificationBadge = () => {
    const status = record.publicAct?.dataStatus;
    if (status === 'verified') {
      return (
        <span
          title={record.publicAct?.verificationNote}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <ShieldCheck className="w-3 h-3" />
          Atto Verificato
        </span>
      );
    }
    if (status === 'unverified') {
      return (
        <span
          title={record.publicAct?.verificationNote}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
        >
          <ShieldAlert className="w-3 h-3" />
          Da Verificare
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
        <Info className="w-3 h-3" />
        Dimostrativo
      </span>
    );
  };


  return (
    <article className="reddit-card overflow-hidden transition-all border border-gray-200/90 hover:border-gray-300">
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2.5">
            <span className="font-bold text-gray-900 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {record.publicAct?.entity?.city || 'Cormano (MI)'}
            </span>

            {record.category && (
              <Link
                href={`/?category=${encodeURIComponent(record.category)}`}
                className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                title={`Filtra per ${record.category}`}
              >
                {record.category}
              </Link>
            )}

            <span>•</span>

            <span className="font-medium text-gray-700">
              {record.publicAct?.actNumber}
            </span>

            <span>•</span>

            <span>Compilato da <strong className="text-gray-800">{record.compiler.name}</strong></span>

            {/* Badge di verifica del dato */}
            {getVerificationBadge()}

            <span className="ml-auto">{getUncertaintyBadge(record.uncertaintyLevel)}</span>
          </div>

          {/* Nota di verifica espandibile se il dato non è confermato */}
          {record.publicAct?.dataStatus === 'unverified' && record.publicAct?.verificationNote && (
            <div className="mb-2 flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/70 rounded-lg px-3 py-2">
              <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
              <span><strong>Nota:</strong> {record.publicAct.verificationNote}</span>
            </div>
          )}


          {/* 1. LA DOMANDA REALE (Titolo Principale Pulito) */}
          <div className="mb-2.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mb-0.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>La Domanda Reale</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug cursor-pointer hover:text-blue-700 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
              {record.realQuestion}
            </h2>
          </div>

          {/* 2. LA DECISIONE PRESA (Sintetica) */}
          <div className="mb-3 p-3 bg-gray-50/90 border border-gray-200/80 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block mb-0.5">
              Decisione Presa
            </span>
            <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
              {record.decision}
            </p>
          </div>

          {/* 3. SINTESI INDICATORI CHIAVE (Pills per scansione rapida) */}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
            {record.discardedOptions && record.discardedOptions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-lg text-[11px] font-semibold">
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{record.discardedOptions.length} Opzion{record.discardedOptions.length === 1 ? 'e Scartata' : 'i Scartate'}</span>
              </span>
            )}

            {record.mindChangingConditions && record.mindChangingConditions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200/70 text-rose-900 rounded-lg text-[11px] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{record.mindChangingConditions.length} Condizion{record.mindChangingConditions.length === 1 ? 'e di Falsificabilità' : 'i di Falsificabilità'}</span>
              </span>
            )}

            {record.outcomeReviews && record.outcomeReviews.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verifica 6M/12M {record.outcomeReviews.some(r => r.status === 'verified_true') ? 'Confermata' : 'Attiva'}</span>
              </span>
            )}
          </div>

          {/* SEZIONE DETTAGLIATA ESPANDIBILE */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-in fade-in duration-200">
              
              {/* Opzioni Scartate */}
              {record.discardedOptions && record.discardedOptions.length > 0 && (
                <div>
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

              {/* Condizioni di Falsificabilità */}
              {record.mindChangingConditions && record.mindChangingConditions.length > 0 && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs">
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

              {/* Verifiche a Posteriori Status */}
              {record.outcomeReviews && record.outcomeReviews.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {record.outcomeReviews.map(rev => (
                    <div key={rev.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border ${rev.status === 'verified_true' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rev.status === 'verified_true' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>Verifica {rev.timeframe.replace('_', ' ')}: {rev.status === 'verified_true' ? 'Confermata con Dati' : 'In Attesa'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Citazioni Letterali & Sintesi Interpretativa */}
              <VerbatimVsInterpretationViewer 
                quotes={record.verbatimQuotes}
                interpretativeSummary={record.interpretativeSummary}
                officialUrl={record.publicAct?.officialUrl}
              />

            </div>
          )}

          {/* BOTTOM TOOLBAR */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
            >
              <span>{isExpanded ? 'Comprimi Scheda' : 'Esplora Motivazioni, Rischi e Atti'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3">
              {/* PDF: locale archiviato > link diretto portale > portale generico */}
              <a
                href={
                  record.publicAct?.localPdfPath
                    || record.publicAct?.officialUrl
                    || 'https://cormano.trasparenza-valutazione-merito.it/web/trasparenza/albo-pretorio'
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                title={
                  record.publicAct?.localPdfPath
                    ? 'Apri il PDF archiviato (copia locale dalla fonte ufficiale)'
                    : record.publicAct?.dataStatus === 'verified'
                      ? 'Apri il PDF direttamente dal portale ufficiale Comune di Cormano'
                      : 'Cerca l\'atto sul portale Albo Pretorio (verifica in corso)'
                }
              >
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">
                  {record.publicAct?.localPdfPath
                    ? '📄 PDF (copia locale)'
                    : record.publicAct?.dataStatus === 'verified'
                      ? '📄 Apri PDF'
                      : 'Cerca atto ufficiale'
                  }
                </span>
                <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
              </a>

              <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                <Share2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">Condividi</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}
