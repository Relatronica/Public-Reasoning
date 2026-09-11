'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import CommunityRightSidebar from '@/components/CommunityRightSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';

function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/' || pathname === '/welcome' || pathname.startsWith('/welcome/');
}

/** Shell a 3 colonne; nascosto sulle pagine di presentazione. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const marketing = isMarketingPath(pathname);

  if (marketing) {
    return <div className="fixed inset-0 z-50 overflow-y-auto">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden min-h-0">
        <div className="flex gap-6 items-start h-full">
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 min-w-0 h-full overflow-y-auto py-6 pr-2 pb-20 md:pb-6">{children}</main>
          <CommunityRightSidebar />
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
}
