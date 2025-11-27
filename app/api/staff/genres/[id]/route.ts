import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getGenreById,
  updateGenre,
  deleteGenre,
} from '@/lib/db/lookup-tables';
import { updateGenreSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { ValidationError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/genres/[id]
// Get a single genre by ID (staff only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const genreId = parseInt(id, 10);
    
    if (isNaN(genreId)) {
      return notFoundResponse('Invalid genre ID');
    }

    const genre = await getGenreById(genreId);
    
    if (!genre) {
      return notFoundResponse('Genre not found');
    }

    return successResponse(genre);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// PUT /api/staff/genres/[id]
// Update a genre (staff only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const genreId = parseInt(id, 10);
    
    if (isNaN(genreId)) {
      return notFoundResponse('Invalid genre ID');
    }

    const body = await parseBody(request);
    const validationResult = updateGenreSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const genre = await updateGenre(genreId, name);
    
    return successResponse(genre, {
      message: 'Genre updated successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// DELETE /api/staff/genres/[id]
// Delete a genre (staff only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const genreId = parseInt(id, 10);
    
    if (isNaN(genreId)) {
      return notFoundResponse('Invalid genre ID');
    }

    await deleteGenre(genreId);
    
    return successResponse(null, {
      message: 'Genre deleted successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

