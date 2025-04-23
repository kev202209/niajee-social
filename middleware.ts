import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPages = ['/auth/login', '/auth/register', '/auth/forget-password', '/auth/verify-email', '/auth/reset-password'];
const publicPages = ['/legals/privacy-policy', '/legals/terms', '/legals/contact-us', '/']; // Add root path

// Add public asset extensions
const publicAssets = /\.(?:jpg|jpeg|gif|png|svg|ico|webp|mp4|webm)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets
  if (publicAssets.test(pathname)) {
    return NextResponse.next();
  }

  // Allow access to public pages without authentication
  if (publicPages.some(page => pathname === page)) { // Use exact match for homepage
    return NextResponse.next();
  }

  const token = request.cookies.get('sggtx')?.value;
  const isAuthPage = authPages.some(page => pathname.startsWith(page));

  // If trying to access auth pages while logged in, redirect to home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected pages while logged out, redirect to login
  if (!isAuthPage && !token && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
