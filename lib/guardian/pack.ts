import { aiEthicsRecords } from '@/lib/ai-ethics';
import { aiGovernanceRecords } from '@/lib/ai-governance';
import type { ConstraintSource } from '@/lib/guardian/decide';
import type { ReasoningRecord } from '@/types';

/** Pack con vincoli machine-readable per il Guardiano. */
export type GuardianPackId = 'ai-governance' | 'ai-ethics';

export const GUARDIAN_PACKS: GuardianPackId[] = ['ai-governance', 'ai-ethics'];

export function isGuardianPack(slug: string | null | undefined): slug is GuardianPackId {
  return slug === 'ai-governance' || slug === 'ai-ethics';
}

/** Mappa community slug → pack (oggi 1:1). */
export function resolveGuardianPack(
  slugOrPack?: string | null
): GuardianPackId {
  if (slugOrPack === 'ai-ethics') return 'ai-ethics';
  return 'ai-governance';
}

export function packLabel(pack: GuardianPackId): string {
  return pack === 'ai-ethics' ? 'AI Ethics Board' : 'Governance IA';
}

/** Chi chiedere sull’escalate (copy demo / Slack). */
export function escalateAudience(pack: GuardianPackId): string {
  return pack === 'ai-ethics' ? 'Ethics Board' : 'una persona';
}

export function constraintSourcesFromRecords(records: ReasoningRecord[]): ConstraintSource[] {
  return records
    .filter((r) => r.machineConstraints && r.machineConstraints.constraints.length > 0)
    .map((r) => ({
      recordId: r.id,
      set: r.machineConstraints!,
    }));
}

export function constraintSourcesForPack(pack: GuardianPackId): ConstraintSource[] {
  if (pack === 'ai-ethics') {
    return constraintSourcesFromRecords(aiEthicsRecords);
  }
  return constraintSourcesFromRecords(aiGovernanceRecords);
}

/** @deprecated preferire constraintSourcesForPack */
export function aiGovernanceConstraintSources(): ConstraintSource[] {
  return constraintSourcesForPack('ai-governance');
}

export function aiEthicsConstraintSources(): ConstraintSource[] {
  return constraintSourcesForPack('ai-ethics');
}
