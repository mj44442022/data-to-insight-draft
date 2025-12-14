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
        // Warm Tech Sophistication palette
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
        plum: {
          DEFAULT: '#2D1B4E', // Rich plum for gradient
          light: '#4A2B6E',
          dark: '#1F1338',
        },
        gold: {
          50: '#FAF6F0',
          100: '#F2E8D9',
          200: '#EAD9C1',
          300: '#E2CBAA',
          400: '#DABC92',
          500: '#D4A574', // Warm champagne gold (primary accent)
          600: '#C18D55',
          700: '#A67545',
          800: '#8B5D36',
          900: '#704527',
        },
        coral: {
          50: '#FFF4F0',
          100: '#FFE5DB',
          200: '#FFD1C1',
          300: '#FFBDA7',
          400: '#FFA98D',
          500: '#FF9B7A', // Soft coral/peach (secondary accent)
          600: '#FF8761',
          700: '#FF7347',
          800: '#FF5F2D',
          900: '#E54515',
        },
        sage: {
          50: '#F2F6F4',
          100: '#E0EBE5',
          200: '#CDE0D6',
          300: '#BBD5C7',
          400: '#A9CAB8',
          500: '#9DB4A8', // Muted sage green (tertiary/trust)
          600: '#88A093',
          700: '#738C7E',
          800: '#5E7869',
          900: '#496454',
        },
        cream: '#F8F6F3', // Off-white for text
        charcoal: '#1A1D29',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0A1628 0%, #2D1B4E 100%)', // Navy to plum
        'gradient-warm': 'linear-gradient(135deg, #D4A574 0%, #FF9B7A 100%)', // Gold to coral
        'gradient-hero': 'linear-gradient(135deg, #D4A574 0%, #FF9B7A 50%, #9DB4A8 100%)', // Gold to coral to sage
        'gradient-mesh': 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.2) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.15) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.2) 0px, transparent 50%)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'], // Editorial headlines
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 165, 116, 0.4), 0 0 40px rgba(212, 165, 116, 0.2)',
        'glow-coral': '0 0 20px rgba(255, 155, 122, 0.4), 0 0 40px rgba(255, 155, 122, 0.2)',
        'glow-warm': '0 0 30px rgba(212, 165, 116, 0.3), 0 0 60px rgba(255, 155, 122, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
