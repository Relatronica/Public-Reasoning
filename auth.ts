import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' }, // Force JWT for edge compatibility in middleware if needed, or just for consistency
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }: any) {
      if (token?.sub && session.user) {
        session.user.id = token.sub
        // Aggiungi avatar, username e bio dal token (recuperati dal database nel callback jwt)
        if (token.avatar) {
          session.user.avatar = token.avatar as string
        }
        if (token.username) {
          session.user.username = token.username as string
        }
        if (token.bio) {
          session.user.bio = token.bio as string
        }
      }
      return session
    },
    async jwt({ token, user, trigger }: any) {
      // Quando l'utente fa login per la prima volta
      if (user) {
        token.sub = user.id
        // Recupera i dati completi dell'utente dal database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { avatar: true, username: true, image: true, bio: true }
        })
        if (dbUser) {
          // Usa l'avatar scelto dall'utente se esiste, altrimenti l'immagine di Google
          token.avatar = dbUser.avatar || dbUser.image || undefined
          token.username = dbUser.username || undefined
          token.bio = dbUser.bio || undefined
        }
      }
      // Quando viene aggiornato il profilo (trigger === 'update')
      if (trigger === 'update' && token.sub) {
        // Recupera sempre i dati più recenti dal database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { avatar: true, username: true, image: true, bio: true }
        })
        if (dbUser) {
          token.avatar = dbUser.avatar || dbUser.image || undefined
          token.username = dbUser.username || undefined
          token.bio = dbUser.bio || undefined
        }
      }
      return token
    },
  }
})
