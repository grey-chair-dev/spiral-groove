/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#231F20',
          cream: '#FFF9F0',
          orange: '#00C2CB',
          mustard: '#F9D776',
          pink: '#FF99C8',
          teal: '#3AB795',
          red: '#FF2E63',
          blue: '#3A86FF',
        },
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Shrikhand', 'cursive'],
        header: ['Montserrat', 'sans-serif'],
        hand: ['Gloria Hallelujah', 'cursive'],
      },
      boxShadow: {
        'retro': '4px 4px 0px 0px #231F20',
        'retro-hover': '6px 6px 0px 0px #231F20',
        'retro-sm': '2px 2px 0px 0px #231F20',
        brand: '0 10px 40px rgba(15, 23, 42, 0.60)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
}

