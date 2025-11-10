import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
          colors: {
            // Brand Palette (from Facebook page)
            'primary-orange': '#E96B3A',      // Vintage Orange
            'secondary-yellow': '#CBAE88',    // Warm Vinyl Tan
            'accent-blue': '#3AA6A3',         // Cyan Accent
            'supporting-red': '#E96B3A',      // Using Vintage Orange for consistency
            'background-cream': '#F5EBDD',    // Muted Cream
            'contrast-navy': '#1C1C1C',       // Deep Groove Black
            // Photo-based colors
            'mustard': '#d6a34f',             // Mustard yellow (sofa)
            'teal': '#00B3A4',                // Teal/blue (album covers)
            'warm-red': '#C85A4F',            // Warm red
            // Legacy colors (for compatibility)
            'primary-black': '#1C1C1C',
            'primary-cream': '#F5EBDD',
            'accent-teal': '#00B3A4',
            'accent-amber': '#d6a34f',
            'highlight-red': '#C85A4F',
            'text-dark': '#1C1C1C',
            'text-light': '#F5EBDD',
            'neutral-gray': '#9B9B9B'         // Soft Gray
          },
      fontFamily: {
        'display': ['var(--font-display)', 'serif'],
        'body': ['var(--font-body)', 'sans-serif'],
        'accent': ['var(--font-accent)', 'sans-serif'],
        'groovy': ['var(--font-groovy)', 'display']
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '64px',
        'xxl': '96px'
      },
      borderRadius: {
        'small': '6px',
        'medium': '8px',
        'large': '12px',
        'xl': '20px',
        '2xl': '30px',
        'full': '9999px'
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.15)',
        'modal': '0 8px 20px rgba(0,0,0,0.25)',
        'button': '0 2px 4px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.2)'
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms'
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      animation: {
        'bob': 'bob 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'wink': 'wink 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite'
      },
      keyframes: {
        'bob': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(5deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-5deg)' }
        },
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' }
        },
        'wink': {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' }
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      }
    },
  },
  plugins: [],
};
export default config;
