import { DecisionInsight } from '@/types';

const PEEP_AVATARS = [
  '/avatar/peep-14.png',
  '/avatar/peep-20.png',
  '/avatar/peep-32.png',
  '/avatar/peep-38.png',
  '/avatar/peep-45.png',
  '/avatar/peep-49.png',
  '/avatar/peep-51.png',
  '/avatar/peep-55.png',
  '/avatar/peep-56.png',
  '/avatar/peep-57.png',
  '/avatar/peep-74.png',
  '/avatar/peep-76.png',
  '/avatar/peep-83.png',
  '/avatar/peep-99.png',
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Avatar esplicito, peep deterministico da autore, o null (iniziali / sistema). */
export function resolveInsightAvatar(
  insight: Pick<DecisionInsight, 'avatar' | 'author' | 'authorUserId' | 'role' | 'id'>
): string | null {
  if (insight.avatar) return insight.avatar;
  if (insight.role === 'Sistema') return null;
  const seed = insight.authorUserId || insight.author || insight.id;
  if (!seed) return null;
  return PEEP_AVATARS[hashSeed(seed) % PEEP_AVATARS.length];
}

export function insightAuthorInitials(author?: string, role?: string): string {
  const name = (author || role || '?').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
