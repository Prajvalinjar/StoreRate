/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F6F1',
        ink: {
          DEFAULT: '#171A18',
          soft: '#2D322E',
          muted: '#707873',
        },
        forest: {
          DEFAULT: '#173D32',
          light: '#2F6654',
          deep: '#0F2B23',
          soft: '#E7F0EB',
        },
        gold: {
          DEFAULT: '#C9A24A',
          hover: '#B59039',
          light: '#F5E6C8',
          soft: '#FAF3E3',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F0F2ED',
          border: '#E2E5DF',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        display: ['"DM Serif Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
