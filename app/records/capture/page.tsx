'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { draftFromSource, SAMPLE_AI_GOVERNANCE_TRANSCRIPT } from '@/lib/capture/draft-from-source';
import { defaultVisibilityForCommunity } from '@/lib/records';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

function CaptureInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { community, href, slug } = useActiveCommunity();
  const { refresh, canCompile } = useCuratorData();

  const [step, setStep] = useState<1 | 2>(1);
  const [sourceText, setSourceText] = useState('');
  const [actNumber, setActNumber] = useState('');
  const [actTitle, setActTitle] = useState('');
  const [category, setCategory] = useState(community.categories[0]?.label ?? '');
  const [realQuestion, setRealQuestion] = useState('');
  const [decision, setDecision] = useState('');
  const [discardedTitle, setDiscardedTitle] = useState('');
  const [discardedReason, setDiscardedReason] = useState('');
  const [mindChanging, setMindChanging] = useState('');
  const [missing, setMissing] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/records/capture')));
    return null;
  }

  if (status === 'authenticated' && !canCompile) {
    return (
      <div className="reddit-card p-8 text-sm text-gray-600">
        Ruolo insufficiente: serve compiler o superiore per catturare una decisione.
      </div>
    );
  }

  const handleGenerate = (e: React.FormEvent) => {
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
    setMissing(draft.missing);
    setStep(2);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/curator/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communitySlug: slug,
          act: {
            title: actTitle || actNumber,
            actNumber,
            rawTextExcerpt: sourceText.slice(0, 2000),
          },
          record: {
            category,
            status: 'draft',
            visibility: defaultVisibilityForCommunity(community),
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
                    evidenceType: 'interpretation',
                  },
                ]
              : [],
            mindChangingConditions: mindChanging ? [mindChanging] : [],
            verbatimQuotes: [],
            outcomeReviews: [],
            aiAssistance: {
              level: 'assistivo',
              scopes: ['drafting'],
              tools: 'Reason capture (rule-based)',
              dataExposure: 'internal_only',
              note: 'Bozza estratta dalla fonte; campi rivisti in sessione prima della chiusura.',
            },
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Invio fallito');
      }
      await refresh();
      router.push(href('/'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="reddit-card p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
          <Sparkles className="w-4 h-4" />
          <span>Cattura decisione</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Dalla fonte alla scheda</h1>
        <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
          Incolla il transcript o il verbale. Reason propone domanda reale, scarto e condizione di stop.
          Tu (o lo sponsor) chiudi. Non è un form da fare dopo le 19.
        </p>
        {session?.user && (
          <p className="text-[11px] text-gray-400">Compilato da {session.user.name ?? session.user.email}</p>
        )}
      </div>

      {step === 1 ? (
        <form onSubmit={handleGenerate} className="reddit-card p-6 space-y-5">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-semibold">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>
                {community.typeLabel}: {community.name}
              </span>
            </div>
            <span className="text-[11px] text-blue-700">Passo 1 di 2 · fonte</span>
          </div>

          <label className="space-y-1 block">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Transcript o nota di seduta
            </span>
            <textarea
              required
              rows={12}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Incolla il verbale, gli appunti o il transcript. Se etichetti DOMANDA REALE / DECISIONE / SCARTATA / CAMBIO IDEA, l’estrazione è più precisa."
              className={inputClass}
            />
          </label>

          <label className="space-y-1 block">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Oppure carica .txt / .vtt / .md
            </span>
            <input
              type="file"
              accept=".txt,.vtt,.md,.text,text/plain"
              className="block text-xs text-gray-600"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                setSourceText(text);
                if (!actTitle) setActTitle(file.name.replace(/\.[^.]+$/, ''));
              }}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="space-y-1 block">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Riferimento {community.sourceLabel}
              </span>
              <input
                type="text"
                value={actNumber}
                onChange={(e) => setActNumber(e.target.value)}
                placeholder={community.sourcePlaceholder}
                className={inputClass}
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Titolo fonte</span>
              <input
                type="text"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="Opzionale: lo deduciamo dalla prima riga"
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={sourceText.trim().length < 40}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              Genera bozza
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceText(SAMPLE_AI_GOVERNANCE_TRANSCRIPT);
                setActNumber('Verbale Rischio n. 4/2026');
                setActTitle('Fornitore di modelli linguistici in Risorse umane');
              }}
              className="text-xs text-blue-700 hover:underline"
            >
              Usa esempio del pack Governance IA
            </button>
            <Link href={href('/records/new')} className="text-xs text-gray-500 hover:underline ml-auto">
              Compila a mano
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSave} className="reddit-card p-6 space-y-5">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Passo 2 di 2 · rivedi e salva come bozza</span>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-[11px] text-amber-800 hover:underline">
              Torna alla fonte
            </button>
          </div>

          {missing.length > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
              Completa a mano: {missing.join(', ')}. Senza condizione di cambio idea la scheda non è un reasoning
              record.
            </p>
          )}

          <label className="space-y-1 block">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Categoria</span>
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {community.categories.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 block">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              1. La domanda reale
            </span>
            <textarea
              required
              rows={3}
              value={realQuestion}
              onChange={(e) => setRealQuestion(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="space-y-1 block">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              2. La decisione
            </span>
            <textarea
              required
              rows={2}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-4 h-4" />
              3. Opzione scartata
            </span>
            <input
              value={discardedTitle}
              onChange={(e) => setDiscardedTitle(e.target.value)}
              placeholder="Titolo dell'alternativa scartata"
              className={inputClass}
            />
            <textarea
              rows={2}
              value={discardedReason}
              onChange={(e) => setDiscardedReason(e.target.value)}
              placeholder="Per quale motivo è stata scartata?"
              className={inputClass}
            />
          </div>

          <div className="space-y-1 bg-amber-50/60 border border-amber-200 p-3.5 rounded-lg">
            <label className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              4. Condizione di falsificabilità
            </label>
            <textarea
              required
              rows={2}
              value={mindChanging}
              onChange={(e) => setMindChanging(e.target.value)}
              placeholder="Cosa farebbe cambiare idea?"
              className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || status !== 'authenticated'}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Salvataggio…' : 'Salva bozza (non pubblica)'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento...</div>}>
      <CaptureInner />
    </Suspense>
  );
}
