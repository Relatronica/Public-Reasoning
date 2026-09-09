'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HelpCircle, CheckCircle2, Compass, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import AiAssistanceFormFields from '@/components/AiAssistanceFormFields';
import { DEFAULT_AI_ASSISTANCE } from '@/lib/ai-assistance';
import { AiAssistance } from '@/types';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

function NewReasoningRecordInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { community, href, slug } = useActiveCommunity();
  const { refresh } = useCuratorData();

  const [actNumber, setActNumber] = useState('');
  const [actTitle, setActTitle] = useState('');
  const [realQuestion, setRealQuestion] = useState('');
  const [decision, setDecision] = useState('');
  const [discardedTitle, setDiscardedTitle] = useState('');
  const [discardedReason, setDiscardedReason] = useState('');
  const [mindChanging, setMindChanging] = useState('');
  const [category, setCategory] = useState(community.categories[0]?.label ?? '');
  const [aiAssistance, setAiAssistance] = useState<AiAssistance>(DEFAULT_AI_ASSISTANCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/records/new')));
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
            rawTextExcerpt: '',
          },
          record: {
            category,
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
            aiAssistance:
              aiAssistance.level === 'none'
                ? undefined
                : aiAssistance,
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
          <ShieldCheck className="w-4 h-4" />
          <span>Nuovo Reasoning Record</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{community.newRecordTitle}</h1>
        <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">{community.newRecordHint}</p>
        {session?.user && (
          <p className="text-[11px] text-gray-400">Compilato da {session.user.name ?? session.user.email}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="reddit-card p-6 space-y-5">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{community.typeLabel}: {community.name}</span>
          </div>
          <Link href={href('/curator')} className="text-[11px] text-blue-700 hover:underline">
            Apri editor
          </Link>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Riferimento {community.sourceLabel}
          </span>
          <input
            type="text"
            required
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
            placeholder="Titolo breve della delibera o verbale"
            className={inputClass}
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Categoria</span>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            {community.categories.map((c) => (
              <option key={c.label} value={c.label}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 block">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            1. La Domanda Reale
          </span>
          <textarea
            required
            rows={3}
            value={realQuestion}
            onChange={(e) => setRealQuestion(e.target.value)}
            placeholder="Qual è il problema sostanziale a cui si rispondeva?"
            className={inputClass}
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            2. La Decisione Presa
          </span>
          <textarea
            required
            rows={2}
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Sintesi chiara della scelta..."
            className={inputClass}
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-4 h-4" />
            3. Opzione Scartata
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
            4. Condizione di Falsificabilità
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

        <AiAssistanceFormFields value={aiAssistance} onChange={setAiAssistance} />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || status !== 'authenticated'}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting ? 'Pubblicazione…' : 'Pubblica Reasoning Record'}
        </button>
      </form>
    </div>
  );
}

export default function NewReasoningRecordPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento...</div>}>
      <NewReasoningRecordInner />
    </Suspense>
  );
}
