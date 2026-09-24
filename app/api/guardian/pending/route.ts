import { NextResponse } from 'next/server';
import { listPending, type PendingStatus } from '@/lib/guardian/pending';
import {
  anyNotifyChannelConfigured,
  slackConfigured,
  teamsConfigured,
} from '@/lib/guardian/notify';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const status: PendingStatus | undefined =
    statusParam === 'open' || statusParam === 'resolved' ? statusParam : undefined;
  const filter = status ? { status } : undefined;

  return NextResponse.json({
    pending: await listPending(filter),
    channels: {
      slack: slackConfigured(),
      teams: teamsConfigured(),
      anyRemote: anyNotifyChannelConfigured(),
    },
  });
}
