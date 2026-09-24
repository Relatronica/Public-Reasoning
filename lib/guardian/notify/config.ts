/**
 * Config canali di notifica escalate.
 * Se nessun canale è configurato, resta solo l’UI locale (/guardian).
 */

export function publicAppUrl(): string {
  const base =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';
  if (base.startsWith('http')) return base.replace(/\/$/, '');
  return `https://${base.replace(/\/$/, '')}`;
}

export function slackConfigured(): boolean {
  return Boolean(
    process.env.SLACK_BOT_TOKEN &&
      process.env.SLACK_CHANNEL_ID &&
      process.env.SLACK_SIGNING_SECRET
  );
}

/** Incoming webhook Teams (Adaptive Card con link firmati). */
export function teamsConfigured(): boolean {
  return Boolean(process.env.TEAMS_WEBHOOK_URL);
}

export function anyNotifyChannelConfigured(): boolean {
  return slackConfigured() || teamsConfigured();
}
