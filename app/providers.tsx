'use client'

import { SessionProvider } from 'next-auth/react'
import { CuratorDataProvider } from '@/contexts/CuratorDataContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth">
      <CuratorDataProvider>{children}</CuratorDataProvider>
    </SessionProvider>
  )
}

