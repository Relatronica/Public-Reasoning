'use client';

import React, { useState } from 'react';
import { DecisionInsightKind, OrganizationRole } from '@/types';

interface Props {
  recordId: string;
  steps: { id: string; label: string }[];
  defaultStepId?: string;
  myRole: OrganizationRole | null;
  onCancel: () => void;
  onCreated: () => Promise<void>;
  /** Nasconde il select step se lo step è già fissato dal nodo. */
  lockStep?: boolean;
  className?: string;
}

export default function AddInsightForm({
  recordId,
  steps,
  defaultStepId,
  myRole,
  onCancel,
  onCreated,
  lockStep = false,
  className = 'space-y-2.5 rounded-lg border border-gray-200 p-3 bg-gray-50/60',
}: Props) {
  const defaultKind: DecisionInsightKind =
    myRole === 'consulente' ? 'consulenza' : 'spunto';
  const [kind, setKind] = useState<DecisionInsightKind>(defaultKind);
  const [relatedStepId, setRelatedStepId] = useState(defaultStepId ?? '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lockedLabel = steps.find((s) => s.id === relatedStepId)?.label;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/curator/records/${recordId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title,
          body,
          relatedStepId: relatedStepId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={className}>
      <p className="text-xs font-semibold text-gray-800">Nuovo spunto</p>
      {lockStep && lockedLabel && (
        <p className="text-[11px] text-gray-500">Collegato a «{lockedLabel}»</p>
      )}
      <div className="flex flex-wrap gap-1">
        {(
          [
            ['spunto', 'Spunto'],
            ['consulenza', 'Consulenza'],
            ['alert', 'Alert'],
            ['domanda', 'Domanda'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={`px-2 py-1 rounded-md text-[11px] ${
              kind === id
                ? 'bg-gray-900 text-white font-medium'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {!lockStep && (
        <select
          value={relatedStepId}
          onChange={(e) => setRelatedStepId(e.target.value)}
          className="w-full text-sm rounded-md border border-gray-200 bg-white px-2.5 py-1.5"
        >
          <option value="">Step collegato (opzionale)</option>
          {steps.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titolo"
        className="w-full text-sm rounded-md border border-gray-200 bg-white px-2.5 py-1.5"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Testo dello spunto…"
        className="w-full text-sm rounded-md border border-gray-200 bg-white px-2.5 py-1.5"
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white disabled:opacity-40"
        >
          Pubblica
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
