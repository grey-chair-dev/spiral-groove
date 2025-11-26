import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/products/revalidate
 * Manually revalidate the products cache
 * 
 * Useful when you want to force refresh after Square webhook events
 */
export async function POST(request: Request) {
  try {
    // Revalidate the products API route
    revalidatePath('/api/products');
    revalidatePath('/api/inventory');

    return NextResponse.json({
      success: true,
      message: 'Products cache revalidated',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Failed to revalidate cache',
    }, { status: 500 });
  }
}

