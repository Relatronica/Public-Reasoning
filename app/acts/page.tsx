'use client';

import React from 'react';
import Link from 'next/link';
import { mockPublicActs } from '@/lib/data';
import { FileText, ArrowRight, ShieldCheck, Calendar, MapPin, ExternalLink } from 'lucide-react';

export default function PublicActsPage() {
  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="reddit-card p-5 bg-white space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Atti Ufficiali Mappati</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Deliberazioni e Atti del Comune di Cormano (MI)
        </h1>
        <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
          Archivio e tracciabilità degli atti originali pubblicati all&apos;Albo Pretorio da cui sono stati estratti i Reasoning Record.
        </p>
      </div>

      {/* List of Acts */}
      <div className="space-y-4">
        {mockPublicActs.map((act) => (
          <div key={act.id} className="reddit-card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded-md">
                {act.actNumber}
              </span>
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
                  >
                    <span>Vedi PDF</span>
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
