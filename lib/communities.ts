import { Community } from '@/types';

export const DEFAULT_COMMUNITY_SLUG = 'cormano';
export const COMMUNITY_PARAM = 'c';

/** Percorsi predefiniti: metti logo.svg e cover.svg in public/communities/{slug}/ */
export function defaultCommunityMedia(slug: string) {
  return {
    logoUrl: `/communities/${slug}/logo.svg`,
    coverImageUrl: `/communities/${slug}/cover.svg`,
  };
}

export const communities: Community[] = [
  {
    id: 'comune-cormano',
    slug: 'cormano',
    name: 'Comune di Cormano',
    shortName: 'Cormano (MI)',
    type: 'comune',
    typeLabel: 'Comune',
    initials: 'CO',
    subtitle: 'Lombardia',
    location: 'Cormano (MI)',
    region: 'Lombardia',
    province: 'MI',
    city: 'Cormano',
    tagline:
      'Ricostruzione del giudizio sulle decisioni amministrative: domanda reale, alternative scartate, falsificabilità.',
    feedTitle: 'Registro del giudizio decisionale',
    feedSubtitle:
      'Oltre l’atto formale: la domanda reale, le opzioni scartate e le assunzioni di rischio.',
    feedBadge: 'Registro civico',
    sourceLabel: 'Atto',
    sourceLabelPlural: 'Atti',
    archiveLabel: 'Albo Pretorio',
    archiveNavLabel: 'Atti ufficiali',
    sourcePlaceholder: 'es. Delibera C.C. n. 45/2024',
    newRecordTitle: 'Ricostruisci una decisione',
    newRecordHint:
      'Estrai l’architettura decisionale da una fonte ufficiale seguendo i pilastri della scheda di giudizio.',
    searchPlaceholder: 'Cerca delibere, domande reali, argomenti…',
    officialUrl: 'https://comune.cormano.mi.it',
    officialUrlLabel: 'Sito del Comune',
    categories: [
      { label: 'Mobilità & Viabilità', color: 'bg-blue-500' },
      { label: 'Urbanistica & Territorio', color: 'bg-emerald-500' },
      { label: 'Bilancio & Finanze', color: 'bg-amber-500' },
      { label: 'Ambiente & Parchi', color: 'bg-teal-500' },
    ],
    stats: [
      { label: 'Abitanti', value: '~20.100' },
      { label: 'Ambito', value: 'Civico' },
    ],
    ...defaultCommunityMedia('cormano'),
  },
  {
    id: 'ufficio-people-moretti',
    slug: 'people-moretti',
    name: 'Ufficio People',
    shortName: 'People',
    type: 'ufficio',
    typeLabel: 'Ufficio',
    initials: 'PE',
    subtitle: 'Officine Moretti S.p.A.',
    location: 'Desio (MB)',
    tagline:
      'Memoria delle decisioni su persone, organico e policy interne. Stesso schema di giudizio, fonti interne.',
    feedTitle: 'Registro del giudizio — People',
    feedSubtitle:
      'Assunzioni, riorganizzazioni e policy: la domanda reale, le alternative e i criteri di stop.',
    feedBadge: 'Ufficio interno',
    sourceLabel: 'Verbale',
    sourceLabelPlural: 'Verbali',
    archiveLabel: 'Fonti interne',
    archiveNavLabel: 'Fonti interne',
    sourcePlaceholder: 'es. Verbale CdA n. 12/2026 — piano organico',
    newRecordTitle: 'Ricostruisci una decisione',
    newRecordHint:
      'Estrai l’architettura decisionale da un verbale o da una nota di seduta dell’ufficio.',
    searchPlaceholder: 'Cerca verbali, domande, policy, hiring…',
    officialUrlLabel: 'Archivio People',
    categories: [
      { label: 'Hiring', color: 'bg-blue-500' },
      { label: 'Policy', color: 'bg-emerald-500' },
      { label: 'Budget ufficio', color: 'bg-amber-500' },
      { label: 'Organizzazione', color: 'bg-teal-500' },
    ],
    stats: [
      { label: 'Organico', value: '84' },
      { label: 'Ambito', value: 'Ufficio' },
    ],
    ...defaultCommunityMedia('people-moretti'),
  },
  {
    id: 'progetto-capex-2027',
    slug: 'capex-2027',
    name: 'Progetto Capex 2027',
    shortName: 'Capex 2027',
    type: 'progetto',
    typeLabel: 'Progetto',
    initials: 'CX',
    subtitle: 'Officine Moretti S.p.A.',
    location: 'Desio (MB)',
    tagline:
      'Decision log del piano investimenti: scala, sito, make-or-buy. Il giudizio resta quando il progetto chiude.',
    feedTitle: 'Registro del giudizio — Capex 2027',
    feedSubtitle:
      'Oltre il deck: domanda strategica, opzioni scartate e condizioni che farebbero cambiare idea.',
    feedBadge: 'Progetto',
    sourceLabel: 'Decision log',
    sourceLabelPlural: 'Materiali',
    archiveLabel: 'Materiali di progetto',
    archiveNavLabel: 'Materiali',
    sourcePlaceholder: 'es. Deck CdA aprile 2026 — opzione B consolidamento',
    newRecordTitle: 'Ricostruisci una decisione',
    newRecordHint:
      'Estrai l’architettura decisionale da un deck, un verbale o una nota di committente.',
    searchPlaceholder: 'Cerca capex, make-or-buy, rischio, sito…',
    officialUrlLabel: 'Cartella progetto',
    categories: [
      { label: 'Scope', color: 'bg-blue-500' },
      { label: 'Make-or-buy', color: 'bg-emerald-500' },
      { label: 'Rischio', color: 'bg-amber-500' },
      { label: 'Sito & capex', color: 'bg-teal-500' },
    ],
    stats: [
      { label: 'Orizzonte', value: '2026–27' },
      { label: 'Ambito', value: 'Progetto' },
    ],
    ...defaultCommunityMedia('capex-2027'),
  },
  {
    id: 'azienda-weltform',
    slug: 'weltform',
    name: 'Weltform',
    shortName: 'Weltform',
    type: 'azienda',
    typeLabel: 'Azienda',
    initials: 'WF',
    subtitle: 'Consulenza strategica · Milano',
    location: 'Milano',
    tagline:
      'Boutique di strategia: mandati, offerta, partnership. Il giudizio resta quando il progetto col cliente chiude.',
    feedTitle: 'Registro del giudizio — Weltform',
    feedSubtitle:
      'Le decisioni sulla pratica: chi accettare, come vendere il giudizio, dove non andare.',
    feedBadge: 'Studio',
    sourceLabel: 'Verbale',
    sourceLabelPlural: 'Verbali',
    archiveLabel: 'Archivio partnership',
    archiveNavLabel: 'Archivio',
    sourcePlaceholder: 'es. Verbale partnership n. 8/2026',
    newRecordTitle: 'Ricostruisci una decisione',
    newRecordHint:
      'Estrai l’architettura decisionale da un verbale di partnership o da una nota di mandato.',
    searchPlaceholder: 'Cerca mandati, offerta, partnership, metodo…',
    officialUrlLabel: 'Archivio interno',
    categories: [
      { label: 'Mandati', color: 'bg-blue-500' },
      { label: 'Offerta', color: 'bg-emerald-500' },
      { label: 'Partnership', color: 'bg-amber-500' },
      { label: 'Metodo', color: 'bg-teal-500' },
      { label: 'Geografie', color: 'bg-violet-500' },
    ],
    stats: [
      { label: 'Sede', value: 'Milano' },
      { label: 'Ambito', value: 'Studio' },
    ],
    ...defaultCommunityMedia('weltform'),
  },
  {
    id: 'pack-ai-governance',
    slug: 'ai-governance',
    name: 'Governance IA',
    shortName: 'Governance IA',
    type: 'ufficio',
    typeLabel: 'Governance',
    initials: 'IA',
    subtitle: 'Pack conformità · Regolamento UE sull’IA',
    location: 'UE',
    tagline:
      'Registro delle decisioni sui sistemi di intelligenza artificiale: domanda reale, alternative scartate e criteri di stop. Traccia verificabile, non comunicato.',
    feedTitle: 'Registro del giudizio — Governance IA',
    feedSubtitle:
      'Risorse umane, credito, fornitori: la domanda reale, le alternative scartate e i criteri di stop.',
    feedBadge: 'Pack IA UE',
    sourceLabel: 'Verbale',
    sourceLabelPlural: 'Verbali',
    archiveLabel: 'Archivio del rischio',
    archiveNavLabel: 'Archivio',
    sourcePlaceholder: 'es. Verbale Rischio n. 4/2026 — fornitore di modelli linguistici',
    newRecordTitle: 'Documenta una decisione sull’IA',
    newRecordHint:
      'Incolla il verbale o la trascrizione: la bozza estrae domanda reale, opzioni scartate e criterio di stop. Lo sponsor approva la chiusura.',
    searchPlaceholder: 'Cerca IA, risorse umane, fornitori, verifiche…',
    officialUrlLabel: 'Registro interno',
    categories: [
      { label: 'IA nelle risorse umane', color: 'bg-blue-500' },
      { label: 'Fornitori e modelli', color: 'bg-emerald-500' },
      { label: 'Prodotti verso i clienti', color: 'bg-amber-500' },
      { label: 'Verifiche', color: 'bg-violet-500' },
    ],
    stats: [
      { label: 'Normativa', value: 'Reg. UE IA' },
      { label: 'Ambito', value: 'Conformità' },
    ],
    ...defaultCommunityMedia('ai-governance'),
  },
  {
    id: 'lab-agora',
    slug: 'agora',
    name: 'Agorà',
    shortName: 'Agorà',
    type: 'progetto',
    typeLabel: 'Laboratorio',
    initials: 'AG',
    subtitle: 'Vetrina del giudizio pubblico',
    location: 'Demo',
    tagline:
      'Spazio dimostrativo: decisioni complete con grafo, fonti, filosofi, consulenti e richieste di consultazione.',
    feedTitle: 'Registro del giudizio — Agorà',
    feedSubtitle:
      'Esplora schede piene: domanda reale, scarti, stop, spunti e consultazioni aperte.',
    feedBadge: 'Vetrina',
    sourceLabel: 'Atto',
    sourceLabelPlural: 'Atti',
    archiveLabel: 'Archivio laboratorio',
    archiveNavLabel: 'Archivio',
    sourcePlaceholder: 'es. Delibera Laboratorio n. 3/2026',
    newRecordTitle: 'Documenta una decisione',
    newRecordHint:
      'Questa community è pensata per mostrare il potenziale di Dubitor: compilazione, grafo e consultazione.',
    searchPlaceholder: 'Cerca piazza, URP, bilancio, spunti…',
    officialUrlLabel: 'Manifesto Agorà',
    categories: [
      { label: 'Spazio pubblico', color: 'bg-blue-500' },
      { label: 'Servizi digitali', color: 'bg-emerald-500' },
      { label: 'Partecipazione', color: 'bg-amber-500' },
      { label: 'Etica pubblica', color: 'bg-teal-500' },
    ],
    stats: [
      { label: 'Schede', value: '3 demo' },
      { label: 'Ambito', value: 'Vetrina' },
    ],
    ...defaultCommunityMedia('agora'),
  },
  {
    id: 'lab-ai-ethics',
    slug: 'ai-ethics',
    name: 'AI Ethics Board',
    shortName: 'AI Ethics',
    type: 'progetto',
    typeLabel: 'Ethics Board',
    initials: 'AE',
    subtitle: 'Demo etica digitale aziendale',
    location: 'Demo enterprise',
    tagline:
      'Registro del giudizio su scelte di AI e digital ethics: cosa abbiamo scartato, perché, e quando ci fermiamo.',
    feedTitle: 'Registro del giudizio — AI Ethics',
    feedSubtitle:
      'Hiring, biometriche, dati di training, human-in-the-loop: schede pronte per una demo board / risk / legal.',
    feedBadge: 'Demo etica',
    sourceLabel: 'Verbale',
    sourceLabelPlural: 'Verbali',
    archiveLabel: 'Archivio Ethics Board',
    archiveNavLabel: 'Archivio',
    sourcePlaceholder: 'es. Verbale Ethics Board n. 4/2026',
    newRecordTitle: 'Documenta una decisione etica',
    newRecordHint:
      'Rendi verificabile lo scarto e il criterio di stop — non solo la policy finale.',
    searchPlaceholder: 'Cerca hiring, biometria, training, HITL…',
    officialUrlLabel: 'Charter Ethics Board',
    categories: [
      { label: 'Trasparenza algoritmica', color: 'bg-blue-500' },
      { label: 'Bias & equità', color: 'bg-emerald-500' },
      { label: 'Consenso & dati', color: 'bg-amber-500' },
      { label: 'Autonomia umana', color: 'bg-teal-500' },
    ],
    stats: [
      { label: 'Schede', value: '4 demo' },
      { label: 'Ambito', value: 'Etica digitale' },
    ],
    ...defaultCommunityMedia('ai-ethics'),
  },
];

export function getCommunityBySlug(slug?: string | null): Community {
  const found = communities.find((c) => c.slug === slug);
  return found ?? communities[0];
}

export function withCommunityQuery(
  pathname: string,
  slug: string,
  extra: Record<string, string | undefined | null> = {}
): string {
  const params = new URLSearchParams();
  params.set(COMMUNITY_PARAM, slug);
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
