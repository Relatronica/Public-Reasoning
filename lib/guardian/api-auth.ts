import { timingSafeEqual } from 'crypto';

/**
 * API key per Decision API (Bearer).
 * Env: GUARDIAN_API_KEY o GUARDIAN_API_KEYS (virgola).
 */
export function configuredApiKeys(): string[] {
  const multi = process.env.GUARDIAN_API_KEYS;
  if (multi) {
    return multi
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }
  const single = process.env.GUARDIAN_API_KEY?.trim();
  return single ? [single] : [];
}

export function apiKeysConfigured(): boolean {
  return configuredApiKeys().length > 0;
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** Estrae Bearer token da Authorization o X-Api-Key. */
export function extractApiKey(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (auth?.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim() || null;
  }
  const header = request.headers.get('x-api-key');
  return header?.trim() || null;
}

export function authorizeGuardianApi(request: Request): {
  ok: boolean;
  error?: string;
  status?: number;
} {
  const keys = configuredApiKeys();
  if (keys.length === 0) {
    return {
      ok: false,
      error: 'Decision API non configurata (GUARDIAN_API_KEY assente)',
      status: 503,
    };
  }
  const provided = extractApiKey(request);
  if (!provided) {
    return { ok: false, error: 'Serve Authorization: Bearer <key>', status: 401 };
  }
  if (!keys.some((k) => safeEqual(k, provided))) {
    return { ok: false, error: 'API key non valida', status: 403 };
  }
  return { ok: true };
}

export function allowGuardianReset(): boolean {
  if (process.env.GUARDIAN_ALLOW_RESET === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}
