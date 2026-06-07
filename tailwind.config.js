/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5fe',
          300: '#a4b9fd',
          400: '#7f93fa',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          700: '#334155',
          800: '#1e293b',
          850: '#131c2e',
          900: '#0f172a',
          950: '#070d1a',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'confetti-fall': 'confetti-fall 2s ease-in forwards',
        'bin-flash': 'bin-flash 0.6s ease-out forwards',
        'ball-drop': 'ball-drop 0.3s ease-in',
        'tilt-left': 'tilt-left 0.3s ease-out forwards',
        'tilt-right': 'tilt-right 0.3s ease-out forwards',
        'shake': 'shake 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.9)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100px) rotate(720deg)', opacity: '0' },
        },
        'bin-flash': {
          '0%': { backgroundColor: 'rgba(99, 102, 241, 0)' },
          '30%': { backgroundColor: 'rgba(99, 102, 241, 0.8)' },
          '100%': { backgroundColor: 'rgba(99, 102, 241, 0.1)' },
        },
        'ball-drop': {
          '0%': { transform: 'scaleY(0.8)', opacity: '0' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        'tilt-left': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-5deg)' },
        },
        'tilt-right': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(5deg)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234338ca' fill-opacity='0.05'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
