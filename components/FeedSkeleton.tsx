'use client';

import React from 'react';

/** Skeleton card allineate al feed delle decisioni. */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full max-w-3xl" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="reddit-card reddit-card--static px-5 py-4 animate-pulse">
          <div className="h-2.5 w-16 bg-gray-100 rounded mb-3" />
          <div className="h-4 w-[88%] bg-gray-100 rounded mb-2" />
          <div className="h-3 w-[70%] bg-gray-50 rounded mb-3" />
          <div className="h-3 w-24 bg-gray-50 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ label = 'Caricamento' }: { label?: string }) {
  return (
    <div className="space-y-4 w-full max-w-3xl" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-56 bg-gray-50 rounded animate-pulse" />
      <FeedSkeleton count={2} />
    </div>
  );
}
