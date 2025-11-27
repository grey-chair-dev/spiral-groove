import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

export const newsletterSignupSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email(),
});

// Type exports
export type NewsletterSignupData = z.infer<typeof newsletterSignupSchema>;

// ============================================================================
// Lookup Table Schemas (Artist, Label, Genre)
// ============================================================================

export const artistSchema = z.object({
  name: z.string().min(1, 'Artist name is required').max(255, 'Artist name is too long'),
});

export const labelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(255, 'Label name is too long'),
});

export const genreSchema = z.object({
  name: z.string().min(1, 'Genre name is required').max(255, 'Genre name is too long'),
});

export const updateArtistSchema = z.object({
  name: z.string().min(1, 'Artist name is required').max(255, 'Artist name is too long'),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(255, 'Label name is too long'),
});

export const updateGenreSchema = z.object({
  name: z.string().min(1, 'Genre name is required').max(255, 'Genre name is too long'),
});

export type ArtistData = z.infer<typeof artistSchema>;
export type LabelData = z.infer<typeof labelSchema>;
export type GenreData = z.infer<typeof genreSchema>;
export type UpdateArtistData = z.infer<typeof updateArtistSchema>;
export type UpdateLabelData = z.infer<typeof updateLabelSchema>;
export type UpdateGenreData = z.infer<typeof updateGenreSchema>;
