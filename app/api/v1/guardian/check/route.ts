import { NextResponse } from 'next/server';
import {
  authorizeGuardianApi,
  listLedgerEntries,
  runGuardianCheck,
  verifyLedger,
  type AgentAction,
} from '@/lib/guardian';

export const runtime = 'nodejs';

/**
 * Decision API — check azione agente.
 *
 * POST /api/v1/guardian/check
 * Authorization: Bearer <GUARDIAN_API_KEY>
 * Body: { action, resource?, context?, agentId?, notify? }
 */
export async function POST(request: Request) {
  const auth = authorizeGuardianApi(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    action?: string;
    resource?: string;
    context?: Record<string, string | number | boolean>;
    agentId?: string;
    notify?: boolean;
    /** Pack / community: `ai-governance` | `ai-ethics`. Default ai-governance. */
    pack?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'JSON non valido' }, { status: 400 });
  }

  if (!body.action || typeof body.action !== 'string') {
    return NextResponse.json({ error: 'Serve action (stringa)' }, { status: 400 });
  }

  const agentAction: AgentAction = {
    action: body.action,
    resource: body.resource,
    context: body.context,
    agentId: body.agentId,
  };

  const result = await runGuardianCheck({
    action: agentAction,
    pack: body.pack,
    notify: body.notify,
  });

  return NextResponse.json({
    pack: result.pack,
    verdict: result.decision.verdict,
    decision: result.decision,
    entry: {
      id: result.entry.id,
      seq: result.entry.seq,
      hash: result.entry.hash,
      timestamp: result.entry.timestamp,
    },
    pending: result.pending
      ? {
          id: result.pending.id,
          status: result.pending.status,
          notified: result.pending.notified,
        }
      : null,
    notify: result.notify,
  });
}

/** GET: stato ledger (ultime voci) + integrità. */
export async function GET(request: Request) {
  const auth = authorizeGuardianApi(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get('limit') ?? '50');
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 200)
    : 50;

  const entries = await listLedgerEntries();
  const tail = entries.slice(-limit);

  return NextResponse.json({
    length: entries.length,
    integrity: await verifyLedger(),
    entries: tail.map((e) => ({
      id: e.id,
      seq: e.seq,
      hash: e.hash,
      prevHash: e.prevHash,
      timestamp: e.timestamp,
      verdict: e.decision.verdict,
      action: e.action.action,
      humanResolution: e.humanResolution ?? null,
    })),
  });
}
