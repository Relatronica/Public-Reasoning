'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          // Controlla se l'utente ha già username e avatar
          const response = await fetch(`/api/auth/check-user-status?userId=${session.user.id}`)
          const data = await response.json()
          
          if (data.hasUsername && data.hasAvatar) {
            // Utente già registrato, redirect normale
            router.push(callbackUrl)
          } else {
            // Utente non completato, redirect alla registrazione
            router.push('/auth/register')
          }
        } catch (error) {
          console.error('Errore nel controllo stato utente:', error)
          // In caso di errore, redirect alla registrazione per sicurezza
          router.push('/auth/register')
        }
      }
    }

    checkUserStatus()
  }, [status, session, callbackUrl, router])

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-white/70">Verifica in corso...</p>
      </div>
    </div>
  )
}

