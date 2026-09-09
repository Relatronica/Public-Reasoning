'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Plus, ChevronDown, FileText, Briefcase, Building2, Pencil, Sparkles } from 'lucide-react';
import { withCommunityQuery } from '@/lib/communities';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { CommunityType } from '@/types';
import Logo from '@/components/Logo';

function communityIcon(type: CommunityType, slug?: string) {
  if (slug === 'ai-governance') return Sparkles;
  if (type === 'ufficio' || type === 'azienda') return Building2;
  if (type === 'progetto') return Briefcase;
  return MapPin;
}

function NavbarInner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { community, href } = useActiveCommunity();
  const { communities, canCompile, myRole, organization } = useCuratorData();
  const Icon = communityIcon(community.type, community.slug);
  const workspaceLabel = community.type === 'comune' || community.type === 'regione' ? 'Community' : 'Workspace';

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(href('/', { q: searchQuery.trim() || undefined }));
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-6">
          <Link href={href('/')} className="flex items-center gap-2.5 group text-gray-900 hover:text-blue-700 transition-colors">
            <Logo className="w-7 h-7" />
            <span className="font-semibold text-lg tracking-tight leading-none">
              Reason
            </span>
          </Link>

          <div className="flex items-center relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              title="Cambia community"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-800 text-xs font-semibold hover:bg-blue-100/80 transition-all cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-blue-600" />
              <span>{community.shortName}</span>
              <span className="text-[10px] text-blue-500 font-normal">{community.typeLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-blue-500 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-sm z-50 overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  {workspaceLabel}
                  {organization?.name ? ` · ${organization.name}` : ''}
                </div>
                {communities.map((item) => {
                  const ItemIcon = communityIcon(item.type, item.slug);
                  const active = item.slug === community.slug;
                  return (
                    <Link
                      key={item.id}
                      href={withCommunityQuery('/', item.slug)}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 ${
                        active ? 'bg-blue-50' : ''
                      }`}
                    >
                      <ItemIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="min-w-0">
                        <div className={`font-semibold ${active ? 'text-blue-800' : 'text-gray-900'}`}>
                          {item.name}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {item.typeLabel}
                          {item.subtitle ? ` · ${item.subtitle}` : ''}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-xl hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={community.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {canCompile && (
            <Link
              href={href('/records/capture')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cattura decisione</span>
            </Link>
          )}

          {canCompile && (
            <Link
              href={href('/records/new')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-gray-900 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
              title="Compila a mano"
            >
              <Plus className="w-4 h-4 text-gray-500" />
              <span>A mano</span>
            </Link>
          )}

          <Link
            href={href('/bank')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-gray-900 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Bank</span>
          </Link>

          <Link
            href={href('/curator')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-gray-900 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-500" />
            <span>Editor</span>
          </Link>

          <Link
            href={href('/acts')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-gray-900 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>{community.archiveNavLabel}</span>
          </Link>

          <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>

          <div className="flex items-center gap-2 pl-1">
            {myRole && (
              <span className="hidden xl:inline text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                {myRole}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold text-xs cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
              MR
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="h-16 bg-white border-b border-gray-200" />}>
      <NavbarInner />
    </Suspense>
  );
}
