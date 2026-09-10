'use client';

import React from 'react';
import Link from 'next/link';
import { ReasoningRecord } from '@/types';
import { isClosedStatus, resolveVisibility } from '@/lib/records';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

interface Props {
  record: ReasoningRecord;
}

function truncate(text: string, max = 140): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

export default function ReasoningRecordCard({ record }: Props) {
  const { href } = useActiveCommunity();
  const detailHref = href(`/records/${record.id}`);
  const visibility = resolveVisibility(record);
  const showDraft = !isClosedStatus(record.status);
  const showPrivate = visibility === 'private';
  const date = record.updatedAt || record.createdAt;

  return (
    <Link
      href={detailHref}
      className="block reddit-card reddit-card--interactive px-5 py-4"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400 mb-1.5">
        {record.category && <span>{record.category}</span>}
        {record.category && date && <span>·</span>}
        {date && <span>{new Date(date).toLocaleDateString('it-IT')}</span>}
        {showDraft && (
          <>
            <span>·</span>
            <span className="text-amber-700">Bozza</span>
          </>
        )}
        {showPrivate && (
          <>
            <span>·</span>
            <span>Privata</span>
          </>
        )}
      </div>

      <h2 className="text-base font-semibold text-gray-900 leading-snug">{record.realQuestion}</h2>

      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
        <span className="text-gray-400">Decisione · </span>
        {truncate(record.decision)}
      </p>
    </Link>
  );
}
