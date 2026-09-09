import { Community, PublicAct, ReasoningRecord } from '@/types';

export interface CuratorStore {
  version: 1;
  communityOverrides: Record<string, Partial<Community>>;
  customCommunities: Community[];
  recordOverrides: Record<string, Partial<ReasoningRecord>>;
  actOverrides: Record<string, Partial<PublicAct>>;
  customRecords: ReasoningRecord[];
  customActs: PublicAct[];
  deletedRecordIds: string[];
  deletedActIds: string[];
}

export interface CuratorBootstrap {
  communities: Community[];
  acts: PublicAct[];
  records: ReasoningRecord[];
}

export const EMPTY_CURATOR_STORE: CuratorStore = {
  version: 1,
  communityOverrides: {},
  customCommunities: [],
  recordOverrides: {},
  actOverrides: {},
  customRecords: [],
  customActs: [],
  deletedRecordIds: [],
  deletedActIds: [],
};
