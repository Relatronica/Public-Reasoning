import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import CommunityRightSidebar from '@/components/CommunityRightSidebar';
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
          {/* Header Superiore Fisso */}
          <Navbar />

          {/* Contenitore Principale a 3 colonne - Altezza fissa viewport */}
          <div className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="flex gap-6 items-start h-full">
              
              {/* Sidebar Sinistra (Navigazione fissa) */}
              <Suspense fallback={null}>
                <Sidebar />
              </Suspense>

              {/* Area Contenuto Feed / Pagine (Unica colonna ad avere lo scroll) */}
              <main className="flex-1 min-w-0 h-full overflow-y-auto py-6 pr-2">
                {children}
              </main>

              {/* Sidebar destra: pack della community attiva */}
              <CommunityRightSidebar />

            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
