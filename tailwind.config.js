/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        parchment: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        sage: {
          50: 'rgb(var(--color-sage-50) / <alpha-value>)',
          100: 'rgb(var(--color-sage-100) / <alpha-value>)',
          200: 'rgb(var(--color-sage-200) / <alpha-value>)',
          300: 'rgb(var(--color-sage-300) / <alpha-value>)',
        },
        green: {
          DEFAULT: 'rgb(var(--color-green) / <alpha-value>)',
          deep: 'rgb(var(--color-green-deep) / <alpha-value>)',
          mid: 'rgb(var(--color-green-mid) / <alpha-value>)',
          light: 'rgb(var(--color-green-light) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          light: 'rgb(var(--color-gold-light) / <alpha-value>)',
        },
        clay: 'rgb(var(--color-clay) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Lora', 'ui-serif', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'ui-serif', 'serif'],
      },
      maxWidth: {
        prose: '42rem',
        site: '72rem',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(28,35,33,0.06), 0 1px 1px rgba(28,35,33,0.04)',
      },
    },
  },
  plugins: [],
}
