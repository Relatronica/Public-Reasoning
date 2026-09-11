import { PublicAct, ReasoningRecord, User } from '@/types';
import { communities } from '@/lib/communities';

const agora = communities.find((c) => c.slug === 'agora')!;

export const agoraCompiler: User = {
  id: 'compiler-agora',
  username: 'cura_agora',
  name: 'Elena Conti',
  bio: 'Curatrice del registro Agorà. Documenta il giudizio pubblico con filosofi e consulenti.',
  createdAt: new Date('2025-06-01'),
};

/** Community vetrina: mostra grafo, fonti, spunti e consultazioni. */
export const agoraActs: PublicAct[] = [
  {
    id: 'act-agora-piazza-2026',
    title: 'Pedonalizzazione temporanea di Piazza delle Erbe — sperimentazione 90 giorni',
    actNumber: 'Delibera Laboratorio n. 3/2026',
    entity: agora,
    date: new Date('2026-03-04'),
    rawTextExcerpt: `IL COMITATO DI LABORATORIO
PRESO ATTO delle petition dei residenti e dei commercianti sul traffico in Piazza delle Erbe;
ESAMINATE tre opzioni: chiusura totale, corsia mista, status quo con più controlli;
DECIDE di avviare una pedonalizzazione temporanea di 90 giorni con monitoraggio settimanale di accessibilità e fatturato.`,
    slug: 'agora-piazza-erbe-2026',
    createdAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-03-05'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Scheda dimostrativa Agorà. Non è un atto reale.',
  },
  {
    id: 'act-agora-chatbot-2026',
    title: 'Assistente digitale per l’URP: modello interno, niente chatbot pubblici sui fascicoli',
    actNumber: 'Nota Digitale n. 7/2026',
    entity: agora,
    date: new Date('2026-04-16'),
    rawTextExcerpt: `IL COMITATO DIGITALE
VALUTATA la proposta di un chatbot pubblico per smaltire le code all’URP;
RITENUTO alto il rischio su dati anagrafici e fascicoli;
DECIDE di autorizzare solo un assistente su ambiente dedicato, con escalation umana obbligatoria oltre la FAQ.`,
    slug: 'agora-urp-assistente-2026',
    createdAt: new Date('2026-04-17'),
    updatedAt: new Date('2026-04-17'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Scheda dimostrativa Agorà. Non è un verbale reale.',
  },
  {
    id: 'act-agora-budget-2026',
    title: 'Bilancio partecipativo 2026: 180 k€ su tre priorità di quartiere, non su un unico grande progetto',
    actNumber: 'Seduta Assemblea n. 2/2026',
    entity: agora,
    date: new Date('2026-05-22'),
    rawTextExcerpt: `L’ASSEMBLEA DI QUARTIERE
ESAMINATE le proposte: un unico parco giochi da 180 k€, oppure tre interventi (illuminazione, marciapiedi, orti);
RITENUTO che un solo progetto concentrerebbe i benefici su un’area;
DECIDE di ripartire il fondo in tre linee, con criterio di stop se una linea non parte entro settembre.`,
    slug: 'agora-budget-partecipativo-2026',
    createdAt: new Date('2026-05-23'),
    updatedAt: new Date('2026-05-23'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Scheda dimostrativa Agorà. Non è un verbale reale.',
  },
];

export const agoraRecords: ReasoningRecord[] = [
  {
    id: 'record-agora-piazza-2026',
    publicActId: 'act-agora-piazza-2026',
    publicAct: agoraActs[0],
    compiler: agoraCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    category: 'Spazio pubblico',
    upvotes: 42,
    realQuestion:
      'Chi ha diritto di usare Piazza delle Erbe nelle ore di punta: chi ci abita e lavora, o chi la attraversa in auto per risparmiare tre minuti?',
    discardedOptions: [
      {
        id: 'opt-agora-piazza-1',
        title: 'Lasciare lo status quo e aumentare i controlli di velocità',
        reasonDiscarded:
          'Scartata: i controlli non riducono il volume di attraversamento e non restituiscono spazio ai pedoni.',
        evidenceType: 'interpretation',
      },
      {
        id: 'opt-agora-piazza-2',
        title: 'Chiusura permanente senza fase pilota',
        reasonDiscarded:
          'Scartata dai commercianti e dalla protezione civile: serve una prova misurabile prima di rendere irreversibile.',
        evidenceType: 'verbatim',
      },
    ],
    decision:
      'Pedonalizzazione temporanea di 90 giorni, accesso consentito a residenti e mezzi di emergenza, monitoraggio settimanale di accessibilità e scontrini medi.',
    uncertaintyLevel: 'medio',
    uncertaintyExplanation:
      'Non sappiamo se il calo di fatturato temuto dai negozi si materializzi; il pilota serve a misurarlo, non a indovinarlo.',
    confidence: 3,
    mindChangingConditions: [
      'Se il fatturato medio dei negozi sul lato ovest scende oltre il 12% per tre settimane consecutive.',
      'Se i tempi di intervento del 118 sulla piazza superano la media cittadina di oltre 90 secondi.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-agora-piazza-1',
        quote:
          'Non stiamo chiudendo la piazza alle auto: stiamo aprendo la piazza a chi ci vive. Il pilota è il modo onesto di dirlo.',
        pageOrParagraph: 'Delibera Laboratorio n. 3/2026, p. 4',
        speaker: 'Presidente del Comitato',
      },
      {
        id: 'quote-agora-piazza-2',
        quote:
          'Senza numeri a 90 giorni questa resta una preferenza estetica. Con i numeri diventa una decisione.',
        pageOrParagraph: 'Allegato monitoraggio',
        speaker: 'Referente commercio',
      },
    ],
    interpretativeSummary:
      'La domanda formale era «come gestire il traffico». La domanda reale è di giustizia spaziale: chi conta come utente legittimo della piazza. Il pilota di 90 giorni è il criterio di falsificabilità: non un compromesso debole, ma un modo per non trasformare un’opinione in dogma.',
    outcomeReviews: [
      {
        id: 'outcome-agora-piazza-1',
        timeframe: '6_mesi',
        expectedOutcome:
          'Pedonalizzazione confermata o corretta con dati di fatturato e tempi di emergenza pubblicati.',
        status: 'pending',
      },
    ],
    insights: [
      {
        id: 'insight-agora-piazza-1',
        kind: 'spunto',
        title: 'Lo spazio è già una decisione',
        body: 'Ogni metro di asfalto assegna già un diritto. La pedonalizzazione non «toglie» qualcosa di neutro: rende visibile chi finora era invisibile nel disegno della piazza.',
        author: 'Iris Marion Young',
        role: 'Filosofa',
        relatedStepId: 'question',
        createdAt: '2026-03-06T10:00:00.000Z',
      },
      {
        id: 'insight-agora-piazza-2',
        kind: 'consulenza',
        title: 'Misura il lato ovest, non la media',
        body: 'La media di piazza nasconde i negozi esposti. Se il criterio di stop non è disaggregato per fronte strada, rischiate di chiudere il pilota troppo tardi o troppo presto.',
        author: 'Marco Bellini',
        role: 'Consulente',
        relatedStepId: 'stop',
        createdAt: '2026-03-07T09:00:00.000Z',
      },
      {
        id: 'insight-agora-piazza-3',
        kind: 'domanda',
        title: 'Cosa conterebbe come fallimento onesto?',
        body: 'Se dopo 90 giorni i numeri sono ambigui, chi ha l’autorità di decidere? Meglio dichiararlo ora che inventarlo sotto pressione.',
        author: 'Elena Conti',
        role: 'Curatrice',
        relatedStepId: 'decision',
        createdAt: '2026-03-08T11:00:00.000Z',
      },
    ],
    consultationRequests: [
      {
        id: 'consult-agora-piazza-open',
        kind: 'filosofica',
        status: 'aperta',
        question:
          'Stiamo davvero bilanciando interessi, o stiamo solo spostando il potere da chi guida a chi abita senza nominare i perdenti del pilota?',
        requestedBy: {
          userId: 'user-demo-residente',
          name: 'Giulia Ferri',
          email: 'giulia.ferri@example.com',
        },
        createdAt: '2026-03-09T14:00:00.000Z',
      },
      {
        id: 'consult-agora-piazza-closed',
        kind: 'consulenza',
        status: 'chiusa',
        question:
          'Il criterio sul 118 è realistico con i dati che abbiamo oggi, o rischia di essere non osservabile?',
        requestedBy: {
          userId: 'user-demo-commercio',
          name: 'Associazione Negozi Centro',
        },
        createdAt: '2026-03-07T08:00:00.000Z',
        updatedAt: '2026-03-07T09:00:00.000Z',
        responseInsightId: 'insight-agora-piazza-2',
      },
    ],
    createdAt: new Date('2026-03-06'),
    updatedAt: new Date('2026-03-09'),
  },
  {
    id: 'record-agora-chatbot-2026',
    publicActId: 'act-agora-chatbot-2026',
    publicAct: agoraActs[1],
    compiler: agoraCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    category: 'Servizi digitali',
    upvotes: 27,
    realQuestion:
      'Vogliamo ridurre le code all’URP scaricando domande su un modello esterno, o teniamo i fascicoli dei cittadini in un ambiente che possiamo auditare?',
    discardedOptions: [
      {
        id: 'opt-agora-bot-1',
        title: 'Chatbot pubblico (ChatGPT / simili) con disclaimer «non inserire dati personali»',
        reasonDiscarded:
          'Scartata: il disclaimer non è un controllo. Un collaudo ha già mostrato codici fiscali incollati in chat.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-agora-bot-2',
        title: 'Nessun assistente: solo più sportelli umani',
        reasonDiscarded:
          'Scartata per vincolo di organico: non ci sono assunzioni URP nel bilancio 2026.',
        evidenceType: 'interpretation',
      },
    ],
    decision:
      'Assistente solo su ambiente cloud dedicato, limitato alle FAQ certificate; oltre quella soglia escalation umana obbligatoria e registro delle conversazioni 60 giorni.',
    uncertaintyLevel: 'alto',
    uncertaintyExplanation:
      'Il rischio maggiore è l’aggiramento da casa o da dispositivi personali, non il modello in sé.',
    confidence: 4,
    mindChangingConditions: [
      'Un incidente su dati anagrafici attribuibile all’assistente entro 12 mesi: sospensione immediata.',
      'Se oltre il 35% delle sessioni richiede escalation umana per due mesi: si rivede lo scope delle FAQ.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-agora-bot-1',
        quote:
          'Non stiamo scegliendo «se fare innovazione». Stiamo scegliendo dove restano i fascicoli quando qualcuno chiede un certificato.',
        pageOrParagraph: 'Nota Digitale n. 7/2026',
        speaker: 'Responsabile protezione dati',
      },
    ],
    interpretativeSummary:
      'La pressione politica era «abbattere le code». La riformulazione è sulla custodia dei dati. Lo scarto del disclaimer è la prova che Dubitor può rendere verificabile ciò che di solito resta retorica.',
    outcomeReviews: [
      {
        id: 'outcome-agora-bot-1',
        timeframe: '12_mesi',
        expectedOutcome: 'Zero incidenti dati; rate di escalation sotto il 35%; FAQ aggiornate trimestralmente.',
        actualOutcome:
          'A 8 mesi: zero incidenti; escalation al 28%. FAQ aggiornate due volte. Il criterio tiene.',
        status: 'verified_true',
        reviewDate: new Date('2026-12-10'),
        notes: 'Confidenza alta e esito allineato — calibrazione ok.',
      },
    ],
    aiAssistance: {
      level: 'assistivo',
      scopes: ['drafting', 'summary'],
      tools: 'Modello interno su note di seduta (ambiente dedicato)',
      dataExposure: 'internal_only',
      note: 'Bozza della scheda assistita; revisione umana completa prima della chiusura.',
    },
    insights: [
      {
        id: 'insight-agora-bot-1',
        kind: 'alert',
        title: 'Il disclaimer non è un controllo',
        body: 'Se la vostra unica difesa è «abbiamo scritto di non incollare dati», non avete una misura tecnica: avete una speranza.',
        author: 'Dubitor',
        role: 'Sistema',
        relatedStepId: 'discarded-opt-agora-bot-1',
      },
      {
        id: 'insight-agora-bot-2',
        kind: 'consulenza',
        title: 'Escalation come prodotto, non come fallimento',
        body: 'Misurate l’escalation umana come segnale di qualità dello scope, non come KPI da comprimere a ogni costo.',
        author: 'Sara Neri',
        role: 'Consulente',
        relatedStepId: 'stop',
        consultationRequestId: 'consult-agora-bot-closed',
        createdAt: '2026-04-18T16:00:00.000Z',
      },
      {
        id: 'insight-agora-bot-3',
        kind: 'spunto',
        title: 'Velocità ≠ giustizia amministrativa',
        body: 'Uno sportello più veloce che espone fascicoli non è un miglioramento del servizio: è uno spostamento del rischio sui cittadini.',
        author: 'Simone Weil',
        role: 'Filosofa',
        relatedStepId: 'question',
      },
    ],
    consultationRequests: [
      {
        id: 'consult-agora-bot-closed',
        kind: 'consulenza',
        status: 'chiusa',
        question:
          'Come impostiamo il monitoraggio dell’escalation senza trasformarlo in pressione a «chiudere in chat»?',
        requestedBy: {
          userId: 'compiler-agora',
          name: 'Elena Conti',
        },
        createdAt: '2026-04-18T10:00:00.000Z',
        updatedAt: '2026-04-18T16:00:00.000Z',
        responseInsightId: 'insight-agora-bot-2',
      },
      {
        id: 'consult-agora-bot-open',
        kind: 'filosofica',
        status: 'aperta',
        question:
          'Se l’assistente sbaglia una FAQ «certificata», di chi è la responsabilità pubblica: del modello, del compilatore delle FAQ, o dell’ente?',
        requestedBy: {
          userId: 'user-demo-cittadino',
          name: 'Paolo Rossi',
        },
        createdAt: '2026-04-20T12:00:00.000Z',
      },
    ],
    createdAt: new Date('2026-04-18'),
    updatedAt: new Date('2026-04-20'),
  },
  {
    id: 'record-agora-budget-2026',
    publicActId: 'act-agora-budget-2026',
    publicAct: agoraActs[2],
    compiler: agoraCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    category: 'Partecipazione',
    upvotes: 35,
    realQuestion:
      'Il bilancio partecipativo deve concentrare un beneficio visibile su un’area, o distribuire tre interventi minori per non lasciare fuori interi quartieri?',
    discardedOptions: [
      {
        id: 'opt-agora-budget-1',
        title: 'Un unico parco giochi da 180 k€ nel quartiere sud',
        reasonDiscarded:
          'Scartata in assemblea: alta visibilità mediatica, ma beneficio concentrato e percezione di premio a chi grida più forte.',
        evidenceType: 'verbatim',
      },
    ],
    decision:
      'Tre linee da 60 k€: illuminazione percorsi casa-scuola, ripristino marciapiedi, orti di quartiere. Stop se una linea non ha cantiere avviato entro settembre.',
    uncertaintyLevel: 'medio',
    uncertaintyExplanation:
      'Il rischio è la frammentazione: tre progetti piccoli possono fallire per mancanza di ownership.',
    confidence: 2,
    mindChangingConditions: [
      'Se una delle tre linee non ha impegno di spesa entro settembre: i fondi residui vanno in riparto trasparente all’assemblea di ottobre.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-agora-budget-1',
        quote:
          'Un solo nastro da tagliare fa notizia. Tre interventi noiosi fanno città. Scegliamo la città.',
        pageOrParagraph: 'Seduta Assemblea n. 2/2026',
        speaker: 'Facilitatrice assemblea',
      },
    ],
    interpretativeSummary:
      'Il conflitto non è tecnico (parco sì/no): è tra legittimità mediatica e giustizia distributiva. Il criterio di stop a settembre evita che la frammentazione diventi un limbo di micro-progetti eterni.',
    outcomeReviews: [
      {
        id: 'outcome-agora-budget-1',
        timeframe: '6_mesi',
        expectedOutcome: 'Almeno due linee con cantiere avviato; eventuale riparto pubblicato.',
        status: 'pending',
      },
    ],
    insights: [
      {
        id: 'insight-agora-budget-1',
        kind: 'spunto',
        title: 'La partecipazione non è un sondaggio di popolarità',
        body: 'Se vince sempre chi porta più persone in sala, non state decidendo insieme: state misurando la capacità di mobilitazione. I criteri di riparto devono proteggere chi non ha tempo di assembrarsi.',
        author: 'John Dewey',
        role: 'Filosofo',
        relatedStepId: 'question',
      },
      {
        id: 'insight-agora-budget-2',
        kind: 'alert',
        title: 'Tre progetti senza owner = zero progetti',
        body: 'Assegnate un responsabile nominato per ogni linea prima di votare il riparto, altrimenti il criterio di stop a settembre arriverà come una sorpresa.',
        author: 'Desk risk',
        role: 'Consulente',
        relatedStepId: 'decision',
      },
    ],
    consultationRequests: [
      {
        id: 'consult-agora-budget-open',
        kind: 'consulenza',
        status: 'aperta',
        question:
          'Come rendiamo osservabile «cantiere avviato» senza litigare su interpretazioni a settembre?',
        requestedBy: {
          userId: 'user-demo-quartiere',
          name: 'Comitato Nord',
        },
        createdAt: '2026-05-24T09:30:00.000Z',
      },
    ],
    createdAt: new Date('2026-05-24'),
    updatedAt: new Date('2026-05-24'),
  },
];
