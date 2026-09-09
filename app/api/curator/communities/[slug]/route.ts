import { NextResponse } from 'next/server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requireCuratorSession } from '@/lib/curator/auth.server';
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

  await updateCuratorStore((store) => ({
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
  }));

  const { communities } = await getCuratorBootstrap();
  const community = communities.find((c) => c.slug === slug);
  return NextResponse.json({ success: true, community });
}
