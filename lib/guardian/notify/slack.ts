import { createHmac, timingSafeEqual } from 'crypto';
import type { PendingEscalation } from '@/lib/guardian/pending';
import { publicAppUrl } from '@/lib/guardian/notify/config';
import { escalateAudience, type GuardianPackId } from '@/lib/guardian/pack';

function signingSecret(): string {
  return process.env.SLACK_SIGNING_SECRET || '';
}

export function verifySlackSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null
): boolean {
  if (!timestamp || !signature || !signingSecret()) return false;
  const ageSec = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(ageSec) || ageSec > 60 * 5) return false;

  const base = `v0:${timestamp}:${rawBody}`;
  const digest = createHmac('sha256', signingSecret()).update(base).digest('hex');
  const expected = `v0=${digest}`;
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function actionSummary(pending: PendingEscalation): string {
  const a = pending.action;
  const parts = [`\`${a.action}\``];
  if (a.resource) parts.push(`risorsa \`${a.resource}\``);
  if (a.agentId) parts.push(`agente \`${a.agentId}\``);
  return parts.join(' · ');
}

/** Invia messaggio Block Kit con Approva / Rifiuta. */
export async function notifySlack(
  pending: PendingEscalation,
  pack: GuardianPackId = 'ai-governance'
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;
  if (!token || !channel) {
    return { ok: false, error: 'Slack non configurato' };
  }

  const who = escalateAudience(pack);
  const demoUrl = `${publicAppUrl()}/guardian?c=${pack}`;

  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      channel,
      text: `Dubitor: chiedi a ${who} — ${pending.action.action}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Dubitor · chiedi a ${who}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Motivo*\n${pending.decision.reason}\n\n*Azione*\n${actionSummary(pending)}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Pack \`${pack}\` · Escalate \`${pending.id.slice(0, 8)}…\` · <${demoUrl}|Apri demo>`,
            },
          ],
        },
        {
          type: 'actions',
          block_id: `guardian_escalate_${pending.id}`,
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Approva', emoji: true },
              style: 'primary',
              action_id: 'guardian_approve',
              value: pending.id,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Rifiuta', emoji: true },
              style: 'danger',
              action_id: 'guardian_deny',
              value: pending.id,
            },
          ],
        },
      ],
    }),
  });

  const data = (await res.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  }
  return { ok: true };
}
