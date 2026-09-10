'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DecisionGraphNodeData } from '@/lib/records/decision-graph';

const ACCENT: Record<DecisionGraphNodeData['tone'], string> = {
  blue: 'border-l-blue-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
  rose: 'border-l-rose-500',
  gray: 'border-l-gray-400',
};

const ACCENT_SELECTED: Record<DecisionGraphNodeData['tone'], string> = {
  blue: 'border-l-blue-600',
  amber: 'border-l-amber-600',
  emerald: 'border-l-emerald-600',
  rose: 'border-l-rose-600',
  gray: 'border-l-gray-600',
};

function DecisionGraphNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as DecisionGraphNodeData;
  const count = nodeData.insightCount ?? 0;

  return (
    <div
      className={`relative w-[200px] rounded-lg border border-l-[3px] bg-white transition-all duration-150 ${
        selected
          ? `${ACCENT_SELECTED[nodeData.tone]} border-gray-800 ring-2 ring-gray-900/20 shadow-md z-10`
          : `${ACCENT[nodeData.tone]} border-gray-200 opacity-[0.62] hover:opacity-100 hover:border-gray-300`
      }`}
    >
      {count > 0 && (
        <span
          className={`absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-semibold tabular-nums flex items-center justify-center ${
            selected ? 'bg-gray-900 text-white' : 'bg-gray-500 text-white'
          }`}
          title={`${count} spunti collegati`}
        >
          {count}
        </span>
      )}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-300 !border-2 !border-white !opacity-0"
      />
      <div className="px-3 py-2.5 space-y-1">
        <div
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            selected ? 'text-gray-800' : 'text-gray-400'
          }`}
        >
          {nodeData.label}
        </div>
        <p
          className={`text-xs leading-snug line-clamp-3 ${
            selected ? 'text-gray-900 font-medium' : 'text-gray-600'
          }`}
        >
          {nodeData.preview}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-300 !border-2 !border-white !opacity-0"
      />
    </div>
  );
}

export default memo(DecisionGraphNodeComponent);
