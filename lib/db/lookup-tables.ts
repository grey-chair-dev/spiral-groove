import { sql } from '@/lib/db';
import { ApiError } from '@/lib/api/errors';

// ============================================================================
// ARTIST TABLE CRUD
// ============================================================================

export interface Artist {
  artist_id: number;
  name: string;
}

/**
 * Get all artists
 */
export async function getAllArtists(): Promise<Artist[]> {
  try {
    const result = await sql`
      SELECT artist_id, name
      FROM "Artist"
      ORDER BY name ASC
    `;
    return result as Artist[];
  } catch (error: any) {
    throw new ApiError(
      `Failed to fetch artists: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Get a single artist by ID
 */
export async function getArtistById(artistId: number): Promise<Artist | null> {
  try {
    const result = await sql`
      SELECT artist_id, name
      FROM "Artist"
      WHERE artist_id = ${artistId}
      LIMIT 1
    `;
    return (result[0] as Artist) || null;
  } catch (error: any) {
    throw new ApiError(
      `Failed to fetch artist: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Create a new artist
 */
export async function createArtist(name: string): Promise<Artist> {
  if (!name || name.trim().length === 0) {
    throw new ApiError('Artist name is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const result = await sql`
      INSERT INTO "Artist" (name)
      VALUES (${name.trim()})
      RETURNING artist_id, name
    `;
    return result[0] as Artist;
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new ApiError(
        `Artist "${name}" already exists`,
        409,
        'DUPLICATE_ERROR'
      );
    }
    throw new ApiError(
      `Failed to create artist: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Update an artist
 */
export async function updateArtist(artistId: number, name: string): Promise<Artist> {
  if (!name || name.trim().length === 0) {
    throw new ApiError('Artist name is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const result = await sql`
      UPDATE "Artist"
      SET name = ${name.trim()}
      WHERE artist_id = ${artistId}
      RETURNING artist_id, name
    `;
    
    if (result.length === 0) {
      throw new ApiError(`Artist with ID ${artistId} not found`, 404, 'NOT_FOUND');
    }

    return result[0] as Artist;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    if (error.code === '23505') {
      throw new ApiError(
        `Artist "${name}" already exists`,
        409,
        'DUPLICATE_ERROR'
      );
    }
    throw new ApiError(
      `Failed to update artist: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Delete an artist
 */
export async function deleteArtist(artistId: number): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM "Artist"
      WHERE artist_id = ${artistId}
      RETURNING artist_id
    `;
    
    if (result.length === 0) {
      throw new ApiError(`Artist with ID ${artistId} not found`, 404, 'NOT_FOUND');
    }
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    // Handle foreign key constraint violation
    if (error.code === '23503') {
      throw new ApiError(
        `Cannot delete artist: it is referenced by existing products`,
        409,
        'FOREIGN_KEY_CONSTRAINT'
      );
    }
    throw new ApiError(
      `Failed to delete artist: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

// ============================================================================
// LABEL TABLE CRUD
// ============================================================================

export interface Label {
  label_id: number;
  name: string;
}

/**
 * Get all labels
 */
export async function getAllLabels(): Promise<Label[]> {
  try {
    const result = await sql`
      SELECT label_id, name
      FROM "Label"
      ORDER BY name ASC
    `;
    return result as Label[];
  } catch (error: any) {
    throw new ApiError(
      `Failed to fetch labels: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Get a single label by ID
 */
export async function getLabelById(labelId: number): Promise<Label | null> {
  try {
    const result = await sql`
      SELECT label_id, name
      FROM "Label"
      WHERE label_id = ${labelId}
      LIMIT 1
    `;
    return (result[0] as Label) || null;
  } catch (error: any) {
    throw new ApiError(
      `Failed to fetch label: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Create a new label
 */
export async function createLabel(name: string): Promise<Label> {
  if (!name || name.trim().length === 0) {
    throw new ApiError('Label name is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const result = await sql`
      INSERT INTO "Label" (name)
      VALUES (${name.trim()})
      RETURNING label_id, name
    `;
    return result[0] as Label;
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ApiError(
        `Label "${name}" already exists`,
        409,
        'DUPLICATE_ERROR'
      );
    }
    throw new ApiError(
      `Failed to create label: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Update a label
 */
export async function updateLabel(labelId: number, name: string): Promise<Label> {
  if (!name || name.trim().length === 0) {
    throw new ApiError('Label name is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const result = await sql`
      UPDATE "Label"
      SET name = ${name.trim()}
      WHERE label_id = ${labelId}
      RETURNING label_id, name
    `;
    
    if (result.length === 0) {
      throw new ApiError(`Label with ID ${labelId} not found`, 404, 'NOT_FOUND');
    }

    return result[0] as Label;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    if (error.code === '23505') {
      throw new ApiError(
        `Label "${name}" already exists`,
        409,
        'DUPLICATE_ERROR'
      );
    }
    throw new ApiError(
      `Failed to update label: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Delete a label
 */
export async function deleteLabel(labelId: number): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM "Label"
      WHERE label_id = ${labelId}
      RETURNING label_id
    `;
    
    if (result.length === 0) {
      throw new ApiError(`Label with ID ${labelId} not found`, 404, 'NOT_FOUND');
    }
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    if (error.code === '23503') {
      throw new ApiError(
        `Cannot delete label: it is referenced by existing products`,
        409,
        'FOREIGN_KEY_CONSTRAINT'
      );
    }
    throw new ApiError(
      `Failed to delete label: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

// ============================================================================
// GENRE TABLE CRUD
// ============================================================================

export interface Genre {
  genre_id: number;
  name: string;
}

/**
 * Get all genres
 */
export async function getAllGenres(): Promise<Genre[]> {
  try {
    const result = await sql`
      SELECT genre_id, name
      FROM "Genre"
      ORDER BY name ASC
    `;
    return result as Genre[];
  } catch (error: any) {
    throw new ApiError(
      `Failed to fetch genres: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Get a single genre by ID
 */
export async function getGenreById(genreId: number): Promise<Genre | null> {
  try {
    const result = await sql`
      SELECT genre_id, name
      FROM "Genre"
      WHERE genre_id = ${genreId}
      LIMIT 1
    `;
    return (result[0] as Genre) || null;
  } catch (error: any) {
    throw new ApiError(
      `Failed to fetch genre: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Create a new genre
 */
export async function createGenre(name: string): Promise<Genre> {
  if (!name || name.trim().length === 0) {
    throw new ApiError('Genre name is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const result = await sql`
      INSERT INTO "Genre" (name)
      VALUES (${name.trim()})
      RETURNING genre_id, name
    `;
    return result[0] as Genre;
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ApiError(
        `Genre "${name}" already exists`,
        409,
        'DUPLICATE_ERROR'
      );
    }
    throw new ApiError(
      `Failed to create genre: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Update a genre
 */
export async function updateGenre(genreId: number, name: string): Promise<Genre> {
  if (!name || name.trim().length === 0) {
    throw new ApiError('Genre name is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const result = await sql`
      UPDATE "Genre"
      SET name = ${name.trim()}
      WHERE genre_id = ${genreId}
      RETURNING genre_id, name
    `;
    
    if (result.length === 0) {
      throw new ApiError(`Genre with ID ${genreId} not found`, 404, 'NOT_FOUND');
    }

    return result[0] as Genre;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    if (error.code === '23505') {
      throw new ApiError(
        `Genre "${name}" already exists`,
        409,
        'DUPLICATE_ERROR'
      );
    }
    throw new ApiError(
      `Failed to update genre: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Delete a genre
 */
export async function deleteGenre(genreId: number): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM "Genre"
      WHERE genre_id = ${genreId}
      RETURNING genre_id
    `;
    
    if (result.length === 0) {
      throw new ApiError(`Genre with ID ${genreId} not found`, 404, 'NOT_FOUND');
    }
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    if (error.code === '23503') {
      throw new ApiError(
        `Cannot delete genre: it is referenced by existing products`,
        409,
        'FOREIGN_KEY_CONSTRAINT'
      );
    }
    throw new ApiError(
      `Failed to delete genre: ${error.message}`,
      500,
      'DATABASE_ERROR',
      { cause: error }
    );
  }
}

