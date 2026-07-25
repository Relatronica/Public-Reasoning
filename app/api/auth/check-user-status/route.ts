import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const userId = request.nextUrl.searchParams.get('userId')
    
    // Verifica che l'userId corrisponda alla sessione
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Controlla se l'utente ha username e avatar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, avatar: true }
    })

    return NextResponse.json({
      hasUsername: !!user?.username,
      hasAvatar: !!user?.avatar,
    })
  } catch (error) {
    console.error('Errore controllo stato utente:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

