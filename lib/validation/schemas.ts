import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

export const catalogFilterSchema = z.object({
  genre: z.string().optional(),
  condition: z.enum(['New', 'Used - Excellent', 'Used - Very Good', 'Used - Good', 'Used - Fair']).optional(),
  format: z.enum(['LP', 'EP', 'Single', 'CD', 'Cassette']).optional(),
  decade: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  search: z.string().optional(),
});

export const productSortSchema = z.object({
  field: z.enum(['title', 'maker', 'price', 'year', 'createdAt']),
  direction: z.enum(['asc', 'desc']),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    qty: z.number().min(1),
  })),
  customerInfo: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2).max(2),
    zip: z.string().min(5).max(10),
    country: z.string().default('US'),
  }),
});

export const eventInquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  eventType: z.enum(['Live Music', 'Product Fair', 'Private Event', 'Other']),
  eventDate: z.string().min(1),
  expectedAttendance: z.number().min(1).max(500),
  message: z.string().min(10).max(1000),
});

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(1000),
});

export const newsletterSignupSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  interests: z.array(z.enum(['New Arrivals', 'Events', 'Sales', 'Blog'])).optional(),
});

// Type exports
export type CatalogFilter = z.infer<typeof catalogFilterSchema>;
export type ProductSort = z.infer<typeof productSortSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type CheckoutData = z.infer<typeof checkoutSchema>;
export type EventInquiryData = z.infer<typeof eventInquirySchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterSignupData = z.infer<typeof newsletterSignupSchema>;
