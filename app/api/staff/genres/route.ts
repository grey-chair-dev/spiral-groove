import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getAllGenres,
  createGenre,
} from '@/lib/db/lookup-tables';
import { genreSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { ValidationError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/genres
// Get all genres (staff only)
export async function GET(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const genres = await getAllGenres();
    return successResponse(genres);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// POST /api/staff/genres
// Create a new genre (staff only)
export async function POST(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const body = await parseBody(request);
    const validationResult = genreSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const genre = await createGenre(name);
    
    return successResponse(genre, {
      message: 'Genre created successfully',
      status: 201,
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

