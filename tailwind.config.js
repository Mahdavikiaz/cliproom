/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F1EA',
        ink: '#171717',
        violet: { DEFAULT: '#6D5DB8', dark: '#54469A' },
        acid: '#D7F36A',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        hard: '4px 4px 0 0 #171717',
        'hard-sm': '2px 2px 0 0 #171717',
      },
    },
  },
  plugins: [],
};
