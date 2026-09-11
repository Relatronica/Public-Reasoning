import { PublicAct, ReasoningRecord, User } from '@/types';
import { communities } from '@/lib/communities';

const ethics = communities.find((c) => c.slug === 'ai-ethics')!;

export const aiEthicsCompiler: User = {
  id: 'compiler-ai-ethics',
  username: 'ethics_board',
  name: 'Chiara Moretti',
  bio: 'Segretaria dell’Ethics Board. Compila le schede di giudizio su AI e digital ethics con legal, risk e product.',
  createdAt: new Date('2025-11-01'),
};

/**
 * Community demo enterprise: valore di Dubitor su decisioni di AI / digital ethics.
 * Quattro schede chiuse e pubbliche, con scarti, stop, spunti e consultazioni.
 */
export const aiEthicsActs: PublicAct[] = [
  {
    id: 'act-ethics-hiring-2026',
    title: 'Shortlist automatica in recruiting: obbligo di spiegazione al candidato escluso',
    actNumber: 'Verbale Ethics Board n. 2/2026',
    entity: ethics,
    date: new Date('2026-02-12'),
    rawTextExcerpt: `L’ETHICS BOARD
ESAMINATA la proposta HR di usare un modello di ranking sui CV per ridurre il tempo di shortlist;
VALUTATE le opzioni: spiegazione automatica a ogni escluso, solo percorso di ricorso, oppure ranking senza comunicazione;
DECIDE di rendere obbligatoria una motivazione sintetica (criteri dichiarati) per ogni esclusione algoritmica, con ricorso umano entro 10 giorni.`,
    slug: 'ethics-hiring-explainability-2026',
    createdAt: new Date('2026-02-13'),
    updatedAt: new Date('2026-02-13'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Scheda dimostrativa AI Ethics Board. Non è un verbale reale.',
  },
  {
    id: 'act-ethics-emotion-2026',
    title: 'Divieto di emotion scoring biometrico nel customer support',
    actNumber: 'Verbale Ethics Board n. 5/2026',
    entity: ethics,
    date: new Date('2026-03-18'),
    rawTextExcerpt: `L’ETHICS BOARD
VALUTATA la proposta Vendor X di classificare lo «stato emotivo» del cliente in chat video per migliorare il CSAT;
RITENUTO che l’affetto non sia una proprietà misurabile legittima del servizio;
DECIDE di vietare emotion scoring biometrico nei canali di supporto, inclusi piloti «solo interni».`,
    slug: 'ethics-biometric-emotion-ban-2026',
    createdAt: new Date('2026-03-19'),
    updatedAt: new Date('2026-03-19'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Scheda dimostrativa AI Ethics Board. Non è un verbale reale.',
  },
  {
    id: 'act-ethics-training-2026',
    title: 'Niente training su forum pubblici senza base giuridica esplicita',
    actNumber: 'Verbale Ethics Board n. 8/2026',
    entity: ethics,
    date: new Date('2026-04-09'),
    rawTextExcerpt: `L’ETHICS BOARD
ESAMINATA la proposta di fine-tuning su thread pubblici di forum di settore «perché sono già online»;
RITENUTO che la pubblicità di un post non equivalga al consenso al training;
DECIDE di vietare l’uso di corpus scraped da forum senza base giuridica e registro delle fonti, e di usare solo dataset con licenza o opt-in.`,
    slug: 'ethics-training-data-forums-2026',
    createdAt: new Date('2026-04-10'),
    updatedAt: new Date('2026-04-10'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Scheda dimostrativa AI Ethics Board. Non è un verbale reale.',
  },
  {
    id: 'act-ethics-hitl-2026',
    title: 'Copilot per caseworker: human-in-the-loop obbligatorio e non «click-through»',
    actNumber: 'Verbale Ethics Board n. 11/2026',
    entity: ethics,
    date: new Date('2026-05-14'),
    rawTextExcerpt: `L’ETHICS BOARD
VALUTATO il copilot che propone esiti di pratica ai caseworker;
RITENUTO insufficiente un semplice «OK» sul suggerimento del modello;
DECIDE di imporre motivazione umana obbligatoria quando si segue o si discosta dal suggerimento, e audit campionario mensile.`,
    slug: 'ethics-hitl-caseworker-2026',
    createdAt: new Date('2026-05-15'),
    updatedAt: new Date('2026-05-15'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Scheda dimostrativa AI Ethics Board. Non è un verbale reale.',
  },
];

export const aiEthicsRecords: ReasoningRecord[] = [
  {
    id: 'record-ethics-hiring-2026',
    publicActId: 'act-ethics-hiring-2026',
    publicAct: aiEthicsActs[0],
    compiler: aiEthicsCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    category: 'Trasparenza algoritmica',
    upvotes: 34,
    realQuestion:
      'Dobbiamo ai candidati esclusi dal ranking una ragione comprensibile, o basta un ricorso generico «dopo» senza spiegare cosa ha pesato?',
    discardedOptions: [
      {
        id: 'opt-ethics-hire-1',
        title: 'Ranking opaco + solo ricorso formale entro 30 giorni',
        reasonDiscarded:
          'Scartata: il ricorso senza criteri è teatro. Legal ha notato che in audit non sapremmo ricostruire perché due CV simili hanno esiti diversi.',
        evidenceType: 'interpretation',
      },
      {
        id: 'opt-ethics-hire-2',
        title: 'Spiegazione completa del modello (feature importance grezza) a ogni candidato',
        reasonDiscarded:
          'Scartata: espone IP del vendor e confonde; non è «spiegazione» per un candidato, è dump tecnico.',
        evidenceType: 'verbatim',
      },
    ],
    decision:
      'Motivazione sintetica sui criteri dichiarati (esperienza, titoli, keyword di job family) per ogni esclusione algoritmica; ricorso umano entro 10 giorni con revisione del dossier, non solo del punteggio.',
    uncertaintyLevel: 'medio',
    uncertaintyExplanation:
      'Rischio residuo: la sintesi può diventare boilerplate. Mitigazione: campionamento QA mensile sulle motivazioni.',
    confidence: 4,
    mindChangingConditions: [
      'Se oltre il 20% dei ricorsi umani ribalta l’esclusione per due trimestri: si sospende il ranking automatico.',
      'Se un’autorità o un giudice richiede trasparenza oltre la sintesi: si rivede il formato entro 30 giorni.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-ethics-hire-1',
        quote:
          'Se non sappiamo dire a una persona perché è fuori, non stiamo selezionando: stiamo nascondendo un giudizio dietro un numero.',
        pageOrParagraph: 'Verbale Ethics Board n. 2/2026',
        speaker: 'Membro indipendente del Board',
      },
    ],
    interpretativeSummary:
      'La pressione HR era «velocità». La riformulazione è sul debito di spiegazione verso chi viene escluso. Dubitor rende visibile lo scarto del ricorso vuoto.',
    outcomeReviews: [
      {
        id: 'outcome-ethics-hire-1',
        timeframe: '6_mesi',
        expectedOutcome:
          'Motivazioni non boilerplate (>80% campionate come «specifiche»); tempo medio di shortlist −30% vs baseline manuale.',
        actualOutcome:
          'A 5 mesi: shortlist −28%; QA motivazioni all’84%. Due ricorsi ribaltati su 40 — sotto soglia di stop.',
        status: 'verified_true',
        reviewDate: new Date('2026-07-20'),
        notes: 'Criterio di stop non attivato; tenere il campionamento QA.',
      },
    ],
    aiAssistance: {
      level: 'assistivo',
      scopes: ['drafting', 'summary'],
      tools: 'Bozza scheda da appunti Board (ambiente interno)',
      dataExposure: 'internal_only',
      note: 'Revisione umana completa prima della chiusura.',
    },
    insights: [
      {
        id: 'insight-ethics-hire-1',
        kind: 'spunto',
        title: 'Spiegare ≠ dump del modello',
        body: 'Una feature importance grezza non è rispetto verso il candidato: è scaricare complessità. La sintesi sui criteri dichiarati è un atto politico, non tecnico.',
        author: 'Luca Bianchi',
        role: 'Filosofo',
        relatedStepId: 'discarded-opt-ethics-hire-2',
        createdAt: '2026-02-14T10:00:00.000Z',
      },
      {
        id: 'insight-ethics-hire-2',
        kind: 'consulenza',
        title: 'QA sulle motivazioni come controllo reale',
        body: 'Senza campionamento mensile, la «motivazione sintetica» diventa template. Mettete il tasso di boilerplate nel cruscotto HR, non solo il time-to-shortlist.',
        author: 'Sara Neri',
        role: 'Consulente',
        relatedStepId: 'stop',
        consultationRequestId: 'consult-ethics-hire-closed',
        createdAt: '2026-02-15T09:00:00.000Z',
      },
    ],
    consultationRequests: [
      {
        id: 'consult-ethics-hire-closed',
        kind: 'consulenza',
        status: 'chiusa',
        question:
          'Come misuriamo se le motivazioni restano specifiche e non diventano testo fisso?',
        requestedBy: {
          userId: 'compiler-ai-ethics',
          name: 'Chiara Moretti',
        },
        createdAt: '2026-02-14T16:00:00.000Z',
        updatedAt: '2026-02-15T09:00:00.000Z',
        responseInsightId: 'insight-ethics-hire-2',
      },
    ],
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 'record-ethics-emotion-2026',
    publicActId: 'act-ethics-emotion-2026',
    publicAct: aiEthicsActs[1],
    compiler: aiEthicsCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    category: 'Bias & equità',
    upvotes: 41,
    realQuestion:
      'Vale la pena trattare l’«emozione» del cliente come segnale operativo per il CSAT, o stiamo legittimando una lettura del corpo che non possiamo giustificare?',
    discardedOptions: [
      {
        id: 'opt-ethics-emo-1',
        title: 'Pilota interno «solo agent», niente clienti finali',
        reasonDiscarded:
          'Scartata: il confine «solo interno» collassa in produzione e crea dipendenza dal vendor. Se è sbagliato in pubblico, è sbagliato anche in staging.',
        evidenceType: 'interpretation',
      },
      {
        id: 'opt-ethics-emo-2',
        title: 'Opt-in esplicito del cliente a inizio chat video',
        reasonDiscarded:
          'Scartata: l’opt-in sotto pressione (problema aperto) non è consenso libero; inoltre non risolve il problema di fondo sulla misurabilità dell’affetto.',
        evidenceType: 'verbatim',
      },
    ],
    decision:
      'Divieto di emotion scoring biometrico (volto, voce, tono) nei canali di supporto, inclusi piloti. Consentiti solo segnali comportamentali espliciti (es. «valuta questa chat») dichiarati come tali.',
    uncertaintyLevel: 'basso',
    uncertaintyExplanation:
      'Il rischio reputazionale e normativo supera il guadagno CSAT stimato dal vendor (+3–5%).',
    confidence: 5,
    mindChangingConditions: [
      'Solo se una norma settoriale imponesse metriche biometriche obbligatorie (improbabile): riesame entro 60 giorni.',
      'Se un prodotto analogo venisse certificato con standard indipendente su equità e consenso: il Board può riaprire, non Product da sola.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-ethics-emo-1',
        quote:
          'Non stiamo ottimizzando un funnel. Stiamo decidendo se il volto di chi chiede aiuto è un input di business.',
        pageOrParagraph: 'Verbale Ethics Board n. 5/2026',
        speaker: 'Chief Ethics Officer',
      },
    ],
    interpretativeSummary:
      'Product spingeva sul CSAT. Il Board ha riformulato: non è A/B test, è dignità. Lo scarto del «pilota solo interno» evita la scappatoia tipica.',
    outcomeReviews: [
      {
        id: 'outcome-ethics-emo-1',
        timeframe: '12_mesi',
        expectedOutcome: 'Zero deploy di emotion scoring; vendor contracts aggiornati con clausola di divieto.',
        actualOutcome:
          'A 9 mesi: clausola in 3/3 contratti support. Un vendor ha proposto «sentiment testuale»: inoltrato al Board come decisione separata.',
        status: 'verified_true',
        reviewDate: new Date('2026-12-01'),
      },
    ],
    insights: [
      {
        id: 'insight-ethics-emo-1',
        kind: 'alert',
        title: 'Il pilota interno non lava l’etica',
        body: 'Se la pratica è inaccettabile sui clienti, non diventa accettabile perché gli agent sono dipendenti. Spostate il confine, non nascondetelo.',
        author: 'Dubitor',
        role: 'Sistema',
        relatedStepId: 'discarded-opt-ethics-emo-1',
      },
      {
        id: 'insight-ethics-emo-2',
        kind: 'spunto',
        title: 'CSAT non misura giustizia',
        body: 'Un +4% di soddisfazione ottenuto leggendo il volto non è un miglioramento del servizio: è un trasferimento di potere asimmetrico.',
        author: 'Marta Greco',
        role: 'Filosofa',
        relatedStepId: 'question',
        createdAt: '2026-03-20T11:00:00.000Z',
      },
    ],
    consultationRequests: [
      {
        id: 'consult-ethics-emo-open',
        kind: 'filosofica',
        status: 'aperta',
        question:
          'Se un giorno useremo «sentiment» solo sul testo digitato (niente biometria), è la stessa questione morale o un’altra decisione?',
        requestedBy: {
          userId: 'user-demo-product',
          name: 'Team Customer Product',
        },
        createdAt: '2026-03-22T10:00:00.000Z',
      },
    ],
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-22'),
  },
  {
    id: 'record-ethics-training-2026',
    publicActId: 'act-ethics-training-2026',
    publicAct: aiEthicsActs[2],
    compiler: aiEthicsCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    category: 'Consenso & dati',
    upvotes: 29,
    realQuestion:
      'Possiamo chiamare «dato pubblico» ciò che le persone hanno scritto in un forum senza mai acconsentire a diventare materiale di training?',
    discardedOptions: [
      {
        id: 'opt-ethics-train-1',
        title: 'Scraping aggressivo + filtro PII post-hoc',
        reasonDiscarded:
          'Scartata: rimuovere PII non restituisce lo scopo originale del post. Legal: base giuridica assente per fine-tuning commerciale.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-ethics-train-2',
        title: 'Solo «fair use» / legittimo interesse senza registro fonti',
        reasonDiscarded:
          'Scartata: senza provenance non superiamo un audit né una due diligence acquirente. Il legittimo interesse non è un lasciapassare automatico.',
        evidenceType: 'interpretation',
      },
    ],
    decision:
      'Vietato fine-tuning su corpus scraped da forum/social senza base giuridica documentata e registro delle fonti. Ammessi dataset con licenza, opt-in, o accordi con publisher.',
    uncertaintyLevel: 'medio',
    uncertaintyExplanation:
      'Pressione competitive su «dati di dominio». Mitigazione: budget per dataset licenziati nel piano AI 2026.',
    confidence: 4,
    mindChangingConditions: [
      'Se un’autorità chiarisce linee guida settoriali più permissive con obblighi di transparency: riesame del Board.',
      'Se un fornitore offre corpus domain-specific con licenza verificabile a costo sostenibile: si valuta sostituzione, non eccezione allo scraping.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-ethics-train-1',
        quote:
          '«È già online» non è una base giuridica. È una tentazione.',
        pageOrParagraph: 'Verbale Ethics Board n. 8/2026',
        speaker: 'DPO',
      },
    ],
    interpretativeSummary:
      'Engineering voleva velocità sul dominio. Il Board ha spostato la domanda dal «possiamo tecnicamente» al «possiamo giustificare».',
    outcomeReviews: [
      {
        id: 'outcome-ethics-train-1',
        timeframe: '6_mesi',
        expectedOutcome: 'Zero job di scraping forum; registro dataset in produzione compilato al 100%.',
        actualOutcome:
          'A 4 mesi: un pipeline legacy trovato e spento. Registro dataset al 92% — azione correttiva aperta.',
        status: 'inconclusive',
        reviewDate: new Date('2026-08-12'),
        notes: 'Stop non attivato; chiudere il gap di registro entro Q3.',
      },
    ],
    aiAssistance: {
      level: 'assistivo',
      scopes: ['research', 'drafting'],
      tools: 'Ricerca interna su policy vendor + bozza verbale',
      dataExposure: 'internal_only',
    },
    insights: [
      {
        id: 'insight-ethics-train-1',
        kind: 'consulenza',
        title: 'Provenance prima del modello',
        body: 'In due diligence vi chiederanno da dove vengono i pesi, non quanto è alto il BLEU. Il registro fonti è asset, non burocrazia.',
        author: 'Andrea Conti',
        role: 'Consulente',
        relatedStepId: 'decision',
        consultationRequestId: 'consult-ethics-train-closed',
        createdAt: '2026-04-11T15:00:00.000Z',
      },
      {
        id: 'insight-ethics-train-2',
        kind: 'domanda',
        title: 'Chi è il soggetto del post?',
        body: 'Anche senza PII, un thread tecnico può identificare autori. Avete considerato il rischio di re-identificazione contestuale?',
        author: 'Chiara Moretti',
        role: 'Curatrice',
        relatedStepId: 'question',
        createdAt: '2026-04-11T10:00:00.000Z',
      },
    ],
    consultationRequests: [
      {
        id: 'consult-ethics-train-closed',
        kind: 'consulenza',
        status: 'chiusa',
        question:
          'Cosa deve contenere il minimo del registro dataset per resistere a una due diligence?',
        requestedBy: {
          userId: 'user-demo-ml',
          name: 'ML Platform Lead',
        },
        createdAt: '2026-04-10T18:00:00.000Z',
        updatedAt: '2026-04-11T15:00:00.000Z',
        responseInsightId: 'insight-ethics-train-1',
      },
    ],
    createdAt: new Date('2026-04-11'),
    updatedAt: new Date('2026-04-12'),
  },
  {
    id: 'record-ethics-hitl-2026',
    publicActId: 'act-ethics-hitl-2026',
    publicAct: aiEthicsActs[3],
    compiler: aiEthicsCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    category: 'Autonomia umana',
    upvotes: 38,
    realQuestion:
      'Un click sul suggerimento del copilot conta come giudizio del caseworker, o stiamo istituzionalizzando la firma di comodo?',
    discardedOptions: [
      {
        id: 'opt-ethics-hitl-1',
        title: 'HITL come checkbox «confermo» senza testo libero',
        reasonDiscarded:
          'Scartata: in osservazione UX il 70% dei click arrivava sotto i 2 secondi — non è giudizio, è throughput.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-ethics-hitl-2',
        title: 'Autonomia piena del modello su pratiche low-risk',
        reasonDiscarded:
          'Scartata: la classificazione «low-risk» era definita dal vendor, non dall’ente. Risk non ha firmato la soglia.',
        evidenceType: 'interpretation',
      },
    ],
    decision:
      'HITL obbligatorio: il caseworker deve scrivere una motivazione breve sia quando segue sia quando discosta dal suggerimento. Audit campionario mensile; se >25% delle motivazioni è vuoto/boilerplate, si sospende il copilot.',
    uncertaintyLevel: 'alto',
    uncertaintyExplanation:
      'Rischio di «deskilling» e di responsabilità confusa in contenzioso. Il criterio di stop è osservabile.',
    confidence: 3,
    mindChangingConditions: [
      'Se l’audit mensile trova >25% motivazioni non sostanziali: sospensione del copilot entro 7 giorni.',
      'Se un contenzioso dimostra che il suggerimento ha determinato l’esito senza giudizio umano: stop immediato e post-mortem al Board.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-ethics-hitl-1',
        quote:
          'Human-in-the-loop non è un badge sul slide deck. È tempo cognitivo allocato. Se non lo misurate, non ce l’avete.',
        pageOrParagraph: 'Verbale Ethics Board n. 11/2026',
        speaker: 'Risk Officer',
      },
    ],
    interpretativeSummary:
      'Ops voleva efficienza. Il Board ha reso il HITL falsificabile: non «c’è un umano», ma «c’è un giudizio documentato».',
    outcomeReviews: [
      {
        id: 'outcome-ethics-hitl-1',
        timeframe: '6_mesi',
        expectedOutcome: 'Tempo mediano di conferma ≥ 20s; boilerplate <15% nel campione.',
        actualOutcome:
          'Mese 1: boilerplate al 31% — sotto soglia di stop ma in allerta. Training caseworker lanciato. Mese 3: boilerplate all’18%.',
        status: 'inconclusive',
        reviewDate: new Date('2026-08-20'),
        notes: 'Criterio di stop non attivato; tenere audit stretto.',
      },
    ],
    aiAssistance: {
      level: 'sostanziale',
      scopes: ['options_analysis', 'drafting'],
      tools: 'Analisi opzioni da memo Risk + bozza scheda',
      dataExposure: 'internal_only',
      note: 'Il livello «sostanziale» è dichiarato: la bozza ha proposto scarti; il Board ha rivisto linea per linea.',
    },
    insights: [
      {
        id: 'insight-ethics-hitl-1',
        kind: 'alert',
        title: 'Checkbox ≠ giudizio',
        body: 'Se il tempo mediano di conferma è sotto i due secondi, avete un throughput machine, non un human-in-the-loop.',
        author: 'Dubitor',
        role: 'Sistema',
        relatedStepId: 'discarded-opt-ethics-hitl-1',
      },
      {
        id: 'insight-ethics-hitl-2',
        kind: 'spunto',
        title: 'Responsabilità e traccia',
        body: 'In contenzioso vi chiederanno chi ha deciso. La motivazione breve è la vostra prova che l’umano c’era — o la vostra assenza.',
        author: 'Elena Vitali',
        role: 'Filosofa',
        relatedStepId: 'decision',
        createdAt: '2026-05-16T12:00:00.000Z',
      },
      {
        id: 'insight-ethics-hitl-3',
        kind: 'consulenza',
        title: 'Misurate il boilerplate, non solo il volume',
        body: 'Aggiungete al cruscotto la % di motivazioni flaggate come template. È l’unico modo per far scattare lo stop in tempo.',
        author: 'Sara Neri',
        role: 'Consulente',
        relatedStepId: 'stop',
        consultationRequestId: 'consult-ethics-hitl-closed',
        createdAt: '2026-05-17T09:30:00.000Z',
      },
    ],
    consultationRequests: [
      {
        id: 'consult-ethics-hitl-closed',
        kind: 'consulenza',
        status: 'chiusa',
        question:
          'Quale metrica operativa rende il HITL falsificabile senza trasformarsi in burocrazia inutile?',
        requestedBy: {
          userId: 'compiler-ai-ethics',
          name: 'Chiara Moretti',
        },
        createdAt: '2026-05-16T08:00:00.000Z',
        updatedAt: '2026-05-17T09:30:00.000Z',
        responseInsightId: 'insight-ethics-hitl-3',
      },
      {
        id: 'consult-ethics-hitl-open',
        kind: 'filosofica',
        status: 'aperta',
        question:
          'Se il caseworker discosta sempre dal modello «per precauzione», stiamo ancora usando un copilot o abbiamo creato un rituale difensivo?',
        requestedBy: {
          userId: 'user-demo-ops',
          name: 'Ops Lead Servizi',
        },
        createdAt: '2026-05-18T14:00:00.000Z',
      },
    ],
    createdAt: new Date('2026-05-16'),
    updatedAt: new Date('2026-05-18'),
  },
];
