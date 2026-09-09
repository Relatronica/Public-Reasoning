'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ReasoningRecord } from '@/types';
import {
  ArrowBigUp,
  ArrowBigDown,
  FileText,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import DecisionFlowchart from './DecisionFlowchart';
import { AiAssistanceBadge } from './AiAssistancePanel';
import { displayStatusLabel, isClosedStatus, isEnterpriseCommunityType, resolveVisibility } from '@/lib/records';

interface Props {
  record: ReasoningRecord;
}

function truncate(text: string, max = 180): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

export default function ReasoningRecordCard({ record }: Props) {
  const [upvotes, setUpvotes] = useState(record.upvotes || 12);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const showVotes = !isEnterpriseCommunityType(record.publicAct?.entity?.type ?? 'comune');
  const visibility = resolveVisibility(record);
  const statusLabel = displayStatusLabel(record.status);
  const decisionPreview = truncate(record.decision, 200);
  const decisionTruncated = decisionPreview !== record.decision.trim();
  const hasDiscarded = (record.discardedOptions?.length ?? 0) > 0;
  const hasStop =
    (record.mindChangingConditions?.length ?? 0) > 0 || (record.outcomeReviews?.length ?? 0) > 0;

  const handleVote = (direction: 'up' | 'down') => {
    if (voteState === direction) {
      setVoteState(null);
      setUpvotes((prev) => (direction === 'up' ? prev - 1 : prev + 1));
    } else {
      const diff = voteState === null ? 1 : 2;
      setVoteState(direction);
      setUpvotes((prev) => (direction === 'up' ? prev + diff : prev - diff));
    }
  };

  const uncertaintyClass =
    record.uncertaintyLevel === 'alto'
      ? 'text-rose-700'
      : record.uncertaintyLevel === 'medio'
        ? 'text-amber-700'
        : 'text-emerald-700';

  const sourceHref =
    record.publicAct?.localPdfPath ||
    record.publicAct?.officialUrl ||
    record.publicAct?.entity?.officialUrl;

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
            <span
              className={`text-xs font-bold my-0.5 ${
                voteState === 'up' ? 'text-blue-600' : voteState === 'down' ? 'text-rose-600' : 'text-gray-700'
              }`}
            >
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
            <span className={uncertaintyClass}>Incertezza {record.uncertaintyLevel}</span>
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
                visibility === 'private' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {visibility === 'private' ? 'Privato' : 'Registro pubblico'}
            </span>
            <AiAssistanceBadge ai={record.aiAssistance} />
          </div>

          <h2
            className="text-base sm:text-lg font-bold text-gray-900 leading-snug cursor-pointer hover:text-blue-700"
            onClick={() => setIsExpanded((v) => !v)}
          >
            {record.realQuestion}
          </h2>

          {!isExpanded && (
            <>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                {decisionPreview}
                {decisionTruncated && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="ml-1 text-blue-600 font-semibold hover:underline"
                  >
                    continua
                  </button>
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-gray-500">
                {hasDiscarded && (
                  <span className="inline-flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-amber-600" />
                    {record.discardedOptions.length} scartat
                    {record.discardedOptions.length === 1 ? 'a' : 'e'}
                  </span>
                )}
                {hasStop && (
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Criterio di stop
                  </span>
                )}
              </div>
            </>
          )}

          {isExpanded && <DecisionFlowchart record={record} />}

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>{isExpanded ? 'Chiudi percorso' : 'Vedi percorso'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3">
              <a href={`/api/curator/records/${record.id}/export`} className="hover:text-gray-900">
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
