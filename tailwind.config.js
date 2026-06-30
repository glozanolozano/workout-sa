/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#000000',
        fg: '#F5F5F0',
        muted: '#8A8A80',
        line: '#1A1A18',
        'line-strong': '#2A2A26',
        sage: '#A8B89A',
        amber: '#B89A6E',
        rust: '#A87A7A',
      },
      fontVariantNumeric: {
        'tabular-nums': 'tabular-nums',
      },
    },
  },
  plugins: [],
}
