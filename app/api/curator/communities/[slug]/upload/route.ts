import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requirePermission } from '@/lib/curator/auth.server';
import { updateCuratorStore } from '@/lib/curator/store.server';

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

async function saveLocally(slug: string, filename: string, buffer: Buffer): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'communities', slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/communities/${slug}/${filename}`;
}

async function saveToBlob(
  slug: string,
  kind: 'logo' | 'cover',
  filename: string,
  file: File
): Promise<string> {
  const pathname = `communities/${slug}/${kind}-${Date.now()}-${filename}`;
  const blob = await put(pathname, file, {
    access: 'public',
    contentType: file.type || undefined,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const gate = await requirePermission('admin');
    if (gate.error) return gate.error;

    const { slug } = await params;
    const { communities } = await getCuratorBootstrap();
    if (!communities.some((c) => c.slug === slug)) {
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
      return NextResponse.json(
        { error: 'Formato non supportato. Usa SVG, PNG, JPG o WebP.' },
        { status: 400 }
      );
    }

    const ext = EXT_BY_MIME[file.type] ?? 'png';
    const filename = kind === 'logo' ? `logo.${ext}` : `cover.${ext}`;
    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    let publicUrl: string;
    if (useBlob) {
      publicUrl = await saveToBlob(slug, kind, filename, file);
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());
      publicUrl = await saveLocally(slug, filename, buffer);
    }

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

    const bootstrap = await getCuratorBootstrap();
    const community = bootstrap.communities.find((c) => c.slug === slug);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      kind,
      storage: useBlob ? 'blob' : 'local',
      community,
    });
  } catch (err) {
    console.error('[POST /api/curator/communities/.../upload]', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Upload fallito. Verifica BLOB_READ_WRITE_TOKEN in produzione.',
      },
      { status: 500 }
    );
  }
}
