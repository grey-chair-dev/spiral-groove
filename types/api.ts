/**
 * API response types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface EventInquiry {
  name: string;
  email: string;
  phone?: string;
  eventType: 'Live Music' | 'Record Fair' | 'Private Event' | 'Other';
  eventDate: string;
  expectedAttendance: number;
  message: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterSignup {
  email: string;
  interests?: ('New Arrivals' | 'Events' | 'Sales' | 'Blog')[];
}

export interface CheckoutData {
  items: Array<{
    id: string;
    qty: number;
  }>;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}
