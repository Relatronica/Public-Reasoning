'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FileText, Landmark, List, X } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { community, href } = useActiveCommunity();

  const currentCategory = searchParams.get('category');
  const isHome = pathname === '/';
  const isAllRecords = isHome && !currentCategory && !searchParams.get('filter') && !searchParams.get('q');

  return (
    <aside className="w-56 flex-shrink-0 hidden md:block py-6 h-full overflow-y-auto pr-2">
      <div className="space-y-6">
        <nav className="space-y-0.5">
          <Link
            href={href('/')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
              isAllRecords || (isHome && currentCategory)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4 text-gray-400" />
            Decisioni
          </Link>
          <Link
            href={href('/bank')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
              pathname === '/bank' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Landmark className="w-4 h-4 text-gray-400" />
            Registro
          </Link>
          <Link
            href={href('/acts')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
              pathname === '/acts' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 text-gray-400" />
            Fonti
          </Link>
        </nav>

        <div>
          <div className="flex items-center justify-between px-3 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Argomenti
            </span>
            {currentCategory && (
              <Link
                href={href('/')}
                className="text-[10px] text-gray-500 hover:text-gray-800 flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                Tutti
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
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs ${
                    isSelected
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
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
    <Suspense fallback={<aside className="w-56 flex-shrink-0 hidden md:block" />}>
      <SidebarInner />
    </Suspense>
  );
}
