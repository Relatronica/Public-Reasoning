'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

const availableAvatars = [
  '/avatar/peep-14.png',
  '/avatar/peep-20.png',
  '/avatar/peep-32.png',
  '/avatar/peep-38.png',
  '/avatar/peep-45.png',
  '/avatar/peep-49.png',
  '/avatar/peep-51.png',
  '/avatar/peep-55.png',
  '/avatar/peep-56.png',
  '/avatar/peep-57.png',
  '/avatar/peep-74.png',
  '/avatar/peep-76.png',
  '/avatar/peep-83.png',
  '/avatar/peep-99.png',
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [step, setStep] = useState<'info' | 'oauth'>('info')
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Il nome utente è obbligatorio')
      return
    }

    if (username.length < 3) {
      setError('Il nome utente deve essere di almeno 3 caratteri')
      return
    }

    if (!selectedAvatar) {
      setError('Seleziona un avatar')
      return
    }

    // Salva temporaneamente in sessionStorage
    sessionStorage.setItem('registrationData', JSON.stringify({
      username,
      avatar: selectedAvatar,
    }))

    setStep('oauth')
  }

  const handleGoogleSignIn = () => {
    signIn('google', {
      callbackUrl: `/auth/register/complete?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(selectedAvatar || '')}`,
    })
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8 pb-24">
      <div className="max-w-2xl w-full">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna alla home</span>
        </Link>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          {step === 'info' ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">
                Crea il tuo account
              </h1>
              <p className="text-white/70 mb-8">
                Scegli un nome utente e un avatar per iniziare
              </p>

              <form onSubmit={handleInfoSubmit} className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Nome utente *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-white/50"
                    placeholder="es: filosofo123"
                    minLength={3}
                    maxLength={20}
                  />
                  <p className="mt-1 text-xs text-white/50">
                    {username.length}/20 caratteri (minimo 3)
                  </p>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-4">
                    Scegli il tuo avatar *
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                    {availableAvatars.map((avatar) => (
                      <motion.button
                        key={avatar}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(avatar)
                          setError('')
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all bg-white ${
                          selectedAvatar === avatar
                            ? 'border-primary-400 ring-2 ring-primary-400/50 scale-110'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <Image
                          src={avatar}
                          alt="Avatar"
                          fill
                          className="object-contain object-center"
                        />
                        {selectedAvatar === avatar && (
                          <div className="absolute inset-0 bg-primary-500/30 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition"
                >
                  Continua con Google
                </motion.button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">
                Completa la registrazione
              </h1>
              <p className="text-white/70 mb-8">
                Accedi con Google per completare la creazione del tuo account
              </p>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-white">
                      {selectedAvatar && (
                        <Image
                          src={selectedAvatar}
                          alt="Avatar"
                          width={48}
                          height={48}
                          className="object-contain object-center"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{username}</p>
                      <p className="text-white/60 text-sm">Nome utente selezionato</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleGoogleSignIn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continua con Google</span>
                </motion.button>

                <button
                  onClick={() => setStep('info')}
                  className="w-full text-white/70 hover:text-white transition text-sm"
                >
                  ← Torna indietro
                </button>
              </div>
            </>
          )}
          
          <div className="mt-6 text-center border-t border-white/10 pt-6">
            <p className="text-white/60 text-sm mb-2">
              Hai già un account?
            </p>
            <Link
              href="/auth/login"
              className="text-primary-400 hover:text-primary-300 font-semibold text-sm transition"
            >
              Accedi qui
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

