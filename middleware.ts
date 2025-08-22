import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Pages that do not require auth.
 */
const authPages = [
  '/auth/login',
  '/auth/register',
  '/auth/forget-password',
  '/auth/verify-email',
  '/auth/reset-password'
];
const publicPages = [
  '/legals/privacy-policy',
  '/legals/terms',
  '/legals/contact-us',
  '/legals/cookie-policy',
  '/legals/gdpr',
  '/mango',
  '/pricing',
  '/'
];
const publicAssets = /\.(?:jpg|jpeg|gif|png|svg|ico|webp|mp4|webm)$/;
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const SESSION_CACHE_MS = 30_000; // cache validity window

async function backendSessionValid(request: NextRequest, hasToken: boolean): Promise<boolean> {
  if (!hasToken) return false;
  if (!API_BASE) return false;
  try {
    const verifyUrl = `${API_BASE.replace(/\/$/, '')}/auth/verify`;
    const res = await fetch(verifyUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: { cookie: request.headers.get('cookie') || '' }
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (publicAssets.test(pathname)) return NextResponse.next();
  if (publicPages.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get('sggtx')?.value;
  const isAuthPage = authPages.some(p => pathname.startsWith(p));

  // Read cached session verification timestamp
  const sv = request.cookies.get('sv')?.value;
  const now = Date.now();
  let validSession = false;
  let usedCache = false;

  if (token && sv) {
    const last = parseInt(sv, 10);
    if (!Number.isNaN(last) && now - last < SESSION_CACHE_MS) {
      validSession = true;
      usedCache = true;
    }
  }

  if (token && !usedCache) {
    validSession = await backendSessionValid(request, true);
  }

  const response = NextResponse.next();

  // Maintain / clear cache cookie
  if (validSession) {
    // refresh timestamp when we actually called backend OR when cache still valid (optional)
    if (!usedCache) {
      response.cookies.set('sv', String(now), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }
  } else {
    response.cookies.delete('sv');
  }

  // Auth pages logic
  if (isAuthPage) {
    if (validSession) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // Protected pages
  if (!validSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
