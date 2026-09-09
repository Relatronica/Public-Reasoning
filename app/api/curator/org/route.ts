import { NextResponse } from 'next/server';
import { getSessionOrgRole, requirePermission } from '@/lib/curator/auth.server';
import { mergeOrganization } from '@/lib/curator/bootstrap.server';
import { defaultOrganization } from '@/lib/org/defaults';
import { upsertMember } from '@/lib/org/permissions';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { OrganizationRole } from '@/types';

const ROLES: OrganizationRole[] = ['owner', 'admin', 'compiler', 'sponsor', 'viewer'];

export async function GET() {
  const { session, error } = await requirePermission('compile');
  if (error || !session) return error;
  const { organization, role } = await getSessionOrgRole();
  return NextResponse.json({ organization, myRole: role });
}

export async function PATCH(request: Request) {
  const { error } = await requirePermission('admin');
  if (error) return error;

  const body = (await request.json()) as {
    name?: string;
    member?: { email: string; name?: string; role: OrganizationRole };
    removeUserId?: string;
  };

  if (body.member && !ROLES.includes(body.member.role)) {
    return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 });
  }

  const store = await updateCuratorStore((current) => {
    const organization = mergeOrganization(current.organization ?? defaultOrganization());
    let members = organization.members;
    if (body.member) {
      const email = body.member.email.trim().toLowerCase();
      members = upsertMember(members, {
        userId: email,
        email,
        name: body.member.name,
        role: body.member.role,
        addedAt: new Date().toISOString(),
      });
    }
    if (body.removeUserId) {
      members = members.filter((m) => m.userId !== body.removeUserId);
    }
    return {
      ...current,
      version: 2,
      organization: {
        ...organization,
        name: body.name?.trim() || organization.name,
        members,
      },
    };
  });

  return NextResponse.json({ organization: mergeOrganization(store.organization) });
}
