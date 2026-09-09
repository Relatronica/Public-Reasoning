import { MarkerType, type Edge, type Node } from '@xyflow/react';
import { ReasoningRecord } from '@/types';
import { hasAiAssistance } from '@/lib/ai-assistance';
import { hasOutcomeLoop, outcomeStatusLabel, primaryOutcome } from '@/lib/records/outcomes';

export type DecisionGraphNodeKind =
  | 'question'
  | 'discarded'
  | 'decision'
  | 'stop'
  | 'outcome'
  | 'sources';

export type DecisionGraphNodeData = {
  kind: DecisionGraphNodeKind;
  label: string;
  preview: string;
  tone: 'blue' | 'amber' | 'emerald' | 'rose' | 'gray';
  insightCount?: number;
};

function truncate(text: string, max = 72): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

const EDGE_MUTED = '#cbd5e1';
const EDGE_CHOSEN = '#94a3b8';
const EDGE_DISCARD = '#d6d3d1';

export function listDecisionSteps(record: ReasoningRecord): {
  id: string;
  kind: DecisionGraphNodeKind;
  label: string;
}[] {
  const steps: { id: string; kind: DecisionGraphNodeKind; label: string }[] = [
    { id: 'question', kind: 'question', label: 'Domanda' },
  ];
  (record.discardedOptions ?? []).forEach((opt, i) => {
    steps.push({
      id: `discarded-${opt.id || i}`,
      kind: 'discarded',
      label: record.discardedOptions.length > 1 ? `Scarto ${i + 1}` : 'Scarto',
    });
  });
  steps.push({ id: 'decision', kind: 'decision', label: 'Decisione' });
  if ((record.mindChangingConditions?.length ?? 0) > 0) {
    steps.push({ id: 'stop', kind: 'stop', label: 'Stop' });
  }
  if (hasOutcomeLoop(record) || (record.outcomeReviews?.length ?? 0) > 0) {
    steps.push({ id: 'outcome', kind: 'outcome', label: 'Esito' });
  }
  if (
    (record.verbatimQuotes?.length ?? 0) > 0 ||
    Boolean(record.interpretativeSummary?.trim()) ||
    hasAiAssistance(record.aiAssistance)
  ) {
    steps.push({ id: 'sources', kind: 'sources', label: 'Fonti' });
  }
  return steps;
}

export function buildDecisionGraph(record: ReasoningRecord): {
  nodes: Node<DecisionGraphNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<DecisionGraphNodeData>[] = [];
  const edges: Edge[] = [];
  const discarded = record.discardedOptions ?? [];
  const hasStop = (record.mindChangingConditions?.length ?? 0) > 0;
  const hasOutcome = hasOutcomeLoop(record) || (record.outcomeReviews?.length ?? 0) > 0;
  const hasSources =
    (record.verbatimQuotes?.length ?? 0) > 0 ||
    Boolean(record.interpretativeSummary?.trim()) ||
    hasAiAssistance(record.aiAssistance);

  const yMain = 120;
  const x0 = 40;
  const gap = 260;

  nodes.push({
    id: 'question',
    type: 'decision',
    position: { x: x0, y: yMain },
    data: {
      kind: 'question',
      label: 'Domanda',
      preview: truncate(record.realQuestion),
      tone: 'blue',
    },
  });

  discarded.forEach((opt, i) => {
    const id = `discarded-${opt.id || i}`;
    nodes.push({
      id,
      type: 'decision',
      position: { x: x0 + gap, y: 8 + i * 88 },
      data: {
        kind: 'discarded',
        label: 'Scartata',
        preview: truncate(opt.title || opt.reasonDiscarded, 60),
        tone: 'amber',
      },
    });
    edges.push({
      id: `e-q-${id}`,
      source: 'question',
      target: id,
      type: 'smoothstep',
      style: { stroke: EDGE_DISCARD, strokeWidth: 1.25, strokeDasharray: '4 4' },
    });
  });

  const xDecision = x0 + gap;
  nodes.push({
    id: 'decision',
    type: 'decision',
    position: { x: xDecision, y: discarded.length ? 200 : yMain },
    data: {
      kind: 'decision',
      label: 'Decisione',
      preview: truncate(record.decision),
      tone: 'emerald',
    },
  });

  edges.push({
    id: 'e-q-decision',
    source: 'question',
    target: 'decision',
    type: 'smoothstep',
    style: { stroke: EDGE_CHOSEN, strokeWidth: 1.75 },
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_CHOSEN, width: 14, height: 14 },
  });

  let lastId = 'decision';
  let xCursor = xDecision + gap;
  const yBranch = discarded.length ? 200 : yMain;

  if (hasStop) {
    nodes.push({
      id: 'stop',
      type: 'decision',
      position: { x: xCursor, y: yBranch },
      data: {
        kind: 'stop',
        label: 'Stop',
        preview: truncate(record.mindChangingConditions?.[0] || 'Criterio di ripensamento'),
        tone: 'rose',
      },
    });
    edges.push({
      id: 'e-decision-stop',
      source: lastId,
      target: 'stop',
      type: 'smoothstep',
      style: { stroke: EDGE_CHOSEN, strokeWidth: 1.75 },
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_CHOSEN, width: 14, height: 14 },
    });
    lastId = 'stop';
    xCursor += gap;
  }

  if (hasOutcome) {
    const primary = primaryOutcome(record);
    const preview = primary
      ? `${outcomeStatusLabel(primary.status)} · ${truncate(primary.expectedOutcome, 48)}`
      : record.confidence
        ? `Confidenza ${record.confidence}/5`
        : 'Esito e revisione';
    nodes.push({
      id: 'outcome',
      type: 'decision',
      position: { x: xCursor, y: yBranch },
      data: {
        kind: 'outcome',
        label: 'Esito',
        preview,
        tone: 'gray',
      },
    });
    edges.push({
      id: 'e-to-outcome',
      source: lastId,
      target: 'outcome',
      type: 'smoothstep',
      style: { stroke: EDGE_CHOSEN, strokeWidth: 1.75 },
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_CHOSEN, width: 14, height: 14 },
    });
    lastId = 'outcome';
    xCursor += gap;
  }

  if (hasSources) {
    nodes.push({
      id: 'sources',
      type: 'decision',
      position: { x: xCursor, y: discarded.length ? 320 : yMain + 140 },
      data: {
        kind: 'sources',
        label: 'Fonti',
        preview: 'Citazioni e sintesi',
        tone: 'gray',
      },
    });
    edges.push({
      id: 'e-to-sources',
      source: lastId,
      target: 'sources',
      type: 'smoothstep',
      style: { stroke: EDGE_MUTED, strokeWidth: 1.25 },
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_MUTED, width: 12, height: 12 },
    });
  }

  return { nodes, edges };
}
