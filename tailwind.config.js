/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./scripts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          dark: '#0056b3',
        },
        secondary: '#5856D6', // iOS purple
        success: '#34C759', // iOS green
        warning: '#FF9500', // iOS orange
        error: '#FF3B30', // iOS red
        background: '#F2F2F7', // iOS system background
        card: '#FFFFFF', // iOS card background
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'ios': '0.75rem',
        'ios-lg': '1rem',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 