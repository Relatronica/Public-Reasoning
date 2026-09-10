'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Search,
  MapPin,
  Plus,
  ChevronDown,
  Briefcase,
  Building2,
  Pencil,
  Sparkles,
  Settings,
  Landmark,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  Inbox,
} from 'lucide-react';
import { withCommunityQuery } from '@/lib/communities';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useCuratorData } from '@/contexts/CuratorDataContext';
import { ROLE_LABELS } from '@/lib/org/permissions';
import { CommunityType } from '@/types';
import Logo from '@/components/Logo';

function communityIcon(type: CommunityType, slug?: string) {
  if (slug === 'ai-governance') return Sparkles;
  if (type === 'ufficio' || type === 'azienda') return Building2;
  if (type === 'progetto') return Briefcase;
  return MapPin;
}

function userInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split('@')[0] || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function useDismissOnOutsideClick(
  open: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, ref, onClose]);
}

function NavbarInner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [communityOpen, setCommunityOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const communityRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { community, href } = useActiveCommunity();
  const { communities, canCompile, canAdminOrg, canAdvise, myRole, organization, inboxOpenCount } =
    useCuratorData();
  const Icon = communityIcon(community.type, community.slug);

  const user = session?.user as
    | { name?: string | null; email?: string | null; avatar?: string | null; image?: string | null }
    | undefined;
  const avatarUrl = user?.avatar || user?.image;
  const displayName = user?.name || user?.email || 'Account';
  const initials = userInitials(user?.name, user?.email);
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useDismissOnOutsideClick(communityOpen, communityRef, () => setCommunityOpen(false));
  useDismissOnOutsideClick(accountOpen, accountRef, () => setAccountOpen(false));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(href('/', { q: searchQuery.trim() || undefined }));
  };

  const closeAccount = () => setAccountOpen(false);
  const menuItem =
    'flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3 sm:gap-4">
        <Link href={href('/')} className="flex items-center gap-2 text-gray-900 hover:text-blue-700 flex-shrink-0">
          <Logo className="w-6 h-6" />
          <span className="font-semibold text-base tracking-tight hidden xs:inline sm:inline">Reason</span>
        </Link>

        <div className="relative flex-shrink-0" ref={communityRef}>
          <button
            type="button"
            onClick={() => {
              setCommunityOpen((v) => !v);
              setAccountOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            <Icon className="w-3.5 h-3.5 text-gray-500" />
            <span className="max-w-[9rem] truncate">{community.shortName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${communityOpen ? 'rotate-180' : ''}`} />
          </button>

          {communityOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-sm z-50 overflow-hidden">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                {organization?.name || 'Workspace'}
              </div>
              {communities.map((item) => {
                const ItemIcon = communityIcon(item.type, item.slug);
                const active = item.slug === community.slug;
                return (
                  <Link
                    key={item.id}
                    href={withCommunityQuery('/', item.slug)}
                    onClick={() => setCommunityOpen(false)}
                    className={`flex items-start gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 ${active ? 'bg-blue-50' : ''}`}
                  >
                    <ItemIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="min-w-0">
                      <div className={`font-semibold ${active ? 'text-blue-800' : 'text-gray-900'}`}>{item.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{item.typeLabel}</div>
                    </div>
                  </Link>
                );
              })}
              {canAdminOrg && (
                <Link
                  href={href('/curator/community/new')}
                  onClick={() => setCommunityOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 border-t border-gray-100"
                >
                  <Plus className="w-4 h-4" />
                  Nuova community
                </Link>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 placeholder-gray-400"
          />
        </form>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated && canCompile && (
            <Link
              href={href('/records/capture')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuova</span>
            </Link>
          )}

          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => {
                setAccountOpen((v) => !v);
                setCommunityOpen(false);
              }}
              title="Account"
              aria-expanded={accountOpen}
              className="relative w-8 h-8 flex items-center justify-center hover:opacity-90"
            >
              <span className="absolute inset-0 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-700 font-bold text-xs">
                {isAuthenticated && avatarUrl ? (
                  <Image src={avatarUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  isAuthenticated ? initials : '?'
                )}
              </span>
              {isAuthenticated && canAdvise && inboxOpenCount > 0 && (
                <span className="absolute -top-1 -right-1 z-10 min-w-[1rem] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-4 text-center ring-2 ring-white">
                  {inboxOpenCount > 9 ? '9+' : inboxOpenCount}
                </span>
              )}
            </button>

            {accountOpen && (
              <div role="menu" className="absolute top-full right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-sm z-50 overflow-hidden">
                {status === 'loading' ? (
                  <div className="px-3 py-4 text-xs text-gray-500 text-center">Caricamento…</div>
                ) : isAuthenticated ? (
                  <>
                    <div className="px-3 py-3 border-b border-gray-100">
                      <div className="font-semibold text-sm text-gray-900 truncate">{displayName}</div>
                      {myRole && (
                        <div className="text-[11px] text-gray-500 mt-0.5">{ROLE_LABELS[myRole]}</div>
                      )}
                    </div>
                    <div className="py-1">
                      <Link href={href('/curator')} onClick={closeAccount} className={menuItem} role="menuitem">
                        <Pencil className="w-4 h-4 text-gray-400" />
                        Editor
                      </Link>
                      <Link href={href('/bank')} onClick={closeAccount} className={menuItem} role="menuitem">
                        <Landmark className="w-4 h-4 text-gray-400" />
                        Registro
                      </Link>
                      {canAdvise && (
                        <Link href={href('/curator/richieste')} onClick={closeAccount} className={menuItem} role="menuitem">
                          <Inbox className="w-4 h-4 text-gray-400" />
                          <span className="flex-1">Richieste</span>
                          {inboxOpenCount > 0 && (
                            <span className="min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold text-center">
                              {inboxOpenCount}
                            </span>
                          )}
                        </Link>
                      )}
                      {canAdminOrg && (
                        <Link href={href('/curator/org')} onClick={closeAccount} className={menuItem} role="menuitem">
                          <Users className="w-4 h-4 text-gray-400" />
                          Team
                        </Link>
                      )}
                      <Link href="/settings" onClick={closeAccount} className={menuItem} role="menuitem">
                        <Settings className="w-4 h-4 text-gray-400" />
                        Profilo
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          closeAccount();
                          await signOut({ redirect: false });
                          window.location.assign(href('/'));
                        }}
                        className={`${menuItem} text-red-700 hover:bg-red-50`}
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Esci
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <Link
                      href={`/auth/login?callbackUrl=${encodeURIComponent(href('/'))}`}
                      onClick={closeAccount}
                      className={menuItem}
                      role="menuitem"
                    >
                      <LogIn className="w-4 h-4 text-gray-400" />
                      Accedi
                    </Link>
                    <Link href="/auth/register" onClick={closeAccount} className={menuItem} role="menuitem">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                      Registrati
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="h-14 bg-white border-b border-gray-200" />}>
      <NavbarInner />
    </Suspense>
  );
}
