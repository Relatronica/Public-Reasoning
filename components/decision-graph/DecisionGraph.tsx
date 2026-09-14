'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Eye, Lightbulb, X } from 'lucide-react';
import { ReasoningRecord } from '@/types';
import {
  buildDecisionGraph,
  listDecisionSteps,
  type DecisionGraphNodeKind,
} from '@/lib/records/decision-graph';
import DecisionGraphNode from './DecisionGraphNode';
import VerbatimVsInterpretationViewer from '@/components/VerbatimVsInterpretationViewer';
import AiAssistancePanel from '@/components/AiAssistancePanel';
import OutcomeLoopPanel from '@/components/OutcomeLoopPanel';
import AddInsightForm from '@/components/AddInsightForm';
import { confidenceLabel } from '@/lib/records/outcomes';
import {
  insightsByStepId,
  resolveDecisionInsights,
  findDiscardedByStepId,
} from '@/lib/records/decision-insights';
import { useCuratorData } from '@/contexts/CuratorDataContext';

const nodeTypes = { decision: DecisionGraphNode };

const STEP_DOT: Record<DecisionGraphNodeKind, string> = {
  question: 'bg-blue-500',
  discarded: 'bg-amber-500',
  decision: 'bg-emerald-600',
  stop: 'bg-rose-500',
  outcome: 'bg-slate-500',
  sources: 'bg-slate-400',
};

type ContextMenuState = {
  x: number;
  y: number;
  nodeId: string;
};

function kindFromNodeId(id: string): DecisionGraphNodeKind | null {
  if (id === 'question') return 'question';
  if (id === 'decision') return 'decision';
  if (id === 'stop') return 'stop';
  if (id === 'outcome') return 'outcome';
  if (id === 'sources') return 'sources';
  if (id.startsWith('discarded-')) return 'discarded';
  return null;
}

function StepContent({
  record,
  selectedId,
}: {
  record: ReasoningRecord;
  selectedId: string;
}) {
  const kind = kindFromNodeId(selectedId);

  if (kind === 'question') {
    return (
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-500 tracking-wide">Domanda reale</h3>
        <p className="text-sm text-slate-900 leading-relaxed">{record.realQuestion}</p>
      </div>
    );
  }

  if (kind === 'discarded') {
    const opt = findDiscardedByStepId(record, selectedId);
    if (!opt) return <p className="text-xs text-slate-500">Nessuna opzione scartata.</p>;
    return (
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-500 tracking-wide">Opzione scartata</h3>
        <p className="text-sm font-medium text-slate-900 leading-snug">{opt.title}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{opt.reasonDiscarded}</p>
      </div>
    );
  }

  if (kind === 'decision') {
    return (
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-500 tracking-wide">Decisione</h3>
        <p className="text-sm text-slate-900 leading-relaxed">{record.decision}</p>
        <p className="text-xs text-slate-500 pt-1">{confidenceLabel(record.confidence)}</p>
        {record.uncertaintyExplanation && (
          <p className="text-xs text-slate-500 leading-relaxed">
            Incertezza {record.uncertaintyLevel}: {record.uncertaintyExplanation}
          </p>
        )}
      </div>
    );
  }

  if (kind === 'stop') {
    return (
      <div className="space-y-3">
        <h3 className="text-[11px] font-semibold text-slate-500 tracking-wide">
          Cosa ti farebbe cambiare idea
        </h3>
        {(record.mindChangingConditions?.length ?? 0) > 0 ? (
          <ul className="space-y-2">
            {record.mindChangingConditions.map((cond, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-800 leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nessun criterio di stop dichiarato.</p>
        )}
      </div>
    );
  }

  if (kind === 'outcome') {
    return <OutcomeLoopPanel record={record} />;
  }

  if (kind === 'sources') {
    return (
      <div className="space-y-5 w-full">
        <AiAssistancePanel ai={record.aiAssistance} />
        <VerbatimVsInterpretationViewer
          quotes={record.verbatimQuotes}
          interpretativeSummary={record.interpretativeSummary}
          officialUrl={record.publicAct?.officialUrl || record.publicAct?.entity?.officialUrl}
          sourceLabel={record.publicAct?.entity?.sourceLabel}
        />
      </div>
    );
  }

  return null;
}

function styleEdgesForSelection(edges: Edge[], selectedId: string): Edge[] {
  return edges.map((edge) => {
    const related = edge.source === selectedId || edge.target === selectedId;
    const isPath = edge.className?.includes('decision-edge--path');
    const isDiscard = edge.className?.includes('decision-edge--discard');

    if (related) {
      return {
        ...edge,
        animated: isPath || edge.animated,
        style: {
          ...edge.style,
          stroke: isDiscard ? '#b45309' : isPath ? '#0f766e' : '#475569',
          strokeWidth: isPath ? 2.5 : 2,
          opacity: 1,
        },
        markerEnd:
          typeof edge.markerEnd === 'object' && edge.markerEnd
            ? {
                ...edge.markerEnd,
                color: isDiscard ? '#b45309' : isPath ? '#0f766e' : '#475569',
              }
            : edge.markerEnd,
      };
    }

    return {
      ...edge,
      animated: false,
      style: {
        ...edge.style,
        opacity: 0.45,
        strokeWidth: typeof edge.style?.strokeWidth === 'number' ? edge.style.strokeWidth : 1.5,
      },
    };
  });
}

function DecisionGraphInner({
  record,
  focusStepId,
  focusToken = 0,
  onOpenInsights,
  wideLayout = false,
}: {
  record: ReasoningRecord;
  focusStepId?: string | null;
  focusToken?: number;
  onOpenInsights?: (stepId: string) => void;
  wideLayout?: boolean;
}) {
  const { canAdvise, myRole, refresh } = useCuratorData();
  const built = useMemo(() => buildDecisionGraph(record), [record]);
  const steps = useMemo(() => listDecisionSteps(record), [record]);
  const insightCounts = useMemo(
    () => insightsByStepId(resolveDecisionInsights(record)),
    [record]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(built.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built.edges);
  const [selectedId, setSelectedId] = useState(steps[0]?.id ?? 'question');
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [composeStepId, setComposeStepId] = useState<string | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const focusNode = useCallback(
    (id: string) => {
      requestAnimationFrame(() => {
        fitView({
          nodes: [{ id }],
          padding: 0.42,
          duration: 380,
          maxZoom: 1.2,
          minZoom: 0.65,
        });
      });
    },
    [fitView]
  );

  useEffect(() => {
    setNodes(built.nodes);
    setEdges(built.edges);
    setSelectedId((prev) => {
      const stillThere =
        steps.some((s) => s.id === prev) || built.nodes.some((n) => n.id === prev);
      return stillThere ? prev : (steps[0]?.id ?? 'question');
    });
  }, [built, steps, setNodes, setEdges]);

  useEffect(() => {
    if (!focusStepId) return;
    const exists =
      steps.some((s) => s.id === focusStepId) || nodes.some((n) => n.id === focusStepId);
    if (!exists) return;
    setSelectedId(focusStepId);
    focusNode(focusStepId);
  }, [focusStepId, focusToken, steps, nodes, focusNode]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId(node.id);
    setMenu(null);
  }, []);

  const onStepClick = useCallback(
    (id: string) => {
      setSelectedId(id);
      focusNode(id);
    },
    [focusNode]
  );

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(node.id);
    const flow = flowRef.current?.getBoundingClientRect();
    const x = flow ? Math.min(e.clientX - flow.left, flow.width - 180) : e.clientX;
    const y = flow ? Math.min(e.clientY - flow.top, flow.height - 100) : e.clientY;
    setMenu({ x: Math.max(8, x), y: Math.max(8, y), nodeId: node.id });
  }, []);

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === selectedId,
        data: {
          ...n.data,
          insightCount: insightCounts[n.id] ?? 0,
        },
      })),
    [nodes, selectedId, insightCounts]
  );

  const displayEdges = useMemo(
    () => styleEdgesForSelection(edges, selectedId),
    [edges, selectedId]
  );

  const composeLabel = composeStepId
    ? steps.find((s) => s.id === composeStepId)?.label
    : null;

  const [showMap, setShowMap] = useState(false);
  const selectedIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === selectedId)
  );
  const selectedKind = kindFromNodeId(selectedId);

  return (
    <div className="space-y-3">
      {/* Mobile: lista verticale degli step */}
      <nav className="sm:hidden space-y-2" aria-label="Passaggi della decisione">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Passaggi · {selectedIndex + 1}/{steps.length}
          </p>
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100"
          >
            {showMap ? 'Nascondi mappa' : 'Mostra mappa'}
          </button>
        </div>
        <ol className="reddit-card reddit-card--static divide-y divide-slate-100 overflow-hidden">
          {steps.map((step, i) => {
            const active = step.id === selectedId;
            const count = insightCounts[step.id] ?? 0;
            return (
              <li key={step.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  aria-current={active ? 'step' : undefined}
                  className={`min-w-0 flex-1 flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                    active ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-semibold tabular-nums flex items-center justify-center ${
                      active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      active ? 'bg-white/80' : STEP_DOT[step.kind]
                    }`}
                  />
                  <span
                    className={`flex-1 text-sm font-medium truncate ${
                      active ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {count > 0 && onOpenInsights && (
                  <button
                    type="button"
                    title={`${count} spunti — apri`}
                    onClick={() => {
                      onStepClick(step.id);
                      onOpenInsights(step.id);
                    }}
                    className={`flex-shrink-0 px-3 flex items-center border-l ${
                      active
                        ? 'bg-slate-900 border-white/10 text-white'
                        : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold tabular-nums ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Desktop: chip orizzontali */}
      <div
        className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-0.5"
        aria-label="Passaggi della decisione"
      >
        {steps.map((step, i) => {
          const active = step.id === selectedId;
          const count = insightCounts[step.id] ?? 0;
          return (
            <React.Fragment key={step.id}>
              {i > 0 && (
                <span
                  className="h-px w-3 flex-shrink-0 bg-slate-200"
                  aria-hidden
                />
              )}
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all duration-150 ${
                    active
                      ? 'bg-slate-900 text-white font-medium shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      active ? 'bg-white/80' : STEP_DOT[step.kind]
                    }`}
                  />
                  {step.label}
                </button>
                {count > 0 && (
                  <button
                    type="button"
                    title={`${count} spunti — apri`}
                    onClick={() => onOpenInsights?.(step.id)}
                    className={`inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full text-[10px] font-semibold tabular-nums transition-colors ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {count}
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="reddit-card reddit-card--static overflow-hidden">
        <div
          ref={flowRef}
          className={`decision-flow relative border-b border-slate-100 ${
            showMap ? 'block h-[300px]' : 'hidden'
          } sm:block sm:h-[360px] lg:h-[400px] xl:h-[440px]`}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(15,118,110,0.07),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(37,99,235,0.05),transparent_50%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]"
            aria-hidden
          />
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.24 }}
            minZoom={0.5}
            maxZoom={1.35}
            panOnScroll
            zoomOnScroll={false}
            preventScrolling={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
            className="!bg-transparent"
          >
            <Background
              variant={BackgroundVariant.Lines}
              gap={28}
              size={1}
              color="rgba(148,163,184,0.18)"
              lineWidth={0.6}
            />
            <Controls
              showInteractive={false}
              position="bottom-right"
              className="!shadow-sm !border-slate-200/80 !rounded-xl !overflow-hidden !bg-white/90 !backdrop-blur-sm"
            />
          </ReactFlow>

          {menu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 min-w-[10.5rem] rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm py-1 shadow-lg shadow-slate-900/10"
              style={{ left: menu.x, top: menu.y }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {(insightCounts[menu.nodeId] ?? 0) > 0 && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    onOpenInsights?.(menu.nodeId);
                    setMenu(null);
                  }}
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  Vedi spunti ({insightCounts[menu.nodeId]})
                </button>
              )}
              {canAdvise && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setComposeStepId(menu.nodeId);
                    setMenu(null);
                  }}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-slate-400" />
                  Aggiungi spunto
                </button>
              )}
              {!canAdvise && (insightCounts[menu.nodeId] ?? 0) === 0 && (
                <p className="px-3 py-2 text-[11px] text-slate-400">Nessuna azione disponibile</p>
              )}
            </motion.div>
          )}
        </div>

        <div className="relative p-5 sm:p-6 lg:p-8">
          {(insightCounts[selectedId] ?? 0) > 0 && onOpenInsights && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => onOpenInsights(selectedId)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                <span className="inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-slate-900 text-white text-[10px] tabular-nums">
                  {insightCounts[selectedId]}
                </span>
                Vedi spunti su questo step
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {selectedKind === 'sources' || selectedKind === 'outcome' ? (
                <StepContent record={record} selectedId={selectedId} />
              ) : (
                <div className={wideLayout ? undefined : 'max-w-3xl'}>
                  <StepContent record={record} selectedId={selectedId} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {composeStepId && canAdvise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl p-4 space-y-3"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Aggiungi spunto</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {composeLabel ? `Sul nodo «${composeLabel}»` : 'Sul nodo selezionato'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComposeStepId(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AddInsightForm
              key={composeStepId}
              recordId={record.id}
              steps={steps}
              defaultStepId={composeStepId}
              myRole={myRole}
              lockStep
              className="space-y-2.5"
              onCancel={() => setComposeStepId(null)}
              onCreated={async () => {
                setComposeStepId(null);
                await refresh();
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function DecisionGraph({
  record,
  focusStepId,
  focusToken,
  onOpenInsights,
  wideLayout = false,
}: {
  record: ReasoningRecord;
  focusStepId?: string | null;
  focusToken?: number;
  onOpenInsights?: (stepId: string) => void;
  wideLayout?: boolean;
}) {
  return (
    <ReactFlowProvider>
      <DecisionGraphInner
        record={record}
        focusStepId={focusStepId}
        focusToken={focusToken}
        onOpenInsights={onOpenInsights}
        wideLayout={wideLayout}
      />
    </ReactFlowProvider>
  );
}
