'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Inbox, Send } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import {
  consultationKindLabel,
  consultationStatusLabel,
} from '@/lib/records/decision-insights';

function RichiesteInner() {
  const { status } = useSession();
  const router = useRouter();
  const { href } = useActiveCommunity();
  const { consultationInbox, canAdvise, refresh, loading } = useCuratorData();
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(href('/curator/richieste')));
    return null;
  }

  if (status === 'loading' || loading) {
    return <div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>;
  }

  async function submitReply(recordId: string, requestId: string, e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/curator/records/${recordId}/consultations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          title: replyTitle,
          body: replyBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      setReplyFor(null);
      setReplyTitle('');
      setReplyBody('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 w-full max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href={href('/curator')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-gray-500" />
            Richieste
          </h1>
          <p className="text-xs text-gray-500">
            Consultazioni aperte per il tuo ruolo
            {consultationInbox.length > 0 ? ` · ${consultationInbox.length}` : ''}.
          </p>
        </div>
      </div>

      {!canAdvise && (
        <div className="reddit-card p-5 text-sm text-gray-600">
          Solo filosofi, consulenti e admin vedono la coda delle richieste da rispondere.
        </div>
      )}

      {canAdvise && consultationInbox.length === 0 && (
        <div className="reddit-card p-8 text-center space-y-2">
          <p className="text-sm font-medium text-gray-900">Nessuna richiesta aperta</p>
          <p className="text-xs text-gray-500">
            Quando qualcuno chiede un parere filosofico o una consulenza, compare qui.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <ul className="space-y-3">
        {consultationInbox.map((item) => {
          const key = `${item.recordId}:${item.request.id}`;
          const req = item.request;
          return (
            <li key={key} className="reddit-card p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                <span>{consultationKindLabel(req.kind)}</span>
                <span className="text-gray-300">·</span>
                <span className="text-amber-700">{consultationStatusLabel(req.status)}</span>
                {item.communityName && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="normal-case tracking-normal font-medium text-gray-500">
                      {item.communityName}
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-900 leading-snug">{req.question}</p>

              <p className="text-[11px] text-gray-500">
                Su:{' '}
                <Link
                  href={href(`/records/${item.recordId}`, { dock: 'richieste' })}
                  className="text-gray-800 hover:underline"
                >
                  {item.realQuestion.length > 120
                    ? `${item.realQuestion.slice(0, 120).trim()}…`
                    : item.realQuestion}
                </Link>
              </p>

              <p className="text-[11px] text-gray-500">
                {req.requestedBy.name || req.requestedBy.email || 'Utente'}
                {' · '}
                {new Date(req.createdAt).toLocaleDateString('it-IT')}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                {replyFor !== key && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyFor(key);
                      setReplyTitle(
                        req.kind === 'filosofica' ? 'Spunto di lettura' : 'Parere operativo'
                      );
                      setReplyBody('');
                      setError('');
                    }}
                    className="text-xs font-medium text-gray-800 hover:underline"
                  >
                    Rispondi qui
                  </button>
                )}
                <Link
                  href={href(`/records/${item.recordId}`, { dock: 'richieste' })}
                  className="text-xs text-gray-500 hover:text-gray-800 hover:underline"
                >
                  Apri scheda
                </Link>
              </div>

              {replyFor === key && (
                <form
                  onSubmit={(e) => submitReply(item.recordId, req.id, e)}
                  className="space-y-2 pt-2 border-t border-gray-100"
                >
                  <input
                    value={replyTitle}
                    onChange={(e) => setReplyTitle(e.target.value)}
                    placeholder="Titolo"
                    className="w-full text-sm rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                    placeholder="La tua risposta…"
                    className="w-full text-sm rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy || replyTitle.trim().length < 3 || replyBody.trim().length < 8}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Pubblica risposta
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyFor(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-100"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function RichiestePage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <RichiesteInner />
    </Suspense>
  );
}
