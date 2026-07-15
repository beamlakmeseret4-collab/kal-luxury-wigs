/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#14100D', 2: '#1F1912', 3: '#2A2219' },
        gold: { DEFAULT: '#AD8544', light: '#E8D4A6', dark: '#8A6A34' },
        cream: '#F8F4EC',
        charcoal: '#241F1A',
        garnet: { DEFAULT: '#6E1F2B', light: '#8C2E3B' },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 8px 30px -8px rgba(173, 133, 68, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        driftSlow: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(6px, -8px) rotate(1deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'drift-slow': 'driftSlow 12s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
