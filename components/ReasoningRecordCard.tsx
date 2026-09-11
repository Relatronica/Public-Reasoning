'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ReasoningRecord } from '@/types';
import { displayStatusLabel, isClosedStatus, resolveVisibility } from '@/lib/records';
import { categoryColorHex } from '@/lib/communities/category-colors';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

export type FeedViewMode = 'card' | 'list';

interface Props {
  record: ReasoningRecord;
  variant?: FeedViewMode;
}

function truncate(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

function statusTone(status: ReasoningRecord['status']): string {
  if (status === 'draft') return 'text-amber-700 bg-amber-50';
  if (status === 'published' || status === 'closed') return 'text-emerald-700 bg-emerald-50';
  if (status === 'under_review' || status === 'pending_sponsor') return 'text-sky-700 bg-sky-50';
  return 'text-gray-600 bg-gray-50';
}

export default function ReasoningRecordCard({ record, variant = 'card' }: Props) {
  const { href, community } = useActiveCommunity();
  const detailHref = href(`/records/${record.id}`);
  const visibility = resolveVisibility(record);
  const showPrivate = visibility === 'private';
  const date = record.updatedAt || record.createdAt;
  const statusLabel = displayStatusLabel(record.status);
  const statusText = showPrivate
    ? isClosedStatus(record.status)
      ? 'Privata'
      : `${statusLabel} · privata`
    : statusLabel;

  const categoryDef = community.categories.find(
    (c) => c.label.toLowerCase() === (record.category ?? '').toLowerCase()
  );
  const categoryHex = categoryDef ? categoryColorHex(categoryDef.color) : '#94a3b8';
  const actNumber = record.publicAct?.actNumber?.trim();

  if (variant === 'list') {
    return (
      <Link
        href={detailHref}
        className="group flex items-center gap-3 reddit-card reddit-card--interactive px-3.5 py-2.5 sm:px-4"
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-black/10"
          style={{ backgroundColor: categoryHex }}
          title={record.category || 'Senza argomento'}
          aria-hidden
        />
        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
          <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-1 sm:flex-1 min-w-0">
            {record.realQuestion}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400 flex-shrink-0">
            {record.category && <span className="hidden sm:inline">{record.category}</span>}
            {actNumber && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="font-medium text-gray-500">{actNumber}</span>
              </>
            )}
            {date && (
              <>
                {(record.category || actNumber) && <span className="hidden sm:inline">·</span>}
                <span>{new Date(date).toLocaleDateString('it-IT')}</span>
              </>
            )}
            <span className={`px-1.5 py-0.5 rounded ${statusTone(record.status)}`}>
              {statusText}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 hidden sm:block" />
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      className="group block reddit-card reddit-card--interactive overflow-hidden"
    >
      <div className="flex">
        <div
          className="w-1 flex-shrink-0 self-stretch"
          style={{ backgroundColor: categoryHex }}
          aria-hidden
        />
        <div className="flex-1 min-w-0 px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400">
                {record.category && (
                  <span className="inline-flex items-center gap-1.5 text-gray-600 font-medium">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: categoryHex }}
                      aria-hidden
                    />
                    {record.category}
                  </span>
                )}
                {date && (
                  <>
                    {record.category && <span>·</span>}
                    <span>{new Date(date).toLocaleDateString('it-IT')}</span>
                  </>
                )}
                {actNumber && (
                  <>
                    <span>·</span>
                    <span className="text-gray-500 font-medium">{actNumber}</span>
                  </>
                )}
                <span>·</span>
                <span className={`px-1.5 py-0.5 rounded ${statusTone(record.status)}`}>
                  {statusText}
                </span>
              </div>

              <h2 className="text-[15px] sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                {record.realQuestion}
              </h2>

              <p className="text-sm text-gray-600 leading-snug line-clamp-1">
                <span className="text-gray-400">Decisione · </span>
                {truncate(record.decision, 160)}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1 hidden sm:block" />
          </div>
        </div>
      </div>
    </Link>
  );
}
