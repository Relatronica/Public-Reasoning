import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import type { AgentAction, GuardianDecision } from '@/lib/guardian/decide';
import type { Prisma } from '@prisma/client';

export type PendingStatus = 'open' | 'resolved';

export interface PendingEscalation {
  id: string;
  status: PendingStatus;
  createdAt: string;
  updatedAt?: string;
  action: AgentAction;
  decision: GuardianDecision;
  escalateEntryId?: string;
  resolvedAs?: 'allow' | 'deny';
  resolvedBy?: string;
  resolveNote?: string;
  notified: Array<'slack' | 'teams' | 'local'>;
}

function rowToPending(row: {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  action: Prisma.JsonValue;
  decision: Prisma.JsonValue;
  escalateEntryId: string | null;
  resolvedAs: string | null;
  resolvedBy: string | null;
  resolveNote: string | null;
  notified: Prisma.JsonValue;
}): PendingEscalation {
  const notified = Array.isArray(row.notified)
    ? (row.notified as PendingEscalation['notified'])
    : (['local'] as PendingEscalation['notified']);

  return {
    id: row.id,
    status: row.status === 'resolved' ? 'resolved' : 'open',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    action: row.action as unknown as AgentAction,
    decision: row.decision as unknown as GuardianDecision,
    escalateEntryId: row.escalateEntryId ?? undefined,
    resolvedAs:
      row.resolvedAs === 'allow' || row.resolvedAs === 'deny'
        ? row.resolvedAs
        : undefined,
    resolvedBy: row.resolvedBy ?? undefined,
    resolveNote: row.resolveNote ?? undefined,
    notified,
  };
}

export async function createPending(input: {
  action: AgentAction;
  decision: GuardianDecision;
  escalateEntryId?: string;
  notified?: PendingEscalation['notified'];
}): Promise<PendingEscalation> {
  const notified = input.notified ?? ['local'];
  const created = await prisma.guardianPending.create({
    data: {
      id: randomUUID(),
      status: 'open',
      action: input.action as unknown as Prisma.InputJsonValue,
      decision: input.decision as unknown as Prisma.InputJsonValue,
      escalateEntryId: input.escalateEntryId,
      notified: notified as unknown as Prisma.InputJsonValue,
    },
  });
  return rowToPending(created);
}

export async function getPending(id: string): Promise<PendingEscalation | undefined> {
  const row = await prisma.guardianPending.findUnique({ where: { id } });
  return row ? rowToPending(row) : undefined;
}

export async function listPending(filter?: {
  status?: PendingStatus;
}): Promise<PendingEscalation[]> {
  const rows = await prisma.guardianPending.findMany({
    where: filter?.status ? { status: filter.status } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(rowToPending);
}

export async function updatePendingNotified(
  id: string,
  notified: PendingEscalation['notified']
): Promise<void> {
  await prisma.guardianPending.update({
    where: { id },
    data: { notified: notified as unknown as Prisma.InputJsonValue },
  });
}

export async function markPendingResolved(
  id: string,
  resolution: 'allow' | 'deny',
  meta?: { resolvedBy?: string; note?: string }
): Promise<PendingEscalation | null> {
  const existing = await prisma.guardianPending.findUnique({ where: { id } });
  if (!existing) return null;
  if (existing.status === 'resolved') return rowToPending(existing);

  const updated = await prisma.guardianPending.update({
    where: { id },
    data: {
      status: 'resolved',
      resolvedAs: resolution,
      resolvedBy: meta?.resolvedBy,
      resolveNote: meta?.note,
    },
  });
  return rowToPending(updated);
}

export async function resetPending(): Promise<void> {
  await prisma.guardianPending.deleteMany();
}
