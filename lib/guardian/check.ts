import {
  appendLedgerEntry,
  applyHumanResolution,
  decide,
  type AgentAction,
  type GuardianDecision,
} from '@/lib/guardian';
import { createPending, updatePendingNotified } from '@/lib/guardian/pending';
import { notifyEscalation } from '@/lib/guardian/notify';
import type { LedgerEntry } from '@/lib/guardian/ledger';
import type { PendingEscalation } from '@/lib/guardian/pending';
import type { NotifyResult } from '@/lib/guardian/notify';
import {
  constraintSourcesForPack,
  resolveGuardianPack,
  type GuardianPackId,
} from '@/lib/guardian/pack';

export type GuardCheckResult = {
  pack: GuardianPackId;
  decision: GuardianDecision;
  entry: LedgerEntry;
  pending: PendingEscalation | null;
  notify: NotifyResult | null;
};

/**
 * Nucleo Decision API + route demo: valuta, scrive ledger, escalate se serve.
 */
export async function runGuardianCheck(input: {
  action: AgentAction;
  /** Community slug o pack id (`ai-governance` | `ai-ethics`). */
  pack?: string | null;
  humanResolution?: 'allow' | 'deny';
  humanNote?: string;
  notify?: boolean;
}): Promise<GuardCheckResult> {
  const pack = resolveGuardianPack(input.pack);
  const sources = constraintSourcesForPack(pack);
  let decision = decide(input.action, sources);

  if (input.humanResolution === 'allow' || input.humanResolution === 'deny') {
    decision = applyHumanResolution(
      decision,
      input.humanResolution,
      input.humanNote
    );
    const entry = await appendLedgerEntry({
      action: input.action,
      decision,
      humanResolution: input.humanResolution,
    });
    return { pack, decision, entry, pending: null, notify: null };
  }

  const entry = await appendLedgerEntry({
    action: input.action,
    decision,
  });

  if (decision.verdict !== 'escalate') {
    return { pack, decision, entry, pending: null, notify: null };
  }

  const pending = await createPending({
    action: input.action,
    decision,
    escalateEntryId: entry.id,
  });

  const shouldNotify = input.notify !== false;
  const notify = await notifyEscalation(pending, {
    skipRemote: !shouldNotify,
    pack,
  });
  await updatePendingNotified(pending.id, notify.channels);
  pending.notified = notify.channels;

  return { pack, decision, entry, pending, notify };
}
