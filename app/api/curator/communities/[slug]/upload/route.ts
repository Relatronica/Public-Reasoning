import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requireCuratorSession } from '@/lib/curator/auth.server';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { getCommunityBySlug } from '@/lib/communities';

type Params = { params: Promise<{ slug: string }> };

const ALLOWED_TYPES = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function POST(request: Request, { params }: Params) {
  const { error } = await requireCuratorSession();
  if (error) return error;

  const { slug } = await params;
  if (!getCommunityBySlug(slug)) {
    return NextResponse.json({ error: 'Community non trovata' }, { status: 404 });
  }

  const formData = await request.formData();
  const kind = formData.get('kind');
  const file = formData.get('file');

  if (kind !== 'logo' && kind !== 'cover') {
    return NextResponse.json({ error: 'kind deve essere logo o cover' }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'File mancante' }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'File troppo grande (max 2 MB)' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Formato non supportato. Usa SVG, PNG, JPG o WebP.' }, { status: 400 });
  }

  const ext = EXT_BY_MIME[file.type] ?? 'png';
  const filename = kind === 'logo' ? `logo.${ext}` : `cover.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'communities', slug);
  const publicUrl = `/communities/${slug}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

  const overrideKey = kind === 'logo' ? 'logoUrl' : 'coverImageUrl';
  await updateCuratorStore((store) => ({
    ...store,
    communityOverrides: {
      ...store.communityOverrides,
      [slug]: {
        ...(store.communityOverrides[slug] ?? {}),
        [overrideKey]: publicUrl,
      },
    },
  }));

  const { communities } = await getCuratorBootstrap();
  const community = communities.find((c) => c.slug === slug);

  return NextResponse.json({
    success: true,
    url: publicUrl,
    kind,
    community,
  });
}
