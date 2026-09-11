'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { PublicAct, ReasoningRecord } from '@/types';

function statusLabel(status: string): string {
  if (status === 'verified') return 'Verificata';
  if (status === 'unverified') return 'Da verificare';
  return 'Dimostrativa';
}

function ActRow({
  act,
  records,
  href,
  archiveLabel,
}: {
  act: PublicAct;
  records: ReasoningRecord[];
  href: (path: string) => string;
  archiveLabel: string;
}) {
  const linked = records.filter((r) => r.publicActId === act.id);
  const primary = linked[0];

  return (
    <article className="reddit-card px-5 py-4 hover:border-gray-300 transition-colors">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400 mb-1.5">
        <span>{act.actNumber}</span>
        <span>·</span>
        <span>{new Date(act.date).toLocaleDateString('it-IT')}</span>
        <span>·</span>
        <span>{statusLabel(act.dataStatus)}</span>
        {linked.length > 0 && (
          <>
            <span>·</span>
            <span>
              {linked.length} sched{linked.length === 1 ? 'a' : 'e'}
            </span>
          </>
        )}
      </div>

      <h2 className="text-base font-semibold text-gray-900 leading-snug">
        {primary ? (
          <Link href={href(`/records/${primary.id}`)} className="hover:underline">
            {act.title}
          </Link>
        ) : (
          act.title
        )}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        {primary && (
          <Link
            href={href(`/records/${primary.id}`)}
            className="font-medium text-gray-700 hover:text-gray-900"
          >
            Apri scheda
          </Link>
        )}
        {act.officialUrl && (
          <a
            href={act.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800"
          >
            {archiveLabel}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  );
}

function PublicActsContent() {
  const { community, href } = useActiveCommunity();
  const { actsForCommunity, recordsForCommunity } = useCuratorData();
  const acts = useMemo(() => actsForCommunity(community.id), [actsForCommunity, community.id]);
  const records = useMemo(
    () => recordsForCommunity(community.id),
    [recordsForCommunity, community.id]
  );

  return (
    <div className="space-y-5 w-full max-w-5xl">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">{community.archiveLabel}</h1>
        <p className="text-sm text-gray-500">
          Fonti da cui sono state estratte le schede in {community.shortName}.
        </p>
      </header>

      {acts.length === 0 ? (
        <p className="text-sm text-gray-500">Nessuna fonte in questo workspace.</p>
      ) : (
        <div className="space-y-3">
          {acts.map((act) => (
            <ActRow
              key={act.id}
              act={act}
              records={records}
              href={href}
              archiveLabel={community.archiveNavLabel || community.archiveLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicActsPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <PublicActsContent />
    </Suspense>
  );
}
