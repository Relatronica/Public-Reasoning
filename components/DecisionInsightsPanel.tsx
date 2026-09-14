'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Lightbulb, Plus, Send, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  consultationKindLabel,
  consultationStatusLabel,
  inferInsightSource,
  insightKindLabel,
  insightSourceLabel,
  resolveDecisionInsights,
  stepLabelForInsight,
} from '@/lib/records/decision-insights';
import { listDecisionSteps } from '@/lib/records/decision-graph';
import { canReplyToConsultationKind } from '@/lib/org/permissions';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import AddInsightForm from '@/components/AddInsightForm';
import AdvisorBadges from '@/components/AdvisorBadges';
import InsightAvatar from '@/components/InsightAvatar';
import {
  AdvisorReputation,
  expectedAdvisorBadge,
  getAdvisorReputation,
} from '@/lib/records/advisor-reputation';
import {
  ConsultationKind,
  ConsultationRequest,
  DecisionInsight,
  OrganizationRole,
  ReasoningRecord,
} from '@/types';

export type ConsultationPanelTab = 'spunti' | 'richieste';

interface Props {
  record: ReasoningRecord;
  onSelectRelatedStep?: (stepId: string) => void;
  /** Filtra la colonna su uno step (es. click badge sul grafo). */
  filterStepId?: string | null;
  openToken?: number;
  /** Vista da aprire quando openToken cambia. */
  openTab?: ConsultationPanelTab;
}

/** Colonna destra spunti/richieste (desktop) + dock mobile. */
export default function DecisionInsightsPanel({
  record,
  onSelectRelatedStep,
  filterStepId = null,
  openToken = 0,
  openTab = 'spunti',
}: Props) {
  const { status: authStatus } = useSession();
  const { myRole, canAdvise, canRequestConsultation, refresh, advisorReputations } =
    useCuratorData();

  const steps = useMemo(() => listDecisionSteps(record), [record]);
  const allInsights = useMemo(() => resolveDecisionInsights(record), [record]);
  const requests = record.consultationRequests ?? [];
  const openCount = requests.filter((r) => r.status !== 'chiusa').length;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePinned, setMobilePinned] = useState(false);
  const [view, setView] = useState<ConsultationPanelTab>('spunti');
  const [stepFilter, setStepFilter] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const columnRef = useRef<HTMLElement>(null);

  const insights = useMemo(() => {
    if (!stepFilter) return allInsights;
    return allInsights.filter((i) => i.relatedStepId === stepFilter);
  }, [allInsights, stepFilter]);

  const { primary, secondary } = useMemo(() => {
    const community: DecisionInsight[] = [];
    const other: DecisionInsight[] = [];
    for (const insight of insights) {
      if (inferInsightSource(insight) === 'community') community.push(insight);
      else other.push(insight);
    }
    // Se non c’è community su questo filtro, gli altri sono la lista principale.
    if (community.length === 0) return { primary: other, secondary: [] as DecisionInsight[] };
    return { primary: community, secondary: other };
  }, [insights]);

  const filterLabel = stepFilter
    ? stepLabelForInsight(steps, stepFilter) || stepFilter
    : null;

  const feedInsights = useMemo(
    () => (showOthers ? [...primary, ...secondary] : primary),
    [primary, secondary, showOthers]
  );

  const active =
    feedInsights.find((i) => i.id === activeId) ?? feedInsights[0] ?? null;

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    if (mobilePinned) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setMobileOpen(false), 220);
  }, [clearCloseTimer, mobilePinned]);

  const openMobilePanel = useCallback(() => {
    clearCloseTimer();
    setMobileOpen(true);
  }, [clearCloseTimer]);

  const toggleChip = useCallback(() => {
    if (mobileOpen && mobilePinned) {
      setMobilePinned(false);
      setMobileOpen(false);
      return;
    }
    setMobilePinned(true);
    openMobilePanel();
  }, [mobileOpen, mobilePinned, openMobilePanel]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!openToken) return;
    setStepFilter(filterStepId ?? null);
    setView(openTab);
    setAdding(false);
    setShowOthers(false);
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1023px)').matches;
    if (isMobile) {
      setMobilePinned(true);
      setMobileOpen(true);
    }
    columnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [openToken, filterStepId, openTab]);

  useEffect(() => {
    setActiveId((prev) => {
      if (prev && feedInsights.some((i) => i.id === prev)) return prev;
      return feedInsights[0]?.id ?? null;
    });
  }, [feedInsights, stepFilter]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobilePinned(false);
        setMobileOpen(false);
      }
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = mobileRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setMobilePinned(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('touchstart', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('touchstart', onPointer);
    };
  }, [mobileOpen]);

  const showPanel =
    allInsights.length > 0 || requests.length > 0 || canRequestConsultation || canAdvise;

  if (!showPanel) return null;

  const headerMeta =
    view === 'richieste'
      ? requests.length === 0
        ? 'Nessuna richiesta'
        : `${requests.length} richiest${requests.length === 1 ? 'a' : 'e'}`
      : filterLabel
        ? `Su «${filterLabel}»`
        : 'Pareri sulla scheda';

  const panelBody = (
    <PanelBody
      view={view}
      insights={insights}
      primary={primary}
      secondary={secondary}
      showOthers={showOthers}
      setShowOthers={setShowOthers}
      steps={steps}
      stepFilter={stepFilter}
      setStepFilter={setStepFilter}
      active={active}
      setActiveId={setActiveId}
      adding={adding}
      setAdding={setAdding}
      record={record}
      myRole={myRole}
      canAdvise={canAdvise}
      canRequest={canRequestConsultation && authStatus === 'authenticated'}
      refresh={refresh}
      advisorReputations={advisorReputations}
      onSelectRelatedStep={onSelectRelatedStep}
      onBackToSpunti={() => setView('spunti')}
      onInsightCreated={async () => {
        setAdding(false);
        setView('spunti');
        await refresh();
      }}
      onRequestAnswered={async (insightId) => {
        await refresh();
        setStepFilter(null);
        setShowOthers(false);
        setView('spunti');
        if (insightId) setActiveId(insightId);
      }}
    />
  );

  return (
    <>
      <aside
        ref={columnRef}
        aria-label="Spunti e consultazioni"
        className="hidden lg:flex w-full min-w-0 sticky top-6 self-start max-h-[calc(100vh-5rem)] flex-col rounded-xl border border-gray-200 bg-white overflow-hidden"
      >
        <PanelHeader
          meta={headerMeta}
          view={view}
          setView={setView}
          openCount={openCount}
          requestCount={requests.length}
        />
        <div className="flex-1 min-h-0 overflow-y-auto">{panelBody}</div>
      </aside>

      <div
        ref={mobileRef}
        className="lg:hidden fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2"
        onMouseEnter={openMobilePanel}
        onMouseLeave={scheduleClose}
      >
        {mobileOpen && (
          <div
            id={panelId}
            role="dialog"
            aria-label="Spunti e consultazioni"
            className="w-[min(100vw-2.5rem,24rem)] max-h-[min(70vh,32rem)] rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-900/5 overflow-hidden flex flex-col"
          >
            <PanelHeader
              meta={headerMeta}
              view={view}
              setView={setView}
              openCount={openCount}
              requestCount={requests.length}
              onClose={() => {
                setMobilePinned(false);
                setMobileOpen(false);
              }}
              compact
            />
            <div className="flex-1 min-h-0 overflow-y-auto">{panelBody}</div>
          </div>
        )}

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          onClick={toggleChip}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border shadow-sm transition-colors ${
            mobileOpen
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Lightbulb className={`w-3.5 h-3.5 ${mobileOpen ? 'text-amber-300' : 'text-gray-500'}`} />
          Consultazione
          <span className={`tabular-nums ${mobileOpen ? 'text-gray-300' : 'text-gray-400'}`}>
            · {allInsights.length}
          </span>
          {openCount > 0 && (
            <span
              className={`ml-0.5 inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full text-[10px] font-semibold ${
                mobileOpen ? 'bg-white/15 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {openCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

function PanelHeader({
  meta,
  view,
  setView,
  openCount,
  requestCount,
  onClose,
  compact = false,
}: {
  meta: string;
  view: ConsultationPanelTab;
  setView: (v: ConsultationPanelTab) => void;
  openCount: number;
  requestCount: number;
  onClose?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-2 border-b border-gray-100 flex-shrink-0 ${
        compact ? 'px-3.5 py-2.5' : 'px-4 py-3'
      }`}
    >
      <div className="min-w-0">
        <p className={`font-semibold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>
          Consultazione
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{meta}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {view === 'spunti' ? (
          <button
            type="button"
            onClick={() => setView('richieste')}
            className="text-[11px] font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
          >
            {requestCount > 0
              ? openCount > 0
                ? `${openCount} aperte`
                : `${requestCount} richieste`
              : 'Richieste'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setView('spunti')}
            className="text-[11px] font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
          >
            Spunti
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function PanelBody({
  view,
  insights,
  primary,
  secondary,
  showOthers,
  setShowOthers,
  steps,
  stepFilter,
  setStepFilter,
  active,
  setActiveId,
  adding,
  setAdding,
  record,
  myRole,
  canAdvise,
  canRequest,
  refresh,
  advisorReputations,
  onSelectRelatedStep,
  onBackToSpunti,
  onInsightCreated,
  onRequestAnswered,
}: {
  view: ConsultationPanelTab;
  insights: DecisionInsight[];
  primary: DecisionInsight[];
  secondary: DecisionInsight[];
  showOthers: boolean;
  setShowOthers: (v: boolean) => void;
  steps: { id: string; label: string }[];
  stepFilter: string | null;
  setStepFilter: (id: string | null) => void;
  active: DecisionInsight | null;
  setActiveId: (id: string | null) => void;
  adding: boolean;
  setAdding: (v: boolean) => void;
  record: ReasoningRecord;
  myRole: OrganizationRole | null;
  canAdvise: boolean;
  canRequest: boolean;
  refresh: () => Promise<void>;
  advisorReputations: Map<string, AdvisorReputation>;
  onSelectRelatedStep?: (stepId: string) => void;
  onBackToSpunti: () => void;
  onInsightCreated: () => Promise<void>;
  onRequestAnswered: (insightId?: string) => Promise<void>;
}) {
  if (view === 'richieste') {
    return (
      <RequestsPanel
        recordId={record.id}
        recordCategory={record.category}
        requests={record.consultationRequests ?? []}
        insights={record.insights ?? []}
        myRole={myRole}
        canAdvise={canAdvise}
        canRequest={canRequest}
        advisorReputations={advisorReputations}
        onChanged={onRequestAnswered}
        onRequestCreated={async () => {
          await refresh();
        }}
        onBack={onBackToSpunti}
      />
    );
  }

  const onlyMethodPrompts =
    primary.length > 0 &&
    primary.every((i) => inferInsightSource(i) !== 'community') &&
    secondary.length === 0;

  return (
    <div className="pb-4">
      {stepFilter && (
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={() => setStepFilter(null)}
            className="text-[11px] text-gray-500 hover:text-gray-800"
          >
            Mostra tutti
          </button>
        </div>
      )}

      {canAdvise && (
        <div className="px-4 pt-3">
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900"
            >
              <Plus className="w-3.5 h-3.5" />
              Aggiungi spunto
            </button>
          ) : (
            <AddInsightForm
              recordId={record.id}
              steps={steps}
              defaultStepId={stepFilter ?? steps[0]?.id}
              myRole={myRole}
              onCancel={() => setAdding(false)}
              onCreated={onInsightCreated}
              className="space-y-2.5 py-1"
            />
          )}
        </div>
      )}

      {insights.length === 0 ? (
        <p className="px-4 py-5 text-xs text-gray-500 leading-relaxed">
          {stepFilter
            ? 'Nessuno spunto su questo step.'
            : 'Nessuno spunto ancora. Un filosofo o consulente può aggiungerne uno, oppure apri una richiesta.'}
        </p>
      ) : (
        <>
          {onlyMethodPrompts && (
            <p className="px-4 pt-3 text-[11px] text-gray-500">
              Prompt di metodo (non consulenza umana)
            </p>
          )}

          <ul className="mt-1">
            {primary.map((insight) => (
              <InsightRow
                key={insight.id}
                insight={insight}
                reputation={getAdvisorReputation(advisorReputations, insight.authorUserId)}
                stepLabel={stepLabelForInsight(steps, insight.relatedStepId)}
                selected={insight.id === active?.id}
                onSelect={() => setActiveId(insight.id)}
                onOpenStep={
                  insight.relatedStepId && onSelectRelatedStep
                    ? () => onSelectRelatedStep(insight.relatedStepId!)
                    : undefined
                }
              />
            ))}
          </ul>

          {secondary.length > 0 && (
            <div className="mt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowOthers(!showOthers)}
                aria-expanded={showOthers}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-[12px] text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
              >
                <span>
                  Altri spunti
                  <span className="text-gray-400"> · {secondary.length}</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                    showOthers ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showOthers && (
                <ul>
                  {secondary.map((insight) => (
                    <InsightRow
                      key={insight.id}
                      insight={insight}
                      reputation={getAdvisorReputation(
                        advisorReputations,
                        insight.authorUserId
                      )}
                      stepLabel={stepLabelForInsight(steps, insight.relatedStepId)}
                      selected={insight.id === active?.id}
                      onSelect={() => setActiveId(insight.id)}
                      onOpenStep={
                        insight.relatedStepId && onSelectRelatedStep
                          ? () => onSelectRelatedStep(insight.relatedStepId!)
                          : undefined
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InsightRow({
  insight,
  reputation,
  stepLabel,
  selected,
  onSelect,
  onOpenStep,
}: {
  insight: DecisionInsight;
  reputation: AdvisorReputation | null;
  stepLabel: string | null;
  selected: boolean;
  onSelect: () => void;
  onOpenStep?: () => void;
}) {
  const expanded = selected;
  const source = inferInsightSource(insight);

  return (
    <li className={expanded ? 'bg-gray-50' : ''}>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full text-left px-4 py-3 transition-colors ${
          expanded ? '' : 'hover:bg-gray-50/80'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <InsightAvatar insight={insight} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-gray-800 truncate">
              {insight.author || insight.role || 'Anonimo'}
            </p>
            <p className="text-sm font-medium text-gray-900 leading-snug mt-0.5">
              {insight.title}
            </p>
            {expanded && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] text-gray-500">
                  {[
                    source !== 'community' ? insightSourceLabel(source) : null,
                    insight.role,
                    insightKindLabel(insight.kind),
                    stepLabel,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {reputation && reputation.badges.length > 0 && (
                  <AdvisorBadges badges={reputation.badges} max={4} />
                )}
                <p className="text-xs text-gray-600 leading-relaxed">{insight.body}</p>
              </div>
            )}
          </div>
        </div>
      </button>
      {expanded && onOpenStep && (
        <div className="px-4 pb-3 -mt-1 pl-[3.5rem]">
          <button
            type="button"
            onClick={onOpenStep}
            className="text-[11px] font-medium text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline"
          >
            Vai allo step collegato
          </button>
        </div>
      )}
    </li>
  );
}

function RequestsPanel({
  recordId,
  recordCategory,
  requests,
  insights,
  myRole,
  canAdvise,
  canRequest,
  advisorReputations,
  onChanged,
  onRequestCreated,
  onBack,
}: {
  recordId: string;
  recordCategory?: string;
  requests: ConsultationRequest[];
  insights: DecisionInsight[];
  myRole: OrganizationRole | null;
  canAdvise: boolean;
  canRequest: boolean;
  advisorReputations: Map<string, AdvisorReputation>;
  onChanged: (insightId?: string) => Promise<void>;
  onRequestCreated: () => Promise<void>;
  onBack: () => void;
}) {
  const [kind, setKind] = useState<ConsultationKind>('consulenza');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [composing, setComposing] = useState(false);

  const sorted = useMemo(
    () =>
      [...requests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [requests]
  );

  const insightsById = useMemo(() => {
    const map = new Map<string, DecisionInsight>();
    for (const insight of insights) map.set(insight.id, insight);
    return map;
  }, [insights]);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/curator/records/${recordId}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      setQuestion('');
      setComposing(false);
      await onRequestCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  }

  async function submitReply(e: React.FormEvent, requestId: string) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/curator/records/${recordId}/consultations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          title: replyTitle,
          body: replyBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      setReplyFor(null);
      setReplyTitle('');
      setReplyBody('');
      await onChanged(data.insight?.id as string | undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-4">
      <div className="px-4 pt-3 flex items-center justify-between gap-2">
        {canRequest ? (
          !composing ? (
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuova richiesta
            </button>
          ) : (
            <span className="text-xs font-medium text-gray-800">Nuova richiesta</span>
          )
        ) : (
          <p className="text-xs text-gray-500">
            Accedi al workspace per chiedere una consultazione.
          </p>
        )}
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] text-gray-500 hover:text-gray-800 lg:hidden"
        >
          Indietro
        </button>
      </div>

      {composing && canRequest && (
        <form onSubmit={submitRequest} className="px-4 pt-3 space-y-2.5 border-b border-gray-100 pb-4">
          <div className="flex gap-1">
            {(
              [
                ['consulenza', 'Consulente'],
                ['filosofica', 'Filosofo'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                className={`px-2 py-1 rounded-md text-xs transition-colors ${
                  kind === id
                    ? 'bg-gray-900 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder={
              kind === 'filosofica'
                ? 'Cosa vuoi mettere in discussione sulla domanda o sugli scarti?'
                : 'Su quale rischio, gap o alternativa chiedi un parere?'
            }
            className="w-full text-sm border-0 border-b border-gray-200 rounded-none px-0 py-1.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 bg-transparent"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || question.trim().length < 8}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              Invia
            </button>
            <button
              type="button"
              onClick={() => {
                setComposing(false);
                setQuestion('');
              }}
              className="px-2.5 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      {error && <p className="px-4 pt-2 text-xs text-rose-600">{error}</p>}

      {sorted.length === 0 ? (
        <p className="px-4 py-5 text-xs text-gray-500">Nessuna richiesta su questa scheda.</p>
      ) : (
        <ul className="divide-y divide-gray-100 mt-1">
          {sorted.map((req) => {
            const canReply =
              canAdvise &&
              req.status !== 'chiusa' &&
              canReplyToConsultationKind(myRole, req.kind);
            const response = req.responseInsightId
              ? insightsById.get(req.responseInsightId)
              : undefined;
            const responseReputation = response
              ? getAdvisorReputation(advisorReputations, response.authorUserId)
              : null;
            const openBadges = [
              expectedAdvisorBadge(req.kind),
              ...(recordCategory
                ? [
                    {
                      id: `domain:${recordCategory}` as const,
                      label: recordCategory,
                      title: `Scheda in «${recordCategory}»`,
                    },
                  ]
                : []),
            ];
            const requesterAsInsight: Pick<
              DecisionInsight,
              'id' | 'author' | 'authorUserId' | 'role'
            > = {
              id: req.id,
              author: req.requestedBy.name || req.requestedBy.email || 'Utente',
              authorUserId: req.requestedBy.userId,
              role: 'Richiedente',
            };
            return (
              <li key={req.id} className="px-4 py-3 space-y-2">
                <div className="flex items-start gap-2.5">
                  <InsightAvatar insight={requesterAsInsight} size="sm" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[11px] text-gray-500">
                      {consultationKindLabel(req.kind)}
                      {' · '}
                      {consultationStatusLabel(req.status)}
                    </p>
                    {req.status !== 'chiusa' && (
                      <AdvisorBadges badges={openBadges} max={3} />
                    )}
                    <p className="text-sm text-gray-900 leading-snug">{req.question}</p>
                    <p className="text-[11px] text-gray-500">
                      {req.requestedBy.name || req.requestedBy.email || 'Utente'}
                      {' · '}
                      {new Date(req.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>

                {req.status === 'chiusa' && response && (
                  <div className="pl-9 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <InsightAvatar insight={response} size="sm" />
                      <p className="text-[11px] text-gray-500">
                        Risposta · {response.author || response.role || 'Advisor'}
                      </p>
                    </div>
                    {responseReputation && responseReputation.badges.length > 0 && (
                      <AdvisorBadges badges={responseReputation.badges} max={4} />
                    )}
                    <p className="text-sm font-medium text-gray-900 leading-snug">
                      {response.title}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">{response.body}</p>
                  </div>
                )}

                {req.status === 'chiusa' && req.responseInsightId && !response && (
                  <p className="pl-9 text-[11px] text-gray-500">
                    Risposta pubblicata negli spunti.
                  </p>
                )}

                {canReply && replyFor !== req.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyFor(req.id);
                      setReplyTitle(
                        req.kind === 'filosofica' ? 'Spunto di lettura' : 'Parere operativo'
                      );
                      setReplyBody('');
                    }}
                    className="pl-9 text-[11px] font-medium text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline"
                  >
                    Rispondi
                  </button>
                )}

                {replyFor === req.id && (
                  <form
                    onSubmit={(e) => submitReply(e, req.id)}
                    className="pl-9 space-y-2 pt-1"
                  >
                    <input
                      value={replyTitle}
                      onChange={(e) => setReplyTitle(e.target.value)}
                      placeholder="Titolo"
                      className="w-full text-sm border-0 border-b border-gray-200 rounded-none px-0 py-1.5 focus:outline-none focus:border-gray-400 bg-transparent"
                    />
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={3}
                      placeholder="La tua risposta…"
                      className="w-full text-sm border-0 border-b border-gray-200 rounded-none px-0 py-1.5 focus:outline-none focus:border-gray-400 bg-transparent"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white disabled:opacity-40"
                      >
                        Pubblica
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyFor(null)}
                        className="px-2.5 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Annulla
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
