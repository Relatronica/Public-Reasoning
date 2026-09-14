'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Plus,
  Send,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  consultationKindLabel,
  consultationStatusLabel,
  insightKindLabel,
  resolveDecisionInsights,
  stepLabelForInsight,
} from '@/lib/records/decision-insights';
import { listDecisionSteps } from '@/lib/records/decision-graph';
import { canReplyToConsultationKind } from '@/lib/org/permissions';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import AddInsightForm from '@/components/AddInsightForm';
import InsightAvatar from '@/components/InsightAvatar';
import {
  ConsultationKind,
  ConsultationRequest,
  DecisionInsight,
  OrganizationRole,
  ReasoningRecord,
} from '@/types';

const KIND_ICON = {
  spunto: Lightbulb,
  alert: AlertTriangle,
  domanda: HelpCircle,
  consulenza: MessageSquare,
} as const;

type Tab = 'spunti' | 'richieste';

interface Props {
  record: ReasoningRecord;
  onSelectRelatedStep?: (stepId: string) => void;
  /** Filtra la colonna su uno step (es. click badge sul grafo). */
  filterStepId?: string | null;
  openToken?: number;
  /** Tab da aprire quando openToken cambia. */
  openTab?: Tab;
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
  const { myRole, canAdvise, canRequestConsultation, refresh } = useCuratorData();

  const steps = useMemo(() => listDecisionSteps(record), [record]);
  const allInsights = useMemo(() => resolveDecisionInsights(record), [record]);
  const requests = record.consultationRequests ?? [];
  const openCount = requests.filter((r) => r.status !== 'chiusa').length;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePinned, setMobilePinned] = useState(false);
  const [tab, setTab] = useState<Tab>('spunti');
  const [stepFilter, setStepFilter] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const columnRef = useRef<HTMLElement>(null);

  const insights = useMemo(() => {
    if (!stepFilter) return allInsights;
    return allInsights.filter((i) => i.relatedStepId === stepFilter);
  }, [allInsights, stepFilter]);

  const filterLabel = stepFilter
    ? stepLabelForInsight(steps, stepFilter) || stepFilter
    : null;

  const active = insights.find((i) => i.id === activeId) ?? insights[0] ?? null;

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
    setTab(openTab);
    setAdding(false);
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
      if (prev && insights.some((i) => i.id === prev)) return prev;
      return insights[0]?.id ?? null;
    });
  }, [insights, stepFilter]);

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

  const panelBodyProps = {
    tab,
    setTab,
    allInsightsCount: allInsights.length,
    insights,
    requests,
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
    canRequest: canRequestConsultation && authStatus === 'authenticated',
    refresh,
    onSelectRelatedStep,
  };

  return (
    <>
      <aside
        ref={columnRef}
        aria-label="Spunti e consultazioni"
        className="hidden lg:flex w-full min-w-0 sticky top-6 self-start max-h-[calc(100vh-5rem)] flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm shadow-gray-900/[0.03]"
      >
        <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">Consultazione</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              {filterLabel
                ? `Spunti su «${filterLabel}»`
                : 'Spunti, suggerimenti e richieste'}
            </p>
          </div>
          {openCount > 0 && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
              {openCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <PanelBody {...panelBodyProps} />
        </div>
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
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold text-gray-900">Consultazione</p>
                <p className="text-[11px] text-gray-500">
                  {filterLabel
                    ? `Spunti su «${filterLabel}»`
                    : 'Spunti, suggerimenti e richieste'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobilePinned(false);
                  setMobileOpen(false);
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <PanelBody {...panelBodyProps} />
            </div>
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
          Spunti
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

function PanelBody({
  tab,
  setTab,
  allInsightsCount,
  insights,
  requests,
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
  onSelectRelatedStep,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  allInsightsCount: number;
  insights: DecisionInsight[];
  requests: ConsultationRequest[];
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
  onSelectRelatedStep?: (stepId: string) => void;
}) {
  return (
    <>
      <div className="flex gap-1 px-3.5 pt-3">
        {(
          [
            ['spunti', `Spunti · ${stepFilter ? insights.length : allInsightsCount}`],
            ['richieste', `Richieste · ${requests.length}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              tab === id
                ? 'bg-gray-900 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'spunti' && stepFilter && (
        <div className="px-3.5 pt-2">
          <button
            type="button"
            onClick={() => setStepFilter(null)}
            className="text-[11px] text-gray-500 hover:text-gray-800"
          >
            Mostra tutti gli spunti
          </button>
        </div>
      )}

      {tab === 'spunti' ? (
        <div className="pb-3">
          {canAdvise && (
            <div className="px-3.5 pt-3">
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
                  onCreated={async () => {
                    setAdding(false);
                    await refresh();
                  }}
                  className="space-y-2.5 rounded-lg border border-gray-200 p-3 bg-gray-50/60 mb-2"
                />
              )}
            </div>
          )}

          {insights.length === 0 ? (
            <p className="px-3.5 py-4 text-xs text-gray-500">
              {stepFilter
                ? 'Nessuno spunto su questo step.'
                : 'Nessuno spunto ancora. Un filosofo o consulente può aggiungerne uno, oppure apri una richiesta.'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 mt-1">
              {insights.map((insight) => (
                <InsightRow
                  key={insight.id}
                  insight={insight}
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
      ) : (
        <RequestsPanel
          recordId={record.id}
          requests={requests}
          insights={record.insights ?? []}
          myRole={myRole}
          canAdvise={canAdvise}
          canRequest={canRequest}
          onChanged={async (insightId) => {
            await refresh();
            setStepFilter(null);
            setTab('spunti');
            if (insightId) setActiveId(insightId);
          }}
          onRequestCreated={async () => {
            await refresh();
          }}
        />
      )}
    </>
  );
}

function InsightRow({
  insight,
  stepLabel,
  selected,
  onSelect,
  onOpenStep,
}: {
  insight: DecisionInsight;
  stepLabel: string | null;
  selected: boolean;
  onSelect: () => void;
  onOpenStep?: () => void;
}) {
  const Icon = KIND_ICON[insight.kind];
  const expanded = selected;

  return (
    <li className={expanded ? 'bg-gray-50' : ''}>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full text-left px-3.5 py-3 transition-colors ${
          expanded ? '' : 'hover:bg-gray-50/80'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <InsightAvatar insight={insight} size="md" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-[12px] font-medium text-gray-800 truncate">
                {insight.author || insight.role || 'Anonimo'}
              </p>
              {insight.role && insight.author && (
                <span className="text-[10px] text-gray-400 truncate flex-shrink-0">
                  {insight.role}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <Icon className="w-3 h-3" />
                {insightKindLabel(insight.kind)}
              </span>
              {stepLabel && (
                <>
                  <span className="text-gray-300 text-[10px]">·</span>
                  <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                    {stepLabel}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 leading-snug">{insight.title}</p>
            {expanded && (
              <p className="text-xs text-gray-600 leading-relaxed pt-0.5">{insight.body}</p>
            )}
          </div>
        </div>
      </button>
      {expanded && onOpenStep && (
        <div className="px-3.5 pb-3 -mt-1 pl-[3.25rem]">
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
  requests,
  insights,
  myRole,
  canAdvise,
  canRequest,
  onChanged,
  onRequestCreated,
}: {
  recordId: string;
  requests: ConsultationRequest[];
  insights: DecisionInsight[];
  myRole: OrganizationRole | null;
  canAdvise: boolean;
  canRequest: boolean;
  onChanged: (insightId?: string) => Promise<void>;
  onRequestCreated: () => Promise<void>;
}) {
  const [kind, setKind] = useState<ConsultationKind>('consulenza');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyBody, setReplyBody] = useState('');

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
    <div className="px-3.5 py-3 space-y-4">
      {canRequest && (
        <form onSubmit={submitRequest} className="space-y-2.5 rounded-lg border border-gray-200 p-3 bg-gray-50/60">
          <p className="text-xs font-semibold text-gray-800">Richiedi consultazione</p>
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
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  kind === id
                    ? 'bg-gray-900 text-white font-medium'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
            className="w-full text-sm rounded-md border border-gray-200 bg-white px-2.5 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
          <button
            type="submit"
            disabled={busy || question.trim().length < 8}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            Invia richiesta
          </button>
        </form>
      )}

      {!canRequest && (
        <p className="text-xs text-gray-500">
          Accedi e fai parte del workspace per chiedere una consultazione.
        </p>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {sorted.length === 0 ? (
        <p className="text-xs text-gray-500">Nessuna richiesta su questa scheda.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((req) => {
            const canReply =
              canAdvise &&
              req.status !== 'chiusa' &&
              canReplyToConsultationKind(myRole, req.kind);
            const response = req.responseInsightId
              ? insightsById.get(req.responseInsightId)
              : undefined;
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
              <li key={req.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-start gap-2.5">
                  <InsightAvatar insight={requesterAsInsight} size="sm" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      <span>{consultationKindLabel(req.kind)}</span>
                      <span className="text-gray-300">·</span>
                      <span
                        className={
                          req.status === 'chiusa'
                            ? 'text-gray-400'
                            : req.status === 'in_corso'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                        }
                      >
                        {consultationStatusLabel(req.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 leading-snug">{req.question}</p>
                    <p className="text-[11px] text-gray-500">
                      {req.requestedBy.name || req.requestedBy.email || 'Utente'}
                      {' · '}
                      {new Date(req.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>

                {req.status === 'chiusa' && response && (
                  <div className="rounded-md bg-gray-50 border border-gray-100 p-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <InsightAvatar insight={response} size="sm" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Risposta · {response.author || response.role || 'Advisor'}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 leading-snug">{response.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{response.body}</p>
                  </div>
                )}

                {req.status === 'chiusa' && req.responseInsightId && !response && (
                  <p className="text-[11px] text-gray-500">
                    Risposta pubblicata negli spunti della scheda.
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
                    className="text-[11px] font-medium text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline"
                  >
                    Rispondi
                  </button>
                )}

                {replyFor === req.id && (
                  <form
                    onSubmit={(e) => submitReply(e, req.id)}
                    className="space-y-2 pt-1 border-t border-gray-100"
                  >
                    <input
                      value={replyTitle}
                      onChange={(e) => setReplyTitle(e.target.value)}
                      placeholder="Titolo"
                      className="w-full text-sm rounded-md border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={3}
                      placeholder="La tua risposta…"
                      className="w-full text-sm rounded-md border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white disabled:opacity-40"
                      >
                        Pubblica risposta
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
