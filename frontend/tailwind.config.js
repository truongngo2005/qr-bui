/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fbf8f5',
          100: '#f6ede3',
          200: '#eddac7',
          300: '#dfc0a3',
          400: '#cfa37e',
          500: '#bd845d',
          600: '#a76d49',
          700: '#8c5539',
          800: '#6d432e',
          900: '#553424',
          950: '#321c13',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e5ece7',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#081c15',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
