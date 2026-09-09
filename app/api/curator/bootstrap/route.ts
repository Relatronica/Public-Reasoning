import { NextResponse } from 'next/server';
import { getSessionOrgRole } from '@/lib/curator/auth.server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { isVisibleOnPublicFeed } from '@/lib/records';

export async function GET() {
  const bootstrap = await getCuratorBootstrap();
  const { session, role } = await getSessionOrgRole();
  if (session?.user?.id) {
    return NextResponse.json({ ...bootstrap, myRole: role });
  }
  return NextResponse.json({
    ...bootstrap,
    myRole: null,
    records: bootstrap.records.filter(isVisibleOnPublicFeed),
  });
}
