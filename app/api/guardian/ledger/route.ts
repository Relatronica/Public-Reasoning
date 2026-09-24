import { NextResponse } from 'next/server';
import {
  allowGuardianReset,
  listLedgerEntries,
  resetLedger,
  resetPending,
  verifyLedger,
} from '@/lib/guardian';

export const runtime = 'nodejs';

export async function GET() {
  const entries = await listLedgerEntries();
  return NextResponse.json({
    entries,
    integrity: await verifyLedger(),
  });
}

/** Reset ledger + pending (demo). Disabilitato in produzione salvo GUARDIAN_ALLOW_RESET. */
export async function DELETE() {
  if (!allowGuardianReset()) {
    return NextResponse.json(
      { error: 'Reset disabilitato in produzione' },
      { status: 403 }
    );
  }
  await resetLedger();
  await resetPending();
  return NextResponse.json({ ok: true, entries: [] });
}
