import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/wind-down', '/check-in', '/settings', '/stats', '/invite', '/onboarding']
const AUTH_ROUTES = ['/login', '/auth']
const ONBOARDING_ROUTE = '/onboarding'

export async function proxy(request: NextRequest) {
  // Disabled auth checks to let the app run as a local UI mockup
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:png|jpg|jpeg|gif|svg|webp)).*)',
  ],
}
