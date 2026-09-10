import { communities as baseCommunities } from '@/lib/communities';
import { publicActs as baseActs, reasoningRecords as baseRecords } from '@/lib/data';
import { Community, PublicAct, ReasoningRecord } from '@/types';
import { CuratorStore } from '@/lib/curator/types';
import { reviveAct, reviveRecord } from '@/lib/curator/serialize';

function mergeCommunity(base: Community, override?: Partial<Community>): Community {
  const merged = override
    ? { ...base, ...override, id: base.id, slug: base.slug, type: override.type ?? base.type }
    : base;
  return {
    ...merged,
    isVisible: merged.isVisible !== false,
  };
}

export function mergeCommunities(store: CuratorStore): Community[] {
  const deleted = new Set(store.deletedCommunityIds ?? []);
  const merged = baseCommunities
    .filter((base) => !deleted.has(base.id))
    .map((base) => mergeCommunity(base, store.communityOverrides[base.slug]));

  const custom = store.customCommunities
    .filter((c) => !deleted.has(c.id))
    .map((c) => mergeCommunity(c, store.communityOverrides[c.slug]));

  return [...merged, ...custom];
}

function mergeAct(base: PublicAct, override?: Partial<PublicAct>, communities?: Community[]): PublicAct {
  const merged = override ? { ...base, ...override, id: base.id } : base;
  const community = communities?.find((c) => c.id === merged.entity.id) ?? merged.entity;
  return { ...merged, entity: community };
}

export function mergeActs(store: CuratorStore, communities: Community[]): PublicAct[] {
  const deleted = new Set(store.deletedActIds);
  const byId = new Map<string, PublicAct>();

  for (const act of baseActs) {
    if (deleted.has(act.id)) continue;
    const revived = reviveAct(act);
    byId.set(
      act.id,
      mergeAct(revived, store.actOverrides[act.id], communities)
    );
  }

  for (const act of store.customActs) {
    if (deleted.has(act.id)) continue;
    const revived = reviveAct(act);
    const community = communities.find((c) => c.id === revived.entity.id) ?? revived.entity;
    byId.set(act.id, { ...revived, entity: community });
  }

  return Array.from(byId.values());
}

function mergeRecord(
  base: ReasoningRecord,
  override: Partial<ReasoningRecord> | undefined,
  actsById: Map<string, PublicAct>
): ReasoningRecord {
  const merged = override ? { ...base, ...override, id: base.id } : base;
  const publicAct = actsById.get(merged.publicActId) ?? merged.publicAct;
  return reviveRecord({ ...merged, publicAct });
}

export function mergeRecords(store: CuratorStore, acts: PublicAct[]): ReasoningRecord[] {
  const deleted = new Set(store.deletedRecordIds);
  const actsById = new Map(acts.map((a) => [a.id, a]));
  const byId = new Map<string, ReasoningRecord>();

  for (const record of baseRecords) {
    if (deleted.has(record.id)) continue;
    byId.set(
      record.id,
      mergeRecord(reviveRecord(record), store.recordOverrides[record.id], actsById)
    );
  }

  for (const record of store.customRecords) {
    if (deleted.has(record.id)) continue;
    byId.set(record.id, mergeRecord(reviveRecord(record), undefined, actsById));
  }

  return Array.from(byId.values());
}

export function getCommunityBySlugMerged(communities: Community[], slug?: string | null): Community {
  const found = communities.find((c) => c.slug === slug);
  return found ?? communities[0];
}
