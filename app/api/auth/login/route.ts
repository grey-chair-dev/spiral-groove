import { NextRequest, NextResponse } from 'next/server';
import { createSession, setSessionCookie } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;
    const hashedPassword = process.env.CLIENT_PASSWORD_HASH;
    const legacyPassword = process.env.CLIENT_PASSWORD;

    if (!hashedPassword && !legacyPassword) {
      console.error('CLIENT_PASSWORD_HASH environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let isValid = false;
    if (hashedPassword) {
      isValid = await bcrypt.compare(password, hashedPassword);
    } else if (legacyPassword) {
      // Fallback for legacy environments until they rotate hashes
      isValid = password === legacyPassword;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession({ userId: 'staff-portal', role: 'staff' });
    
    // Set cookie in response
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set the session cookie
    response.cookies.set('client_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    );
  }
}

