/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2321',
        parchment: '#FAF8F2',
        sage: {
          50: '#F3F6F2',
          100: '#E3EAE1',
          200: '#C9D8C4',
          300: '#A8C09F',
        },
        green: {
          DEFAULT: '#1F5C4A',
          deep: '#153F33',
          mid: '#3E8E6E',
          light: '#E9F1EC',
        },
        gold: {
          DEFAULT: '#B8862E',
          light: '#F3E7CF',
        },
        clay: '#8C4A3A',
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
