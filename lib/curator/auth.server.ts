import { auth } from '@/auth';
import { defaultOrganization } from '@/lib/org/defaults';
import { isPlatformAdmin } from '@/lib/org/platform-admins';
import {
  canAdminOrg,
  canAdvise,
  canClose,
  canCompile,
  canRequestConsultation,
  resolveMemberRole,
  rosterHasAdmin,
  upsertMember,
} from '@/lib/org/permissions';
import { getCuratorBootstrap, mergeOrganization } from '@/lib/curator/bootstrap.server';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { Organization, OrganizationRole } from '@/types';
import { NextResponse } from 'next/server';

export async function requireCuratorSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }) };
  }
  return { session, error: null };
}

/**
 * Scrive l'owner in curator_store (Postgres) quando serve:
 * - email in ORG_ADMIN_EMAILS
 * - roster vuota o senza admin (primo claim / anti-lockout)
 * Così i ruoli non restano solo calcolati in memoria.
 */
async function ensureOwnerMembership(params: {
  organization: Organization;
  userId: string;
  email?: string | null;
  name?: string | null;
  role: OrganizationRole | null;
}): Promise<Organization> {
  const { organization, userId, email, name, role } = params;
  if (role !== 'owner' && role !== 'admin') return organization;

  const emailNorm = email?.trim().toLowerCase() || null;
  const members = organization.members ?? [];
  const existing = members.find(
    (m) => m.userId === userId || (emailNorm && m.email?.toLowerCase() === emailNorm)
  );

  const alreadyOwnerHere =
    existing &&
    existing.userId === userId &&
    (existing.role === 'owner' || existing.role === 'admin');
  if (alreadyOwnerHere) return organization;

  const claimEmptyOrBroken = members.length === 0 || !rosterHasAdmin(members);
  const claimPlatform = isPlatformAdmin(emailNorm);
  if (!claimEmptyOrBroken && !claimPlatform) return organization;

  try {
    const store = await updateCuratorStore((current) => {
      const org = mergeOrganization(current.organization ?? defaultOrganization());
      const nextMembers = upsertMember(org.members, {
        userId,
        email: emailNorm || existing?.email || `${userId}@users.local`,
        name: name ?? existing?.name,
        role: 'owner',
        addedAt: existing?.addedAt || new Date().toISOString(),
      });
      return {
        ...current,
        version: 2,
        organization: { ...org, members: nextMembers },
      };
    });
    return mergeOrganization(store.organization);
  } catch (err) {
    console.warn('[org] impossibile persistere owner in curator_store', err);
    return organization;
  }
}

export async function getSessionOrgRole() {
  const session = await auth();
  const { organization: bootOrg } = await getCuratorBootstrap();
  let organization = bootOrg ?? defaultOrganization();

  if (!session?.user) {
    return { session: null, organization, role: null as OrganizationRole | null };
  }

  let role = resolveMemberRole(organization, {
    id: session.user.id,
    email: session.user.email,
  });

  organization = await ensureOwnerMembership({
    organization,
    userId: session.user.id!,
    email: session.user.email,
    name: session.user.name,
    role,
  });

  role = resolveMemberRole(organization, {
    id: session.user.id,
    email: session.user.email,
  });

  return { session, organization, role };
}

export async function requirePermission(
  permission: 'compile' | 'close' | 'admin' | 'advise' | 'request_consultation'
) {
  const { session, error } = await requireCuratorSession();
  if (error || !session) return { session: null, role: null as OrganizationRole | null, error };

  const { role } = await getSessionOrgRole();
  const ok =
    permission === 'compile'
      ? canCompile(role)
      : permission === 'close'
        ? canClose(role)
        : permission === 'admin'
          ? canAdminOrg(role)
          : permission === 'advise'
            ? canAdvise(role)
            : canRequestConsultation(role);

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
