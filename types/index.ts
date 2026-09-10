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
  /**
   * Se false, la community è nascosta agli utenti normali (bozza / interna).
   * Platform admin e owner/admin la vedono comunque. Default: true.
   */
  isVisible?: boolean;
  categories: CommunityCategory[];
  stats: CommunityStat[];
}

/** Ruolo nella organization (workspace parent). */
export type OrganizationRole =
  | 'owner'
  | 'admin'
  | 'compiler'
  | 'sponsor'
  | 'viewer'
  | 'filosofo'
  | 'consulente';

export interface OrganizationMember {
  userId: string;
  email?: string;
  name?: string;
  role: OrganizationRole;
  addedAt: string;
}

/**
 * Tenant. Le community (workspace) stanno sotto. Persistenza Fase B: curator-store.
 * Prisma allineato quando i record lasciano il JSON.
 */
export interface Organization {
  id: string;
  slug: string;
  name: string;
  communityIds: string[];
  members: OrganizationMember[];
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

/** Quanto eravamo sicuri alla chiusura (1 = poco, 5 = molto). Serve alla calibrazione nel tempo. */
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

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

/** Workflow della scheda. `published` è l’alias legacy di `closed`. */
export type RecordStatus =
  | 'draft'
  | 'in_session'
  | 'pending_sponsor'
  | 'closed'
  | 'published'
  | 'under_review';

export type RecordVisibility = 'private' | 'public';

export type CompliancePack = 'ai_governance' | 'board' | 'capex';

/** Spunti di lettura sulla scheda: filosofi, consulenti, alert, domande. */
export type DecisionInsightKind = 'spunto' | 'alert' | 'domanda' | 'consulenza';

export interface DecisionInsight {
  id: string;
  kind: DecisionInsightKind;
  title: string;
  body: string;
  author?: string;
  role?: string;
  /** Collegamento opzionale a uno step del grafo (question, decision, stop, discarded-…). */
  relatedStepId?: string;
  /** Richiesta di consultazione a cui risponde (se presente). */
  consultationRequestId?: string;
  authorUserId?: string;
  createdAt?: string;
}

export type ConsultationKind = 'filosofica' | 'consulenza';

export type ConsultationRequestStatus = 'aperta' | 'in_corso' | 'chiusa';

export interface ConsultationRequester {
  userId: string;
  name?: string;
  email?: string;
}

/** Richiesta di spunti da filosofo o di consulenza operativa su una scheda. */
export interface ConsultationRequest {
  id: string;
  kind: ConsultationKind;
  status: ConsultationRequestStatus;
  question: string;
  requestedBy: ConsultationRequester;
  /** Email o userId del destinatario, se scelto. */
  assigneeUserId?: string;
  assigneeEmail?: string;
  createdAt: string;
  updatedAt?: string;
  responseInsightId?: string;
}

export interface ReasoningRecord {
  id: string;
  publicActId: string;
  publicAct?: PublicAct;
  compiler: User;
  version: number;
  status: RecordStatus;
  /** Default: public per corpus demo; private per nuove schede in workspace enterprise. */
  visibility?: RecordVisibility;
  compliancePack?: CompliancePack;

  realQuestion: string;
  discardedOptions: DiscardedOption[];
  decision: string;
  uncertaintyLevel: 'basso' | 'medio' | 'alto';
  uncertaintyExplanation: string;
  /** Confidenza alla decisione (calibrazione vs esito). */
  confidence?: ConfidenceLevel;
  mindChangingConditions: string[];
  verbatimQuotes: VerbatimQuote[];
  interpretativeSummary: string;
  outcomeReviews: OutcomeReview[];
  aiAssistance?: AiAssistance;
  /** Feedback curati (filosofi, consulenti); se assenti la UI può derivarne di contestuali. */
  insights?: DecisionInsight[];
  /** Richieste di consultazione aperte dagli utenti sulla scheda. */
  consultationRequests?: ConsultationRequest[];
  category?: string;
  upvotes?: number;
  createdAt: Date;
  updatedAt: Date;
}
