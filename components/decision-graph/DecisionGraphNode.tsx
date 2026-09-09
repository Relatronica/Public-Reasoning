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

function DecisionGraphNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as DecisionGraphNodeData;
  const count = nodeData.insightCount ?? 0;

  return (
    <div
      className={`relative w-[200px] rounded-lg border border-gray-200 border-l-[3px] bg-white transition-colors ${
        ACCENT[nodeData.tone]
      } ${selected ? 'border-gray-300 bg-gray-50 shadow-sm' : 'hover:border-gray-300'}`}
    >
      {count > 0 && (
        <span
          className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-gray-900 text-white text-[10px] font-semibold tabular-nums flex items-center justify-center"
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
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {nodeData.label}
        </div>
        <p className="text-xs text-gray-800 leading-snug line-clamp-3">{nodeData.preview}</p>
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
