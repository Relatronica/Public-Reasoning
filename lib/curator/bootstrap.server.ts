import { mergeActs, mergeCommunities, mergeRecords } from '@/lib/curator/merge';
import { readCuratorStore } from '@/lib/curator/store.server';
import { CuratorBootstrap } from '@/lib/curator/types';

export async function getCuratorBootstrap(): Promise<CuratorBootstrap> {
  const store = await readCuratorStore();
  const communities = mergeCommunities(store);
  const acts = mergeActs(store, communities);
  const records = mergeRecords(store, acts);
  return { communities, acts, records };
}
