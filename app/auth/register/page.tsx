'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
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

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
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
  );
}

export default function RegisterPage() {
  const { href } = useActiveCommunity();
  const [step, setStep] = useState<'info' | 'oauth'>('info');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Il nome utente è obbligatorio');
      return;
    }

    if (username.length < 3) {
      setError('Il nome utente deve essere di almeno 3 caratteri');
      return;
    }

    if (!selectedAvatar) {
      setError('Seleziona un avatar');
      return;
    }

    sessionStorage.setItem(
      'registrationData',
      JSON.stringify({ username, avatar: selectedAvatar })
    );

    setStep('oauth');
  };

  const handleGoogleSignIn = () => {
    signIn('google', {
      callbackUrl: `/auth/register/complete?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(selectedAvatar || '')}`,
    });
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href={href('/')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'info' ? 'Crea account' : 'Completa registrazione'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {step === 'info' ? 'Scegli nome e avatar, poi collega Google' : 'Ultimo passo con Google'}
          </p>
        </div>
      </div>

      <div className="reddit-card p-6">
        {step === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="space-y-5">
            <label className="space-y-1 block">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nome utente *</span>
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
              />
              <p className="text-[11px] text-gray-400">{username.length}/20 caratteri (minimo 3)</p>
            </label>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Avatar *</span>
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

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>
            )}

            <button
              type="submit"
              className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Continua con Google
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-white relative flex-shrink-0">
                {selectedAvatar && (
                  <Image src={selectedAvatar} alt="Avatar" fill className="object-contain object-center" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{username}</p>
                <p className="text-[11px] text-gray-500">Nome scelto per il registro</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <GoogleIcon />
              Continua con Google
            </button>

            <button
              type="button"
              onClick={() => setStep('info')}
              className="w-full text-xs text-gray-500 hover:text-gray-800"
            >
              ← Torna indietro
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Hai già un account?</p>
          <Link href="/auth/login" className="text-xs font-semibold text-blue-700 hover:underline">
            Accedi
          </Link>
        </div>
      </div>
    </div>
  );
}
