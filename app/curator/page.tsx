'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, FileText, Inbox, Pencil, Plus, Users } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';

function CuratorHubInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity, canAdminOrg, canAdvise, inboxOpenCount } = useCuratorData();
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
        <Link href={href('/')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editor</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Modifica community e schede per <span className="font-semibold">{community.name}</span>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        Le modifiche dell’Editor restano in locale in{' '}
        <code className="text-[11px] bg-gray-100 px-1 rounded">data/curator-store.json</code>
        {' '}(non versionato; seed da{' '}
        <code className="text-[11px] bg-gray-100 px-1 rounded">curator-store.example.json</code>
        ). Accedi come {session?.user?.name ?? session?.user?.email}.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {canAdminOrg && (
          <Link
            href={href('/curator/community/new')}
            className="reddit-card p-5 hover:border-blue-200 transition-colors group sm:col-span-2"
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
          className="reddit-card p-5 hover:border-blue-200 transition-colors group"
        >
          <div className="flex items-center gap-2 text-violet-700 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold">Organization</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Ruoli: owner, admin, compiler, sponsor, viewer.
          </p>
        </Link>
        <Link
          href={href('/curator/community')}
          className="reddit-card p-5 hover:border-blue-200 transition-colors group"
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
          className="reddit-card p-5 hover:border-blue-200 transition-colors group"
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
            className="reddit-card p-5 hover:border-amber-200 transition-colors group"
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
          className="reddit-card p-5 hover:border-gray-300 transition-colors sm:col-span-2"
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

      <div className="reddit-card p-4 bg-gray-50 border-dashed">
        <p className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-2">
          <Pencil className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Logo e banner della sidebar: apri{' '}
            <Link href={href('/curator/community')} className="text-blue-600 hover:underline font-medium">
              Community
            </Link>
            , poi «Carica logo» e «Carica banner» — con anteprima immediata.
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
