import type { PendingEscalation } from '@/lib/guardian/pending';
import {
  anyNotifyChannelConfigured,
  slackConfigured,
  teamsConfigured,
} from '@/lib/guardian/notify/config';
import { notifySlack } from '@/lib/guardian/notify/slack';
import { notifyTeams } from '@/lib/guardian/notify/teams';
import type { GuardianPackId } from '@/lib/guardian/pack';

export type NotifyChannel = 'slack' | 'teams' | 'local';

export type NotifyResult = {
  channels: NotifyChannel[];
  errors: Partial<Record<'slack' | 'teams', string>>;
};

/**
 * Notifica i revisori sui canali configurati.
 * Senza env → solo `local` (pulsanti nella demo).
 */
export async function notifyEscalation(
  pending: PendingEscalation,
  opts?: { skipRemote?: boolean; pack?: GuardianPackId }
): Promise<NotifyResult> {
  const channels: NotifyChannel[] = ['local'];
  const errors: NotifyResult['errors'] = {};
  const pack = opts?.pack ?? 'ai-governance';

  if (opts?.skipRemote || !anyNotifyChannelConfigured()) {
    return { channels, errors };
  }

  if (slackConfigured()) {
    const r = await notifySlack(pending, pack);
    if (r.ok) channels.push('slack');
    else errors.slack = r.error;
  }

  if (teamsConfigured()) {
    const r = await notifyTeams(pending, pack);
    if (r.ok) channels.push('teams');
    else errors.teams = r.error;
  }

  return { channels, errors };
}

export { anyNotifyChannelConfigured, slackConfigured, teamsConfigured, publicAppUrl } from '@/lib/guardian/notify/config';
export { verifySlackSignature } from '@/lib/guardian/notify/slack';
