import { defaultCommunityMedia } from '@/lib/communities';
import { Community, CommunityType } from '@/types';

const TYPE_LABELS: Record<CommunityType, string> = {
  comune: 'Comune',
  regione: 'Regione',
  ente_regolatorio: 'Ente',
  azienda_pubblica: 'Azienda pubblica',
  azienda: 'Azienda',
  ufficio: 'Ufficio',
  progetto: 'Progetto',
};

export function slugifyCommunityName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || 'WS';
}

export function buildCommunityTemplate(input: {
  name: string;
  type: CommunityType;
  slug?: string;
  shortName?: string;
  subtitle?: string;
}): Community {
  const name = input.name.trim();
  const slug = (input.slug?.trim() || slugifyCommunityName(name) || `workspace-${Date.now()}`).slice(0, 48);
  const typeLabel = TYPE_LABELS[input.type];
  const shortName = input.shortName?.trim() || name.slice(0, 24);
  const isCivic = input.type === 'comune' || input.type === 'regione';

  return {
    id: `community-${slug}`,
    slug,
    name,
    shortName,
    type: input.type,
    typeLabel,
    initials: initialsFromName(shortName),
    subtitle: input.subtitle?.trim() || typeLabel,
    tagline: isCivic
      ? 'Registro del giudizio sulle decisioni: domanda reale, alternative scartate, falsificabilità.'
      : 'Memoria delle decisioni del workspace: domanda reale, alternative scartate, criteri di stop.',
    feedTitle: `Registro del giudizio — ${shortName}`,
    feedSubtitle: 'La domanda reale, le alternative scartate e i criteri di stop.',
    feedBadge: typeLabel,
    sourceLabel: isCivic ? 'Atto' : 'Verbale',
    sourceLabelPlural: isCivic ? 'Atti' : 'Verbali',
    archiveLabel: isCivic ? 'Albo' : 'Archivio',
    archiveNavLabel: isCivic ? 'Atti ufficiali' : 'Archivio',
    sourcePlaceholder: isCivic ? 'es. Delibera n. 12/2026' : 'es. Verbale n. 4/2026',
    newRecordTitle: 'Documenta una decisione',
    newRecordHint: 'Estrai l’architettura decisionale dalla fonte seguendo i pilastri della scheda.',
    searchPlaceholder: 'Cerca decisioni, domande, fonti…',
    officialUrlLabel: 'Registro interno',
    categories: [
      { label: 'Generale', color: 'bg-blue-500' },
      { label: 'Operativo', color: 'bg-emerald-500' },
      { label: 'Rischio', color: 'bg-amber-500' },
    ],
    stats: [
      { label: 'Ambito', value: typeLabel },
      { label: 'Stato', value: 'Attivo' },
    ],
    ...defaultCommunityMedia(slug),
  };
}
