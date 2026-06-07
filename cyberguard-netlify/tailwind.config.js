/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Exo 2"', 'sans-serif'],
        display: ['"Orbitron"', 'sans-serif'],
      },
      colors: {
        brand: {
          cyan:    '#38bdf8',
          indigo:  '#6366f1',
          violet:  '#8b5cf6',
          emerald: '#10b981',
          red:     '#ef4444',
          orange:  '#f97316',
          amber:   '#eab308',
          blue:    '#3b82f6',
        },
        bg: {
          base:  '#060d1f',
          panel: 'rgba(10,18,40,0.72)',
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glow:       '0 0 30px rgba(56,189,248,0.30)',
        'glow-lg':  '0 0 60px rgba(56,189,248,0.45)',
        panel:      '0 8px 40px -10px rgba(0,0,0,0.55)',
      },
      animation: {
        'spin-slow':    'spin 8s linear infinite',
        'pulse-glow':   'pulseGlow 3s ease-in-out infinite',
        'matrix-drop':  'matrixDrop 4s linear infinite',
        'slide-up':     'slideUp 0.45s cubic-bezier(.22,.68,0,1.2) both',
        'fade-in':      'fadeIn 0.35s ease both',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 30px rgba(56,189,248,0.30)' },
          '50%':     { boxShadow: '0 0 55px rgba(56,189,248,0.55)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(28px) scale(0.97)' },
          to:   { opacity: '1', transform: 'none' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
