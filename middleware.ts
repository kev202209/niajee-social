import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // If trying to access auth pages while logged in, redirect to home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected pages while logged out, redirect to login
  if (!isAuthPage && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

// Add your protected routes here
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - auth pages (but we still want to handle redirects)
     * - api routes
     * - static files (images, icons, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};