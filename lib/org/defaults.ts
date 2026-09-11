import { communities } from '@/lib/communities';
import { Organization } from '@/types';

export const DEFAULT_ORG_ID = 'org-dubitor-demo';

export function defaultOrganization(): Organization {
  return {
    id: DEFAULT_ORG_ID,
    slug: 'dubitor-demo',
    name: 'Dubitor Demo',
    communityIds: communities.map((c) => c.id),
    members: [],
  };
}
