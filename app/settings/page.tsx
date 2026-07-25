'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Check, User, Image as ImageIcon, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const u = session.user as any
      setUsername(u.username || u.name || '')
      setSelectedAvatar(u.avatar || null)
      setBio(u.bio || '')
      setIsLoading(false)
    } else if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, session, router])

  // Sincronizza il form con la sessione quando cambia
  useEffect(() => {
    if (session?.user && !isSaving) {
      const u = session.user as any
      setUsername(u.username || u.name || '')
      setSelectedAvatar(u.avatar || null)
      setBio(u.bio || '')
    }
  }, [session, isSaving])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSaving(true)

    if (!username.trim()) {
      setError('Il nome utente è obbligatorio')
      setIsSaving(false)
      return
    }

    if (username.length < 3) {
      setError('Il nome utente deve essere di almeno 3 caratteri')
      setIsSaving(false)
      return
    }

    if (!selectedAvatar) {
      setError('Seleziona un avatar')
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          username,
          avatar: selectedAvatar,
          bio: bio.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Aggiorna immediatamente i campi del form con i valori salvati
        if (data.user) {
          setUsername(data.user.username || '')
          setSelectedAvatar(data.user.avatar || null)
          setBio(data.user.bio || '')
        }
        // Aspetta un momento per assicurarsi che il database sia aggiornato
        await new Promise(resolve => setTimeout(resolve, 100))
        // Aggiorna la sessione - questo triggera il callback jwt con trigger === 'update'
        await update()
        // Forza un refresh della sessione in tutti i componenti dopo un breve delay
        setTimeout(() => {
          window.dispatchEvent(new Event('session-update'))
        }, 200)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Errore nel salvataggio delle impostazioni')
      }
    } catch (err) {
      setError('Errore nel salvataggio delle impostazioni')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna alla home</span>
        </Link>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Impostazioni</h1>
          <p className="text-white/70 mb-8">Gestisci le tue informazioni personali</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-white/80 mb-3">
                <User className="w-4 h-4" />
                <span>Nome utente *</span>
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
                required
              />
              <p className="mt-1 text-xs text-white/50">
                {username.length}/20 caratteri (minimo 3)
              </p>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-white/80 mb-4">
                <ImageIcon className="w-4 h-4" />
                <span>Avatar *</span>
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

            {/* Bio */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-white/80 mb-3">
                <FileText className="w-4 h-4" />
                <span>Bio</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-white/50 resize-none"
                placeholder="Racconta qualcosa di te..."
                rows={4}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-white/50">
                {bio.length}/500 caratteri
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 text-sm text-emerald-300 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Impostazioni salvate con successo!</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
              <Link
                href="/"
                className="px-6 py-3 text-white/70 hover:text-white transition"
              >
                Annulla
              </Link>
              <motion.button
                type="submit"
                disabled={isSaving}
                whileHover={{ scale: isSaving ? 1 : 1.02 }}
                whileTap={{ scale: isSaving ? 1 : 0.98 }}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salva modifiche</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

