/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        card: 'var(--card)',
        brand: {
          pink: 'var(--brand-pink)',
          yellow: 'var(--brand-yellow)',
          green: 'var(--brand-green)',
          blue: 'var(--brand-blue)',
          magenta: 'var(--brand-magenta)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      }
    },
  },
  plugins: [],
}
