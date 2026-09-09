'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import AiAssistanceFormFields from '@/components/AiAssistanceFormFields';
import { DEFAULT_AI_ASSISTANCE } from '@/lib/ai-assistance';
import { DiscardedOption, ReasoningRecord } from '@/types';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

function RecordEditorInner() {
  const params = useParams();
  const id = params.id as string;
  const { status } = useSession();
  const router = useRouter();
  const { community, href } = useActiveCommunity();
  const { refresh } = useCuratorData();

  const [record, setRecord] = useState<ReasoningRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(href(`/curator/records/${id}`)));
      return;
    }
    fetch(`/api/curator/records/${id}`)
      .then((r) => r.json())
      .then((data) => setRecord(data.record ?? null))
      .finally(() => setLoading(false));
  }, [id, status, router, href]);

  if (loading || !record) {
    return <div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>;
  }

  const act = record.publicAct;

  const updateRecord = (patch: Partial<ReasoningRecord>) => {
    setRecord((prev) => (prev ? { ...prev, ...patch } : prev));
    setSuccess(false);
  };

  const updateOption = (index: number, patch: Partial<DiscardedOption>) => {
    const discardedOptions = record.discardedOptions.map((o, i) =>
      i === index ? { ...o, ...patch } : o
    );
    updateRecord({ discardedOptions });
  };

  const updateCondition = (index: number, value: string) => {
    const mindChangingConditions = [...record.mindChangingConditions];
    mindChangingConditions[index] = value;
    updateRecord({ mindChangingConditions });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/curator/records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record: {
            category: record.category,
            realQuestion: record.realQuestion,
            decision: record.decision,
            uncertaintyLevel: record.uncertaintyLevel,
            uncertaintyExplanation: record.uncertaintyExplanation,
            interpretativeSummary: record.interpretativeSummary,
            discardedOptions: record.discardedOptions,
            mindChangingConditions: record.mindChangingConditions.filter(Boolean),
            aiAssistance:
              record.aiAssistance?.level === 'none' || !record.aiAssistance
                ? undefined
                : record.aiAssistance,
          },
          act: act
            ? {
                title: act.title,
                actNumber: act.actNumber,
                rawTextExcerpt: act.rawTextExcerpt,
              }
            : undefined,
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

  const handleDelete = async () => {
    if (!confirm('Eliminare questa scheda dal feed?')) return;
    const res = await fetch(`/api/curator/records/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await refresh();
      router.push(href('/curator/records'));
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={href('/curator/records')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Modifica scheda</h1>
          <p className="text-xs text-gray-500">{community.name}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="reddit-card p-6 space-y-5">
        {act && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Fonte</h2>
            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-gray-700">Titolo {community.sourceLabel.toLowerCase()}</span>
              <input
                className={inputClass}
                value={act.title}
                onChange={(e) =>
                  setRecord({ ...record, publicAct: { ...act, title: e.target.value } })
                }
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-gray-700">Riferimento</span>
              <input
                className={inputClass}
                value={act.actNumber}
                onChange={(e) =>
                  setRecord({ ...record, publicAct: { ...act, actNumber: e.target.value } })
                }
              />
            </label>
          </section>
        )}

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Giudizio</h2>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Categoria</span>
            <select
              className={inputClass}
              value={record.category ?? ''}
              onChange={(e) => updateRecord({ category: e.target.value })}
            >
              {community.categories.map((c) => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-blue-700">Domanda reale</span>
            <textarea className={inputClass} rows={3} value={record.realQuestion} onChange={(e) => updateRecord({ realQuestion: e.target.value })} />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-emerald-700">Decisione</span>
            <textarea className={inputClass} rows={3} value={record.decision} onChange={(e) => updateRecord({ decision: e.target.value })} />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Sintesi interpretativa</span>
            <textarea className={inputClass} rows={2} value={record.interpretativeSummary} onChange={(e) => updateRecord({ interpretativeSummary: e.target.value })} />
          </label>
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Opzioni scartate</h2>
            <button
              type="button"
              onClick={() =>
                updateRecord({
                  discardedOptions: [
                    ...record.discardedOptions,
                    {
                      id: `opt-${Date.now()}`,
                      title: '',
                      reasonDiscarded: '',
                      evidenceType: 'interpretation',
                    },
                  ],
                })
              }
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          </div>
          {record.discardedOptions.map((opt, i) => (
            <div key={opt.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <input className={inputClass} placeholder="Titolo opzione" value={opt.title} onChange={(e) => updateOption(i, { title: e.target.value })} />
              <textarea className={inputClass} rows={2} placeholder="Perché scartata" value={opt.reasonDiscarded} onChange={(e) => updateOption(i, { reasonDiscarded: e.target.value })} />
              <button type="button" onClick={() => updateRecord({ discardedOptions: record.discardedOptions.filter((_, j) => j !== i) })} className="text-xs text-red-600 hover:underline flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Rimuovi
              </button>
            </div>
          ))}
        </section>

        <AiAssistanceFormFields
          value={record.aiAssistance ?? DEFAULT_AI_ASSISTANCE}
          onChange={(aiAssistance) => updateRecord({ aiAssistance })}
        />

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Incertezza</h2>
          <select className={inputClass} value={record.uncertaintyLevel} onChange={(e) => updateRecord({ uncertaintyLevel: e.target.value as ReasoningRecord['uncertaintyLevel'] })}>
            <option value="basso">Basso</option>
            <option value="medio">Medio</option>
            <option value="alto">Alto</option>
          </select>
          <textarea className={inputClass} rows={2} value={record.uncertaintyExplanation} onChange={(e) => updateRecord({ uncertaintyExplanation: e.target.value })} placeholder="Perché questo livello di incertezza?" />
        </section>

        <section className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Condizioni di falsificabilità</h2>
            <button type="button" onClick={() => updateRecord({ mindChangingConditions: [...record.mindChangingConditions, ''] })} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          </div>
          {record.mindChangingConditions.map((cond, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputClass} value={cond} onChange={(e) => updateCondition(i, e.target.value)} placeholder="Cosa farebbe cambiare idea?" />
              <button type="button" onClick={() => updateRecord({ mindChangingConditions: record.mindChangingConditions.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-emerald-600">Salvato.</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio…' : 'Salva scheda'}
          </button>
          <button type="button" onClick={handleDelete} className="px-4 py-2.5 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-50">
            Elimina dal feed
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RecordEditorPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <RecordEditorInner />
    </Suspense>
  );
}
