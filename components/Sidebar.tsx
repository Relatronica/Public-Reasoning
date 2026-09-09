'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, FileText, X } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { community, href } = useActiveCommunity();

  const currentCategory = searchParams.get('category');
  const currentFilter = searchParams.get('filter');
  const currentSearch = searchParams.get('q');
  const isHome = pathname === '/';
  const isAllRecords = isHome && !currentFilter && !currentCategory && !currentSearch;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block py-6 h-full overflow-y-auto pr-2">
      <div className="space-y-6">
        <nav className="space-y-1">
          <Link
            href={href('/')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
              isAllRecords
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Home className={`w-4 h-4 ${isAllRecords ? 'text-blue-600' : 'text-gray-400'}`} />
            Feed
          </Link>
          <Link
            href={href('/acts')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
              pathname === '/acts'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FileText className={`w-4 h-4 ${pathname === '/acts' ? 'text-blue-600' : 'text-gray-400'}`} />
            {community.archiveNavLabel}
          </Link>
        </nav>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Argomenti
            </span>
            {currentCategory && (
              <Link href={href('/')} className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
                <X className="w-3 h-3" />
                Reset
              </Link>
            )}
          </div>
          <div className="space-y-0.5">
            {community.categories.map((cat) => {
              const isSelected = currentCategory === cat.label;
              return (
                <Link
                  key={cat.label}
                  href={isSelected ? href('/') : href('/', { category: cat.label })}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-64 flex-shrink-0 hidden md:block" />}>
      <SidebarInner />
    </Suspense>
  );
}
