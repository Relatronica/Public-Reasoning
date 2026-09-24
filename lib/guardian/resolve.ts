import { createHmac, timingSafeEqual } from 'crypto';
import { applyHumanResolution, type GuardianDecision } from '@/lib/guardian/decide';
import { appendLedgerEntry, type LedgerEntry } from '@/lib/guardian/ledger';
import {
  getPending,
  markPendingResolved,
  type PendingEscalation,
} from '@/lib/guardian/pending';

function resolveSecret(): string {
  return (
    process.env.GUARDIAN_RESOLVE_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'dubitor-guardian-dev-secret'
  );
}

export function signResolveToken(pendingId: string, resolution: 'allow' | 'deny'): string {
  return createHmac('sha256', resolveSecret())
    .update(`${pendingId}:${resolution}`)
    .digest('hex')
    .slice(0, 32);
}

export function verifyResolveToken(
  pendingId: string,
  resolution: 'allow' | 'deny',
  token: string
): boolean {
  const expected = signResolveToken(pendingId, resolution);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type ResolveResult =
  | {
      ok: true;
      pending: PendingEscalation;
      decision: GuardianDecision;
      entry: LedgerEntry | null;
      alreadyResolved: boolean;
    }
  | { ok: false; error: string; status: number };

export async function resolveEscalation(input: {
  pendingId: string;
  resolution: 'allow' | 'deny';
  resolvedBy?: string;
  note?: string;
}): Promise<ResolveResult> {
  const pending = await getPending(input.pendingId);
  if (!pending) {
    return { ok: false, error: 'Escalate non trovato', status: 404 };
  }

  if (pending.status === 'resolved') {
    return {
      ok: true,
      pending,
      decision: applyHumanResolution(
        pending.decision,
        pending.resolvedAs ?? input.resolution,
        pending.resolveNote
      ),
      entry: null,
      alreadyResolved: true,
    };
  }

  const decision = applyHumanResolution(
    pending.decision,
    input.resolution,
    input.note ??
      (input.resolvedBy
        ? `Risolto da ${input.resolvedBy}`
        : 'Approvazione umana')
  );

  const updated = await markPendingResolved(input.pendingId, input.resolution, {
    resolvedBy: input.resolvedBy,
    note: input.note,
  });

  const entry = await appendLedgerEntry({
    action: pending.action,
    decision,
    humanResolution: input.resolution,
    pendingId: pending.id,
  });

  return {
    ok: true,
    pending: updated!,
    decision,
    entry,
    alreadyResolved: false,
  };
}
