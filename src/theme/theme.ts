// https://styled-system.com/theme-specification/
import { monokai, github, darkTheme, lightTheme, ThemeDef } from './themes';

export default {
  colors: {
    monokai,
    github,
  },
  light: lightTheme,
  dark: darkTheme,

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

  // short-hard to use in styled components
  // to grab the current global theme value
  global: {
    background: (props: any) => props.theme.background,
    background_deep: (props: any) => props.theme.background_deep,
    background_light: (props: any) => props.theme.background_light,
    highlight: (props: any) => props.theme.highlight,
    text: (props: any) => props.theme.text,
    text_light: (props: any) => props.theme.text_light,
    primary: (props: any) => props.theme.primary,
    primary_light: (props: any) => props.theme.primary_light,
    heading: (props: any) => props.theme.heading,
    heading_light: (props: any) => props.theme.heading_light,
    sub: (props: any) => props.theme.sub,
    valid: (props: any) => props.theme.valid,
    code: {
      comment: (props: any) => props.theme.code.comment,
      literals: (props: any) => props.theme.code.literals,
      keyword: (props: any) => props.theme.code.keyword,
      class: (props: any) => props.theme.code.class,
      constant: (props: any) => props.theme.code.constant,
      operator: (props: any) => props.theme.code.operator,
      string: (props: any) => props.theme.code.string,
      braces: (props: any) => props.theme.code.braces,
    },
  },
};
