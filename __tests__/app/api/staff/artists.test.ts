import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/staff/artists/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/staff/artists/[id]/route';
import * as lookupTables from '@/lib/db/lookup-tables';
import * as authHelpers from '@/lib/api/auth-helpers';
import { UnauthorizedError } from '@/lib/api/errors';

// Mock dependencies
vi.mock('@/lib/db/lookup-tables');
vi.mock('@/lib/api/auth-helpers');

const mockRequireAuthenticated = authHelpers.requireAuthenticated as any;
const mockLookupTables = lookupTables as any;

describe('Staff Artists API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated
    mockRequireAuthenticated.mockResolvedValue({ userId: 'client', role: 'staff' });
  });

  describe('GET /api/staff/artists', () => {
    it('should return all artists when authenticated', async () => {
      const mockArtists = [
        { artist_id: 1, name: 'The Beatles' },
        { artist_id: 2, name: 'Pink Floyd' },
      ];
      mockLookupTables.getAllArtists.mockResolvedValue(mockArtists);

      const request = new NextRequest('http://localhost/api/staff/artists');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockArtists);
      expect(mockLookupTables.getAllArtists).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuthenticated.mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      const request = new NextRequest('http://localhost/api/staff/artists');
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(mockLookupTables.getAllArtists).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockLookupTables.getAllArtists.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost/api/staff/artists');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/staff/artists', () => {
    it('should create a new artist when authenticated', async () => {
      const newArtist = { artist_id: 1, name: 'The Beatles' };
      mockLookupTables.createArtist.mockResolvedValue(newArtist);
      
      // Mock parseBody to return the request body
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'The Beatles' });

      const request = new NextRequest('http://localhost/api/staff/artists', {
        method: 'POST',
        body: JSON.stringify({ name: 'The Beatles' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(newArtist);
      expect(data.message).toBe('Artist created successfully');
      expect(mockLookupTables.createArtist).toHaveBeenCalledWith('The Beatles');
    });

    it('should return 400 for invalid input', async () => {
      // Mock parseBody to return invalid data
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: '' });

      const request = new NextRequest('http://localhost/api/staff/artists', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuthenticated.mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      const request = new NextRequest('http://localhost/api/staff/artists', {
        method: 'POST',
        body: JSON.stringify({ name: 'The Beatles' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/staff/artists/[id]', () => {
    it('should return an artist by ID', async () => {
      const mockArtist = { artist_id: 1, name: 'The Beatles' };
      mockLookupTables.getArtistById.mockResolvedValue(mockArtist);

      const request = new NextRequest('http://localhost/api/staff/artists/1');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockArtist);
      expect(mockLookupTables.getArtistById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for invalid ID', async () => {
      const request = new NextRequest('http://localhost/api/staff/artists/abc');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: 'abc' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return 404 when artist not found', async () => {
      mockLookupTables.getArtistById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/staff/artists/999');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: '999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/staff/artists/[id]', () => {
    it('should update an artist', async () => {
      const updatedArtist = { artist_id: 1, name: 'The Beatles Updated' };
      mockLookupTables.updateArtist.mockResolvedValue(updatedArtist);
      
      // Mock parseBody to return the request body
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'The Beatles Updated' });

      const request = new NextRequest('http://localhost/api/staff/artists/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'The Beatles Updated' }),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedArtist);
      expect(mockLookupTables.updateArtist).toHaveBeenCalledWith(
        1,
        'The Beatles Updated'
      );
    });

    it('should return 400 for invalid input', async () => {
      // Mock parseBody to return invalid data
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: '' });

      const request = new NextRequest('http://localhost/api/staff/artists/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/staff/artists/[id]', () => {
    it('should delete an artist', async () => {
      mockLookupTables.deleteArtist.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/staff/artists/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Artist deleted successfully');
      expect(mockLookupTables.deleteArtist).toHaveBeenCalledWith(1);
    });

    it('should return 404 when artist not found', async () => {
      const { ApiError } = await import('@/lib/api/errors');
      mockLookupTables.deleteArtist.mockRejectedValue(
        new ApiError('Artist not found', 404, 'NOT_FOUND')
      );

      const request = new NextRequest('http://localhost/api/staff/artists/999', {
        method: 'DELETE',
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '999' }),
      });

      expect(response.status).toBe(404);
    });
  });
});

