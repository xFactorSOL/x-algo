/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'x-black': '#000000',
        'x-dark': '#0f0f0f',
        'x-gray': {
          100: '#e7e9ea',
          200: '#d6d9db',
          300: '#b5b8ba',
          400: '#71767b',
          500: '#536471',
          600: '#333639',
          700: '#202327',
          800: '#17181c',
          900: '#0f1012',
        },
        'x-blue': '#1d9bf0',
        'x-blue-hover': '#1a8cd8',
        'x-green': '#00ba7c',
        'x-yellow': '#ffd400',
        'x-orange': '#ff7a00',
        'x-red': '#f4212e',
        'x-purple': '#7856ff',
      },
      fontFamily: {
        'sans': ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'score-fill': 'scoreFill 1s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
