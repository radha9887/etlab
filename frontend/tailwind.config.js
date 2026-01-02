/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas': '#1a1a2e',
        'panel': '#16213e',
        'panel-light': '#1f2b47',
        'accent': '#4f46e5',
        'accent-hover': '#6366f1',
      }
    },
  },
  plugins: [],
}
