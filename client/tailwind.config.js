/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        amber: {
          400: '#ffb000',
          500: '#ffb000',
          600: '#e09a00',
          700: '#b07800',
        },
        terminal: {
          green: '#33ff33',
          red: '#ff3333',
          blue: '#33aaff',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scan 8s linear infinite',
        flicker: 'flicker 0.15s infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 4px #ffb000, 0 0 8px #ffb000' },
          '100%': { textShadow: '0 0 8px #ffb000, 0 0 20px #ffb000, 0 0 30px #e09a00' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      },
      boxShadow: {
        'neon-amber': '0 0 5px #ffb000, 0 0 10px #ffb000',
        'neon-green': '0 0 5px #33ff33, 0 0 10px #33ff33',
      },
    },
  },
  plugins: [],
}
