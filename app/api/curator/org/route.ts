import { NextResponse } from 'next/server';
import { getSessionOrgRole, requirePermission } from '@/lib/curator/auth.server';
import { mergeOrganization } from '@/lib/curator/bootstrap.server';
import { defaultOrganization } from '@/lib/org/defaults';
import {
  isOrganizationRole,
  rosterHasAdmin,
  upsertMember,
} from '@/lib/org/permissions';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { OrganizationRole } from '@/types';

export async function GET() {
  const gate = await requirePermission('compile');
  if (gate.error || !gate.session) return gate.error!;
  const { organization, role } = await getSessionOrgRole();
  return NextResponse.json({ organization, myRole: role });
}

export async function PATCH(request: Request) {
  const gate = await requirePermission('admin');
  if (gate.error || !gate.session?.user) return gate.error!;

  const session = gate.session;
  const user = session.user!;
  const body = (await request.json()) as {
    name?: string;
    member?: { email: string; name?: string; role: OrganizationRole };
    removeUserId?: string;
  };

  if (body.member && !isOrganizationRole(body.member.role)) {
    return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 });
  }

  const actorEmail = user.email?.trim().toLowerCase();
  const actorName = user.name ?? undefined;
  let reject: string | null = null;

  const store = await updateCuratorStore((current) => {
    const organization = mergeOrganization(current.organization ?? defaultOrganization());
    let members = organization.members;
    const wasEmpty = members.length === 0;

    if (body.member) {
      const email = body.member.email.trim().toLowerCase();
      members = upsertMember(members, {
        userId: email,
        email,
        name: body.member.name,
        role: body.member.role,
        addedAt: new Date().toISOString(),
      });

      // Prima chiusura della roster: garantisci un owner (chi sta gestendo il team).
      if (wasEmpty && actorEmail) {
        members = upsertMember(members, {
          userId: actorEmail,
          email: actorEmail,
          name: actorName,
          role: 'owner',
          addedAt: new Date().toISOString(),
        });
      }
    }

    if (body.removeUserId) {
      const removeId = body.removeUserId;
      const next = members.filter(
        (m) => m.userId !== removeId && m.email?.toLowerCase() !== removeId.toLowerCase()
      );
      if (next.length > 0 && !rosterHasAdmin(next)) {
        reject =
          'Deve restare almeno un proprietario o amministratore. Promuovi qualcuno prima di rimuovere l’ultimo.';
        return current;
      }
      members = next;
    }

    // Guarigione: roster con membri ma senza admin → promuovi chi sta agendo.
    if (members.length > 0 && !rosterHasAdmin(members) && actorEmail) {
      members = upsertMember(members, {
        userId: actorEmail,
        email: actorEmail,
        name: actorName,
        role: 'owner',
        addedAt: new Date().toISOString(),
      });
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

  if (reject) {
    return NextResponse.json({ error: reject }, { status: 400 });
  }

  return NextResponse.json({ organization: mergeOrganization(store.organization) });
}
