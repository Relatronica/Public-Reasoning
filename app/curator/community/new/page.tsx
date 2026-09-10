'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { withCommunityQuery } from '@/lib/communities';
import { CommunityType } from '@/types';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

const TYPE_OPTIONS: { value: CommunityType; label: string }[] = [
  { value: 'ufficio', label: 'Ufficio' },
  { value: 'progetto', label: 'Progetto' },
  { value: 'azienda', label: 'Azienda' },
  { value: 'comune', label: 'Comune' },
  { value: 'regione', label: 'Regione' },
  { value: 'ente_regolatorio', label: 'Ente regolatorio' },
  { value: 'azienda_pubblica', label: 'Azienda pubblica' },
];

function NewCommunityInner() {
  const { status } = useSession();
  const router = useRouter();
  const { href } = useActiveCommunity();
  const { refresh, canAdminOrg } = useCuratorData();

  const [name, setName] = useState('');
  const [type, setType] = useState<CommunityType>('ufficio');
  const [shortName, setShortName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent('/curator/community/new'));
    return null;
  }

  if (status === 'authenticated' && !canAdminOrg) {
    return (
      <div className="reddit-card p-6 max-w-lg space-y-2">
        <h1 className="text-lg font-bold text-gray-900">Permesso insufficiente</h1>
        <p className="text-xs text-gray-500">
          Solo amministratori o proprietari possono creare una community.
        </p>
        <Link href={href('/curator')} className="text-xs text-blue-700 hover:underline">
          Torna all’Editor
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/curator/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          shortName: shortName.trim() || undefined,
          subtitle: subtitle.trim() || undefined,
        }),
      });
      const raw = await res.text();
      let data: { error?: string; community?: { slug: string } } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          throw new Error(
            res.ok
              ? 'Risposta non valida dal server.'
              : `Creazione fallita (HTTP ${res.status}). Controlla che Postgres sia attivo e che le migrazioni siano applicate (npm run db:deploy).`
          );
        }
      } else if (!res.ok) {
        throw new Error(
          `Creazione fallita (HTTP ${res.status}). Controlla Postgres e le migrazioni (npm run db:deploy).`
        );
      }
      if (!res.ok) throw new Error(data.error ?? 'Creazione fallita');
      if (!data.community?.slug) throw new Error('Community creata ma risposta incompleta.');
      await refresh();
      router.push(withCommunityQuery('/curator/community', data.community.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href={href('/curator')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nuova community</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Crea un workspace (ufficio, progetto, comune…) e poi personalizzalo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="reddit-card p-6 space-y-4">
        <label className="space-y-1 block">
          <span className="text-xs font-semibold text-gray-700">Nome *</span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Ufficio Compliance"
            required
            minLength={2}
            maxLength={80}
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs font-semibold text-gray-700">Tipo *</span>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as CommunityType)}>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Nome breve</span>
            <input
              className={inputClass}
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Opzionale"
              maxLength={24}
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Sottotitolo</span>
            <input
              className={inputClass}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Opzionale"
              maxLength={60}
            />
          </label>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || name.trim().length < 2}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {saving ? 'Creazione…' : 'Crea community'}
        </button>
      </form>
    </div>
  );
}

export default function NewCommunityPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <NewCommunityInner />
    </Suspense>
  );
}
