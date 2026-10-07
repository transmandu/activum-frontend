/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebarBg: '#0f172a',
        primaryBlue: '#2563eb',
        bodyBg: '#f8fafc',
      }
    },
  },
  plugins: [],
}