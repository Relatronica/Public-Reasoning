/** Email (minuscolo) che sono sempre owner di piattaforma, indipendenti dalla roster. */
export function platformAdminEmails(): string[] {
  const raw = process.env.ORG_ADMIN_EMAILS || process.env.REASON_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdmin(email?: string | null): boolean {
  if (!email) return false;
  return platformAdminEmails().includes(email.trim().toLowerCase());
}
