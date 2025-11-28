import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/staff/labels/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/staff/labels/[id]/route';
import * as lookupTables from '@/lib/db/lookup-tables';
import * as authHelpers from '@/lib/api/auth-helpers';
import { UnauthorizedError } from '@/lib/api/errors';

vi.mock('@/lib/db/lookup-tables');
vi.mock('@/lib/api/auth-helpers');

const mockRequireAuthenticated = authHelpers.requireAuthenticated as any;
const mockLookupTables = lookupTables as any;

describe('Staff Labels API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue({ userId: 'client', role: 'staff' });
  });

  describe('GET /api/staff/labels', () => {
    it('returns labels for authenticated staff', async () => {
      const labels = [{ label_id: 1, name: 'Apple' }];
      mockLookupTables.getAllLabels.mockResolvedValue(labels);

      const response = await GET(new NextRequest('http://localhost/api/staff/labels'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(labels);
    });

    it('returns 401 when auth fails', async () => {
      mockRequireAuthenticated.mockRejectedValue(new UnauthorizedError());

      const response = await GET(new NextRequest('http://localhost/api/staff/labels'));

      expect(response.status).toBe(401);
      expect(mockLookupTables.getAllLabels).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/staff/labels', () => {
    it('creates a label', async () => {
      const newLabel = { label_id: 1, name: 'Columbia' };
      mockLookupTables.createLabel.mockResolvedValue(newLabel);
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'Columbia' });

      const response = await POST(
        new NextRequest('http://localhost/api/staff/labels', {
          method: 'POST',
          body: JSON.stringify({ name: 'Columbia' }),
        })
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toEqual(newLabel);
    });

    it('returns 400 for invalid payload', async () => {
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: '' });

      const response = await POST(
        new NextRequest('http://localhost/api/staff/labels', {
          method: 'POST',
          body: JSON.stringify({ name: '' }),
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/staff/labels/[id]', () => {
    it('returns a label by id', async () => {
      const label = { label_id: 1, name: 'Apple' };
      mockLookupTables.getLabelById.mockResolvedValue(label);

      const response = await GET_BY_ID(new NextRequest('http://localhost/api/staff/labels/1'), {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(label);
    });
  });

  describe('PUT /api/staff/labels/[id]', () => {
    it('updates a label', async () => {
      const label = { label_id: 1, name: 'Updated' };
      mockLookupTables.updateLabel.mockResolvedValue(label);
      const { parseBody } = await import('@/lib/api/middleware');
      (parseBody as any).mockResolvedValue({ name: 'Updated' });

      const response = await PUT(
        new NextRequest('http://localhost/api/staff/labels/1', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        }),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(label);
    });
  });

  describe('DELETE /api/staff/labels/[id]', () => {
    it('deletes a label', async () => {
      mockLookupTables.deleteLabel.mockResolvedValue(undefined);

      const response = await DELETE(
        new NextRequest('http://localhost/api/staff/labels/1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Label deleted successfully');
    });
  });
});

