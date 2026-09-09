import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireCuratorSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }) };
  }
  return { session, error: null };
}
