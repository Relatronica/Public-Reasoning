import { Community } from '@/types';

/** Assente o true = visibile nel selettore pubblico. */
export function isCommunityVisible(community: Community): boolean {
  return community.isVisible !== false;
}

export function filterVisibleCommunities(
  communities: Community[],
  options?: { includeHidden?: boolean }
): Community[] {
  if (options?.includeHidden) return communities;
  return communities.filter(isCommunityVisible);
}
