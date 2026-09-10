'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

function safeDestination(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  if (raw.startsWith('/auth/callback')) return '/';
  return raw;
}

function AuthCallbackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = safeDestination(searchParams.get('callbackUrl'));

  useEffect(() => {
    // Questa pagina serve solo dopo il login OAuth.
    // Se non c’è sessione (es. logout mal reindirizzato), esci subito.
    if (status === 'unauthenticated') {
      router.replace(callbackUrl);
      return;
    }
    if (status !== 'authenticated') return;

    const checkUserStatus = async () => {
      if (!session?.user?.id) {
        router.replace(callbackUrl);
        return;
      }

      try {
        const response = await fetch(`/api/auth/check-user-status?userId=${session.user.id}`);
        const data = await response.json();

        if (data.hasUsername && data.hasAvatar) {
          router.replace(callbackUrl);
        } else {
          router.replace('/auth/register');
        }
      } catch (error) {
        console.error('Errore nel controllo stato utente:', error);
        router.replace('/auth/register');
      }
    };

    checkUserStatus();
  }, [status, session, callbackUrl, router]);

  // Rete di sicurezza: non restare bloccati su "Verifica in corso…"
  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(callbackUrl);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [callbackUrl, router]);

  return (
    <div className="reddit-card p-8 text-center max-w-md space-y-3">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
      <p className="text-sm text-gray-500">Verifica in corso…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="reddit-card p-8 text-center max-w-md space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Verifica in corso…</p>
        </div>
      }
    >
      <AuthCallbackPageInner />
    </Suspense>
  );
}
