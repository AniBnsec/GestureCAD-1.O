/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aerospace: {
          deep: '#07111F',
          dark: '#080D17',
          blue: '#10233B',
          electric: '#1677FF',
          neon: '#00C8FF',
          cyan: '#39D5FF',
          red: '#F04444',
          lightBg: '#F3F7FC',
          blueprint: '#DCE5F0',
          card: 'rgba(16, 35, 59, 0.75)',
          border: 'rgba(0, 200, 255, 0.25)',
          glow: 'rgba(0, 200, 255, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'hologram': '0 0 25px rgba(0, 200, 255, 0.35)',
        'hologram-lg': '0 0 45px rgba(0, 200, 255, 0.5)',
        'hologram-red': '0 0 25px rgba(240, 68, 68, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'blueprint-grid': 'radial-gradient(circle, rgba(0,200,255,0.15) 1px, transparent 1px)',
        'blueprint-light-grid': 'linear-gradient(to right, #DCE5F0 1px, transparent 1px), linear-gradient(to bottom, #DCE5F0 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}

