/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/pages/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
      serif: ["Merriweather", "serif"],
      display: ["Righteous", "sans-serif"],
      // bar: ['"Helvetica Neue"', '"Helvetica"', '"Arial"', 'sans-serif'], //'"SF Pro Text"','"Myriad Set Pro"','"SF Pro Icons"',
      bar: [
        "system-ui",
        "-apple-system",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        '"Noto Sans"',
        '"Liberation Sans"',
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
    },
    extend: {
      backgroundImage: {
        colosseum: "url('./src/assets/images/colosseum.jpg')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        rotate: {
          "100%": {
            transform: "rotate(1turn)",
          },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        pulsateSize: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        pulsateColor: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        rotate: "rotate 1s linear infinite",
        "spin-reverse": "spin 1s linear infinite reverse",
        wiggle: "wiggle .5s ease-in-out infinite",
        "pulsate-size": "pulsateSize 1s ease-in-out infinite",
        "pulsate-color": "pulsateColor 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
