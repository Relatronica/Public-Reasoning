'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { FeedSkeleton } from '@/components/FeedSkeleton';
import { displayStatusLabel, isClosedStatus } from '@/lib/records';

function BankInner() {
  const searchParams = useSearchParams();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity } = useCuratorData();
  const packParam = searchParams.get('pack');
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all');

  const rows = useMemo(() => {
    return recordsForCommunity(community.id)
      .filter((r) => {
        if (packParam && r.compliancePack !== packParam) return false;
        if (status === 'open') return !isClosedStatus(r.status);
        if (status === 'closed') return isClosedStatus(r.status);
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
  }, [community.id, packParam, recordsForCommunity, status]);

  return (
    <div className="space-y-5 w-full max-w-5xl">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Registro</h1>
        <p className="text-sm text-gray-500">
          Elenco operativo delle schede in {community.shortName}.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-1">
        {(
          [
            ['all', 'Tutte'],
            ['open', 'Aperte'],
            ['closed', 'Chiuse'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatus(id)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              status === id
                ? 'bg-gray-900 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((record) => (
          <Link
            key={record.id}
            href={href(`/records/${record.id}`)}
            className="block reddit-card reddit-card--interactive px-5 py-3.5"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400 mb-1">
              <span>{displayStatusLabel(record.status)}</span>
              {record.category && (
                <>
                  <span>·</span>
                  <span>{record.category}</span>
                </>
              )}
              {record.publicAct?.actNumber && (
                <>
                  <span>·</span>
                  <span>{record.publicAct.actNumber}</span>
                </>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
              {record.realQuestion}
            </p>
          </Link>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-gray-500 py-6 text-center">Nessuna scheda in questo filtro.</p>
        )}
      </div>
    </div>
  );
}

export default function BankPage() {
  return (
    <Suspense fallback={<FeedSkeleton count={4} />}>
      <BankInner />
    </Suspense>
  );
}
