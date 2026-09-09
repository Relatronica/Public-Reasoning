import { displayStatusLabel, resolveVisibility } from '@/lib/records';
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

  return `# ${record.realQuestion}

- Workspace: ${act?.entity?.name ?? '—'}
- Fonte: ${act?.actNumber ?? ''} ${act?.title ?? ''}
- Stato: ${displayStatusLabel(record.status)}
- Visibilità: ${resolveVisibility(record)}
- Categoria: ${record.category ?? '—'}
- Pack: ${record.compliancePack ?? '—'}
- Incertezza: ${record.uncertaintyLevel}

## Decisione

${record.decision}

## Opzioni scartate

${discarded || '_Nessuna_'}

## Condizioni di cambio idea

${conditions || '_Nessuna_'}

## Verbatim

${quotes || '_Nessuna citazione_'}

## Interpretazione

${record.interpretativeSummary || '_—_'}
`;
}
