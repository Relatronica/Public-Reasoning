'use client';

import React from 'react';
import Link from 'next/link';
import { mockPublicActs } from '@/lib/data';
import { FileText, ArrowRight, ShieldCheck, ShieldAlert, Calendar, MapPin, ExternalLink, Info } from 'lucide-react';

function DataStatusBadge({ status, note }: { status: string; note?: string }) {
  if (status === 'verified') {
    return (
      <span
        title={note}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Atto Verificato
      </span>
    );
  }
  if (status === 'unverified') {
    return (
      <span
        title={note}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        Da Verificare
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
      <Info className="w-3.5 h-3.5" />
      Dimostrativo
    </span>
  );
}

export default function PublicActsPage() {
  const verifiedCount = mockPublicActs.filter(a => a.dataStatus === 'verified').length;
  const unverifiedCount = mockPublicActs.filter(a => a.dataStatus === 'unverified').length;

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="reddit-card p-5 bg-white space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Tracciabilità Atti Ufficiali</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Deliberazioni e Atti del Comune di Cormano (MI)
        </h1>
        <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
          Archivio degli atti originali da cui sono stati estratti i Reasoning Record.
          Ogni atto indica il proprio stato di verifica per garantire la massima trasparenza.
        </p>

        {/* Statistiche affidabilità */}
        <div className="flex flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {verifiedCount} atto verificato
          </div>
          {unverifiedCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              {unverifiedCount} atto da verificare
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
            <Info className="w-3.5 h-3.5" />
            Fonte: Albo Pretorio Cormano
          </div>
        </div>
      </div>

      {/* Lista atti */}
      <div className="space-y-4">
        {mockPublicActs.map((act) => (
          <div key={act.id} className="reddit-card p-5 space-y-3">
            {/* Row top: numero atto + badge stato + data + luogo */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded-md">
                  {act.actNumber}
                </span>
                <DataStatusBadge status={act.dataStatus} note={act.verificationNote} />
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{act.entity.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{new Date(act.date).toLocaleDateString('it-IT')}</span>
                </span>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {act.title}
            </h2>

            {/* Nota di verifica */}
            {act.verificationNote && (
              <div className={`flex items-start gap-1.5 text-[11px] rounded-lg px-3 py-2 ${
                act.dataStatus === 'verified'
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200/70'
                  : 'text-amber-800 bg-amber-50 border border-amber-200/70'
              }`}>
                {act.dataStatus === 'verified'
                  ? <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                  : <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                }
                <span>{act.verificationNote}</span>
              </div>
            )}

            {act.rawTextExcerpt && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600 leading-relaxed line-clamp-2">
                &ldquo;{act.rawTextExcerpt}&rdquo;
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>1 Reasoning Record Associato</span>
              </span>

              <div className="flex items-center gap-3">
                {act.officialUrl && (
                  <a
                    href={act.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1"
                    title={
                      act.dataStatus === 'verified'
                        ? 'Apri il portale Albo Pretorio del Comune di Cormano'
                        : 'Cerca l\'atto sul portale Albo Pretorio (verifica in corso)'
                    }
                  >
                    <span>
                      {act.dataStatus === 'verified' ? 'Portale Ufficiale' : 'Cerca atto'}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Vedi Giudizio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
