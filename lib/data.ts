import { PublicAct, ReasoningRecord, User } from '@/types';
import { communities } from '@/lib/communities';
import { weltformActs, weltformCompiler, weltformRecords } from '@/lib/weltform';
import { aiGovernanceActs, aiGovernanceCompiler, aiGovernanceRecords } from '@/lib/ai-governance';
import { agoraActs, agoraCompiler, agoraRecords } from '@/lib/agora';
import { aiEthicsActs, aiEthicsCompiler, aiEthicsRecords } from '@/lib/ai-ethics';

const comuneCormano = communities[0];
const ufficioPeople = communities[1];
const progettoCapex = communities[2];

export const compilers: User[] = [
  {
    id: 'compiler-osservatorio',
    username: 'osservatorio_cormano',
    name: 'Osservatorio Civico Cormano',
    bio: 'Gruppo indipendente di analisi delle deliberazioni del Consiglio Comunale e della Giunta di Cormano (MI)',
    avatar: undefined,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'compiler-riva',
    username: 'anna_riva',
    name: 'Anna Riva',
    bio: 'Consulenza filosofica in organizzazione. Compila le schede di giudizio insieme ai decisori.',
    avatar: undefined,
    createdAt: new Date('2025-09-01'),
  },
  weltformCompiler,
  aiGovernanceCompiler,
  agoraCompiler,
  aiEthicsCompiler,
];

export const publicActs: PublicAct[] = [
  {
    id: 'act-cormano-cc-66-2024',
    title: 'Approvazione del Bilancio di Previsione Finanziario 2025-2027 e Documento Unico di Programmazione (DUP)',
    actNumber: 'Delibera C.C. n. 66/2024',
    entity: comuneCormano,
    date: new Date('2024-12-19'),
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
    localPdfPath: '/pdfs/delibera-cc-66-2024.pdf',
  },
  {
    id: 'act-cormano-gc-5-2025',
    title: 'Modifica della Disciplina della Circolazione e Sosta nel Centro Storico di Brusuglio — Zona 30 e Disco Orario',
    actNumber: 'Delibera di Giunta n. 5/2025',
    entity: comuneCormano,
    date: new Date('2025-01-10'),
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
  {
    id: 'act-people-cda-12-2026',
    title: 'Piano organico 2026: freeze selettivo e una sola assunzione specialistica in officina',
    actNumber: 'Verbale CdA n. 12/2026',
    entity: ufficioPeople,
    date: new Date('2026-03-18'),
    rawTextExcerpt: `IL CONSIGLIO DI AMMINISTRAZIONE
PRESO ATTO della saturazione del sito di Desio e della difficoltà a reperire capi turno;
RITENUTO di non aprire una campagna di hiring generalista nel 2026;
DELIBERA di congelare le sostituzioni non critiche e di autorizzare una sola assunzione di tecnologo di processo, con tetto di costo definito.`,
    slug: 'piano-organico-people-2026',
    createdAt: new Date('2026-03-19'),
    updatedAt: new Date('2026-03-19'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Fonte dimostrativa: verbale interno di un’impresa tipo. Non è un documento reale.',
  },
  {
    id: 'act-capex-deck-2026',
    title: 'Capex 2027: consolidare il sito di Desio in luogo di un secondo stabilimento',
    actNumber: 'Decision log — CdA aprile 2026',
    entity: progettoCapex,
    date: new Date('2026-04-09'),
    rawTextExcerpt: `IL COMITATO INVESTIMENTI
ESAMINATE tre opzioni: secondo sito in un’altra regione, cessione di ramo, consolidamento con automazione;
RITENUTO prevalente il presidio del know-how di officina e il patto di famiglia sulla proprietà;
DECIDE di non aprire un secondo stabilimento nel 2027 e di vincolare il capex al sito storico, con tetto di organico e trigger di revisione.`,
    slug: 'capex-2027-consolidamento-sito',
    createdAt: new Date('2026-04-10'),
    updatedAt: new Date('2026-04-10'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Fonte dimostrativa: decision log di progetto. Non è un documento reale.',
  },
  ...weltformActs,
  ...aiGovernanceActs,
  ...agoraActs,
  ...aiEthicsActs,
];

export const reasoningRecords: ReasoningRecord[] = [
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
  {
    id: 'record-people-cda-12-2026',
    publicActId: 'act-people-cda-12-2026',
    publicAct: publicActs[2],
    compiler: compilers[1],
    version: 1,
    status: 'published',
    category: 'Hiring',
    upvotes: 14,
    realQuestion: 'Come tenere il sito di Desio operativo senza diluire la cultura di officina, sapendo che i capi turno scarseggiano e il margine non sostiene un hiring generalista?',
    discardedOptions: [
      {
        id: 'opt-people-1',
        title: 'Campagna di dieci assunzioni junior in produzione',
        reasonDiscarded: 'Scartata: il collo di bottiglia è il know-how dei capi turno, non le teste in linea. Un hiring ampio alzerebbe il costo senza sbloccare la saturazione.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-people-2',
        title: 'Esternalizzare il secondo turno a una cooperativa',
        reasonDiscarded: 'Scartata per il rischio sul controllo qualità e sul patto implicito con gli operai di lunga data.',
        evidenceType: 'interpretation',
      },
    ],
    decision: 'Freeze selettivo sulle sostituzioni non critiche e una sola assunzione di tecnologo di processo, con tetto di costo e revisione a 12 mesi sul turnover dei capi turno.',
    uncertaintyLevel: 'alto',
    uncertaintyExplanation: 'Non è chiaro se un solo specialista basti a coprire i due turni se un capo turno esce entro l’anno.',
    mindChangingConditions: [
      'Se due capi turno lasciano entro sei mesi.',
      'Se gli extra-time di sabato superano il 12% delle ore mensili per due trimestri consecutivi.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-people-1',
        quote: 'Non assumiamo per far numero. Assumiamo se qualcuno sa far partire la linea quando manca il capo turno.',
        pageOrParagraph: 'Verbale CdA n. 12/2026, p. 3',
        speaker: 'Amministratore delegato',
      },
    ],
    interpretativeSummary: 'La domanda ufficiale era il piano organico. La domanda reale è la tenuta del mestiere in officina. Il freeze non è austerity: è il rifiuto di trattare le persone come volume di capex.',
    outcomeReviews: [
      {
        id: 'outcome-people-1',
        timeframe: '12_mesi',
        expectedOutcome: 'Turnover capi turno sotto una uscita; extra-time sabato sotto il 12%.',
        status: 'pending',
        notes: 'Review fissata a marzo 2027.',
      },
    ],
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-20'),
  },
  {
    id: 'record-capex-2027',
    publicActId: 'act-capex-deck-2026',
    publicAct: publicActs[3],
    compiler: compilers[1],
    version: 1,
    status: 'published',
    category: 'Sito & capex',
    upvotes: 21,
    realQuestion: 'Vogliamo crescere di scala, o proteggere il controllo familiare e il know-how sul sito storico?',
    discardedOptions: [
      {
        id: 'opt-capex-1',
        title: 'Secondo stabilimento in un’altra regione',
        reasonDiscarded: 'Scartata: rischio di diluire la presenza del fondatore e di spezzare il know-how di officina.',
        evidenceType: 'verbatim',
      },
      {
        id: 'opt-capex-2',
        title: 'Cessione di ramo a un partner industriale',
        reasonDiscarded: 'Scartata: conflitto con il patto di famiglia sulla proprietà.',
        evidenceType: 'verbatim',
      },
    ],
    decision: 'Consolidare il sito di Desio, capex su automazione, tetto di organico definito, nessun secondo sito nel 2027.',
    uncertaintyLevel: 'alto',
    uncertaintyExplanation: 'Dipende dalla tenuta dei margini se la domanda cresce e il sito satura.',
    mindChangingConditions: [
      'Utilizzo impianti sopra l’85% per due trimestri consecutivi.',
      'Un ordine che il sito non può evadere senza rifiutare clienti storici.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-capex-1',
        quote: 'Se perdiamo Desio per aprire altrove, non stiamo crescendo: stiamo cambiando azienda.',
        pageOrParagraph: 'Decision log, intervento del Presidente',
        speaker: 'Presidente / famiglia',
      },
    ],
    interpretativeSummary: 'Il titolo del CdA era il piano capex. La domanda reale è identitaria. Lo scarto del secondo sito è esplicito; il trigger di saturazione è il presidio contro l’autoinganno.',
    outcomeReviews: [
      {
        id: 'outcome-capex-1',
        timeframe: '12_mesi',
        expectedOutcome: 'Saturazione sotto l’85%, qualità e turnover capi turno in linea con il piano People.',
        status: 'pending',
        notes: 'Review a 12 mesi, non sul mood del board.',
      },
    ],
    createdAt: new Date('2026-04-11'),
    updatedAt: new Date('2026-04-11'),
  },
  ...weltformRecords,
  ...aiGovernanceRecords,
  ...agoraRecords,
  ...aiEthicsRecords,
];

export const mockPublicActs = publicActs;
export const mockReasoningRecords = reasoningRecords;

export function actsForCommunity(communityId: string): PublicAct[] {
  return publicActs.filter((act) => act.entity.id === communityId);
}

export function recordsForCommunity(communityId: string): ReasoningRecord[] {
  return reasoningRecords.filter((record) => record.publicAct?.entity.id === communityId);
}
