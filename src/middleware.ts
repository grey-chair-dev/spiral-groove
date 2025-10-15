/**
 * Next.js Middleware for Authentication and Route Protection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['admin', 'staff'],
  '/admin/dashboard': ['admin', 'staff'],
  '/admin/products': ['admin', 'staff'],
  '/admin/orders': ['admin', 'staff'],
  '/admin/users': ['admin'],
  '/admin/events': ['admin', 'staff'],
  '/admin/content': ['admin', 'staff'],
  '/profile': ['customer', 'staff', 'admin'],
  '/orders': ['customer', 'staff', 'admin'],
  '/wishlist': ['customer', 'staff', 'admin'],
} as const;

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/products',
  '/events',
  '/about',
  '/contact',
  '/blog',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/api/auth',
] as const;

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/cart',
  '/api/orders',
  '/api/profile',
  '/api/wishlist',
] as const;

// Define API routes that require admin/staff roles
const adminApiRoutes = [
  '/api/admin',
] as const;

/**
 * Check if a route is public
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Check if a route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Check if an API route is protected
 */
function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Check if an API route requires admin access
 */
function isAdminApiRoute(pathname: string): boolean {
  return adminApiRoutes.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Get required roles for a route
 */
function getRequiredRoles(pathname: string): string[] {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return [];
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy = {
    customer: 1,
    staff: 2,
    admin: 3,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  return requiredRoles.some(role => 
    userLevel >= roleHierarchy[role as keyof typeof roleHierarchy]
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Check if API route is protected
    if (isProtectedApiRoute(pathname) || isAdminApiRoute(pathname)) {
      const token = extractTokenFromRequest(request);
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Check admin routes
      if (isAdminApiRoute(pathname)) {
        if (!hasRequiredRole(decoded.role, ['admin', 'staff'])) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-email', decoded.email);
      requestHeaders.set('x-user-role', decoded.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Allow other API routes
    return NextResponse.next();
  }

  // Handle page routes
  if (isProtectedRoute(pathname)) {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      // Redirect to sign in page
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      // Redirect to sign in page with error
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      signInUrl.searchParams.set('error', 'InvalidToken');
      return NextResponse.redirect(signInUrl);
    }

    // Check role requirements
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles.length > 0 && !hasRequiredRole(decoded.role, requiredRoles)) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-email', decoded.email);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Allow public routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
