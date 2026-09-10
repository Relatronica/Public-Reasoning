import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import CommunityRightSidebar from '@/components/CommunityRightSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reason',
  description: 'Feed delle decisioni: domanda reale, opzioni scartate e condizioni di falsificabilità.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden bg-gray-50 text-gray-900 antialiased flex flex-col`}>
        <Providers>
          <Navbar />

          <div className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="flex gap-6 items-start h-full">
              <Suspense fallback={null}>
                <Sidebar />
              </Suspense>

              <main className="flex-1 min-w-0 h-full overflow-y-auto py-6 pr-2 pb-20 md:pb-6">
                {children}
              </main>

              <CommunityRightSidebar />
            </div>
          </div>

          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
