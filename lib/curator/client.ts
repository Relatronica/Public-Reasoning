import { Community } from '@/types';
import { communities as staticCommunities } from '@/lib/communities';

export function getCommunityBySlugFromList(
  communities: Community[],
  slug?: string | null
): Community {
  const found = communities.find((c) => c.slug === slug);
  return found ?? communities[0] ?? staticCommunities[0];
}
