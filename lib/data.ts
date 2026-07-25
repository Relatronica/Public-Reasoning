import { PublicAct, ReasoningRecord, User } from '@/types';

export const mockCompilers: User[] = [
  {
    id: 'compiler-1',
    username: 'osservatorio_cormano',
    name: 'Marco Rossi (Osservatorio Civico Cormano)',
    bio: 'Analista indipendente delle deliberazioni del Consiglio Comunale di Cormano',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'compiler-2',
    username: 'trasparenza_lombardia',
    name: 'Elena Bianchi',
    bio: 'Ricercatrice in politiche pubbliche urbane e mobilità sostenibile',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date('2024-01-20'),
  },
];

export const mockPublicActs: PublicAct[] = [
  {
    id: 'act-cormano-1',
    title: 'Riorganizzazione del Piano Urbano del Traffico e Modifica dei Sensi Unici nel Quartiere Fornasette',
    actNumber: 'Delibera C.C. n. 28/2024',
    entity: {
      id: 'comune-cormano',
      name: 'Comune di Cormano',
      type: 'comune',
      location: 'Cormano (MI)',
      region: 'Lombardia',
      province: 'MI',
      city: 'Cormano',
    },
    date: new Date('2024-03-18'),
    officialUrl: 'https://comune.cormano.mi.it/albo/delibere/2024-28.pdf',
    rawTextExcerpt: `IL CONSIGLIO COMUNALE DI CORMANO
VISTO il Piano Urbano del Traffico approvato con Delibera n. 12/2021;
CONSIDERATE le criticità di scorrimento veicolare e congestione nell'intersezione tra Via Gramsci e Via Bizzozero nelle ore di punta scolastiche;
VALUTATO il report dell'Ufficio Tecnico sulla sicurezza pedonale nell'area limitrofa al Parco dell'Acqua;
DELIBERA
1. Di istituire il senso unico di marcia in Via Bizzozero con direzione nord-sud a partire dal 15 Maggio 2024;
2. Di realizzare una nuova pista ciclabile protetta di collegamento con la stazione FNM di Cormano-Cusano Milanino...`,
    slug: 'viabilita-fornasette-cormano-2024',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
    recordsCount: 1,
  },
  {
    id: 'act-cormano-2',
    title: 'Approvazione Variante al PGT per la Riqualificazione dell’Ex Area Industriale di Via Molinazzo',
    actNumber: 'Delibera C.C. n. 42/2024',
    entity: {
      id: 'comune-cormano',
      name: 'Comune di Cormano',
      type: 'comune',
      location: 'Cormano (MI)',
      region: 'Lombardia',
      province: 'MI',
      city: 'Cormano',
    },
    date: new Date('2024-05-10'),
    officialUrl: 'https://comune.cormano.mi.it/albo/delibere/2024-42.pdf',
    rawTextExcerpt: `CONSIDERATA la necessità di recuperare l'area dismessa ex-manifatturiera garantendo una quota di Edilizia Residenziale Sociale (ERS) non inferiore al 30%...`,
    slug: 'variante-pgt-molinazzo-cormano-2024',
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-05-12'),
    recordsCount: 1,
  },
  {
    id: 'act-cormano-3',
    title: 'Bando di Concessione Gestione Impianti Sportivi Comunali Via dei Partigiani',
    actNumber: 'Determinazione Dirigenziale n. 89/2024',
    entity: {
      id: 'comune-cormano',
      name: 'Comune di Cormano',
      type: 'comune',
      location: 'Cormano (MI)',
      region: 'Lombardia',
      province: 'MI',
      city: 'Cormano',
    },
    date: new Date('2024-06-02'),
    officialUrl: 'https://comune.cormano.mi.it/albo/determini/2024-89.pdf',
    rawTextExcerpt: `DETERMINA l'affidamento quinquennale della gestione dei campi da tennis e calcetto con vincolo di tariffe agevolate per le associazioni sportive dilettantistiche locali...`,
    slug: 'gestione-impianti-sportivi-cormano-2024',
    createdAt: new Date('2024-06-03'),
    updatedAt: new Date('2024-06-03'),
    recordsCount: 1,
  }
];

export const mockReasoningRecords: ReasoningRecord[] = [
  {
    id: 'record-cormano-1',
    publicActId: 'act-cormano-1',
    publicAct: mockPublicActs[0],
    compiler: mockCompilers[0],
    version: 1,
    status: 'published',
    category: 'Mobilità & Viabilità',
    upvotes: 42,

    // 1. La Domanda Reale
    realQuestion: 'Come fluidificare il traffico attorno al nodo di Via Bizzozero ed evitare code sulla Milano-Meda senza eliminare i parcheggi per i residenti del quartiere Fornasette?',

    // 2. Opzioni Scartate
    discardedOptions: [
      {
        id: 'opt-c1',
        title: 'Realizzazione di una rotonda sormontabile all’incrocio Gramsci/Bizzozero',
        reasonDiscarded: 'Scartata dall\'Ufficio Tecnico per carenza di spazio di calibro stradale sufficiente al raggio di curvatura dei pullman di linea Autoguidovie.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-c2',
        title: 'Chiusura totale di Via Bizzozero negli orari d’ingresso e uscita dalle scuole (07:45-08:30 e 16:00-16:45)',
        reasonDiscarded: 'Scartata per l’impossibilità della Polizia Locale di garantire 4 agenti fisicamente presenti ogni giorno sul varco.',
        evidenceType: 'interpretation',
      },
      {
        id: 'opt-c3',
        title: 'Divieto di sosta permanente su entrambi i lati di Via Bizzozero',
        reasonDiscarded: 'Scartata a seguito dell’Assemblea di Quartiere dove i residenti hanno evidenziato la perdita di oltre 35 stalli auto non rimpiazzabili.',
        evidenceType: 'verbatim',
      }
    ],

    // 3. La Decisione Presa
    decision: 'Istituzione del senso unico unico nord-sud su Via Bizzozero con mantenimento della sosta su un solo lato e contestuale realizzazione di ciclabile protetta verso la stazione FNM.',

    // 4. Incertezza Dichiarata
    uncertaintyLevel: 'medio',
    uncertaintyExplanation: 'Persiste incertezza sull’eventuale sovraccarico di traffico derivato che si riverserà su Via Gramsci nelle ore di punta serali (17:30 - 19:00).',

    // 5. Condizioni di Falsificabilità
    mindChangingConditions: [
      'Se i tempi d’attesa all’immissione sulla SP35 (Milano-Meda) aumenteranno di oltre +5 minuti al monitoraggio del 3° mese.',
      'Se il tasso di incidentalità lungo Via Gramsci non registrerà un calo del 20% nei primi 6 mesi.'
    ],

    // Citazioni Dirette
    verbatimQuotes: [
      {
        id: 'quote-c1',
        quote: 'La priorità era mettere in sicurezza l’itinerario casa-scuola ed evitare che il quartiere Fornasette venisse usato come scorciatoia per evitare il semaforo della Milano-Meda.',
        pageOrParagraph: 'Pag. 4, Verbale C.C. n. 28',
        speaker: 'Assessore alla Viabilità'
      }
    ],

    // Ricostruzione Interpretativa
    interpretativeSummary: `L'atto rappresenta il punto d'incontro tra le esigenze di sicurezza dei pedoni diretti al Parco dell'Acqua e l'esigenza dei residenti di non perdere posti auto. La scelta del senso unico è un compromesso tecnico per ricavare la corsia ciclabile senza espropri o cantieri invasivi.`,

    // Verifica a Posteriori
    outcomeReviews: [
      {
        id: 'outcome-c1',
        timeframe: '6_mesi',
        expectedOutcome: 'Calo stimato del traffico parassita di attraversamento del 25% e incremento uso ciclabile verso la stazione.',
        actualOutcome: 'Rilevato calo del traffico di attraversamento del 28%. Aumentata dell\'18% l\'affluenza sulla ciclabile.',
        status: 'verified_true',
        reviewDate: new Date('2024-09-20'),
        notes: 'Verifica completata favorevolmente.'
      }
    ],

    createdAt: new Date('2024-03-21'),
    updatedAt: new Date('2024-09-20'),
  },

  {
    id: 'record-cormano-2',
    publicActId: 'act-cormano-2',
    publicAct: mockPublicActs[1],
    compiler: mockCompilers[1],
    version: 1,
    status: 'published',
    category: 'Urbanistica & Territorio',
    upvotes: 29,

    // 1. La Domanda Reale
    realQuestion: 'Come sbloccare la rigenerazione urbana dell’ex area industriale Molinazzo abbandonata da 15 anni senza sovraccaricare la densità abitativa del centro storico?',

    // 2. Opzioni Scartate
    discardedOptions: [
      {
        id: 'opt-c4',
        title: 'Destinazione 100% commerciale per centro vendite di media struttura',
        reasonDiscarded: 'Scartata per l’impatto devastante stimato sui piccoli negozi di vicinato del centro di Cormano e Brusuglio.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-c5',
        title: 'Acquisto dell’area da parte del Comune per trasformazione intera in parco pubblico',
        reasonDiscarded: 'Scartata per insostenibilità finanziaria del costo di bonifica ambientale del suolo (stimato in 2.4 milioni di €).',
        evidenceType: 'interpretation',
      }
    ],

    // 3. La Decisione Presa
    decision: 'Approvazione variante PGT ad uso misto: 40% verde pubblico ceduto al Comune con bonifica a carico del privato, 30% Residenziale Sociale (ERS) e 30% Residenziale Libero a media densità.',

    // 4. Incertezza Dichiarata
    uncertaintyLevel: 'alto',
    uncertaintyExplanation: 'Incertezza legata all’effettivo rispetto dei tempi di bonifica del terreno da parte dell’operatore privato prescelto.',

    // 5. Condizioni di Falsificabilità
    mindChangingConditions: [
      'Ritardo superiore ai 12 mesi nell’avvio dei lavori di bonifica.',
      'Aumento del costo di vendita ERS oltre la soglia concordata di 2.100 €/mq.'
    ],

    verbatimQuotes: [
      {
        id: 'quote-c2',
        quote: 'Senza l’intervento del privato la bonifica del sito sarebbe rimasta bloccata per un altro decennio con rischi ambientali per le falde sotterranee.',
        pageOrParagraph: 'Pag. 8, Parere Commissione Urbanistica',
        speaker: 'Responsabile Settore Territorio'
      }
    ],

    interpretativeSummary: `Decisione fondamentale per il quartiere. L'amministrazione ha accettato un aumento della quota residenziale in cambio dell'accollo totale dei costi di bonifica da parte del privato e della realizzazione del parco pubblico.`,

    outcomeReviews: [
      {
        id: 'outcome-c2',
        timeframe: '12_mesi',
        expectedOutcome: 'Completamento della fase 1 di bonifica e presentazione dei progetti esecutivi ERS.',
        actualOutcome: undefined,
        status: 'pending',
        notes: 'Monitoraggio in corso.'
      }
    ],

    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-05-15'),
  }
];
