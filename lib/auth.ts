import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.AUTH_SECRET || 'your-secret-key-change-in-production';
const SESSION_COOKIE_NAME = 'client_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a session token for authenticated users
 */
export async function createSession(userId: string = 'client') {
  const secret = new TextEncoder().encode(SECRET_KEY);
  
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

/**
 * Verify a session token
 */
export async function verifySession(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }

  const isValid = await verifySession(sessionCookie.value);
  return isValid ? sessionCookie.value : null;
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

