/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d12',
        surface: {
          DEFAULT: '#0f1621',
          hover: '#152030',
          active: '#1a273b',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        cyber: {
          green: '#00ff88',
          'green-dim': 'rgba(0, 255, 136, 0.15)',
          emerald: '#10b981',
          cyan: '#06b6d4',
          purple: '#a855f7',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(0, 255, 136, 0.25)',
        'neon-strong': '0 0 30px -2px rgba(0, 255, 136, 0.45)',
        'cyber-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(0, 255, 136, 0.07) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
