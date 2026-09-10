import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/curator/auth.server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { buildCommunityTemplate, slugifyCommunityName } from '@/lib/curator/community-template';
import { defaultOrganization } from '@/lib/org/defaults';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { CommunityType } from '@/types';

const ALLOWED_TYPES: CommunityType[] = [
  'comune',
  'regione',
  'ente_regolatorio',
  'azienda_pubblica',
  'azienda',
  'ufficio',
  'progetto',
];

interface CreateBody {
  name?: string;
  type?: CommunityType;
  slug?: string;
  shortName?: string;
  subtitle?: string;
}

export async function POST(request: Request) {
  try {
    const { error } = await requirePermission('admin');
    if (error) return error;

    const body = (await request.json()) as CreateBody;
    const name = body.name?.trim();
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Il nome è obbligatorio (minimo 2 caratteri).' }, { status: 400 });
    }
    if (!body.type || !ALLOWED_TYPES.includes(body.type)) {
      return NextResponse.json({ error: 'Tipo community non valido.' }, { status: 400 });
    }

    const requestedSlug = slugifyCommunityName(body.slug?.trim() || name);
    if (!requestedSlug) {
      return NextResponse.json({ error: 'Slug non valido.' }, { status: 400 });
    }

    const bootstrap = await getCuratorBootstrap();
    const existingSlugs = new Set(bootstrap.communities.map((c) => c.slug));
    let slug = requestedSlug;
    let n = 2;
    while (existingSlugs.has(slug)) {
      slug = `${requestedSlug}-${n}`;
      n += 1;
    }

    const community = buildCommunityTemplate({
      name,
      type: body.type,
      slug,
      shortName: body.shortName,
      subtitle: body.subtitle,
    });

    await updateCuratorStore((store) => {
      const org = store.organization ?? defaultOrganization();
      return {
        ...store,
        customCommunities: [...store.customCommunities, community],
        deletedCommunityIds: (store.deletedCommunityIds ?? []).filter((id) => id !== community.id),
        organization: {
          ...org,
          communityIds: org.communityIds.includes(community.id)
            ? org.communityIds
            : [...org.communityIds, community.id],
        },
      };
    });

    return NextResponse.json({ success: true, community }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/curator/communities]', err);
    const message =
      err instanceof Error && err.message.includes('curator_store')
        ? 'Persistenza non pronta: esegui npm run db:deploy (tabella curator_store).'
        : err instanceof Error
          ? err.message
          : 'Creazione fallita';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
