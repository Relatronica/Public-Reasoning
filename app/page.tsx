'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ReasoningRecordCard from '@/components/ReasoningRecordCard';
import { FeedSkeleton } from '@/components/FeedSkeleton';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { isVisibleOnPublicFeed } from '@/lib/records';
import { LogIn, Plus, X } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity, canCompile, loading } = useCuratorData();
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

  const hasFilter = Boolean(categoryParam || searchQuery || packParam);
  const trulyEmpty = communityRecords.length === 0;

  return (
    <div className="space-y-5 w-full max-w-3xl">
      {/* Identità community (soprattutto mobile: pack destra assente) */}
      <div className="lg:hidden reddit-card reddit-card--static overflow-hidden">
        {community.coverImageUrl && (
          <div className="relative h-16 bg-gray-100">
            <Image
              src={community.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized={community.coverImageUrl.startsWith('http')}
            />
          </div>
        )}
        <div className="px-4 py-3 flex items-center gap-3">
          {community.logoUrl ? (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
              <Image
                src={community.logoUrl}
                alt=""
                fill
                className="object-contain p-0.5"
                unoptimized={community.logoUrl.startsWith('http')}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {community.initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{community.shortName}</p>
            <p className="text-[11px] text-gray-500 truncate">
              {community.typeLabel}
              {community.tagline ? ` · ${community.tagline}` : ''}
            </p>
          </div>
        </div>
      </div>

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

      {loading && status === 'loading' ? (
        <FeedSkeleton />
      ) : (
        <div className="space-y-3">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <ReasoningRecordCard key={record.id} record={record} />
            ))
          ) : (
            <div className="reddit-card reddit-card--static px-5 py-8 text-center space-y-3">
              {hasFilter && !trulyEmpty ? (
                <>
                  <p className="text-sm font-medium text-gray-900">Nessun risultato con questi filtri</p>
                  <p className="text-xs text-gray-500">Prova a togliere argomento o ricerca.</p>
                  <Link href={href('/')} className="btn-secondary inline-flex">
                    Mostra tutte le decisioni
                  </Link>
                </>
              ) : trulyEmpty && canCompile ? (
                <>
                  <p className="text-sm font-medium text-gray-900">Ancora nessuna decisione</p>
                  <p className="text-xs text-gray-500">
                    Documenta la prima scelta di {community.shortName}.
                  </p>
                  <Link href={href('/records/capture')} className="btn-primary inline-flex">
                    <Plus className="w-3.5 h-3.5" />
                    Nuova decisione
                  </Link>
                </>
              ) : trulyEmpty && !isAuthed ? (
                <>
                  <p className="text-sm font-medium text-gray-900">Nessuna decisione pubblica</p>
                  <p className="text-xs text-gray-500">Accedi per vedere di più o contribuire.</p>
                  <Link
                    href={`/auth/login?callbackUrl=${encodeURIComponent(href('/'))}`}
                    className="btn-primary inline-flex"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Accedi
                  </Link>
                </>
              ) : trulyEmpty ? (
                <>
                  <p className="text-sm font-medium text-gray-900">Ancora nessuna decisione</p>
                  <p className="text-xs text-gray-500">
                    Qui compariranno le schede di {community.shortName}.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">Nessuna decisione qui</p>
                  <Link href={href('/')} className="text-xs text-gray-600 hover:underline">
                    Torna al feed
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
