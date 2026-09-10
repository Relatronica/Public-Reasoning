import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/org/require-platform-admin';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { isPlatformAdmin } from '@/lib/org/platform-admins';
import { prisma } from '@/lib/prisma';
import { OrganizationMember, OrganizationRole } from '@/types';

function findMemberRole(
  members: OrganizationMember[],
  user: { id: string; email?: string | null }
): OrganizationRole | null {
  const byId = members.find((m) => m.userId === user.id);
  if (byId) return byId.role;
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;
  return members.find((m) => m.email?.toLowerCase() === email || m.userId === email)?.role ?? null;
}

export async function GET() {
  const gate = await requirePlatformAdmin();
  if (gate.error) return gate.error;

  const bootstrap = await getCuratorBootstrap();
  const members = bootstrap.organization.members ?? [];

  const usersRaw = await prisma.user.findMany({
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
      _count: { select: { records: true } },
    },
    take: 200,
  });

  const users = usersRaw.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    username: u.username,
    avatar: u.avatar,
    image: u.image,
    bio: u.bio,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    recordsCount: u._count.records,
    orgRole: findMemberRole(members, u),
    isPlatformAdmin: isPlatformAdmin(u.email),
  }));

  return NextResponse.json({
    users,
    communities: bootstrap.communities,
    organization: bootstrap.organization,
    platformAdminEmail: gate.session?.user?.email ?? null,
  });
}
