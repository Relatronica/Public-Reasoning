import type { PendingEscalation } from '@/lib/guardian/pending';
import { publicAppUrl } from '@/lib/guardian/notify/config';
import { signResolveToken } from '@/lib/guardian/resolve';
import { escalateAudience, type GuardianPackId } from '@/lib/guardian/pack';

function resolveUrl(pendingId: string, resolution: 'allow' | 'deny'): string {
  const token = signResolveToken(pendingId, resolution);
  const base = publicAppUrl();
  const params = new URLSearchParams({
    id: pendingId,
    v: resolution,
    token,
  });
  return `${base}/api/guardian/resolve?${params.toString()}`;
}

/**
 * Incoming webhook Teams: Adaptive Card con link firmati Approva/Rifiuta.
 */
export async function notifyTeams(
  pending: PendingEscalation,
  pack: GuardianPackId = 'ai-governance'
): Promise<{ ok: boolean; error?: string }> {
  const webhook = process.env.TEAMS_WEBHOOK_URL;
  if (!webhook) {
    return { ok: false, error: 'Teams non configurato' };
  }

  const who = escalateAudience(pack);
  const actionLine = [
    pending.action.action,
    pending.action.resource,
    pending.action.agentId ? `agent=${pending.action.agentId}` : null,
    `pack=${pack}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const card = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: `Dubitor · chiedi a ${who}`,
            },
            {
              type: 'TextBlock',
              text: pending.decision.reason,
              wrap: true,
            },
            {
              type: 'TextBlock',
              text: actionLine,
              isSubtle: true,
              wrap: true,
              spacing: 'Small',
            },
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'Approva',
              url: resolveUrl(pending.id, 'allow'),
            },
            {
              type: 'Action.OpenUrl',
              title: 'Rifiuta',
              url: resolveUrl(pending.id, 'deny'),
            },
          ],
        },
      },
    ],
  };

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, error: text || `HTTP ${res.status}` };
  }
  return { ok: true };
}
