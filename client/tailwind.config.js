/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F5FA',
          100: '#E1EAF5',
          200: '#C3D6EB',
          300: '#95B8DC',
          400: '#6093CA',
          500: '#2563EB',
          600: '#1E3A8A', // Deep University Oxford Navy
          700: '#172554', // Midnight College Blue
          800: '#0F172A',
          900: '#0B132B',
          950: '#060B18',
        },
        beige: {
          50: '#FDFCF9',  // Warm Ivory
          100: '#FBF8F1', // Light Cream Beige
          200: '#F5EFE1', // Soft Sandstone
          300: '#EADFC9', // Beige Border
          400: '#D5C4A1',
          500: '#B8A072',
          600: '#947D52',
          700: '#735F3A',
          800: '#544528',
          900: '#382D18',
        },
        academic: {
          navy: '#0F294A',
          blue: '#1E3A8A',
          gold: '#C59B27',
          amber: '#B45309',
          crimson: '#881337',
          cream: '#FBF9F5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          cream: '#FDFBF7',
          beige: '#FBF8F1',
          muted: '#F5EFE1',
          subtle: '#EAE5D9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
