/**
 * Design tokens for Spiral Groove Records
 * Centralized design system values
 */

export const colors = {
  'primary-black': '#111111',
  'primary-cream': '#FFFFFF',
  'accent-teal': '#63dbdf',
  'accent-amber': '#bd132b',
  'highlight-red': '#bd132b',
  'text-dark': '#111111',
  'text-light': '#FFFFFF',
  'neutral-gray': '#7A7A7A'
} as const;

export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '64px',
  xxl: '96px'
} as const;

export const shadows = {
  card: '0 4px 12px rgba(0,0,0,0.15)',
  modal: '0 8px 20px rgba(0,0,0,0.25)',
  button: '0 2px 4px rgba(0,0,0,0.1)',
  cardHover: '0 8px 24px rgba(0,0,0,0.2)'
} as const;

export const borders = {
  radiusSmall: '6px',
  radiusMedium: '8px',
  radiusLarge: '12px',
  radiusFull: '9999px'
} as const;

export const animations = {
  buttonHover: '150ms ease-out',
  cardHover: '200ms ease-in-out',
  modalFade: '300ms ease-in-out',
  pageTransition: '400ms ease-in-out',
  imageLoad: '200ms ease-out'
} as const;

// Grid system
export const grid = {
  desktop: {
    columns: 12,
    gutter: '24px',
    margin: '80px',
    maxWidth: '1200px'
  },
  tablet: {
    columns: 8,
    gutter: '20px',
    margin: '40px',
    maxWidth: '720px'
  },
  mobile: {
    columns: 4,
    gutter: '16px',
    margin: '24px',
    maxWidth: '100%'
  }
} as const;

// Typography scale
export const fontSizes = {
  h1: { desktop: '54px', mobile: '36px' },
  h2: { desktop: '36px', mobile: '28px' },
  h3: { desktop: '28px', mobile: '22px' },
  h4: { desktop: '20px', mobile: '18px' },
  bodyLarge: { desktop: '18px', mobile: '16px' },
  bodySmall: { desktop: '16px', mobile: '14px' },
  button: { desktop: '16px', mobile: '14px' },
  label: { desktop: '14px', mobile: '13px' }
} as const;

// Export for JSON generation
export const designTokens = {
  colors,
  spacing,
  shadows,
  borders,
  animations,
  grid,
  fontSizes
} as const;
