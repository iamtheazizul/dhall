/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary
          green:  '#006A52',
          yellow: '#FFD100',

          // Secondary
          'green-light': '#33C572',
          'green-dark':  '#22372B',

          // Neutrals
          'grey-light': '#F0F3F5',
          'grey-mid':   '#DBE2E9',
          white:        '#FFFFFF',
        }
      }
    }
  },
  plugins: [],
}