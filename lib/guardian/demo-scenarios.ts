import type { AgentAction } from '@/lib/guardian/decide';
import type { GuardianPackId } from '@/lib/guardian/pack';

export interface DemoScenario {
  id: string;
  title: string;
  narrative: string;
  action: AgentAction;
  /** Esito atteso per la demo (assert soft in UI). */
  expected: 'allow' | 'deny' | 'escalate';
}

/** Scenari Governance IA — compliance operativa. */
export const GOVERNANCE_DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'hr-public-llm',
    title: 'HR incolla un CV su ChatGPT',
    narrative:
      'Un agente “assistente selezione” prova a riassumere un curriculum con un modello pubblico.',
    action: {
      action: 'llm.public.complete',
      resource: 'candidate.cv',
      agentId: 'agent-hr-screener',
      context: { tool: 'chatgpt', purpose: 'cv_summary' },
    },
    expected: 'deny',
  },
  {
    id: 'hr-tenant-llm',
    title: 'HR usa Azure OpenAI nel tenant',
    narrative:
      'Stesso compito, ma sul modello autorizzato nell’ambiente dedicato, con registro accessi.',
    action: {
      action: 'llm.tenant.complete',
      resource: 'candidate.cv',
      agentId: 'agent-hr-screener',
      context: { tool: 'azure_openai', tenant: 'hr-dedicated' },
    },
    expected: 'allow',
  },
  {
    id: 'credit-auto-under',
    title: 'Punteggio automatico fido 80 k€',
    narrative:
      'Un agente credito propone di chiudere in automatico una richiesta PMI sotto soglia.',
    action: {
      action: 'credit.auto_score',
      resource: 'pmi.loan_application',
      agentId: 'agent-credit-bot',
      context: { amountEur: 80_000, humanDecision: false },
    },
    expected: 'deny',
  },
  {
    id: 'credit-propose-with-human',
    title: 'Modello propone, umano decide',
    narrative:
      'Il modello propone un punteggio; la decisione resta umana e verrà registrata.',
    action: {
      action: 'credit.propose_score',
      resource: 'pmi.loan_application',
      agentId: 'agent-credit-bot',
      context: { amountEur: 80_000, humanDecision: true },
    },
    expected: 'allow',
  },
  {
    id: 'unknown-export',
    title: 'Esportazione massiva non catalogata',
    narrative:
      'Azione fuori policy: nessun vincolo esplicito → il guardiano chiede a una persona.',
    action: {
      action: 'data.export.bulk',
      resource: 'candidate.cv',
      agentId: 'agent-ops',
      context: { destination: 'external_sheet' },
    },
    expected: 'escalate',
  },
];

/** Scenari AI Ethics — board, dignità, HITL falsificabile. */
export const ETHICS_DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'emotion-biometric',
    title: 'Emotion scoring in video chat',
    narrative:
      'Un agente support prova a classificare lo «stato emotivo» del cliente da volto/voce per il CSAT.',
    action: {
      action: 'support.biometrics.emotion_score',
      resource: 'customer.video_chat',
      agentId: 'agent-csat-optimizer',
      context: { modality: 'face_voice', purpose: 'csat' },
    },
    expected: 'deny',
  },
  {
    id: 'csat-explicit',
    title: 'Feedback esplicito «valuta questa chat»',
    narrative:
      'Stesso obiettivo CSAT, ma con un segnale dichiarato dal cliente — non biometria.',
    action: {
      action: 'support.feedback.explicit',
      resource: 'customer.chat',
      agentId: 'agent-csat-optimizer',
      context: { channel: 'post_chat_survey' },
    },
    expected: 'allow',
  },
  {
    id: 'scrape-forum-train',
    title: 'Fine-tuning su forum scrapati',
    narrative:
      'ML Platform lancia uno scrape di thread pubblici «perché sono già online».',
    action: {
      action: 'ml.train.scrape',
      resource: 'forum.industry_threads',
      agentId: 'agent-ml-pipeline',
      context: { purpose: 'domain_finetune' },
    },
    expected: 'deny',
  },
  {
    id: 'licensed-finetune',
    title: 'Training su dataset con licenza',
    narrative:
      'Stesso fine-tuning, ma su corpus con licenza e registro fonti documentato.',
    action: {
      action: 'ml.train.finetune',
      resource: 'dataset.licensed_domain',
      agentId: 'agent-ml-pipeline',
      context: { licenseDocumented: true },
    },
    expected: 'allow',
  },
  {
    id: 'hitl-clickthrough',
    title: 'Copilot caseworker: solo checkbox',
    narrative:
      'Il caseworker conferma il suggerimento in meno di due secondi, senza motivazione.',
    action: {
      action: 'caseworker.copilot.apply',
      resource: 'case.outcome',
      agentId: 'agent-case-copilot',
      context: { humanDecision: true, motivationProvided: false },
    },
    expected: 'deny',
  },
  {
    id: 'hitl-documented',
    title: 'Copilot con motivazione umana',
    narrative:
      'Il caseworker scrive perché segue (o discosta) il suggerimento — HITL falsificabile.',
    action: {
      action: 'caseworker.copilot.apply',
      resource: 'case.outcome',
      agentId: 'agent-case-copilot',
      context: { humanDecision: true, motivationProvided: true },
    },
    expected: 'allow',
  },
  {
    id: 'ethics-unknown',
    title: 'Deploy modello non catalogato',
    narrative:
      'Azione fuori dalle schede del Board → il guardiano chiede all’Ethics Board.',
    action: {
      action: 'model.deploy.production',
      resource: 'model.new_ranking_v3',
      agentId: 'agent-ml-ops',
      context: { environment: 'prod' },
    },
    expected: 'escalate',
  },
];

/** @deprecated alias — usare demoScenariosForPack */
export const DEMO_SCENARIOS = GOVERNANCE_DEMO_SCENARIOS;

export function demoScenariosForPack(pack: GuardianPackId): DemoScenario[] {
  return pack === 'ai-ethics' ? ETHICS_DEMO_SCENARIOS : GOVERNANCE_DEMO_SCENARIOS;
}
