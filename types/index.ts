// Dominio Reasoning Records: feed di giudizio su community configurabili.

export interface User {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

/** Unità tipo subreddit: comune, ufficio, progetto, ente. */
export type CommunityType =
  | 'comune'
  | 'regione'
  | 'ente_regolatorio'
  | 'azienda_pubblica'
  | 'azienda'
  | 'ufficio'
  | 'progetto';

export type EntityType = CommunityType;

export interface CommunityCategory {
  label: string;
  color: string;
}

export interface CommunityStat {
  label: string;
  value: string;
}

/**
 * Pack di configurazione della community.
 * Il kernel (domanda reale, opzioni scartate, falsificabilità) non sta qui.
 */
export interface Community {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  type: CommunityType;
  typeLabel: string;
  initials: string;
  subtitle?: string;
  location?: string;
  region?: string;
  province?: string;
  city?: string;
  tagline: string;
  feedTitle: string;
  feedSubtitle: string;
  feedBadge: string;
  sourceLabel: string;
  sourceLabelPlural: string;
  archiveLabel: string;
  archiveNavLabel: string;
  sourcePlaceholder: string;
  newRecordTitle: string;
  newRecordHint: string;
  searchPlaceholder: string;
  officialUrl?: string;
  officialUrlLabel?: string;
  /** Logo quadrato (es. /communities/weltform/logo.svg). Se assente, si usano le iniziali. */
  logoUrl?: string;
  /** Banner in cima alla sidebar destra (es. /communities/weltform/cover.svg). */
  coverImageUrl?: string;
  categories: CommunityCategory[];
  stats: CommunityStat[];
}

/** Alias: la fonte è agganciata a una community. */
export type PublicEntity = Community;

export type DataStatus = 'verified' | 'demo' | 'unverified';

/** Fonte della decisione (delibera, verbale, deck, nota di seduta). */
export interface PublicAct {
  id: string;
  title: string;
  actNumber: string;
  entity: Community;
  date: Date;
  officialUrl?: string;
  officialPortalUrl?: string;
  rawTextExcerpt?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  recordsCount?: number;
  isVerified: boolean;
  dataStatus: DataStatus;
  verificationNote?: string;
  localPdfPath?: string;
}

export interface DiscardedOption {
  id: string;
  title: string;
  reasonDiscarded: string;
  evidenceType: 'verbatim' | 'interpretation';
}

export interface VerbatimQuote {
  id: string;
  quote: string;
  pageOrParagraph?: string;
  speaker?: string;
}

export interface OutcomeReview {
  id: string;
  timeframe: '6_mesi' | '12_mesi' | '24_mesi' | 'lungo_termine';
  expectedOutcome: string;
  actualOutcome?: string;
  status: 'pending' | 'verified_true' | 'verified_false' | 'inconclusive';
  reviewDate?: Date;
  notes?: string;
}

/** Tracciamento opzionale del supporto IA nella compilazione del giudizio. */
export type AiSupportLevel = 'none' | 'assistivo' | 'sostanziale';

export type AiDataExposure = 'none' | 'internal_only' | 'client_data';

export type AiAssistanceScope =
  | 'transcription'
  | 'drafting'
  | 'options_analysis'
  | 'summary'
  | 'research'
  | 'other';

export interface AiAssistance {
  level: AiSupportLevel;
  scopes?: AiAssistanceScope[];
  tools?: string;
  dataExposure?: AiDataExposure;
  note?: string;
}

export interface ReasoningRecord {
  id: string;
  publicActId: string;
  publicAct?: PublicAct;
  compiler: User;
  version: number;
  status: 'draft' | 'published' | 'under_review';

  realQuestion: string;
  discardedOptions: DiscardedOption[];
  decision: string;
  uncertaintyLevel: 'basso' | 'medio' | 'alto';
  uncertaintyExplanation: string;
  mindChangingConditions: string[];
  verbatimQuotes: VerbatimQuote[];
  interpretativeSummary: string;
  outcomeReviews: OutcomeReview[];
  aiAssistance?: AiAssistance;
  category?: string;
  upvotes?: number;
  createdAt: Date;
  updatedAt: Date;
}
