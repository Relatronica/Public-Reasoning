'use client';

import React, { useState } from 'react';
import { mockReasoningRecords, mockPublicActs } from '@/lib/data';
import ReasoningRecordCard from '@/components/ReasoningRecordCard';
import { 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  MapPin,
  Building2,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'uncertain' | 'verified'>('all');

  const filteredRecords = mockReasoningRecords.filter(record => {
    if (activeTab === 'uncertain') return record.uncertaintyLevel === 'alto' || record.uncertaintyLevel === 'medio';
    if (activeTab === 'verified') return record.outcomeReviews && record.outcomeReviews.some(r => r.status === 'verified_true');
    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Sub-header / Feed Context Banner */}
      <div className="reddit-card p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-sm border-none">
        <div className="flex items-center gap-2 text-blue-100 font-semibold text-xs mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Comune di Cormano (MI) • Lombardia</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Registro del Giudizio Decisionale Amministrativo
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
          Le delibere ufficiali dicono <em>cosa</em> si fa. Qui registriamo la <strong>domanda reale</strong>, le <strong>opzioni scartate</strong>, le <strong>assunzioni di rischio</strong> e cosa farebbe cambiare idea.
        </p>
      </div>

      {/* Reddit Feed Filter Tabs */}
      <div className="reddit-card p-1.5 flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'all' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Tutti ({mockReasoningRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'popular' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Più Rilevanti</span>
          </button>

          <button
            onClick={() => setActiveTab('uncertain')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'uncertain' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Incertezza Rilevata</span>
          </button>

          <button
            onClick={() => setActiveTab('verified')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'verified' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Con Verifiche Dati</span>
          </button>
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
          <div className="reddit-card p-8 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-semibold text-gray-700 text-sm">Nessun record trovato con questo filtro.</p>
            <p className="text-xs text-gray-500">Prova a selezionare &quot;Tutti&quot; per vedere tutti gli atti analizzati di Cormano.</p>
          </div>
        )}
      </div>

    </div>
  );
}
