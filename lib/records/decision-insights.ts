import {
  DecisionInsight,
  DecisionInsightSource,
  DiscardedOption,
  ReasoningRecord,
} from '@/types';

const KIND_LABEL: Record<DecisionInsight['kind'], string> = {
  spunto: 'Spunto',
  alert: 'Alert',
  domanda: 'Domanda',
  consulenza: 'Consulenza',
};

const SOURCE_LABEL: Record<DecisionInsightSource, string> = {
  community: 'Community',
  classic: 'Tradizione',
  system: 'Sistema',
};

const SOURCE_BLURB: Record<DecisionInsightSource, string> = {
  community: 'Pareri di filosofi e consulenti sulla scheda',
  classic: 'Prompt di metodo dalla tradizione (non advisor vivi)',
  system: 'Check e alert automatici di Dubitor',
};

/** Ordine di visualizzazione nella colonna Consultazione. */
export const INSIGHT_SOURCE_ORDER: DecisionInsightSource[] = [
  'community',
  'classic',
  'system',
];

/** Autori storici usati come lente di lettura, non come peer della community. */
const CLASSIC_AUTHORS = new Set(
  [
    'Hannah Arendt',
    'Karl Popper',
    'Max Weber',
    'Iris Marion Young',
    'Simone Weil',
    'John Dewey',
  ].map((n) => n.toLowerCase())
);

export function insightKindLabel(kind: DecisionInsight['kind']): string {
  return KIND_LABEL[kind];
}

export function insightSourceLabel(source: DecisionInsightSource): string {
  return SOURCE_LABEL[source];
}

export function insightSourceBlurb(source: DecisionInsightSource): string {
  return SOURCE_BLURB[source];
}

/**
 * Inferisce la provenienza quando manca `source` (seed legacy / overlay).
 * Preferire sempre `source` esplicito in scrittura.
 */
export function inferInsightSource(
  insight: Pick<DecisionInsight, 'source' | 'author' | 'role' | 'authorUserId'>
): DecisionInsightSource {
  if (insight.source) return insight.source;

  const author = insight.author?.trim() ?? '';
  const role = insight.role?.trim() ?? '';

  if (role === 'Sistema' || author === 'Dubitor' || author === 'Desk risk') {
    return 'system';
  }
  if (author && CLASSIC_AUTHORS.has(author.toLowerCase())) {
    return 'classic';
  }
  return 'community';
}

export function withInsightSource(insight: DecisionInsight): DecisionInsight {
  if (insight.source) return insight;
  return { ...insight, source: inferInsightSource(insight) };
}

export function groupInsightsBySource(
  insights: DecisionInsight[]
): { source: DecisionInsightSource; items: DecisionInsight[] }[] {
  const buckets: Record<DecisionInsightSource, DecisionInsight[]> = {
    community: [],
    classic: [],
    system: [],
  };
  for (const insight of insights) {
    buckets[inferInsightSource(insight)].push(insight);
  }
  return INSIGHT_SOURCE_ORDER.filter((s) => buckets[s].length > 0).map((source) => ({
    source,
    items: buckets[source],
  }));
}

/** Id stabile del nodo/step scarto (allineato al grafo). */
export function discardedStepId(
  opt: Pick<DiscardedOption, 'id'> | { id?: string },
  index: number
): string {
  return `discarded-${opt.id || index}`;
}

export function findDiscardedByStepId(
  record: ReasoningRecord,
  stepId: string
): DiscardedOption | null {
  const opts = record.discardedOptions ?? [];
  return opts.find((opt, i) => discardedStepId(opt, i) === stepId) ?? null;
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
 * Spunti curati (filosofi/consulenti) + spunti contestuali derivati.
 * I curati restano in testa; i derivati non vengono cancellati dal primo contributo.
 * Ogni insight esce con `source` risolto.
 */
export function resolveDecisionInsights(record: ReasoningRecord): DecisionInsight[] {
  const curated = (record.insights ?? []).map(withInsightSource);
  const derived = deriveContextualInsights(record);
  if (curated.length === 0) return derived;

  const curatedIds = new Set(curated.map((i) => i.id));
  const extra = derived.filter((d) => !curatedIds.has(d.id));
  return [...curated, ...extra];
}

function deriveContextualInsights(record: ReasoningRecord): DecisionInsight[] {
  const items: DecisionInsight[] = [];

  items.push({
    id: `${record.id}-spunto-domanda`,
    kind: 'spunto',
    source: 'classic',
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
      source: 'system',
      title: 'Lo scarto più debole',
      body: `Rileggi perché è stata scartata «${truncate(first.title, 72)}». Se la ragione è debole o non verificabile, lo scarto può tornare in gioco.`,
      author: 'Desk risk',
      role: 'Metodo',
      relatedStepId: discardedStepId(first, 0),
    });
  }

  if (record.uncertaintyLevel === 'alto' || record.uncertaintyLevel === 'medio') {
    items.push({
      id: `${record.id}-alert-incertezza`,
      kind: 'alert',
      source: 'system',
      title: `Incertezza ${record.uncertaintyLevel}`,
      body:
        record.uncertaintyExplanation?.trim() ||
        'Il livello di incertezza è elevato: conviene esplicitare cosa manca e chi può ridurlo prima di trattare la decisione come chiusa.',
      author: 'Dubitor',
      role: 'Sistema',
      relatedStepId: 'decision',
    });
  }

  const stop = record.mindChangingConditions?.[0];
  if (stop) {
    items.push({
      id: `${record.id}-domanda-stop`,
      kind: 'domanda',
      source: 'classic',
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
      source: 'system',
      title: 'Manca un criterio di stop',
      body: 'Senza condizioni che cambierebbero idea, la decisione rischia di diventare dogma. Aggiungi almeno un segnale osservabile di ripensamento.',
      author: 'Dubitor',
      role: 'Sistema',
      relatedStepId: 'decision',
    });
  }

  items.push({
    id: `${record.id}-spunto-responsabilita`,
    kind: 'spunto',
    source: 'classic',
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
