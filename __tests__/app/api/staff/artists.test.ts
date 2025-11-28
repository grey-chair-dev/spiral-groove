import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/staff/makers/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/staff/makers/[id]/route';
import * as lookupTables from '@/lib/db/lookup-tables';
import * as authHelpers from '@/lib/api/auth-helpers';
import { UnauthorizedError } from '@/lib/api/errors';

// Mock dependencies
vi.mock('@/lib/db/lookup-tables');
vi.mock('@/lib/api/auth-helpers');

const mockRequireAuthenticated = authHelpers.requireAuthenticated as any;
const mockLookupTables = lookupTables as any;

describe('Staff Makers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated
    mockRequireAuthenticated.mockResolvedValue({ userId: 'client', role: 'staff' });
  });

  describe('GET /api/staff/makers', () => {
    it('should return all makers when authenticated', async () => {
      const mockMakers = [
        { maker_id: 1, name: 'The Beatles' },
        { maker_id: 2, name: 'Pink Floyd' },
      ];
      mockLookupTables.getAllMakers.mockResolvedValue(mockMakers);

      const request = new NextRequest('http://localhost/api/staff/makers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockMakers);
      expect(mockLookupTables.getAllMakers).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuthenticated.mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      const request = new NextRequest('http://localhost/api/staff/makers');
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(mockLookupTables.getAllMakers).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockLookupTables.getAllMakers.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost/api/staff/makers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/staff/makers', () => {
    it('should create a new maker when authenticated', async () => {
      const newMaker = { maker_id: 1, name: 'The Beatles' };
      mockLookupTables.createMaker.mockResolvedValue(newMaker);
      
      // Mock parseBody to return the request body
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'The Beatles' });

      const request = new NextRequest('http://localhost/api/staff/makers', {
        method: 'POST',
        body: JSON.stringify({ name: 'The Beatles' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(newMaker);
      expect(data.message).toBe('Maker created successfully');
      expect(mockLookupTables.createMaker).toHaveBeenCalledWith('The Beatles');
    });

    it('should return 400 for invalid input', async () => {
      // Mock parseBody to return invalid data
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: '' });

      const request = new NextRequest('http://localhost/api/staff/makers', {
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

      const request = new NextRequest('http://localhost/api/staff/makers', {
        method: 'POST',
        body: JSON.stringify({ name: 'The Beatles' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/staff/makers/[id]', () => {
    it('should return an maker by ID', async () => {
      const mockMaker = { maker_id: 1, name: 'The Beatles' };
      mockLookupTables.getMakerById.mockResolvedValue(mockMaker);

      const request = new NextRequest('http://localhost/api/staff/makers/1');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockMaker);
      expect(mockLookupTables.getMakerById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for invalid ID', async () => {
      const request = new NextRequest('http://localhost/api/staff/makers/abc');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: 'abc' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return 404 when maker not found', async () => {
      mockLookupTables.getMakerById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/staff/makers/999');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: '999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/staff/makers/[id]', () => {
    it('should update an maker', async () => {
      const updatedMaker = { maker_id: 1, name: 'The Beatles Updated' };
      mockLookupTables.updateMaker.mockResolvedValue(updatedMaker);
      
      // Mock parseBody to return the request body
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'The Beatles Updated' });

      const request = new NextRequest('http://localhost/api/staff/makers/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'The Beatles Updated' }),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedMaker);
      expect(mockLookupTables.updateMaker).toHaveBeenCalledWith(
        1,
        'The Beatles Updated'
      );
    });

    it('should return 400 for invalid input', async () => {
      // Mock parseBody to return invalid data
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: '' });

      const request = new NextRequest('http://localhost/api/staff/makers/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/staff/makers/[id]', () => {
    it('should delete an maker', async () => {
      mockLookupTables.deleteMaker.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/staff/makers/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Maker deleted successfully');
      expect(mockLookupTables.deleteMaker).toHaveBeenCalledWith(1);
    });

    it('should return 404 when maker not found', async () => {
      const { ApiError } = await import('@/lib/api/errors');
      mockLookupTables.deleteMaker.mockRejectedValue(
        new ApiError('Maker not found', 404, 'NOT_FOUND')
      );

      const request = new NextRequest('http://localhost/api/staff/makers/999', {
        method: 'DELETE',
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '999' }),
      });

      expect(response.status).toBe(404);
    });
  });
});

