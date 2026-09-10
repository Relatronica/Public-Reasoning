import { auth } from '@/auth';
import { isPlatformAdmin } from '@/lib/org/platform-admins';
import { NextResponse } from 'next/server';

export async function requirePlatformAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }),
    };
  }
  if (!isPlatformAdmin(session.user.email)) {
    return {
      session,
      error: NextResponse.json({ error: 'Solo super-admin di piattaforma.' }, { status: 403 }),
    };
  }
  return { session, error: null };
}
