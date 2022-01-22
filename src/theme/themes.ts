import { localStorage } from '../utils/store';

const currentThemeStorageKey = 'current-theme';

export const getCurrentTheme = (): ThemeDef =>
  localStorage.get(currentThemeStorageKey) as ThemeDef;

export const setCurrentTheme = (theme: ThemeDef) =>
  localStorage.set(currentThemeStorageKey, theme);

export const isDarkThemeLoaded = (): boolean =>
  getCurrentTheme()?.background === darkTheme.background;

export interface ThemeDef {
  background: string;
  background_deep: string;
  background_light: string;
  highlight: string;
  text: string;
  text_light: string;
  primary: string;
  primary_light: string;
  heading: string;
  heading_light: string;
  sub: string;
  valid: string;
}

export const monokai = {
  white: 'rgb(187,187,187)', // #BBBBBB
  darkBlack: 'rgb(33,37,43)', // #21252B
  black: 'rgb(40,44,52)', // #282C34
  brown: 'rgb(77,77,77)', // #4D4D4D
  grey: 'rgb(103,111,125)', // #676F7D
  blue: 'rgb(86,182,194)', // #56B6C2
  deepBlue: 'rgb(97,175,239)', // #61AFEF
  green: 'rgb(152,195,121)', // #98C379
  yellow: 'rgb(229,192,123)', // #E5C07B
  orange: 'rgb(203,150,99)', // #CB9663
  pink: 'rgb(198,120,221)', // #C678DD
  red: 'rgb(224,108,117)', // #E06C75
};

export const darkTheme: ThemeDef = {
  background: monokai.black,
  background_deep: monokai.darkBlack,
  background_light: monokai.grey,
  highlight: monokai.brown,
  text: monokai.white,
  text_light: monokai.yellow,
  primary: monokai.deepBlue,
  primary_light: monokai.blue,
  heading: monokai.red,
  heading_light: monokai.pink,
  sub: monokai.orange,
  valid: monokai.green,
};

export const github = {
  fullWhite: 'rgb(255,255,255)', //#FFFFFF
  offWhite: 'rgb(252,248,247)', // #FCF8F7
  softWhite: 'rgb(203,203,185)', //#CBCBB9
  grey: 'rgb(106,115,125)', // #6A737D
  deepBlue: 'rgb(75,146,164)', // #4B92A4
  blue: 'rgb(88,183,195)', // #58B7C3
  purple: 'rgb(163,136,212)', // #A388D4
  deepPurple: 'rgb(111,66,193)', // # 6F42C1
  yellow: 'rgb(240,236,208)', // #F0ECD0
  orange: 'rgb(255,138,24)', // #FF8A18
  red: 'rgb(221,105,116)', // #DD6974
  black: 'rgb(0,0,0)', // #000000
  green: 'rgb(34,128,94)', // #22805E
};

export const lightTheme: ThemeDef = {
  background: github.offWhite,
  background_deep: github.fullWhite,
  background_light: github.softWhite,
  highlight: github.yellow,
  text: github.black,
  text_light: github.grey,
  primary: github.deepPurple,
  primary_light: github.purple,
  heading: github.deepBlue,
  heading_light: github.orange,
  sub: github.blue,
  valid: github.green,
};
