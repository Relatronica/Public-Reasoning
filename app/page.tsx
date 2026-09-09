'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ReasoningRecordCard from '@/components/ReasoningRecordCard';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { isVisibleOnPublicFeed } from '@/lib/records';
import { AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity } = useCuratorData();
  const filterParam = searchParams.get('filter') || 'all';
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('q');

  const packParam = searchParams.get('pack');
  const isAuthed = status === 'authenticated' && Boolean(session?.user);
  const communityRecords = recordsForCommunity(community.id).filter(
    (record) => isAuthed || isVisibleOnPublicFeed(record)
  );

  const filteredRecords = communityRecords.filter(record => {
    if (packParam && record.compliancePack !== packParam) {
      return false;
    }

    if (categoryParam) {
      if (record.category?.toLowerCase() !== categoryParam.toLowerCase()) {
        return false;
      }
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = record.publicAct?.title.toLowerCase().includes(q);
      const matchesQuestion = record.realQuestion.toLowerCase().includes(q);
      const matchesDecision = record.decision.toLowerCase().includes(q);
      const matchesCategory = record.category?.toLowerCase().includes(q);
      const matchesActNumber = record.publicAct?.actNumber.toLowerCase().includes(q);
      if (!matchesTitle && !matchesQuestion && !matchesDecision && !matchesCategory && !matchesActNumber) {
        return false;
      }
    }

    if (filterParam === 'uncertainty' || filterParam === 'uncertain') {
      return record.uncertaintyLevel === 'alto' || record.uncertaintyLevel === 'medio';
    }
    if (filterParam === 'verified') {
      return (record.outcomeReviews && record.outcomeReviews.some(r => r.status === 'verified_true' || r.status === 'pending')) || record.publicAct?.isVerified;
    }
    return true;
  });

  if (filterParam === 'popular') {
    filteredRecords.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }

  const activeTab = filterParam === 'uncertain' ? 'uncertainty' : filterParam;
  const hasExtraFilter = Boolean(categoryParam || searchQuery);

  const getTabHref = (tabKey: string) =>
    href('/', {
      filter: tabKey === 'all' ? undefined : tabKey,
      category: categoryParam || undefined,
      q: searchQuery || undefined,
      pack: packParam || undefined,
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs font-semibold overflow-x-auto">
          <Link
            href={getTabHref('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tutti
          </Link>
          <Link
            href={getTabHref('uncertainty')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'uncertainty' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Incertezza
          </Link>
          <Link
            href={getTabHref('verified')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'verified' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verifiche
          </Link>
          {community.slug === 'ai-governance' && (
            <Link
              href={href('/', { pack: packParam === 'ai_governance' ? undefined : 'ai_governance' })}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                packParam === 'ai_governance' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Solo pack IA UE
            </Link>
          )}
        </div>

        {hasExtraFilter && (
          <Link
            href={href('/')}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            {categoryParam || searchQuery}
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <ReasoningRecordCard key={record.id} record={record} />
          ))
        ) : (
          <div className="reddit-card p-8 text-center space-y-2">
            <HelpCircle className="w-7 h-7 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">Nessun record con questo filtro.</p>
            <p className="text-xs text-gray-400">
              Le bozze private non compaiono nel feed pubblico. Accedi per vederle, o cattura una decisione.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={href('/records/capture')} className="text-xs text-blue-600 hover:underline">
                Cattura decisione
              </Link>
              <Link href={href('/')} className="text-xs text-blue-600 hover:underline">
                Mostra tutti
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="reddit-card p-8 text-center text-sm text-gray-500">
        Caricamento…
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
