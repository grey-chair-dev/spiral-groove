import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getAllMakers,
  createMaker,
  getMakerById,
  updateMaker,
  deleteMaker,
} from '@/lib/db/lookup-tables';
import { makerSchema, updateMakerSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { ValidationError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/makers
// Get all makers (staff only)
export async function GET(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const makers = await getAllMakers();
    return successResponse(makers);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// POST /api/staff/makers
// Create a new maker (staff only)
export async function POST(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const body = await parseBody(request);
    const validationResult = makerSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const maker = await createMaker(name);
    
    return successResponse(maker, {
      message: 'Maker created successfully',
      status: 201,
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

