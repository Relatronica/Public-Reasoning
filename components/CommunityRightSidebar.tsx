'use client';

import React from 'react';
import { 
  Building2, 
  Users, 
  FileCheck, 
  ExternalLink, 
  MapPin, 
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function CommunityRightSidebar() {
  return (
    <aside className="w-80 flex-shrink-0 hidden lg:block space-y-5">
      
      {/* Municipality Header Card (Reddit Community Style) */}
      <div className="reddit-card p-4 overflow-hidden relative">
        <div className="h-14 -mx-4 -mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 p-3 flex items-end">
          <span className="text-white text-xs font-bold tracking-wide">Comune di Cormano (MI)</span>
        </div>
        
        <div className="relative -mt-6 mb-3 flex items-end justify-between">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-white shadow-md flex items-center justify-center font-black text-blue-700 text-lg">
            MI
          </div>
          <a
            href="https://comune.cormano.mi.it"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
          >
            <span>Albo Pretorio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <h3 className="font-bold text-gray-900 text-base">Comune di Cormano</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Monitoraggio civico indipendente e ricostruzione del ragionamento decisionale amministrativo.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
          <div>
            <div className="text-gray-400 font-medium text-[10px] uppercase">Abitanti</div>
            <div className="font-bold text-gray-900 text-sm mt-0.5">~20.100</div>
          </div>
          <div>
            <div className="text-gray-400 font-medium text-[10px] uppercase">Atti Archiviati</div>
            <div className="font-bold text-blue-600 text-sm mt-0.5">3 Delibere</div>
          </div>
          <div>
            <div className="text-gray-400 font-medium text-[10px] uppercase">Verifiche a 6M</div>
            <div className="font-bold text-emerald-600 text-sm mt-0.5">1 Completata</div>
          </div>
          <div>
            <div className="text-gray-400 font-medium text-[10px] uppercase">Incertezza Media</div>
            <div className="font-bold text-amber-600 text-sm mt-0.5">Medio-Alta</div>
          </div>
        </div>

      </div>

      {/* Regole & Principi di Trasparenza */}
      <div className="reddit-card p-4 space-y-3">
        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-blue-600" />
          <span>Standard Reasoning Record</span>
        </h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-800">1. Domanda Sostanziale</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Separare la sostanza dall&apos;artificiale burocratico.</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-800">2. Falsificabilità</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Definire quali dati avrebbero invertito la scelta.</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-800">3. Distinzione delle Fonti</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Citazioni dirette divise dalle interpretazioni.</p>
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="text-[11px] text-gray-400 px-1 leading-relaxed">
        Reasoning Records © 2024 — Strato leggibile civico sopra gli atti pubblici di Cormano (MI).
      </div>

    </aside>
  );
}
