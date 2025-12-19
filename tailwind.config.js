/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#231F20',   // Vector Outline Black
          cream: '#FFF9F0',   // Warm Background
          orange: '#00C2CB',  // Neon Cyan
          mustard: '#F9D776', // Vintage Yellow
          pink: '#FF99C8',    // Bubblegum Pink
          teal: '#3AB795',    // Globe Teal
          red: '#FF2E63',     // Neon Pink
          blue: '#3A86FF',    // Sky Blue
        },
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
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

