import { NextResponse } from 'next/server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requireCuratorSession, requirePermission } from '@/lib/curator/auth.server';
import { communities as baseCommunities } from '@/lib/communities';
import { defaultOrganization } from '@/lib/org/defaults';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { Community } from '@/types';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const { communities } = await getCuratorBootstrap();
  const community = communities.find((c) => c.slug === slug);
  if (!community) {
    return NextResponse.json({ error: 'Community non trovata' }, { status: 404 });
  }
  return NextResponse.json({ community });
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, error } = await requireCuratorSession();
  if (error || !session) return error;

  const { slug } = await params;
  const body = (await request.json()) as Partial<Community>;

  await updateCuratorStore((store) => {
    const isCustom = store.customCommunities.some((c) => c.slug === slug);
    if (isCustom) {
      return {
        ...store,
        customCommunities: store.customCommunities.map((c) =>
          c.slug === slug
            ? {
                ...c,
                ...body,
                id: c.id,
                slug: c.slug,
                type: body.type ?? c.type,
              }
            : c
        ),
      };
    }

    return {
      ...store,
      communityOverrides: {
        ...store.communityOverrides,
        [slug]: {
          ...(store.communityOverrides[slug] ?? {}),
          ...body,
          id: undefined,
          slug: undefined,
        },
      },
    };
  });

  const { communities } = await getCuratorBootstrap();
  const community = communities.find((c) => c.slug === slug);
  return NextResponse.json({ success: true, community });
}

/** Soft-close: nasconde la community dal selettore senza cancellare le schede. */
export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requirePermission('admin');
  if (error) return error;

  const { slug } = await params;
  const { communities } = await getCuratorBootstrap();
  const target = communities.find((c) => c.slug === slug);
  if (!target) {
    return NextResponse.json({ error: 'Community non trovata' }, { status: 404 });
  }

  if (communities.length <= 1) {
    return NextResponse.json(
      { error: 'Non puoi chiudere l’unica community aperta.' },
      { status: 400 }
    );
  }

  await updateCuratorStore((store) => {
    const org = store.organization ?? defaultOrganization();
    const deleted = new Set(store.deletedCommunityIds ?? []);
    deleted.add(target.id);

    return {
      ...store,
      deletedCommunityIds: Array.from(deleted),
      organization: {
        ...org,
        communityIds: org.communityIds.filter((id) => id !== target.id),
      },
    };
  });

  const remaining = communities.filter((c) => c.id !== target.id);
  const fallback =
    remaining.find((c) => c.slug === baseCommunities[0]?.slug) ?? remaining[0] ?? null;

  return NextResponse.json({
    success: true,
    closedId: target.id,
    fallbackSlug: fallback?.slug ?? null,
  });
}
