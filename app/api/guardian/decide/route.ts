import { NextResponse } from 'next/server';
import { listLedgerEntries, verifyLedger, runGuardianCheck, type AgentAction } from '@/lib/guardian';

export const runtime = 'nodejs';

type DecideBody = {
  action?: AgentAction;
  /** Pack / community slug: `ai-governance` | `ai-ethics`. */
  pack?: string;
  humanResolution?: 'allow' | 'deny';
  humanNote?: string;
  /** Se false, non invia Slack/Teams. Default true. */
  notify?: boolean;
};

export async function POST(request: Request) {
  let body: DecideBody;
  try {
    body = (await request.json()) as DecideBody;
  } catch {
    return NextResponse.json({ error: 'JSON non valido' }, { status: 400 });
  }

  if (!body.action?.action || typeof body.action.action !== 'string') {
    return NextResponse.json(
      { error: 'Serve action.action (stringa)' },
      { status: 400 }
    );
  }

  const result = await runGuardianCheck({
    action: body.action,
    pack: body.pack,
    humanResolution: body.humanResolution,
    humanNote: body.humanNote,
    notify: body.notify,
  });

  const entries = await listLedgerEntries();
  return NextResponse.json({
    pack: result.pack,
    decision: result.decision,
    entry: result.entry,
    pending: result.pending,
    notify: result.notify,
    ledger: {
      length: entries.length,
      integrity: await verifyLedger(),
    },
  });
}
