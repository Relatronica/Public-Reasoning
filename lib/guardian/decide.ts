import type {
  GuardianVerdict,
  MachineConstraint,
  MachineConstraintSet,
  MachineMatcher,
} from '@/types';

/** Azione proposta da un agente (o da un sistema automatizzato). */
export interface AgentAction {
  /** Identificativo stabile, es. `llm.public.complete`, `credit.auto_score`. */
  action: string;
  /** Risorsa toccata, es. `candidate.cv`, `pmi.loan_application`. */
  resource?: string;
  /** Contesto tipizzato (importi, flag, tenant, …). */
  context?: Record<string, string | number | boolean>;
  agentId?: string;
}

export interface GuardianDecision {
  verdict: GuardianVerdict;
  reason: string;
  matchedConstraintIds: string[];
  sourceRecordIds: string[];
}

export interface ConstraintSource {
  recordId: string;
  set: MachineConstraintSet;
}

function matchOne(matcher: MachineMatcher, proposed: AgentAction): boolean {
  if (matcher.field === 'action') {
    const value = proposed.action;
    if (matcher.op === 'eq') return value === matcher.value;
    return value.startsWith(matcher.value);
  }

  if (matcher.field === 'resource') {
    const value = proposed.resource ?? '';
    if (matcher.op === 'eq') return value === matcher.value;
    return value.includes(matcher.value);
  }

  const raw = proposed.context?.[matcher.key];
  if (raw === undefined) return false;

  if (matcher.op === 'eq') return raw === matcher.value;

  const left = Number(raw);
  const right = Number(matcher.value);
  if (Number.isNaN(left) || Number.isNaN(right)) return false;

  if (matcher.op === 'lt') return left < right;
  if (matcher.op === 'lte') return left <= right;
  if (matcher.op === 'gt') return left > right;
  return left >= right;
}

function matchesConstraint(constraint: MachineConstraint, proposed: AgentAction): boolean {
  if (constraint.match.length === 0) return false;
  return constraint.match.every((m) => matchOne(m, proposed));
}

const EFFECT_RANK: Record<GuardianVerdict, number> = {
  deny: 3,
  escalate: 2,
  allow: 1,
};

/**
 * Valuta un'azione contro i vincoli delle schede.
 * Regola: deny batte escalate batte allow; a parità di effect vince priority più alta.
 * Se nulla matcha → defaultEffect del set (o escalate se assente).
 */
export function decide(
  proposed: AgentAction,
  sources: ConstraintSource[]
): GuardianDecision {
  type Hit = {
    constraint: MachineConstraint;
    recordId: string;
    defaultEffect: GuardianVerdict;
  };

  const hits: Hit[] = [];
  let fallback: GuardianVerdict = 'escalate';

  for (const source of sources) {
    const defaultEffect = source.set.defaultEffect ?? 'escalate';
    fallback = defaultEffect;
    for (const constraint of source.set.constraints) {
      if (matchesConstraint(constraint, proposed)) {
        hits.push({ constraint, recordId: source.recordId, defaultEffect });
      }
    }
  }

  if (hits.length === 0) {
    return {
      verdict: fallback,
      reason:
        fallback === 'allow'
          ? 'Nessun vincolo matcha; default allow.'
          : fallback === 'deny'
            ? 'Nessun vincolo matcha; default deny.'
            : 'Nessun vincolo matcha; serve una persona (default escalate).',
      matchedConstraintIds: [],
      sourceRecordIds: [],
    };
  }

  hits.sort((a, b) => {
    const effectDelta =
      EFFECT_RANK[b.constraint.effect] - EFFECT_RANK[a.constraint.effect];
    if (effectDelta !== 0) return effectDelta;
    return (b.constraint.priority ?? 0) - (a.constraint.priority ?? 0);
  });

  const winner = hits[0];
  const sameEffect = hits.filter((h) => h.constraint.effect === winner.constraint.effect);

  return {
    verdict: winner.constraint.effect,
    reason: winner.constraint.description,
    matchedConstraintIds: sameEffect.map((h) => h.constraint.id),
    sourceRecordIds: [...new Set(sameEffect.map((h) => h.recordId))],
  };
}

/** Override umano su un escalate (demo / Slack futuro). */
export function applyHumanResolution(
  decision: GuardianDecision,
  resolution: 'allow' | 'deny',
  note?: string
): GuardianDecision {
  return {
    ...decision,
    verdict: resolution,
    reason: note
      ? `Approvazione umana (${resolution}): ${note}`
      : `Approvazione umana: ${resolution === 'allow' ? 'approvato' : 'rifiutato'}. Originale: ${decision.reason}`,
  };
}
