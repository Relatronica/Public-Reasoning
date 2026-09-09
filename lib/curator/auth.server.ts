import { auth } from '@/auth';
import { defaultOrganization } from '@/lib/org/defaults';
import { canAdminOrg, canClose, canCompile, resolveMemberRole } from '@/lib/org/permissions';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { OrganizationRole } from '@/types';
import { NextResponse } from 'next/server';

export async function requireCuratorSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function getSessionOrgRole() {
  const session = await auth();
  const { organization } = await getCuratorBootstrap();
  const org = organization ?? defaultOrganization();
  if (!session?.user) {
    return { session: null, organization: org, role: null as OrganizationRole | null };
  }
  const role = resolveMemberRole(org, {
    id: session.user.id,
    email: session.user.email,
  });
  return { session, organization: org, role };
}

export async function requirePermission(permission: 'compile' | 'close' | 'admin') {
  const { session, error } = await requireCuratorSession();
  if (error || !session) return { session: null, role: null as OrganizationRole | null, error };

  const { role } = await getSessionOrgRole();
  const ok =
    permission === 'compile'
      ? canCompile(role)
      : permission === 'close'
        ? canClose(role)
        : canAdminOrg(role);

  if (!ok) {
    return {
      session,
      role,
      error: NextResponse.json(
        { error: 'Permesso insufficiente per questa azione.' },
        { status: 403 }
      ),
    };
  }
  return { session, role, error: null };
}
