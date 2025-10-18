/**
 * Application Constants
 * Centralized configuration and constants
 */

export const SITE_CONFIG = {
  name: 'Spiral Groove Records',
  tagline: 'Discover Your Groove',
  description: 'Your premier destination for vinyl records, events, and music community in Milford, OH',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  address: {
    street: '215 Main St',
    city: 'Milford',
    state: 'OH',
    zip: '45150',
    full: '215 Main St, Milford, OH 45150'
  },
  contact: {
    phone: '(513) 555-0123',
    email: 'info@spiralgrooverecords.com',
    hours: {
      monday: '10:00 AM - 8:00 PM',
      tuesday: '10:00 AM - 8:00 PM',
      wednesday: '10:00 AM - 8:00 PM',
      thursday: '10:00 AM - 8:00 PM',
      friday: '10:00 AM - 9:00 PM',
      saturday: '10:00 AM - 9:00 PM',
      sunday: '12:00 PM - 6:00 PM'
    }
  },
  social: {
    instagram: 'https://instagram.com/spiralgrooverecords',
    facebook: 'https://facebook.com/spiralgrooverecords',
    tiktok: 'https://tiktok.com/@spiralgrooverecords'
  }
} as const;

export const NAVIGATION = {
  main: [
    { name: 'Shop', href: '/shop' },
    { name: 'Event Space', href: '/event-space' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ],
  footer: [
    { name: 'Shop', href: '/shop' },
    { name: 'Event Space', href: '/event-space' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Partners', href: '/partners' },
    { name: 'Promotions', href: '/promotions' }
  ]
} as const;

export const PRODUCT_FILTERS = {
  genres: [
    'Rock',
    'Jazz',
    'Blues',
    'Country',
    'Folk',
    'Classical',
    'Electronic',
    'Hip-Hop',
    'R&B',
    'Soul',
    'Funk',
    'Reggae',
    'Punk',
    'Alternative',
    'Indie',
    'Pop'
  ],
  conditions: [
    { value: 'M', label: 'Mint (M)' },
    { value: 'NM', label: 'Near Mint (NM)' },
    { value: 'VG+', label: 'Very Good Plus (VG+)' },
    { value: 'VG', label: 'Very Good (VG)' },
    { value: 'G+', label: 'Good Plus (G+)' },
    { value: 'G', label: 'Good (G)' }
  ],
  decades: [
    '1950s',
    '1960s',
    '1970s',
    '1980s',
    '1990s',
    '2000s',
    '2010s',
    '2020s'
  ],
  formats: [
    { value: 'LP', label: 'LP (12")' },
    { value: 'EP', label: 'EP' },
    { value: 'Single', label: 'Single' },
    { value: '7"', label: '7"' },
    { value: '12"', label: '12"' }
  ],
  priceRanges: [
    { min: 0, max: 1000, label: 'Under $10' },
    { min: 1000, max: 2000, label: '$10 - $20' },
    { min: 2000, max: 3000, label: '$20 - $30' },
    { min: 3000, max: 5000, label: '$30 - $50' },
    { min: 5000, max: null, label: 'Over $50' }
  ]
} as const;

export const BLOG_CATEGORIES = {
  'vinyl-101': 'Vinyl 101',
  'staff-picks': 'Staff Picks',
  'local-music': 'Local Music',
  'events': 'Events',
  'news': 'News'
} as const;

export const EVENT_TYPES = {
  concert: 'Concert',
  'listening-party': 'Listening Party',
  workshop: 'Workshop',
  meetup: 'Meetup'
} as const;

export const SEO_DEFAULTS = {
  title: 'Spiral Groove Records | Vinyl Records in Milford, OH',
  description: 'Discover your groove at Spiral Groove Records - your premier destination for vinyl records, events, and music community in Milford, OH.',
  keywords: [
    'vinyl records',
    'milford ohio',
    'cincinnati record stores',
    'buy vinyl online',
    'used vinyl records',
    'new vinyl releases',
    'record store events',
    'turntables',
    'audio equipment',
    'music community'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Spiral Groove Records'
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@spiralgrooverecords'
  }
} as const;

export const PAGINATION = {
  defaultPageSize: 24,
  maxPageSize: 100,
  pageSizeOptions: [12, 24, 48, 96]
} as const;

export const CACHE_DURATIONS = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  veryLong: 86400 // 24 hours
} as const;

export const FORM_VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number'
  },
  required: {
    message: 'This field is required'
  },
  minLength: {
    message: 'Must be at least {min} characters'
  },
  maxLength: {
    message: 'Must be no more than {max} characters'
  }
} as const;

export const ANALYTICS = {
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
  googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID || '',
  hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || ''
} as const;

export const EXTERNAL_SERVICES = {
  square: {
    applicationId: process.env.SQUARE_APPLICATION_ID || '',
    accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
    environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
  },
  mailchimp: {
    apiKey: process.env.MAILCHIMP_API_KEY || '',
    listId: process.env.MAILCHIMP_LIST_ID || '',
    serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX || ''
  },
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID || '',
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_TOKEN || ''
  }
} as const;
