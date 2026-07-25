'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Tag, 
  FileText, 
  Bookmark, 
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Tutti i Record', href: '/', icon: Home },
    { label: 'Alta Incertezza', href: '/?filter=uncertainty', icon: AlertTriangle },
    { label: 'Con Verifiche (6/12 mesi)', href: '/?filter=verified', icon: CheckCircle2 },
    { label: 'Atti Ufficiali', href: '/acts', icon: FileText },
  ];

  const categories = [
    { label: 'Mobilità & Viabilità', color: 'bg-blue-500' },
    { label: 'Urbanistica & Territorio', color: 'bg-emerald-500' },
    { label: 'Bilancio & Servizi', color: 'bg-amber-500' },
    { label: 'Ambiente & Parchi', color: 'bg-teal-500' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block py-6 pr-4 border-r border-gray-200/80 bg-white min-h-[calc(100vh-4rem)]">
      <div className="space-y-6 px-3">
        
        {/* Territory Focus Badge */}
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Comune Attivo</span>
          </div>
          <p className="text-sm font-bold text-gray-900">Cormano (MI)</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Regione Lombardia</p>
        </div>

        {/* Primary Feeds */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
            Feed Navigazione
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Categories / Topics */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
            Argomenti Cormano
          </div>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                  <span>{cat.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Guida Rapida alla Struttura dei Record */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
          <div className="font-semibold text-gray-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Come leggere un Record</span>
          </div>
          <ul className="text-[11px] text-gray-600 space-y-1 list-disc pl-3">
            <li><strong>La Domanda Reale</strong>: Il problema sostanziale.</li>
            <li><strong>Opzioni Scartate</strong>: Cosa è stato escluso e perché.</li>
            <li><strong>Falsificabilità</strong>: Cosa farebbe cambiare idea.</li>
          </ul>
        </div>

      </div>
    </aside>
  );
}
