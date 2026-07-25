'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, Compass, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

export default function NewReasoningRecordPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="reddit-card p-8 text-center space-y-4 max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Record Inviato al Registro</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          La ricostruzione del giudizio per questo atto del Comune di Cormano è stata inviata e sarà pubblicata nel feed civico.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Compila un altro Record
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="reddit-card p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Nuovo Reasoning Record</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ricostruisci una Decisione Pubblica
        </h1>
        <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
          Estrai l&apos;architettura decisionale di una delibera del Comune di Cormano seguendo i 5 pilastri della trasparenza civica.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="reddit-card p-6 space-y-5">
        
        {/* Comune Preimpostato */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Ambito Territoriale: Cormano (MI)</span>
          </div>
          <span className="text-[11px] text-blue-700">Lombardia</span>
        </div>

        {/* Rif Atto */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Riferimento Atto Pubblico / Delibera
          </label>
          <input
            type="text"
            required
            placeholder="es. Delibera C.C. n. 45/2024 - Comune di Cormano"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* 1. Domanda Reale */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            <span>1. La Domanda Reale</span>
          </label>
          <p className="text-[11px] text-gray-500">Qual è il problema sostanziale a cui si rispondeva?</p>
          <textarea
            required
            rows={3}
            placeholder="es. Come fluidificare il traffico scolastico senza togliere parcheggi ai residenti?"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* 2. Decisione Presa */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>2. La Decisione Presa</span>
          </label>
          <textarea
            required
            rows={2}
            placeholder="Sintesi formale della misura adottata..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* 3. Opzioni Scartate */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-4 h-4" />
            <span>3. Opzione Scartata e Motivazione</span>
          </label>
          <textarea
            rows={2}
            placeholder="Quale alternativa è stata scartata e per quale motivo specifico?"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* 4. Condizioni di Falsificabilità */}
        <div className="space-y-1 bg-amber-50/60 border border-amber-200 p-3.5 rounded-lg">
          <label className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>4. Condizione di Falsificabilità</span>
          </label>
          <p className="text-[11px] text-amber-800">Cosa farebbe cambiare idea e invertire la decisione?</p>
          <textarea
            required
            rows={2}
            placeholder="es. Se dopo 6 mesi l'incidentalità non cala del 20%..."
            className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
        >
          Pubblica Reasoning Record
        </button>

      </form>

    </div>
  );
}
