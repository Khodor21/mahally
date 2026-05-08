import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const hostname = req.headers.get('host') || ''

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'yoursaas.com'

  // Extract subdomain — e.g. "nike" from "nike.yoursaas.com"
  const subdomain = hostname
    .replace(`.${appDomain}`, '')
    .replace(':3000', '')
    .replace('localhost', '')

  const isMainDomain =
    hostname === appDomain ||
    hostname === `www.${appDomain}` ||
    hostname.startsWith('localhost') ||
    hostname.includes('vercel.app')

  // If it's a subdomain (and not www/main), route to /store/[slug]
  if (!isMainDomain && subdomain && subdomain !== hostname) {
    url.pathname = `/store/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Protect /dashboard — redirect to /login if not authenticated
  if (url.pathname.startsWith('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and API auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
