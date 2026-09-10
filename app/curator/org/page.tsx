'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Trash2, UserPlus } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { ROLE_LABELS } from '@/lib/org/permissions';
import { OrganizationRole } from '@/types';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

function OrgInner() {
  const { status } = useSession();
  const router = useRouter();
  const { href } = useActiveCommunity();
  const { organization, canAdminOrg, refresh, myRole } = useCuratorData();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>('compiler');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/curator/org')));
    return null;
  }

  const submit = async (body: object) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/curator/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Errore');
      }
      setEmail('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={href('/curator')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{organization.name}</h1>
          <p className="text-xs text-gray-500">
            Ruoli del team. Finché la roster è vuota, ogni utente loggato è owner (demo).
            Al primo invito resti proprietario e il perimetro si chiude.
            {myRole ? ` Il tuo ruolo: ${ROLE_LABELS[myRole]}.` : ''}
          </p>
        </div>
      </div>

      <div className="reddit-card p-5 space-y-3">
        {organization.members.length === 0 && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
            Roster vuota: RBAC aperto. Aggiungi il primo membro per chiudere il perimetro.
          </p>
        )}
        {organization.members.map((m) => (
          <div key={m.userId} className="flex items-center justify-between gap-3 text-xs border-b border-gray-50 pb-2">
            <div>
              <p className="font-semibold text-gray-900">{m.email ?? m.userId}</p>
              <p className="text-gray-500">{ROLE_LABELS[m.role]}</p>
            </div>
            {canAdminOrg && (
              <button
                type="button"
                onClick={() => submit({ removeUserId: m.userId })}
                className="text-red-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Rimuovi
              </button>
            )}
          </div>
        ))}
      </div>

      {canAdminOrg && (
        <form
          className="reddit-card p-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            submit({ member: { email: email.trim(), role } });
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" />
            Aggiungi membro
          </h2>
          <input
            className={inputClass}
            type="email"
            required
            placeholder="email@azienda.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as OrganizationRole)}>
            {(Object.keys(ROLE_LABELS) as OrganizationRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {saving ? 'Salvataggio…' : 'Aggiungi'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function OrgPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <OrgInner />
    </Suspense>
  );
}
