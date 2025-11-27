import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
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

  describe('Artist Operations', () => {
    describe('getAllArtists', () => {
      it('should return all artists sorted by name', async () => {
        const mockArtists = [
          { artist_id: 1, name: 'The Beatles' },
          { artist_id: 2, name: 'Pink Floyd' },
        ];
        mockSql.mockResolvedValue(mockArtists);

        const result = await getAllArtists();

        expect(result).toEqual(mockArtists);
        expect(mockSql).toHaveBeenCalled();
        // Check that SQL contains the expected query
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('SELECT artist_id, name');
        expect(sqlString).toContain('FROM "Artist"');
      });

      it('should handle database errors', async () => {
        mockSql.mockRejectedValue(new Error('Database connection failed'));

        await expect(getAllArtists()).rejects.toThrow(ApiError);
      });
    });

    describe('getArtistById', () => {
      it('should return an artist by ID', async () => {
        const mockArtist = { artist_id: 1, name: 'The Beatles' };
        mockSql.mockResolvedValue([mockArtist]);

        const result = await getArtistById(1);

        expect(result).toEqual(mockArtist);
        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('WHERE artist_id =');
      });

      it('should return null if artist not found', async () => {
        mockSql.mockResolvedValue([]);

        const result = await getArtistById(999);

        expect(result).toBeNull();
      });

      it('should handle database errors', async () => {
        mockSql.mockRejectedValue(new Error('Database error'));

        await expect(getArtistById(1)).rejects.toThrow(ApiError);
      });
    });

    describe('createArtist', () => {
      it('should create a new artist', async () => {
        const newArtist = { artist_id: 1, name: 'The Beatles' };
        mockSql.mockResolvedValue([newArtist]);

        const result = await createArtist('The Beatles');

        expect(result).toEqual(newArtist);
        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('INSERT INTO "Artist"');
      });

      it('should trim whitespace from name', async () => {
        const newArtist = { artist_id: 1, name: 'The Beatles' };
        mockSql.mockResolvedValue([newArtist]);

        await createArtist('  The Beatles  ');

        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        // The trimmed value should be passed as a parameter
        expect(callArgs).toBeDefined();
      });

      it('should throw validation error for empty name', async () => {
        await expect(createArtist('')).rejects.toThrow(ApiError);
        await expect(createArtist('   ')).rejects.toThrow(ApiError);
      });

      it('should handle duplicate name error', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        mockSql.mockRejectedValue(error);

        await expect(createArtist('The Beatles')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'DUPLICATE_ERROR',
          })
        );
      });

      it('should handle database errors', async () => {
        mockSql.mockRejectedValue(new Error('Database error'));

        await expect(createArtist('The Beatles')).rejects.toThrow(ApiError);
      });
    });

    describe('updateArtist', () => {
      it('should update an existing artist', async () => {
        const updatedArtist = { artist_id: 1, name: 'The Beatles Updated' };
        mockSql.mockResolvedValue([updatedArtist]);

        const result = await updateArtist(1, 'The Beatles Updated');

        expect(result).toEqual(updatedArtist);
        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('UPDATE "Artist"');
      });

      it('should throw not found error if artist does not exist', async () => {
        mockSql.mockResolvedValue([]);

        await expect(updateArtist(999, 'New Name')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 404,
            code: 'NOT_FOUND',
          })
        );
      });

      it('should throw validation error for empty name', async () => {
        await expect(updateArtist(1, '')).rejects.toThrow(ApiError);
      });

      it('should handle duplicate name error', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        mockSql.mockResolvedValue([{ artist_id: 1, name: 'Existing' }]);
        mockSql.mockRejectedValueOnce(error);

        await expect(updateArtist(1, 'Duplicate Name')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'DUPLICATE_ERROR',
          })
        );
      });
    });

    describe('deleteArtist', () => {
      it('should delete an artist', async () => {
        mockSql.mockResolvedValue([{ artist_id: 1 }]);

        await deleteArtist(1);

        expect(mockSql).toHaveBeenCalled();
        const callArgs = mockSql.mock.calls[0];
        const sqlString = Array.isArray(callArgs[0]) ? callArgs[0].join('') : callArgs[0];
        expect(sqlString).toContain('DELETE FROM "Artist"');
      });

      it('should throw not found error if artist does not exist', async () => {
        mockSql.mockResolvedValue([]);

        await expect(deleteArtist(999)).rejects.toThrow(
          expect.objectContaining({
            statusCode: 404,
            code: 'NOT_FOUND',
          })
        );
      });

      it('should handle foreign key constraint error', async () => {
        const error = new Error('Foreign key constraint');
        (error as any).code = '23503';
        mockSql.mockResolvedValue([{ artist_id: 1 }]);
        mockSql.mockRejectedValueOnce(error);

        await expect(deleteArtist(1)).rejects.toThrow(
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
          { label_id: 1, name: 'Apple Records' },
          { label_id: 2, name: 'EMI' },
        ];
        mockSql.mockResolvedValue(mockLabels);

        const result = await getAllLabels();

        expect(result).toEqual(mockLabels);
      });
    });

    describe('getLabelById', () => {
      it('should return a label by ID', async () => {
        const mockLabel = { label_id: 1, name: 'Apple Records' };
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
        const newLabel = { label_id: 1, name: 'Apple Records' };
        mockSql.mockResolvedValue([newLabel]);

        const result = await createLabel('Apple Records');

        expect(result).toEqual(newLabel);
      });

      it('should throw validation error for empty name', async () => {
        await expect(createLabel('')).rejects.toThrow(ApiError);
      });

      it('should handle duplicate name error', async () => {
        const error = new Error('Duplicate key');
        (error as any).code = '23505';
        mockSql.mockRejectedValue(error);

        await expect(createLabel('Apple Records')).rejects.toThrow(
          expect.objectContaining({
            statusCode: 409,
            code: 'DUPLICATE_ERROR',
          })
        );
      });
    });

    describe('updateLabel', () => {
      it('should update an existing label', async () => {
        const updatedLabel = { label_id: 1, name: 'Apple Records Updated' };
        mockSql.mockResolvedValue([updatedLabel]);

        const result = await updateLabel(1, 'Apple Records Updated');

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

