'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import CommunityRightSidebar from '@/components/CommunityRightSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { isFocusLayoutPath, isRecordDetailPath } from '@/lib/layout/focus-layout';

function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/' || pathname === '/welcome' || pathname.startsWith('/welcome/');
}

/** Shell a 3 colonne; nascosto sulle pagine di presentazione. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const marketing = isMarketingPath(pathname);
  const focus = isFocusLayoutPath(pathname);
  const recordDetail = isRecordDetailPath(pathname);

  if (marketing) {
    return <div className="fixed inset-0 z-50 overflow-y-auto">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <div
        className={`flex-1 w-full mx-auto overflow-hidden min-h-0 px-4 sm:px-6 lg:px-8 ${
          recordDetail ? 'max-w-[1800px]' : 'max-w-[1700px]'
        }`}
      >
        <div className={`flex items-start h-full ${focus ? 'gap-0' : 'gap-6'}`}>
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
          <main
            className={`flex-1 min-w-0 h-full overflow-y-auto py-6 pb-20 md:pb-6 ${
              focus ? 'pr-0' : 'pr-2'
            }`}
          >
            {children}
          </main>
          {!focus && <CommunityRightSidebar />}
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
}
