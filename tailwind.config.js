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
        'neon-orange': '0 0 10px rgba(0, 194, 203, 0.5), 0 0 20px rgba(0, 194, 203, 0.3), 0 0 30px rgba(0, 194, 203, 0.2)',
        'neon-orange-strong': '0 0 15px rgba(0, 194, 203, 0.8), 0 0 30px rgba(0, 194, 203, 0.6), 0 0 45px rgba(0, 194, 203, 0.4)',
        'neon-orange-ultra': '0 0 18px rgba(0, 194, 203, 0.95), 0 0 40px rgba(0, 194, 203, 0.75), 0 0 70px rgba(0, 194, 203, 0.55)',
        'neon-teal': '0 0 10px rgba(58, 183, 149, 0.5), 0 0 20px rgba(58, 183, 149, 0.3), 0 0 30px rgba(58, 183, 149, 0.2)',
        'neon-teal-strong': '0 0 15px rgba(58, 183, 149, 0.85), 0 0 30px rgba(58, 183, 149, 0.6), 0 0 55px rgba(58, 183, 149, 0.4)',
        'neon-pink': '0 0 10px rgba(255, 46, 99, 0.5), 0 0 20px rgba(255, 46, 99, 0.3), 0 0 30px rgba(255, 46, 99, 0.2)',
        'neon-pink-strong': '0 0 15px rgba(255, 46, 99, 0.85), 0 0 30px rgba(255, 46, 99, 0.6), 0 0 55px rgba(255, 46, 99, 0.4)',
      },
      textShadow: {
        'neon-orange': '0 0 10px rgba(0, 194, 203, 0.8), 0 0 20px rgba(0, 194, 203, 0.6), 0 0 30px rgba(0, 194, 203, 0.4)',
        'neon-teal': '0 0 10px rgba(58, 183, 149, 0.8), 0 0 20px rgba(58, 183, 149, 0.6), 0 0 30px rgba(58, 183, 149, 0.4)',
        'neon-pink': '0 0 10px rgba(255, 46, 99, 0.8), 0 0 20px rgba(255, 46, 99, 0.6), 0 0 30px rgba(255, 46, 99, 0.4)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 3.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '6%': { opacity: '0.92', filter: 'brightness(1.15)' },
          '8%': { opacity: '1', filter: 'brightness(1.25)' },
          '10%': { opacity: '0.88', filter: 'brightness(1.05)' },
          '12%': { opacity: '1', filter: 'brightness(1.3)' },
          '70%': { opacity: '0.95', filter: 'brightness(1.1)' },
          '72%': { opacity: '1', filter: 'brightness(1.25)' },
        },
      },
    },
  },
  plugins: [],
}

