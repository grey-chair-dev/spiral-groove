import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';
import { rateLimit, getClientIP } from './lib/rate-limit';

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
      const session = await verifySession(sessionCookie.value);
      if (!session || session.role !== 'staff') {
        // Invalid session, redirect to login
        response = NextResponse.redirect(new URL('/', request.url));
      } else {
        // Valid session, allow access
        response = NextResponse.next();
      }
    }
  }
  // Apply rate limiting to API routes
  else if (pathname.startsWith('/api')) {
    // Skip rate limiting for health check endpoint
    if (pathname === '/api/health') {
      response = NextResponse.next();
    } else {
      const clientIP = getClientIP(request);
      
      // Different rate limits for different endpoint types
      let rateLimitOptions;
      if (pathname.startsWith('/api/auth/')) {
        // Staff/auth endpoints: stricter limits (prevent brute force)
        rateLimitOptions = {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 10, // 10 requests per 15 minutes
        };
      } else if (pathname.startsWith('/api/checkout')) {
        // Checkout endpoints: moderate limits
        rateLimitOptions = {
          windowMs: 5 * 60 * 1000, // 5 minutes
          maxRequests: 20, // 20 requests per 5 minutes
        };
      } else {
        // Public endpoints: standard limits
        rateLimitOptions = {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 100, // 100 requests per 15 minutes
        };
      }
      
      const rateLimitResult = await rateLimit(`api:${pathname}:${clientIP}`, rateLimitOptions);
      
      if (!rateLimitResult.success) {
        const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': rateLimitOptions.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            },
          }
        );
      }
      
      // Add rate limit headers to response
      response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', rateLimitOptions.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    }
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
  // Copy all existing headers (including rate limit headers) before adding security headers
  const headers = new Headers(response.headers);
  
  // Ensure rate limit headers are preserved (re-set them if they exist on response)
  if (response.headers.has('X-RateLimit-Limit')) {
    headers.set('X-RateLimit-Limit', response.headers.get('X-RateLimit-Limit')!);
    headers.set('X-RateLimit-Remaining', response.headers.get('X-RateLimit-Remaining')!);
    headers.set('X-RateLimit-Reset', response.headers.get('X-RateLimit-Reset')!);
  }

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
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * 
     * Note: API routes ARE included so rate limiting works
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

