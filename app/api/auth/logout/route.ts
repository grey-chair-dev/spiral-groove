import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await deleteSessionCookie();
  
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the cookie
  response.cookies.delete('client_session');

  return response;
}

