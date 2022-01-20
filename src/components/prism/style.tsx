import styled from 'styled-components';
import Theme from '../../theme/theme';

const { colors, fonts, fontSizes } = Theme;

export const StyledPre = styled.pre`
  code[class*='language-'],
  pre[class*='language-'] {
    color: ${colors.white};
    background: none;
    /* text-shadow: 0 1px white; */
    font-family: ${fonts.code};
    font-size: ${fontSizes[1]};
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: ${colors.darkGrey};
  }

  @media print {
    code[class*='language-'],
    pre[class*='language-'] {
      text-shadow: none;
    }
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  :not(pre) > code[class*='language-'],
  pre[class*='language-'] {
    background: ${colors.black};
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
    white-space: normal;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: ${colors.grey};
  }

  .token.punctuation {
    color: ${colors.white};
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.boolean,
  .token.number {
    color: ${colors.pink};
  }

  .token.keyword,
  .token.constant {
    color: ${colors.blue};
  }

  .token.function,
  .token.inserted,
  .token.property,
  .token.tag,
  .token.symbol {
    color: ${colors.green};
  }

  .token.function-definition.function > keyword,
  .token.deleted,
  .token.operator {
    color: ${colors.red};
  }

  .token.regex,
  .token.placeholder,
  .token.important,
  .token.variable,
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: ${colors.yellow};
  }

  .token.lifetime-annotation.symbol,
  .token.atrule,
  .token.attr-value,
  .token.type-definition.class-name,
  .token.class-name {
    color: ${colors.deepBlue};
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  /* Rust overrides */
  .language-rust closure-punctuation punctuation {
    color: ${colors.red};
  }

  .language-rust .token.arrow,
  .language-rust .token.punctop {
    color: ${colors.red};
  }
`;