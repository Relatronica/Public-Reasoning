import { NextResponse } from 'next/server';
import { listLedgerEntries, verifyLedger } from '@/lib/guardian';
import { resolveEscalation, verifyResolveToken } from '@/lib/guardian/resolve';

export const runtime = 'nodejs';

function htmlPage(title: string, body: string, ok: boolean) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} · Dubitor</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 32rem; margin: 3rem auto; padding: 0 1rem; color: #111; }
    .box { border: 1px solid ${ok ? '#bbf7d0' : '#fecaca'}; background: ${ok ? '#f0fdf4' : '#fef2f2'}; border-radius: 0.75rem; padding: 1.25rem; }
    a { color: #1d4ed8; }
    code { font-size: 0.85em; background: #f3f4f6; padding: 0.1em 0.35em; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <div class="box">
    <h1 style="font-size:1.125rem;margin:0 0 0.5rem">${title}</h1>
    <p style="margin:0;font-size:0.9rem;line-height:1.5;color:#374151">${body}</p>
    <p style="margin:1rem 0 0;font-size:0.8rem"><a href="/guardian?c=ai-governance">Torna alla demo Guardiano</a></p>
  </div>
</body>
</html>`;
}

type ResolveBody = {
  pendingId?: string;
  resolution?: 'allow' | 'deny';
  resolvedBy?: string;
  note?: string;
  token?: string;
};

function parseResolution(v: string | null | undefined): 'allow' | 'deny' | null {
  if (v === 'allow' || v === 'deny') return v;
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pendingId = url.searchParams.get('id');
  const resolution = parseResolution(url.searchParams.get('v'));
  const token = url.searchParams.get('token');

  if (!pendingId || !resolution || !token) {
    return new NextResponse(
      htmlPage('Link non valido', 'Mancano id, verdetto o token.', false),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (!verifyResolveToken(pendingId, resolution, token)) {
    return new NextResponse(
      htmlPage('Token non valido', 'La firma del link non coincide.', false),
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const result = await resolveEscalation({
    pendingId,
    resolution,
    resolvedBy: 'teams-or-link',
    note: `Risolto via link firmato (${resolution})`,
  });

  if (!result.ok) {
    return new NextResponse(htmlPage('Errore', result.error, false), {
      status: result.status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const label = resolution === 'allow' ? 'Approvato' : 'Rifiutato';
  const already = result.alreadyResolved
    ? ' (già risolto in precedenza)'
    : '';
  return new NextResponse(
    htmlPage(
      label,
      `Escalate <code>${pendingId.slice(0, 8)}…</code> chiuso come <strong>${label.toLowerCase()}</strong>${already}. Voce aggiunta al registro.`,
      true
    ),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function POST(request: Request) {
  let body: ResolveBody;
  try {
    body = (await request.json()) as ResolveBody;
  } catch {
    return NextResponse.json({ error: 'JSON non valido' }, { status: 400 });
  }

  const pendingId = body.pendingId;
  const resolution = parseResolution(body.resolution);
  if (!pendingId || !resolution) {
    return NextResponse.json(
      { error: 'Serve pendingId e resolution (allow|deny)' },
      { status: 400 }
    );
  }

  if (body.token && !verifyResolveToken(pendingId, resolution, body.token)) {
    return NextResponse.json({ error: 'Token non valido' }, { status: 403 });
  }

  const result = await resolveEscalation({
    pendingId,
    resolution,
    resolvedBy: body.resolvedBy ?? 'api',
    note: body.note,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const entries = await listLedgerEntries();
  return NextResponse.json({
    pending: result.pending,
    decision: result.decision,
    entry: result.entry,
    alreadyResolved: result.alreadyResolved,
    ledger: {
      length: entries.length,
      integrity: await verifyLedger(),
    },
  });
}
