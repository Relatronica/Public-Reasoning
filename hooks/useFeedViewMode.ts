'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FeedViewMode } from '@/components/ReasoningRecordCard';

const STORAGE_KEY = 'dubitor.feedView';

function readStored(): FeedViewMode {
  if (typeof window === 'undefined') return 'card';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'list' || v === 'card') return v;
  } catch {
    /* ignore */
  }
  return 'card';
}

/** Preferenza vista Decisioni (card | elenco), persistita in localStorage. */
export function useFeedViewMode() {
  const [mode, setModeState] = useState<FeedViewMode>('card');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setModeState(readStored());
    setReady(true);
  }, []);

  const setMode = useCallback((next: FeedViewMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { mode, setMode, ready };
}
