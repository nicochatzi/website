import Theme from './theme';
import { createGlobalStyle } from 'styled-components';

const {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  sizes,
  spaces,
} = Theme;

export const GlobalStyle = createGlobalStyle`

@font-face {
  font-family: "JetBrainsMono";
  src: url("/fonts/JetBrainsMono/JetBrainsMono-Regular.woff2");
}

:root {
  --color-primary: ${colors.blue};
  --color-text: ${colors.white};
  --color-text-light: ${colors.yellow};
  --color-heading: ${colors.red};
  --color-heading-black: ${colors.red};
  --color-accent: ${colors.black};

  --fontSize-root: 16px;
}

/* HTML elements */

*,
:after,
:before {
  box-sizing: border-box;
}

html {
  line-height: ${lineHeights.normal};
  font-size: var(--fontSize-root);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: ${fonts.body};
  font-size: ${fontSizes[1]};
  color: var(--color-text);
  background-color: ${colors.black};
}

footer {
  padding: ${spaces[6]} ${spaces[0]};
}

hr {
  background: var(--color-accent);
  height: 1px;
  border: 0;
}

/* Heading */

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: ${fonts.head};
  margin-top: ${spaces[9]};
  margin-bottom: ${spaces[6]};
  line-height: ${lineHeights.tight};
  letter-spacing: -0.025em;
}

h2,
h3,
h4,
h5,
h6 {
  font-weight: ${fontWeights.bold};
  color: var(--color-heading);
}

h1 {
  font-weight: ${fontWeights.black};
  font-size: ${fontSizes[6]};
  color: var(--color-heading-black);
}

h2 {
  font-size: ${fontSizes[5]};
}

h3 {
  font-size: ${fontSizes[4]};
}

h4 {
  font-size: ${fontSizes[3]};
}

h5 {
  font-size: ${fontSizes[2]};
}

h6 {
  font-size: ${fontSizes[1]};
}

h1 > a {
  color: inherit;
  text-decoration: none;
}

h2 > a,
h3 > a,
h4 > a,
h5 > a,
h6 > a {
  text-decoration: none;
  color: inherit;
}

/* Prose */

p {
  line-height: ${lineHeights.relaxed};
  --baseline-multiplier: 0.179;
  --x-height-multiplier: 0.35;
  margin: ${spaces[0]} ${spaces[0]} ${spaces[7]} ${spaces[0]};
  padding: ${spaces[0]};
}

ul,
ol {
  margin-left: ${spaces[0]};
  margin-right: ${spaces[0]};
  padding: ${spaces[0]};
  margin-bottom: ${spaces[7]};
  list-style-position: outside;
  list-style-image: none;
}

ul li,
ol li {
  padding-left: ${spaces[0]};
  margin-bottom: calc(${spaces[7]} / 2);
}

li > p {
  margin-bottom: calc(${spaces[7]} / 2);
}

li *:last-child {
  margin-bottom: ${spaces[0]};
}

li > ul {
  margin-left: ${spaces[7]};
  margin-top: calc(${spaces[7]} / 2);
}

blockquote {
  color: var(--color-text-light);
  margin-left: calc(-1 * ${spaces[6]});
  margin-right: ${spaces[7]};
  padding: ${spaces[0]} ${spaces[0]} ${spaces[0]} ${spaces[6]};
  border-left: ${spaces[1]} solid var(--color-primary);
  font-size: ${fontSizes[2]};
  font-style: italic;
  margin-bottom: ${spaces[7]};
}

blockquote > :last-child {
  margin-bottom: ${spaces[0]};
}

blockquote > ul,
blockquote > ol {
  list-style-position: inside;
}

table {
  width: 100%;
  margin-bottom: ${spaces[7]};
  border-collapse: collapse;
  border-spacing: 0.25rem;
}

table thead tr th {
  border-bottom: 1px solid var(--color-accent);
}

/* Link */

a {
  color: var(--color-primary);
}

a:hover,
a:focus {
  text-decoration: none;
}

/* Custom classes */

.global-wrapper {
  margin: ${spaces[0]} auto;
  max-width: ${sizes['2xl']};
  padding: ${spaces[8]} ${spaces[5]};
}

.global-wrapper[data-is-root-path="true"] .bio {
  margin-bottom: ${spaces[11]};
}

.global-header {
  margin-bottom: ${spaces[9]};
}

.main-heading {
  font-size: ${fontSizes[7]};
  margin: 0;
}

.post-list-item {
  margin-bottom: ${spaces[7]};
  margin-top: ${spaces[7]};
}

.post-list-item p {
  margin-bottom: ${spaces[0]};
}

.post-list-item h2 {
  font-size: ${fontSizes[4]};
  color: var(--color-text-light);
  margin-bottom: ${spaces[2]};
  margin-top: ${spaces[0]};
}

.post-list-item header {
  margin-bottom: ${spaces[4]};
}

.header-link-home {
  font-weight: ${fontWeights.bold};
  font-family: ${fonts.head};
  text-decoration: none;
  font-size: ${fontSizes[2]};
}

.bio {
  display: flex;
  margin-bottom: ${spaces[10]};
}

.bio p {
  margin-bottom: ${spaces[0]};
}

.bio-avatar {
  margin-right: ${spaces[4]};
  margin-bottom: ${spaces[0]};
  min-width: 50px;
  border-radius: 100%;
}

.blog-post header h1 {
  margin: ${spaces[0]} ${spaces[0]} ${spaces[4]} ${spaces[0]};
}

.blog-post header p {
  font-size: ${fontSizes[2]};
  font-family: ${fonts.head};
}

.blog-post-nav ul {
  margin: ${spaces[0]};
}

.gatsby-highlight {
  margin-bottom: ${spaces[7]};
}

/* Media queries */

@media (max-width: 42rem) {
  blockquote {
    padding: ${spaces[0]} ${spaces[0]} ${spaces[0]} ${spaces[4]};
    margin-left: ${spaces[0]};
  }
  ul,
  ol {
    list-style-position: inside;
  }
}

`;
