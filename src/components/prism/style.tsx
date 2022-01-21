import styled from 'styled-components';
import Theme from '../../theme';

const { colors, fonts, fontSizes } = Theme;

export default styled.pre`
  font-family: ${fonts.code};
  background-color: ${colors.darkBlack};
  border-radius: 1rem;
  border-width: 10rem;
  font-size: ${fontSizes[3]};
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  padding: 1.5em;
  margin: 1.25em 0;
  overflow: auto;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;

  @media print {
    text-shadow: none;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: ${colors.grey};
  }

  .token.boolean,
  .token.number {
    color: ${colors.pink};
  }

  .token.keyword {
    color: ${colors.blue};
  }

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
  .token.primitives,
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
  .token.closure-punctuation.punctuation {
    color: ${colors.red};
  }

  .token.literals {
    color: ${colors.blue};
  }
  .token.braces {
    color: ${colors.white};
  }

  .token.punctuation,
  .token.braces,
  .token.namespace.punctuation {
    color: ${colors.lightGrey};
  }

  .token.module-declaration,
  .token.decl-keyword {
    color: ${colors.red};
  }
`;
