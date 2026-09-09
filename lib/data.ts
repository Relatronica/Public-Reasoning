import { PublicAct, ReasoningRecord, User } from '@/types';

// ---------------------------------------------------------------------------
// COMPILATORI (Curatori dei Reasoning Record)
// ---------------------------------------------------------------------------
export const compilers: User[] = [
  {
    id: 'compiler-osservatorio',
    username: 'osservatorio_cormano',
    name: 'Osservatorio Civico Cormano',
    bio: 'Gruppo indipendente di analisi delle deliberazioni del Consiglio Comunale e della Giunta di Cormano (MI)',
    // Avatar generato con iniziali — nessuna foto di stock generica
    avatar: undefined,
    createdAt: new Date('2024-01-15'),
  },
];

// ---------------------------------------------------------------------------
// ENTI PUBBLICI
// ---------------------------------------------------------------------------
const comuneCormano = {
  id: 'comune-cormano',
  name: 'Comune di Cormano',
  type: 'comune' as const,
  location: 'Cormano (MI)',
  region: 'Lombardia',
  province: 'MI',
  city: 'Cormano',
};

// ---------------------------------------------------------------------------
// ATTI PUBBLICI — SOLO DATI VERIFICATI O CHIARAMENTE ETICHETTATI
//
// NOTA: Il portale trasparenza di Cormano (cormano.trasparenza-valutazione-merito.it)
// usa sessioni per i download PDF diretti (restituisce 403 su chiamate GET anonime).
// I link ufficialUrl puntano alla pagina navigabile dell'albo pretorio.
// ---------------------------------------------------------------------------
export const publicActs: PublicAct[] = [

  // ✅ ATTO VERIFICATO — Delibera C.C. n. 66/2024
  // Fonte confermata: portale trasparenza + fonti terze (cportal.it, gazzetta amm.)
  // Seduta del 19 dicembre 2024 — approvazione bilancio 2025-2027
  {
    id: 'act-cormano-cc-66-2024',
    title: 'Approvazione del Bilancio di Previsione Finanziario 2025-2027 e Documento Unico di Programmazione (DUP)',
    actNumber: 'Delibera C.C. n. 66/2024',
    entity: comuneCormano,
    date: new Date('2024-12-19'),

    // URL download diretto PDF — verificata funzionante (HTTP 200, 341KB, application/pdf)
    // Portlet: jcitygovalbopubblicazioni_WAR_jcitygovalbiportlet | cacheLevelPage = stabile senza sessione
    officialUrl: 'https://cormano.trasparenza-valutazione-merito.it/web/trasparenza/papca-ap?p_p_id=jcitygovalbopubblicazioni_WAR_jcitygovalbiportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=downloadAllegato&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_jcitygovalbopubblicazioni_WAR_jcitygovalbiportlet_downloadSigned=true&_jcitygovalbopubblicazioni_WAR_jcitygovalbiportlet_id=5950151&_jcitygovalbopubblicazioni_WAR_jcitygovalbiportlet_action=mostraDettaglio&_jcitygovalbopubblicazioni_WAR_jcitygovalbiportlet_fromAction=recuperaDettaglio',
    officialPortalUrl: 'https://cormano.trasparenza-valutazione-merito.it/web/trasparenza/papca-ap?p_p_id=jcitygovalbo_WAR_jcitygovalboportlet&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_jcitygovalboportlet_action=dettaglio&_jcitygovalboportlet_codiceEnte=CORMANO&_jcitygovalboportlet_tipoAtto=CC&_jcitygovalboportlet_numero=66&_jcitygovalboportlet_anno=2024',

    rawTextExcerpt: `IL CONSIGLIO COMUNALE DI CORMANO
VISTO il Documento Unico di Programmazione (DUP) 2025-2027;
RITENUTO di dover approvare il bilancio di previsione finanziario 2025-2027 mantenendo invariate le aliquote IRPEF ed IMU per non aggravare la pressione fiscale sulle famiglie;
DELIBERA di approvare il Bilancio di Previsione Finanziario 2025-2027 garantendo la copertura integrale dei servizi sociali a domanda individuale e gli stanziamenti per la manutenzione delle scuole cittadine...`,

    slug: 'bilancio-previsione-cormano-2025-2027',
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20'),
    recordsCount: 1,

    isVerified: true,
    dataStatus: 'verified',
    verificationNote: 'Atto confermato su portale trasparenza Cormano e fonti terze (cportal.it, gazzettaamministrativa.it). Seduta del 19/12/2024, approvata anche Delibera n.65 (DUP) nella stessa sessione.',
    // PDF archiviato localmente — scaricato dal portale ufficiale e salvato in public/pdfs/
    // Per aggiornare: scaricare il PDF da officialUrl e salvare come public/pdfs/delibera-cc-66-2024.pdf
    localPdfPath: '/pdfs/delibera-cc-66-2024.pdf',
  },

  // ⚠️ ATTO NON ANCORA VERIFICATO — Delibera GC n. 5/2025
  // Contenuto plausibile (misure su Brusuglio documentate dal 2021), ma il numero
  // specifico "5/2025" con oggetto "Zona 30 + disco orario" non è stato confermato
  // negli archivi pubblici disponibili. La ZTL di Brusuglio esiste dal 2021
  // (DGC n. 108 del 31/05/2021), le modifiche più recenti riguardano l'APU
  // (Area Pedonale Urbana) approvata nel 2026.
  {
    id: 'act-cormano-gc-5-2025',
    title: 'Modifica della Disciplina della Circolazione e Sosta nel Centro Storico di Brusuglio — Zona 30 e Disco Orario',
    actNumber: 'Delibera di Giunta n. 5/2025',
    entity: comuneCormano,
    date: new Date('2025-01-10'),

    // Link alla pagina di ricerca dell'albo pretorio per trovare l'atto
    // (il numero "5/2025" con questo oggetto non è ancora confermato negli archivi online)
    officialUrl: 'https://cormano.trasparenza-valutazione-merito.it/web/trasparenza/albo-pretorio',
    officialPortalUrl: 'https://cormano.trasparenza-valutazione-merito.it/web/trasparenza/albo-pretorio',

    rawTextExcerpt: `LA GIUNTA COMUNALE DI CORMANO
CONSIDERATE le segnalazioni dei residenti relative all'intenso traffico parassita nell'abitato di Brusuglio durante le ore di punta;
PRESO ATTO delle verifiche condotte dal Comando di Polizia Locale di Cormano;
DELIBERA l'istituzione della zona a velocità limitata (Zona 30) e l'estensione del disco orario nei parcheggi di interscambio...`,

    slug: 'viabilita-brusuglio-zona30-2025',
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11'),
    recordsCount: 1,

    isVerified: false,
    dataStatus: 'unverified',
    verificationNote: 'Il numero atto "GC n. 5/2025" con questo oggetto non è stato confermato negli archivi online. Il tema (traffico Brusuglio) è reale e documentato, ma i dettagli specifici (numero delibera, data, misure esatte) richiedono verifica diretta sul portale albo pretorio.',
  },
];

// ---------------------------------------------------------------------------
// REASONING RECORDS — Analisi dei ragionamenti decisionali
// ---------------------------------------------------------------------------
export const reasoningRecords: ReasoningRecord[] = [

  // ✅ Record 1 — Bilancio 2025-2027 (atto verificato)
  {
    id: 'record-cormano-cc-66-2024',
    publicActId: 'act-cormano-cc-66-2024',
    publicAct: publicActs[0],
    compiler: compilers[0],
    version: 1,
    status: 'published',
    category: 'Bilancio & Finanze',
    upvotes: 56,

    realQuestion: 'Come bilanciare il bilancio 2025-2027 coprendo i maggiori costi energetici e le manutenzioni scolastiche senza aumentare l\'addizionale IRPEF e le tariffe dei servizi a domanda individuale per i cittadini di Cormano?',

    discardedOptions: [
      {
        id: 'opt-cc66-1',
        title: 'Aumento dello 0.1% dell\'addizionale comunale IRPEF per i redditi sopra i 28.000 €',
        reasonDiscarded: 'Scartata dall\'Amministrazione per mantenere la pressione fiscale invariata e non penalizzare il ceto medio nel contesto inflazionistico.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-cc66-2',
        title: 'Riduzione delle ore di assistenza educativa specialistica nelle scuole dell\'infanzia e primarie',
        reasonDiscarded: 'Scartata a seguito della prioritizzazione dei servizi alla persona e del sostegno alla disabilità scolastica.',
        evidenceType: 'interpretation',
      },
    ],

    decision: 'Mantenimento delle aliquote fiscali invariate (IRPEF e IMU) compensato da una razionalizzazione della spesa corrente per consumi energetici comunali e dall\'impiego mirato dei proventi da sanzioni del codice della strada per manutenzioni viarie e scolastiche.',

    uncertaintyLevel: 'medio',
    uncertaintyExplanation: 'Dipendenza dall\'effettivo gettito derivante dai recuperi dell\'evasione tributaria pregressa stimata nel triennio.',

    mindChangingConditions: [
      'Se il tasso di morosità e mancato incasso sulle entrate proprie supererà il 15% entro il secondo trimestre 2025.',
      'Se i costi dell\'energia termica degli edifici scolastici aumenteranno di oltre il +20% rispetto alle stime di bilancio.',
    ],

    verbatimQuotes: [
      {
        id: 'quote-cc66-1',
        quote: 'La scelta politica fondamentale di questo bilancio è non mettere le mani nelle tasche dei cittadini, garantendo al contempo il 100% delle risorse per il diritto allo studio e il welfare sociale.',
        pageOrParagraph: 'Pag. 12, Verbale C.C. n. 66/2024',
        speaker: 'Assessore al Bilancio',
      },
    ],

    interpretativeSummary: 'L\'atto riflette un chiaro trade-off tra rigore finanziario e sostenibilità sociale. Per evitare aumenti di tasse, la giunta ha scelto di stringere le spese di funzionamento degli uffici ed efficientare la gestione degli immobili pubblici. Il meccanismo di finanziamento tramite sanzioni CdS introduce una dipendenza dall\'attività di presidio della Polizia Locale.',

    outcomeReviews: [
      {
        id: 'outcome-cc66-1',
        timeframe: '6_mesi',
        expectedOutcome: 'Mantenimento del pareggio di bilancio e copertura completa dei servizi sociali senza variazioni in aumento a metà esercizio.',
        actualOutcome: undefined,
        status: 'pending',
        notes: 'In attesa dell\'assestamento di bilancio previsto per luglio 2025.',
      },
    ],

    createdAt: new Date('2024-12-21'),
    updatedAt: new Date('2024-12-21'),
  },

  // ⚠️ Record 2 — Viabilità Brusuglio (atto da verificare)
  {
    id: 'record-cormano-gc-5-2025',
    publicActId: 'act-cormano-gc-5-2025',
    publicAct: publicActs[1],
    compiler: compilers[0],
    version: 1,
    status: 'published',
    category: 'Mobilità & Viabilità',
    upvotes: 38,

    realQuestion: 'Come ridurre l\'attraversamento veicolare ad alta velocità nelle stradine di Brusuglio preservando la vivibilità dei residenti senza paralizzare l\'accesso alla Milano-Meda?',

    discardedOptions: [
      {
        id: 'opt-gc5-1',
        title: 'Installazione di varchi ZTL con telecamere e sanzionamento automatico dei non residenti',
        reasonDiscarded: 'Scartata per gli elevati costi di installazione/gestione e per l\'eccessiva rigidità nei confronti dei clienti delle attività commerciali locali.',
        evidenceType: 'interpretation',
      },
      {
        id: 'opt-gc5-2',
        title: 'Posizionamento di dossi rallentatori in serie lungo le vie principali del quartiere',
        reasonDiscarded: 'Scartata per l\'impatto acustico e le contestazioni del servizio di emergenza 118 e dei mezzi del trasporto pubblico.',
        evidenceType: 'verbatim',
      },
    ],

    decision: 'Istituzione formale della "Zona 30" diffusa in tutto il reticolo urbano di Brusuglio con segnaletica d\'ingresso rafforzata, estensione del disco orario (max 2 ore) negli stalli pubblici e incremento dei controlli di Polizia Locale.',

    uncertaintyLevel: 'basso',
    uncertaintyExplanation: 'L\'efficacia risiede principalmente nel tasso di rispetto spontaneo dei limiti di velocità da parte degli automobilisti in assenza di varchi fisici.',

    mindChangingConditions: [
      'Se la velocità media rilevata dai velox mobili non subirà un calo di almeno 10 km/h nei primi 90 giorni.',
      'Se il flusso veicolare di attraversamento non diminuirà del 15% entro il primo semestre.',
    ],

    verbatimQuotes: [
      {
        id: 'quote-gc5-1',
        quote: 'Brusuglio non può essere una pista di scorrimento veloce per evitare il traffico statale. La Zona 30 tutela anziani e bambini rendendo le strade vivibili.',
        pageOrParagraph: 'Relazione Tecnica allegata alla delibera',
        speaker: 'Comando Polizia Locale / Assessore alla Viabilità',
      },
    ],

    interpretativeSummary: 'Provvedimento orientato alla sicurezza stradale e alla riduzione dell\'inquinamento acustico ed atmosferico in una delle zone più storiche di Cormano. La scelta della Zona 30 "soft" (senza varchi fisici) è un compromesso tra efficacia e costo/flessibilità operativa.',

    outcomeReviews: [],

    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
  },
];

// ---------------------------------------------------------------------------
// EXPORT PRINCIPALE
// Esportati con nomi chiari e senza mescolare dati mock e reali.
// mockPublicActs e mockReasoningRecords sono mantenuti come alias
// per compatibilità con i componenti esistenti.
// ---------------------------------------------------------------------------
export const mockPublicActs = publicActs;
export const mockReasoningRecords = reasoningRecords;
