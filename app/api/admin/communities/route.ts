import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/org/require-platform-admin';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';

export async function PATCH(request: Request) {
  const gate = await requirePlatformAdmin();
  if (gate.error) return gate.error;

  const body = (await request.json()) as { slug?: string; isVisible?: boolean };
  const slug = body.slug?.trim();
  if (!slug || typeof body.isVisible !== 'boolean') {
    return NextResponse.json(
      { error: 'Serve slug e isVisible (boolean).' },
      { status: 400 }
    );
  }

  const bootstrap = await getCuratorBootstrap();
  const community = bootstrap.communities.find((c) => c.slug === slug);
  if (!community) {
    return NextResponse.json({ error: 'Community non trovata.' }, { status: 404 });
  }

  const store = await updateCuratorStore((current) => {
    const customIdx = current.customCommunities.findIndex((c) => c.slug === slug);
    if (customIdx >= 0) {
      const customCommunities = [...current.customCommunities];
      customCommunities[customIdx] = {
        ...customCommunities[customIdx],
        isVisible: body.isVisible,
      };
      return { ...current, version: 2, customCommunities };
    }

    return {
      ...current,
      version: 2,
      communityOverrides: {
        ...current.communityOverrides,
        [slug]: {
          ...(current.communityOverrides[slug] ?? {}),
          isVisible: body.isVisible,
        },
      },
    };
  });

  const next = await getCuratorBootstrap();
  return NextResponse.json({
    ok: true,
    community: next.communities.find((c) => c.slug === slug),
    storeVersion: store.version,
  });
}
