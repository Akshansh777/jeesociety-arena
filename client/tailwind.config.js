/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jee-bg': '#FFFBF7', // The very light, warm off-white from the mockup
        'jee-maroon': '#4A0E17',
        'jee-maroon-dark': '#3A0B12', // For the bottom bar
        'jee-gold': '#D4AF37',
        'jee-brown': '#2C1E16',
        'jee-green': '#22C55E',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #D4AF37, #F3E5AB, #D4AF37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 40px rgba(34, 197, 94, 0.3), inset 0 0 10px rgba(34, 197, 94, 0.2)' },
          '50%': { opacity: .8, boxShadow: '0 0 80px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}