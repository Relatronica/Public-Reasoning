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

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
      <Sparkles className="w-3 h-3 text-gray-500" />
      {AI_LEVEL_LABELS[ai!.level]}
    </span>
  );
}

export default function AiAssistancePanel({ ai, compact = false }: Props) {
  if (!hasAiAssistance(ai)) return null;

  if (compact) {
    return <AiAssistanceBadge ai={ai} />;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-2">
        <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-gray-400" />
          Supporto IA
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-700 font-medium normal-case tracking-normal">
          {AI_LEVEL_LABELS[ai!.level]}
        </span>
      </div>

      <dl className="grid gap-1.5 sm:grid-cols-2 text-sm text-gray-700">
        {(ai!.scopes?.length ?? 0) > 0 && (
          <div>
            <dt className="text-[11px] text-gray-500">Dove</dt>
            <dd>{ai!.scopes!.map((s) => AI_SCOPE_LABELS[s]).join(', ')}</dd>
          </div>
        )}
        {ai!.tools && (
          <div>
            <dt className="text-[11px] text-gray-500">Strumento</dt>
            <dd>{ai!.tools}</dd>
          </div>
        )}
        {ai!.dataExposure && ai!.dataExposure !== 'none' && (
          <div>
            <dt className="text-[11px] text-gray-500">Dati esposti</dt>
            <dd>{AI_EXPOSURE_LABELS[ai!.dataExposure]}</dd>
          </div>
        )}
      </dl>

      {ai!.note && (
        <p className="text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-200">
          {ai!.note}
        </p>
      )}
    </div>
  );
}
