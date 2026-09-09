'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockReasoningRecords } from '@/lib/data';
import ReasoningRecordCard from '@/components/ReasoningRecordCard';
import { 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  MapPin,
  HelpCircle,
  X,
  Tag
} from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('q');

  const filteredRecords = mockReasoningRecords.filter(record => {
    // 1. Filter by category if set
    if (categoryParam) {
      if (record.category?.toLowerCase() !== categoryParam.toLowerCase()) {
        return false;
      }
    }

    // 2. Filter by search query if set
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

    // 3. Filter by tab status (uncertainty, verified, popular, all)
    if (filterParam === 'uncertainty' || filterParam === 'uncertain') {
      return record.uncertaintyLevel === 'alto' || record.uncertaintyLevel === 'medio';
    }
    if (filterParam === 'verified') {
      return (record.outcomeReviews && record.outcomeReviews.some(r => r.status === 'verified_true' || r.status === 'pending')) || record.publicAct?.isVerified;
    }
    return true;
  });

  // Sort if popular
  if (filterParam === 'popular') {
    filteredRecords.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }

  const activeTab = filterParam === 'uncertain' ? 'uncertainty' : filterParam;

  // Helper function to build tab link preserving category and search query
  const getTabHref = (tabKey: string) => {
    const params = new URLSearchParams();
    if (tabKey !== 'all') {
      params.set('filter', tabKey);
    }
    if (categoryParam) {
      params.set('category', categoryParam);
    }
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  return (
    <div className="space-y-5">
      
      {/* Header Context Banner (Light & Clean) */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>Comune di Cormano (MI) • Registro Civico Trasparenza</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
            Registro del Giudizio Decisionale Amministrativo
          </h1>
          <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
            Oltre l&apos;atto formale: la domanda reale, le opzioni scartate e le assunzioni di rischio delle decisioni pubbliche.
          </p>
        </div>
      </div>

      {/* Banner Filtri Attivi (se argomenti o ricerca o filtri attivi) */}
      {(categoryParam || searchQuery || (filterParam !== 'all' && filterParam !== '')) && (
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-blue-900 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Filtri attivi:</span>
            </span>
            {categoryParam && (
              <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                <Tag className="w-3 h-3 text-blue-600" />
                <span>Argomento: {categoryParam}</span>
              </span>
            )}
            {filterParam !== 'all' && (
              <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-md">
                Stato: {filterParam === 'uncertainty' || filterParam === 'uncertain' ? 'Incertezza Rilevata' : filterParam === 'verified' ? 'Con Verifiche Dati' : filterParam === 'popular' ? 'Più Rilevanti' : filterParam}
              </span>
            )}
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-md">
                Ricerca: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
          <Link
            href="/"
            className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline bg-white px-2.5 py-1 rounded-lg border border-blue-200"
          >
            <X className="w-3.5 h-3.5 text-blue-600" />
            <span>Mostra tutti i record</span>
          </Link>
        </div>
      )}

      {/* Reddit Feed Filter Tabs */}
      <div className="reddit-card p-1.5 flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1">
          <Link
            href={getTabHref('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'all' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Tutti ({mockReasoningRecords.length})</span>
          </Link>

          <Link
            href={getTabHref('popular')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'popular' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Più Rilevanti</span>
          </Link>

          <Link
            href={getTabHref('uncertainty')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'uncertainty' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Incertezza Rilevata</span>
          </Link>

          <Link
            href={getTabHref('verified')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'verified' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Con Verifiche Dati</span>
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-1 pr-2 text-gray-400 text-[11px] font-normal">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtro Attivo: Cormano (MI)</span>
        </div>
      </div>

      {/* Main Feed List of Cards */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <ReasoningRecordCard key={record.id} record={record} />
          ))
        ) : (
          <div className="reddit-card p-8 text-center space-y-3 bg-white">
            <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-semibold text-gray-700 text-sm">Nessun record trovato con questo filtro.</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Non sono presenti record per la combinazione di argomenti e filtri selezionata.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Mostra tutti i record di Cormano</span>
            </Link>
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
        Caricamento registro decisionale...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

