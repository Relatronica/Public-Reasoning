import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Protected routes
  const protectedRoutes = ['/positions/new', '/topics/new', '/proposals', '/settings', '/curator', '/records/new']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtected && !req.auth) {
    const signInUrl = new URL('/auth/login', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/positions/new', '/topics/new', '/proposals/:path*', '/settings/:path*', '/curator/:path*', '/records/new'],
}

