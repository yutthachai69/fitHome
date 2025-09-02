import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const protectedPaths = ['/dashboard', '/profile']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
  const hasSessionCookie = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token')
  
  if (isProtectedPath && !hasSessionCookie) {
    const url = new URL('/login', req.url)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*', '/profile/:path*'] }

