import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const rawSecret = process.env.AUTH_SECRET;
if (!rawSecret) {
  throw new Error('AUTH_SECRET environment variable is not set');
}
const SECRET_KEY = new TextEncoder().encode(rawSecret);
const SESSION_COOKIE_NAME = 'client_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionRole = 'staff' | 'viewer';

export interface SessionClaims extends JWTPayload {
  userId: string;
  role: SessionRole;
}

const DEFAULT_SESSION: SessionClaims = {
  userId: 'client',
  role: 'staff',
};

/**
 * Create a session token for authenticated users
 */
export async function createSession(claims: SessionClaims = DEFAULT_SESSION) {
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify a session token and return its claims
 */
export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);

    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') {
      return null;
    }

    const role = payload.role as SessionRole;
    if (role !== 'staff' && role !== 'viewer') {
      return null;
    }

    return {
      userId: payload.userId,
      role,
    };
  } catch {
    return null;
  }
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }

  const claims = await verifySession(sessionCookie.value);
  return claims;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

/**
 * Delete session cookie
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

