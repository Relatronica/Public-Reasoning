'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { ROLE_LABELS, ORGANIZATION_ROLES } from '@/lib/org/permissions';
import { Community, Organization, OrganizationRole } from '@/types';
import { isCommunityVisible } from '@/lib/communities/visibility';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  username: string | null;
  avatar: string | null;
  image: string | null;
  createdAt: string;
  recordsCount: number;
  orgRole: OrganizationRole | null;
  isPlatformAdmin: boolean;
};

type Overview = {
  users: AdminUser[];
  communities: Community[];
  organization: Organization;
  platformAdminEmail: string | null;
};

function AdminInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { href } = useActiveCommunity();
  const { isPlatformAdmin, refresh: refreshCurator } = useCuratorData();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>('compiler');
  const [savingMember, setSavingMember] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 401) {
        router.push('/auth/login?callbackUrl=' + encodeURIComponent('/admin'));
        return;
      }
      if (res.status === 403) {
        setError('Accesso riservato agli amministratori di piattaforma.');
        setData(null);
        return;
      }
      if (!res.ok) throw new Error('Impossibile caricare la console');
      setData((await res.json()) as Overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent('/admin'));
      return;
    }
    if (status === 'authenticated') load();
  }, [status, router, load]);

  const toggleVisibility = async (community: Community) => {
    const next = !isCommunityVisible(community);
    setBusySlug(community.slug);
    setError('');
    try {
      const res = await fetch('/api/admin/communities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: community.slug, isVisible: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Aggiornamento fallito');
      }
      await load();
      await refreshCurator();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusySlug(null);
    }
  };

  const patchOrg = async (body: object) => {
    setSavingMember(true);
    setError('');
    try {
      const res = await fetch('/api/admin/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Errore roster');
      }
      setEmail('');
      await load();
      await refreshCurator();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setSavingMember(false);
    }
  };

  const setUserRole = async (userId: string, nextRole: OrganizationRole | null) => {
    setBusyUserId(userId);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Aggiornamento ruolo fallito');
      }
      await load();
      await refreshCurator();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
      await load();
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (u: AdminUser) => {
    const label = u.username || u.name || u.email || u.id;
    if (
      !window.confirm(
        `Eliminare definitivamente l’account «${label}»?\nVerranno cancellati anche login Google e sessioni. L’operazione non è reversibile.`
      )
    ) {
      return;
    }
    setBusyUserId(u.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(u.id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Eliminazione fallita');
      }
      await load();
      await refreshCurator();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusyUserId(null);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>;
  }

  if (error && !data) {
    return (
      <div className="space-y-4 max-w-lg">
        <Link href={href('/decisioni')} className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Torna al feed
        </Link>
        <div className="reddit-card p-6 text-sm text-red-700 bg-red-50 border border-red-100">
          {error}
          {!isPlatformAdmin && (
            <p className="mt-2 text-xs text-red-600/80">
              Solo gli account autorizzati come amministratori di piattaforma possono aprire questa
              console. Contatta chi gestisce il deploy se ti serve l’accesso.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const selfId = session?.user?.id;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={href('/decisioni')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-slate-700" />
            Console piattaforma
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Amministratore ({data.platformAdminEmail}). Community, utenti e team.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>
      )}

      <section className="reddit-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Community ({data.communities.length})
          </h2>
          <Link href={href('/curator/community/new')} className="text-xs font-semibold text-blue-700 hover:underline">
            + Nuova
          </Link>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Nascosta = non compare nel selettore per utenti normali; tu e gli admin la vedete ancora. Diverso
          dalla chiusura soft (delete) nell’Editor.
        </p>
        <ul className="divide-y divide-gray-50">
          {data.communities.map((c) => {
            const visible = isCommunityVisible(c);
            return (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-gray-500 truncate">
                    {c.typeLabel} · <span className="font-mono">{c.slug}</span>
                    {!visible && (
                      <span className="ml-1.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">nascosta</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busySlug === c.slug}
                  onClick={() => toggleVisibility(c)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                    visible
                      ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {visible ? 'Visibile' : 'Nascosta'}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="reddit-card p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Utenti Auth ({data.users.length})
        </h2>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Il ruolo è quello del workspace. «Nessun ruolo» = fuori team. Gli amministratori di
          piattaforma restano proprietari anche senza voce in roster.
        </p>
        <ul className="divide-y divide-gray-50 max-h-[28rem] overflow-y-auto">
          {data.users.map((u) => {
            const busy = busyUserId === u.id;
            const isSelf = u.id === selfId;
            return (
              <li key={u.id} className="py-3 text-xs space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {u.username || u.name || u.email || u.id}
                      {isSelf && (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-500">(tu)</span>
                      )}
                      {u.isPlatformAdmin && (
                        <span className="ml-1.5 text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          admin piattaforma
                        </span>
                      )}
                    </p>
                    <p className="text-gray-500 truncate">{u.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Iscritto {new Date(u.createdAt).toLocaleDateString('it-IT')}
                      {u.recordsCount > 0 ? ` · ${u.recordsCount} schede` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy || isSelf || u.isPlatformAdmin}
                    title={
                      isSelf
                        ? 'Non puoi eliminare te stesso'
                        : u.isPlatformAdmin
                          ? 'Rimuovi prima dagli admin di piattaforma'
                          : u.recordsCount > 0
                            ? 'Ha schede collegate: potrebbe fallire'
                            : 'Elimina account'
                    }
                    onClick={() => deleteUser(u)}
                    className="flex items-center gap-1 text-red-600 hover:underline disabled:opacity-40 disabled:no-underline flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Elimina
                  </button>
                </div>
                <select
                  className={inputClass}
                  disabled={busy}
                  value={u.orgRole ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUserRole(u.id, v === '' ? null : (v as OrganizationRole));
                  }}
                >
                  <option value="">Nessun ruolo (fuori roster)</option>
                  {ORGANIZATION_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
          {data.users.length === 0 && (
            <li className="py-4 text-xs text-gray-500 text-center">Nessun utente registrato.</li>
          )}
        </ul>
      </section>

      <section className="reddit-card p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          Invito rapido · {data.organization.name}
        </h2>
        <p className="text-[11px] text-gray-500">
          Aggiungi un’email al team anche se la persona non ha ancora effettuato l’accesso.
        </p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            patchOrg({ member: { email: email.trim(), role } });
          }}
        >
          <input
            className={inputClass}
            type="email"
            required
            placeholder="email@azienda.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value as OrganizationRole)}
          >
            {ORGANIZATION_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={savingMember}
            className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs disabled:opacity-50"
          >
            {savingMember ? 'Salvataggio…' : 'Aggiungi al team'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <AdminInner />
    </Suspense>
  );
}
