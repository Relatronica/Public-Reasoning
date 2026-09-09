import { Organization, OrganizationMember, OrganizationRole } from '@/types';

const RANK: Record<OrganizationRole, number> = {
  viewer: 0,
  filosofo: 0,
  consulente: 0,
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
  filosofo: 'Filosofo',
  consulente: 'Consulente',
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

/** Può lasciare spunti / rispondere a richieste (filosofo, consulente, admin). */
export function canAdvise(role: OrganizationRole | null | undefined): boolean {
  return (
    role === 'filosofo' ||
    role === 'consulente' ||
    hasMinRole(role, 'admin')
  );
}

/** Qualsiasi membro del workspace può chiedere una consultazione. */
export function canRequestConsultation(role: OrganizationRole | null | undefined): boolean {
  return Boolean(role);
}

export function canReplyToConsultationKind(
  role: OrganizationRole | null | undefined,
  kind: 'filosofica' | 'consulenza'
): boolean {
  if (!role) return false;
  if (hasMinRole(role, 'admin')) return true;
  if (kind === 'filosofica') return role === 'filosofo';
  return role === 'consulente';
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
