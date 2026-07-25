'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()
  const [isCompleting, setIsCompleting] = useState(true)

  const username = searchParams.get('username')
  const avatar = searchParams.get('avatar')

  useEffect(() => {
    const completeRegistration = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          // Completa la registrazione aggiornando l'utente con username e avatar
          const response = await fetch('/api/auth/complete-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              username,
              avatar,
            }),
          })

          if (response.ok) {
            // Aggiorna la sessione per includere l'avatar e username appena salvati
            await update()
            setIsCompleting(false)
            // Redirect dopo 2 secondi
            setTimeout(() => {
              router.push('/')
            }, 2000)
          } else {
            console.error('Errore nel completamento registrazione')
          }
        } catch (error) {
          console.error('Errore:', error)
        }
      }
    }

    completeRegistration()
  }, [status, session, username, avatar, router])

  if (status === 'loading' || isCompleting) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Completamento registrazione...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 shadow-2xl text-center max-w-md"
      >
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">
          Registrazione completata!
        </h1>
        <p className="text-white/70 mb-8">
          Il tuo account è stato creato con successo. Verrai reindirizzato alla home...
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition"
        >
          Vai alla home
        </Link>
      </motion.div>
    </div>
  )
}

