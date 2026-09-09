import { NextResponse } from 'next/server';
import { getCuratorBootstrap } from '@/lib/curator/bootstrap.server';

export async function GET() {
  const bootstrap = await getCuratorBootstrap();
  return NextResponse.json(bootstrap);
}
