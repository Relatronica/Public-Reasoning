'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Check, User, Image as ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

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
];

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

function SettingsPageInner() {
  const router = useRouter();
  const { href } = useActiveCommunity();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const u = session.user as { username?: string; name?: string; avatar?: string; bio?: string };
      setUsername(u.username || u.name || '');
      setSelectedAvatar(u.avatar || null);
      setBio(u.bio || '');
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent('/settings'));
    }
  }, [status, session?.user?.id, router]);

  // Non riscrivere il form da una sessione stale mentre/dopo il salvataggio:
  // update() aggiorna il JWT; qui si allinea solo quando non stiamo salvando.
  useEffect(() => {
    if (!session?.user || isSaving || isLoading) return;
    const u = session.user as { username?: string; name?: string; avatar?: string; bio?: string };
    setUsername(u.username || u.name || '');
    setSelectedAvatar(u.avatar || null);
    setBio(u.bio || '');
  }, [
    isSaving,
    isLoading,
    (session?.user as { avatar?: string } | undefined)?.avatar,
    (session?.user as { username?: string } | undefined)?.username,
    (session?.user as { bio?: string } | undefined)?.bio,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSaving(true);

    if (!username.trim()) {
      setError('Il nome utente è obbligatorio');
      setIsSaving(false);
      return;
    }

    if (username.length < 3) {
      setError('Il nome utente deve essere di almeno 3 caratteri');
      setIsSaving(false);
      return;
    }

    if (!selectedAvatar) {
      setError('Seleziona un avatar');
      setIsSaving(false);
      return;
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
      });

      if (response.ok) {
        const data = await response.json();
        const nextUsername = data.user?.username || username;
        const nextAvatar = data.user?.avatar || selectedAvatar;
        const nextBio = (data.user?.bio ?? bio.trim()) || null;
        setUsername(nextUsername);
        setSelectedAvatar(nextAvatar);
        setBio(nextBio || '');
        // Passa i nuovi campi a update() così il JWT si aggiorna subito (navbar inclusa).
        await update({
          avatar: nextAvatar,
          username: nextUsername,
          name: nextUsername,
          bio: nextBio,
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Errore nel salvataggio delle impostazioni');
      }
    } catch {
      setError('Errore nel salvataggio delle impostazioni');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="reddit-card p-8 text-center text-sm text-gray-500 max-w-lg">Caricamento…</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href={href('/decisioni')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impostazioni profilo</h1>
          <p className="text-xs text-gray-500 mt-0.5">Nome, avatar e bio visibili nel registro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="reddit-card p-6 space-y-6">
        <label className="space-y-1 block">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
            <User className="w-4 h-4" />
            Nome utente *
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            className={inputClass}
            placeholder="es. marta_leone"
            minLength={3}
            maxLength={20}
            required
          />
          <p className="text-[11px] text-gray-400">{username.length}/20 caratteri (minimo 3)</p>
        </label>

        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            Avatar *
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {availableAvatars.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => {
                  setSelectedAvatar(avatar);
                  setError('');
                }}
                className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all bg-white ${
                  selectedAvatar === avatar
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image src={avatar} alt="Avatar" fill className="object-contain object-center" />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-700" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Bio
          </span>
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setError('');
            }}
            className={`${inputClass} resize-none`}
            placeholder="Ruolo, ufficio, note per i revisori…"
            rows={4}
            maxLength={500}
          />
          <p className="text-[11px] text-gray-400">{bio.length}/500 caratteri</p>
        </label>

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>
        )}

        {success && (
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Impostazioni salvate.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Link href={href('/decisioni')} className="text-xs text-gray-500 hover:text-gray-800">
            Annulla
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvataggio…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salva modifiche
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500 max-w-lg">Caricamento…</div>}>
      <SettingsPageInner />
    </Suspense>
  );
}
