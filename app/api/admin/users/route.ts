import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/org/require-platform-admin';
import { getCuratorBootstrap, mergeOrganization } from '@/lib/curator/bootstrap.server';
import { defaultOrganization } from '@/lib/org/defaults';
import { isPlatformAdmin } from '@/lib/org/platform-admins';
import {
  isOrganizationRole,
  rosterHasAdmin,
  upsertMember,
} from '@/lib/org/permissions';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { prisma } from '@/lib/prisma';
import { OrganizationMember, OrganizationRole } from '@/types';

function findMember(
  members: OrganizationMember[],
  user: { id: string; email?: string | null }
): OrganizationMember | undefined {
  const byId = members.find((m) => m.userId === user.id);
  if (byId) return byId;
  const email = user.email?.trim().toLowerCase();
  if (!email) return undefined;
  return members.find((m) => m.email?.toLowerCase() === email);
}

function withoutUser(members: OrganizationMember[], user: { id: string; email?: string | null }) {
  const email = user.email?.trim().toLowerCase();
  return members.filter(
    (m) => m.userId !== user.id && !(email && (m.email?.toLowerCase() === email || m.userId === email))
  );
}

/** Imposta o rimuove il ruolo workspace di un utente Auth. role=null → fuori roster. */
export async function PATCH(request: Request) {
  const gate = await requirePlatformAdmin();
  if (gate.error || !gate.session?.user) return gate.error!;

  const body = (await request.json()) as {
    userId?: string;
    role?: OrganizationRole | null;
  };

  if (!body.userId) {
    return NextResponse.json({ error: 'userId obbligatorio' }, { status: 400 });
  }
  if (body.role !== null && body.role !== undefined && !isOrganizationRole(body.role)) {
    return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { id: true, email: true, name: true, username: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
  }

  let reject: string | null = null;
  const store = await updateCuratorStore((current) => {
    const organization = mergeOrganization(current.organization ?? defaultOrganization());
    const existing = findMember(organization.members, target);
    let members: OrganizationMember[];

    if (body.role == null) {
      members = withoutUser(organization.members, target);
      if (members.length > 0 && !rosterHasAdmin(members) && !isPlatformAdmin(gate.session!.user!.email)) {
        reject = 'Deve restare almeno un proprietario o amministratore nella roster.';
        return current;
      }
    } else {
      members = upsertMember(withoutUser(organization.members, target), {
        userId: target.id,
        email: target.email?.toLowerCase() || existing?.email,
        name: target.name || target.username || existing?.name,
        role: body.role,
        addedAt: existing?.addedAt || new Date().toISOString(),
      });
    }

    return {
      ...current,
      version: 2,
      organization: { ...organization, members },
    };
  });

  if (reject) {
    return NextResponse.json({ error: reject }, { status: 400 });
  }

  const org = mergeOrganization(store.organization);
  return NextResponse.json({
    ok: true,
    userId: target.id,
    orgRole: findMember(org.members, target)?.role ?? null,
    organization: org,
  });
}

/** Elimina utente Auth (+ account/session) e lo toglie dalla roster. */
export async function DELETE(request: Request) {
  const gate = await requirePlatformAdmin();
  if (gate.error || !gate.session?.user) return gate.error!;

  const userId = new URL(request.url).searchParams.get('userId') || undefined;
  if (!userId) {
    return NextResponse.json({ error: 'userId obbligatorio' }, { status: 400 });
  }
  if (userId === gate.session.user.id) {
    return NextResponse.json(
      { error: 'Non puoi eliminare il tuo stesso account da questa console.' },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
  }
  if (isPlatformAdmin(target.email)) {
    return NextResponse.json(
      { error: 'Non puoi eliminare un super-admin (ORG_ADMIN_EMAILS). Rimuovilo prima dall’env.' },
      { status: 400 }
    );
  }

  const recordCount = await prisma.reasoningRecord.count({ where: { compilerId: userId } });
  if (recordCount > 0) {
    return NextResponse.json(
      {
        error: `L’utente ha ${recordCount} schede come compilatore. Riassegna o elimina le schede prima.`,
      },
      { status: 400 }
    );
  }

  await updateCuratorStore((current) => {
    const organization = mergeOrganization(current.organization ?? defaultOrganization());
    let members = withoutUser(organization.members, target);
    if (members.length > 0 && !rosterHasAdmin(members)) {
      const actorEmail = gate.session!.user!.email?.toLowerCase();
      if (actorEmail) {
        members = upsertMember(members, {
          userId: gate.session!.user!.id!,
          email: actorEmail,
          name: gate.session!.user!.name ?? undefined,
          role: 'owner',
          addedAt: new Date().toISOString(),
        });
      }
    }
    return {
      ...current,
      version: 2,
      organization: { ...organization, members },
    };
  });

  await prisma.user.delete({ where: { id: userId } });

  const bootstrap = await getCuratorBootstrap();
  return NextResponse.json({
    ok: true,
    deletedUserId: userId,
    organization: bootstrap.organization,
  });
}
