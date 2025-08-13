import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPages = ['/auth/login', '/auth/register', '/auth/forget-password', '/auth/verify-email', '/auth/reset-password'];
const publicPages = ['/legals/privacy-policy', '/legals/terms', '/legals/contact-us', '/legals/cookie-policy', '/legals/gdpr', '/mango','/pricing', '/'];
const publicAssets = /\.(?:jpg|jpeg|gif|png|svg|ico|webp|mp4|webm)$/;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (publicAssets.test(pathname)) return NextResponse.next();
  if (publicPages.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get('sggtx')?.value;
  const isAuthPage = authPages.some(p => pathname.startsWith(p));

  // Auth page while logged in -> home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protected route without auth -> login with redirect back
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/auth/login', request.url);
    const original = pathname + search; // include query string
    loginUrl.searchParams.set('redirect', original);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
