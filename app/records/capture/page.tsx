'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { draftFromSource, SAMPLE_AI_GOVERNANCE_TRANSCRIPT } from '@/lib/capture/draft-from-source';
import { defaultVisibilityForCommunity } from '@/lib/records';
import { createPendingOutcome } from '@/lib/records/outcomes';
import { ConfidenceLevel } from '@/types';

const field =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300';

type Mode = 'source' | 'manual';
type Phase = 'choose' | 'source' | 'review';

function ComposeInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { community, href, slug } = useActiveCommunity();
  const { refresh, canCompile } = useCuratorData();

  const initialMode = searchParams.get('mode') === 'manual' ? 'manual' : null;
  const [phase, setPhase] = useState<Phase>(initialMode === 'manual' ? 'review' : 'choose');
  const [mode, setMode] = useState<Mode>(initialMode ?? 'source');

  const [sourceText, setSourceText] = useState('');
  const [actNumber, setActNumber] = useState('');
  const [actTitle, setActTitle] = useState('');
  const [category, setCategory] = useState(community.categories[0]?.label ?? '');
  const [realQuestion, setRealQuestion] = useState('');
  const [decision, setDecision] = useState('');
  const [discardedTitle, setDiscardedTitle] = useState('');
  const [discardedReason, setDiscardedReason] = useState('');
  const [mindChanging, setMindChanging] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>(3);
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const showSample = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/records/capture')));
    }
  }, [status, router, href]);

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="reddit-card reddit-card--static p-8 text-center text-sm text-gray-500">Caricamento…</div>;
  }

  if (!canCompile) {
    return (
      <div className="reddit-card p-6 text-sm text-gray-600 max-w-lg">
        Serve il ruolo di compilatore (o superiore) per inserire una decisione.
      </div>
    );
  }

  const startSource = () => {
    setMode('source');
    setPhase('source');
  };

  const startManual = () => {
    setMode('manual');
    setPhase('review');
    setHint(null);
  };

  const generateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const draft = draftFromSource(sourceText, {
      sourceTitle: actTitle,
      sourceRef: actNumber,
    });
    setActTitle(draft.actTitle);
    setActNumber(draft.actNumber);
    setRealQuestion(draft.realQuestion);
    setDecision(draft.decision);
    setDiscardedTitle(draft.discardedTitle);
    setDiscardedReason(draft.discardedReason);
    setMindChanging(draft.mindChanging);
    setHint(
      draft.missing.length > 0
        ? `Completa: ${draft.missing.join(', ')}.`
        : 'Bozza proposta dalla fonte — rivedi e salva.'
    );
    setPhase('review');
  };

  const save = async (intent: 'draft' | 'publish') => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/curator/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communitySlug: slug,
          act: {
            title: actTitle || actNumber || 'Nuova fonte',
            actNumber: actNumber || 'Senza riferimento',
            rawTextExcerpt: sourceText.slice(0, 2000),
          },
          record: {
            category,
            status: intent === 'publish' ? 'closed' : 'draft',
            visibility:
              intent === 'publish' ? 'public' : defaultVisibilityForCommunity(community),
            realQuestion,
            decision,
            uncertaintyLevel: 'medio',
            uncertaintyExplanation: '',
            interpretativeSummary: '',
            discardedOptions: discardedTitle
              ? [
                  {
                    id: `opt-${Date.now()}`,
                    title: discardedTitle,
                    reasonDiscarded: discardedReason,
                    evidenceType: 'interpretation' as const,
                  },
                ]
              : [],
            mindChangingConditions: mindChanging ? [mindChanging] : [],
            verbatimQuotes: [],
            confidence,
            outcomeReviews: expectedOutcome.trim()
              ? [createPendingOutcome({ expectedOutcome })]
              : [],
            aiAssistance:
              mode === 'source'
                ? {
                    level: 'assistivo',
                    scopes: ['drafting'],
                    tools: 'Reason capture',
                    dataExposure: 'internal_only',
                    note: 'Bozza estratta dalla fonte; rivista in sessione.',
                  }
                : undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Salvataggio non riuscito');
      await refresh();
      router.push(href(`/records/${data.record.id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Nuova decisione</h1>
        <p className="text-sm text-gray-500">
          In {community.shortName}
          {session?.user?.name ? ` · ${session.user.name}` : ''}
        </p>
      </header>

      {phase === 'choose' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Come vuoi partire?</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={startSource}
              className="w-full text-left reddit-card reddit-card--interactive px-5 py-4"
            >
              <p className="text-sm font-semibold text-gray-900">Da un testo</p>
              <p className="text-xs text-gray-500 mt-1">
                Incolla verbale o appunti: Reason propone domanda, decisione, scarto e stop.
              </p>
            </button>
            <button
              type="button"
              onClick={startManual}
              className="w-full text-left reddit-card reddit-card--interactive px-5 py-4"
            >
              <p className="text-sm font-semibold text-gray-900">A mano</p>
              <p className="text-xs text-gray-500 mt-1">
                Compili tu i quattro punti della scheda, senza partire da un documento.
              </p>
            </button>
          </div>
        </div>
      )}

      {phase === 'source' && (
        <form onSubmit={generateDraft} className="reddit-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Passo 1 · Fonte</span>
            <button type="button" onClick={() => setPhase('choose')} className="hover:text-gray-800">
              Cambia percorso
            </button>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-700">Testo del verbale o degli appunti</span>
            <textarea
              required
              rows={10}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Incolla qui la fonte…"
              className={field}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-700">Oppure carica un file</span>
            <div className="flex flex-wrap items-center gap-2">
              <label className="btn-secondary cursor-pointer">
                Scegli file
                <input
                  type="file"
                  accept=".txt,.vtt,.md,.text,text/plain"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSourceText(await file.text());
                    setFileName(file.name);
                    if (!actTitle) setActTitle(file.name.replace(/\.[^.]+$/, ''));
                  }}
                />
              </label>
              {fileName && <span className="text-xs text-gray-500 truncate max-w-[14rem]">{fileName}</span>}
            </div>
            <p className="text-[11px] text-gray-400">Formati: .txt, .md, .vtt</p>
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">
                Riferimento ({community.sourceLabel})
              </span>
              <input
                type="text"
                value={actNumber}
                onChange={(e) => setActNumber(e.target.value)}
                placeholder={community.sourcePlaceholder}
                className={field}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">Titolo (opzionale)</span>
              <input
                type="text"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="Se vuoto, lo deduciamo dal testo"
                className={field}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={sourceText.trim().length < 40}
              className="btn-primary disabled:opacity-40"
            >
              Continua
            </button>
            {showSample && (
              <button
                type="button"
                onClick={() => {
                  setSourceText(SAMPLE_AI_GOVERNANCE_TRANSCRIPT);
                  setActNumber('Verbale Rischio n. 4/2026');
                  setActTitle('Modelli linguistici in selezione');
                  setFileName(null);
                }}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Usa un esempio (dev)
              </button>
            )}
          </div>
        </form>
      )}

      {phase === 'review' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save('draft');
          }}
          className="reddit-card reddit-card--static p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{mode === 'source' ? 'Passo 2 · Scheda' : 'Scheda'}</span>
            <button
              type="button"
              onClick={() => setPhase(mode === 'source' ? 'source' : 'choose')}
              className="hover:text-gray-800"
            >
              Indietro
            </button>
          </div>

          {hint && <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">{hint}</p>}

          <div className="grid gap-5 lg:grid-cols-2">
          <label className="block space-y-1.5 lg:col-span-2">
            <span className="text-xs font-semibold text-gray-700">1 · Domanda reale</span>
            <p className="text-[11px] text-gray-400">Il conflitto vero, non il titolo dell’atto.</p>
            <textarea
              required
              rows={3}
              value={realQuestion}
              onChange={(e) => setRealQuestion(e.target.value)}
              placeholder="Che domanda stavamo davvero rispondendo?"
              className={field}
            />
          </label>

          <label className="block space-y-1.5 lg:col-span-2">
            <span className="text-xs font-semibold text-gray-700">2 · Decisione</span>
            <p className="text-[11px] text-gray-400">Cosa è stato scelto, in una frase chiara.</p>
            <textarea
              required
              rows={2}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="Cosa abbiamo deciso?"
              className={field}
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-700">3 · Alternativa scartata</span>
            <p className="text-[11px] text-gray-400">Cosa non avete fatto, e perché.</p>
            <input
              value={discardedTitle}
              onChange={(e) => setDiscardedTitle(e.target.value)}
              placeholder="Opzione scartata"
              className={field}
            />
            <textarea
              rows={2}
              value={discardedReason}
              onChange={(e) => setDiscardedReason(e.target.value)}
              placeholder="Motivo dello scarto"
              className={field}
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-700">4 · Cosa ti farebbe cambiare idea?</span>
            <p className="text-[11px] text-gray-400">Un segnale osservabile — il criterio di stop.</p>
            <textarea
              required
              rows={4}
              value={mindChanging}
              onChange={(e) => setMindChanging(e.target.value)}
              placeholder="Es. se il fatturato scende oltre il 12% per tre settimane…"
              className={field}
            />
          </label>
          </div>

          <div className="space-y-4 pt-1 border-t border-gray-100">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">5 · Confidenza</span>
              <p className="text-[11px] text-gray-400">
                Quanto siete sicuri oggi? Serve a calibrare dopo l’esito.
              </p>
              <div className="flex flex-wrap gap-1">
                {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setConfidence(n)}
                    className={`min-w-[2.5rem] px-2.5 py-1.5 rounded-md text-xs ${
                      confidence === n
                        ? 'bg-gray-900 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">6 · Esito atteso (opzionale)</span>
              <p className="text-[11px] text-gray-400">Cosa vi aspettate di osservare entro 6 mesi.</p>
              <textarea
                rows={2}
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                placeholder="Es. pedonalizzazione confermata con fatturato stabile…"
                className={field}
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">Argomento</span>
              <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
                {community.categories.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            {mode === 'manual' && (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-gray-700">Riferimento fonte</span>
                <input
                  type="text"
                  value={actNumber}
                  onChange={(e) => setActNumber(e.target.value)}
                  placeholder={community.sourcePlaceholder}
                  className={field}
                />
              </label>
            )}
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-secondary flex-1 py-2.5 disabled:opacity-40"
            >
              {submitting ? 'Salvataggio…' : 'Salva bozza'}
            </button>
            <button
              type="button"
              disabled={submitting || !realQuestion.trim() || !decision.trim()}
              onClick={() => save('publish')}
              className="btn-primary flex-1 py-2.5 disabled:opacity-40"
            >
              {submitting ? 'Pubblicazione…' : 'Pubblica'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 text-center">
            Bozza: resta privata. Pubblica: visibile nel feed. Oppure{' '}
            <Link href={href('/decisioni')} className="hover:text-gray-700 underline-offset-2 hover:underline">
              torna alle decisioni
            </Link>
            .
          </p>
        </form>
      )}
    </div>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <ComposeInner />
    </Suspense>
  );
}
