'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AiAssistance } from '@/types';
import {
  AI_EXPOSURE_LABELS,
  AI_LEVEL_LABELS,
  AI_SCOPE_LABELS,
  hasAiAssistance,
} from '@/lib/ai-assistance';

interface Props {
  ai?: AiAssistance;
  compact?: boolean;
}

export function AiAssistanceBadge({ ai }: { ai?: AiAssistance }) {
  if (!hasAiAssistance(ai)) return null;
  const level = ai!.level;
  const className =
    level === 'sostanziale'
      ? 'bg-violet-100 text-violet-800 border-violet-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      {AI_LEVEL_LABELS[level]}
    </span>
  );
}

export default function AiAssistancePanel({ ai, compact = false }: Props) {
  if (!hasAiAssistance(ai)) return null;

  if (compact) {
    return <AiAssistanceBadge ai={ai} />;
  }

  return (
    <div className="p-3 bg-violet-50/70 border border-violet-200/80 rounded-xl text-xs">
      <div className="font-bold text-violet-900 mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-violet-600" />
        <span>Supporto IA nella compilazione</span>
        <span className="font-normal text-violet-700">· {AI_LEVEL_LABELS[ai!.level]}</span>
      </div>

      {(ai!.scopes?.length ?? 0) > 0 && (
        <p className="text-gray-700 mb-1.5">
          <span className="font-semibold text-gray-800">Dove: </span>
          {ai!.scopes!.map((s) => AI_SCOPE_LABELS[s]).join(', ')}
        </p>
      )}

      {ai!.tools && (
        <p className="text-gray-700 mb-1.5">
          <span className="font-semibold text-gray-800">Strumento: </span>
          {ai!.tools}
        </p>
      )}

      {ai!.dataExposure && ai!.dataExposure !== 'none' && (
        <p className="text-gray-700 mb-1.5">
          <span className="font-semibold text-gray-800">Dati esposti: </span>
          {AI_EXPOSURE_LABELS[ai!.dataExposure]}
        </p>
      )}

      {ai!.note && (
        <p className="text-gray-600 leading-relaxed mt-2 pt-2 border-t border-violet-200/60 italic">
          {ai!.note}
        </p>
      )}
    </div>
  );
}
