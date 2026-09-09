'use client';

import React from 'react';
import { AiAssistance, AiAssistanceScope, AiDataExposure, AiSupportLevel } from '@/types';
import {
  AI_EXPOSURE_LABELS,
  AI_SCOPE_OPTIONS,
  DEFAULT_AI_ASSISTANCE,
} from '@/lib/ai-assistance';

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

interface Props {
  value: AiAssistance;
  onChange: (value: AiAssistance) => void;
}

export default function AiAssistanceFormFields({ value, onChange }: Props) {
  const ai = value ?? DEFAULT_AI_ASSISTANCE;

  const setLevel = (level: AiSupportLevel) => {
    onChange({
      ...ai,
      level,
      scopes: level === 'none' ? [] : ai.scopes ?? [],
    });
  };

  const toggleScope = (scope: AiAssistanceScope) => {
    const scopes = ai.scopes ?? [];
    const next = scopes.includes(scope)
      ? scopes.filter((s) => s !== scope)
      : [...scopes, scope];
    onChange({ ...ai, scopes: next });
  };

  return (
    <section className="space-y-3 pt-2 border-t border-gray-100">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Supporto IA</h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Opzionale. Dove e con che ruolo è intervenuta l’IA nella compilazione — non nella decisione del decisore.
        </p>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs font-semibold text-gray-700">Livello</span>
        <select
          className={inputClass}
          value={ai.level}
          onChange={(e) => setLevel(e.target.value as AiSupportLevel)}
        >
          <option value="none">Nessuno</option>
          <option value="assistivo">Assistivo (formato, trascrizione, bozza leggera)</option>
          <option value="sostanziale">Sostanziale (analisi opzioni, bozza di giudizio)</option>
        </select>
      </label>

      {ai.level !== 'none' && (
        <>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700">Dove è stata usata</span>
            <div className="flex flex-wrap gap-2">
              {AI_SCOPE_OPTIONS.map(([scope, label]) => {
                const active = (ai.scopes ?? []).includes(scope);
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                      active
                        ? 'bg-violet-100 border-violet-300 text-violet-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Strumento</span>
            <input
              className={inputClass}
              value={ai.tools ?? ''}
              onChange={(e) => onChange({ ...ai, tools: e.target.value })}
              placeholder="es. Azure OpenAI (tenant chiuso), Claude, nessuno strumento consumer"
            />
          </label>

          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Dati esposti al modello</span>
            <select
              className={inputClass}
              value={ai.dataExposure ?? 'none'}
              onChange={(e) =>
                onChange({ ...ai, dataExposure: e.target.value as AiDataExposure })
              }
            >
              {Object.entries(AI_EXPOSURE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 block">
            <span className="text-xs font-semibold text-gray-700">Nota (verifica umana)</span>
            <textarea
              className={inputClass}
              rows={2}
              value={ai.note ?? ''}
              onChange={(e) => onChange({ ...ai, note: e.target.value })}
              placeholder="es. Bozza opzioni scartate con IA; riscritte e validate in seduta dal compilatore."
            />
          </label>
        </>
      )}
    </section>
  );
}
