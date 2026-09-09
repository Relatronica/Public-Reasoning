import { DecisionInsight, ReasoningRecord } from '@/types';

const KIND_LABEL: Record<DecisionInsight['kind'], string> = {
  spunto: 'Spunto',
  alert: 'Alert',
  domanda: 'Domanda',
  consulenza: 'Consulenza',
};

export function insightKindLabel(kind: DecisionInsight['kind']): string {
  return KIND_LABEL[kind];
}

/** Conta gli spunti collegati a uno step del grafo. */
export function countInsightsForStep(
  insights: DecisionInsight[],
  stepId: string
): number {
  return insights.filter((i) => i.relatedStepId === stepId).length;
}

export function insightsByStepId(
  insights: DecisionInsight[]
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const insight of insights) {
    if (!insight.relatedStepId) continue;
    map[insight.relatedStepId] = (map[insight.relatedStepId] ?? 0) + 1;
  }
  return map;
}

export function stepLabelForInsight(
  steps: { id: string; label: string }[],
  relatedStepId?: string
): string | null {
  if (!relatedStepId) return null;
  return steps.find((s) => s.id === relatedStepId)?.label ?? null;
}

export function consultationKindLabel(kind: 'filosofica' | 'consulenza'): string {
  return kind === 'filosofica' ? 'Filosofica' : 'Consulenza';
}

export function consultationStatusLabel(
  status: 'aperta' | 'in_corso' | 'chiusa'
): string {
  if (status === 'aperta') return 'Aperta';
  if (status === 'in_corso') return 'In corso';
  return 'Chiusa';
}

/**
 * Preferisce gli spunti curati (filosofi / consulenti); altrimenti deriva
 * spunti contestuali da incertezza, scarti e criteri di stop.
 */
export function resolveDecisionInsights(record: ReasoningRecord): DecisionInsight[] {
  if (record.insights && record.insights.length > 0) {
    return record.insights;
  }
  return deriveContextualInsights(record);
}

function deriveContextualInsights(record: ReasoningRecord): DecisionInsight[] {
  const items: DecisionInsight[] = [];

  items.push({
    id: `${record.id}-spunto-domanda`,
    kind: 'spunto',
    title: 'La domanda è quella giusta?',
    body: 'Prima di valutare la decisione, chiediti se la domanda reale cattura il conflitto vero o solo la formulazione più comoda da chiudere.',
    author: 'Hannah Arendt',
    role: 'Filosofa',
    relatedStepId: 'question',
  });

  if ((record.discardedOptions?.length ?? 0) > 0) {
    const first = record.discardedOptions[0];
    items.push({
      id: `${record.id}-consulenza-scarto`,
      kind: 'consulenza',
      title: 'Lo scarto più debole',
      body: `Rileggi perché è stata scartata «${truncate(first.title, 72)}». Se la ragione è debole o non verificabile, lo scarto può tornare in gioco.`,
      author: 'Desk risk',
      role: 'Consulente',
      relatedStepId: `discarded-${first.id}`,
    });
  }

  if (record.uncertaintyLevel === 'alto' || record.uncertaintyLevel === 'medio') {
    items.push({
      id: `${record.id}-alert-incertezza`,
      kind: 'alert',
      title: `Incertezza ${record.uncertaintyLevel}`,
      body:
        record.uncertaintyExplanation?.trim() ||
        'Il livello di incertezza è elevato: conviene esplicitare cosa manca e chi può ridurlo prima di trattare la decisione come chiusa.',
      author: 'Reason',
      role: 'Sistema',
      relatedStepId: 'decision',
    });
  }

  const stop = record.mindChangingConditions?.[0];
  if (stop) {
    items.push({
      id: `${record.id}-domanda-stop`,
      kind: 'domanda',
      title: 'Cosa ti farebbe cambiare idea?',
      body: `Un criterio di stop dichiarato: «${truncate(stop, 140)}». È osservabile? Chi lo monitora? Entro quando?`,
      author: 'Karl Popper',
      role: 'Filosofo',
      relatedStepId: 'stop',
    });
  } else {
    items.push({
      id: `${record.id}-alert-falsificabilita`,
      kind: 'alert',
      title: 'Manca un criterio di stop',
      body: 'Senza condizioni che cambierebbero idea, la decisione rischia di diventare dogma. Aggiungi almeno un segnale osservabile di ripensamento.',
      author: 'Reason',
      role: 'Sistema',
      relatedStepId: 'decision',
    });
  }

  items.push({
    id: `${record.id}-spunto-responsabilita`,
    kind: 'spunto',
    title: 'Chi risponde se va male?',
    body: 'Una decisione pubblica non è solo contenuto: è responsabilità. Se l’esito delude, chi ha l’obbligo di tornare sul quesito e aggiornare il registro?',
    author: 'Max Weber',
    role: 'Sociologo',
    relatedStepId: 'decision',
  });

  return items;
}

function truncate(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}
