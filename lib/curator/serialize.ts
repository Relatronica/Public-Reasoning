import { PublicAct, ReasoningRecord } from '@/types';

const DATE_KEYS_RECORD = ['createdAt', 'updatedAt'] as const;
const DATE_KEYS_ACT = ['date', 'createdAt', 'updatedAt'] as const;
const DATE_KEYS_REVIEW = ['reviewDate'] as const;

function reviveDates<T extends Record<string, unknown>>(obj: T, keys: readonly string[]): T {
  const next = { ...obj };
  for (const key of keys) {
    const value = next[key];
    if (typeof value === 'string') {
      (next as Record<string, unknown>)[key] = new Date(value);
    }
  }
  return next;
}

export function reviveRecord(raw: ReasoningRecord): ReasoningRecord {
  let record = reviveDates(raw as unknown as Record<string, unknown>, DATE_KEYS_RECORD) as unknown as ReasoningRecord;
  if (record.publicAct) {
    record = {
      ...record,
      publicAct: reviveAct(record.publicAct),
    };
  }
  if (record.outcomeReviews) {
    record = {
      ...record,
      outcomeReviews: record.outcomeReviews.map(
        (review) =>
          reviveDates(review as unknown as Record<string, unknown>, DATE_KEYS_REVIEW) as unknown as typeof review
      ),
    };
  }
  return record;
}

export function reviveAct(raw: PublicAct): PublicAct {
  return reviveDates(raw as unknown as Record<string, unknown>, DATE_KEYS_ACT) as unknown as PublicAct;
}

export function serializeRecord(record: ReasoningRecord): ReasoningRecord {
  return JSON.parse(JSON.stringify(record)) as ReasoningRecord;
}

export function serializeAct(act: PublicAct): PublicAct {
  return JSON.parse(JSON.stringify(act)) as PublicAct;
}
