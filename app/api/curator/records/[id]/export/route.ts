import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { recordToMarkdown } from '@/lib/records/export-markdown';
import { isVisibleOnPublicFeed } from '@/lib/records';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  const { records } = await getCuratorBootstrap();
  const record = records.find((r) => r.id === id);
  if (!record) {
    return NextResponse.json({ error: 'Record non trovato' }, { status: 404 });
  }
  if (!session?.user?.id && !isVisibleOnPublicFeed(record)) {
    return NextResponse.json({ error: 'Record non trovato' }, { status: 404 });
  }

  const markdown = recordToMarkdown(record);
  const slug = record.publicAct?.slug ?? record.id;
  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.md"`,
    },
  });
}
