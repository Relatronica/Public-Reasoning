import { NextResponse } from 'next/server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requirePermission } from '@/lib/curator/auth.server';
import { patchRecordInStore } from '@/lib/curator/patch-record.server';
import { newEntityId } from '@/lib/curator/ids';
import { DecisionInsight, DecisionInsightKind, ReasoningRecord } from '@/types';

type Params = { params: Promise<{ id: string }> };

const KINDS: DecisionInsightKind[] = ['spunto', 'alert', 'domanda', 'consulenza'];

interface CreateInsightBody {
  kind?: DecisionInsightKind;
  title?: string;
  body?: string;
  relatedStepId?: string;
}

/** Aggiunge uno spunto (filosofo / consulente / admin). */
export async function POST(request: Request, { params }: Params) {
  const gate = await requirePermission('advise');
  if (gate.error || !gate.session || !gate.role) return gate.error!;

  const { id } = await params;
  const body = (await request.json()) as CreateInsightBody;
  const kind = KINDS.includes(body.kind as DecisionInsightKind)
    ? (body.kind as DecisionInsightKind)
    : gate.role === 'consulente'
      ? 'consulenza'
      : 'spunto';
  const title = (body.title ?? '').trim();
  const text = (body.body ?? '').trim();

  if (title.length < 3 || text.length < 8) {
    return NextResponse.json(
      { error: 'Titolo e testo dello spunto sono obbligatori.' },
      { status: 400 }
    );
  }

  const { records } = await getCuratorBootstrap();
  if (!records.some((r) => r.id === id)) {
    return NextResponse.json({ error: 'Record non trovato' }, { status: 404 });
  }

  const roleLabel =
    gate.role === 'filosofo'
      ? 'Filosofo'
      : gate.role === 'consulente'
        ? 'Consulente'
        : 'Team';

  const insight: DecisionInsight = {
    id: newEntityId('insight'),
    kind,
    title,
    body: text,
    author: gate.session.user!.name ?? roleLabel,
    role: roleLabel,
    relatedStepId: body.relatedStepId?.trim() || undefined,
    authorUserId: gate.session.user!.id!,
    createdAt: new Date().toISOString(),
  };

  const updated = await patchRecordInStore(id, (current: ReasoningRecord) => ({
    ...current,
    insights: [...(current.insights ?? []), insight],
  }));

  return NextResponse.json({ success: true, insight, record: updated });
}
