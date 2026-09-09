'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ReasoningRecordCard from '@/components/ReasoningRecordCard';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { isVisibleOnPublicFeed } from '@/lib/records';
import { X } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity } = useCuratorData();
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  const packParam = searchParams.get('pack');
  const isAuthed = status === 'authenticated' && Boolean(session?.user);

  const communityRecords = recordsForCommunity(community.id).filter(
    (record) => isAuthed || isVisibleOnPublicFeed(record)
  );

  const filteredRecords = communityRecords
    .filter((record) => {
      if (packParam && record.compliancePack !== packParam) return false;
      if (categoryParam && record.category?.toLowerCase() !== categoryParam.toLowerCase()) {
        return false;
      }
      if (searchQuery?.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          record.realQuestion.toLowerCase().includes(q) ||
          record.decision.toLowerCase().includes(q) ||
          record.category?.toLowerCase().includes(q) ||
          Boolean(record.publicAct?.actNumber.toLowerCase().includes(q)) ||
          Boolean(record.publicAct?.title.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );

  const hasFilter = Boolean(categoryParam || searchQuery);

  return (
    <div className="space-y-5 w-full max-w-3xl">
      <header className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">Decisioni</h1>
          <p className="text-sm text-gray-500">
            {categoryParam
              ? `Argomento: ${categoryParam}`
              : searchQuery
                ? `Risultati per «${searchQuery}»`
                : `Domanda reale e scelta fatta · ${community.shortName}`}
          </p>
        </div>
        {hasFilter && (
          <Link
            href={href('/')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            Mostra tutte
          </Link>
        )}
      </header>

      <div className="space-y-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <ReasoningRecordCard key={record.id} record={record} />
          ))
        ) : (
          <div className="reddit-card px-5 py-8 text-center space-y-2">
            <p className="text-sm text-gray-600">Nessuna decisione qui.</p>
            <Link href={href('/records/capture')} className="text-xs text-gray-700 hover:underline">
              Nuova decisione
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
