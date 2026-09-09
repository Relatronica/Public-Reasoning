import { Community, Organization, OrganizationRole, PublicAct, ReasoningRecord } from '@/types';

export interface CuratorStore {
  version: 1 | 2;
  communityOverrides: Record<string, Partial<Community>>;
  customCommunities: Community[];
  recordOverrides: Record<string, Partial<ReasoningRecord>>;
  actOverrides: Record<string, Partial<PublicAct>>;
  customRecords: ReasoningRecord[];
  customActs: PublicAct[];
  deletedRecordIds: string[];
  deletedActIds: string[];
  deletedCommunityIds: string[];
  organization?: Organization;
}

export interface CuratorBootstrap {
  communities: Community[];
  acts: PublicAct[];
  records: ReasoningRecord[];
  organization: Organization;
  myRole: OrganizationRole | null;
}

export const EMPTY_CURATOR_STORE: CuratorStore = {
  version: 2,
  communityOverrides: {},
  customCommunities: [],
  recordOverrides: {},
  actOverrides: {},
  customRecords: [],
  customActs: [],
  deletedRecordIds: [],
  deletedActIds: [],
  deletedCommunityIds: [],
};
