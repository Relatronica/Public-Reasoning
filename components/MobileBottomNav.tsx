'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Landmark, List, Search, X } from 'lucide-react';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

function MobileBottomNavInner() {
  const pathname = usePathname();
  const router = useRouter();
  const { href, community } = useActiveCommunity();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');

  const hideOnAuth =
    pathname.startsWith('/auth') || pathname.startsWith('/admin') || pathname.startsWith('/settings');
  if (hideOnAuth) return null;

  const items = [
    { href: href('/'), label: 'Decisioni', icon: List, active: pathname === '/' },
    { href: href('/bank'), label: 'Registro', icon: Landmark, active: pathname === '/bank' },
    { href: href('/acts'), label: 'Fonti', icon: FileText, active: pathname === '/acts' },
  ] as const;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(href('/', { q: q.trim() || undefined }));
  };

  return (
    <>
      {searchOpen && (
        <div className="fixed inset-0 z-[60] md:hidden bg-black/30" onClick={() => setSearchOpen(false)}>
          <form
            onSubmit={submitSearch}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-[4.25rem] left-3 right-3 bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex gap-2"
          >
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={community.searchPlaceholder || 'Cerca…'}
              className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium"
            >
              Cerca
            </button>
            <button
              type="button"
              aria-label="Chiudi ricerca"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 safe-bottom"
        aria-label="Navigazione principale"
      >
        <div className="max-w-[1700px] mx-auto flex items-stretch justify-around px-1 h-14">
          {items.map(({ href: to, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                active ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-400'}`} />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-gray-500"
          >
            <Search className="w-5 h-5 text-gray-400" />
            Cerca
          </button>
        </div>
      </nav>
    </>
  );
}

export default function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}
