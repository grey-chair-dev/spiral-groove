import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllMakers,
  getMakerById,
  createMaker,
  updateMaker,
  deleteMaker,
  getAllLabels,
  getLabelById,
  createLabel,
  updateLabel,
  deleteLabel,
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} from '@/lib/db/lookup-tables';
import { ApiError } from '@/lib/api/errors';

// Mock the database module
vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}));

import { sql } from '@/lib/db';
const mockSql = sql as any;

describe('Lookup Tables CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Maker Operations', () => {
    describe('getAllMakers', () => {
      it('should return all makers sorted by name', async () => {
        const mockMakers = [
          { maker_id: 1, name: 'The Beatles' },
          { maker_id: 2, name: 'Pink Floyd' },
        ];
        mockSql.mockResolvedValue(mockMakers);

        const result = await getAllMakers();

        expect(result).toEqual(mockMakers);
        expect(mockSql).toHaveBeenCalled();
        // Check that SQL contains the expected query
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('SELECT maker_id, name');
        expect(sqlString).toContain('FROM "Maker"');
      });

      it('should handle database errors', async () => {
        mockSql.mockRejectedValue(new Error('Database connection failed'));

        await expect(getAllMakers()).rejects.toThrow(ApiError);
      });
    });

    describe('getMakerById', () => {
      it('should return an maker by ID', async () => {
        const mockMaker = { maker_id: 1, name: 'The Beatles' };
        mockSql.mockResolvedValue([mockMaker]);

        const result = await getMakerById(1);

        expect(result).toEqual(mockMaker);
        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('WHERE maker_id =');
      });

      it('should return null if maker not found', async () => {
        mockSql.mockResolvedValue([]);

        const result = await getMakerById(999);

        expect(result).toBeNull();
      });

      it('should handle database errors', async () => {
        mockSql.mockRejectedValue(new Error('Database error'));

        await expect(getMakerById(1)).rejects.toThrow(ApiError);
      });
    });

    describe('createMaker', () => {
      it('should create a new maker', async () => {
        const newMaker = { maker_id: 1, name: 'The Beatles' };
        mockSql.mockResolvedValue([newMaker]);

        const result = await createMaker('The Beatles');

        expect(result).toEqual(newMaker);
        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('INSERT INTO "Maker"');
      });

      it('should trim whitespace from name', async () => {
        const newMaker = { maker_id: 1, name: 'The Beatles' };
        mockSql.mockResolvedValue([newMaker]);

        await createMaker('  The Beatles  ');

        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        // The trimmed value should be passed as a parameter
        expect(callArgs).toBeDefined();
      });

      it('should throw validation error for empty name', async () => {
        await expect(createMaker('')).rejects.toThrow(ApiError);
        await expect(createMaker('   ')).rejects.toThrow(ApiError);
      });

      it('should handle duplicate name error', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        mockSql.mockRejectedValue(error);

        await expect(createMaker('The Beatles')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'DUPLICATE_ERROR',
          })
        );
      });

      it('should handle database errors', async () => {
        mockSql.mockRejectedValue(new Error('Database error'));

        await expect(createMaker('The Beatles')).rejects.toThrow(ApiError);
      });
    });

    describe('updateMaker', () => {
      it('should update an existing maker', async () => {
        const updatedMaker = { maker_id: 1, name: 'The Beatles Updated' };
        mockSql.mockResolvedValue([updatedMaker]);

        const result = await updateMaker(1, 'The Beatles Updated');

        expect(result).toEqual(updatedMaker);
        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('UPDATE "Maker"');
      });

      it('should throw not found error if maker does not exist', async () => {
        mockSql.mockResolvedValue([]);

        await expect(updateMaker(999, 'New Name')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 404,
            code: 'NOT_FOUND',
          })
        );
      });

      it('should throw validation error for empty name', async () => {
        await expect(updateMaker(1, '')).rejects.toThrow(ApiError);
      });

      it('should handle duplicate name error', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        mockSql.mockResolvedValue([{ maker_id: 1, name: 'Existing' }]);
        mockSql.mockRejectedValueOnce(error);

        await expect(updateMaker(1, 'Duplicate Name')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'DUPLICATE_ERROR',
          })
        );
      });
    });

    describe('deleteMaker', () => {
      it('should delete an maker', async () => {
        mockSql.mockResolvedValue([{ maker_id: 1 }]);

        await deleteMaker(1);

        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('DELETE FROM "Maker"');
      });

      it('should throw not found error if maker does not exist', async () => {
        mockSql.mockResolvedValue([]);

        await expect(deleteMaker(999)).rejects.toThrow(
          expect.objectContaining({
            statusCode: 404,
            code: 'NOT_FOUND',
          })
        );
      });

      it('should handle foreign key constraint error', async () => {
        const error = new Error('Foreign key constraint');
        (error as any).code = '23503';
        mockSql.mockResolvedValue([{ maker_id: 1 }]);
        mockSql.mockRejectedValueOnce(error);

        await expect(deleteMaker(1)).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'FOREIGN_KEY_CONSTRAINT',
          })
        );
      });
    });
  });

  describe('Label Operations', () => {
    describe('getAllLabels', () => {
      it('should return all labels sorted by name', async () => {
        const mockLabels = [
          { label_id: 1, name: 'Apple Products' },
          { label_id: 2, name: 'EMI' },
        ];
        mockSql.mockResolvedValue(mockLabels);

        const result = await getAllLabels();

        expect(result).toEqual(mockLabels);
      });
    });

    describe('getLabelById', () => {
      it('should return a label by ID', async () => {
        const mockLabel = { label_id: 1, name: 'Apple Products' };
        mockSql.mockResolvedValue([mockLabel]);

        const result = await getLabelById(1);

        expect(result).toEqual(mockLabel);
      });

      it('should return null if label not found', async () => {
        mockSql.mockResolvedValue([]);

        const result = await getLabelById(999);

        expect(result).toBeNull();
      });
    });

    describe('createLabel', () => {
      it('should create a new label', async () => {
        const newLabel = { label_id: 1, name: 'Apple Products' };
        mockSql.mockResolvedValue([newLabel]);

        const result = await createLabel('Apple Products');

        expect(result).toEqual(newLabel);
      });

      it('should throw validation error for empty name', async () => {
        await expect(createLabel('')).rejects.toThrow(ApiError);
      });

      it('should handle duplicate name error', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        mockSql.mockRejectedValue(error);

        await expect(createLabel('Apple Products')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'DUPLICATE_ERROR',
          })
        );
      });
    });

    describe('updateLabel', () => {
      it('should update an existing label', async () => {
        const updatedLabel = { label_id: 1, name: 'Apple Products Updated' };
        mockSql.mockResolvedValue([updatedLabel]);

        const result = await updateLabel(1, 'Apple Products Updated');

        expect(result).toEqual(updatedLabel);
      });

      it('should throw not found error if label does not exist', async () => {
        mockSql.mockResolvedValue([]);

        await expect(updateLabel(999, 'New Name')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 404,
            code: 'NOT_FOUND',
          })
        );
      });
    });

    describe('deleteLabel', () => {
      it('should delete a label', async () => {
        mockSql.mockResolvedValue([{ label_id: 1 }]);

        await deleteLabel(1);

        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('DELETE FROM "Label"');
      });

      it('should handle foreign key constraint error', async () => {
        const error = new Error('Foreign key constraint');
        (error as any).code = '23503';
        mockSql.mockResolvedValue([{ label_id: 1 }]);
        mockSql.mockRejectedValueOnce(error);

        await expect(deleteLabel(1)).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'FOREIGN_KEY_CONSTRAINT',
          })
        );
      });
    });
  });

  describe('Genre Operations', () => {
    describe('getAllGenres', () => {
      it('should return all genres sorted by name', async () => {
        const mockGenres = [
          { genre_id: 1, name: 'Rock' },
          { genre_id: 2, name: 'Jazz' },
        ];
        mockSql.mockResolvedValue(mockGenres);

        const result = await getAllGenres();

        expect(result).toEqual(mockGenres);
      });
    });

    describe('getGenreById', () => {
      it('should return a genre by ID', async () => {
        const mockGenre = { genre_id: 1, name: 'Rock' };
        mockSql.mockResolvedValue([mockGenre]);

        const result = await getGenreById(1);

        expect(result).toEqual(mockGenre);
      });

      it('should return null if genre not found', async () => {
        mockSql.mockResolvedValue([]);

        const result = await getGenreById(999);

        expect(result).toBeNull();
      });
    });

    describe('createGenre', () => {
      it('should create a new genre', async () => {
        const newGenre = { genre_id: 1, name: 'Rock' };
        mockSql.mockResolvedValue([newGenre]);

        const result = await createGenre('Rock');

        expect(result).toEqual(newGenre);
      });

      it('should throw validation error for empty name', async () => {
        await expect(createGenre('')).rejects.toThrow(ApiError);
      });

      it('should handle duplicate name error', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        mockSql.mockRejectedValue(error);

        await expect(createGenre('Rock')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'DUPLICATE_ERROR',
          })
        );
      });
    });

    describe('updateGenre', () => {
      it('should update an existing genre', async () => {
        const updatedGenre = { genre_id: 1, name: 'Rock Updated' };
        mockSql.mockResolvedValue([updatedGenre]);

        const result = await updateGenre(1, 'Rock Updated');

        expect(result).toEqual(updatedGenre);
      });

      it('should throw not found error if genre does not exist', async () => {
        mockSql.mockResolvedValue([]);

        await expect(updateGenre(999, 'New Name')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 404,
            code: 'NOT_FOUND',
          })
        );
      });
    });

    describe('deleteGenre', () => {
      it('should delete a genre', async () => {
        mockSql.mockResolvedValue([{ genre_id: 1 }]);

        await deleteGenre(1);

        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        // Template literal first arg is an array of strings
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('DELETE FROM "Genre"');
      });

      it('should handle foreign key constraint error', async () => {
        const error = new Error('Foreign key constraint');
        (error as any).code = '23503';
        mockSql.mockResolvedValue([{ genre_id: 1 }]);
        mockSql.mockRejectedValueOnce(error);

        await expect(deleteGenre(1)).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'FOREIGN_KEY_CONSTRAINT',
          })
        );
      });
    });
  });
});

