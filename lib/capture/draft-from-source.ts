import { VerbatimQuote } from '@/types';

export interface CaptureDraft {
  actTitle: string;
  actNumber: string;
  realQuestion: string;
  decision: string;
  discardedTitle: string;
  discardedReason: string;
  mindChanging: string;
  interpretativeSummary: string;
  uncertaintyLevel: 'basso' | 'medio' | 'alto';
  verbatimQuotes: Omit<VerbatimQuote, 'id'>[];
  missing: string[];
}

const LABEL_PATTERNS: { key: keyof Pick<CaptureDraft, 'realQuestion' | 'decision' | 'discardedTitle' | 'discardedReason' | 'mindChanging' | 'actTitle' | 'actNumber'>; re: RegExp }[] = [
  { key: 'realQuestion', re: /^(?:domanda\s*reale|real\s*question|problema)\s*[:\-–]\s*(.+)$/i },
  { key: 'decision', re: /^(?:decisione|decidiamo|abbiamo deciso|delibera)\s*[:\-–]\s*(.+)$/i },
  { key: 'discardedTitle', re: /^(?:opzione\s*scartata|alternativa\s*scartata|scartiamo|scartata)\s*[:\-–]\s*(.+)$/i },
  { key: 'discardedReason', re: /^(?:motivo(?:\s+dello\s+scarto)?|perché\s+scartat[aeo])\s*[:\-–]\s*(.+)$/i },
  { key: 'mindChanging', re: /^(?:cambio\s*idea|condizione(?:\s+di\s+stop)?|kill\s*criteri[ao]|falsificabilit[aà])\s*[:\-–]\s*(.+)$/i },
  { key: 'actTitle', re: /^(?:titolo|oggetto|fonte)\s*[:\-–]\s*(.+)$/i },
  { key: 'actNumber', re: /^(?:riferimento|verbale|n\.)\s*[:\-–]\s*(.+)$/i },
];

function firstSentence(text: string, max = 280): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/^(.+?[.!?])(\s|$)/);
  const sentence = match ? match[1] : cleaned;
  return sentence.length > max ? `${sentence.slice(0, max).trim()}…` : sentence;
}

function extractQuotes(text: string): Omit<VerbatimQuote, 'id'>[] {
  const quotes: Omit<VerbatimQuote, 'id'>[] = [];
  const re = /[«"]([^«»"]{20,280})[»"]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) && quotes.length < 3) {
    quotes.push({ quote: match[1].trim() });
  }
  return quotes;
}

function findQuestion(lines: string[], full: string): string {
  const labeled = lines.find((l) => l.includes('?'));
  if (labeled && labeled.length > 20) return labeled.replace(/^[-*•]\s*/, '');
  const fromFull = full.match(/([A-ZÀ-Ú][^?]{18,180}\?)/);
  return fromFull ? fromFull[1].trim() : '';
}

function findDecision(lines: string[]): string {
  const cue =
    /decidiamo|abbiamo scelto|abbiamo deciso|approviamo|non (?:andiamo|facciamo|accettiamo|apriamo)|congeliamo|vietiamo|autorizziamo/i;
  const hit = lines.find((l) => cue.test(l) && l.length > 24);
  return hit ? firstSentence(hit) : '';
}

function findDiscarded(lines: string[]): { title: string; reason: string } {
  const cue = /scart|invece di|non (?:facciamo|andiamo|apriamo|accettiamo)|alternativa/i;
  const hit = lines.find((l) => cue.test(l) && l.length > 20);
  if (!hit) return { title: '', reason: '' };
  const titleMatch = hit.match(/(?:invece di|scartiamo|non (?:facciamo|andiamo|apriamo))\s+([^.,;]{8,80})/i);
  return {
    title: titleMatch ? titleMatch[1].trim() : firstSentence(hit, 80),
    reason: firstSentence(hit),
  };
}

function findMindChanging(lines: string[]): string {
  const cue = /\bse\b.+(entro|super|oltre|due trimestri|reclami|turnover|saturazione|audit)/i;
  const hit = lines.find((l) => cue.test(l));
  return hit ? firstSentence(hit) : '';
}

/**
 * Bozza rule-based da transcript o nota. Non è un modello: estrae etichette
 * esplicite e, in assenza, indizi linguistici. I campi vuoti restano da compilare.
 */
export function draftFromSource(
  rawText: string,
  options: { sourceTitle?: string; sourceRef?: string } = {}
): CaptureDraft {
  const text = rawText.replace(/\r\n/g, '\n').trim();
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const draft: CaptureDraft = {
    actTitle: options.sourceTitle?.trim() || '',
    actNumber: options.sourceRef?.trim() || '',
    realQuestion: '',
    decision: '',
    discardedTitle: '',
    discardedReason: '',
    mindChanging: '',
    interpretativeSummary: '',
    uncertaintyLevel: 'medio',
    verbatimQuotes: extractQuotes(text),
    missing: [],
  };

  for (const line of lines) {
    for (const { key, re } of LABEL_PATTERNS) {
      const m = line.match(re);
      if (m?.[1] && !draft[key]) {
        draft[key] = m[1].trim();
      }
    }
  }

  if (!draft.realQuestion) draft.realQuestion = findQuestion(lines, text);
  if (!draft.decision) draft.decision = findDecision(lines);
  if (!draft.discardedTitle || !draft.discardedReason) {
    const discarded = findDiscarded(lines);
    if (!draft.discardedTitle) draft.discardedTitle = discarded.title;
    if (!draft.discardedReason) draft.discardedReason = discarded.reason;
  }
  if (!draft.mindChanging) draft.mindChanging = findMindChanging(lines);

  if (!draft.actTitle) {
    draft.actTitle = options.sourceTitle?.trim() || firstSentence(lines[0] ?? 'Nota di seduta', 90);
  }
  if (!draft.actNumber) {
    const ref = text.match(/(verbale|nota|delibera|meeting)\s+[^\n,]{3,40}/i);
    draft.actNumber = options.sourceRef?.trim() || ref?.[0] || 'Nota di seduta';
  }

  if (draft.realQuestion && draft.decision) {
    draft.interpretativeSummary = `Dalla fonte: si rispondeva a «${firstSentence(draft.realQuestion, 120)}». Scelta: ${firstSentence(draft.decision, 160)}`;
  }

  if (!draft.realQuestion) draft.missing.push('domanda reale');
  if (!draft.decision) draft.missing.push('decisione');
  if (!draft.discardedTitle) draft.missing.push('opzione scartata');
  if (!draft.mindChanging) draft.missing.push('condizione di cambio idea');

  return draft;
}

export const SAMPLE_AI_GOVERNANCE_TRANSCRIPT = `TITOLO: Comitato rischio — fornitore di modelli linguistici in Risorse umane
RIFERIMENTO: Verbale Rischio n. 4/2026
DOMANDA REALE: Lasciamo che le Risorse umane usino un modello linguistico pubblico sui curriculum, o teniamo i dati dei candidati in un ambiente cloud dedicato verificabile?
DECISIONE: Vietiamo i modelli destinati al pubblico sui dati dei candidati. Selezione assistita solo su Azure OpenAI nell'ambiente dedicato, con registro degli accessi e conservazione 90 giorni.
OPZIONE SCARTATA: Copilot (versione pubblica) con avviso "non incollare dati personali"
MOTIVO: L'avviso non è un controllo. Un collaudo interno ha già mostrato curriculum incollati in chat.
CAMBIO IDEA: Tre reclami al Garante o una fuga di curriculum attribuibile al modello entro 12 mesi — allora si sospende la selezione assistita.
Risorse umane: "Se aspettiamo la regola interna perfetta, il team continua a usare ChatGPT di nascosto."
Responsabile protezione dati: "Non è un tema di produttività. È un trattamento di dati di terzi senza base giuridica e senza registro."
`;
