/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#000000',
          secondary: '#070707',
          card: '#0D0D0D',
          surface: '#121212',
        },
        brand: {
          green: '#FFFFFF',
          secondary: '#E4E4E7',
          lime: '#F4F4F5',
          dark: '#000000',
        },
        mech: {
          dark: '#000000',
          surface: '#0A0A0A',
          border: 'rgba(255, 255, 255, 0.12)',
          primary: '#FFFFFF',
          glow: '#E4E4E7',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.12)',
          highlight: 'rgba(255, 255, 255, 0.08)',
        }
      },
      boxShadow: {
        'glow-green': '0 0 20px -3px rgba(255, 255, 255, 0.12)',
        'glow-sm': '0 0 10px -2px rgba(255, 255, 255, 0.10)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.9)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
