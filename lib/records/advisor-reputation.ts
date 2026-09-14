import {
  ConsultationKind,
  DecisionInsight,
  ReasoningRecord,
} from '@/types';

export type AdvisorBadgeId =
  | 'esperto'
  | 'rapido'
  | 'filosofo'
  | 'consulente';

export interface AdvisorBadge {
  id: AdvisorBadgeId | `domain:${string}`;
  label: string;
  title?: string;
}

export interface AdvisorReputation {
  userId: string;
  displayName?: string;
  responsesCount: number;
  filosoficaCount: number;
  consulenzaCount: number;
  avgResponseHours: number | null;
  domains: string[];
  badges: AdvisorBadge[];
}

type Accumulator = {
  userId: string;
  displayName?: string;
  responsesCount: number;
  filosoficaCount: number;
  consulenzaCount: number;
  responseHours: number[];
  domainCounts: Map<string, number>;
};

const FAST_RESPONSE_HOURS = 48;
const EXPERT_MIN_RESPONSES = 3;
const MAX_DOMAIN_BADGES = 3;

function insightMap(record: ReasoningRecord): Map<string, DecisionInsight> {
  const map = new Map<string, DecisionInsight>();
  for (const insight of record.insights ?? []) {
    map.set(insight.id, insight);
  }
  return map;
}

function responseHoursFor(
  createdAt: string,
  updatedAt?: string,
  insightCreatedAt?: string
): number | null {
  const endRaw = updatedAt ?? insightCreatedAt;
  if (!endRaw) return null;
  const start = new Date(createdAt).getTime();
  const end = new Date(endRaw).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return (end - start) / (1000 * 60 * 60);
}

function topDomains(domainCounts: Map<string, number>): string[] {
  return Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'it'))
    .slice(0, MAX_DOMAIN_BADGES)
    .map(([domain]) => domain);
}

function buildBadges(acc: Accumulator): AdvisorBadge[] {
  const badges: AdvisorBadge[] = [];
  const avgHours =
    acc.responseHours.length > 0
      ? acc.responseHours.reduce((sum, h) => sum + h, 0) / acc.responseHours.length
      : null;

  if (acc.filosoficaCount > 0) {
    badges.push({
      id: 'filosofo',
      label: 'Filosofo',
      title: `${acc.filosoficaCount} risposta${acc.filosoficaCount === 1 ? '' : 'e'} filosofica${acc.filosoficaCount === 1 ? '' : 'e'}`,
    });
  }
  if (acc.consulenzaCount > 0) {
    badges.push({
      id: 'consulente',
      label: 'Consulente',
      title: `${acc.consulenzaCount} risposta${acc.consulenzaCount === 1 ? '' : 'e'} operativa${acc.consulenzaCount === 1 ? '' : 'e'}`,
    });
  }
  if (acc.responsesCount >= EXPERT_MIN_RESPONSES) {
    badges.push({
      id: 'esperto',
      label: 'Esperto',
      title: `${acc.responsesCount} consultazioni chiuse con risposta accettata`,
    });
  }
  if (avgHours !== null && avgHours <= FAST_RESPONSE_HOURS) {
    badges.push({
      id: 'rapido',
      label: 'Rapido',
      title: `Tempo medio di risposta: ${formatResponseHours(avgHours)}`,
    });
  }

  for (const domain of topDomains(acc.domainCounts)) {
    badges.push({
      id: `domain:${domain}`,
      label: domain,
      title: `Competenza su schede in «${domain}»`,
    });
  }

  return badges;
}

function toReputation(acc: Accumulator): AdvisorReputation {
  const avgResponseHours =
    acc.responseHours.length > 0
      ? acc.responseHours.reduce((sum, h) => sum + h, 0) / acc.responseHours.length
      : null;

  const reputation: AdvisorReputation = {
    userId: acc.userId,
    displayName: acc.displayName,
    responsesCount: acc.responsesCount,
    filosoficaCount: acc.filosoficaCount,
    consulenzaCount: acc.consulenzaCount,
    avgResponseHours,
    domains: topDomains(acc.domainCounts),
    badges: [],
  };
  reputation.badges = buildBadges(acc);
  return reputation;
}

/** Metriche reputazione da consultazioni chiuse con risposta accettata. */
export function computeAdvisorReputations(
  records: ReasoningRecord[]
): Map<string, AdvisorReputation> {
  const accumulators = new Map<string, Accumulator>();

  for (const record of records) {
    const insights = insightMap(record);
    const category = record.category?.trim();

    for (const request of record.consultationRequests ?? []) {
      if (request.status !== 'chiusa' || !request.responseInsightId) continue;

      const insight = insights.get(request.responseInsightId);
      if (!insight) continue;

      const userId = insight.authorUserId?.trim();
      if (!userId) continue;

      const hours = responseHoursFor(
        request.createdAt,
        request.updatedAt,
        insight.createdAt
      );

      let acc = accumulators.get(userId);
      if (!acc) {
        acc = {
          userId,
          displayName: insight.author ?? undefined,
          responsesCount: 0,
          filosoficaCount: 0,
          consulenzaCount: 0,
          responseHours: [],
          domainCounts: new Map(),
        };
        accumulators.set(userId, acc);
      }

      acc.responsesCount += 1;
      if (request.kind === 'filosofica') acc.filosoficaCount += 1;
      else acc.consulenzaCount += 1;
      if (hours !== null) acc.responseHours.push(hours);
      if (category) {
        acc.domainCounts.set(category, (acc.domainCounts.get(category) ?? 0) + 1);
      }
      if (!acc.displayName && insight.author) {
        acc.displayName = insight.author;
      }
    }
  }

  const result = new Map<string, AdvisorReputation>();
  accumulators.forEach((acc, userId) => {
    result.set(userId, toReputation(acc));
  });
  return result;
}

export function getAdvisorReputation(
  reputations: Map<string, AdvisorReputation>,
  userId?: string | null
): AdvisorReputation | null {
  if (!userId) return null;
  return reputations.get(userId) ?? null;
}

export function formatResponseHours(hours: number): string {
  if (hours < 1) return 'meno di 1 ora';
  if (hours < 24) return `${Math.round(hours)} ore`;
  const days = Math.round(hours / 24);
  return days === 1 ? '1 giorno' : `${days} giorni`;
}

export function reputationSummary(reputation: AdvisorReputation): string {
  const parts: string[] = [
    `${reputation.responsesCount} risposta${reputation.responsesCount === 1 ? '' : 'e'}`,
  ];
  if (reputation.avgResponseHours !== null) {
    parts.push(`media ${formatResponseHours(reputation.avgResponseHours)}`);
  }
  if (reputation.domains.length > 0) {
    parts.push(reputation.domains.join(', '));
  }
  return parts.join(' · ');
}

/** Badge di ruolo atteso per una richiesta aperta (filosofo/consulente). */
export function expectedAdvisorBadge(kind: ConsultationKind): AdvisorBadge {
  return kind === 'filosofica'
    ? { id: 'filosofo', label: 'Filosofo', title: 'Risposta attesa da un filosofo' }
    : { id: 'consulente', label: 'Consulente', title: 'Risposta attesa da un consulente' };
}
