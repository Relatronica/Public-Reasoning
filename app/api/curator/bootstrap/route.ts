import { NextResponse } from 'next/server';
import { getSessionOrgRole } from '@/lib/curator/auth.server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { filterVisibleCommunities } from '@/lib/communities/visibility';
import { isPlatformAdmin } from '@/lib/org/platform-admins';
import { canAdminOrg } from '@/lib/org/permissions';
import { isVisibleOnPublicFeed } from '@/lib/records';

export async function GET() {
  const bootstrap = await getCuratorBootstrap();
  const { session, role, organization } = await getSessionOrgRole();
  const platformAdmin = isPlatformAdmin(session?.user?.email);
  const includeHidden = platformAdmin || canAdminOrg(role);

  const communities = filterVisibleCommunities(bootstrap.communities, { includeHidden });
  const allowedIds = new Set(communities.map((c) => c.id));
  const acts = bootstrap.acts.filter((a) => allowedIds.has(a.entity.id));
  const records = bootstrap.records.filter((r) => {
    const communityId = r.publicAct?.entity?.id;
    return communityId ? allowedIds.has(communityId) : false;
  });

  if (session?.user?.id) {
    return NextResponse.json({
      ...bootstrap,
      communities,
      acts,
      records,
      organization,
      myRole: role,
      isPlatformAdmin: platformAdmin,
    });
  }

  return NextResponse.json({
    ...bootstrap,
    communities,
    acts,
    records: records.filter(isVisibleOnPublicFeed),
    myRole: null,
    isPlatformAdmin: false,
  });
}
