import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/staff/genres/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/staff/genres/[id]/route';
import * as lookupTables from '@/lib/db/lookup-tables';
import * as authHelpers from '@/lib/api/auth-helpers';
import { UnauthorizedError } from '@/lib/api/errors';

vi.mock('@/lib/db/lookup-tables');
vi.mock('@/lib/api/auth-helpers');

const mockRequireAuthenticated = authHelpers.requireAuthenticated as any;
const mockLookupTables = lookupTables as any;

describe('Staff Genres API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue({ userId: 'client', role: 'staff' });
  });

  describe('GET /api/staff/genres', () => {
    it('returns genres for authenticated staff', async () => {
      const genres = [{ genre_id: 1, name: 'Rock' }];
      mockLookupTables.getAllGenres.mockResolvedValue(genres);

      const response = await GET(new NextRequest('http://localhost/api/staff/genres'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(genres);
    });

    it('returns 401 when auth fails', async () => {
      mockRequireAuthenticated.mockRejectedValue(new UnauthorizedError());

      const response = await GET(new NextRequest('http://localhost/api/staff/genres'));

      expect(response.status).toBe(401);
      expect(mockLookupTables.getAllGenres).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/staff/genres', () => {
    it('creates a genre', async () => {
      const newGenre = { genre_id: 1, name: 'Jazz' };
      mockLookupTables.createGenre.mockResolvedValue(newGenre);
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'Jazz' });

      const response = await POST(
        new NextRequest('http://localhost/api/staff/genres', {
          method: 'POST',
          body: JSON.stringify({ name: 'Jazz' }),
        })
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toEqual(newGenre);
    });
  });

  describe('GET /api/staff/genres/[id]', () => {
    it('returns a genre by id', async () => {
      const genre = { genre_id: 1, name: 'Rock' };
      mockLookupTables.getGenreById.mockResolvedValue(genre);

      const response = await GET_BY_ID(new NextRequest('http://localhost/api/staff/genres/1'), {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(genre);
    });
  });

  describe('PUT /api/staff/genres/[id]', () => {
    it('updates a genre', async () => {
      const updated = { genre_id: 1, name: 'Updated' };
      mockLookupTables.updateGenre.mockResolvedValue(updated);
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'Updated' });

      const response = await PUT(
        new NextRequest('http://localhost/api/staff/genres/1', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        }),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(updated);
    });
  });

  describe('DELETE /api/staff/genres/[id]', () => {
    it('deletes a genre', async () => {
      mockLookupTables.deleteGenre.mockResolvedValue(undefined);

      const response = await DELETE(
        new NextRequest('http://localhost/api/staff/genres/1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Genre deleted successfully');
    });
  });
});

