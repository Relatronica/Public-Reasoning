import { PublicAct, ReasoningRecord } from '@/types';

export function actsForCommunityId(acts: PublicAct[], communityId: string): PublicAct[] {
  return acts.filter((act) => act.entity.id === communityId);
}

export function recordsForCommunityId(records: ReasoningRecord[], communityId: string): ReasoningRecord[] {
  return records.filter((record) => record.publicAct?.entity.id === communityId);
}
