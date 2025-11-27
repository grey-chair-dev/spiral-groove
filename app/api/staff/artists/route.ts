import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getAllArtists,
  createArtist,
  getArtistById,
  updateArtist,
  deleteArtist,
} from '@/lib/db/lookup-tables';
import { artistSchema, updateArtistSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { ValidationError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/artists
// Get all artists (staff only)
export async function GET(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const artists = await getAllArtists();
    return successResponse(artists);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// POST /api/staff/artists
// Create a new artist (staff only)
export async function POST(request: NextRequest) {
  try {
    await requireAuthenticated(request);
    const body = await parseBody(request);
    const validationResult = artistSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const artist = await createArtist(name);
    
    return successResponse(artist, {
      message: 'Artist created successfully',
      status: 201,
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

