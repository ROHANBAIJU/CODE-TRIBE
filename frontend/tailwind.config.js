/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nasa-blue': '#0B3D91',
        'spacex-orange': '#FC3D21',
        'terminal-green': '#00FF41',
        'space-dark': '#0a0e1a',
        'panel-dark': '#141b2d',
        'border-glow': '#2196F3',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #2196F3, 0 0 10px #2196F3' },
          '50%': { boxShadow: '0 0 10px #2196F3, 0 0 20px #2196F3, 0 0 30px #2196F3' },
        },
      },
    },
  },
  plugins: [],
}
