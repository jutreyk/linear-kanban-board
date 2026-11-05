/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        linear: {
          bg: '#08090a',          // Linear signature deep dark
          card: '#0f1011',        // Charcoal card panel
          subtle: '#141516',
          border: '#222326',      // Hairline subtle borders
          borderHover: '#333538',
          text: '#f7f8f8',
          muted: '#8a8f98',
          purple: '#5e6ad2',      // Signature lavender-blue accent
          purpleHover: '#4e5ac0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
