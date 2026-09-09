import { PublicAct, ReasoningRecord, User } from '@/types';
import { communities } from '@/lib/communities';

const pack = communities.find((c) => c.slug === 'ai-governance')!;

export const aiGovernanceCompiler: User = {
  id: 'compiler-dpo-nord',
  username: 'marta_leone',
  name: 'Marta Leone',
  bio: 'Responsabile protezione dati ad interim. Cura il registro delle decisioni sui sistemi AI con Rischio e Risorse umane.',
  createdAt: new Date('2025-11-01'),
};

export const aiGovernanceActs: PublicAct[] = [
  {
    id: 'act-ai-hr-llm-2026',
    title: 'Divieto di modelli linguistici pubblici sui curriculum. Selezione solo nell’ambiente cloud dedicato.',
    actNumber: 'Verbale Rischio n. 4/2026',
    entity: pack,
    date: new Date('2026-02-12'),
    rawTextExcerpt: `IL COMITATO RISCHIO
PRESO ATTO dell’uso spontaneo di chatbot pubblici da parte delle Risorse umane nella selezione dei curriculum;
RITENUTO che una clausola di esonero di responsabilità non costituisce misura tecnica;
DECIDE di vietare i modelli destinati al pubblico sui dati dei candidati e di autorizzare solo Azure OpenAI nell’ambiente dedicato, con conservazione 90 giorni.`,
    slug: 'ai-hr-llm-tenant-2026',
    createdAt: new Date('2026-02-13'),
    updatedAt: new Date('2026-02-13'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Esempio dimostrativo del pack Governance IA. Non è un verbale reale.',
  },
  {
    id: 'act-ai-credit-score-2026',
    title: 'Nessun punteggio automatico su fidi PMI sotto 250 k€ senza intervento umano.',
    actNumber: 'Nota Rischio e Credito n. 2/2026',
    entity: pack,
    date: new Date('2026-05-06'),
    rawTextExcerpt: `COMITATO CREDITO
ESAMINATA la proposta di un modello di valutazione automatica per le richieste PMI;
RITENUTO alto il rischio di disparità e di irreperibilità della spiegazione;
DECIDE di non mettere in produzione il punteggio automatico sotto soglia 250 k€ senza decisione umana registrata.`,
    slug: 'ai-credit-no-auto-score-2026',
    createdAt: new Date('2026-05-07'),
    updatedAt: new Date('2026-05-07'),
    recordsCount: 1,
    isVerified: true,
    dataStatus: 'demo',
    verificationNote: 'Esempio dimostrativo del pack Governance IA. Non è un verbale reale.',
  },
];

export const aiGovernanceRecords: ReasoningRecord[] = [
  {
    id: 'record-ai-hr-llm-2026',
    publicActId: 'act-ai-hr-llm-2026',
    publicAct: aiGovernanceActs[0],
    compiler: aiGovernanceCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    compliancePack: 'ai_governance',
    category: 'IA nelle risorse umane',
    upvotes: 9,
    realQuestion:
      'Lasciamo che le Risorse umane usino un modello linguistico pubblico sui curriculum, o teniamo i dati dei candidati in un ambiente cloud dedicato che possiamo verificare?',
    discardedOptions: [
      {
        id: 'opt-ai-hr-1',
        title: 'Copilot (versione pubblica) con avviso «non incollare dati personali»',
        reasonDiscarded:
          'L’avviso non è un controllo. Un collaudo interno ha già mostrato curriculum incollati in chat.',
        evidenceType: 'verbatim',
      },
    ],
    decision:
      'Vietati i modelli destinati al pubblico sui dati dei candidati. Selezione assistita solo su Azure OpenAI nell’ambiente dedicato, registro degli accessi e conservazione 90 giorni.',
    uncertaintyLevel: 'medio',
    uncertaintyExplanation:
      'Il team può aggirare il divieto da casa. Il controllo reale è il registro accessi, non la regola interna.',
    mindChangingConditions: [
      'Tre reclami al Garante o una fuga di curriculum attribuibile al modello entro 12 mesi: si sospende la selezione assistita.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-ai-hr-1',
        quote: 'Non è un tema di produttività. È un trattamento di dati di terzi senza base e senza registro.',
        pageOrParagraph: 'Verbale Rischio n. 4/2026',
        speaker: 'Responsabile protezione dati',
      },
    ],
    interpretativeSummary:
      'Le Risorse umane chiedevano velocità. Rischio ha riformulato la domanda: non «quale intelligenza artificiale», ma «dove restano i curriculum». Lo scarto dell’avviso generico è la parte che un revisore può verificare.',
    outcomeReviews: [
      {
        id: 'outcome-ai-hr-1',
        timeframe: '12_mesi',
        expectedOutcome:
          'Zero incidenti sui dati dei candidati; registri completi; nessun uso di strumenti pubblici sui curriculum.',
        status: 'pending',
        notes: 'Revisione a febbraio 2027, con campionamento dei registri.',
      },
    ],
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-14'),
  },
  {
    id: 'record-ai-credit-score-2026',
    publicActId: 'act-ai-credit-score-2026',
    publicAct: aiGovernanceActs[1],
    compiler: aiGovernanceCompiler,
    version: 1,
    status: 'closed',
    visibility: 'public',
    compliancePack: 'ai_governance',
    category: 'Prodotti verso i clienti',
    upvotes: 7,
    realQuestion:
      'Automatizziamo la valutazione dei fidi PMI per ridurre i tempi, o manteniamo sotto soglia una decisione umana e spiegabile?',
    discardedOptions: [
      {
        id: 'opt-ai-credit-1',
        title: 'Punteggio automatico in produzione sotto 250 k€, revisione solo su reclamo',
        reasonDiscarded:
          'La motivazione arriverebbe solo dopo il diniego. Per il comitato non è documentabile: sarebbe un esito già deciso.',
        evidenceType: 'interpretation',
      },
    ],
    decision:
      'Nessun punteggio automatico in produzione sotto 250 k€. Il modello può proporre; la decisione e la motivazione restano umane e vengono registrate.',
    uncertaintyLevel: 'alto',
    uncertaintyExplanation:
      'I concorrenti che valutano in automatico chiudono più in fretta. Il costo è commerciale, non solo di conformità.',
    mindChangingConditions: [
      'Se per tre trimestri consecutivi i tempi di risposta sulle richieste PMI restano oltre 12 giorni rispetto ai concorrenti, si riapre il dossier con un modello spiegabile e un intervento umano obbligatorio prima del diniego.',
    ],
    verbatimQuotes: [
      {
        id: 'quote-ai-credit-1',
        quote: 'Se non sappiamo dire perché abbiamo detto no, non è un fido. È un oracolo.',
        pageOrParagraph: 'Nota Rischio e Credito n. 2/2026',
        speaker: 'Responsabile credito',
      },
    ],
    interpretativeSummary:
      'La presentazione parlava di efficienza. La domanda reale riguarda la spiegabilità del diniego. Lo scarto del punteggio automatico sotto soglia è un criterio di stop del prodotto, non un ritardo informatico.',
    outcomeReviews: [
      {
        id: 'outcome-ai-credit-1',
        timeframe: '12_mesi',
        expectedOutcome:
          'Nessun diniego PMI sotto soglia senza nota umana; tempi di risposta monitorati rispetto ai concorrenti.',
        status: 'pending',
        notes: 'Revisione a maggio 2027.',
      },
    ],
    createdAt: new Date('2026-05-08'),
    updatedAt: new Date('2026-05-08'),
  },
];
