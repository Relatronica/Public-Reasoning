import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requirePermission } from '@/lib/curator/auth.server';
import { patchRecordInStore } from '@/lib/curator/patch-record.server';
import { newEntityId } from '@/lib/curator/ids';
import { canReplyToConsultationKind } from '@/lib/org/permissions';
import { isVisibleOnPublicFeed } from '@/lib/records';
import {
  ConsultationKind,
  ConsultationRequest,
  DecisionInsight,
  ReasoningRecord,
} from '@/types';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  const { records } = await getCuratorBootstrap();
  const record = records.find((r) => r.id === id);
  if (!record) {
    return NextResponse.json({ error: 'Record non trovato' }, { status: 404 });
  }
  if (!session?.user?.id && !isVisibleOnPublicFeed(record)) {
    return NextResponse.json({ error: 'Record non trovato' }, { status: 404 });
  }
  return NextResponse.json({
    consultationRequests: record.consultationRequests ?? [],
    insights: record.insights ?? [],
  });
}

interface CreateBody {
  kind?: ConsultationKind;
  question?: string;
  assigneeUserId?: string;
  assigneeEmail?: string;
}

/** Crea una richiesta di consultazione sulla scheda. */
export async function POST(request: Request, { params }: Params) {
  const gate = await requirePermission('request_consultation');
  if (gate.error || !gate.session) return gate.error!;

  const { id } = await params;
  const body = (await request.json()) as CreateBody;
  const kind = body.kind === 'filosofica' ? 'filosofica' : 'consulenza';
  const question = (body.question ?? '').trim();
  if (question.length < 8) {
    return NextResponse.json(
      { error: 'Scrivi una domanda un po’ più chiara (almeno qualche parola).' },
      { status: 400 }
    );
  }

  const { records } = await getCuratorBootstrap();
  if (!records.some((r) => r.id === id)) {
    return NextResponse.json({ error: 'Record non trovato' }, { status: 404 });
  }

  const entry: ConsultationRequest = {
    id: newEntityId('consult'),
    kind,
    status: 'aperta',
    question,
    requestedBy: {
      userId: gate.session.user!.id!,
      name: gate.session.user!.name ?? undefined,
      email: gate.session.user!.email ?? undefined,
    },
    assigneeUserId: body.assigneeUserId,
    assigneeEmail: body.assigneeEmail,
    createdAt: new Date().toISOString(),
  };

  const updated = await patchRecordInStore(id, (current) => ({
    ...current,
    consultationRequests: [...(current.consultationRequests ?? []), entry],
  }));

  return NextResponse.json({ success: true, request: entry, record: updated });
}

interface ReplyBody {
  requestId?: string;
  title?: string;
  body?: string;
  relatedStepId?: string;
}

/** Risposta di filosofo/consulente: chiude la richiesta e aggiunge uno spunto. */
export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission('advise');
  if (gate.error || !gate.session || !gate.role) return gate.error!;

  const { id } = await params;
  const body = (await request.json()) as ReplyBody;
  const requestId = body.requestId?.trim();
  const title = (body.title ?? '').trim();
  const text = (body.body ?? '').trim();

  if (!requestId) {
    return NextResponse.json({ error: 'Richiesta mancante' }, { status: 400 });
  }
  if (title.length < 3 || text.length < 8) {
    return NextResponse.json(
      { error: 'Titolo e risposta sono obbligatori.' },
      { status: 400 }
    );
  }

  const { records } = await getCuratorBootstrap();
  const record = records.find((r) => r.id === id);
  if (!record) {
    return NextResponse.json({ error: 'Record non trovato' }, { status: 404 });
  }

  const target = (record.consultationRequests ?? []).find((r) => r.id === requestId);
  if (!target) {
    return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
  }
  if (target.status === 'chiusa') {
    return NextResponse.json({ error: 'Questa richiesta è già chiusa.' }, { status: 400 });
  }
  if (!canReplyToConsultationKind(gate.role, target.kind)) {
    return NextResponse.json(
      {
        error:
          target.kind === 'filosofica'
            ? 'Solo i filosofi (o gli admin) possono rispondere a questa richiesta.'
            : 'Solo i consulenti (o gli admin) possono rispondere a questa richiesta.',
      },
      { status: 403 }
    );
  }

  const insightId = newEntityId('insight');
  const authorName = gate.session.user!.name ?? 'Consulente';
  const insight: DecisionInsight = {
    id: insightId,
    kind: target.kind === 'filosofica' ? 'spunto' : 'consulenza',
    title,
    body: text,
    author: authorName,
    role: target.kind === 'filosofica' ? 'Filosofo' : 'Consulente',
    relatedStepId: body.relatedStepId?.trim() || 'decision',
    consultationRequestId: requestId,
    authorUserId: gate.session.user!.id!,
    createdAt: new Date().toISOString(),
  };

  const updated = await patchRecordInStore(id, (current: ReasoningRecord) => {
    const requests = (current.consultationRequests ?? []).map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'chiusa' as const,
            updatedAt: new Date().toISOString(),
            responseInsightId: insightId,
          }
        : r
    );
    return {
      ...current,
      consultationRequests: requests,
      insights: [...(current.insights ?? []), insight],
    };
  });

  return NextResponse.json({ success: true, insight, record: updated });
}
