import {
  AiAssistance,
  AiAssistanceScope,
  AiDataExposure,
  AiSupportLevel,
} from '@/types';

export const AI_LEVEL_LABELS: Record<AiSupportLevel, string> = {
  none: 'Nessuno',
  assistivo: 'IA assistiva',
  sostanziale: 'IA sostanziale',
};

export const AI_SCOPE_LABELS: Record<AiAssistanceScope, string> = {
  transcription: 'Trascrizione',
  drafting: 'Bozza di testo',
  options_analysis: 'Analisi opzioni',
  summary: 'Sintesi',
  research: 'Ricerca / raccolta',
  other: 'Altro',
};

export const AI_EXPOSURE_LABELS: Record<AiDataExposure, string> = {
  none: 'Nessun dato inserito',
  internal_only: 'Solo testo interno',
  client_data: 'Dati cliente (policy applicabile)',
};

export const AI_SCOPE_OPTIONS = Object.entries(AI_SCOPE_LABELS) as [AiAssistanceScope, string][];

export function hasAiAssistance(ai?: AiAssistance): boolean {
  return Boolean(ai && ai.level !== 'none');
}

export const DEFAULT_AI_ASSISTANCE: AiAssistance = {
  level: 'none',
  scopes: [],
  tools: '',
  dataExposure: 'none',
  note: '',
};
