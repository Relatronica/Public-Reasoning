'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Quote,
  Scale,
  XCircle,
} from 'lucide-react';
import { ReasoningRecord } from '@/types';
import { hasAiAssistance } from '@/lib/ai-assistance';
import VerbatimVsInterpretationViewer from './VerbatimVsInterpretationViewer';
import AiAssistancePanel from './AiAssistancePanel';

type StepId = 'question' | 'discarded' | 'decision' | 'stop' | 'sources';

interface FlowStepDef {
  id: StepId;
  label: string;
  short: string;
  tone: 'blue' | 'amber' | 'emerald' | 'rose' | 'gray';
  icon: React.ComponentType<{ className?: string }>;
}

const TONE_STYLES = {
  blue: {
    active: 'bg-blue-600 border-blue-600 text-white',
    idle: 'bg-white border-blue-200 text-blue-600',
    line: 'bg-blue-200',
    lineDone: 'bg-blue-500',
    panel: 'border-blue-100 bg-blue-50/40',
    label: 'text-blue-700',
  },
  amber: {
    active: 'bg-amber-500 border-amber-500 text-white',
    idle: 'bg-white border-amber-200 text-amber-700',
    line: 'bg-amber-200',
    lineDone: 'bg-amber-500',
    panel: 'border-amber-100 bg-amber-50/40',
    label: 'text-amber-800',
  },
  emerald: {
    active: 'bg-emerald-600 border-emerald-600 text-white',
    idle: 'bg-white border-emerald-200 text-emerald-700',
    line: 'bg-emerald-200',
    lineDone: 'bg-emerald-500',
    panel: 'border-emerald-100 bg-emerald-50/40',
    label: 'text-emerald-800',
  },
  rose: {
    active: 'bg-rose-600 border-rose-600 text-white',
    idle: 'bg-white border-rose-200 text-rose-700',
    line: 'bg-rose-200',
    lineDone: 'bg-rose-500',
    panel: 'border-rose-100 bg-rose-50/40',
    label: 'text-rose-800',
  },
  gray: {
    active: 'bg-gray-700 border-gray-700 text-white',
    idle: 'bg-white border-gray-200 text-gray-600',
    line: 'bg-gray-200',
    lineDone: 'bg-gray-500',
    panel: 'border-gray-200 bg-gray-50',
    label: 'text-gray-700',
  },
};

function timeframeLabel(value: string): string {
  return value.replace('_', ' ');
}

function outcomeLabel(status: string): string {
  if (status === 'verified_true') return 'Confermata';
  if (status === 'verified_false') return 'Smentita';
  if (status === 'inconclusive') return 'Inconclusa';
  return 'In attesa';
}

function previewForStep(record: ReasoningRecord, id: StepId): string {
  switch (id) {
    case 'question':
      return record.realQuestion;
    case 'discarded':
      return record.discardedOptions?.[0]?.title || 'Opzione scartata';
    case 'decision':
      return record.decision;
    case 'stop':
      return record.mindChangingConditions?.[0] || 'Verifica a posteriori';
    case 'sources':
      return 'Citazioni e analisi del compilatore';
  }
}

function truncatePeek(text: string, max = 72): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

export default function DecisionFlowchart({ record }: { record: ReasoningRecord }) {
  const steps = useMemo<FlowStepDef[]>(() => {
    const list: FlowStepDef[] = [
      { id: 'question', label: 'Domanda', short: 'Domanda', tone: 'blue', icon: HelpCircle },
    ];
    if ((record.discardedOptions?.length ?? 0) > 0) {
      list.push({ id: 'discarded', label: 'Scarto', short: 'Scarto', tone: 'amber', icon: XCircle });
    }
    list.push({ id: 'decision', label: 'Decisione', short: 'Decisione', tone: 'emerald', icon: Scale });
    if (
      (record.mindChangingConditions?.length ?? 0) > 0 ||
      (record.outcomeReviews?.length ?? 0) > 0
    ) {
      list.push({ id: 'stop', label: 'Stop', short: 'Stop', tone: 'rose', icon: AlertTriangle });
    }
    if (
      (record.verbatimQuotes?.length ?? 0) > 0 ||
      Boolean(record.interpretativeSummary?.trim()) ||
      hasAiAssistance(record.aiAssistance)
    ) {
      list.push({ id: 'sources', label: 'Fonti', short: 'Fonti', tone: 'gray', icon: Quote });
    }
    return list;
  }, [record]);

  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, steps.length - 1);
  const current = steps[safeIndex];
  const styles = TONE_STYLES[current.tone];
  const Icon = current.icon;

  const go = (next: number) => {
    setIndex(Math.max(0, Math.min(steps.length - 1, next)));
  };

  const uncertaintyClass =
    record.uncertaintyLevel === 'alto'
      ? 'text-rose-700'
      : record.uncertaintyLevel === 'medio'
        ? 'text-amber-700'
        : 'text-emerald-700';

  return (
    <div className="mt-4 space-y-4">
      {/* Horizontal stepper */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex items-center min-w-max gap-0 py-1">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const tone = TONE_STYLES[step.tone];
            const isActive = i === safeIndex;
            const isDone = i < safeIndex;
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  className="group flex flex-col items-center gap-1.5 min-w-[4.5rem] focus:outline-none"
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                      isActive
                        ? `${tone.active} scale-110 shadow-sm`
                        : isDone
                          ? tone.active
                          : `${tone.idle} group-hover:scale-105`
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? tone.label : 'text-gray-400'
                    }`}
                  >
                    {step.short}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 mx-1 rounded-full transition-colors ${
                      i < safeIndex ? 'bg-gray-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active step panel */}
      <div className={`rounded-xl border overflow-hidden ${styles.panel}`}>
        <div className="px-3.5 py-2.5 border-b border-black/5 flex items-center justify-between gap-3">
          <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${styles.label}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>
              {safeIndex + 1}/{steps.length} · {current.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(safeIndex - 1)}
              disabled={safeIndex === 0}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Passo precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => go(safeIndex + 1)}
              disabled={safeIndex === steps.length - 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Passo successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 min-h-[7.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {current.id === 'question' && (
                <p className="text-sm text-gray-900 leading-relaxed font-medium">{record.realQuestion}</p>
              )}

              {current.id === 'discarded' && (
                <div className="space-y-3">
                  {record.discardedOptions.map((opt) => (
                    <div key={opt.id}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{opt.title}</p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                            opt.evidenceType === 'verbatim'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-violet-100 text-violet-800'
                          }`}
                        >
                          {opt.evidenceType === 'verbatim' ? 'Verbatim' : 'Interpretata'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{opt.reasonDiscarded}</p>
                    </div>
                  ))}
                </div>
              )}

              {current.id === 'decision' && (
                <div>
                  <p className="text-sm text-gray-900 leading-relaxed font-medium">{record.decision}</p>
                  {record.uncertaintyExplanation && (
                    <p className={`mt-3 text-xs leading-relaxed ${uncertaintyClass}`}>
                      <span className="font-semibold">Incertezza {record.uncertaintyLevel}: </span>
                      {record.uncertaintyExplanation}
                    </p>
                  )}
                </div>
              )}

              {current.id === 'stop' && (
                <div className="space-y-3">
                  {(record.mindChangingConditions?.length ?? 0) > 0 && (
                    <ul className="space-y-2">
                      {record.mindChangingConditions.map((cond, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(record.outcomeReviews?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {record.outcomeReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/80 bg-white/70 text-[11px] text-gray-700"
                          title={rev.expectedOutcome}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              rev.status === 'verified_true' ? 'text-emerald-600' : 'text-gray-400'
                            }`}
                          />
                          <span>
                            {timeframeLabel(rev.timeframe)} · {outcomeLabel(rev.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {current.id === 'sources' && (
                <div className="space-y-3">
                  <AiAssistancePanel ai={record.aiAssistance} />
                  <VerbatimVsInterpretationViewer
                    quotes={record.verbatimQuotes}
                    interpretativeSummary={record.interpretativeSummary}
                    officialUrl={record.publicAct?.officialUrl || record.publicAct?.entity?.officialUrl}
                    sourceLabel={record.publicAct?.entity?.sourceLabel}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Peek of next step */}
      {safeIndex < steps.length - 1 && (
        <button
          type="button"
          onClick={() => go(safeIndex + 1)}
          className="w-full text-left text-[11px] text-gray-500 hover:text-gray-800 px-1"
        >
          Avanti → <span className="font-semibold">{steps[safeIndex + 1].label}</span>
          <span className="text-gray-400">
            {' '}
            · {truncatePeek(previewForStep(record, steps[safeIndex + 1].id))}
          </span>
        </button>
      )}
    </div>
  );
}
