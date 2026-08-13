/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyoranixRed: '#D32F2F',
        nyoranixBlack: '#121212',
        nyoranixWhite: '#F5F5F7',
      },
    },
  },
  plugins: [],
}