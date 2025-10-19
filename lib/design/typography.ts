/**
 * Typography system for Spiral Groove Records
 * Implements the design system with proper font hierarchy
 */

export const typography = {
  // Display fonts (Playfair Display)
  h1: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'bold',
    fontSize: { desktop: '54px', mobile: '36px' },
    lineHeight: '120%',
    usage: 'Page headlines, hero sections'
  },
  h2: {
    fontFamily: 'var(--font-display)',
    fontWeight: '600', // Semi-bold
    fontSize: { desktop: '36px', mobile: '28px' },
    lineHeight: '130%',
    usage: 'Section titles'
  },
  h3: {
    fontFamily: 'var(--font-display)',
    fontWeight: '400', // Regular
    fontSize: { desktop: '28px', mobile: '22px' },
    lineHeight: '135%',
    usage: 'Subheadings'
  },
  h4: {
    fontFamily: 'var(--font-accent)',
    fontWeight: '600', // Semi-bold
    fontSize: { desktop: '20px', mobile: '18px' },
    lineHeight: '140%',
    usage: 'CTAs and form headers'
  },
  
  // Body fonts (Inter)
  bodyLarge: {
    fontFamily: 'var(--font-body)',
    fontWeight: '400', // Regular
    fontSize: { desktop: '18px', mobile: '16px' },
    lineHeight: '160%',
    usage: 'Main content'
  },
  bodySmall: {
    fontFamily: 'var(--font-body)',
    fontWeight: '500', // Medium
    fontSize: { desktop: '16px', mobile: '14px' },
    lineHeight: '165%',
    usage: 'Secondary text'
  },
  
  // Accent fonts (Poppins)
  button: {
    fontFamily: 'var(--font-accent)',
    fontWeight: 'bold',
    fontSize: { desktop: '16px', mobile: '14px' },
    lineHeight: '150%',
    textTransform: 'uppercase',
    usage: 'All clickable CTAs'
  },
  label: {
    fontFamily: 'var(--font-body)',
    fontWeight: '400', // Regular
    fontSize: { desktop: '14px', mobile: '13px' },
    lineHeight: '150%',
    usage: 'Form fields and small annotations'
  }
} as const;

// CSS classes for Tailwind
export const typographyClasses = {
  h1: 'font-display font-bold text-[54px] md:text-[54px] text-[36px] leading-[120%]',
  h2: 'font-display font-semibold text-[36px] md:text-[36px] text-[28px] leading-[130%]',
  h3: 'font-display font-normal text-[28px] md:text-[28px] text-[22px] leading-[135%]',
  h4: 'font-accent font-semibold text-[20px] md:text-[20px] text-[18px] leading-[140%]',
  bodyLarge: 'font-body font-normal text-[18px] md:text-[18px] text-[16px] leading-[160%]',
  bodySmall: 'font-body font-medium text-[16px] md:text-[16px] text-[14px] leading-[165%]',
  button: 'font-accent font-bold text-[16px] md:text-[16px] text-[14px] leading-[150%] uppercase',
  label: 'font-body font-normal text-[14px] md:text-[14px] text-[13px] leading-[150%]'
} as const;

export type TypographyVariant = keyof typeof typography;
