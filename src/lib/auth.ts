/**
 * Authentication utilities and configuration
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'staff' | 'admin';
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(user: User): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, secret) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request headers
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Get user from request (for API routes)
 */
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  // In a real implementation, this would fetch from database
  // For now, return a mock user
  return {
    id: decoded.userId,
    email: decoded.email,
    name: 'Mock User',
    role: decoded.role as 'customer' | 'staff' | 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Check if user has required role
 */
export function hasRole(user: User, requiredRole: 'customer' | 'staff' | 'admin'): boolean {
  const roleHierarchy = {
    customer: 1,
    staff: 2,
    admin: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can access resource
 */
export function canAccess(user: User, resource: string, action: string): boolean {
  // Admin can do everything
  if (user.role === 'admin') {
    return true;
  }

  // Staff can manage most resources except user management
  if (user.role === 'staff') {
    if (resource === 'users' && action === 'delete') {
      return false;
    }
    return true;
  }

  // Customer can only access their own resources
  if (user.role === 'customer') {
    return ['read', 'create'].includes(action);
  }

  return false;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Rate limiting for authentication attempts
 */
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = authAttempts.get(identifier);

  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }

  // Increment counter
  attempts.count++;
  attempts.lastAttempt = now;
  authAttempts.set(identifier, attempts);

  return true;
}

/**
 * Clear rate limit for identifier
 */
export function clearRateLimit(identifier: string): void {
  authAttempts.delete(identifier);
}

/**
 * Session management
 */
export class SessionManager {
  private sessions = new Map<string, AuthSession>();

  createSession(user: User): AuthSession {
    const token = generateToken(user);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const session: AuthSession = {
      user,
      token,
      expiresAt,
    };

    this.sessions.set(token, session);
    return session;
  }

  getSession(token: string): AuthSession | null {
    const session = this.sessions.get(token);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  invalidateSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  invalidateUserSessions(userId: string): number {
    let count = 0;
    for (const [token, session] of this.sessions.entries()) {
      if (session.user.id === userId) {
        this.sessions.delete(token);
        count++;
      }
    }
    return count;
  }

  cleanupExpiredSessions(): number {
    const now = new Date();
    let count = 0;
    
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
        count++;
      }
    }
    
    return count;
  }
}

// Export singleton session manager
export const sessionManager = new SessionManager();

// Cleanup expired sessions every hour
setInterval(() => {
  const cleaned = sessionManager.cleanupExpiredSessions();
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
  }
}, 60 * 60 * 1000);
