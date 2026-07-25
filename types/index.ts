// Definizione del dominio dati per "Reasoning Records" - Memoria del Giudizio Amministrativo e Decisionale

export interface User {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

// Categoria di ambito decisionale pubblico
export type EntityType = 'comune' | 'regione' | 'ente_regolatorio' | 'azienda_pubblica';

export interface PublicEntity {
  id: string;
  name: string; // es. "Comune di Cormano"
  type: EntityType;
  location?: string;
  region?: string;    // es. "Lombardia"
  province?: string;  // es. "MI"
  city?: string;      // es. "Cormano"
}

// L'atto pubblico originale (Delibera, Determinazione, Verbale di Consiglio)
export interface PublicAct {
  id: string;
  title: string; // Titolo formale burocratico dell'atto
  actNumber: string; // es. "Delibera C.C. n. 45/2024"
  entity: PublicEntity;
  date: Date;
  officialUrl?: string; // Link al PDF dell'Albo Pretorio
  rawTextExcerpt?: string; // Estratto significativo del testo burocratico grezzo
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  recordsCount?: number;
}

// Opzione presa in considerazione durante la decisione ma poi scartata
export interface DiscardedOption {
  id: string;
  title: string; // Descrizione sintetica dell'opzione scartata
  reasonDiscarded: string; // Spiegazione formale o dedotta del perché è stata scartata
  evidenceType: 'verbatim' | 'interpretation'; // Se presente nel verbale o desunta
}

// Estratto diretto letterale per garantire la tracciabilità della fonte
export interface VerbatimQuote {
  id: string;
  quote: string; // Testo esatto citato dall'atto
  pageOrParagraph?: string; // Riferimento (es. "Pag. 4, par. 2")
  speaker?: string; // Chi ha espresso la frase (es. "Assessore alla Mobilità")
}

// Ciclo di verifica a posteriori (Outcome Review)
export interface OutcomeReview {
  id: string;
  timeframe: '6_mesi' | '12_mesi' | '24_mesi' | 'lungo_termine';
  expectedOutcome: string; // Cosa ci si aspettava che accadesse
  actualOutcome?: string; // Cosa si è verificato effettivamente a posteriori
  status: 'pending' | 'verified_true' | 'verified_false' | 'inconclusive';
  reviewDate?: Date;
  notes?: string;
}

// Il cuore della piattaforma: Il Reasoning Record
export interface ReasoningRecord {
  id: string;
  publicActId: string;
  publicAct?: PublicAct;
  compiler: User; // Utente o curatore che ha ricostruito il record
  version: number;
  status: 'draft' | 'published' | 'under_review';

  // 1. La domanda reale
  realQuestion: string; // La domanda sostanziale (non burocratica) a cui si rispondeva

  // 2. Le opzioni scartate e perché
  discardedOptions: DiscardedOption[];

  // 3. La decisione presa
  decision: string;

  // 4. Incertezza dichiarata & assunzioni
  uncertaintyLevel: 'basso' | 'medio' | 'alto';
  uncertaintyExplanation: string; // Su cosa c'era incertezza (es. impatto sui ricavi dei negoziari)

  // 5. Condizione di Falsificabilità (Cosa avrebbe fatto cambiare idea)
  mindChangingConditions: string[]; // Requisito fondamentale: punti specifici che avrebbero invertito la scelta

  // Distinzione rigorosa fonte
  verbatimQuotes: VerbatimQuote[];
  interpretativeSummary: string; // Ricostruzione sintetica interpretativa del compilatore

  // Verifica a posteriori
  outcomeReviews: OutcomeReview[];

  // Categoria tematica (es. "Mobilità", "Urbanistica", "Bilancio", "Ambiente")
  category?: string;

  // Apprezzamento civico / Upvote
  upvotes?: number;

  createdAt: Date;
  updatedAt: Date;
}
