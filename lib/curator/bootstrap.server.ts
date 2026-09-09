import { mergeActs, mergeCommunities, mergeRecords } from '@/lib/curator/merge';
import { readCuratorStore } from '@/lib/curator/store.server';
import { CuratorBootstrap } from '@/lib/curator/types';
import { defaultOrganization } from '@/lib/org/defaults';
import { Organization } from '@/types';

export function mergeOrganization(storeOrg?: Organization): Organization {
  const base = defaultOrganization();
  if (!storeOrg) return base;
  return {
    ...base,
    ...storeOrg,
    communityIds: storeOrg.communityIds?.length ? storeOrg.communityIds : base.communityIds,
    members: storeOrg.members ?? [],
  };
}

export async function getCuratorBootstrap(): Promise<CuratorBootstrap> {
  const store = await readCuratorStore();
  const communities = mergeCommunities(store);
  const acts = mergeActs(store, communities);
  const records = mergeRecords(store, acts);
  const organization = mergeOrganization(store.organization);
  return { communities, acts, records, organization, myRole: null };
}
