'use client';

import { useSearchParams } from 'next/navigation';
import {
  COMMUNITY_PARAM,
  DEFAULT_COMMUNITY_SLUG,
  withCommunityQuery,
} from '@/lib/communities';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { getCommunityBySlugFromList } from '@/lib/curator/client';
import { Community } from '@/types';

export function useActiveCommunity(): {
  community: Community;
  slug: string;
  href: (pathname: string, extra?: Record<string, string | undefined | null>) => string;
} {
  const searchParams = useSearchParams();
  const { communities } = useCuratorData();
  const slug = searchParams.get(COMMUNITY_PARAM) || DEFAULT_COMMUNITY_SLUG;
  const community = getCommunityBySlugFromList(communities, slug);

  const href = (
    pathname: string,
    extra: Record<string, string | undefined | null> = {}
  ) => withCommunityQuery(pathname, community.slug, extra);

  return { community, slug, href };
}
