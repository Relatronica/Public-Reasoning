import {
  ConfidenceLevel,
  OutcomeReview,
  ReasoningRecord,
} from '@/types';

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  1: 'Molto bassa',
  2: 'Bassa',
  3: 'Media',
  4: 'Alta',
  5: 'Molto alta',
};

export const OUTCOME_STATUS_LABELS: Record<OutcomeReview['status'], string> = {
  pending: 'In attesa',
  verified_true: 'Confermata',
  verified_false: 'Smentita',
  inconclusive: 'Inconclusa',
};

export const TIMEFRAME_LABELS: Record<OutcomeReview['timeframe'], string> = {
  '6_mesi': '6 mesi',
  '12_mesi': '12 mesi',
  '24_mesi': '24 mesi',
  lungo_termine: 'Lungo termine',
};

export function confidenceLabel(level?: ConfidenceLevel | null): string {
  if (!level) return 'Non dichiarata';
  return `${level}/5 · ${CONFIDENCE_LABELS[level]}`;
}

export function outcomeStatusLabel(status: OutcomeReview['status']): string {
  return OUTCOME_STATUS_LABELS[status];
}

export function timeframeLabel(tf: OutcomeReview['timeframe']): string {
  return TIMEFRAME_LABELS[tf];
}

/** Hint di calibrazione: confronta confidenza dichiarata e esito. */
export function calibrationHint(
  confidence: ConfidenceLevel | undefined,
  status: OutcomeReview['status']
): string | null {
  if (!confidence || status === 'pending') return null;
  if (status === 'inconclusive') {
    return 'Esito inconcluso: la confidenza resta da rivedere al prossimo check.';
  }
  if (status === 'verified_true') {
    if (confidence >= 4) return 'Calibrata: alta confidenza e decisione confermata.';
    if (confidence <= 2) return 'Sorpresa positiva: poca confidenza, ma esito allineato.';
    return 'In linea: confidenza media e decisione confermata.';
  }
  // verified_false
  if (confidence >= 4) return 'Sovra-confidenza: eravate molto sicuri, ma l’esito ha smentito.';
  if (confidence <= 2) return 'Calibrata sul dubbio: poca confidenza e decisione smentita.';
  return 'Segnale utile: confidenza media e decisione smentita — aggiornate il modello mentale.';
}

export function primaryOutcome(record: ReasoningRecord): OutcomeReview | null {
  const list = record.outcomeReviews ?? [];
  if (list.length === 0) return null;
  return list.find((r) => r.status === 'pending') ?? list[0];
}

export function hasOutcomeLoop(record: ReasoningRecord): boolean {
  return (record.outcomeReviews?.length ?? 0) > 0 || Boolean(record.confidence);
}

export function createPendingOutcome(input: {
  expectedOutcome: string;
  timeframe?: OutcomeReview['timeframe'];
}): OutcomeReview {
  return {
    id: `outcome-${Date.now().toString(36)}`,
    timeframe: input.timeframe ?? '6_mesi',
    expectedOutcome: input.expectedOutcome.trim(),
    status: 'pending',
  };
}
