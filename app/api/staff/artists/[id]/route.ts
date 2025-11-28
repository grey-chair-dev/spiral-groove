import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getMakerById,
  updateMaker,
  deleteMaker,
} from '@/lib/db/lookup-tables';
import { updateMakerSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { ValidationError, NotFoundError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/makers/[id]
// Get a single maker by ID (staff only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const makerId = parseInt(id, 10);
    
    if (isNaN(makerId)) {
      return notFoundResponse('Invalid maker ID');
    }

    const maker = await getMakerById(makerId);
    
    if (!maker) {
      return notFoundResponse('Maker not found');
    }

    return successResponse(maker);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// PUT /api/staff/makers/[id]
// Update an maker (staff only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const makerId = parseInt(id, 10);
    
    if (isNaN(makerId)) {
      return notFoundResponse('Invalid maker ID');
    }

    const body = await parseBody(request);
    const validationResult = updateMakerSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const maker = await updateMaker(makerId, name);
    
    return successResponse(maker, {
      message: 'Maker updated successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// DELETE /api/staff/makers/[id]
// Delete an maker (staff only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const makerId = parseInt(id, 10);
    
    if (isNaN(makerId)) {
      return notFoundResponse('Invalid maker ID');
    }

    await deleteMaker(makerId);
    
    return successResponse(null, {
      message: 'Maker deleted successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

