import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { userId, username, avatar } = await request.json()

    // Verifica che l'utente corrisponda alla sessione
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Verifica che lo username non sia già in uso
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: 'Username già in uso' },
        { status: 400 }
      )
    }

    // Aggiorna l'utente con username e avatar
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        avatar,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Errore completamento registrazione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

