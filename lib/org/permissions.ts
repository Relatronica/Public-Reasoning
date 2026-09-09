import { Organization, OrganizationMember, OrganizationRole } from '@/types';

const RANK: Record<OrganizationRole, number> = {
  viewer: 0,
  compiler: 1,
  sponsor: 2,
  admin: 3,
  owner: 4,
};

export const ROLE_LABELS: Record<OrganizationRole, string> = {
  owner: 'Proprietario',
  admin: 'Amministratore',
  compiler: 'Compilatore',
  sponsor: 'Sponsor',
  viewer: 'Lettore',
};

export function hasMinRole(role: OrganizationRole | null | undefined, min: OrganizationRole): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[min];
}

export function canCompile(role: OrganizationRole | null | undefined): boolean {
  return hasMinRole(role, 'compiler');
}

export function canClose(role: OrganizationRole | null | undefined): boolean {
  return role === 'sponsor' || hasMinRole(role, 'admin');
}

export function canAdminOrg(role: OrganizationRole | null | undefined): boolean {
  return hasMinRole(role, 'admin');
}

export function resolveMemberRole(
  org: Organization,
  user: { id?: string | null; email?: string | null }
): OrganizationRole | null {
  const id = user.id ?? '';
  const email = user.email?.toLowerCase();
  const byId = org.members.find((m) => m.userId === id);
  if (byId) return byId.role;
  if (email) {
    const byEmail = org.members.find((m) => m.email?.toLowerCase() === email);
    if (byEmail) return byEmail.role;
  }
  if (org.members.length === 0) return 'owner';
  return null;
}

export function upsertMember(
  members: OrganizationMember[],
  member: OrganizationMember
): OrganizationMember[] {
  const idx = members.findIndex(
    (m) => m.userId === member.userId || (member.email && m.email?.toLowerCase() === member.email.toLowerCase())
  );
  if (idx === -1) return [...members, member];
  const next = [...members];
  next[idx] = { ...next[idx], ...member };
  return next;
}
