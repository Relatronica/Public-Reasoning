'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { displayStatusLabel } from '@/lib/records';

function RecordsListInner() {
  const { status } = useSession();
  const router = useRouter();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity } = useCuratorData();
  const records = recordsForCommunity(community.id);

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/curator/records')));
    return null;
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={href('/curator')} className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Schede</h1>
            <p className="text-xs text-gray-500">{community.name} · {records.length} record</p>
          </div>
        </div>
        <Link
          href={href('/records/capture')}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Cattura
        </Link>
      </div>

      <div className="space-y-2">
        {records.map((record) => (
          <Link
            key={record.id}
            href={href(`/curator/records/${record.id}`)}
            className="reddit-card p-4 flex items-start justify-between gap-3 hover:border-blue-200 transition-colors"
          >
            <div className="min-w-0">
              {record.category && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {record.category}
                </span>
              )}
              <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2">
                {record.realQuestion}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{record.decision}</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                {displayStatusLabel(record.status)}
                {record.visibility === 'private' ? ' · Privato' : ''}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function RecordsListPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <RecordsListInner />
    </Suspense>
  );
}
