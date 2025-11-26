import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response
  let response: NextResponse;

  // Allow login page (homepage)
  if (pathname === '/') {
    response = NextResponse.next();
  }
  // Protect /home, /catalog, /products, and /cart routes - check authentication
  else if (pathname === '/home' || pathname.startsWith('/catalog/') || pathname.startsWith('/products/') || pathname === '/cart') {
    const sessionCookie = request.cookies.get('client_session');
    
    if (!sessionCookie?.value) {
      // No session cookie, redirect to login
      response = NextResponse.redirect(new URL('/', request.url));
    } else {
      // Verify session token
      const isValid = await verifySession(sessionCookie.value);
      if (!isValid) {
        // Invalid session, redirect to login
        response = NextResponse.redirect(new URL('/', request.url));
      } else {
        // Valid session, allow access
        response = NextResponse.next();
      }
    }
  }
  // Allow API routes (they handle their own auth)
  else if (pathname.startsWith('/api')) {
    response = NextResponse.next();
  }
  // Allow static assets (images, fonts, etc.)
  else if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/privacy')
  ) {
    response = NextResponse.next();
  }
  // Redirect all other routes to the coming soon page
  else {
    response = NextResponse.redirect(new URL('/', request.url));
  }

  // Security headers
  const headers = new Headers(response.headers);

  // HTTPS enforcement (HSTS)
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy but still useful)
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (restrict browser features)
  headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 'unsafe-eval' needed for Next.js in dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.neon.tech https://*.make.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  headers.set('Content-Security-Policy', csp);

  // Return response with security headers
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

