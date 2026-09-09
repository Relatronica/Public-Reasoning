'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

/** Percorso legacy: unificato in /records/capture?mode=manual */
function RedirectManual() {
  const router = useRouter();
  const { href } = useActiveCommunity();

  useEffect(() => {
    router.replace(href('/records/capture', { mode: 'manual' }));
  }, [router, href]);

  return <div className="reddit-card p-8 text-center text-sm text-gray-500">Apro l’inserimento…</div>;
}

export default function NewReasoningRecordPage() {
  return (
    <Suspense fallback={<div className="reddit-card p-8 text-center text-sm text-gray-500">Caricamento…</div>}>
      <RedirectManual />
    </Suspense>
  );
}
