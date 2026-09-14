'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  AlertTriangle,
  BookOpen,
  CircleSlash,
  HelpCircle,
  Scale,
  Target,
} from 'lucide-react';
import type { DecisionGraphNodeData, DecisionGraphNodeKind } from '@/lib/records/decision-graph';

const KIND_ICON: Record<
  DecisionGraphNodeKind,
  React.ComponentType<{ className?: string }>
> = {
  question: HelpCircle,
  discarded: CircleSlash,
  decision: Scale,
  stop: AlertTriangle,
  outcome: Target,
  sources: BookOpen,
};

const TONE = {
  blue: {
    idle: 'border-blue-200/90 bg-gradient-to-br from-white to-blue-50/70',
    selected:
      'border-blue-400 bg-gradient-to-br from-white to-blue-50 shadow-[0_10px_28px_-12px_rgba(37,99,235,0.45)] ring-2 ring-blue-500/20',
    chip: 'bg-blue-100 text-blue-800',
    icon: 'text-blue-600',
    previewIdle: 'text-slate-600',
    previewSelected: 'text-slate-900',
  },
  amber: {
    idle: 'border-amber-200/90 bg-gradient-to-br from-white to-amber-50/60',
    selected:
      'border-amber-400 bg-gradient-to-br from-white to-amber-50 shadow-[0_10px_28px_-12px_rgba(217,119,6,0.4)] ring-2 ring-amber-500/20',
    chip: 'bg-amber-100 text-amber-900',
    icon: 'text-amber-700',
    previewIdle: 'text-slate-600',
    previewSelected: 'text-slate-900',
  },
  emerald: {
    idle: 'border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/70',
    selected:
      'border-emerald-400 bg-gradient-to-br from-white to-emerald-50 shadow-[0_10px_28px_-12px_rgba(5,150,105,0.4)] ring-2 ring-emerald-500/25',
    chip: 'bg-emerald-100 text-emerald-900',
    icon: 'text-emerald-700',
    previewIdle: 'text-slate-600',
    previewSelected: 'text-slate-900',
  },
  rose: {
    idle: 'border-rose-200/90 bg-gradient-to-br from-white to-rose-50/70',
    selected:
      'border-rose-400 bg-gradient-to-br from-white to-rose-50 shadow-[0_10px_28px_-12px_rgba(225,29,72,0.35)] ring-2 ring-rose-500/20',
    chip: 'bg-rose-100 text-rose-900',
    icon: 'text-rose-700',
    previewIdle: 'text-slate-600',
    previewSelected: 'text-slate-900',
  },
  gray: {
    idle: 'border-slate-200 bg-gradient-to-br from-white to-slate-50/80',
    selected:
      'border-slate-400 bg-gradient-to-br from-white to-slate-50 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.28)] ring-2 ring-slate-400/25',
    chip: 'bg-slate-100 text-slate-800',
    icon: 'text-slate-600',
    previewIdle: 'text-slate-600',
    previewSelected: 'text-slate-900',
  },
} as const;

function DecisionGraphNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as DecisionGraphNodeData;
  const count = nodeData.insightCount ?? 0;
  const tone = TONE[nodeData.tone];
  const Icon = KIND_ICON[nodeData.kind];

  return (
    <div
      className={`decision-graph-node relative w-[212px] rounded-xl border transition-all duration-200 ease-out ${
        selected
          ? `${tone.selected} z-10 scale-[1.03]`
          : `${tone.idle} opacity-90 hover:opacity-100 hover:scale-[1.015] hover:shadow-sm`
      }`}
    >
      {count > 0 && (
        <span
          className={`absolute -top-2 -right-2 min-w-[1.35rem] h-5 px-1.5 rounded-full text-[10px] font-semibold tabular-nums flex items-center justify-center shadow-sm transition-colors ${
            selected
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
          title={`${count} spunti collegati`}
        >
          {count}
        </span>
      )}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-300 !border-2 !border-white !opacity-0"
      />
      <div className="px-3.5 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${tone.chip}`}
          >
            <Icon className={`h-3.5 w-3.5 ${tone.icon}`} />
          </span>
          <span
            className={`text-[11px] font-semibold tracking-wide ${
              selected ? 'text-slate-800' : 'text-slate-500'
            }`}
          >
            {nodeData.label}
          </span>
        </div>
        <p
          className={`text-[12.5px] leading-snug line-clamp-3 ${
            selected ? `${tone.previewSelected} font-medium` : tone.previewIdle
          }`}
        >
          {nodeData.preview}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-slate-300 !border-2 !border-white !opacity-0"
      />
    </div>
  );
}

export default memo(DecisionGraphNodeComponent);
