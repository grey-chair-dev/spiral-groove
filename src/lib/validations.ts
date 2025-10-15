/**
 * Zod validation schemas for API requests and responses
 */

import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
const uuidSchema = z.string().uuid('Invalid UUID format');

// User validation schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: phoneSchema.optional(),
});

// Product validation schemas
export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().optional(),
  genre: z.string().optional(),
  condition: z.enum(['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P']).optional(),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative').default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  condition: z.string().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'artist', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: uuidSchema,
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
});

// Order validation schemas
export const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
});

export const createOrderSchema = z.object({
  cartId: uuidSchema,
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().datetime('Invalid date format'),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  price: z.number().positive('Price must be positive').optional(),
  image: z.string().url('Invalid image URL').optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventInquirySchema = z.object({
  eventId: uuidSchema,
  name: z.string().min(1, 'Name is required'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: z.string().optional(),
  attendees: z.number().int().positive('Attendees must be positive').optional(),
});

// Content validation schemas
export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  featuredImage: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});

export const updatePageSchema = createPageSchema.partial();

// Review validation schemas
export const createReviewSchema = z.object({
  productId: uuidSchema,
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  comment: z.string().optional(),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  pages: z.number().int().positive(),
});

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: paginationSchema,
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
  details: z.any().optional(),
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});

// Type exports
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type AddToCartData = z.infer<typeof addToCartSchema>;
export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;
export type Address = z.infer<typeof addressSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
export type CreateEventData = z.infer<typeof createEventSchema>;
export type UpdateEventData = z.infer<typeof updateEventSchema>;
export type EventInquiryData = z.infer<typeof eventInquirySchema>;
export type CreateBlogPostData = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostData = z.infer<typeof updateBlogPostSchema>;
export type CreatePageData = z.infer<typeof createPageSchema>;
export type UpdatePageData = z.infer<typeof updatePageSchema>;
export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type UpdateReviewData = z.infer<typeof updateReviewSchema>;
export type ApiResponse<T = any> = z.infer<typeof apiResponseSchema> & { data?: T };
export type PaginatedResponse<T = any> = z.infer<typeof paginatedResponseSchema> & { data: T[] };
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse<T = any> = z.infer<typeof successResponseSchema> & { data: T };
