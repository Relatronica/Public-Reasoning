'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Plus, 
  ChevronDown, 
  FileText, 
  ShieldCheck, 
  Bell, 
  User,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Cormano (MI)');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
              RR
            </div>
            <div>
              <span className="font-extrabold text-lg text-gray-900 tracking-tight block leading-none">
                Reasoning<span className="text-blue-600">Records</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase block mt-0.5">
                Trasparenza Decisionale
              </span>
            </div>
          </Link>

          {/* Location Selector (Geolocalizzazione: Cormano MI) */}
          <div className="hidden md:flex items-center">
            <button 
              title="Filtra per Comune o Regione (Attivo: Cormano MI)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-800 text-xs font-semibold hover:bg-blue-100/80 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedCity}</span>
              <span className="text-[10px] text-blue-500 font-normal">Lombardia</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cerca delibere, domande reali, argomenti (es. ZTL, PGT, Scuole)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Actions & User */}
        <div className="flex items-center gap-3">
          <Link 
            href="/records/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Record</span>
          </Link>

          <Link
            href="/acts"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-gray-900 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Atti Pubblici</span>
          </Link>

          <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>

          {/* User profile avatar / Login */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold text-xs cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
              MR
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
