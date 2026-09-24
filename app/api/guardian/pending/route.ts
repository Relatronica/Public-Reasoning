import { NextResponse } from 'next/server';
import { listPending } from '@/lib/guardian/pending';
import {
  anyNotifyChannelConfigured,
  slackConfigured,
  teamsConfigured,
} from '@/lib/guardian/notify';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const filter =
    status === 'open' || status === 'resolved' ? { status } : undefined;

  return NextResponse.json({
    pending: await listPending(filter),
    channels: {
      slack: slackConfigured(),
      teams: teamsConfigured(),
      anyRemote: anyNotifyChannelConfigured(),
    },
  });
}
