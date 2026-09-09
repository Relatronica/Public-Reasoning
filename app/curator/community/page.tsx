'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { Community, CommunityCategory, CommunityStat } from '@/types';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

function CommunityEditorInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { community, href, slug } = useActiveCommunity();
  const { refresh } = useCuratorData();

  const [form, setForm] = useState<Community>(community);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(community);
  }, [community]);

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/curator/community')));
    return null;
  }

  const update = <K extends keyof Community>(key: K, value: Community[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const updateCategory = (index: number, patch: Partial<CommunityCategory>) => {
    const categories = form.categories.map((c, i) => (i === index ? { ...c, ...patch } : c));
    update('categories', categories);
  };

  const updateStat = (index: number, patch: Partial<CommunityStat>) => {
    const stats = form.stats.map((s, i) => (i === index ? { ...s, ...patch } : s));
    update('stats', stats);
  };

  const handleUpload = async (kind: 'logo' | 'cover', file: File) => {
    setUploading(kind);
    setError('');
    try {
      const body = new FormData();
      body.append('kind', kind);
      body.append('file', file);
      const res = await fetch(`/api/curator/communities/${slug}/upload`, {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload fallito');
      if (kind === 'logo') update('logoUrl', data.url);
      else update('coverImageUrl', data.url);
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore upload');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/curator/communities/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          shortName: form.shortName,
          subtitle: form.subtitle,
          tagline: form.tagline,
          feedTitle: form.feedTitle,
          feedSubtitle: form.feedSubtitle,
          feedBadge: form.feedBadge,
          sourceLabel: form.sourceLabel,
          sourceLabelPlural: form.sourceLabelPlural,
          archiveLabel: form.archiveLabel,
          archiveNavLabel: form.archiveNavLabel,
          sourcePlaceholder: form.sourcePlaceholder,
          newRecordTitle: form.newRecordTitle,
          newRecordHint: form.newRecordHint,
          searchPlaceholder: form.searchPlaceholder,
          officialUrl: form.officialUrl,
          officialUrlLabel: form.officialUrlLabel,
          logoUrl: form.logoUrl,
          coverImageUrl: form.coverImageUrl,
          categories: form.categories,
          stats: form.stats,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Salvataggio fallito');
      }
      await refresh();
      setSuccess(true);
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
          <h1 className="text-xl font-bold text-gray-900">Modifica community</h1>
          <p className="text-xs text-gray-500">{community.name}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="reddit-card p-6 space-y-5">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Identità</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-700">Nome</span>
              <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-700">Nome breve</span>
              <input className={inputClass} value={form.shortName} onChange={(e) => update('shortName', e.target.value)} />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Sottotitolo</span>
            <input className={inputClass} value={form.subtitle ?? ''} onChange={(e) => update('subtitle', e.target.value)} />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Tagline (sidebar)</span>
            <textarea className={inputClass} rows={2} value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
          </label>
        </section>

        <section className="space-y-4 pt-2 border-t border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Logo e banner (sidebar destra)</h2>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="relative h-20 overflow-hidden rounded-t-xl bg-gray-200">
              {form.coverImageUrl ? (
                <Image
                  src={`${form.coverImageUrl}?v=${form.coverImageUrl.length}`}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="640px"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-700 to-blue-500" />
              )}
            </div>
            <div className="px-4 pb-3">
              <div className="relative z-10 -mt-6 mb-3 w-fit">
                {form.logoUrl ? (
                  <Image
                    src={`${form.logoUrl}?v=${form.logoUrl.length}`}
                    alt=""
                    width={48}
                    height={48}
                    className="relative w-12 h-12 rounded-full border-4 border-white bg-white object-cover shadow-sm"
                    unoptimized
                  />
                ) : (
                  <div className="relative w-12 h-12 rounded-full border-4 border-white bg-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {form.initials}
                  </div>
                )}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{form.typeLabel}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{form.name}</p>
              <p className="text-[11px] text-gray-500 mt-2">Anteprima come in sidebar</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700">Logo</span>
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                {uploading === 'logo' ? 'Caricamento…' : 'Carica logo'}
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload('logo', file);
                    e.target.value = '';
                  }}
                />
              </label>
              <input
                className={inputClass}
                value={form.logoUrl ?? ''}
                onChange={(e) => update('logoUrl', e.target.value)}
                placeholder={`/communities/${slug}/logo.svg`}
              />
              <p className="text-[10px] text-gray-400">Quadrato, consigliato 64×64 px o più. SVG, PNG, JPG, WebP (max 2 MB).</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700">Banner header</span>
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                {uploading === 'cover' ? 'Caricamento…' : 'Carica banner'}
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload('cover', file);
                    e.target.value = '';
                  }}
                />
              </label>
              <input
                className={inputClass}
                value={form.coverImageUrl ?? ''}
                onChange={(e) => update('coverImageUrl', e.target.value)}
                placeholder={`/communities/${slug}/cover.svg`}
              />
              <p className="text-[10px] text-gray-400">Orizzontale, ratio ~3:1 (es. 288×96). Stessi formati.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Feed e fonti</h2>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Etichetta fonte (singolare)</span>
            <input className={inputClass} value={form.sourceLabel} onChange={(e) => update('sourceLabel', e.target.value)} />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Archivio (label)</span>
            <input className={inputClass} value={form.archiveNavLabel} onChange={(e) => update('archiveNavLabel', e.target.value)} />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Placeholder ricerca</span>
            <input className={inputClass} value={form.searchPlaceholder} onChange={(e) => update('searchPlaceholder', e.target.value)} />
          </label>
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Categorie</h2>
            <button
              type="button"
              onClick={() => update('categories', [...form.categories, { label: 'Nuova', color: 'bg-gray-500' }])}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          </div>
          {form.categories.map((cat, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={`${inputClass} flex-1`} value={cat.label} onChange={(e) => updateCategory(i, { label: e.target.value })} />
              <input className={`${inputClass} w-32`} value={cat.color} onChange={(e) => updateCategory(i, { color: e.target.value })} placeholder="bg-blue-500" />
              <button type="button" onClick={() => update('categories', form.categories.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Stats sidebar</h2>
            <button
              type="button"
              onClick={() => update('stats', [...form.stats, { label: 'Nuova', value: '—' }])}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          </div>
          {form.stats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={`${inputClass} flex-1`} value={stat.label} onChange={(e) => updateStat(i, { label: e.target.value })} />
              <input className={`${inputClass} flex-1`} value={stat.value} onChange={(e) => updateStat(i, { value: e.target.value })} />
              <button type="button" onClick={() => update('stats', form.stats.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-emerald-600">Salvato. Le modifiche sono visibili nel feed.</p>}

        <button
          type="submit"
          disabled={saving || status !== 'authenticated'}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvataggio…' : 'Salva community'}
        </button>
      </form>
    </div>
  );
}

export default function CommunityEditorPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <CommunityEditorInner />
    </Suspense>
  );
}
