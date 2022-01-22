// https://styled-system.com/theme-specification/

export default {
  colors: {
    white: 'rgb(187,187,187)', // #BBBBBB
    darkest: 'rgb(29,33,38)', // #1D2126
    darkBlack: 'rgb(33,37,43)', // #21252B
    black: 'rgb(40,44,52)', // #282C34
    darkGrey: 'rgb(73,81,98)', // #495162
    brown: 'rgb(77,77,77)', // #4D4D4D
    grey: 'rgb(103,111,125)', // #676F7D
    lightGrey: 'rgb(128,132,145)', // #808491
    blue: 'rgb(86,182,194)', // #56B6C2
    deepBlue: 'rgb(97,175,239)', // #61AFEF
    green: 'rgb(152,195,121)', // #98C379
    yellow: 'rgb(229,192,123)', // #E5C07B
    orange: 'rgb(203,150,99)', // #CB9663
    pink: 'rgb(198,120,221)', // #C678DD
    red: 'rgb(224,108,117)', // #E06C75
    transparent: 'rgba(0,0,0,0)',
  },

  fonts: {
    sans: `Overpass, sans-serif`,
    code: `JetBrainsMono-Regular, monospace`,
  },

  /* https://type-scale.com/
    1.200 Minor Third Type Scale */
  fontSizes: [
    '0.579rem',
    '0.694rem',
    '0.833rem',
    '1rem', // 3
    '1.2rem',
    '1.44rem',
    '1.728rem',
    '2.074rem',
    '2.488rem',
    '2.986rem',
    '3.583rem',
    '4.3rem',
    '5.16rem',
  ],

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeights: {
    none: 1,
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  breakpoints: ['40em', '52em', '64em'],

  sizes: {
    none: 'none',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    full: '100%',
  },

  spaces: [
    '0',
    '0.25rem',
    '0.5rem',
    '0.75rem',
    '1rem',
    '1.25rem',
    '1.5rem',
    '2rem',
    '2.5rem',
    '3rem',
    '4rem',
    '5rem',
    '6rem',
    '8rem',
  ],
};
