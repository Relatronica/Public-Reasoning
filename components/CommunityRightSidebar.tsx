'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';

function CommunityLogo({ logoUrl, initials }: { logoUrl?: string; initials: string }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={48}
        height={48}
        className="relative w-12 h-12 rounded-full border-4 border-white bg-white object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="relative w-12 h-12 rounded-full border-4 border-white bg-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-sm">
      {initials}
    </div>
  );
}

function CommunityRightSidebarInner() {
  const { community, href } = useActiveCommunity();
  const { recordsForCommunity } = useCuratorData();
  const records = recordsForCommunity(community.id);

  return (
    <aside className="w-72 flex-shrink-0 hidden lg:block py-6 h-full overflow-y-auto pr-1">
      <div className="reddit-card">
        {community.coverImageUrl ? (
          <div className="relative h-20 w-full overflow-hidden rounded-t-xl bg-gray-100">
            <Image
              src={community.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="288px"
              priority
            />
          </div>
        ) : (
          <div className="h-20 w-full rounded-t-xl bg-gradient-to-br from-blue-700 to-blue-500" />
        )}

        <div className="px-4 pb-4">
          <div className="relative z-10 -mt-6 mb-3 flex items-end justify-between gap-2">
            <CommunityLogo logoUrl={community.logoUrl} initials={community.initials} />
            {community.officialUrl && (
              <a
                href={community.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mb-0.5 text-gray-400 hover:text-blue-600"
                title={community.officialUrlLabel}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {community.typeLabel}
          </p>
          <h3 className="font-bold text-gray-900 text-sm mt-0.5">{community.name}</h3>
          {community.subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{community.subtitle}</p>
          )}

          {community.stats.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-100">
              {community.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">{stat.label}</p>
                  <p className="text-xs font-semibold text-gray-800">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500 leading-relaxed mt-3">{community.tagline}</p>

          <p className="text-[11px] text-gray-400 pt-3 mt-3 border-t border-gray-100">
            {records.length} schede in questo workspace
          </p>
          <Link href={href('/bank')} className="mt-2 inline-block text-[11px] text-blue-700 hover:underline">
            Apri Decision Bank
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default function CommunityRightSidebar() {
  return (
    <Suspense fallback={<aside className="w-72 flex-shrink-0 hidden lg:block" />}>
      <CommunityRightSidebarInner />
    </Suspense>
  );
}
