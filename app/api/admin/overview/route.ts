import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/org/require-platform-admin';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const gate = await requirePlatformAdmin();
  if (gate.error) return gate.error;

  const bootstrap = await getCuratorBootstrap();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      image: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 200,
  });

  return NextResponse.json({
    users,
    communities: bootstrap.communities,
    organization: bootstrap.organization,
    platformAdminEmail: gate.session?.user?.email ?? null,
  });
}
