'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'C\'è un problema con la configurazione del server. Contatta il supporto.',
    AccessDenied: 'Accesso negato. Non hai i permessi necessari.',
    Verification: 'Il link di verifica non è più valido o è scaduto.',
    Default: 'Si è verificato un errore durante l\'autenticazione.',
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Errore di Autenticazione</h1>
        </div>
        
        <p className="text-white/70 mb-6">{errorMessage}</p>
        
        {error && (
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-xs text-white/50 mb-2">Codice errore:</p>
            <p className="text-sm font-mono text-white/80">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <Link
            href="/auth/register"
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition text-center"
          >
            Riprova
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 text-white/70 hover:text-white transition px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna alla home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
