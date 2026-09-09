import { displayStatusLabel, resolveVisibility } from '@/lib/records';
import {
  confidenceLabel,
  outcomeStatusLabel,
  timeframeLabel,
} from '@/lib/records/outcomes';
import { ReasoningRecord } from '@/types';

export function recordToMarkdown(record: ReasoningRecord): string {
  const act = record.publicAct;
  const discarded = (record.discardedOptions ?? [])
    .map(
      (o) =>
        `- **${o.title}** (${o.evidenceType}): ${o.reasonDiscarded}`
    )
    .join('\n');
  const quotes = (record.verbatimQuotes ?? [])
    .map((q) => `> ${q.quote}${q.speaker ? ` — ${q.speaker}` : ''}`)
    .join('\n\n');
  const conditions = (record.mindChangingConditions ?? []).map((c) => `- ${c}`).join('\n');
  const outcomes = (record.outcomeReviews ?? [])
    .map((r) => {
      const lines = [
        `- **${timeframeLabel(r.timeframe)}** · ${outcomeStatusLabel(r.status)}`,
        `  - Atteso: ${r.expectedOutcome}`,
      ];
      if (r.actualOutcome) lines.push(`  - Accaduto: ${r.actualOutcome}`);
      return lines.join('\n');
    })
    .join('\n');

  return `# ${record.realQuestion}

- Workspace: ${act?.entity?.name ?? '—'}
- Fonte: ${act?.actNumber ?? ''} ${act?.title ?? ''}
- Stato: ${displayStatusLabel(record.status)}
- Visibilità: ${resolveVisibility(record)}
- Categoria: ${record.category ?? '—'}
- Pack: ${record.compliancePack ?? '—'}
- Incertezza: ${record.uncertaintyLevel}
- Confidenza: ${confidenceLabel(record.confidence)}

## Decisione

${record.decision}

## Opzioni scartate

${discarded || '_Nessuna_'}

## Condizioni di cambio idea

${conditions || '_Nessuna_'}

## Esito e revisione

${outcomes || '_Nessun esito dichiarato_'}

## Verbatim

${quotes || '_Nessuna citazione_'}

## Interpretazione

${record.interpretativeSummary || '_—_'}
`;
}
