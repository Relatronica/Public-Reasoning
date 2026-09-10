import { reasoningRecords as baseRecords } from '@/lib/data';
import { serializeRecord } from '@/lib/curator/serialize';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { CuratorStore } from '@/lib/curator/types';
import { ReasoningRecord } from '@/types';

/** Campi sovrascrivibili su un record seed (tutto tranne identità e snapshot nested). */
function toRecordOverride(record: ReasoningRecord): Partial<ReasoningRecord> {
  const {
    id: _id,
    publicAct: _publicAct,
    compiler: _compiler,
    createdAt: _createdAt,
    ...rest
  } = record;
  return rest;
}

/** Applica un updater immutabile al record (custom o override seed). */
export async function patchRecordInStore(
  id: string,
  updater: (current: ReasoningRecord) => ReasoningRecord
): Promise<ReasoningRecord | null> {
  const isCustom = !baseRecords.some((r) => r.id === id);
  let nextRecord: ReasoningRecord | null = null;

  await updateCuratorStore((store) => {
    if (isCustom) {
      const customRecords = store.customRecords.map((record) => {
        if (record.id !== id) return record;
        nextRecord = serializeRecord({
          ...updater(record),
          id: record.id,
          updatedAt: new Date(),
        });
        return nextRecord!;
      });
      return { ...store, customRecords };
    }

    const base = baseRecords.find((r) => r.id === id);
    if (!base) return store;

    const current: ReasoningRecord = {
      ...base,
      ...(store.recordOverrides[id] ?? {}),
      id,
    };
    nextRecord = serializeRecord({
      ...updater(current),
      id,
      updatedAt: new Date(),
    });

    const recordOverrides: CuratorStore['recordOverrides'] = {
      ...store.recordOverrides,
      [id]: {
        ...(store.recordOverrides[id] ?? {}),
        ...toRecordOverride(nextRecord),
      },
    };

    return { ...store, recordOverrides };
  });

  return nextRecord;
}
