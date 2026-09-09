import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/api/auth/error',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Solo same-origin. Non wrappare il logout (né altri redirect) in /auth/callback:
      // quel passaggio è solo per il login Google e va impostato esplicitamente in signIn().
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
    async session({ session, token }: any) {
      if (token?.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
} satisfies NextAuthConfig
