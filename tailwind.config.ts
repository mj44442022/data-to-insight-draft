import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium color palette
        navy: {
          50: '#E8EBF0',
          100: '#C2C9D6',
          200: '#9BA7BD',
          300: '#7485A3',
          400: '#4D638A',
          500: '#264170',
          600: '#1F3459',
          700: '#182742',
          800: '#111A2C',
          900: '#0A1628', // Deep navy background
        },
        gold: {
          50: '#FAF6F0',
          100: '#F2E8D9',
          200: '#EAD9C1',
          300: '#E2CBAA',
          400: '#DABC92',
          500: '#D4A574', // Warm gold/champagne accent
          600: '#C18D55',
          700: '#A67545',
          800: '#8B5D36',
          900: '#704527',
        },
        amber: {
          DEFAULT: '#FF8C42', // Deep amber secondary
        },
        blue: {
          refined: '#4A90E2', // Refined blue accent
        },
        cream: '#F8F6F3', // Off-white for text
        charcoal: '#1A1D29',
        purple: {
          deep: '#2D1B4E',
        },
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0A1628 0%, #2D1B4E 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A574 0%, #FF8C42 100%)',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
