'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, FileText, Inbox, Pencil, Plus, Shield, Users } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';

function CuratorHubInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity, canAdminOrg, canAdvise, inboxOpenCount, isPlatformAdmin } = useCuratorData();
  const records = recordsForCommunity(community.id);

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/curator')));
    return null;
  }

  if (status === 'loading') {
    return <div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>;
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={href('/decisioni')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Editor</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Community e schede di <span className="font-semibold">{community.name}</span>
            {session?.user?.name ? ` · ${session.user.name}` : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {isPlatformAdmin && (
          <Link
            href="/admin"
            className="reddit-card reddit-card--interactive p-5 group sm:col-span-2"
          >
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-bold">Console piattaforma</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Utenti, ruoli e visibilità delle community.
            </p>
          </Link>
        )}
        {canAdminOrg && (
          <Link
            href={href('/curator/community/new')}
            className="reddit-card reddit-card--interactive p-5 group sm:col-span-2"
          >
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-bold">Nuova community</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Crea un workspace (ufficio, progetto, comune…) e aprilo nel selettore.
            </p>
          </Link>
        )}
        <Link
          href={href('/curator/org')}
          className="reddit-card reddit-card--interactive p-5 group"
        >
          <div className="flex items-center gap-2 text-violet-700 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold">Team</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Ruoli e membri del workspace.
          </p>
        </Link>
        <Link
          href={href('/curator/community')}
          className="reddit-card reddit-card--interactive p-5 group"
        >
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-bold">Community</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Nome, tagline, fonti, argomenti, logo e banner.
          </p>
        </Link>

        <Link
          href={href('/curator/records')}
          className="reddit-card reddit-card--interactive p-5 group"
        >
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-bold">Schede ({records.length})</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Modifica decisioni esistenti o apri una scheda dal feed.
          </p>
        </Link>

        {canAdvise && (
          <Link
            href={href('/curator/richieste')}
            className="reddit-card reddit-card--interactive p-5 group"
          >
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Inbox className="w-5 h-5" />
              <span className="text-sm font-bold">
                Richieste{inboxOpenCount > 0 ? ` (${inboxOpenCount})` : ''}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Coda di consultazioni aperte per filosofi e consulenti.
            </p>
          </Link>
        )}

        <Link
          href={href('/records/capture')}
          className="reddit-card reddit-card--interactive p-5 sm:col-span-2"
        >
          <div className="flex items-center gap-2 text-gray-800 mb-2">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">Nuova decisione</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Da un testo o a mano: domanda, decisione, scarto e criterio di stop.
          </p>
        </Link>
      </div>

      <div className="reddit-card reddit-card--static p-4 bg-gray-50 border-dashed">
        <p className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-2">
          <Pencil className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Logo e banner della sidebar: apri{' '}
            <Link href={href('/curator/community')} className="text-blue-600 hover:underline font-medium">
              Community
            </Link>
            , poi carica logo e banner.
          </span>
        </p>
      </div>
    </div>
  );
}

export default function CuratorPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <CuratorHubInner />
    </Suspense>
  );
}
