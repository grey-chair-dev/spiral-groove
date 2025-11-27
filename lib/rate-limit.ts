// Simple in-memory rate limiter for API routes
// For production, consider using Redis or a dedicated service like Upstash

import type { NextRequest } from 'next/server';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export interface RateLimitProvider {
  hit(identifier: string, options: RateLimitOptions): Promise<RateLimitResult>;
}

interface RateLimitStoreRecord {
  count: number;
  resetTime: number;
}

class InMemoryRateLimitProvider implements RateLimitProvider {
  private store: Record<string, RateLimitStoreRecord> = {};

  async hit(
    identifier: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.store[identifier];

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      Object.keys(this.store).forEach((key) => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }

    if (!record || record.resetTime < now) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      return {
        success: true,
        remaining: options.maxRequests - 1,
        resetTime: now + options.windowMs,
      };
    }

    if (record.count >= options.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      success: true,
      remaining: options.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }
}

let provider: RateLimitProvider = new InMemoryRateLimitProvider();

export function setRateLimitProvider(customProvider: RateLimitProvider) {
  provider = customProvider;
}

/**
 * Pluggable rate limiter. Defaults to in-memory but can be swapped for Redis/Upstash.
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, maxRequests: 10 }
): Promise<RateLimitResult> {
  return provider.hit(identifier, options);
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for IP (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback if no IP headers found
  return 'unknown';
}

