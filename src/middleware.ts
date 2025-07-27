import { type NextRequest } from 'next/server'
import { updateSession } from './lib/services/supabase/middleware'
import { jwtDecode } from 'jwt-decode'
import { supabaseClient } from './lib/services/supabase/supabase_client'

export async function middleware(request: NextRequest) {
  const supabase = await supabaseClient()
  const session = (await supabase.auth.getSession()).data.session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
