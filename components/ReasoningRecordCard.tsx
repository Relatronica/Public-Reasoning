'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ReasoningRecord } from '@/types';
import {
  ArrowBigUp,
  ArrowBigDown,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import VerbatimVsInterpretationViewer from './VerbatimVsInterpretationViewer';
import AiAssistancePanel, { AiAssistanceBadge } from './AiAssistancePanel';
import { displayStatusLabel, isClosedStatus, isEnterpriseCommunityType, resolveVisibility } from '@/lib/records';

interface Props {
  record: ReasoningRecord;
}

export default function ReasoningRecordCard({ record }: Props) {
  const [upvotes, setUpvotes] = useState(record.upvotes || 12);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const showVotes = !isEnterpriseCommunityType(record.publicAct?.entity?.type ?? 'comune');
  const visibility = resolveVisibility(record);
  const statusLabel = displayStatusLabel(record.status);

  const handleVote = (direction: 'up' | 'down') => {
    if (voteState === direction) {
      setVoteState(null);
      setUpvotes(prev => (direction === 'up' ? prev - 1 : prev + 1));
    } else {
      const diff = voteState === null ? 1 : 2;
      setVoteState(direction);
      setUpvotes(prev => (direction === 'up' ? prev + diff : prev - diff));
    }
  };

  const uncertaintyClass =
    record.uncertaintyLevel === 'alto'
      ? 'text-rose-700'
      : record.uncertaintyLevel === 'medio'
        ? 'text-amber-700'
        : 'text-emerald-700';

  const sourceHref =
    record.publicAct?.localPdfPath
    || record.publicAct?.officialUrl
    || record.publicAct?.entity?.officialUrl;

  return (
    <article className="reddit-card overflow-hidden border border-gray-200/90 hover:border-gray-300">
      <div className="flex">
        {showVotes ? (
        <div className="w-11 bg-gray-50/80 p-2 border-r border-gray-100 flex flex-col items-center pt-3 flex-shrink-0">
          <button
            onClick={() => handleVote('up')}
            className={`p-1 rounded hover:bg-gray-200/60 ${voteState === 'up' ? 'text-blue-600' : 'text-gray-400'}`}
            title="Utile"
          >
            <ArrowBigUp className={`w-6 h-6 ${voteState === 'up' ? 'fill-blue-600' : ''}`} />
          </button>
          <span className={`text-xs font-bold my-0.5 ${voteState === 'up' ? 'text-blue-600' : voteState === 'down' ? 'text-rose-600' : 'text-gray-700'}`}>
            {upvotes}
          </span>
          <button
            onClick={() => handleVote('down')}
            className={`p-1 rounded hover:bg-gray-200/60 ${voteState === 'down' ? 'text-rose-600' : 'text-gray-400'}`}
            title="Non rilevante"
          >
            <ArrowBigDown className={`w-6 h-6 ${voteState === 'down' ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
        ) : (
          <div className="w-2 bg-indigo-50 border-r border-indigo-100 flex-shrink-0" />
        )}

        <div className="flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-2">
            {record.category && (
              <Link
                href={`/?c=${encodeURIComponent(record.publicAct?.entity?.slug || 'cormano')}&category=${encodeURIComponent(record.category)}`}
                className="font-semibold text-blue-700 hover:underline"
              >
                {record.category}
              </Link>
            )}
            {record.publicAct?.actNumber && (
              <>
                <span>·</span>
                <span>{record.publicAct.actNumber}</span>
              </>
            )}
            <span>·</span>
            <span className={uncertaintyClass}>
              Incertezza {record.uncertaintyLevel}
            </span>
            {record.publicAct?.dataStatus === 'unverified' && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <ShieldAlert className="w-3 h-3" />
                Da verificare
              </span>
            )}
            {!isClosedStatus(record.status) && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                {statusLabel}
              </span>
            )}
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded font-semibold ${
                visibility === 'private'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {visibility === 'private' ? 'Privato' : 'Registro pubblico'}
            </span>
            <AiAssistanceBadge ai={record.aiAssistance} />
          </div>

          <h2
            className="text-base sm:text-lg font-bold text-gray-900 leading-snug cursor-pointer hover:text-blue-700"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {record.realQuestion}
          </h2>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">
            {record.decision}
          </p>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              {record.discardedOptions && record.discardedOptions.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Opzioni scartate</span>
                  </div>
                  <div className="space-y-2">
                    {record.discardedOptions.map((opt) => (
                      <div key={opt.id} className="p-3 bg-gray-50 border border-gray-200/80 rounded-lg text-xs">
                        <div className="flex items-center justify-between font-semibold text-gray-900 mb-1 gap-2">
                          <span>{opt.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal shrink-0 ${opt.evidenceType === 'verbatim' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                            {opt.evidenceType === 'verbatim' ? 'Verbatim' : 'Interpretata'}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{opt.reasonDiscarded}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AiAssistancePanel ai={record.aiAssistance} />

              {record.mindChangingConditions && record.mindChangingConditions.length > 0 && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs">
                  <div className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Cosa farebbe cambiare idea</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-700">
                    {record.mindChangingConditions.map((cond, idx) => (
                      <li key={idx}>{cond}</li>
                    ))}
                  </ul>
                </div>
              )}

              {record.outcomeReviews && record.outcomeReviews.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {record.outcomeReviews.map(rev => (
                    <div key={rev.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border ${rev.status === 'verified_true' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rev.status === 'verified_true' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>Verifica {rev.timeframe.replace('_', ' ')}: {rev.status === 'verified_true' ? 'Confermata' : 'In attesa'}</span>
                    </div>
                  ))}
                </div>
              )}

              <VerbatimVsInterpretationViewer
                quotes={record.verbatimQuotes}
                interpretativeSummary={record.interpretativeSummary}
                officialUrl={record.publicAct?.officialUrl || record.publicAct?.entity?.officialUrl}
                sourceLabel={record.publicAct?.entity?.sourceLabel}
              />
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>{isExpanded ? 'Chiudi' : 'Apri scheda'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3">
              <a
                href={`/api/curator/records/${record.id}/export`}
                className="hover:text-gray-900"
              >
                Export .md
              </a>
            {sourceHref && (
              <a
                href={sourceHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-gray-900"
              >
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">Fonte</span>
                <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
              </a>
            )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
