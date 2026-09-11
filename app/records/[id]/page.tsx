'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import DecisionGraph from '@/components/decision-graph/DecisionGraph';
import DecisionInsightsDock from '@/components/DecisionInsightsDock';
import {
  isClosedStatus,
  isVisibleOnPublicFeed,
  resolveVisibility,
} from '@/lib/records';
import { useSession } from 'next-auth/react';
import { PageSkeleton } from '@/components/FeedSkeleton';

function RecordDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { data: session, status: authStatus } = useSession();
  const { href } = useActiveCommunity();
  const { records, loading, canCompile } = useCuratorData();
  const isAuthed = authStatus === 'authenticated' && Boolean(session?.user);
  const [focusStepId, setFocusStepId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [insightsFilterStep, setInsightsFilterStep] = useState<string | null>(null);
  const [insightsOpenToken, setInsightsOpenToken] = useState(0);
  const [dockTab, setDockTab] = useState<'spunti' | 'richieste'>('spunti');

  const record = useMemo(() => {
    const found = records.find((r) => r.id === id);
    if (!found) return null;
    if (!isAuthed && !isVisibleOnPublicFeed(found)) return null;
    return found;
  }, [records, id, isAuthed]);

  useEffect(() => {
    if (searchParams.get('dock') !== 'richieste') return;
    setDockTab('richieste');
    setInsightsFilterStep(null);
    setInsightsOpenToken((n) => n + 1);
  }, [searchParams, id]);

  if (loading || authStatus === 'loading') {
    return <PageSkeleton label="Caricamento scheda" />;
  }

  if (!record) {
    return (
      <div className="reddit-card p-8 max-w-lg space-y-3">
        <h1 className="text-lg font-semibold text-gray-900">Scheda non trovata</h1>
        <p className="text-xs text-gray-500">Potrebbe essere privata o non più nel registro.</p>
        <Link href={href('/decisioni')} className="text-xs text-blue-700 hover:underline">
          Torna al feed
        </Link>
      </div>
    );
  }

  const visibility = resolveVisibility(record);

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Link href={href('/decisioni')} className="text-gray-400 hover:text-gray-700 mt-0.5 flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400 mb-1">
              {record.category && <span>{record.category}</span>}
              {record.publicAct?.actNumber && (
                <>
                  {record.category && <span>·</span>}
                  <span>{record.publicAct.actNumber}</span>
                </>
              )}
              {!isClosedStatus(record.status) && (
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Bozza</span>
              )}
              {visibility === 'private' && (
                <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Privata</span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-gray-900 leading-snug">
              {record.realQuestion}
            </h1>
          </div>
        </div>

        {canCompile && (
          <Link
            href={href(`/curator/records/${record.id}`)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            Modifica
          </Link>
        )}
      </div>

      <DecisionGraph
        record={record}
        focusStepId={focusStepId}
        focusToken={focusToken}
        onOpenInsights={(stepId) => {
          setDockTab('spunti');
          setInsightsFilterStep(stepId);
          setInsightsOpenToken((n) => n + 1);
        }}
      />

      <DecisionInsightsDock
        record={record}
        filterStepId={insightsFilterStep}
        openToken={insightsOpenToken}
        openTab={dockTab}
        onSelectRelatedStep={(stepId) => {
          setFocusStepId(stepId);
          setFocusToken((n) => n + 1);
        }}
      />
    </div>
  );
}

export default function RecordDetailPage() {
  return (
    <Suspense fallback={<PageSkeleton label="Caricamento scheda" />}>
      <RecordDetailInner />
    </Suspense>
  );
}
