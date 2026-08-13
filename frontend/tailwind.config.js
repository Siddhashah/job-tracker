/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        wall: '#F3F1EC',
        cork: '#C89B6B',
        ink: '#2B2420',
        card: '#FBF6EC',
        lead: '#3B5B7A',
        active: '#B87A1E',
        solved: '#3F6B3F',
        cold: '#8B4A42',
        string: '#A63A2E',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"Courier Prime"', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
}