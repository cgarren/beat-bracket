/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      display: ['Righteous', 'sans-serif'],
      //bar: ['"Helvetica Neue"', '"Helvetica"', '"Arial"', 'sans-serif'], //'"SF Pro Text"','"Myriad Set Pro"','"SF Pro Icons"',
      bar: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', '"Liberation Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"']
    },
    extend: {
      backgroundImage: {
        'colosseum': "url('./src/assets/images/colosseum.jpg')"
      },
      keyframes: {
        steam: {
          '0%': {
            backgroundPosition: '0 0,100% 0,100% 100%,0 100%'
          },
          '50%': {
            backgroundPosition: '100% 100%,100% 0,0 0,0 100%'
          },
          '100%': {
            backgroundPosition: '0 0,100% 0,100% 100%,0 100%'
          },
        }
      },
      animation: {
      }
    },
  },
  plugins: [],
}
