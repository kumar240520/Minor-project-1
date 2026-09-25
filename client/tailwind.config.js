/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        display: ['Fredoka', 'Poppins', 'sans-serif'],
        handwritten: ['Caveat', 'Patrick Hand', 'cursive'],
      },
      colors: {
        edunavy: {
          DEFAULT: '#101A63',
          deep: '#101A63',
        },
        edupurple: {
          DEFAULT: '#5B20E8',
          bright: '#7C3AED',
          light: '#F3F2FF',
        },
        edublue: {
          DEFAULT: '#2563EB',
          light: '#EAF4FF',
        },
        educyan: '#22D3EE',
        edugreen: '#10B981',
        eduyellow: '#F59E0B',
        edupink: '#EC4899',
        edumint: '#DDF8EA',
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        }
      }
    },
  },
  plugins: [],
}
