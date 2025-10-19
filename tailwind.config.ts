import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
          colors: {
            'primary-black': '#111111',
            'primary-cream': '#FFFFFF',
            'accent-teal': '#63dbdf',
            'accent-amber': '#bd132b',
            'highlight-red': '#bd132b',
            'text-dark': '#111111',
            'text-light': '#FFFFFF',
            'neutral-gray': '#7A7A7A'
          },
      fontFamily: {
        'display': ['var(--font-display)', 'serif'],
        'body': ['var(--font-body)', 'sans-serif'],
        'accent': ['var(--font-accent)', 'sans-serif']
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
        'large': '12px'
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
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
  },
  plugins: [],
};
export default config;
