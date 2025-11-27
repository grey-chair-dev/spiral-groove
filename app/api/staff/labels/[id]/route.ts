import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getLabelById,
  updateLabel,
  deleteLabel,
} from '@/lib/db/lookup-tables';
import { updateLabelSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { ValidationError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/labels/[id]
// Get a single label by ID (staff only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const labelId = parseInt(id, 10);
    
    if (isNaN(labelId)) {
      return notFoundResponse('Invalid label ID');
    }

    const label = await getLabelById(labelId);
    
    if (!label) {
      return notFoundResponse('Label not found');
    }

    return successResponse(label);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// PUT /api/staff/labels/[id]
// Update a label (staff only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const labelId = parseInt(id, 10);
    
    if (isNaN(labelId)) {
      return notFoundResponse('Invalid label ID');
    }

    const body = await parseBody(request);
    const validationResult = updateLabelSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const label = await updateLabel(labelId, name);
    
    return successResponse(label, {
      message: 'Label updated successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// DELETE /api/staff/labels/[id]
// Delete a label (staff only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const labelId = parseInt(id, 10);
    
    if (isNaN(labelId)) {
      return notFoundResponse('Invalid label ID');
    }

    await deleteLabel(labelId);
    
    return successResponse(null, {
      message: 'Label deleted successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

