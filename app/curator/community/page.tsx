'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import {
  CATEGORY_COLOR_PALETTE,
  categoryColorHex,
  resolveCategoryColor,
} from '@/lib/communities/category-colors';
import { Community, CommunityCategory, CommunityStat } from '@/types';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

const labelClass = 'text-xs font-semibold text-gray-700';
const hintClass = 'text-[11px] text-gray-500 leading-relaxed';
const sectionTitleClass = 'text-xs font-bold uppercase tracking-wider text-gray-400';

function CommunityEditorInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { community, href, slug } = useActiveCommunity();
  const { refresh, canAdminOrg } = useCuratorData();

  const [form, setForm] = useState<Community>(community);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
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
          categories: form.categories.map((c) => ({
            label: c.label.trim() || 'Argomento',
            color: resolveCategoryColor(c.color),
          })),
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

  const handleClose = async () => {
    if (
      !confirm(
        `Chiudere «${community.name}»? Sparirà dal selettore. Le schede restano salvate.`
      )
    ) {
      return;
    }
    setClosing(true);
    setError('');
    try {
      const res = await fetch(`/api/curator/communities/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Chiusura fallita');
      await refresh();
      const nextSlug = data.fallbackSlug || 'cormano';
      router.push(`/?c=${encodeURIComponent(nextSlug)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-5 w-full max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={href('/curator')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Modifica community</h1>
          <p className="text-xs text-gray-500">
            Identità, testi, fonti e argomenti di {community.name}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="reddit-card p-6 space-y-5">
        <section className="space-y-3">
          <h2 className={sectionTitleClass}>Identità</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClass}>Nome</span>
              <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Nome breve</span>
              <input className={inputClass} value={form.shortName} onChange={(e) => update('shortName', e.target.value)} />
              <p className={hintClass}>Compare nel selettore in alto.</p>
            </label>
          </div>
          <label className="space-y-1 block">
            <span className={labelClass}>Sottotitolo</span>
            <input className={inputClass} value={form.subtitle ?? ''} onChange={(e) => update('subtitle', e.target.value)} />
          </label>
          <label className="space-y-1 block">
            <span className={labelClass}>Tagline</span>
            <textarea className={inputClass} rows={2} value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
            <p className={hintClass}>Breve descrizione in sidebar destra.</p>
          </label>
        </section>

        <section className="space-y-4 pt-2 border-t border-gray-100">
          <h2 className={sectionTitleClass}>Logo e banner</h2>

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
              <p className="text-[11px] text-gray-500 mt-2">Anteprima sidebar</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className={labelClass}>Logo</span>
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
              <p className="text-[10px] text-gray-400">
                Quadrato, consigliato 64×64 px o più. SVG, PNG, JPG, WebP (max 2 MB).
                In produzione gli upload usano Vercel Blob.
              </p>
            </div>

            <div className="space-y-2">
              <span className={labelClass}>Banner</span>
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
          <h2 className={sectionTitleClass}>Testi del feed</h2>
          <label className="space-y-1 block">
            <span className={labelClass}>Titolo feed</span>
            <input className={inputClass} value={form.feedTitle} onChange={(e) => update('feedTitle', e.target.value)} />
          </label>
          <label className="space-y-1 block">
            <span className={labelClass}>Sottotitolo feed</span>
            <textarea className={inputClass} rows={2} value={form.feedSubtitle} onChange={(e) => update('feedSubtitle', e.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClass}>Badge</span>
              <input className={inputClass} value={form.feedBadge} onChange={(e) => update('feedBadge', e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Placeholder ricerca</span>
              <input className={inputClass} value={form.searchPlaceholder} onChange={(e) => update('searchPlaceholder', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <h2 className={sectionTitleClass}>Fonti</h2>
          <p className={hintClass}>
            Come chiami le fonti ufficiali in questa community (es. Atto, Verbale, Decision log).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClass}>Fonte (singolare)</span>
              <input className={inputClass} value={form.sourceLabel} onChange={(e) => update('sourceLabel', e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Fonte (plurale)</span>
              <input className={inputClass} value={form.sourceLabelPlural} onChange={(e) => update('sourceLabelPlural', e.target.value)} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelClass}>Voce menu Fonti</span>
              <input className={inputClass} value={form.archiveNavLabel} onChange={(e) => update('archiveNavLabel', e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Titolo archivio</span>
              <input className={inputClass} value={form.archiveLabel} onChange={(e) => update('archiveLabel', e.target.value)} />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className={labelClass}>Esempio riferimento</span>
            <input className={inputClass} value={form.sourcePlaceholder} onChange={(e) => update('sourcePlaceholder', e.target.value)} />
            <p className={hintClass}>Placeholder nei form di cattura (es. Delibera C.C. n. 45/2024).</p>
          </label>
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className={sectionTitleClass}>Argomenti</h2>
              <p className={`${hintClass} mt-1`}>
                Filtri nella sidebar. Nome e colore modificabili.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                update('categories', [
                  ...form.categories,
                  { label: 'Nuovo argomento', color: 'bg-blue-500' },
                ])
              }
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0"
            >
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          </div>

          {form.categories.length === 0 && (
            <p className={hintClass}>Nessun argomento. Aggiungine uno per filtrare le decisioni.</p>
          )}

          <ul className="grid sm:grid-cols-2 gap-2">
            {form.categories.map((cat, i) => {
              const color = resolveCategoryColor(cat.color);
              return (
                <li
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 space-y-2"
                >
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-black/10"
                      style={{ backgroundColor: categoryColorHex(color) }}
                      aria-hidden
                    />
                    <input
                      className={`${inputClass} flex-1 py-1.5`}
                      value={cat.label}
                      onChange={(e) => updateCategory(i, { label: e.target.value })}
                      placeholder="Nome argomento"
                      aria-label={`Nome argomento ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          'categories',
                          form.categories.filter((_, j) => j !== i)
                        )
                      }
                      className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0"
                      aria-label={`Rimuovi argomento ${cat.label || i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pl-3.5">
                    {CATEGORY_COLOR_PALETTE.map((swatch) => {
                      const selected = color === swatch.className;
                      return (
                        <button
                          key={swatch.className}
                          type="button"
                          title={swatch.label}
                          aria-label={swatch.label}
                          aria-pressed={selected}
                          onClick={() => updateCategory(i, { color: swatch.className })}
                          style={{ backgroundColor: swatch.hex }}
                          className={`w-5 h-5 rounded-full border border-black/10 transition ${
                            selected
                              ? 'ring-2 ring-gray-900 ring-offset-1 scale-110'
                              : 'hover:scale-105'
                          }`}
                        />
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className={hintClass}>
            Rinominare un argomento non aggiorna le schede già salvate con il nome precedente.
          </p>
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className={sectionTitleClass}>Indicatori sidebar</h2>
              <p className={`${hintClass} mt-1`}>Cifre o etichette sotto la community (es. abitanti, organico).</p>
            </div>
            <button
              type="button"
              onClick={() => update('stats', [...form.stats, { label: 'Nuovo', value: '—' }])}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0"
            >
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          </div>
          {form.stats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-end">
              <label className="space-y-1 flex-1">
                <span className={labelClass}>Etichetta</span>
                <input
                  className={inputClass}
                  value={stat.label}
                  onChange={(e) => updateStat(i, { label: e.target.value })}
                />
              </label>
              <label className="space-y-1 flex-1">
                <span className={labelClass}>Valore</span>
                <input
                  className={inputClass}
                  value={stat.value}
                  onChange={(e) => updateStat(i, { value: e.target.value })}
                />
              </label>
              <button
                type="button"
                onClick={() => update('stats', form.stats.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-600 p-1.5 mb-0.5"
                aria-label="Rimuovi indicatore"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-emerald-600">Salvato. Le modifiche sono visibili nel feed.</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || status !== 'authenticated'}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio…' : 'Salva community'}
          </button>
        </div>
      </form>

      {canAdminOrg && (
        <div className="reddit-card p-5 border-rose-100 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Chiudi community</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              La nasconde dal selettore. Non cancella le schede già compilate.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={closing}
            className="flex items-center gap-2 px-4 py-2.5 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {closing ? 'Chiusura…' : 'Chiudi questa community'}
          </button>
        </div>
      )}
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
