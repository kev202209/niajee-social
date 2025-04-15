import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of auth pages that should redirect to home if user is logged in
const authPages = [
  '/auth/login',
  '/auth/register',
  '/auth/forget-password',
  '/auth/verify-email',
  '/auth/reset-password',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sggtx')?.value;
  const isAuthPage = authPages.some(page => request.nextUrl.pathname.startsWith(page));

  // If trying to access auth pages while logged in, redirect to home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected pages while logged out, redirect to login
  // Note: This check ensures that if the user is not authenticated (no token) and the page is not one of the auth pages,
  // the user is redirected to the login page.
  if (!isAuthPage && !token && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

// Define matcher for which paths this middleware applies
export const config = {
  matcher: [
    // Match all request paths except:
    // - api routes
    // - static files (images, icons, etc.)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
