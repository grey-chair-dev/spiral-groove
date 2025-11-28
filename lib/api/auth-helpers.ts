import { NextRequest } from 'next/server';
import { verifySession, SessionClaims, SessionRole } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/api/errors';

/**
 * Check if the current request is authenticated (has valid session)
 * Returns the session claims if authenticated, otherwise throws
 */
export async function requireAuth(
  request: NextRequest,
  requiredRole: SessionRole = 'staff'
): Promise<SessionClaims> {
  const sessionCookie = request.cookies.get('client_session');

  if (!sessionCookie?.value) {
    throw new UnauthorizedError('Authentication required');
  }

  const claims = await verifySession(sessionCookie.value);
  if (!claims) {
    throw new UnauthorizedError('Authentication required');
  }

  if (requiredRole && claims.role !== requiredRole) {
    throw new UnauthorizedError('Insufficient permissions');
  }

  return claims;
}

/**
 * Middleware/helper alias that enforces authentication
 */
export async function requireAuthenticated(
  request: NextRequest,
  requiredRole: SessionRole = 'staff'
): Promise<SessionClaims> {
  return requireAuth(request, requiredRole);
}

