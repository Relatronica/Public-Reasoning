import { createHash, randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import type { AgentAction, GuardianDecision } from '@/lib/guardian/decide';
import type { Prisma } from '@prisma/client';

export interface LedgerEntry {
  id: string;
  seq: number;
  prevHash: string;
  hash: string;
  timestamp: string;
  action: AgentAction;
  decision: GuardianDecision;
  humanResolution?: 'allow' | 'deny';
  pendingId?: string;
}

const GENESIS = '0'.repeat(64);

/** Ordina le chiavi ricorsivamente così JSONB Postgres non rompe l’hash. */
function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = canonicalize(obj[key]);
  }
  return sorted;
}

/** Canonical hash (pendingId è metadato, non entra nella catena). */
export function hashLedgerPayload(
  prevHash: string,
  body: Omit<LedgerEntry, 'hash' | 'pendingId'>
): string {
  const canonical = JSON.stringify(
    canonicalize({
      id: body.id,
      seq: body.seq,
      prevHash,
      timestamp: body.timestamp,
      action: body.action,
      decision: body.decision,
      humanResolution: body.humanResolution ?? null,
    })
  );
  return createHash('sha256').update(canonical).digest('hex');
}

function rowToEntry(row: {
  id: string;
  seq: number;
  prevHash: string;
  hash: string;
  timestamp: string;
  action: Prisma.JsonValue;
  decision: Prisma.JsonValue;
  humanResolution: string | null;
  pendingId: string | null;
}): LedgerEntry {
  return {
    id: row.id,
    seq: row.seq,
    prevHash: row.prevHash,
    hash: row.hash,
    timestamp: row.timestamp,
    action: row.action as unknown as AgentAction,
    decision: row.decision as unknown as GuardianDecision,
    humanResolution:
      row.humanResolution === 'allow' || row.humanResolution === 'deny'
        ? row.humanResolution
        : undefined,
    pendingId: row.pendingId ?? undefined,
  };
}

export async function appendLedgerEntry(input: {
  action: AgentAction;
  decision: GuardianDecision;
  humanResolution?: 'allow' | 'deny';
  pendingId?: string;
}): Promise<LedgerEntry> {
  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const last = await tx.guardianLedgerEntry.findFirst({
          orderBy: { seq: 'desc' },
        });
        const prevHash = last ? last.hash : GENESIS;
        const seq = last ? last.seq + 1 : 1;
        const id = randomUUID();
        const timestamp = new Date().toISOString();
        const partial = {
          id,
          seq,
          prevHash,
          timestamp,
          action: input.action,
          decision: input.decision,
          humanResolution: input.humanResolution,
        };
        const hash = hashLedgerPayload(prevHash, partial);

        const created = await tx.guardianLedgerEntry.create({
          data: {
            id,
            seq,
            prevHash,
            hash,
            timestamp,
            action: input.action as unknown as Prisma.InputJsonValue,
            decision: input.decision as unknown as Prisma.InputJsonValue,
            humanResolution: input.humanResolution,
            pendingId: input.pendingId,
          },
        });
        return rowToEntry(created);
      });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002' && attempt < MAX_RETRIES - 1) continue;
      throw err;
    }
  }
  throw new Error('Impossibile appendere al ledger');
}

export async function listLedgerEntries(opts?: {
  limit?: number;
}): Promise<LedgerEntry[]> {
  const rows = await prisma.guardianLedgerEntry.findMany({
    orderBy: { seq: 'asc' },
    ...(opts?.limit ? { take: opts.limit } : {}),
  });
  return rows.map(rowToEntry);
}

export async function getLedgerEntry(id: string): Promise<LedgerEntry | null> {
  const row = await prisma.guardianLedgerEntry.findUnique({ where: { id } });
  return row ? rowToEntry(row) : null;
}

export async function resetLedger(): Promise<void> {
  await prisma.guardianLedgerEntry.deleteMany();
}

export function verifyLedgerEntries(entries: LedgerEntry[]): {
  ok: boolean;
  brokenAt?: number;
  detail?: string;
} {
  let expectedPrev = GENESIS;
  for (const entry of entries) {
    if (entry.prevHash !== expectedPrev) {
      return {
        ok: false,
        brokenAt: entry.seq,
        detail: `prevHash non coincide alla voce ${entry.seq}`,
      };
    }
    const recomputed = hashLedgerPayload(entry.prevHash, {
      id: entry.id,
      seq: entry.seq,
      prevHash: entry.prevHash,
      timestamp: entry.timestamp,
      action: entry.action,
      decision: entry.decision,
      humanResolution: entry.humanResolution,
    });
    if (recomputed !== entry.hash) {
      return {
        ok: false,
        brokenAt: entry.seq,
        detail: `hash manomesso alla voce ${entry.seq}`,
      };
    }
    expectedPrev = entry.hash;
  }
  return { ok: true };
}

export async function verifyLedger(): Promise<{
  ok: boolean;
  brokenAt?: number;
  detail?: string;
}> {
  const entries = await listLedgerEntries();
  return verifyLedgerEntries(entries);
}
