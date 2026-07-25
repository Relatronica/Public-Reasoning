import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import CommunityRightSidebar from '@/components/CommunityRightSidebar';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reasoning Records — Cormano (MI) | Memoria del Giudizio Amministrativo',
  description: 'Strato civico di trasparenza sopra le decisioni pubbliche del Comune di Cormano: le domande reali, le opzioni scartate e le condizioni di falsificabilità.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          {/* Header Superiore Fisso */}
          <Navbar />

          {/* Contenitore Principale a 3 colonne */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex gap-6 items-start">
              
              {/* Sidebar Sinistra (Navigazione) */}
              <Sidebar />

              {/* Area Contenuto Feed / Pagine */}
              <main className="flex-1 min-w-0">
                {children}
              </main>

              {/* Sidebar Destra (Info Cormano) */}
              <CommunityRightSidebar />

            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
