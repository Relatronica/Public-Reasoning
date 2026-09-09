import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';
import { requirePermission } from '@/lib/curator/auth.server';
import { serializeAct, serializeRecord } from '@/lib/curator/serialize';
import { updateCuratorStore } from '@/lib/curator/store.server';
import { getCommunityBySlug } from '@/lib/communities';
import { canClose } from '@/lib/org/permissions';
import { defaultVisibilityForCommunity, isClosedStatus, isVisibleOnPublicFeed } from '@/lib/records';
import { PublicAct, ReasoningRecord } from '@/types';

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get('communityId');
  const { records } = await getCuratorBootstrap();
  let filtered = communityId
    ? records.filter((r) => r.publicAct?.entity.id === communityId)
    : records;
  if (!session?.user?.id) {
    filtered = filtered.filter(isVisibleOnPublicFeed);
  }
  return NextResponse.json({ records: filtered });
}

interface CreateRecordBody {
  communitySlug: string;
  act: Partial<PublicAct>;
  record: Partial<ReasoningRecord>;
}

export async function POST(request: Request) {
  const { session, role, error } = await requirePermission('compile');
  if (error || !session) return error;

  const body = (await request.json()) as CreateRecordBody;
  const community = getCommunityBySlug(body.communitySlug);
  const now = new Date().toISOString();
  const actId = body.act.id ?? `act-custom-${Date.now()}`;
  const recordId = body.record.id ?? `record-custom-${Date.now()}`;
  let status = body.record.status ?? 'draft';
  if (isClosedStatus(status) && !canClose(role)) {
    status = 'draft';
  }

  const act: PublicAct = serializeAct({
    id: actId,
    title: body.act.title ?? 'Nuova fonte',
    actNumber: body.act.actNumber ?? '',
    entity: community,
    date: body.act.date ? new Date(body.act.date as unknown as string) : new Date(),
    rawTextExcerpt: body.act.rawTextExcerpt ?? '',
    slug: body.act.slug ?? `custom-${Date.now()}`,
    createdAt: new Date(now),
    updatedAt: new Date(now),
    recordsCount: 1,
    isVerified: body.act.isVerified ?? false,
    dataStatus: body.act.dataStatus ?? 'demo',
    verificationNote: body.act.verificationNote,
    officialUrl: body.act.officialUrl,
  });

  const record: ReasoningRecord = serializeRecord({
    id: recordId,
    publicActId: actId,
    publicAct: act,
    compiler: {
      id: session.user!.id!,
      username: (session.user as { username?: string }).username ?? 'curator',
      name: session.user!.name ?? 'Curator',
      createdAt: new Date(now),
    },
    version: 1,
    status,
    visibility: body.record.visibility ?? defaultVisibilityForCommunity(community),
    compliancePack: body.record.compliancePack,
    category: body.record.category ?? community.categories[0]?.label,
    upvotes: 0,
    realQuestion: body.record.realQuestion ?? '',
    discardedOptions: body.record.discardedOptions ?? [],
    decision: body.record.decision ?? '',
    uncertaintyLevel: body.record.uncertaintyLevel ?? 'medio',
    uncertaintyExplanation: body.record.uncertaintyExplanation ?? '',
    confidence: body.record.confidence,
    mindChangingConditions: body.record.mindChangingConditions ?? [],
    verbatimQuotes: body.record.verbatimQuotes ?? [],
    interpretativeSummary: body.record.interpretativeSummary ?? '',
    outcomeReviews: body.record.outcomeReviews ?? [],
    aiAssistance: body.record.aiAssistance,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  });

  await updateCuratorStore((store) => ({
    ...store,
    customActs: [...store.customActs, act],
    customRecords: [...store.customRecords, record],
  }));

  return NextResponse.json({ success: true, act, record });
}
