import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/services/supabase/middleware'
import DatabaseContext from './lib/database/database_context'
import { baseUrls } from './configs'

export async function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith(baseUrls.ADMIN_BASE_URL)) {
    const dbContext = await DatabaseContext()
    const isAdmin = await dbContext.adminService.isUserAdmin()

    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = baseUrls.LOGIN; url.searchParams.set("error", "Tried to access a protected route without the proper role")
      return NextResponse.redirect(url)
    }
  }

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
