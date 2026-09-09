'use client';

import React, { useMemo, useState } from 'react';
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
  HelpCircle,
  Scale,
  MapPin,
  Quote,
} from 'lucide-react';
import VerbatimVsInterpretationViewer from './VerbatimVsInterpretationViewer';
import AiAssistancePanel, { AiAssistanceBadge } from './AiAssistancePanel';
import { displayStatusLabel, isClosedStatus, isEnterpriseCommunityType, resolveVisibility } from '@/lib/records';

interface Props {
  record: ReasoningRecord;
}

type DetailTab = 'schema' | 'scarti' | 'stop' | 'fonti';

const TAB_LABELS: Record<DetailTab, string> = {
  schema: 'Schema',
  scarti: 'Scarti',
  stop: 'Stop',
  fonti: 'Fonti',
};

function truncate(text: string, max = 180): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

function timeframeLabel(value: string): string {
  return value.replace('_', ' ');
}

function outcomeLabel(status: string): { text: string; className: string } {
  if (status === 'verified_true') {
    return { text: 'Confermata', className: 'bg-emerald-50 border-emerald-200 text-emerald-800' };
  }
  if (status === 'verified_false') {
    return { text: 'Smentita', className: 'bg-rose-50 border-rose-200 text-rose-800' };
  }
  if (status === 'inconclusive') {
    return { text: 'Inconclusa', className: 'bg-amber-50 border-amber-200 text-amber-900' };
  }
  return { text: 'In attesa', className: 'bg-gray-50 border-gray-200 text-gray-700' };
}

export default function ReasoningRecordCard({ record }: Props) {
  const [upvotes, setUpvotes] = useState(record.upvotes || 12);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('schema');
  const [openDiscardedId, setOpenDiscardedId] = useState<string | null>(
    record.discardedOptions?.[0]?.id ?? null
  );

  const showVotes = !isEnterpriseCommunityType(record.publicAct?.entity?.type ?? 'comune');
  const visibility = resolveVisibility(record);
  const statusLabel = displayStatusLabel(record.status);
  const decisionPreview = truncate(record.decision, 200);
  const decisionTruncated = decisionPreview !== record.decision.trim();

  const availableTabs = useMemo(() => {
    const tabs: DetailTab[] = ['schema'];
    if (record.discardedOptions?.length) tabs.push('scarti');
    if (record.mindChangingConditions?.length || record.outcomeReviews?.length) tabs.push('stop');
    if (record.verbatimQuotes?.length || record.interpretativeSummary || record.aiAssistance) {
      tabs.push('fonti');
    }
    return tabs;
  }, [record]);

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
      ? 'text-rose-700 bg-rose-50 border-rose-100'
      : record.uncertaintyLevel === 'medio'
        ? 'text-amber-700 bg-amber-50 border-amber-100'
        : 'text-emerald-700 bg-emerald-50 border-emerald-100';

  const sourceHref =
    record.publicAct?.localPdfPath ||
    record.publicAct?.officialUrl ||
    record.publicAct?.entity?.officialUrl;

  const openDetail = (tab: DetailTab = 'schema') => {
    setActiveTab(availableTabs.includes(tab) ? tab : 'schema');
    setIsExpanded(true);
  };

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
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded border font-semibold ${uncertaintyClass}`}>
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
            onClick={() => (isExpanded ? setIsExpanded(false) : openDetail('schema'))}
          >
            {record.realQuestion}
          </h2>

          {!isExpanded && (
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              {decisionPreview}
              {decisionTruncated && (
                <button
                  type="button"
                  onClick={() => openDetail('schema')}
                  className="ml-1 text-blue-600 font-semibold hover:underline"
                >
                  continua
                </button>
              )}
            </p>
          )}

          {/* Mini preview chips when collapsed */}
          {!isExpanded && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {record.discardedOptions?.length > 0 && (
                <button
                  type="button"
                  onClick={() => openDetail('scarti')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-600 hover:border-gray-300 hover:text-gray-900"
                >
                  <XCircle className="w-3 h-3 text-amber-600" />
                  {record.discardedOptions.length} scartat
                  {record.discardedOptions.length === 1 ? 'a' : 'e'}
                </button>
              )}
              {record.mindChangingConditions?.length > 0 && (
                <button
                  type="button"
                  onClick={() => openDetail('stop')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-[11px] text-amber-900 hover:border-amber-200"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Criterio di stop
                </button>
              )}
              {(record.verbatimQuotes?.length > 0 || record.interpretativeSummary) && (
                <button
                  type="button"
                  onClick={() => openDetail('fonti')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-[11px] text-blue-800 hover:border-blue-200"
                >
                  <Quote className="w-3 h-3" />
                  Fonti
                </button>
              )}
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* Visual kernel strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('schema')}
                  className={`text-left p-2.5 rounded-lg border transition-colors ${
                    activeTab === 'schema' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">
                    <HelpCircle className="w-3 h-3" />
                    Domanda
                  </div>
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">{record.realQuestion}</p>
                </button>

                <button
                  type="button"
                  onClick={() => availableTabs.includes('scarti') && setActiveTab('scarti')}
                  className={`text-left p-2.5 rounded-lg border transition-colors ${
                    activeTab === 'scarti' ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                    <XCircle className="w-3 h-3" />
                    Scarto
                  </div>
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">
                    {record.discardedOptions?.[0]?.title || 'Nessuna opzione scartata'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('schema')}
                  className={`text-left p-2.5 rounded-lg border transition-colors ${
                    activeTab === 'schema' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    <Scale className="w-3 h-3" />
                    Decisione
                  </div>
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">{record.decision}</p>
                </button>

                <button
                  type="button"
                  onClick={() => availableTabs.includes('stop') && setActiveTab('stop')}
                  className={`text-left p-2.5 rounded-lg border transition-colors ${
                    activeTab === 'stop' ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1">
                    <MapPin className="w-3 h-3" />
                    Stop
                  </div>
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">
                    {record.mindChangingConditions?.[0] || 'Nessun criterio di stop'}
                  </p>
                </button>
              </div>

              {/* Section tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg w-fit max-w-full overflow-x-auto">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              {activeTab === 'schema' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
                      Decisione chiusa
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{record.decision}</p>
                  </div>

                  {record.uncertaintyExplanation && (
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed ${uncertaintyClass}`}>
                      <span className="font-bold">Perché incertezza {record.uncertaintyLevel}: </span>
                      {record.uncertaintyExplanation}
                    </div>
                  )}

                  {record.compiler && (
                    <p className="text-[11px] text-gray-500">
                      Compilata da{' '}
                      <span className="font-semibold text-gray-700">
                        {record.compiler.name || record.compiler.username}
                      </span>
                      {record.publicAct?.actNumber ? ` · ${record.publicAct.actNumber}` : ''}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'scarti' && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Scartata
                      </div>
                      <div className="space-y-2">
                        {record.discardedOptions.map((opt) => {
                          const open = openDiscardedId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setOpenDiscardedId(open ? null : opt.id)}
                              className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                                open
                                  ? 'bg-white border-amber-300 shadow-sm'
                                  : 'bg-white/70 border-amber-100 hover:border-amber-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-gray-900">{opt.title}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                                    opt.evidenceType === 'verbatim'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {opt.evidenceType === 'verbatim' ? 'Verbatim' : 'Interpretata'}
                                </span>
                              </div>
                              {open && (
                                <p className="mt-2 text-xs text-gray-600 leading-relaxed">{opt.reasonDiscarded}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Scelta
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed">{record.decision}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stop' && (
                <div className="space-y-3">
                  {record.mindChangingConditions?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Criteri di stop
                      </div>
                      {record.mindChangingConditions.map((cond, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 rounded-xl border border-rose-100 bg-rose-50/40"
                        >
                          <div className="w-6 h-6 rounded-full bg-white border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-xs text-gray-800 leading-relaxed pt-0.5">{cond}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {record.outcomeReviews?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Verifiche a posteriori
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {record.outcomeReviews.map((rev) => {
                          const badge = outcomeLabel(rev.status);
                          return (
                            <div key={rev.id} className={`p-3 rounded-xl border text-xs ${badge.className}`}>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="font-bold">{timeframeLabel(rev.timeframe)}</span>
                                <span className="inline-flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {badge.text}
                                </span>
                              </div>
                              <p className="leading-relaxed opacity-90">{rev.expectedOutcome}</p>
                              {rev.notes && (
                                <p className="mt-1.5 text-[11px] opacity-75">{rev.notes}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'fonti' && (
                <div className="space-y-3">
                  <AiAssistancePanel ai={record.aiAssistance} />
                  <VerbatimVsInterpretationViewer
                    quotes={record.verbatimQuotes}
                    interpretativeSummary={record.interpretativeSummary}
                    officialUrl={record.publicAct?.officialUrl || record.publicAct?.entity?.officialUrl}
                    sourceLabel={record.publicAct?.entity?.sourceLabel}
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={() => (isExpanded ? setIsExpanded(false) : openDetail('schema'))}
              className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>{isExpanded ? 'Chiudi scheda' : 'Apri scheda'}</span>
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
