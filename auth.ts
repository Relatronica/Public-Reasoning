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
        // Sincronizza sempre dal token (anche se undefined), così un cambio avatar/username si vede subito.
        session.user.avatar = (token.avatar as string | undefined) || undefined
        session.user.username = (token.username as string | undefined) || undefined
        session.user.bio = (token.bio as string | undefined) || undefined
        if (token.username) {
          session.user.name = token.username as string
        }
      }
      return session
    },
    async jwt({ token, user, trigger, session }: any) {
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
      // update() da useSession: applica il payload e/o rileggi il DB
      if (trigger === 'update' && token.sub) {
        if (session && typeof session === 'object') {
          if (session.avatar !== undefined) token.avatar = session.avatar || undefined
          if (session.username !== undefined) token.username = session.username || undefined
          if (session.bio !== undefined) token.bio = session.bio || undefined
        }
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
