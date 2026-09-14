'use client';

import React from 'react';
import { AdvisorBadge, AdvisorBadgeId } from '@/lib/records/advisor-reputation';

const BADGE_STYLE: Record<
  AdvisorBadgeId,
  { className: string }
> = {
  filosofo: {
    className: 'bg-violet-50 text-violet-800 border-violet-100',
  },
  consulente: {
    className: 'bg-sky-50 text-sky-800 border-sky-100',
  },
  esperto: {
    className: 'bg-amber-50 text-amber-900 border-amber-100',
  },
  rapido: {
    className: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  },
};

function badgeClassName(badge: AdvisorBadge): string {
  if (badge.id.startsWith('domain:')) {
    return 'bg-gray-50 text-gray-700 border-gray-200';
  }
  return BADGE_STYLE[badge.id as AdvisorBadgeId]?.className ?? 'bg-gray-50 text-gray-700 border-gray-200';
}

interface Props {
  badges: AdvisorBadge[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function AdvisorBadges({
  badges,
  max = 6,
  size = 'sm',
  className = '',
}: Props) {
  if (badges.length === 0) return null;

  const visible = badges.slice(0, max);
  const sizeClass =
    size === 'md'
      ? 'px-2 py-0.5 text-[11px]'
      : 'px-1.5 py-0.5 text-[10px]';

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {visible.map((badge) => (
        <span
          key={badge.id}
          title={badge.title ?? badge.label}
          className={`inline-flex items-center rounded-md border font-semibold tracking-wide uppercase ${sizeClass} ${badgeClassName(badge)}`}
        >
          {badge.label}
        </span>
      ))}
    </span>
  );
}
