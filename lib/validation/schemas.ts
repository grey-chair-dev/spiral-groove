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
