import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requirePermission } from '@/lib/curator/auth.server';
import { reasoningRecords as baseRecords } from '@/lib/data';
import { serializeAct, serializeRecord } from '@/lib/curator/serialize';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { CuratorStore } from '@/lib/curator/types';
import { isClosedStatus, isVisibleOnPublicFeed } from '@/lib/records';
import { PublicAct, ReasoningRecord } from '@/types';

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
  return NextResponse.json({ record });
}

interface PatchBody {
  record?: Partial<ReasoningRecord>;
  act?: Partial<PublicAct>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requirePermission('compile');
  if (error) return error;

  const { id } = await params;
  const body = (await request.json()) as PatchBody;
  if (body.record?.status && isClosedStatus(body.record.status)) {
    const close = await requirePermission('close');
    if (close.error) return close.error;
  }
  const isCustom = !baseRecords.some((r) => r.id === id);

  await updateCuratorStore((store) => {
    if (isCustom) {
      const customRecords = store.customRecords.map((record) => {
        if (record.id !== id) return record;
        const updated = serializeRecord({
          ...record,
          ...body.record,
          id: record.id,
          updatedAt: new Date(),
        });
        return updated;
      });

      let customActs = store.customActs;
      if (body.act) {
        const target = customRecords.find((r) => r.id === id);
        if (target) {
          customActs = store.customActs.map((act) =>
            act.id === target.publicActId
              ? serializeAct({ ...act, ...body.act, id: act.id, updatedAt: new Date() })
              : act
          );
        }
      }

      return { ...store, customRecords, customActs };
    }

    const recordOverrides: CuratorStore['recordOverrides'] = {
      ...store.recordOverrides,
      [id]: {
        ...(store.recordOverrides[id] ?? {}),
        ...body.record,
      },
    };

    let actOverrides = store.actOverrides;
    if (body.act) {
      const base = baseRecords.find((r) => r.id === id);
      const actId = base?.publicActId;
      if (actId) {
        actOverrides = {
          ...store.actOverrides,
          [actId]: {
            ...(store.actOverrides[actId] ?? {}),
            ...body.act,
          },
        };
      }
    }

    return { ...store, recordOverrides, actOverrides };
  });

  const { records } = await getCuratorBootstrap();
  const record = records.find((r) => r.id === id);
  return NextResponse.json({ success: true, record });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requirePermission('admin');
  if (error) return error;

  const { id } = await params;
  const isCustom = !baseRecords.some((r) => r.id === id);

  await updateCuratorStore((store) => {
    if (isCustom) {
      const target = store.customRecords.find((r) => r.id === id);
      return {
        ...store,
        customRecords: store.customRecords.filter((r) => r.id !== id),
        customActs: target
          ? store.customActs.filter((a) => a.id !== target.publicActId)
          : store.customActs,
      };
    }
    return {
      ...store,
      deletedRecordIds: Array.from(new Set([...store.deletedRecordIds, id])),
    };
  });

  return NextResponse.json({ success: true });
}
