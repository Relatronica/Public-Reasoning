'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import {
  insightAuthorInitials,
  resolveInsightAvatar,
} from '@/lib/records/insight-avatar';
import { DecisionInsight } from '@/types';

interface Props {
  insight: Pick<DecisionInsight, 'avatar' | 'author' | 'authorUserId' | 'role' | 'id'>;
  size?: 'sm' | 'md';
  className?: string;
}

/** Avatar di chi lascia lo spunto (foto, peep o iniziali; icona per spunti di sistema). */
export default function InsightAvatar({ insight, size = 'md', className = '' }: Props) {
  const px = size === 'sm' ? 28 : 36;
  const url = resolveInsightAvatar(insight);
  const isSystem = insight.role === 'Sistema';
  const initials = insightAuthorInitials(insight.author, insight.role);

  const base =
    size === 'sm'
      ? 'w-7 h-7 text-[10px]'
      : 'w-9 h-9 text-[11px]';

  if (isSystem) {
    return (
      <span
        className={`inline-flex flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 ${base} ${className}`}
        title={insight.author || 'Sistema'}
      >
        <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </span>
    );
  }

  if (url) {
    // I peep sono illustrazioni: object-cover taglia testa/bordi; le foto OAuth restano cover.
    const isPeep = url.startsWith('/avatar/');
    return (
      <span
        className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white border border-gray-200 ${base} ${className}`}
        title={insight.author || insight.role}
      >
        <Image
          src={url}
          alt=""
          width={px}
          height={px}
          className={
            isPeep
              ? 'w-[85%] h-[85%] object-contain object-center'
              : 'w-full h-full object-cover object-center'
          }
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold border border-gray-200 ${base} ${className}`}
      title={insight.author || insight.role}
    >
      {initials}
    </span>
  );
}
