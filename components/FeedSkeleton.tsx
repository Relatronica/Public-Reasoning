'use client';

import React from 'react';
import type { FeedViewMode } from '@/components/ReasoningRecordCard';

/** Skeleton allineati alle viste Decisioni (card | elenco). */
export function FeedSkeleton({
  count = 3,
  variant = 'card',
}: {
  count?: number;
  variant?: FeedViewMode;
}) {
  if (variant === 'list') {
    return (
      <div className="space-y-1.5 w-full max-w-5xl" aria-hidden>
        {Array.from({ length: count + 2 }).map((_, i) => (
          <div
            key={i}
            className="reddit-card reddit-card--static px-4 py-2.5 animate-pulse flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="h-3.5 flex-1 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-50 rounded hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 w-full max-w-5xl" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="reddit-card reddit-card--static overflow-hidden animate-pulse">
          <div className="flex">
            <div className="w-1 bg-gray-100 flex-shrink-0 self-stretch min-h-[4.5rem]" />
            <div className="flex-1 px-5 py-3.5 space-y-2">
              <div className="h-2.5 w-40 bg-gray-100 rounded" />
              <div className="h-4 w-[90%] bg-gray-100 rounded" />
              <div className="h-3 w-[70%] bg-gray-50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ label = 'Caricamento' }: { label?: string }) {
  return (
    <div className="space-y-4 w-full max-w-5xl" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-56 bg-gray-50 rounded animate-pulse" />
      <FeedSkeleton count={2} />
    </div>
  );
}
