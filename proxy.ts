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
  '/why',
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

// Security function to validate redirect URLs (prevents open redirects)
function isValidRedirectUrl(url: string, request: NextRequest): boolean {
  if (!url) return false;
  // Allow same-origin relative paths
  if (url.startsWith('/')) return true;
  try {
    const parsedUrl = new URL(url);
    const allowedDomains = [
      process.env.NEXT_PUBLIC_FRONTEND_A_URL,
      process.env.NEXT_PUBLIC_FRONTEND_B_URL,
    ].filter((d): d is string => Boolean(d));
    return allowedDomains.some(domain => parsedUrl.origin.includes(domain));
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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
      // Check for redirect parameter and validate it
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (redirectParam && isValidRedirectUrl(redirectParam, request)) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      } else {
        // Send logged-in users to /home instead of /
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return response;
  }

  // Protected pages only (create/admin/saved/history)
  const protectedPrefixes = ['/create', '/admin', '/saved', '/history'];
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));

  if (isProtected && !validSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Only run middleware on authenticated sections and auth pages
  matcher: [
    '/create/:path*',
    '/admin/:path*',
    '/saved',
    '/history',
    '/auth/:path*',
  ],
};
