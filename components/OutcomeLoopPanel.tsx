'use client';

import React, { useState } from 'react';
import { OutcomeReview, ReasoningRecord } from '@/types';
import {
  calibrationHint,
  confidenceLabel,
  createPendingOutcome,
  outcomeStatusLabel,
  timeframeLabel,
} from '@/lib/records/outcomes';
import { useCuratorData } from '@/contexts/CuratorDataContext';

const field =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300';

interface Props {
  record: ReasoningRecord;
  onUpdated?: (record: ReasoningRecord) => void;
}

export default function OutcomeLoopPanel({ record, onUpdated }: Props) {
  const { canCompile, refresh } = useCuratorData();
  const reviews = record.outcomeReviews ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actual, setActual] = useState('');
  const [status, setStatus] = useState<OutcomeReview['status']>('verified_true');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [expected, setExpected] = useState('');
  const [timeframe, setTimeframe] = useState<OutcomeReview['timeframe']>('6_mesi');

  async function patchRecord(partial: Partial<ReasoningRecord>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/curator/records/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: partial }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Salvataggio non riuscito');
      await refresh();
      onUpdated?.(data.record as ReasoningRecord);
      setEditingId(null);
      setAdding(false);
      setExpected('');
      setActual('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  }

  async function submitReview(reviewId: string) {
    const next = reviews.map((r) =>
      r.id === reviewId
        ? {
            ...r,
            actualOutcome: actual.trim(),
            status,
            notes: notes.trim() || undefined,
            reviewDate: new Date(),
          }
        : r
    );
    await patchRecord({ outcomeReviews: next });
  }

  async function addExpected() {
    if (expected.trim().length < 8) {
      setError('Scrivi un esito atteso un po’ più chiaro.');
      return;
    }
    await patchRecord({
      outcomeReviews: [...reviews, createPendingOutcome({ expectedOutcome: expected, timeframe })],
    });
  }

  return (
    <div className="space-y-5 w-full">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Esito e revisione
        </h3>
        <p className="text-sm text-gray-600">
          Chiude il loop: cosa vi aspettavate, cosa è successo, quanto eravate sicuri.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          Confidenza alla decisione
        </p>
        <p className="text-sm text-gray-900 mt-1">{confidenceLabel(record.confidence)}</p>
        {record.uncertaintyExplanation && (
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{record.uncertaintyExplanation}</p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nessun esito atteso ancora. Aggiungine uno per poter rivedere la decisione nel tempo.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((rev) => {
            const hint = calibrationHint(record.confidence, rev.status);
            const isEditing = editingId === rev.id;
            return (
              <li key={rev.id} className="rounded-lg border border-gray-200 px-4 py-3 space-y-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
                  <span className="font-semibold uppercase tracking-wider text-gray-500">
                    {outcomeStatusLabel(rev.status)}
                  </span>
                  <span>·</span>
                  <span>{timeframeLabel(rev.timeframe)}</span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Atteso</p>
                  <p className="text-sm text-gray-900 leading-snug">{rev.expectedOutcome}</p>
                </div>
                {rev.actualOutcome && (
                  <div>
                    <p className="text-[11px] text-gray-400">Accaduto</p>
                    <p className="text-sm text-gray-800 leading-snug">{rev.actualOutcome}</p>
                  </div>
                )}
                {hint && <p className="text-xs text-gray-600 leading-relaxed">{hint}</p>}

                {canCompile && rev.status === 'pending' && !isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(rev.id);
                      setActual(rev.actualOutcome || '');
                      setStatus('verified_true');
                      setNotes(rev.notes || '');
                    }}
                    className="text-[11px] font-medium text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline"
                  >
                    Registra revisione
                  </button>
                )}

                {isEditing && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <textarea
                      rows={2}
                      value={actual}
                      onChange={(e) => setActual(e.target.value)}
                      placeholder="Cosa è successo davvero?"
                      className={field}
                    />
                    <div className="flex flex-wrap gap-1">
                      {(
                        [
                          ['verified_true', 'Confermata'],
                          ['verified_false', 'Smentita'],
                          ['inconclusive', 'Inconclusa'],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setStatus(id)}
                          className={`px-2.5 py-1 rounded-md text-xs ${
                            status === id
                              ? 'bg-gray-900 text-white font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nota (opzionale)"
                      className={field}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy || actual.trim().length < 4}
                        onClick={() => submitReview(rev.id)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white disabled:opacity-40"
                      >
                        Salva revisione
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canCompile && (
        <div className="pt-1">
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="text-xs font-medium text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline"
            >
              Aggiungi esito atteso
            </button>
          ) : (
            <div className="rounded-lg border border-gray-200 p-3 space-y-2">
              <textarea
                rows={2}
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="Cosa vi aspettate di osservare?"
                className={field}
              />
              <select
                className={field}
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as OutcomeReview['timeframe'])}
              >
                <option value="6_mesi">Entro 6 mesi</option>
                <option value="12_mesi">Entro 12 mesi</option>
                <option value="24_mesi">Entro 24 mesi</option>
                <option value="lungo_termine">Lungo termine</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={addExpected}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white disabled:opacity-40"
                >
                  Salva
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
