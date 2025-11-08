import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
          colors: {
            'primary-black': '#1a1a1a',
            'primary-cream': '#FFF8E7',
            'accent-orange': '#FF6B35',
            'accent-yellow': '#FFD23F',
            'accent-pink': '#FF6B9D',
            'accent-purple': '#9B59B6',
            'accent-teal': '#00CED1',
            'highlight-orange': '#FF6B35',
            'highlight-pink': '#FF6B9D',
            'text-dark': '#1a1a1a',
            'text-light': '#FFF8E7',
            'neutral-gray': '#8B7D6B',
          },
      backgroundImage: {
        'groovy-sunset': 'linear-gradient(135deg, #FF6B35 0%, #FF6B9D 50%, #9B59B6 100%)',
        'groovy-rainbow': 'linear-gradient(90deg, #FF6B35 0%, #FFD23F 25%, #00CED1 50%, #FF6B9D 75%, #9B59B6 100%)',
        'groovy-waves': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,107,53,0.1) 10px, rgba(255,107,53,0.1) 20px)',
      },
      fontFamily: {
        'display': ['var(--font-display)', 'serif'],
        'body': ['var(--font-body)', 'sans-serif'],
        'accent': ['var(--font-accent)', 'sans-serif'],
        'groovy': ['var(--font-groovy)', 'cursive'],
        'groovy-body': ['var(--font-groovy-body)', 'sans-serif']
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
