'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

function RegisterCompletePageInner() {
  const router = useRouter();
  const { href } = useActiveCommunity();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [isCompleting, setIsCompleting] = useState(true);

  const username = searchParams.get('username');
  const avatar = searchParams.get('avatar');

  useEffect(() => {
    const completeRegistration = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/auth/complete-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              username,
              avatar,
            }),
          });

          if (response.ok) {
            await update();
            setIsCompleting(false);
            setTimeout(() => {
              router.push(href('/'));
            }, 2000);
          } else {
            console.error('Errore nel completamento registrazione');
          }
        } catch (error) {
          console.error('Errore:', error);
        }
      }
    };

    completeRegistration();
  }, [status, session, username, avatar, router, update, href]);

  if (status === 'loading' || isCompleting) {
    return (
      <div className="reddit-card p-8 text-center max-w-md space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Completamento registrazione…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-md">
      <div className="reddit-card p-8 text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Registrazione completata</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Il tuo account è pronto. Tra poco torni al feed.
          </p>
        </div>
        <Link
          href={href('/')}
          className="inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
        >
          Vai al feed
        </Link>
      </div>
    </div>
  );
}

export default function RegisterCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="reddit-card p-8 text-center max-w-md space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Completamento registrazione…</p>
        </div>
      }
    >
      <RegisterCompletePageInner />
    </Suspense>
  );
}
