import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/api/auth-helpers';
import {
  getArtistById,
  updateArtist,
  deleteArtist,
} from '@/lib/db/lookup-tables';
import { updateArtistSchema } from '@/lib/validation/schemas';
import { parseBody } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { ValidationError, NotFoundError, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/staff/artists/[id]
// Get a single artist by ID (staff only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const artistId = parseInt(id, 10);
    
    if (isNaN(artistId)) {
      return notFoundResponse('Invalid artist ID');
    }

    const artist = await getArtistById(artistId);
    
    if (!artist) {
      return notFoundResponse('Artist not found');
    }

    return successResponse(artist);
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// PUT /api/staff/artists/[id]
// Update an artist (staff only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const artistId = parseInt(id, 10);
    
    if (isNaN(artistId)) {
      return notFoundResponse('Invalid artist ID');
    }

    const body = await parseBody(request);
    const validationResult = updateArtistSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { name } = validationResult.data;
    const artist = await updateArtist(artistId, name);
    
    return successResponse(artist, {
      message: 'Artist updated successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

// DELETE /api/staff/artists/[id]
// Delete an artist (staff only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticated(request);
    const { id } = await params;
    const artistId = parseInt(id, 10);
    
    if (isNaN(artistId)) {
      return notFoundResponse('Invalid artist ID');
    }

    await deleteArtist(artistId);
    
    return successResponse(null, {
      message: 'Artist deleted successfully',
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

