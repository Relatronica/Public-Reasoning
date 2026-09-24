import { NextResponse } from 'next/server';
import { verifySlackSignature } from '@/lib/guardian/notify';
import { resolveEscalation } from '@/lib/guardian/resolve';

export const runtime = 'nodejs';

type SlackAction = {
  action_id?: string;
  value?: string;
};

type SlackPayload = {
  type?: string;
  user?: { id?: string; name?: string; username?: string };
  actions?: SlackAction[];
  response_url?: string;
};

/**
 * Endpoint Interactivity di Slack (Request URL).
 * Configura la Slack App → Interactivity → Request URL =
 *   https://<host>/api/guardian/slack/interactions
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get('x-slack-request-timestamp');
  const signature = request.headers.get('x-slack-signature');

  if (!verifySlackSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: 'Firma Slack non valida' }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const payloadRaw = params.get('payload');
  if (!payloadRaw) {
    return NextResponse.json({ error: 'payload assente' }, { status: 400 });
  }

  let payload: SlackPayload;
  try {
    payload = JSON.parse(payloadRaw) as SlackPayload;
  } catch {
    return NextResponse.json({ error: 'payload non JSON' }, { status: 400 });
  }

  const action = payload.actions?.[0];
  if (!action?.value || !action.action_id) {
    return NextResponse.json({ error: 'azione assente' }, { status: 400 });
  }

  const resolution =
    action.action_id === 'guardian_approve'
      ? 'allow'
      : action.action_id === 'guardian_deny'
        ? 'deny'
        : null;

  if (!resolution) {
    return NextResponse.json({ error: 'action_id sconosciuto' }, { status: 400 });
  }

  const who =
    payload.user?.username || payload.user?.name || payload.user?.id || 'slack';

  const result = await resolveEscalation({
    pendingId: action.value,
    resolution,
    resolvedBy: `slack:${who}`,
    note: `Risolto da Slack (${who})`,
  });

  if (!result.ok) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `Dubitor: ${result.error}`,
    });
  }

  const label = resolution === 'allow' ? 'approvato' : 'rifiutato';
  const text = result.alreadyResolved
    ? `Già risolto in precedenza come *${result.pending.resolvedAs}*.`
    : `Escalate *${label}* da <@${payload.user?.id ?? who}>. Registro aggiornato.`;

  // Aggiorna il messaggio originale (sostituisce i pulsanti)
  if (payload.response_url) {
    await fetch(payload.response_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        replace_original: true,
        text,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Dubitor* — escalate ${label}\n${result.decision.reason}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Da ${who} · \`${action.value.slice(0, 8)}…\``,
              },
            ],
          },
        ],
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
