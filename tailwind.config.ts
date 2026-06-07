import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './features/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'neon': { 400: '#00f5d4', 500: '#00d4b7', 600: '#00b39a' },
        'purple': { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 900: '#2e1065' },
        'dark': { 800: '#0f0f1a', 900: '#080812', 950: '#04040c' }
      },
      fontFamily: {
        'display': ['var(--font-display)', 'monospace'],
        'mono': ['var(--font-mono)', 'monospace']
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'confetti-fall': 'confettiFall 1s ease-in forwards'
      },
      keyframes: {
        pulseNeon: {
          '0%,100%': { boxShadow: '0 0 5px #00f5d4, 0 0 10px #00f5d4' },
          '50%': { boxShadow: '0 0 20px #00f5d4, 0 0 40px #00f5d4, 0 0 60px #00f5d4' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        confettiFall: {
          '0%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'translateY(200px) rotate(720deg)' }
        }
      }
    }
  },
  plugins: []
}
export default config
