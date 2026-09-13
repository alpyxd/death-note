/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gothic: ['"UnifrakturMaguntia"', '"Pirata One"', 'serif'],
        oldEnglish: ['"UnifrakturCook"', '"UnifrakturMaguntia"', 'serif'],
        cinzel: ['"Cinzel Decorative"', 'serif'],
        handwriting: ['"Rock Salt"', '"Caveat"', 'cursive'],
        messyHand: ['"Covered By Your Grace"', '"Caveat"', 'cursive'],
        pen: ['"Reenie Beanie"', 'cursive'],
        japanese: ['"Yuji Boku"', '"Kaisei Decol"', 'serif'],
        typewriter: ['"Courier New"', 'monospace'],
      },
      colors: {
        death: {
          black: '#0a0a0a',
          leather: '#141312',
          page: '#f4ede1',
          pageDark: '#e3d6c1',
          ruleLine: '#a6b1c2',
          redMargin: '#b83b3b',
          blood: '#880808',
          bloodGlow: '#ff1111',
          shinigamiEye: '#ff1e1e',
        }
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.8' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        inkBleed: {
          '0%': { transform: 'scale(0.98)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        pulseRed: 'pulseRed 1.5s ease-in-out infinite',
        flicker: 'flicker 0.2s ease-in-out 3',
        inkBleed: 'inkBleed 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
