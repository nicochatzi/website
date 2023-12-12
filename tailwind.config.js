const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      purple: {
        DEFAULT: '#a280e5',
        pale: '#947fb8',
      },
      blue: {
        DEFAULT: '#7e9cd8',
        light: '#7eb4c9'
      },
      red: {
        DEFAULT: '#ff5d62',
        pale: '#d27e9a'
      },
      yellow: ' #e6c384',
      orange: {
        DEFAULT: '#de935f',
        pale: '#cda46c',
      },
      cyan: '#7eb4c9',
      teal: {
        DEFAULT: '#66ffdd',
        deep: '#40a592',
      },
      green: '#5faf94',
      offwhite: '#dcd7ba',
      gray: {
        '50': '#f3f4f6',
        '100': '#ece7ea',
        '200': '#dcd7ba',
        '300': '#9ca3af',
        '400': '#657b83',
        '500': '#666666',
        '600': '#54546d',
        '700': '#404040',
        '800': '#3d3d3d',
        '900': '#282c34',
        '950': '#0c0c0c',
      },
    },
    extend: {
      fontFamily: {
        sans: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
