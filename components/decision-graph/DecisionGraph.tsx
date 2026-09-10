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
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
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
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Domanda reale</h3>
        <p className="text-sm text-gray-900 leading-relaxed">{record.realQuestion}</p>
      </div>
    );
  }

  if (kind === 'discarded') {
    const opt = findDiscardedByStepId(record, selectedId);
    if (!opt) return <p className="text-xs text-gray-500">Nessuna opzione scartata.</p>;
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opzione scartata</h3>
        <p className="text-sm font-medium text-gray-900 leading-snug">{opt.title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{opt.reasonDiscarded}</p>
      </div>
    );
  }

  if (kind === 'decision') {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Decisione</h3>
        <p className="text-sm text-gray-900 leading-relaxed">{record.decision}</p>
        <p className="text-xs text-gray-500 pt-1">{confidenceLabel(record.confidence)}</p>
        {record.uncertaintyExplanation && (
          <p className="text-xs text-gray-500 leading-relaxed">
            Incertezza {record.uncertaintyLevel}: {record.uncertaintyExplanation}
          </p>
        )}
      </div>
    );
  }

  if (kind === 'stop') {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Cosa ti farebbe cambiare idea
        </h3>
        {(record.mindChangingConditions?.length ?? 0) > 0 ? (
          <ul className="space-y-2">
            {record.mindChangingConditions.map((cond, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nessun criterio di stop dichiarato.</p>
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

function DecisionGraphInner({
  record,
  focusStepId,
  focusToken = 0,
  onOpenInsights,
}: {
  record: ReasoningRecord;
  focusStepId?: string | null;
  focusToken?: number;
  onOpenInsights?: (stepId: string) => void;
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
          duration: 320,
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

  const composeLabel = composeStepId
    ? steps.find((s) => s.id === composeStepId)?.label
    : null;

  const [showMap, setShowMap] = useState(false);
  const selectedIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === selectedId)
  );

  return (
    <div className="space-y-3">
      {/* Mobile: lista verticale degli step (niente scroll orizzontale) */}
      <nav className="sm:hidden space-y-2" aria-label="Passaggi della decisione">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Passaggi · {selectedIndex + 1}/{steps.length}
          </p>
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="text-[11px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100"
          >
            {showMap ? 'Nascondi mappa' : 'Mostra mappa'}
          </button>
        </div>
        <ol className="reddit-card reddit-card--static divide-y divide-gray-100 overflow-hidden">
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
                    active ? 'bg-gray-900 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-semibold tabular-nums flex items-center justify-center ${
                      active ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`flex-1 text-sm font-medium truncate ${active ? 'text-white' : 'text-gray-900'}`}>
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
                        ? 'bg-gray-900 border-white/10 text-white'
                        : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold tabular-nums ${
                        active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
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
      <div className="hidden sm:flex items-center gap-1 overflow-x-auto pb-0.5" aria-label="Passaggi della decisione">
        {steps.map((step, i) => {
          const active = step.id === selectedId;
          const count = insightCounts[step.id] ?? 0;
          return (
            <React.Fragment key={step.id}>
              {i > 0 && <span className="text-gray-300 text-xs px-0.5">·</span>}
              <div className="inline-flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-gray-900 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {step.label}
                </button>
                {count > 0 && (
                  <button
                    type="button"
                    title={`${count} spunti — apri`}
                    onClick={() => onOpenInsights?.(step.id)}
                    className={`inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full text-[10px] font-semibold tabular-nums ${
                      active
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
          className={`decision-flow relative bg-gray-50/80 border-b border-gray-100 ${
            showMap ? 'block h-[280px]' : 'hidden'
          } sm:block sm:h-[340px] lg:h-[380px]`}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            minZoom={0.5}
            maxZoom={1.35}
            panOnScroll
            zoomOnScroll={false}
            preventScrolling={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
            <Controls
              showInteractive={false}
              position="bottom-right"
              className="!shadow-none !border-gray-200 !rounded-md !overflow-hidden !bg-white/90"
            />
          </ReactFlow>

          {menu && (
            <div
              className="absolute z-20 min-w-[10.5rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg shadow-gray-900/10"
              style={{ left: menu.x, top: menu.y }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {(insightCounts[menu.nodeId] ?? 0) > 0 && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    onOpenInsights?.(menu.nodeId);
                    setMenu(null);
                  }}
                >
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                  Vedi spunti ({insightCounts[menu.nodeId]})
                </button>
              )}
              {canAdvise && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setComposeStepId(menu.nodeId);
                    setMenu(null);
                  }}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-gray-400" />
                  Aggiungi spunto
                </button>
              )}
              {!canAdvise && (insightCounts[menu.nodeId] ?? 0) === 0 && (
                <p className="px-3 py-2 text-[11px] text-gray-400">Nessuna azione disponibile</p>
              )}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 lg:p-8">
          {(insightCounts[selectedId] ?? 0) > 0 && onOpenInsights && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => onOpenInsights(selectedId)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900"
              >
                <span className="inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-gray-900 text-white text-[10px] tabular-nums">
                  {insightCounts[selectedId]}
                </span>
                Vedi spunti su questo step
              </button>
            </div>
          )}
          {kindFromNodeId(selectedId) === 'sources' || kindFromNodeId(selectedId) === 'outcome' ? (
            <StepContent record={record} selectedId={selectedId} />
          ) : (
            <div className="max-w-3xl">
              <StepContent record={record} selectedId={selectedId} />
            </div>
          )}
        </div>
      </div>

      {composeStepId && canAdvise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl p-4 space-y-3"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">Aggiungi spunto</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {composeLabel ? `Sul nodo «${composeLabel}»` : 'Sul nodo selezionato'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComposeStepId(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
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
          </div>
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
}: {
  record: ReasoningRecord;
  focusStepId?: string | null;
  focusToken?: number;
  onOpenInsights?: (stepId: string) => void;
}) {
  return (
    <ReactFlowProvider>
      <DecisionGraphInner
        record={record}
        focusStepId={focusStepId}
        focusToken={focusToken}
        onOpenInsights={onOpenInsights}
      />
    </ReactFlowProvider>
  );
}
