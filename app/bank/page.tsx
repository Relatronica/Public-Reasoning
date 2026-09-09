'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Download, Landmark } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { displayStatusLabel, resolveVisibility } from '@/lib/records';

function BankInner() {
  const searchParams = useSearchParams();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity } = useCuratorData();
  const packParam = searchParams.get('pack');
  const [status, setStatus] = useState('all');

  const rows = useMemo(() => {
    return recordsForCommunity(community.id).filter((r) => {
      if (packParam && r.compliancePack !== packParam) return false;
      if (status === 'draft') return r.status === 'draft' || r.status === 'in_session' || r.status === 'pending_sponsor';
      if (status === 'closed') return r.status === 'closed' || r.status === 'published';
      return true;
    });
  }, [community.id, packParam, recordsForCommunity, status]);

  return (
    <div className="space-y-4">
      <div className="reddit-card p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
          <Landmark className="w-4 h-4" />
          <span>Decision Bank</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
        <p className="text-xs text-gray-500">
          Tabella del registro: stato, visibilità, pack. Export markdown per audit.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-2 py-1.5"
        >
          <option value="all">Tutti gli stati</option>
          <option value="draft">Aperti</option>
          <option value="closed">Chiusi</option>
        </select>
        <Link
          href={href('/bank', { pack: undefined })}
          className={`px-3 py-1.5 rounded-lg ${!packParam ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Tutti i pack
        </Link>
        <Link
          href={href('/bank', { pack: 'ai_governance' })}
          className={`px-3 py-1.5 rounded-lg ${packParam === 'ai_governance' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Governance IA
        </Link>
      </div>

      <div className="reddit-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="p-3 font-semibold">Domanda</th>
              <th className="p-3 font-semibold">Stato</th>
              <th className="p-3 font-semibold">Visibilità</th>
              <th className="p-3 font-semibold">Pack</th>
              <th className="p-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => (
              <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900 max-w-md">
                  <p className="line-clamp-2">{record.realQuestion}</p>
                  <p className="text-gray-400 mt-0.5">{record.publicAct?.actNumber}</p>
                </td>
                <td className="p-3 whitespace-nowrap">{displayStatusLabel(record.status)}</td>
                <td className="p-3 whitespace-nowrap">{resolveVisibility(record)}</td>
                <td className="p-3 whitespace-nowrap">{record.compliancePack ?? '—'}</td>
                <td className="p-3 whitespace-nowrap">
                  <a
                    href={`/api/curator/records/${record.id}/export`}
                    className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .md
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-xs text-gray-500">Nessuna scheda in questo filtro.</p>
        )}
      </div>
    </div>
  );
}

export default function BankPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <BankInner />
    </Suspense>
  );
}
