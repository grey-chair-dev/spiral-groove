import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getAllLabels,
  createLabel,
} from '@/lib/db/lookup-tables';
import { labelSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { ValidationError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/labels
// Get all labels (staff only)
export async function GET(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const labels = await getAllLabels();
    return successResponse(labels);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// POST /api/staff/labels
// Create a new label (staff only)
export async function POST(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const body = await parseBody(request);
    const validationResult = labelSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const label = await createLabel(name);
    
    return successResponse(label, {
      message: 'Label created successfully',
      status: 201,
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

